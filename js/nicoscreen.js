/*
 * NicoScreen, version: 0.1 (2011-07-11)
 *
 *
 * For usage and examples, visit:
 * http://nicoscreen.r9game.com
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2011, Shikemoku.MK (shikemoku.mk -[at]- gmail [*dot*] com)
 */

function nicoscreenobj(o) {
  var f = nicoscreenobj.f, i, len, n, prop;
  f.prototype = o;
  n = new f;
  for (i=1, len=arguments.length; i<len; ++i)
    for (prop in arguments[i])
      n[prop] = arguments[i][prop];
  return n;
}
nicoscreenobj.f = function(){};

var r9 = {};
r9.NicoScreen = {



	env : {

		color:"white",
		interval:500,
		speed:6500,
		font_size:"24px",
		loop:true,

		height:"",
		width:""

	},

	top_pos:20,
	draw_index:0,
	comments:[],

	set:function(o){

		this.comments = o.comments;

		if(o.base.color){
			this.env.color = o.base.color;
		}

		//console.log("this.env.loop:"+this.env.loop+",o.base.loop:"+o.base.loop);
		//ifがあるとo.base.loop=falseのときifの中に入れないので消した．
		//if(o.base.loop){
			this.env.loop = o.base.loop;
		//}

		if(o.base.interval){
			switch(o.base.interval){
			case "fast":
				this.env.interval=3000;
				break;
			case "slow":
				this.env.interval=9500;
				break;
			}
		}

		if(o.base.font_size){
			this.env.font_size = o.base.font_size;
		}

		if(o.base.speed){
			switch(o.base.speed){
			case "fast":
				this.env.speed=4000;
				break;
			case "slow":
				this.env.speed=10000;
				break;
			}
		}

	},

	start : function(){

		var elm = $("#nicoscreen");
		this.elm = elm;
		this.elm.css("position", "relative");
		this.elm.css("border", "solid 1px gray");
		this.elm.css("overflow", "hidden");
		this.elm.bind("selectstart",function(){return false;});
		this.elm.bind("mousedown",function(){return false;});


		this.env.width = ""+elm.css("width");
		this.env.height = ""+elm.css("height");

		this.env.width = this.env.width.replace("px","");
		this.env.height = this.env.height.replace("px","");

		//loop=falseのとき,再びdrawするために必要
		this.draw_index=0;

		//console.log(this.env.width);

		//setIntervalだとループしてしまう．

		//var inid = setInterval("nicoscreen.draw(null)", this.env.interval);
		nicoscreen.draw(null);
	},

	draw: function(str){
		var n = nicoscreen;

		var i = n.draw_index;
		var comment_str =  "";
		console.log("n.comments.length:"+n.comments.length+",n.draw_index:"+n.draw_index);

		if(str){
			comment_str = str;
			i=parseInt((new Date)/1000);
		}else{

			if (n.draw_index >= n.comments.length) {
				console.log("n.env.loop:"+n.env.loop);
				if(n.env.loop) n.draw_index = 0;
				return false;
			}
			comment_str = n.comments[i];
			n.draw_index++;
		}
		//文字の下が切れることがあるため0.9をかけた
		n.top_pos =  Math.floor( Math.random() * parseInt(n.env.height)*0.9 );


		var end_left = (parseInt(n.env.width)) * -1;
		//leftが下で使われているのに存在していなかったので追記
		var left = (parseInt(n.env.width));


		var cmid = "cm" + i + "";

		//ボタンの上に文字が重ならないようにするため，z-indexを1にした．コメントに対するクリックを感知するため，nico-commentクラスを追加した
		//var com_obj = $("<div id='" + cmid + "' style='left:" + n.env.width + "px; position:absolute;top:" + n.top_pos + "px;color:"+n.env.color+";font-size:"+n.env.font_size+";font-weight:bold;text-shadow: black 1px 1px 1px;width:100%;z-index:99999;cursor:default'>" + comment_str + "</div>");
		var com_obj = $("<div id='" + cmid + "' class='nico-comment' style='left:" + n.env.width + "px; position:absolute;top:" + n.top_pos + "px;color:"+n.env.color+";font-size:"+n.env.font_size+";font-weight:bold;text-shadow: black 1px 1px 1px;width:100%;z-index:1;cursor:default'>" + comment_str + "</div>");

		$("#nicoscreen").append(com_obj);

		(function(that){
			//console.log("left:end_left:"+left+","+end_left);
			var tmp_cmid = cmid;
			com_obj.animate({
				left: end_left

			}, {
				duration: n.env.speed,
				complete: function(){
					var elm_id = "#" + tmp_cmid;
					$("#nicoscreen").remove(elm_id);
					//$(elm_id).fadeOut("slow");
					that.top_pos = 10;
				}

			});
		})(this);




	},


	add:function(str){
		this.draw(str);
	}


};

var nicoscreen = nicoscreenobj(r9.NicoScreen);

