<?php

/*
* Method: GET /play_list
* Description: Randomly generate some suggestions of possible Pairs for user to promote
* Parameter: none
* Response:
*      - 200: Success
*      - 401: User has not logged in yet
*/
$app->get('/play_list', function() use($app) {
	$facebook = getFacebook();
	$fbid = $facebook->getUser();

	if($fbid) {
		try {
			$db = getDatabaseConnection();
			$uid = getUid($fbid, 0);

			$play_list = array();
			$sql_white_count = "SELECT count(*) FROM `user_pool` WHERE `refer_uid` = :uid";
			$sql_white = "SELECT `name`, `photo_id`, `photo_url` FROM `user_pool` WHERE `refer_uid` = :uid LIMIT :offset ,1";
			$sql_black_count = "SELECT count(*) FROM `user` WHERE NOT `fbid` = 0";
			$sql_black = "SELECT `uid`, `name`, `fbid` FROM `user` WHERE NOT `fbid` = 0 LIMIT :offset ,1";

			$stmt_black_count = $db->query($sql_black_count);
			$result_black_count = $stmt_black_count->fetch(PDO::FETCH_NUM);
			$black_count = $result_black_count[0];
			$stmt_white_count = $db->prepare($sql_white_count);
			$stmt_black = $db->prepare($sql_black);
			$stmt_white = $db->prepare($sql_white);
			$stmt_my_white = $db->prepare($sql_white);

			$sql_name = "SELECT `name` FROM `user` WHERE `uid` = :uid";
			$stmt_name = $db->prepare($sql_name);
			$stmt_name->execute(
				array(
					":uid" => $uid
				)
			);
			$result_name = $stmt_name->fetch(PDO::FETCH_ASSOC);
			$stmt_white_count->bindValue(':uid', $uid);
			$stmt_white_count->execute();
			$result_my_white_count = $stmt_white_count->fetch(PDO::FETCH_NUM);
			$stmt_my_white->bindValue(':uid', $uid);

			// Used to determine the ratio of A:B:C:D

			$weights = array(PLAY_RATE_A, PLAY_RATE_B, PLAY_RATE_C, PLAY_RATE_D);
			$rand_pool = array();
			$rand_stat_gen = array(0, 0, 0, 0); // Log counts of A B C D
			$rand_stat_result = array(0, 0, 0, 0); // Log counts of A B C D of final output
			foreach($weights as $index => $weight){

				// Skip white + white of me or me + white if user did not have enough friends

				if(in_array($index, array(0, 2)) && $result_my_white_count[0] <= 1){
					continue;
				}
				for($i = 1; $i <= $weight; $i++){
					$rand_pool[] = $index;
				}
			}

			for($i = 0; $i < PLAY_LIMIT; $i++){
				$type = $rand_pool[array_rand($rand_pool)];
				$rand_stat_gen[$type]++; // Log counts of A B C D
				switch($type){

					// Type A: me + white

					case 0:
						$offset = rand(0, $result_my_white_count[0] - 1);
						$stmt_my_white->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
						$stmt_my_white->execute();
						$result_my_white = $stmt_my_white->fetch(PDO::FETCH_ASSOC);
						$play_list[] = array(
							array(
								"type" => 0,
								"id" => $uid,
								"name" => $result_name['name'],
								"photo_url" => 'http://graph.facebook.com/'.$fbid.'/picture?height=200&width=200'
							),
							array(
								"type" => 2,
								"id" => $result_my_white['photo_id'],
								"name" => $result_my_white['name'],
								"photo_url" => $result_my_white['photo_url']
							)
						);
						$rand_stat_result[$type]++;
						break;

					// Type B: black + white related to that black

					case 1:
						$offset = rand(0, $result_black_count[0] - 1);
						$stmt_black->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
						$stmt_black->execute();
						$result_black = $stmt_black->fetch(PDO::FETCH_ASSOC);
						$stmt_white_count->bindValue(':uid', $result_black['uid']);
						$stmt_white_count->execute();
						$result_white_count = $stmt_white_count->fetch(PDO::FETCH_NUM);

						if($result_white_count[0] <= 1){
							// Selected user did not have enough friends
							continue;
						}

						$offset = rand(0, $result_white_count[0] - 1);
						$stmt_white->bindValue(':uid', $result_black['uid']);
						$stmt_white->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
						$stmt_white->execute();
						$result_white = $stmt_white->fetch(PDO::FETCH_ASSOC);

						$play_list[] = array(
							array(
								"type" => 0,
								"id" => $result_black['uid'],
								"name" => $result_black['name'],
								"photo_url" => 'http://graph.facebook.com/'.$result_black['fbid'].'/picture?height=200&width=200'
							),
							array(
								"type" => 2,
								"id" => $result_white['photo_id'],
								"name" => $result_white['name'],
								"photo_url" => $result_white['photo_url']
							)
						);
						$rand_stat_result[$type]++;
						break;

					// Type C: white + white of me

					case 2:

						$pair = array();

						for($j = 0; $j < 2; $j++){
							$offset = rand(0, $result_my_white_count[0] - 1);
							$stmt_my_white->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
							$stmt_my_white->execute();
							$result_my_white = $stmt_my_white->fetch(PDO::FETCH_ASSOC);
							$pair[] = array(
								"type" => 2,
								"id" => $result_my_white['photo_id'],
								"name" => $result_my_white['name'],
								"photo_url" => $result_my_white['photo_url']
							);
						}
						$play_list[] = $pair;
						$rand_stat_result[$type]++;
						break;

					// Type D: white + white of a black

					case 3:
						$offset = rand(0, $result_black_count[0] - 1);
						$stmt_black->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
						$stmt_black->execute();
						$result_black = $stmt_black->fetch(PDO::FETCH_ASSOC);
						$stmt_white_count->bindValue(':uid', $result_black['uid']);
						$stmt_white_count->execute();
						$result_white_count = $stmt_white_count->fetch(PDO::FETCH_NUM);

						if($result_white_count[0] <= 1){
							// Selected user did not have enough friends
							continue;
						}

						$pair = array();

						for($j = 0; $j < 2; $j++){
							$offset = rand(0, $result_white_count[0] - 1);
							$stmt_white->bindValue(':uid', $uid);
							$stmt_white->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
							$stmt_white->execute();
							$result_white = $stmt_white->fetch(PDO::FETCH_ASSOC);
							$pair[] = array(
								"type" => 2,
								"id" => $result_white['photo_id'],
								"name" => $result_white['name'],
								"photo_url" => $result_white['photo_url']
							);
						}
						$play_list[] = $pair;
						$rand_stat_result[$type]++;
						break;
				}
			}

			echo json_encode(
				array(
					"result" => "ok",
					"data" => $play_list,
					"stat" => array($rand_stat_gen, $rand_stat_result)
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

?>
