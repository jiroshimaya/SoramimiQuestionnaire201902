<?php
#データベースの状態を監視し、適当なタイミングでBBへ文字列を送信するTCPCient
require_once 'autoloader.php';

//初期化
echo("***ADPTED OPINIONS CLONE PROGRAM***\n");
$bbInfo = Utils::ReadObserverConf();
$client = new TcpSender($bbInfo["bb_ip"],$bbInfo["bb_port"]);
$client->BuildConnection();
$client->Send("setplayer;VC\n");

//すでに採択された意見を削除
VotingCounter::ResetAdoptedOpinions();
//たまっているvideolikeを削除
VotingCounter::ResetVideoLikes();

$last_id = 0;
$last_like_id = 0;
$last_normal_like_id = 0;
$last_sendData = "";
$commu = new CommUController();
while(true){
	$line = $client->Recieve();
	echo 'RECV from CommU Server>'.$line;
	var_dump($line);
	if($line != '' && $last_sendData != ''){
		$client->SafeSend("tt;".$last_sendData);
		echo 'message:'.$last_sendData.' is re-sent because communication problem occurred';
	}
	$opinion_ids = VotingCounter::CloningAdoptedResult($last_id);
	if($opinion_ids != null){
		foreach ($opinion_ids as $value){
			if($last_id < $value['id']){
				$last_id = $value['id'];
			}
			//意見を取得
			$opinion = VotingCounter::GetOpinion($value['opinion_id']);
			//意見にLIKEした人を取得
			$like_users = VotingCounter::GetLikeUser($value['opinion_id']);
			$user_id = $like_users[rand(0, count($like_users)-1)];
			$utterance = $commu->CommUTextGenerator($opinion['user_name'],$opinion['type'],$opinion['opinion']);

			//$client->Send("commu1;/say { ".$opinion['opinion']." }\n");
			$opinion_id = $value['opinion_id'];
			$opinion_type = $opinion['type'];
			$user_name = $opinion['user_name'];
			$sendData = "{\"command_type\":\"adopted\",\"user_id\":\"$user_id\",\"user_name\":\"$user_name\",\"utterance\":\"$utterance\",\"opinion_id\":\"$opinion_id\",\"opinion_type\":\"$opinion_type\"}\n";
			//trouble時の送り直し用にデータを保存

			$sendData_Oskar = "adopted/$opinion_id/$user_name/$utterance/$opinion_type/test1-test2\n";
			$last_sendData = $sendData_Oskar;
			//$client->Send("tt;".$sendData_Oscar);
			$client->SafeSend("tt;".$sendData_Oskar);
			//$client->Send("tt;".$sendData_Oscar);
			//$client->Send("tt;$utterance\n");
			//$client->Send("TT;/adopted { ".$utterance." }\n");
			//$client->Send("tt;".$utterance."\n");
			//echo("Adopted:".$opinion['opinion']."\n");
			VotingCounter::UpdateAdoptedOpinionAsSent($value['opinion_id']);
			sleep(1);
		}
	}
	else {
		$video_likes = VotingCounter::GetLatestVideoLikeness($last_like_id);
		if($video_likes != null){
			if($video_likes['like'] >= Constants::$VIDEO_LIKE_THR){
				//likeが多く押された
				$sendData = "{\"command_type\":\"video_likes\"}\n";
				$sendData_Oscar = "video_likes/\n";
				$client->Send("tt;".$sendData_Oscar);
				$last_like_id = $video_likes['last_id'];
			}
			else if($video_likes['dislike'] >= Constants::$VIDEO_DISLIKE_THR){
				//dislikeが多く押された
				$sendData = "{\"command_type\":\"video_dislikes\"}\n";
				$sendData_Oscar = "video_dislikes/\n";
				$client->Send("tt;".$sendData_Oscar);
				$last_like_id = $video_likes['last_id'];
			}
			else if($video_likes['question'] >= Constants::$VIDEO_QUESTION_THR){
				$sendData = "{\"command_type\":\"video_questions\"}\n";
				$sendData_Oscar = "video_questions/\n";
				$client->Send("tt;".$sendData_Oscar);
				$last_like_id = $video_likes['last_id'];
			}
			else{
				$video_normal_likes = VotingCounter::GetLatestVideoLikeness($last_normal_like_id);
				if ($video_normal_likes ['like'] > 0) {
					// likeが多く押された
					$sendData_Oscar = "video_like/\n";
					$client->Send ( "tt;" . $sendData_Oscar );
					$last_normal_like_id = $video_likes ['last_id'];
				} else if ($video_normal_likes ['dislike'] > 0) {
					// dislikeが多く押された
					$sendData_Oscar = "video_dislike/\n";
					$client->Send ( "tt;" . $sendData_Oscar );
					$last_normal_like_id = $video_likes ['last_id'];
				} else if ($video_normal_likes ['question'] > 0) {
					$sendData_Oscar = "video_question/\n";
					$client->Send ( "tt;" . $sendData_Oscar );
					$last_normal_like_id = $video_likes ['last_id'];
				}
			}
		}
	}
	sleep(1);
}




