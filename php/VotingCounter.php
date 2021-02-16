<?php
#投票結果管理用クラス
class VotingCounter{


	/*
	 * ログイン情報を追加する
	 */
	static function AddLoginInfo($user_id,$user_name,$logging){
		$dbh = Utils::GetPDO();
		//$add = $dbh->prepare("insert into opinions(user_id,user_name,opinion,count,adopted,type,time_stamp)values(?,?,?,0,0,'say_directly',now())");
		$add = $dbh->prepare("insert into logging(user_id,user_name,logging,attend,time_stamp)values(?,?,?,1,now())");
		$add->bindParam(1, $user_id);
		$add->bindParam(2, $user_name);
		$add->bindParam(3, $logging);
		//$type = 'say_directly';
		//$add->bindParam(4, $type);

		if($add->execute()){
			$last_insert_id = $dbh->lastInsertId('id');
			$update = $dbh->prepare("update logging set attend = 0 where user_id = ? and attend = 1 and id < ?");
			$update->bindParam(1, $user_id);
			$update->bindParam(2, $last_insert_id);
			$update->execute();
			return $last_insert_id;
		}
		else{
			return null;
		}
	}


	/*
	 * 笑いのリアクションを送る
	 */
	static function AddReaction($user_id,$user_name,$reaction,$original,$soramimi,$elapsed_time,$song){
		$dbh = Utils::GetPDO();
		$add = $dbh->prepare("insert into reactions(user_id,user_name,reaction,original,soramimi,elapsed_time,song,time_stamp)values(?,?,?,?,?,?,?,now())");
		$add->bindParam(1, $user_id);
		$add->bindParam(2, $user_name);
		$add->bindParam(3, $reaction);
		$add->bindParam(4, $original);
		$add->bindParam(5, $soramimi);
		$add->bindParam(6, $elapsed_time);
		$add->bindParam(7, $song);

		if($add->execute()){
			//同一ユーザIDの2分以内のfixされていないreactionのusedを0にする
			$lastInsertId = $dbh->lastInsertId('id');
			return $lastInsertId;
		}
		else{
			return null;
		}
	}


}