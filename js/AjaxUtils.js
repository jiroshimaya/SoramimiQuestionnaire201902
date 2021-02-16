var timer_id;
var like_timer_id;
var isFirst = true;
var onLoad = true;
var user_name = "";


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
	switch(command){
	case "log_in":
		break;
	case "log_out":
		break;
	case "add_reaction":
		break;w
	case "get_reaction":

		break;
	case 'add_opinion':
		break;
	case 'get_twomin_reactions':
		//contentは以下の情報を含む
		//like : likeの数
		//question : questionの数

		//display.html内の関数を実行する
		appendTwominCount(content);
		break;
	case 'get_total_reactions':
		//contentは以下の情報を含む
		//like : likeの数
		//question : questionの数

		//display.html内の関数を実行する
		updateTotalCount(content);
		break;
	case 'fix_old_reactions':
		break;
	case 'get_opinions':
		updateCommentList(content);
		/*
		*/

		break;
	case 'get_user_id':
		my_id=content;
		//alert(my_id);
        break;
	case 'get_active_user_names':
		//alert(JSON.stringify(content));
		updateUserList(content);
		break;
	case 'set_presentation':
		break;
	case 'get_presentation':
		updatePresentation(content);
		break;
	case 'set_room':
		break;

	default:break;
	}
}



//AjaxPostを行うメソッド
function AjaxPost(parameters){
	var data = {
			//user_id:icon_id,
			user_name:user_name,
   	        command: parameters.command,
   	        opinion: parameters.opinion,
   	        last_id: parameters.last_id,
   	        opinion_id:parameters.opinion_id,
   	        last_like_id:parameters.last_like_id,
   	        opinion_type:parameters.opinion_type,
   	        last_adopted_opinion_id:parameters.last_adopted_opinion_id,
   	        last_rough_like_id:parameters.last_rough_like_id,
   	        last_thr:parameters.last_thr,
   	        order: parameters.order,
   	        room: parameters.room,
   	        presentation: parameters.presentation,
   	        song: parameters.song,
   	        original: parameters.original,
   	        soramimi: parameters.soramimi,
   	        elapsed_time: parameters.elapsed_time
   	};
	//shimaya180418
	//alert(JSON.stringify(data));
    $.ajax({
            url: "php/AccessMe.php",
            type: "POST",
            data: JSON.stringify(data),
            //processData: false,
            contentType: "application/json",
            dataType:"json"
        })
        .done(function( data ) {
        	var json_string = JSON.stringify(data);
	      	var obj = JSON.parse(json_string);
	      	console.log(json_string);

	      	//connection_info.UpdateConnectionKeyByGettingDataFromServer(parameters.command);
	      	ProcessResult(parameters.command,obj["content"]);
        })
        .fail(function(XMLHttpRequest, textStatus, errorThrown){
            console.log("ajax通信に失敗しました");
            console.log("XMLHttpRequest : " + XMLHttpRequest.responseText);
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus     : " + textStatus);
            console.log("errorThrown    : " + errorThrown.message);
        })
    return false;
}




//Ajaxポストをする関数を管理するクラス
var AjaxGateway = function(){

	this.Login = function(){
		var param = new PostParameters();
		param.SetCommand("log_in");
		AjaxPost(param);
	}

	this.LoginWithUsername = function(username){
		var param = new PostParameters();
		param.SetCommand("log_in");
		param.SetUsername(username);
		AjaxPost(param);
	}

	this.Logout = function(){
		var param = new PostParameters();
		param.SetCommand("log_out");
		AjaxPost(param);
	}

	this.SendOpinion = function(opinion){
		var param = new PostParameters();
		param.SetCommand("add_opinion");
		param.SetOpinion(opinion);
		AjaxPost(param);
	}

	this.GetOpinions = function(last_id=0){
		var param = new PostParameters();
		param.SetCommand("get_opinions");
		//param.SetLastId(connection_info.GetLastOpinionId());
		param.SetLastId(last_id);
		AjaxPost(param);
	}

	this.GetUserId = function(){
		var param = new PostParameters();
		param.SetCommand("get_user_id");
		AjaxPost(param);
	}

	this.SendLike = function(){
		var param = new PostParameters();
		param.SetCommand("add_like");
		AjaxPost(param);
	}

	this.SendQuestion = function(){
		var param = new PostParameters();
		param.SetCommand("add_question");
		AjaxPost(param);
	}

	this.GetTwominReactions = function(){
		var param = new PostParameters();
		param.SetCommand("get_twomin_reactions");
		AjaxPost(param);
	}

	this.GetTotalReactions = function(){
		var param = new PostParameters();
		param.SetCommand("get_total_reactions");
		AjaxPost(param);
	}

	this.GetTwominReactions = function(){
		var param = new PostParameters();
		param.SetCommand("get_twomin_reactions");
		AjaxPost(param);
	}

	this.GetTotalReactions = function(){
		var param = new PostParameters();
		param.SetCommand("get_total_reactions");
		AjaxPost(param);
	}

	this.SetRoom = function(){
		var param = new PostParameters();
		param.SetCommand("set_room");
		AjaxPost(param);
	}

	this.SendPresentation = function(presentation){
		var param = new PostParameters();
		param.SetCommand("set_presentation");
		param.SetPresentation(presentation);
		AjaxPost(param);
	}

	this.GetPresentation = function(){
		var param = new PostParameters();
		param.SetCommand("get_presentation");
		AjaxPost(param);
	}

	this.GetActiveUserNames = function(){
		var param = new PostParameters();
		param.SetCommand("get_active_user_names");
		AjaxPost(param);
	}

	this.SendFunny = function(original,soramimi,elapsedtime,song){
		var param = new PostParameters();
		param.SetCommand("add_laugh");
		param.SetLyrics(original,soramimi);
		param.SetElapsedTime(elapsedtime);
		param.SetSong(song);
		AjaxPost(param);
	}
}


