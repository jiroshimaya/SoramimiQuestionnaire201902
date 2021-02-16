<?php
#便利関数管理用クラス　
use Kreait\Firebase;
use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

class Utils{

	static function GetUserIdByCookie(){
		if(isset($_COOKIE[Constants::$COOKIE_USERID])){
			return $_COOKIE[Constants::$COOKIE_USERID];
		}
		else {
			$uuid = Utils::GenerateUniqID("chega_system_");
			setcookie(Constants::$COOKIE_USERID,$uuid);
			return $uuid;
		}
	}

	static function GenerateUniqID($prefix = null){
		if($prefix == null){
			$uuid = uniqid(rand(0,1000));
		}
		else $uuid = uniqid($prefix,true);

		return str_replace(".", "_", $uuid);
	}


	/*
	 * クライアントへの返答を生成する
	 * @status
	 * @message
	 * @content
	 */
	static function SendResponse($status,$message,$content){
		header('content-type: application/json; charset=utf-8');
		$array = array("status"=>$status,"message"=>$message,"content"=>$content);
		echo(json_encode($array));
	}

	/*
	 * データベース接続用PDOを取得する
	 */
	static function GetPDO(){
		if(PHP_OS=="Linux"){
			//$dbh = new PDO('mysql:host=tokyo.cbgj6c5l6nk3.ap-northeast-1.rds.amazonaws.com;dbname=pastel','machikane','machikaneko');
			$dbh = new PDO('mysql:host=127.0.0.1;dbname=questionnaire','ishiguro','toyonaka');
		}
		else{
			//$dbh = new PDO('mysql:host=127.0.0.1;dbname=voting_system','ishiguro','toyonaka');
			$dbh = new PDO('mysql:host=127.0.0.1:8889;dbname=questionnaire','ishiguro','toyonaka',array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
		}
		/// これを入れないと、mysqlから帰って来る文字列が全部'?'になる場合がある
		$dbh->query("set names utf8");
		return $dbh;
	}

	/*
	 * ファイアベース接続用オブジェクトの作成
	 */
	static function GetFBDB(){

		$serviceAccount = ServiceAccount::fromJsonFile(__DIR__.'/../conf/firebase.json');
		$firebase = (new Factory)->withServiceAccount($serviceAccount)->create();

		$database = $firebase->getDatabase();
		return $database;
	}

	/*
	 * 必要なパラメータがすべてポストされているかどうか確認する
	 */
	static function CheckPostParameters($requred_parameters,$posted_parameters){
		foreach ($requred_parameters as $parameter){
			if(!array_key_exists($parameter, $posted_parameters))return false;
		}
		return true;
	}


	/*
	 * ループ中のタイムアウトをチェックする
	 */
	static function CheckTimeOut($start_time,$MAX_TIME){
		if(time() - $start_time > $MAX_TIME){
			return true;
		}
		else return false;
	}

	static function TcpClientTest($data){
		$client = new TcpSender("127.0.0.1",6600);
		$client->BuildConnection();
		$client->SendAndRecieve($data);
		$client->CloseConnection();
	}

	static function SendBBTest($utterance){
		$client = new TcpSender(Constants::$BB_IP,Constants::$BB_PORT);
		$client->BuildConnection();
		$client->Send("setplayer;SM\n");
		$client->Send("commu1;$utterance\n");
		//$client->CloseConnection();
	}

	static function SendDataToBB($destination,$data){
		$bbInfo = Utils::ReadObserverConf();
		$client = new TcpSender($bbInfo["bb_ip"],$bbInfo["bb_port"]);
		$client->BuildConnection();
		$client->Send($destination.";".$data."/\n");
		$client->CloseConnection();
	}


	static function SendDataToFB($path, $data){
		$database = Utils::GetFBDB();
		$database->getReference($path)->set($data);
	}

	static function ReadObserverConf(){
		$dir = __FILE__;
		if(PHP_OS=="WIN32"||PHP_OS=="WINNT"||PHP_OS=="WIN64"){
			$dir = rtrim($dir, "\controller\Utils.php");
			$file = $dir."\conf\Observer.conf.json";
		}
		else{
			$dir = rtrim($dir, "/controller/Utils.php");
			$file = $dir."/conf/Observer.conf.json";
		}

		$json_string = file_get_contents($file);
		//echo($json_string);
		$obj = json_decode($json_string);
		$obj = (array)$obj;
		return $obj;
	}


	//採択のしきい値を変える(observer.conf.jsonを書き換える)
	static function ChangeThr($thr){
		return Utils::ChangeConfig('thr', $thr);
	}

	//roomを変える(observer.conf.jsonを書き換える)
	static function ChangeRoom($room){
		return Utils::ChangeConfig('room', $room);
	}

	//設定ファイルObserver.conf.jsonを書き換える
	static function ChangeConfig($key, $value){
		$bbInfo = Utils::ReadObserverConf();
		settype($key,"string");
		settype($value,"string");
		$bbInfo[$key]=$value;
		$json = json_encode($bbInfo);
		var_dump($json);
		return file_put_contents("../conf/Observer.conf.json",$json,LOCK_EX);
	}


}
