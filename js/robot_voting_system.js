
var timer_id;
var like_timer_id;
var isFirst = true;
var onLoad = true;

var adopted_opinion_timer_id;
var active_user_name_timer_id;
//定期的にサーバーへの通信を実行するメソッド
function StartServerAccess(){
	timer_id = setInterval(GetOpinionsFromServer/*定期的に呼び出す関数名*/, 1000/*呼び出す間隔*/);
	like_timer_id = setInterval(GetLikesFromServer/*定期的に呼び出す関数名*/, 1000/*呼び出す間隔*/);
	//adopted_opinion_timer_id = setInterval(GetAdoptedOpinionsFromServer,1000);
	//active_user_name_timer_id = setInterval(GetActiveUserNamesFromServer,1000);
}

function StopServerAccess(){
	clearInterval(timer_id);
	clearInterval(like_timer_id);
	//clearInterval(adopted_opinion_timer_id);
	//clearInterval(active_user_name_id);
}

function GetOpinionsFromServer(){
	//alert("GetOpinionsFromServer");
	if(connection_info.reaccess_key){
		connection_info.SetReaccessKey(false);
		ag.GetOpinions();
	}
}

function GetLikesFromServer(){
	if(connection_info.like_reaccess_key){
		connection_info.SetLikeReaccessKey(false);
		ag.GetLikes();
	}
}

function GetAdoptedOpinionsFromServer(){
	if(connection_info.adopted_opinion_reaccess_key){
		connection_info.SetAdoptedOpinionReaccessKey(false);
		ag.GetAdoptedOpinions();
	}
}

function GetActiveUserNamesFromServer(){
	if(connection_info.active_user_name_reaccess_key){
		connection_info.SetActiveUserNameReaccessKey(false);
		ag.GetActiveUserNames();
	}
}

