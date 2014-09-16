<?php

// FIXME: make sure we are using the same vocabulary:
// users 'VOTE' for the pairs (remove 'SUPPORT', 'PROMOTE', etc when next time you see them)

// NOTICE: we are writing RESTful API, so that the having a clear and concrete INPUT/OUTPUT definition is important

// define('DEBUG_MODE', True);
define('LIST_LIMIT', 20);

$local_config_filename = 'local_config.php';
if(file_exists($local_config_filename)) {
    // apply local configurations in local_config.php
    include $local_config_filename;
} else {
    // DEBUG_MODE is determined by environmental variables

    //define('DEBUG_MODE', getenv("DEBUG_MODE"));

    // Get database credentials provided by Heroku, which is stored in environmental variables
    // https://gist.github.com/kogcyc/7879293

    $dburl=parse_url(getenv("CLEARDB_DATABASE_URL"));

    // DB
    define('DBHOST', $dburl["host"]);
    define('DBUSER', $dburl["user"]);
    define('DBPASS', $dburl["pass"]);
    define('DBNAME', substr($dburl["path"],1));

    // FB App
    define('FB_APPID', getenv('FB_APPID'));
    define('FB_SECRET', getenv('FB_SECRET'));

    // This is usually set to 0 at Heroku ENV vars
    define('DEBUG_MODE', 0);

    // Some ratio configuration
define('PLAY_RATE_A', 1);
define('PLAY_RATE_B', 1);
define('PLAY_RATE_C', 1);
define('PLAY_RATE_D', 1);
define('PLAY_LIMIT', 30);

}

// Autoload library dependencies using Composer

require 'vendor/autoload.php';

$app = new \Slim\Slim();

// Set proper Content-Type and charset

$app->response->headers->set("Content-Type", "application/json; charset=utf-8");

if(DEBUG_MODE == 1){

	// Allow access from any origin, for development only

	$app->response->headers->set("Access-Control-Allow-Origin", $app->request->headers->get('Origin'));
}else{

	// Allow access only from our website in order to prevent XSRF and make Access-Control-Allow-Credentials work

	$app->response->headers->set("Access-Control-Allow-Origin", "http://www.pairs.cc");

}

// Allow AJAX requests access restricted resources which can only be access after logged in

$app->response->headers->set("Access-Control-Allow-Credentials", "true");

include 'functions.inc.php';
include 'login.php';
include 'play_list.php';
include 'search.php';
include 'stat.php';

/*
* Method: GET /
* Description: List all PAIRS available
* Parameter:
*				- interval (optional) :
*						0. [Default] List all PAIRS
*						1. List PAIRS updated within 1 month
*						2. List PAIRS updated within 1 week
*						3. List PAIRS updated within 1 day
*						4. List PAIRS updated within 1 hour
*				- sort:
*						0. [Default] Sort by pid ascending
*						1. Sort by vote count descending
*						2. Sort by update time descending
* Response:
*      - 200: success
*/
$app->get('/', function() use($app) {

	try{

		// List all Pairs in database

		$db = getDatabaseConnection();
		$sql = "SELECT `pid`, `uid1` as `user1`, `uid2` as `user2`, `count`, `mtime`, `ctime` FROM `pairs`";

		// Deal with some optional filter parameters

		$interval_options = array(
			'default' => '',
			1 => ' WHERE `mtime` > DATE_SUB(NOW(), INTERVAL 1 MONTH)',
			2 => ' WHERE `mtime` > DATE_SUB(NOW(), INTERVAL 1 WEEK)',
			3 => ' WHERE `mtime` > DATE_SUB(NOW(), INTERVAL 1 DAY)',
			4 => ' WHERE `mtime` > DATE_SUB(NOW(), INTERVAL 1 HOUR)'
		);
		$sort_options = array(
			'default' => ' ORDER BY `count` DESC',
			1 => ' ORDER BY `count` DESC',
			2 => ' ORDER BY `mtime` DESC'
		);

		// Check if illegal parameter is provided

		$sql .= isset($_GET['interval']) && isset($interval_options[$_GET['interval']]) ? $interval_options[$_GET['interval']] : $interval_options['default'];
		$sql .= isset($_GET['sort']) && isset($sort_options[$_GET['sort']]) ? $sort_options[$_GET['sort']] : $sort_options['default'];


		$sql .= " LIMIT 0,".LIST_LIMIT;
		$stmt = $db->prepare($sql);
		$stmt->execute();
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		$sql = "SELECT `uid`, `fbid`, `fbid_real`, `name` FROM `user` WHERE `uid` = :uid";
		$stmt = $db->prepare($sql);

		$users = array('user1', 'user2');

		// Query detailed user info of involved user

		foreach($results as $key => $row){
			foreach($users as $value){
				$stmt->execute(
					array(
						":uid" => $results[$key][$value]
					)
				);
				$results[$key][$value] = $stmt->fetch(PDO::FETCH_ASSOC);
			}
		}

		echo json_encode(
			array(
				"result" => "ok",
				"data" => $results
			)
		);
	} catch(PDOException $e) {
		$message = json_encode(
			array(
				"result" => "error",
				"message" => $e->getMessage()
			)
		);

		$app->halt(500, $message);
	}
});

