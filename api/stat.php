<?php

/*
* Method: GET /stat
* Description: Statistics about PAIRS service
* Parameter: None
* Response:
*      - 200: success
*/
$app->get('/stat', function(){
	try{
		$db = getDatabaseConnection();
		$sql = "SELECT count(*) FROM `pairs`";
		$stmt = $db->query($sql);
		$result = $stmt->fetch(PDO::FETCH_NUM);
		echo json_encode(
			array(
				"result" => "ok",
				"data" => array(
					"pairs_count" => $result[0]
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
});

?>