//サーバーからの応答結果をパースし、コマンドごとに適当な処理を行うメソッド
function ProcessResult(command,content){
	//if(content == null)return;
	//length周りのエラーがログに出るのがうざいので，もしcontentがヌルならbreakする．
	if(command == "get_adopted_opinions"){
		console.log(command+":"+content);
	}
	if(content==null){
		//console.log("in process result ( command is "+command+"), return because content is null");
		return;
	}

	switch(command){
	case 'add_opinion':

		//my_messageを他と区別する
		//$('#my_msessage div:first-child').addClass(user);
		if(statement_type=="tweet"){
			var selector="."+last_my_tweet_id;
			$(selector).addClass("opinion_id="+content);
			//$( selector ).draggable();
		}else if(statement_type=="liked_tweet"){
			console.log("liked_tweet:"+content);

			var tmp=$('.last');
			console.log("length:"+tmp.length+":"+tmp.attr("id"));
			tmp.attr('id',"hukidashi-"+my_id+"-"+content);
			console.log("length:"+tmp.length+":"+tmp.attr("id"));
			tmp.find('.reaction').attr('id','reaction-'+my_id+'-'+content);
			tmp.find('.general-button').attr('id','likeButton-'+my_id+'-'+content);
			console.log("general-button:"+tmp.find('.general-button').attr('id'));
			tmp.find('.goodcount').attr('id','goodCount-'+my_id+'-'+content);

			tmp.find('.goodchar').attr('id','goodchar-'+my_id+'-'+content);
			tmp.find(".goodcount").addClass('goodCount-'+content);
			tmp.find(".general-button").addClass('likeButton-'+content);
			tmp.removeClass("last");


		}else{
			//var tmp=$('#other_message div:first-child');
			var tmp = $('#'+my_id);
			tmp.attr("id","hukidashi-"+content);
			//get_opinionsで同じidの発話を弾くために保存
			last_posted_opinion_id = content;
		}
		break;
	case 'get_opinions':
		var max_id = 0;

		//初回のロード時に表示される"say_directly"はすべて薄くする
		var opacity = "1";
		if(isFirst) {
			opacity = "0.33";
			isFirst = false;
		}

		for(var i=0;i<content.length;i++){
			//alert("opinion_id:"+content[i]["id"]);
			if(content[i]['id'] > max_id){
				max_id = content[i]['id'];
				connection_info.SetLastOpinionId(max_id);
			}
			//contentは以下の情報を含む
			//id : 投稿のid
			//user_id : 投稿したユーザーのid
			//user_name : 投稿したユーザーの名前
			//opinion : 投稿本体
			//opinion_type : 投稿のタイプ
			//time_stamp : 投稿された日時
			//adopted : 採択された意見であるかどうか

			var opinion_id=content[i]['id'];
			var user=content[i]['user_id'];
			var username=content[i]['user_name'];
			var opinion=content[i]['opinion'];
			var opinion_type=content[i]['opinion_type'];

			//opinion_typeがtweetの場合
			if(opinion_type=="tweet"){
				console.log(opinion_type+":"+opinion+":"+opinion_id);
				if(onLoad == true){
					//alert("onLoad");
					continue;
				}
				if(user != my_id)
					tweet(opinion,opinion_id);
			}
			//opinion_typeがtweet以外の場合（summarize, talk_freely,など）
			else{
				console.log("get_opinions:opinion_type:"+opinion_type);
				//alert("user_id:"+user);

				//opinion_typeがliked_tweetの場合
				if(opinion_type=="liked_tweet"){

				}
				//usernameからアイコンを取得する
				//var icon=GetIconPath(username);
				//opinion_typeからアイコンを取得する
				var icon=GetIconPath(opinion_type);
				if(content[i]["opinion_type"]=="say_directly"){
					var lastchar = opinion.slice(-1);
			        if(lastchar == "?" || lastchar == "？")icon=GetIconPath("ask");
			        else icon=GetIconPath("talk_freely");;
				}
				//自分が直前に投稿した意見なら弾く
				if(content[i]["id"] == last_posted_opinion_id) continue;

				if(opinion_type=="let_others_talk"){
					opinion=opinion.split("<br>")[0]+"に喋ってほしい<br>"+opinion.split("<br>")[1];
				}

				var hukidashi_id = "hukidashi-"+opinion_id;//content[i]['id'];
				//alert(hukidashi_id);

				var color = "bg-success";
				if(content[i]["user_id"]==my_id){
					color = "bg-info";
				}else if(content[i]["opinion_type"] == "say_directly"){
					color = "bg-warning";
				}
				var btnlike = "inline";
				if($.cookie("user_type") == "posting")
					btnlike = "none";
				var param = {
						"btn-like-display":"inline",
						"btn-say-display":"none",
						"bg-color":color,
						"time-stamp":content[i]["time_stamp"],
						"face":icon,
						"user-id":hukidashi_id
				}
				//if(content[i]["opinion_type"] == "say_directly") {
				if(content[i]["adopted"] != 0 || content[i]["opinion_type"] == "say_directly") {
					param["hukidashi-class"] = ["adopted"];
					param["btn-like-disabled"] = "disabled";
					param["btn-say-disabled"] = "disabled";
					param["opacity"] = opacity;
				}
				if($.cookie("user_type") == "admin"){
					//alert("admin");
					param["btn-say-disabled"] = "";
					param["btn-say-display"] = "inline";
					param["goodcount-display"] = "inline";

				}



				var h=dispHukidashi2(opinion,param);
				console.log(param);
				var area="other_message";
				//$(h).prependTo("#"+area).hide().fadeIn(300);
				//if(content[i]["opinion_type"]!="say_directly")
				$(h).prependTo("#"+area);
			}
		}
		if(onLoad == true){
			//alert("for end");
			onLoad = false;
		}
		break;
	case 'get_user_id':
		my_id=content;
		//alert(my_id);
        break;
	case 'get_star':

		break;
	case 'add_like':
		//alert("add_like");
		break;
	case 'delete_like':
		//alert("delete like");
		break;
	case 'get_active_user_names':
		alert(JSON.stringify(content));
		//$('.button').val(content[0]['user_name']);
		//$('.button-area').append('<button>'+content[0]['user_name']+'</button>');
		break;
	case 'get_likes':
		//erase_flagがtrueならlikeの更新が行われるのはおかしいので，更新しない
		//if(erase_flag==true){
		//	console.log("in get_likes, return becase erase_flag is true");
		//	return;
		//}
		console.log("in get_likes");
		var max_id = 0;
		var like_type = content['like_type'];
		content = content['likes'];
		if(like_type == "regular"){
			for(var i=0;i<content.length;i++){
				if(content[i]['id'] > max_id){
					max_id = content[i]['id'];
					connection_info.SetLastLikeId(max_id);
				}

				//contentは以下の情報を含む
				//id : likeのid
				//opinion_id:likeされたopinionのid
				//user_id : likeされた意見を投稿したユーザーのid
				//count:対象opinionの総like数
				//time_stamp : likeされた日時

				var hukidashi = $("#hukidashi-"+content[i]["opinion_id"]);
				var goodcount = hukidashi.find(".goodcount");
				var goodchar = hukidashi.find(".goodchar");
				goodcount.html(content[i]["count"]);
				//fs=14+content[i]['count'];
				//tmp[0].style.fontSize=fs+"pt";
				if(content[i]['liked_users'].includes(my_id) && Number(content[i]["count"])>0){
					//alert("my user id is included");
					goodcount.css("color","crimson");
					goodchar.css("color","crimson");
				}
			}
		}
		else if(like_type == "video"){
			//videoに対するlikeあるいはdislike
			for(var i=0;i<content.length;i++){
				if(content[i]['id'] > max_id){
					max_id = content[i]['id'];
					connection_info.SetLastRoughLikeId(max_id);
				}
				if(content[i]['type']=="like"){
					tweet("いいね");
				}
				else if(content[i]['type']=="dislike"){
					tweet("うーん");
				}
				else if(content[i]['type']=="question"){
					tweet("?");
				}

			}
		}
		break;
	case 'get_adopted_opinions':

		//contentは以下の情報を含む
		//opinion_id
		//type:sent_to_tt(ターンテイカーへ意見が送信されたとき) or sent_to_robot(ロボットへ意見を述べるコマンドが送信されたとき)
		var max_id = 0;
		var initial_max_id = connection_info.GetLastAdoptedOpinionId();
		console.log("initial_id_max:"+initial_max_id);
		for(var i=0;i<content.length;i++){
			if(content[i]['id'] > max_id){
				max_id = content[i]['id'];
				connection_info.SetLastAdoptedOpinionId(max_id);
			}
			//if(initial_max_id != 0){
			var command_type = content[i]['type'];
			if(command_type == "sent_to_tt"){
				var tmp = $("#hukidashi-"+content[i]['opinion_id']);
				if(!tmp.length){
					tmp = $("#"+my_id);
					tmp.attr("id","hukidashi-"+content[i]['opinion_id']);
				}
				//alert(tmp.html());


				tmp.addClass("now_adopted");
				tmp.addClass("adopted");
				SetRobotStatePicture("waiting");
				$(".hukidashi:not(.now_adopted)").fadeTo("slow",0.33);
				tmp.removeClass("now_adopted");
				$(".hukidashi").find(".btn-like").prop("disabled",true);
				$(".btn-say-directly").prop("disabled",true)
				$(".btn-post").prop("disabled",true);
				erase_flag = true;
				window.setTimeout(function(){
					SetRobotStatePicture("saying");
					window.setTimeout(function(){
						SetRobotStatePicture("default");
						$(".hukidashi:not(.adopted)").fadeTo("fast",1);
						$(".hukidashi:not(.adopted)").find(".btn-like").prop("disabled",false);
						$(".btn-say-directly").prop("disabled",false)
						$(".btn-post").prop("disabled",false);
						//tmp.css("background-color","#eee");
						tmp.fadeTo("fast",0.33);
						erase_flag = false;
					},5000);
				},500);

				//send_to_robotがもらえなかった場合，１０秒で意見を消す．
				//20170928デバッグ用に5秒に変更
				//$(tmp).effect("bounce","",300);

				//test用に一定時間後に元に戻す消すようにしている 2017/6/20
				//本来は、ロボットの実行が終わったことを検知してから、元に戻す処理を行うべき
				//window.setTimeout("ResetAdoptedEffect()", 2000);
				//window.setTimeout("EraseAllOpinions()",2000);
			}
			else if(command_type == "sent_to_robot"){
				if(erase_flag){
					SetRobotStatePicture("saying");
					//alert("Erase all opinions");
					window.setTimeout("EraseAllOpinions()",3500);
					erase_flag = false;
				}
			}
		}
		break;
	case 'get_thr':
		//alert(content);
		adopted_thr=content;
		//alert(adopted_thr);
		$(".admin-setting input[name=threshold]").val(adopted_thr);
		//alert("adopted_thr="+adopted_thr);
		break;
	case 'change_thr':
		//alert(content);
		//adopted_thr=content;
		alert("new_adopted_thr="+content);
		break;
	default:break;
	}
}

