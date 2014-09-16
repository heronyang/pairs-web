<?php

function getFacebook(){
	$facebook = new Facebook(array('appId' => FB_APPID, 'secret' => FB_SECRET));
	return $facebook;
}

function getDatabaseConnection() {
	$dbh = new PDO(
	"mysql:host=". DBHOST. ";dbname=". DBNAME. ";charset=utf8", DBUSER, DBPASS,
		array(
			PDO::MYSQL_ATTR_INIT_COMMAND => 'SET time_zone = \'+00:00\''
		)
	);
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $dbh;
}

function genderStringToCode($string){
	switch($string){
		case "male":
			return 0;
		case "female":
			return 1;
		default:
			return -1;
	}
}

function getRealIdByPhoto($photo_input){

	/*

	It is possible to determine the real Facebook user ID of the owner of a photo with direct fbcdn link.

	Take the default Facebook profile picture for example
	https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfp1/t1.0-1/c15.0.50.50/p50x50/954801_10150002137498316_604636659114323291_n.jpg

	If we split the filename of the picture using "_", the second number would be the ID to that photo, which is '10150002137498316' in this case.
	By accessing https://www.facebook.com/$PHOTOID, we will be redirected to the page that shows the photo, which contains some info about the photo.

	In this case, we will be redirected to the following URL.
	https://www.facebook.com/photo.php?fbid=10150002137498316&set=a.1001968110775.1364293.499829591&type=1

	The interesting thing is that if we split the get parameter "set" using ".", the third number would be the real user ID of the owner of the photo.

	*/

	// Check if input is URL or photo ID

	if(strrpos($photo_input, "_") != false){
		$photo_data = explode("_", $photo_input);
		$photo_id = $photo_data[1];
	}else{
		$photo_id = $photo_input;
	}

	try{
		$db = getDatabaseConnection();
		$sql = "SELECT `fbid_real` FROM `user` WHERE `photo_id` = :photo_id AND NOT `fbid_real` = 0";
		$stmt = $db->prepare($sql);
		$stmt->execute(
			array(
				":photo_id" => $photo_id
			)
		);
		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		if(!empty($result) && $result['fbid_real'] != 0){
			return $result['fbid_real'];
		}
	} catch(PDOException $e) {
		$app = \Slim\Slim::getInstance();
		$message = json_encode(
			array(
				"result" => "error",
				"message" => $e->getMessage()
			)
		);
		$app->halt(500, $message);
	}

	// With the "follow_location" set to be false, we'll be able to get the redirection target of requested url by reading the "Location: " HTTP header.

	$context = stream_context_create(
		array(
			'http' => array(
				'follow_location' => false
			)
		)
	);

	$html = file_get_contents('https://www.facebook.com/'.$photo_id, false, $context);

	// If the provided ID represents a photo which is not public, redirection target would be an error page, so we'll only parse the redirection target if it contains "photo.php", which indicates it's a valid url to a photo.

	if (strpos($http_response_header['1'],'photo.php') !== false) {
		$tmp = explode('.', $http_response_header['1']);
		return explode('&', $tmp[6])[0];
	}else{
		// Returns 0 if could not find real ID
		return 0;
	}
}

