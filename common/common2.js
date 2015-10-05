var VERSION = "2015/09/19-17:12";

function oButton(img, x, y, func) {
	this.img = img;
	this.x = x;
	this.y = y;
	try {
		this.w = this.img[0].Width;
		this.h = this.img[0].Height;
	} catch(e) {
		this.w = 0;
		this.h = 0;
	};
	this.state = ButtonStates.normal;

	this.onClick = function() {
		func && func();
	};

	this.draw = function(gr) {
		try {
			this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, 255);
		} catch(e) {};
	};

	this.update = function(img) {
		this.img = img;
		this.w = this.img[0].Width;
		this.h = this.img[0].Height;
	};

	this.setPos = function(x, y) {
		this.x = x;
		this.y = y;
	};

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w + 1, this.h + 1);
	};

	this.checkState = function(event, x, y) {
		this.isHover = (x > this.x && x < this.x + this.w - 1 && y > this.y &&  y < this.y + this.h - 1);
		this.oldState = this.state;
		switch (event) {
			case 'down':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.down : ButtonStates.normal;
						break;
				}
				break;
			case 'up':
				this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
				break;
			case 'right':
				break;
			case 'move':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
						break;
				}
				break;
			case 'leave':
				this.state = this.isDown ? ButtonStates.down : ButtonStates.normal;
				break;
		}
		if (this.state !== this.oldState) this.repaint();
		return this.state;
	};
};

function Button(img_normal, img_hover, img_down) {
	this.img = [img_normal, img_hover, img_down];
	this.w = this.img[0].Width;
	this.h = this.img[0].Height;
	this.state = ButtonStates.normal;

	this.update = function (img_normal, img_hover, img_down) {
		this.img = [img_normal, img_hover, img_down];
		this.w = img_normal.Width;
		this.h = img_hover.Height;
	};
	this.draw = function(gr, x, y, alpha) {
		this.x = x;
		this.y = y;
		this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha || 255);
	};
	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w+1, this.h+1);
	};
	this.checkState = function(event, x, y) {
		this.isHover = (x > this.x && x < this.x + this.w - 1 && y > this.y &&  y < this.y + this.h - 1);
		this.oldState = this.state;
		switch (event) {
			case 'down':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.down : ButtonStates.normal;
						break;
				}
				break;
			case 'up':
				this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
				break;
			case 'right':
				break;
			case 'move':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
						break;
				}
				break;
			case 'leave':
				this.state = this.isDown ? ButtonStates.down : ButtonStates.normal;
				break;
		}
		if (this.state !== this.oldState) this.repaint();
		return this.state;
	}
}