function SendToRobot(){
	if(erase_flag){
		//ロボットの画像を変える（発話中）
		//alert("Erase all opinions");
		SetRobotStatePicture("saying");
		window.setTimeout(function(){
			SetRobotStatePicture("default");
			$(".hukidashi").fadeTo("fast",1);
		},5000);
		//window.setTimeout("EraseAllOpinions()",1000);
		erase_flag = false;
	}
}


//AjaxPostを行うメソッド
function AjaxPost(parameters){
	var data = {
			//user_id:icon_id,
			user_name: my_user_name,
			room: my_room,
			//user_id: my_user_id,
   	        command: parameters.command,
   	        opinion: parameters.opinion,
   	        last_id: parameters.last_id,
   	        opinion_id:parameters.opinion_id,
   	        last_like_id:parameters.last_like_id,
   	        opinion_type:parameters.opinion_type,
   	        last_adopted_opinion_id:parameters.last_adopted_opinion_id,
   	        last_rough_like_id:parameters.last_rough_like_id,
   	        last_thr:parameters.last_thr
   	};
	//shimaya180418
	//console.log("PARAMETERS:"+JSON.stringify(parameters));
    $.ajax({
            url: "controller/AccessMe.php",
            type: "POST",
            data: JSON.stringify(data),
            //processData: false,
            contentType: "application/json",
            dataType:"json"

        })
        .done(function( data ) {
        	//shimaya180418
	      	//alert("done2"+parameters.command+":"+parameters.content);
	        var json_string = JSON.stringify(data);
	      	var obj = JSON.parse(json_string);
	      	connection_info.UpdateConnectionKeyByGettingDataFromServer(parameters.command);
	      	console.log("RECIEVED DATA:"+json_string);
	      	ProcessResult(parameters.command,obj["content"]);
        })
        .fail(function(data) {
        	console.log("error:"+data);
        });
    return false;
}

