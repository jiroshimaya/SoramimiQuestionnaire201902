<?php
#ajaxアクセス先
require_once 'autoloader.php';


//jsonをパース/////////////////
$json_string = file_get_contents('php://input');
$obj = json_decode($json_string);
$obj = (array)$obj;
/////////////////////////////////

$command = $obj['command'];//コマンドの種類を取得
//COOKIEをチェックし、ユーザーIDを取得
if(!array_key_exists("user_id", $obj) || $obj['user_id']==""){
	$user_id = Utils::GetUserIdByCookie();
}
else {
	$user_id = $obj['user_id'];
}
$user_name = $obj['user_name'];
//Utils::SendResponse("success", "message", $user_id);

switch($command){
	case 'log_in':
		//ユーザーがログインしたことをBBへ通知
		//Utils::SendDataToBB("tt", "user_login/$user_id/".$obj['user_name']);
		VotingCounter::AddLoginInfo($user_id,$obj['user_name'],"in");
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
		break;
	case 'log_out':
		VotingCounter::AddLoginInfo($user_id,$obj['user_name'],"out");
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null);
		break;
	case 'get_user_id':
		Utils::SendResponse(Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $user_id);
		break;
	case 'add_laugh':
		VotingCounter::AddReaction ( $user_id, $user_name, Constants::$REACTION_LAUGH, $obj['original'], $obj['soramimi'], $obj['elapsed_time'], $obj['song']);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null );
		break;
	case 'set_presentation':
		$presentation = $obj['presentation'];
		VotingCounter::SetPresentation($presentation);
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, null );
		break;
	case 'get_presentation':
		$presentation = VotingCounter::GetPresentation();
		Utils::SendResponse ( Constants::$STATUS_SUCCESS, Constants::$MESSAGE_SUCCESS, $presentation );
		break;
	default:
		var_dump($obj);
		break;
}