function getUid($fbid, $isReal){

	// We use a custom ID in database to deal with relations between two users, this function is used to convert Facebook ID into our ID

	// Real ID provided by frontend may be the mysterious FQL id, or an invalid id

	$photo_id = 0;
	$picture_data = array();

	if($isReal){

		$profile_headers = get_headers("http://graph.facebook.com/v1.0/".$fbid);
		if($profile_headers[0] == "HTTP/1.1 400 Bad Request"){

			// This $fbid may be provided by the mysterious FQL

			$picture_headers = get_headers("http://graph.facebook.com/v1.0/".$fbid."/picture?redirect=false");
			if($picture_headers[0] == "HTTP/1.1 400 Bad Request"){

				// Too bad, an invalid ID is provided
				// TODO: Show error message, QQ

				return 0;

				// FIXME: we should write into our log file on Heroku!
				// so that we can know "where" is the error for 500 things faster while testing/debugging
				// let's setup monolog (https://devcenter.heroku.com/articles/getting-started-with-php#basic-logging)
				// ex. $logger = $this->get('logger');
				//     $logger->info('I just got the logger');
				//     $logger->error('An error occurred');

			}else{

				// Update ID provided by FQL to real ID
				$picture_data = json_decode(file_get_contents("http://graph.facebook.com/v1.0/".$fbid."/picture?redirect=false"), 1);
				$photo_id = explode("_", $picture_data['data']['url'])[1];
				$fbid = getRealIdByPhoto($picture_data['data']['url']);

				if($fbid == 0){

					// User requested's profile picture is not public
					// TODO: Show error message, QQ
					// FIXME: same, please apply logger for errors

				}

			}
		}else{

			$picture_data = json_decode(file_get_contents("http://graph.facebook.com/v1.0/".$fbid."/picture?redirect=false"), 1);
			$photo_id = explode("_", $picture_data['data']['url'])[1];

		}

	}

	$selection = array("fbid", "fbid_real");
	$sql = "SELECT `uid` FROM `user` WHERE `". $selection[$isReal]."` = :fbid";
	try{
		$db = getDatabaseConnection();
		$stmt = $db->prepare($sql);
		$stmt->execute(
			array(
				":fbid" => $fbid
			)
		);

		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if(!empty($result)){

			// Existing user in database

			return $result['uid'];

		}else{

		// New touched user, add to database

			if($isReal){

				$sql = "INSERT INTO `user` (`fbid`, `fbid_real`, `name`, `gender`, `email`, `username`, `locale`, `photo_id`) VALUES (0, :fbid_real, :name, :gender, :email, :username, :locale, :photo_id)";
				$stmt = $db->prepare($sql);

				// Get user profile from Facebook API 1.0 by real ID manually, works until April 30, 2015
				// The second parameter of json_encode is to make $user_profile an associative array instead of object

				$user_profile = json_decode(file_get_contents('http://graph.facebook.com/v1.0/'.$fbid), 1);
				$stmt->execute(
					array(
						":fbid_real" => $fbid,
						":name" => $user_profile['name'],
						// Gender can be empty, set gender to -1 if not set in user profile
						":gender" => isset($user_profile['gender']) ? genderStringToCode($user_profile['gender']) : -1,
						":email" => isset($user_profile['email']) ? $user_profile['email'] : '',
						":username" => isset($user_profile['username']) ? $user_profile['username'] : '',
						":locale" => $user_profile['locale'],
						":photo_id" => !$picture_data['data']['is_silhouette'] ? $photo_id : ''
					)
				);

				// The uid to the user just added is returned

				return $db->lastInsertId();

			}else{

				// Invalid App Scoped ID is provided

				return 0;

			}
		}
	} catch(PDOException $e) {

		// To send HTTP headers properly, using $app->halt provided by Slim Framework is a better way
		// Due to the limitation of scope, we'll have to get the Slim instance before we have access to $app
		// http://stackoverflow.com/a/19089662

		$app = \Slim\Slim::getInstance();
		$message = json_encode(
			array(
				"result" => "error",
				"message" => $e->getMessage()
			)
		);
		$app->halt(500, $message);
	}
}

function fetchFriends(){
	$facebook = getFacebook();
	$fbid = $facebook->getUser();
	if($fbid){
		try{
			try{
				$refer = getUid($fbid, 0);
				$taggable_friends = $facebook->api('/me/taggable_friends?fields=name,picture.width(200),picture.height(200)','GET');
				$db = getDatabaseConnection();

				// Although this procedure is only performed once when user first login, it may be possible that we want to update the list at a frequent, while some of the friends may need data update, some may be new friend, so we use the ON DUPLICATE KEY UPDATE here

				$sql = "INSERT INTO `user_pool` (`photo_id`, `refer_uid`, `fbid_real`, `name`, `photo_url`, `is_silhouette`, `tag_id`, `ctime`) VALUES (:photo_id, :refer_uid, 0, :name, :photo_url, 0, :tag_id, NOW()) ON DUPLICATE KEY UPDATE `name` = :name, `photo_url` = :photo_url, `tag_id` = :tag_id";
				$stmt = $db->prepare($sql);

				foreach($taggable_friends['data'] as $friend_obj){
					if($friend_obj['picture']['data']['is_silhouette'] == false){
						$photo_id = explode('_', $friend_obj['picture']['data']['url'])[1];
						$stmt->execute(
							array(
								":photo_id" => $photo_id,
								":refer_uid" => $refer,
								":name" => $friend_obj['name'],
								":photo_url" => $friend_obj['picture']['data']['url'],
								":tag_id" => $friend_obj['id']
							)
						);
					}
				}

			} catch(PDOException $e) {
				$app = \Slim\Slim::getInstance();
				$message = json_encode(
				array(
					"result" => "error",
					"message" => $e->getMessage()
					)
				);
				$app->halt(500, $message);
			}
		} catch(FacebookApiException $e) {
			$app = \Slim\Slim::getInstance();
			$message = json_encode(
			array(
				"result" => "error",
				"message" => $e->getMessage()
				)
			);
			$app->halt(500, $message);
		}
	}else{
		$app = \Slim\Slim::getInstance();
		$message = json_encode(
			array(
				"status" => 0,
				"result" => "error",
				"message" => "Login required!"
			)
		);
		$app->halt(401, $message);
	}
}

?>