//Ajaxポストをする関数を管理するクラス
var AjaxGateway = function(){

	this.Login = function(){
		var param = new PostParameters();
		param.SetCommand("log_in");
		AjaxPost(param);
	}

	this.Logout = function(){
		var param = new PostParameters();
		param.SetCommand("log_out");
		AjaxPost(param);
	}

	this.SendOpinion = function(opinion, opinion_type){
		var param = new PostParameters();
		param.SetCommand("add_opinion");
		param.SetOpinion(opinion);
		param.SetOpinionType(opinion_type);
		AjaxPost(param);
	}

	this.SendSay = function(opinion, opinion_type){
		var param = new PostParameters();
		param.SetCommand("send_say");
		param.SetOpinion(opinion);
		param.SetOpinionType(opinion_type);
		AjaxPost(param);
	}

	this.SendTweet = function(opinion){
		var param = new PostParameters();
		param.SetCommand("add_opinion");
		param.SetOpinion(opinion);
		param.SetOpinionType("tweet");
		AjaxPost(param);
	}

	this.SendLikedTweet = function(opinion,opinion_id){
		var param = new PostParameters();
		param.SetCommand("add_opinion");
		param.SetOpinion(opinion);
		param.SetOpinionId(opinion_id);
		param.SetOpinionType("liked_tweet");
		AjaxPost(param);
	}

	this.GetOpinions = function(){
		var param = new PostParameters();
		param.SetCommand("get_opinions");
		param.SetLastId(connection_info.GetLastOpinionId());
		AjaxPost(param);
	}

	this.GetActiveUserNames = function(){
		var param = new PostParameters();
		param.SetCommand("get_active_user_names");
		AjaxPost(param);
	}

	this.GetUserId = function(){
		var param = new PostParameters();
		param.SetCommand("get_user_id");
		AjaxPost(param);
	}

	this.SendLike = function(opinion_id){
		var param = new PostParameters();
		param.SetCommand("add_like");
		param.SetOpinionId(opinion_id);
		AjaxPost(param);
	}

	this.CancelLike = function(opinion_id){
		var param = new PostParameters();
		param.SetCommand("delete_like");
		param.SetOpinionId(opinion_id);
		AjaxPost(param);
	}

	this.GetLikes = function(){
		var param = new PostParameters();
		param.SetCommand("get_likes");
		param.SetLastLikeId(connection_info.GetLastLikeId());
		param.SetLastRoughLikeId(connection_info.GetLastRoughLikeId());
		AjaxPost(param);
	}

	this.GetAdoptedOpinions = function(){
		var param = new PostParameters();
		param.SetCommand("get_adopted_opinions");
		param.SetLastAdoptedOpinionId(connection_info.GetLastAdoptedOpinionId());
		AjaxPost(param);
	}

	this.SendLikeForVideo = function(){
		var param = new PostParameters();
		param.SetCommand("send_rough_like");
		AjaxPost(param);
	}

	this.SendDislikeForVideo = function(){
		var param = new PostParameters();
		param.SetCommand("send_rough_dislike");
		AjaxPost(param);
	}

	this.SendQuestionForVideo = function(){
		var param = new PostParameters();
		param.SetCommand("send_rough_question");
		AjaxPost(param);
	}

	this.GetThr = function(){
		var param = new PostParameters();
		param.SetCommand("get_thr");
		AjaxPost(param);
	}

	this.ChangeThr = function(thr){
		var param = new PostParameters();
		param.SetCommand("change_thr");
		param.SetLastThr(thr);
		//alert("change_thr in rvs.js");
		AjaxPost(param);
	}

}


