<?php

/*
* Method: GET /search
* Description: Search for Pairs using name, username, Facebook ID, uid of involved user
* Parameter:
*      - uid: List pairs of which specified uid involves
*      - q: Search for pairs of which specified name, username, Facebook ID, uid involves
*      Notes: Only one parameter mentioned above is required
* Response:
*      - 200: Search performed successfully, returns search result
*      - 400: Request did not contain valid parameter
*/
$app->get('/search', function() use($app) {

	try{

		$db = getDatabaseConnection();
		$results = array();

		if(isset($_GET['uid']) && $_GET['uid'] != ''){

			// Search Pairs by user id

			$sql = "SELECT `pid`, `uid1` as `user1`, `uid2` as `user2`, `count`, `mtime`, `ctime` FROM `pairs` WHERE ( `uid1` = :uid OR `uid2` = :uid ) AND NOT `count` = 0";
			$stmt = $db->prepare($sql);
			$stmt->execute(
				array(
					":uid" => $_GET['uid']
				)
			);

			$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		}else if(isset($_GET['q']) && $_GET['q'] != ''){

			// Search Pairs by user Name, Facebook Username, or Facebook Real ID

			$sql = "SELECT `pid`, `uid1` as `user1`, `uid2` as `user2`, `count`, `mtime`, `ctime` FROM `pairs` WHERE (";
			$sql_params = array();
			$q = $_GET['q'];
			$sql_subquery = "SELECT `uid` FROM `user` WHERE";

			if(preg_match('/^[a-z\d.]{5,}$/i', $q)){

				// Search parameter matches Facebook username rule, might be Facebook username or ID

				$headers = get_headers("http://graph.facebook.com/v1.0/".$q);
				if($headers[0] == "HTTP/1.1 200 OK"){
					$user_profile = json_decode(file_get_contents('http://graph.facebook.com/v1.0/'.$q), 1);
					$sql_subquery .= " `fbid_real` = :q_fbid_real OR `name` LIKE :q";
					$sql_params[':q_fbid_real'] = $user_profile['id'];
					$sql_params[':q'] = '%'.$q.'%';
				}else{

					// Search parameter not Facebook username or ID

					$sql_subquery .= " `name` LIKE :q OR `uid` = :q_uid";
					$sql_params[':q'] = '%'.$q.'%';
					$sql_params[':q_uid'] = $q;
				}
			}else{
				$sql_subquery .= " `name` LIKE :q OR `uid` = :q_uid";
				$sql_params[':q'] = '%'.$q.'%';
				$sql_params[':q_uid'] = $q;
			}

			$sql .= " `uid1` IN ( ".$sql_subquery." ) OR `uid2` IN ( ".$sql_subquery." ) ) AND NOT `count` = 0";
			$stmt = $db->prepare($sql);
			$stmt->execute($sql_params);

			$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

		}else{

			$message = json_encode(
				array(
					"result" => "error",
					"message" => "No search parameters provided"
				)
			);
			$app->halt(400, $message);

		}

		$sql = "SELECT * FROM `user` WHERE `uid` = :uid";
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

?>