/*
* Method: GET /my_votes
* Description: List all PAIRS supported by user
* Parameter: None
* Response:
*      - 200: success
*/
$app->get('/my_votes', function() use($app) {

	// List all Pairs supported by user, for frontend to determine if Vote or Unvote button should be provided

	$facebook = getFacebook();
	$fbid = $facebook->getUser();

	if($fbid){

		$voter = getUid($fbid, 0);

		try{

			$db = getDatabaseConnection();
			$sql = "SELECT `pid`, `is_myself` FROM `vote` WHERE `voter` = :voter AND `status` = 1";
			$stmt = $db->prepare($sql);
			$stmt->execute(
				array(
					":voter" => $voter
				)
			);
			$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

			// $pid_voted stores all pids supported by user
			// $pid_involved stores all pids of record with is_myelf of user

			$pid_voted = array();
			$pid_involved = array();

			foreach($result as $vote_record){
				$pid_voted[] = $vote_record['pid'];
				if($vote_record['is_myself'] == 1){
					$pid_involved[] = $vote_record['pid'];
				}
			}

			echo json_encode(
				array(
					"result" => "ok",
					"data" => array(
						"voted" => $pid_voted,
						"involved" => $pid_involved
					)
				)
			);

		} catch(PDOException $e) {
			$message = json_encode(
				array(
					"result" => "error",
					"message" => $e->getMessage()
				)
			);
			$app->halt(500, $message);
		}
	}else{

		// Instead of returning a 401 error code, we just return an empty result in this case, which makes it easier to maintain frontend code
		// This might be a temporary apporach, could be improved to make more sense if we find better way to deal with the problem at frontend

		$message = json_encode(
			array(
				"status" => 0,
				"result" => "error",
				"message" => "Login required!",
				"data" => array(
					"voted" => array(),
					"involved" => array()
				)
			)
		);
		echo $message;
	}

});