//Post用パラメータ
var PostParameters = function(){
	this.command = "";
	this.opinion = "";
	this.last_id = "";
	this.opinion_id = "";
	this.last_like_id = "";
	this.opinion_type = "";
	this.last_adopted_opinion_id = "";
	this.last_rough_like_id = "";
	this.last_thr = "";
	this.last_user_name_id = "";

	this.SetCommand = function(command){
		this.command  = command;
	}
	this.SetOpinion = function(opinion){
		this.opinion = opinion;
	}
	this.SetLastId = function(last_id){
		this.last_id = last_id;
	}
	this.SetOpinionId = function(opinion_id){
		this.opinion_id = opinion_id;
	}
	this.SetLastLikeId = function(last_like_id){
		this.last_like_id = last_like_id;
	}
	this.SetOpinionType = function(opinion_type){
		this.opinion_type = opinion_type;
	}
	this.SetLastAdoptedOpinionId = function(last_adopted_opinion_id){
		this.last_adopted_opinion_id = last_adopted_opinion_id;
	}
	this.SetLastRoughLikeId = function(last_like_id){
		this.last_rough_like_id = last_like_id;
	}
	this.SetLastThr = function(last_thr){
		this.last_thr = last_thr;
	}
	this.SetLastUserNameId = function(last_user_name_id){
		this.last_user_name_id = last_user_name_id;
	}
}