//Post用パラメータ
var PostParameters = function(){
	this.command = "";
	this.opinion = "";
	this.user_name = "";
	this.last_id = "";
	this.opinion_id = "";
	this.last_like_id = "";
	this.opinion_type = "";
	this.last_adopted_opinion_id = "";
	this.last_rough_like_id = "";
	this.last_thr = "";
	this.order = "";
	this.room = "";
	this.presentation = "";
	this.original = "";
	this.soramimi = "";
	this.elapsed_time = "";
	this.song = "";

	this.SetCommand = function(command){
		this.command  = command;
	}
	this.SetOpinion = function(opinion){
		this.opinion = opinion;
	}
	this.SetUsername = function(user_name){
		this.user_name = user_name;
	}
	this.SetOrder = function(order){
		this.order = order;
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
	this.SetRoom = function(room){
		this.last_thr = room;
	}
	this.SetPresentation = function(presentation){
		this.presentation = presentation;
	}
	this.SetSong = function(song){
		this.song = song;
	}
	this.SetLyrics = function(original,soramimi){
		this.original = original;
		this.soramimi = soramimi;
	}
	this.SetElapsedTime = function(elapsedtime){
		this.elapsed_time = elapsedtime;
	}

}

//サーバーへのajax通信に必要な情報を管理するクラス
var ConnectionInfo = function(last_opinion_id,last_like_id){

	this.last_opinion_id = last_opinion_id;
	this.last_like_id = 0;
	this.reaccess_key = true;
	this.like_reaccess_key = true;
	this.last_adopted_opinion_id = 0;
	this.adopted_opinion_reaccess_key = true;
	this.active_user_name_reaccess_key = true;
	this.last_rough_like_id = 0;
	//this.last_user_name_id = 0;

	this.SetLastOpinionId = function(id){
		this.last_opinion_id = id;
	}
	this.GetLastOpinionId = function(){
		return this.last_opinion_id;
	}
	this.SetLastLikeId = function(id){
		this.last_like_id = id;
	}
	this.GetLastLikeId = function(){
		return this.last_like_id;
	}
	this.SetReaccessKey = function(flag){
		this.reaccess_key = flag;
	}
	this.SetLikeReaccessKey = function(flag){
		this.like_reaccess_key = flag;
	}
	this.SetLastAdoptedOpinionId = function(id){
		this.last_adopted_opinion_id = id;
	}
	this.GetLastAdoptedOpinionId = function(){
		return this.last_adopted_opinion_id;
	}
	this.SetAdoptedOpinionReaccessKey = function(flag){
		this.adopted_opinion_reaccess_key = flag;
	}
	this.SetLastRoughLikeId = function(id){
		this.last_rough_like_id = id;
	}
	this.GetLastRoughLikeId = function(){
		return this.last_rough_like_id;
	}
	this.SetLastUserNameId = function(id){
		this.last_user_name_id = id;
	}
	this.GetLastUserNameId = function(){
		return this.last_user_name_id;
	}
	this.SetActiveUserNameReaccessKey = function(flag){
		this.user_name_reaccess_key = flag;
	}

	//サーバーからデータが帰ってきたときに、コマンドに応じて再接続用フラグを更新する
	this.UpdateConnectionKeyByGettingDataFromServer = function(command){
		switch(command){
		case 'get_opinions':
			this.reaccess_key = true;
			break;
		case 'get_likes':
			this.like_reaccess_key = true;
			break;
		case 'get_adopted_opinions':
			this.adopted_opinion_reaccess_key = true;
			break;
		case 'get_active_user_names':
			this.adopted_opinion_reaccess_key = true;
			break;
		default:break;
		}
	}
}

