// vim:set ft=javascript et:

//Tooltip
var TOOLTIP_PADDING_LEFT = 15;
var TOOLTIP_PADDING_TOP = 3;
var TOOLTIP_PADDING_RIGHT = 4;
var TOOLTIP_PADDING_BOTTOM = 8;
var TOOLTIP_TEXT_PADDING_LEFT = 6;
var TOOLTIP_TEXT_PADDING_TOP = 2;
var TOOLTIP_TEXT_PADDING_RIGHT = 6;
var TOOLTIP_TEXT_PADDING_BOTTOM = 2;


var TimerMgr = new function(){
    this.timer = null;
    //this.interval = itv;
    var ontimer_funcs = [];
    var _this = this;
    
    this.RunIntervallic = function(func, obj, itv){
        ontimer_funcs.push([func, obj]);
        this.Active(itv);
    }
    
    this.Active = function(itv){
        if(!this.timer) this.timer = window.SetInterval(this.OnTimer, itv);
    }
    
    this.Stop = function(){
        if(!this.timer) return;
        window.ClearInterval(this.timer);
        this.timer = null;
    }
    
    this.OnTimer = function(){
        //fb.trace("Timer fired.");
        for(var i=0; i<ontimer_funcs.length; i++){
            if (!(ontimer_funcs[i][0].apply(ontimer_funcs[i][1]))) {
				ontimer_funcs.splice(i, 1);
				i--;
			}
        }
        if(!ontimer_funcs.length)
            _this.Stop();
    }
}();

//stolen from bossa
function Tooltip(x, y, text, font, color) {
	this.visible = false;
	this.x = x;
	this.y = y;
	this.w = 0;
	this.h = 0;
	this.text = text;

	this.att_x = 0;//attached 'control' position
	this.att_w = 0;
	
	//var BgImageObj = gdi.Image(fb.FoobarPath + "\\skins\\include\\GUI\\tooltip_bg.png");
	this.calcSize = function(){
		var temp_img = gdi.CreateImage(1,1);
		var g = temp_img.GetGraphics();
		this.w = g.CalcTextWidth(this.text, font) + TOOLTIP_TEXT_PADDING_LEFT + TOOLTIP_TEXT_PADDING_RIGHT;
		this.h = g.CalcTextHeight(this.text, font) + TOOLTIP_TEXT_PADDING_TOP + TOOLTIP_TEXT_PADDING_BOTTOM;
		temp_img.ReleaseGraphics(g);
	}
	
	this.draw = function(gr) {
		this.calcSize();
		if (this.visible) {
			var xPos = this.x - this.w/2;
			var yPos = this.y - this.h - 4;
			if(xPos < 0)
				xPos = 0;
			else if((xPos + this.w) > (this.att_x + this.att_w))
				xPos = this.att_x + this.att_w - this.w;
			gr.SetSmoothingMode(4);
			gr.FillRoundRect(xPos,yPos,this.w,this.h,3,3,RGBA(20,20,20,180));
			gr.GdiDrawText(this.text, font, color, xPos + TOOLTIP_TEXT_PADDING_LEFT, yPos + TOOLTIP_TEXT_PADDING_TOP, gr.CalcTextWidth(this.text, font), font.Height, DT_NOPREFIX);
			gr.SetSmoothingMode(0);//restore smooth mode
		}
	}

	this.repaint = function() {
		this.calcSize();
		var xPos = this.att_x - 2;
		var yPos = this.y - this.h - 4;
		window.RepaintRect(xPos, yPos, this.att_w + 4, this.h + 4);
	}

	this.activate = function() {
		//this.visible = true;
		//this.repaint();
		if(!this.visible)
			TimerMgr.RunIntervallic(this.onTimer,this,200);
		else{
			this.repaint();
		}
	}

	this.deactivate = function() {
		if (this.visible) { 
			this.visible = false;
			this.repaint();
		}
	}

	this.onTimer = function(){
		this.visible = true;
		this.repaint();
		return false;//one-shot timer
	}
}

function Seekbar() {
	var normal_h = 4;
	var hover_h = 10;
	var tooltipFont = gdi.Font("Tahoma", 12);
	this.tooltip = new Tooltip(0, 0, "", tooltipFont, RGB(220, 220, 220));
	this.draw = function(gr) {
		this.tooltip.draw(gr);
		var pos;
		gr.FillSolidRect(this.x, this.y, this.w, this.h, RGB(76, 96, 109));
		if (fb.IsPlaying) {
			pos = fb.PlaybackTime / fb.PlaybackLength;
			if (pos > 0) gr.FillSolidRect(this.x, this.y, this.w * pos, this.h, RGB(58, 155, 217));
		}
	};

	this.setSize = function(w, h) {
		this.w = w;
		this.h = h;
	};

	this.setPos = function(x, y) {
		this.x = x;
		this.y = y;
	};

	this.repaint = function() {
		window.Repaint();
	};

	this.isMouseOver = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y - 10 && y < this.y + hover_h);
	};

	this.hover = false;
	this.hover_old = false;
	this.move = function(x, y) {
		var pos;
		this.hover = this.isMouseOver(x, y);
		if (this.hover || this.drag) {
			this.h = hover_h;
		} else {
			this.h = normal_h;
		} //this.repaint();


		//(this.hover || this.drag) ? this.h = 20 : this.h = 10;
		if (this.hover != this.hover_old) this.repaint();
	
		if (this.drag) {
			x -= this.x;
			this.pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
			pos = fb.PlaybackLength * this.pos;
			fb.PlaybackTime = pos < fb.PlaybackLength - 2 ? pos : fb.PlaybackLength - 2;
			this.repaint();
			// tooltip
			this.tooltip.text = "00:00";
			this.tooltip.x = x;
			this.tooltip.y = this.y;
			this.tooltip.att_x = this.x;
			this.tooltip.att_w = this.w;
			this.tooltip.activate();
		}
		this.hover_old = this.hover;
	};

	this.lbtn_down = function(x, y) {
		if (this.hover) {
			if (fb.PlaybackLength > 0 && fb.IsPlaying) {
				this.drag = true;
				this.move(x, y);
			}
		}
	};

	this.lbtn_up = function(x, y) {
		this.drag = false;
		this.tooltip.deactivate();
		this.repaint();
	}
};

var ww, wh;
var sk = new Seekbar();
sk.setPos(0, 50);
window.SetInterval(function() {
	if (!fb.IsPlaying || fb.IsPaused || fb.PlaybackLength <= 0) return;
	sk.repaint();
}, 250);



function on_size() {
	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;

	sk.setSize(ww, 10);
};


function on_paint(gr) {
	sk.draw(gr);
};

function on_mouse_move(x, y) {
	sk.move(x, y);
};

function on_mouse_lbtn_down(x, y, m) {
	sk.lbtn_down(x,y);
}

function on_mouse_lbtn_up(x, y, m) {
	sk.lbtn_up(x, y);
}