function tweet(input, tweet_id){
	var obj = {

			//基本情報が設定できます
			"base":{
				color:"white", //文字の色を指定します
				speed:"slow", //文字が流れるスピードを指定します。slow/fast/normal
				interval:"fast",//文字が流れる間隔を指定します。slow/fast/normal
				font_size:"30px", //フォントのサイズを指定します。
				loop:false //文字が最後まで流れた後に、繰り返すかどうか　true/false

			},

			//ここに、重ねるコメントを登録します。個数制限はありません。
			"comments":[
				//"sayounara",
				//"douitashimashite",
				input
			]
		};

		nicoscreen.set(obj);
		nicoscreen.start();
		//ツイートにopinion_idを付加する．
		$('#nicoscreen div:last-child').addClass("opinion_id="+tweet_id);


}

function ResetAdoptedEffect(){
	$(".chat-box").fadeTo("slow",1);
}

function EraseAllOpinions(){
	//意見を消す
	$(".chat-box").fadeOut(1000).queue(function(){
		$(this).remove();
		//ロボットの画像をデフォルト状態に戻す
		//$("#robot_state_picture").attr("src","pict/1.png");
		window.setTimeout('SetRobotStatePicture("default");',4000) //SetRobotStatePicture("default");
	});
}

function GetIconPath(userid){
	var icon="pict/1.png";
	if(userid=="ichigo")icon="pict/ichigo.png";
	else if(userid=="budou")icon="pict/budou.png";
	else if(userid=="banana")icon="pict/banana.png";
	else if(userid=="sumomo")icon="pict/sumomo.png";
	else if(userid=="ringo")icon="pict/ringo.png";
	else if(userid=="tweet")icon="pict/twitter_bird.png";
	else if(userid=="liked_tweet")icon="pict/Tweet.png";
	else if(userid=="move_back")icon="pict/arrow-left.png";
	else if(userid=="stay")icon="pict/stop.png";
	else if(userid=="move_next")icon="pict/arrow-right.png";
	else if(userid=="summarize")icon="pict/check.png";
	else if(userid=="let_me_talk")icon="pict/good.png";
	else if(userid=="talk_freely")icon="pict/asterisk.png";
	else if(userid=="let_others_talk")icon="pict/hand-right.png";
	else if(userid=="ask")icon="pict/hatena.png";
	else{
		var initial=userid.charAt(0).toUpperCase();
		icon="pict/"+initial+".png";
		//alert(initial+":"+userid+":"+icon);
		//if(!txt.match(/[^a-z]/gi))

	}

	return icon;
}

function SetRobotStatePicture(state){
	//path="pict/robotDefaultState.png";
	path="pict/robotDefaultStateWithText.png";
	if(state=="default"){
		//path="pict/robotDefaultState.png";
		path="pict/robotDefaultStateWithText.png";
	}
	else if(state=="saying"){
		//path="pict/robotSayingState.png";
		path="pict/robotSayingStateWithText.png";
	}
	else if(state=="waiting"){
		//path="pict/robotWaitingState.png";
		path="pict/robotWaitingStateWithText.png";
	}
	else path=state;
	$("#robot_state_picture").attr("src",path);

	//SetRobotStateText(state);
	//SetRobotStateText("hide");
}

function SetRobotStateText(state){
	if(state=="default"){
		$(".robotstate-listening").show();
		$(".robotstate-waiting").hide();
		$(".robotstate-saying").hide();
	}else if(state=="waiting"){
		$(".robotstate-listening").hide();
		$(".robotstate-waiting").show();
		$(".robotstate-saying").hide();
	}else if(state=="saying"){
		$(".robotstate-listening").hide();
		$(".robotstate-waiting").hide();
		$(".robotstate-saying").show();
	}else if(state=="hide"){
		$(".robotstate-listening").hide();
		$(".robotstate-waiting").hide();
		$(".robotstate-saying").hide();
	}
}