/*
* Method: POST /
* Description: Create a new Pair as user requests
* Parameter:
*      - 'fbid1': Facebook user ID of user 1, can be real ID or FQL ID
*      - 'fbid2': Facebook user ID of user 2, can be real ID or FQL ID
* Response:
*      - 200: Successfully create a new Pair, or vote for the Pair if already created by others
*      - 400: User attempted to create a Pair already voted by himself
*/
$app->post('/', function() use($app) {

	// Promote or vote / unvote a pair

	$facebook = getFacebook();
	$voter = $facebook->getUser();
	if($voter){
		try{

			/*

			Two ways to vote / unvote for a Pair is implemented

			case 1. User provides fbid1 and fbid2, or fb photo id 1 and fb photo id 2, we will figure out pid for that Pair
				case i. Pair of fbid1 and fbid2 already exists => get pid for furthur progress
				case ii. of fbid1 and fbid2 does not exist yet => promote a new pair and get pid for furthur progress

			case 2. User provides pid, we will figure out detailed info

			*/

			try{

				// This API has a complicated business logic, messages will be put into the $response array and send to user finally, as long as no fatal error occurs

				// To prevent name collision of variables such as $result or $pid, a $response array is constructed here
				$response = array(
					"result" => "ok",
					"pid" => 0,
					"message" => ""
				);

				// Since uid of two members as well as pid of a Pair is required, we declare the variables here

				$uid = array();
				$pid = 0;

				$db = getDatabaseConnection();

				// Try to get all information required

				if( ( isset($_POST['fbid1']) && isset($_POST['fbid2']) ) || ( isset($_POST['fbpid1']) && isset($_POST['fbpid2']) ) || ( isset($_POST['id1']) && isset($_POST['id2']) && isset($_POST['type1']) && isset($_POST['type2']) ) ){

					// case 1. as mentioned above

					$fbid = array();

					if(isset($_POST['fbid1']) && isset($_POST['fbid2'])){
						$fbid = array(
							1 => filter_input(INPUT_POST, 'fbid1', FILTER_VALIDATE_INT),
							2 => filter_input(INPUT_POST, 'fbid2', FILTER_VALIDATE_INT)
						);
					}else if(isset($_POST['fbpid1']) && isset($_POST['fbpid2'])){
						$fbid = array(
							1 => getRealIdByPhoto($_POST['fbpid1']),
							2 => getRealIdByPhoto($_POST['fbpid2'])
						);
					}else{
						for($i = 1; $i <= 2; $i++){
							switch($_POST['type'.$i]){
								case 0:
									// UID is provided
									$uid[$i] = $_POST['id'.$i];
									break;
								case 1:
									// Real FBID is provided
									$fbid[$i] = $_POST['id'.$i];
									break;
								case 2:
									// FB Photo ID is provided
									$fbid[$i] = getRealIdByPhoto($_POST['id'.$i]);
									break;
								default:
									$message = json_encode(
                    array(
                      "result" => "error",
                      "message" => "Invalid parameter provided"
                    )
									);
									$app->halt(400, $message);
							}
						}
					}

					// Get uid for two member of the Pair, since user provided us real Facebook IDs

					foreach($fbid as $key => $value){
            if($value != 0){
              $uid[$key] = getUid($value, 1);
            }
					}

          if(sizeof($uid) != 2 || $uid[1] == 0 || $uid[2] == 0){

            // Could not Pair, since information provided was not enough

            $message = json_encode(
              array(
                "result" => "error",
                "message" => "Could not retrieve detailed information of specified user"
              )
            );
            $app->halt(400, $message);

          }

					if($uid[1] > $uid[2]){

						// uid1 should be the smaller one in each pair, if not, swap

						list($uid[1], $uid[2]) = array($uid[2], $uid[1]);

					}

					// Check if Pair of uid1 and uid2 already exists

					$sql = "SELECT * FROM `pairs` WHERE `uid1` = :uid1 AND `uid2` = :uid2";
					$stmt = $db->prepare($sql);
					$stmt->execute(
						array(
							":uid1" => $uid[1],
							":uid2" => $uid[2]
						)
					);
					$result = $stmt->fetch(PDO::FETCH_ASSOC);

					// Determine if we need to promote a new Pair
					// The 'is_retrieve' POST parameter is ignored in this section since no one would try to retrieve vote by providing fbids

					if(empty($result)){

						// Promoting new pair

						$sql = "INSERT INTO `pairs` (`uid1`, `uid2`, `count`, `ctime`) VALUES(:uid1, :uid2, 0, CURRENT_TIMESTAMP)";
						$stmt = $db->prepare($sql);
						$stmt->execute(
							array(
								":uid1" => $uid[1],
								":uid2" => $uid[2]
							)
						);

						$pid = $db->lastInsertId();

						$response['message'] = "New Pair promoted successfully!";

					}else{

						// Pair existed, just get pid

						$pid = $result['pid'];

					}

				}else if(isset($_POST['pid'])){

					// case 2. as mentioned above

					$sql = "SELECT `uid1`, `uid2`, `pid` FROM `pairs` WHERE `pid` = :pid";
					$stmt = $db->prepare($sql);
					$stmt->execute(
						array(
							":pid" => $_POST['pid']
						)
					);
					$result = $stmt->fetch(PDO::FETCH_ASSOC);

					if(empty($result)){

						// Attempted to vote / unvote for an unexisted Pair id

						$message = json_encode(
							array(
								"result" => "error",
								"message" => "PAIR attempted to access does not exist."
							)
						);
						$app->halt(400, $message);

					}else{

						// Existence of pid verified, fetch detailed info about the Pair
						// uid1 < uid2 holds since uids are sorted before inserting into database previously

						$uid[1] = $result['uid1'];
						$uid[2] = $result['uid2'];

						// $pid comes from result of query instead of user input, since the former is more reliable

						$pid = $result['pid'];

					}

				}else{

					// Invalid request

					$message = json_encode(
						array(
							"result" => "error",
							"message" => "Invalid request! One or more parameter missing."
						)
					);
					$app->halt(400, $message);

				}

				if(isset($_POST['is_retrieve']) && $_POST['is_retrieve'] == 1){

					// Retrieve vote from specified Pair

					$voter_uid = getUid($voter, 0);

					// Check if user has voted for specified vote

					$sql = "SELECT * FROM `vote` WHERE `pid` = :pid AND `voter` = :voter AND `status` = 1";
					$stmt = $db->prepare($sql);
					$stmt->execute(
						array(
							":pid" => $pid,
							":voter" => $voter_uid
						)
					);
					$result = $stmt->fetch(PDO::FETCH_ASSOC);

					if(empty($result)){

						// Attempted to retrieve vote from Pair you don't currently support

						$message = json_encode(
							array(
								"result" => "error",
								"message" => "PAIR attempted to retrieve vote from is not supported by you previously!"
							)
						);
						$app->halt(400, $message);

					}else{

						// Retrieve vote record

						$sql = "UPDATE `vote` SET `status` = 0 WHERE `pid` = :pid AND `voter` = :voter";
						$stmt = $db->prepare($sql);
						$stmt->execute(
							array(
								":pid" => $pid,
								":voter" => $voter_uid
							)
						);

						// Restore vote count

						$sql = "UPDATE `pairs` SET `count` = `count` - 1 WHERE `pid` = :pid";
						$stmt = $db->prepare($sql);
						$stmt->execute(
							array(
								":pid" => $pid
							)
						);

						echo json_encode(
							array(
								"result" => "ok",
								"message" => "Vote retrieved successfully!"
							)
						);
					}

				}else{

					// FIXME: please still draw the "Finite State Machine" for "POST /" on pair:status

					// Add vote record

					$voter_uid = getUid($voter, 0);
					$is_myself = in_array($voter_uid, $uid)? 1: 0;

					// Check if already voted

					$sql = "SELECT * FROM `vote` WHERE `voter` = :voter AND `pid` = :pid";
					$stmt = $db->prepare($sql);
					$stmt->execute(
						array(
							":voter" => $voter_uid,
							":pid" => $pid,
						)
					);
					$result = $stmt->fetch(PDO::FETCH_ASSOC);

					if(empty($result)){

						// User did not do anything related to this Pair before

						$sql = "INSERT INTO `vote` (`pid`, `voter`, `status`, `is_myself`, `ctime`) VALUES(:pid, :voter, :status, :is_myself, NOW())";
						$stmt = $db->prepare($sql);
						$stmt->execute(
							array(
								":pid" => $pid,
								":voter" => $voter_uid,
								":status" => 1,
								":is_myself" => $is_myself
							)
						);
					}else if($result['status'] == 1){

						// Already voted for this Pair

						$message = json_encode(
							array(
								"result" => "error",
								"message" => "Already supported this Pair"
							)
						);

						// The voting procedure is halted here since no furthur actions should be done upon the user nor the Pair specified
						// We use the halt function provided by Slim Framework instead of PHP's built-in exit function to end the response gracefully, since the latter may cause some problem

						$app->halt(200, $message);

					}else if($result['status'] == 0){

						// User is re-supporting this Pair

						$sql = "UPDATE `vote` SET `status` = 1 WHERE `voter` = :voter AND `pid` = :pid";
						$stmt = $db->prepare($sql);
						$stmt->execute(
							array(
								":voter" => $voter_uid,
								":pid" => $pid
							)
						);

					}

					// Set the count number correctly

					$sql = "UPDATE `pairs` SET `count` = `count` + 1 WHERE `pid` = :pid";
					$stmt = $db->prepare($sql);
					$stmt->execute(
						array(
							":pid" => $pid
						)
					);

					if($response['message'] == ""){

						// User is supporting existing Pair

						$response['message'] = "PAIR supported sucessfully!";
					}

					$response['pid'] = $pid;

					echo json_encode($response);

				}

			} catch(PDOException $e) {
				$message = json_encode(
					array(
						"result" => "error",
						"message" => $e->getMessage()
					)
				);
				$app->halt(500, $message);
			}

		} catch(FacebookApiException $e) {
			$message = json_encode(
			array(
				"result" => "error",
				"message" => $e->getMessage()
				)
			);
			$app->halt(500, $message);
		}

	}else{
		$message = json_encode(
			array(
				"status" => 0,
				"result" => "error",
				"message" => "Login required!"
			)
		);
		$app->halt(401, $message);
	}

});

