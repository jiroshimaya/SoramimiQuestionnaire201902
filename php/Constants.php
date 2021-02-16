<?php
#定数管理用クラス
class Constants{
	public static $COOKIE_USERID = "user_id";

	public static $STATUS_FAILED = "failed";
	public static $STATUS_SUCCESS = "success";

	public static $MESSAGE_SUCCESS = "success";
	public static $MESSAGE_101 = "ポストパラメータが不十分です。";
	public static $MESSAGE_102 = "ポーリング処理がタイムアウトしました。";

	public static $MAXTIME_POLLING = 10;
	public static $BB_IP =  "192.168.1.117";
	//public static $BB_IP =  "127.0.0.1";

	public static $BB_PORT = 11000;

	public static $OPINION_TYPE_REGULAR = "regular";
	public static $OPINION_TYPE_TWEET = "tweet";
	public static $OPINION_TYPE_STAY = "stay";
	public static $OPINION_TYPE_MOVEBACK = "move_back";
	public static $OPINION_TYPE_MOVENEXT = "move_next";
	public static $OPINION_TYPE_DISAGREE = "disagree";
	public static $OPINION_TYPE_AGREE = "agree";
	public static $OPINION_TYPE_SUMMARIZE = "summarize";
	public static $OPINION_TYPE_FREE = "talk_freely";
	public static $OPINION_LET_ME_TALK = "let_me_talk";
	public static $OPINION_LET_OTHERS_TALK = "let_others_talk";
	public static $OPINION_TYPE_LIKED_TWEET = "liked_tweet";
	//added by shimaya 2017171206
	public static $OPINION_TYPE_ASK = "ask";

	public static $DammyUsers = array("ichigo","budou","banana","sumomo","ringo");

	public static $ADOPTED_THR = 2;
	public static $VIDEO_LIKE_THR = 5;
	public static $VIDEO_DISLIKE_THR = 5;
	public static $VIDEO_QUESTION_THR = 5;

	public static $REACTION_LIKE = "like";
	public static $REACTION_QUESTION = "question";
	public static $REACTION_LAUGH = "laugh";


}