String.prototype.trim=function(s){return this.replace(/^[\s　]*|[\s　]*$/g,"");};
String.prototype.validate=function(){return this.replace(/[\/\\|:]/g,'-').replace(/\*/g,'x').replace(/"/g,"''").replace(/[<>]/g,'_').replace(/\?/g,"");};
String.prototype.ucfirst=function(){return this.charAt(0).toUpperCase()+this.substr(1);};
Array.prototype.unique=function(){var arr=this;if(arr.length>0){for(var i=0;i<arr.length;i++){for(var j=i+1;j<arr.length;j++){if(arr[i]===arr[j]){arr.splice(j,1);j-=1;}}}}return arr;};

function console(s){fb.trace(s);};
function caller(){var caller=/^function\s+([^(]+)/.exec(arguments.callee.caller.caller);if(caller)return caller[1];else return 0;};

function GetStrWidth(str,font,type){var temp_gr=gdi.CreateImage(1,1);var g=temp_gr.GetGraphics();var ret;switch(type){case 1:ret=Math.ceil(g.MeasureString(str,font,0,0,0,0).Width);break;case 0:default:ret=Math.ceil(g.CalcTextWidth(str,font));break;};temp_gr.ReleaseGraphics(g);temp_gr.Dispose();return ret;}

function GetFBWnd(){return utils.CreateWND(window.ID).GetAncestor(2);}
function InputBox(caption,promp,defval,num_only){return GetFBWnd().InputBox(caption,promp,defval,num_only);}
function MsgBox(caption,promp,type){return GetFBWnd().MsgBox(caption,promp,type);}
function FileDialog(mode, title, filetype, deftext) {
	return GetFBWnd().FileDialog(mode, title, filetype, deftext);
}

function $(field,metadb){return metadb?fb.TitleFormat(field).EvalWithMetadb(metadb):"";}

function FormatTracksLength(c){if(c>0){var e,a,b,d;e=Math.floor(c/86400);a=Math.floor((c%86400)/3600);b=Math.floor(((c%86400)%3600)/60);d=Math.round(((c%86400)%3600)%60);e=e>1?e+" days ":(e>0?e+" day ":"");a=a>1?a+" hours ":(a>0?a+" hour ":"");b=b>1?b+" minutes ":(b>0?b+" minute ":"");d=d>1?d+" seconds ":(d>0?d+" second ":"");return e+a+b+d}else{return null}};

function StringFormat(){var h_align=0,v_align=0,trimming=0,flags=0;switch(arguments.length){case 4:flags=arguments[3];case 3:trimming=arguments[2];case 2:v_align=arguments[1];case 1:h_align=arguments[0];break;default:return 0;};return((h_align<<28)|(v_align<<24)|(trimming<<20)|flags);}
function RGBA(r,g,b,a){return((a<<24)|(r<<16)|(g<<8)|(b));}
function RGB(r,g,b){return(0xff000000|(r<<16)|(g<<8)|(b));}
function toRGB(d){var d=d-0xff000000;var r=d>>16;var g=d>>8&0xFF;var b=d&0xFF;return[r,g,b];};
function blendColors(c1,c2,factor){var c1=toRGB(c1);var c2=toRGB(c2);var r=Math.round(c1[0]+factor*(c2[0]-c1[0]));var g=Math.round(c1[1]+factor*(c2[1]-c1[1]));var b=Math.round(c1[2]+factor*(c2[2]-c1[2]));return(0xff000000|(r<<16)|(g<<8)|(b));};

function getAlpha(color) {
	return ((color >> 24) & 0xff);
}

function getRed(color) {
	return ((color >> 16) & 0xff);
}

function getGreen(color) {
	return ((color >> 8) & 0xff);
}

function getBlue(color) {
	return (color & 0xff);
}

function setAlpha(color, a) {
	return ((color & 0x00ffffff) | (a << 24));
}


function sqrt(a){return Math.sqrt(a);}
function pow(a,b){return Math.pow(a,b);}

function Luminance(color){color=toRGB(color);return(0.2126*color[0]+0.7152*color[1]+0.0722*color[2])/255.0;}

function numericAscending(a,b){return(a-b);}
function numericDescending(a,b){return(b-a);}


// TODO: 
// * check safe mode
// * check components

var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_VCENTER = 0x00000004;
var DT_WORDBREAK = 0x00000010;
var DT_CALCRECT = 0x00000400;
var DT_NOPREFIX = 0x00000800;
var DT_END_ELLIPSIS = 0x00008000;
var DT_SINGLELINE = 0x00000020;

var MF_GRAYED = 0x00000001;
var MF_STRING = 0x00000000;
var MF_POPUP = 0x00000010;

var IDC_ARROW = 32512;
var IDC_HAND = 32649;

var DLGC_WANTALLKEYS = 0x0004; /* Control wants all keys           */

var FontStyle={Regular:0,Bold:1,Italic:2,BoldItalic:3,Underline:4,Strikeout:8};
var StringTrimming={None:0,Character:1,Word:2,EllipsisCharacter:3,EllipsisWord:4,EllipsisPath:5};
var StringFormatFlags={DirectionRightToLeft:1,DirectionVertical:2,NoFitBlackBox:4,DisplayFormatControl:32,NoFontFallback:1024,MeasureTrailingSpaces:2048,NoWrap:4096,LineLimit:8192,NoClip:16384};
var TextRenderingHint={SystemDefault:0,SingleBitPerPixelGridFit:1,SingleBitPerPixel:2,AntiAliasGridFit:3,AntiAlias:4,ClearTypeGridFit:5};
var SmoothingMode={Invalid:-1,Default:0,HighSpeed:1,HighQuality:2,None:3,AntiAlias:4};
var InterpolationMode={Invalid:-1,Default:0,LowQuality:1,HighQuality:2,Bilinear:3,Bicubic:4,NearestNeighbor:5,HighQualityBilinear:6,HighQualityBicubic:7};
var PlaybackOrder={Default:0,Repeat:1,Repeat1:2,Random:3,ShuffleT:4,ShuffleA:5,ShuffleF:6};
var AlbumArtId={front:0,back:1,disc:2,icon:3,artist:4};
var ColorTypeDUI={text:0,background:1,highlight:2,selection:3};
var ColorTypeCUI={text:0,selection_text:1,inactive_selection_text:2,background:3,selection_background:4,inactive_selection_background:5,active_item_frame:6};
var FontTypeCUI={items:0,labels:1};
var FontTypeDUI={defaults:0,tabs:1,lists:2,playlists:3,statusbar:4,console:5};
var ButtonStates = {normal: 0, hover: 1, down: 2};


