<?php

/*
* Method: GET /login
* Description: Response to user's login request, process user's Facebook profile and add it to database.
* Parameter: None
* Response:
*      - 302: User not logged in yet, redirect user to Facebook OAuth page
*      - 302: User came back from Facebook OAuth page, redirect user to Pairs Web
*/
$app->get('/login', function() use($app) {

	$facebook = getFacebook();
	$fbid = $facebook->getUser();

	if($fbid) {
		try {

			// Get basic user data using Facebook API

			$user_profile = $facebook->api('/me','GET');
			$picture_data = $facebook->api('/me/picture?redirect=false','GET');
			$fbid_real = -1;
			$photo_id = explode("_", $picture_data['data']['url'])[1];

			// User photo url of an user with a default "silhouette" picture contains no valuable information

			if(!$picture_data['data']['is_silhouette']){
				$fbid_real = getRealIdByPhoto($picture_data['data']['url']);
			}

			// Check if user already exists in database

			$sql = "SELECT * FROM `user` WHERE `fbid` = :fbid OR `fbid_real` = :fbid_real";
			try {
				$db = getDatabaseConnection();
				$stmt = $db->prepare($sql);
				$stmt->execute(
					array(
						":fbid" => $fbid,
						":fbid_real" => $fbid_real
					)
				);
				$user_record = $stmt->fetch(PDO::FETCH_ASSOC);
				if(empty($user_record)){

					// Brand new user

					// TODO: do the same thing with other type of login user
					$profile_real = json_decode(@file_get_contents("http://graph.facebook.com/".$fbid_real),1);

					$sql = "INSERT INTO `user` (`fbid`, `fbid_real`, `name`, `gender`, `email`, `username`, `locale`, `photo_id`, `ctime`) VALUES (:fbid, :fbid_real, :name, :gender, :email, :username, :locale, :photo_id, NOW())";
					$stmt = $db->prepare($sql);
					$stmt->execute(
						array(
							":fbid" => $fbid,
							":fbid_real" => $fbid_real,
							":name" => $user_profile['name'],
							// Gender can be empty, set gender to -1 if not set in user profile
							":gender" => isset($user_profile['gender']) ? genderStringToCode($user_profile['gender']) : -1,
							":email" => isset($user_profile['email']) ? $user_profile['email'] : '',
							":username" => isset($user_profile['username']) ? $user_profile['username']: '',
							":locale" => $user_profile['locale'],
							":photo_id" => !$picture_data['data']['is_silhouette'] ? $photo_id : ''
						)
					);

					// Fetch user friends, and add it into user_pool

					fetchFriends();

					// Redirect user back to where user comes from

					$app->redirect($_SESSION['referer']);

					echo json_encode(
						array(
							"status" => 1,
							"result" => "ok",
							"message" => "User successfully registered!"
						)
					);

				}else{

					// User already exists in database

					if($user_record['fbid'] == $fbid && $user_record['fbid_real'] == $fbid_real){

						$sql = "UPDATE `user` SET";
						$sql_params = array();
						if(isset($user_profile['email']) && $user_record['email'] != $user_profile['email']){

							// User email did not exist in database or email updated, add latest email to database

							$sql .= empty($sql_params) ? '' : ',';
							$sql .= " `email` = :email";
							$sql_params[':email'] = $user_profile['email'];
						}
						if(isset($user_profile['username']) && $user_record['username'] != $user_profile['username']){

							// Username did not exist in database, add latest username to database

							$sql .= empty($sql_params) ? '' : ',';
							$sql .= " `username` = :username";
							$sql_params[':username'] = $user_profile['username'];
						}
						if($user_record['locale'] != $user_profile['locale']){

							// User locale updated, add latest locale

							$sql .= empty($sql_params) ? '' : ',';
							$sql .= " `locale` = :locale";
							$sql_params[':locale'] = $user_profile['locale'];
						}
						if($user_record['photo_id'] != $photo_id){

							// User profile picture updated

							$sql .= empty($sql_params) ? '' : ',';
							$sql .= " `photo_id` = :photo_id";
							$sql_params[':photo_id'] = $photo_id;
						}

						if(!empty($sql_params)){
							$sql .= " WHERE `fbid` = :fbid";
							$sql_params[':fbid'] = $fbid;
							$stmt = $db->prepare($sql);
							$stmt->execute($sql_params);
						}

						// Redirect user back to where user comes from

						$app->redirect($_SESSION['referer']);

						// Returning user, with good IDs, do nothing

						echo json_encode(
							array(
								"status" => 1,
								"result" => "ok",
								"message" => "Welcome returning user!"
							)
						);

					}else if ($user_record['fbid'] == 0 && $user_record['fbid_real'] == $fbid_real && $fbid_real != 0){

						// Touched only user, first time login

						$sql = "UPDATE `user` SET `fbid` = :fbid, `email` = :email, `username` = :username, `gender` = :gender, `locale` = :locale, `photo_id` = :photo_id WHERE `fbid_real` = :fbid_real";
						$stmt = $db->prepare($sql);
						$stmt->execute(
							array(
								":fbid" => $fbid,
								":fbid_real" => $fbid_real,
								":email" => isset($user_profile['email']) ? $user_profile['email'] : '',
								":username" => isset($user_profile['username']) ? $user_profile['username'] : '',
								":gender" => isset($user_profile['gender']) ? genderStringToCode($user_profile['gender']) : -1,
								":locale" => $user_profile['locale'],
								":photo_id" => !$picture_data['data']['is_silhouette'] ? $photo_id : ''
							)
						);

						// Fetch user friends, and add it into user_pool

						fetchFriends();

						// Redirect user back to where user comes from

						$app->redirect($_SESSION['referer']);

						echo json_encode(
							array(
								"status" => 1,
								"result" => "ok",
								"message" => "Welcome touched user!"
							)
						);

					}else if ($user_record['fbid'] == $fbid && $user_record['fbid_real'] != $fbid_real){

						// TODO: Update user basic info
						// Returning user, profile picture changed since last login, or still using "silhouette" or with strict privacy settings

						if($fbid_real == -1){

							// Failed to determine real ID by current photo, user may be using "silhouette"
							// FIXME: grab an random empty image for this case (any facebook default image?)

						}else if($fbid_real == 0){

							// User profile picture might have strict privacy settings
							// FIXME: grab an random empty image for this case (any facebook default image?)

						}else{

							// User uses "silhouette" or have strict privacy settings prviously, now with public picture

							// Update fbid_real in database

							$sql = "UPDATE `user` SET `fbid_real` = :fbid_real WHERE `fbid` = :fbid";
							$stmt = $db->prepare($sql);
							$stmt->execute(
								array(
									":fbid_real" => $fbid_real,
									":fbid" => $fbid
								)
							);

							$app->redirect($_SESSION['referer']);

							echo json_encode(
								array(
									"status" => 1,
									"result" => "ok",
									"message" => "Welcome returning user with new photo!"
								)
							);
						}
					}
				}
			} catch(PDOException $e) {
				$message = json_encode(
					array(
						"status" => -1,
						"result" => "error",
						"message" => $e->getMessage()
					)
				);
				$app->halt(500, $message);
			}

		// Print out $user_profile for development purpose
		//				echo json_encode($user_profile);

		} catch(FacebookApiException $e) {
			$message = json_encode(
				array(
					"status" => -1,
					"result" => "error",
					"message" => $e->getMessage()
				)
			);
			$app->halt(500, $message);
		}

	}else{

		if(!isset($_GET['error']) && $app->request->getReferer() != null){

			// Store referer in SESSION, used in when redirecting user back

			$_SESSION['referer'] = $app->request->getReferer();

		}else if($app->request->getReferer() == null){

			// User tried to visit /login directly, set URL to redirect back to default

			$_SESSION['referer'] = 'http://pairs.cc/';

		}else{

			// User may be coming back from Facebook OAuth, but denined access
			// Redirect back to where user came from

			$app->redirect($_SESSION['referer']);

		}

		$login_params = array(
			'scope' => 'user_friends, email'
		);

		$app->redirect($facebook->getLoginUrl($login_params));

	}
});

/*
* Method: GET /login_status
* Description: Check if user is logged in, and provide basic info of logged in user, used to assist frontend behaviour
* Parameter: None
* Response:
*      - 200: success
*/

$app->get('/login_status', function() {
	$facebook = getFacebook();
	$fbid = $facebook->getUser();
	if($fbid){
		$user_profile = $facebook->api('/me','GET');
		// Logged in
		echo json_encode(
			array(
				"status" => 1,
				"result" => "ok",
				"message" => "Logged in",
				"data" => array(
					"uid" => getUid($fbid, 0),
					"name" => $user_profile['name']
				)
			)
		);
	}else{
		// Not logged in yet
		echo json_encode(
			array(
				"status" => 0,
				"result" => "ok",
				"message" => "Not logged in"
			)
		);
	}
});

/*
* Method: GET /logout
* Description: Clear user session, logs user out
* Parameter: None
* Response:
*      - 200: success
*/
$app->get('/logout', function() {
	session_start();
	session_destroy();
	echo json_encode(
		array(
			"status" => 0,
			"result" => "ok",
			"message" => "Successfully logged out!"
		)
	);
});

?>