// FIXME: same (method, desciption, ... etc)
$app->get('/realfriends', function() use($app) {
	$facebook = getFacebook();
	$fbid = $facebook->getUser();

	if($fbid) {
		try {
			// FIXME: why only 20?
			$taggable_friends = $facebook->api('/me/taggable_friends?limit=20','GET');
			$friends = array();
			foreach($taggable_friends['data'] as $friend_obj){
				$realid = getRealIdByPhoto($friend_obj['picture']['data']['url']);
				$friends[] = array($friend_obj['name'], $realid);
			}
			echo json_encode($friends);
		} catch(FacebookApiException $e) {
			$message = json_encode(
			array(
				"result" => "error",
				"message" => $e->getMessage()
				)
			);
			$app->halt(500, $message);
		}
	} else {
		$message = json_encode(
			array(
				"status" => 0,
				"result" => "error",
				"message" => "Login required!"
			)
		);
		$app->halt(401, $message);
	}

});

/*
* Method: GET /p/:pid
* Description: Get detailed info about specified Pair
* Parameter:
*      - 'pid': ID of a Pair
* Response:
*      - 200: Success, will return detailed info about the Pair and two Pair members
*      - 404: Specified Pair ID is invalid, Pair not found
*/
$app->get('/p/:pid', function($pid) use($app) {

	// Get detailed information about a specific Pair

	try{

		$db = getDatabaseConnection();
		$sql = "SELECT `uid1` as `user1`, `uid2` as `user2`, `count`, `mtime`, `ctime` FROM `pairs` WHERE `pid` = :pid";
		$stmt = $db->prepare($sql);
		$stmt->execute(
			array(
				":pid" => $pid
			)
		);
		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		if(empty($result)){
			$message = json_encode(
				array(
					"result" => "error",
					"message" => "Pair not found!"
				)
			);
			$app->halt(404, $message);
		}else{
			$users = array('user1', 'user2');
			$sql = "SELECT `uid`, `fbid`, `fbid_real`, `name` FROM `user` WHERE `uid` = :uid";
			$stmt = $db->prepare($sql);
			foreach($users as $user){
				$stmt->execute(
				array(
					":uid" => $result[$user]
				)
				);
				$result[$user] = $stmt->fetch(PDO::FETCH_ASSOC);
			}

			echo json_encode(
				array(
					"result" => "ok",
					"data" => $result
				)
			);
		}

	} catch(PDOException $e) {
		$message = json_encode(
			array(
				"result" => "error",
				"message" => $e->getMessage()
			)
		);
		$app->halt(500, $message);
	}

});

$app->run();

?>
