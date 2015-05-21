var SEEK_HEIGHT = 7;

var TOOLTIP_PADDING_LEFT = 15;
var TOOLTIP_PADDING_TOP = 3;
var TOOLTIP_PADDING_RIGHT = 4;
var TOOLTIP_PADDING_BOTTOM = 8;
var TOOLTIP_TEXT_PADDING_LEFT = 6;
var TOOLTIP_TEXT_PADDING_TOP = 2;
var TOOLTIP_TEXT_PADDING_RIGHT = 6;
var TOOLTIP_TEXT_PADDING_BOTTOM = 2;

function TraceLog() {
	this.enable = false;
	this.startTime = -1;
	this.start = function (msg) {
		if (!this.enable) return;
		this.msg = msg;
		this.startTime = new Date().getTime();
		fb.trace('[' + msg + '] has started');
	};
	this.stop = function () {
		if (!this.enable) return;
		var curr = new Date().getTime();
		var end_time = curr - this.startTime;
		fb.trace('[' + this.msg + '] has finished at ' + end_time + ' ms');
	};
};

function Properties() {
	this.shuffle = window.GetProperty("Shuffle type", 4);
	this.themePath = fb.ProfilePath + "\\Jeanne\\";
	this.imagePath = this.themePath + "\\images\\";
	this.useSysColor = window.GetProperty("Use system color", false);
};

var prop = new Properties();

function UserInterface() {
	this.type = window.InstanceType;
	this.color = {};
	this.font = {};
	this.getColor = function () {
		var arr;
		arr= window.GetProperty("User highlight color", "1-160-216").split("-");
		this.color.highlight = RGB(arr[0], arr[1], arr[2]);
		this.color.text = RGB(30, 30, 30);
		if (prop.useSysColor) {
			if (this.type) {
				this.color.highlight = window.GetColorDUI(ColorTypeDUI.highlight);
			} else {
				try {
					this.color.highlight = window.GetColorCUI(ColorTypeCUI.active_item_frame);
				} catch(e) {
					this.color.highlight = RGB(arr[0], arr[1], arr[2]);
				}; 
			}
		}
	};
	this.getColor();
};

function Panel() {
	this.repaint = function () {
		window.Repaint();
	};
	this.getMetadb = function () {
		this.metadb = fb.IsPlaying ? fb.GetNowPlaying() : null;
	};
	this.on_metadb_changed = function () {
		this.getMetadb();
		if (this.metadb) {} else {}
	};
	this.on_playback_time = function () {};
	this.x = 0;
	this.y = 0;
};

//stolen from bossa
function Tooltip(x, y, text, font, color) {
	this.visible = false;
	this.x = x;
	this.y = y;
	this.w = 0;
	this.h = 0;
	this.text = text;

	this.att_x = 0; //attached 'control' position
	this.att_w = 0;

	//var BgImageObj = gdi.Image(fb.FoobarPath + "\\skins\\include\\GUI\\tooltip_bg.png");
	this.calcSize = function () {
		var temp_img = gdi.CreateImage(1, 1);
		var g = temp_img.GetGraphics();
		this.w = g.CalcTextWidth(this.text, font) + TOOLTIP_TEXT_PADDING_LEFT + TOOLTIP_TEXT_PADDING_RIGHT;
		this.h = g.CalcTextHeight(this.text, font) + TOOLTIP_TEXT_PADDING_TOP + TOOLTIP_TEXT_PADDING_BOTTOM;
		temp_img.ReleaseGraphics(g);
	}

	this.draw = function (gr) {
		this.calcSize();
		if (this.visible) {
			var xPos = this.x - this.w / 2;
			var yPos = this.y - this.h - 4;
			if (xPos < 0) xPos = 0;
			else if ((xPos + this.w) > (this.att_x + this.att_w)) xPos = this.att_x + this.att_w - this.w;
			gr.SetSmoothingMode(4);
			gr.FillRoundRect(xPos, yPos, this.w, this.h, 3, 3, RGB(76, 96, 109));
			gr.GdiDrawText(this.text, font, color, xPos + TOOLTIP_TEXT_PADDING_LEFT, yPos + TOOLTIP_TEXT_PADDING_TOP, gr.CalcTextWidth(this.text, font), font.Height, DT_NOPREFIX);
			gr.SetSmoothingMode(0); //restore smooth mode
		}
	}

	this.repaint = function () {
		this.calcSize();
		var xPos = this.att_x - 2;
		var yPos = this.y - this.h - 4;
		window.RepaintRect(xPos, yPos, this.att_w + 4, this.h + 4);
		//window.Repaint();
	}

	this.activate = function () {
		//this.visible = true;
		//this.repaint();
		if (!this.visible) TimerMgr.RunIntervallic(this.onTimer, this, 200);
		else {
			this.repaint();
		}
	}

	this.deactivate = function () {
		if (this.visible) {
			this.visible = false;
			this.repaint();
		}
	}

	this.onTimer = function () {
		this.visible = true;
		this.repaint();
		return false; //one-shot timer
	}
}

var TimerMgr = new
function () {
	this.timer = null;
	//this.interval = itv;
	var ontimer_funcs = [];
	var _this = this;

	this.RunIntervallic = function (func, obj, itv) {
		ontimer_funcs.push([func, obj]);
		this.Active(itv);
	}

	this.Active = function (itv) {
		if (!this.timer) this.timer = window.SetInterval(this.OnTimer, itv);
	}

	this.Stop = function () {
		if (!this.timer) return;
		window.ClearInterval(this.timer);
		this.timer = null;
	}

	this.OnTimer = function () {
		//fb.trace("Timer fired.");
		for (var i = 0; i < ontimer_funcs.length; i++) {
			if (! (ontimer_funcs[i][0].apply(ontimer_funcs[i][1]))) {
				ontimer_funcs.splice(i, 1);
				i--;
			}
		}
		if (!ontimer_funcs.length) _this.Stop();
	}
} ();

function Statusbar() {
	this.h = 25;
}

function Volume() {
	var _path = fb.ProfilePath + "\\Jeanne\\images\\";
	var vol_img = gdi.Image(_path + "volume.png");
	this.pos = 0;
	this.drag = false;
	this.w = 75;
	this.h = 5;
	this.isMouseOver = function (x, y) {
		var pH = 2;
		return (x > this.x && x < this.x + this.w && y > this.y - pH && y < this.y + this.h + pH * 2);
	};
	this.repaint = function () {
		window.RepaintRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
	};
	this.draw = function (gr, x, y) {
		this.x = x;
		this.y = y;
		gr.SetSmoothingMode(4);
		gr.FillRoundRect(this.x, this.y, this.w, this.h, 2, 2, RGB(187, 187, 187));
		this.pos = vol2pos(fb.Volume);
		if (this.pos * this.w > 4) gr.FillRoundRect(this.x, this.y, this.w * this.pos, this.h, 2, 2, RGB(110, 110, 110));
		gr.SetSmoothingMode(0);
		gr.DrawImage(vol_img, this.x - vol_img.Width - 5, this.y-2, vol_img.Width, vol_img.Height, 0, 0, vol_img.Width, vol_img.Height, 0, 255);
	};
	this.move = function (x, y) {
		var _pos;
		if (this.isMouseOver(x, y)) {
			this.dragHov = true;
		} else {
			this.dragHov = false;
		};
		if (this.drag) {
			x -= this.x;
			_pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
			fb.Volume = pos2vol(_pos);
		};
	}
	this.lbtn_down = function (x, y) {
		if (this.dragHov) {
			this.drag = true;
			this.move(x, y);
		} else {
			this.drag = false;
		};
	};
	this.lbtn_up = function (x, y) {
		this.drag = false;
	};
	this.wheel = function (delta) {
		this.pos += delta / 100;
		this.pos < 0 ? 0 : this.pos > 1 ? 1 : this.pos;
		fb.Volume = pos2vol(this.pos);
	};
	this.on_volume_change = function() {
		this.repaint();
	};
};

function Seekbar() {
	this.draw = function (gr) {
		gr.FillSolidRect(this.x, this.y, this.w, this.h, ui.color.text & 0x50ffffff);
		this.pos = fb.PlaybackTime / fb.PlaybackLength;
		if (fb.IsPlaying && this.pos > 0) {
			gr.FillSolidRect(this.x, this.y, this.w * this.pos, this.h, ui.color.highlight & 0xeeffffff);
		};
	};
	this.setSize = function (w, h) {
		this.w = w;
		this.h = h;
	};
	this.setXY = function (x, y) {
		this.x = x;
		this.y = y;
	};
	this.repaint = function () {
		window.Repaint();
	};
	this.isMouseOver = function (x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y  && y < this.y + this.h);
	};
	this.on_move = function (x, y) {
		var fb_playback_time;
		//this.hover = this.isMouseOver(x, y);
		if (this.drag) {
			x -= this.x;
			this.pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
			fb_playback_time = fb.PlaybackLength * this.pos;
			fb.PlaybackTime = fb_playback_time < fb.PlaybackLength - 2 ? fb_playback_time : fb.PlaybackLength - 2;
			this.repaint();
			//tooltip
			this.tt.text = TimeFromSeconds(fb_playback_time);
			this.tt.x = x;
			this.tt.y = this.y;
			this.tt.att_x = this.x;
			this.tt.att_w = this.w;
			this.tt.activate();
		};
	};
	this.lbtn_down = function (x, y) {
		if (this.isMouseOver(x, y)) {
			if (fb.IsPlaying && fb.PlaybackLength > 0) {
				this.drag = true;
				this.on_move(x, y);
			}
		}
	};
	this.lbtn_up = function (x, y) {
		this.drag = false;
		this.tt.deactivate();
	};

	var ttFont = gdi.Font("Tahoma", 10);
	this.tt = new Tooltip(0, 0, "", ttFont, RGB(240, 240, 240));
	this.pos; // in percent
	this.drag = false;

	this.setXY(0, st.h);
	window.SetInterval(function () {
		if (!fb.IsPlaying || fb.IsPaused || fb.PlaybackLength <= 0 || sk.drag) return;
		sk.repaint();
	},
	250);
};

function ButtonV3(img, img_ln, w, h, func) {
	this.onClick = function (x, y) {
		func && func(x, y);
	}
	this.update = function (img, img_ln) {
		this.img = img;
		this.img_ln = img_ln;
		this.repaint();
	};
	this.repaint = function () {
		window.RepaintRect(this.x, this.y, this.w + 1, this.h + 1);
	};
	this.draw = function (gr, x, y) {
		var oX = (this.state == 2 ? 1 : 0) * this.w;
		var oY = this.img_ln * this.h;
		this.x = x;
		this.y = y;
		gr.DrawImage(this.img, this.x, this.y, this.w, this.h, oX, oY, this.w, this.h, 0, 255);
	};
	this.isMouseOver = function (x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};
	this.changeState = function (_state) {
		if (this.state == _state || (_state == 0 && this.menu && this.menu.showing)) return;
		this.oldState = this.state;
		this.state = _state;
		this.repaint();
	};
	this.img = img;
	this.img_ln = img_ln;
	this.w = w;
	this.h = h;
	this.state = 0;
	this.oldState = 0;
	this.menu = null;
};

function ButtonManager() {
	var _path = fb.ProfilePath + "\\Jeanne\\images\\";
	var _icon_img = gdi.Image(_path + "icons-20x16.png");
	var _icon_img2 = gdi.Image(_path + "icons-20x16.png");
	var bW = 20,
		bH = 16;
	var bW2 = 20,
		bH2 = 16;
	var btns = [],
		hbtn, dbtn;
	this.move = function (x, y) {
		if (dbtn) {
			if (dbtn.isMouseOver(x, y)) {
				if (dbtn.state !== 2) dbtn.changeState(2);
			} else {
				if (dbtn.state !== 1) dbtn.changeState(1);
			}
		} else {
			for (var i = 0; i < btns.length; i++) {
				var b = btns[i];
				if (b.isMouseOver(x, y)) {
					if (hbtn != b) {
						hbtn && hbtn.changeState(0);
						hbtn = b;
						hbtn.changeState(1);
					}
					break;
				}
			}
			if (i == btns.length && hbtn) {
				hbtn.changeState(0);
				hbtn = null;
			};
		}
	};
	this.lbtn_down = function (x, y) {
		if (hbtn) {
			dbtn = hbtn;
			dbtn.changeState(2);
		};
	};
	this.lbtn_dblclk = function(x, y) {
		if (fb.IsPlaying) {
			if (btns[1].state > 0) {
				fb.Stop();
				__stopped = true;
			};
		};
	};
	this.lbtn_up = function (x, y) {
		if (!dbtn) return;
		if (dbtn.state == 2) dbtn.onClick(x, y);
		dbtn.changeState(0);
		dbtn = null;
		hbtn = null;
		this.move(x, y);
	};
	this.leave = function () {
		if (!hbtn) return;
		hbtn.changeState(0);
		hbtn = null;
	};
	this.Refresh_PlayOrPause_Btn= function() {
		if (fb.IsPlaying) {
			if (fb.IsPaused) btns[1].update(_icon_img, 5);
			else btns[1].update(_icon_img, 4);
		} else {
			btns[1].update(_icon_img, 13);
		};
	};

	this.Refresh_PBO_Btns = function() {
		switch(fb.PlaybackOrder) {
			case 0:
				btns[3].update(_icon_img2, 9);
				btns[4].update(_icon_img2, 11);
				break;
			case 1:
				btns[3].update(_icon_img2, 10);
				btns[4].update(_icon_img2, 11);
				break;
			case 2:
				btns[3].update(_icon_img2, 8);
				btns[4].update(_icon_img2, 11);
				break;
			case 3:
			case 4:
			case 5:
			case 6:
				btns[3].update(_icon_img2, 9);
				btns[4].update(_icon_img2, 12);
				break;
		}
	};

	var __stopped = false;

	this.__init__ = function () {
		btns = [
			new ButtonV3(_icon_img, 0, bW, bH, function () { fb.Prev(); }), 
			new ButtonV3(_icon_img, 4, bW, bH, function () { 
				if (__stopped) __stopped = false;
				else fb.PlayOrPause(); 
			}), 
			new ButtonV3(_icon_img, 3, bW, bH, function () { fb.Next(); }), 
			new ButtonV3(_icon_img2, 9, bW2, bH2, function () { 
				if (fb.PlaybackOrder > PlaybackOrder.Random) fb.PlaybackOrder = PlaybackOrder.Repeat;
				else fb.PlaybackOrder = (fb.PlaybackOrder > 1) ? 0 : fb.PlaybackOrder + 1;
			}), 
			new ButtonV3(_icon_img2, 11, bW2, bH2, function () {
				fb.PlaybackOrder = (fb.PlaybackOrder >= PlaybackOrder.Random) ? 0 : prop.shuffle;
			})
		];
		this.Refresh_PlayOrPause_Btn();
		this.Refresh_PBO_Btns();
	};
	this.__init__();
	this.draw = function (gr) {
		var bX = 10,
			bY;
		for (var i = 0; i < btns.length; i++) {
			bY = p.y + (p.h - sk.h - btns[i].h) / 2;
			btns[i].draw(gr, bX, bY);
			bX += btns[i].w + 10;
		};
	};
};


var ui = new UserInterface();
var p = new Panel();
var st = new Statusbar();
var sk = new Seekbar();
var vl = new Volume();
var bm = new ButtonManager();

function on_size() {
	p.w = window.Width;
	p.h = window.Height;
	if (p.w <= 0 || p.h <= 0) return;
	sk.setSize(p.w, 5);
	sk.setXY(p.x, p.y + p.h - sk.h - 2);
	window.MaxHeight = window.MinHeight = 45 + sk.h;
};

function on_paint(gr) {
	// bg
	gr.FillSolidRect(p.x, p.y, p.w, p.h, RGB(225, 225, 225));
	gr.FillSolidRect(sk.x, sk.y + sk.h, sk.w, 2, ui.color.text & 0x50ffffff);
	sk.draw(gr);
	vl.draw(gr, 185, p.y + (p.h - sk.h - vl.h)/2);
	bm.draw(gr);
	// txt
	var tFont = gdi.Font("Tahoma", 11);
	var txtW = gr.CalcTextWidth("00:00 / 00:00", tFont);
	var txtH = gr.CalcTextHeight("00", tFont);
	var txtX = Math.max(p.x + p.w - txtW - 5, vl.x + vl.w + 10);
	var txtY = p.y + (p.h - sk.h - txtH)/2;
	var txt;
	if (fb.IsPlaying) {
		txt = TimeFromSeconds(fb.PlaybackTime) +  " / " + TimeFromSeconds(fb.PlaybackLength);
	} else { txt = "0:00 / 0:00" };
	gr.GdiDrawText(txt, tFont, ui.color.text, txtX, txtY, txtW, txtH, 0);

	// draw tooltip
	sk.tt.draw(gr);
};

function on_mouse_move(x, y) {
	sk.on_move(x, y);
	vl.move(x, y);
	bm.move(x, y);
};

function on_mouse_lbtn_down(x, y, m) {
	sk.lbtn_down(x, y);
	vl.lbtn_down(x, y);
	bm.lbtn_down(x, y);
}

function on_mouse_lbtn_dblclk(x, y, m) {
	bm.lbtn_down(x, y);
};

function on_mouse_lbtn_up(x, y, m) {
	sk.lbtn_up(x, y);
	vl.lbtn_up(x, y);
	bm.lbtn_up(x, y);
}

function on_mouse_wheel(delta) {
	vl.wheel(delta);
};

function on_mouse_leave() {
	bm.leave();
}

function on_volume_change() {
	vl.on_volume_change();
};

function on_playback_stop(reason) {
	if (reason != 2) {
		sk.repaint();
		bm.Refresh_PlayOrPause_Btn();
	}
};

function on_playback_pause(state) {
	bm.Refresh_PlayOrPause_Btn();
};

function on_playback_starting() {
	sk.repaint();
	bm.Refresh_PlayOrPause_Btn();
}

function on_playback_order_changed(new_order) {
	bm.Refresh_PBO_Btns();
};


function TimeFromSeconds(t) {
	var zpad = function (n) {
		var str = n.toString();
		return (str.length < 2) ? "0" + str : str;
	};
	var h = Math.floor(t / 3600);
	t -= h * 3600;
	var m = Math.floor(t / 60);
	t -= m * 60;
	var s = Math.floor(t);
	if (h > 0) return h.toString() + ":" + zpad(m) + ":" + zpad(s);
	return m.toString() + ":" + zpad(s);
};


function pos2vol(pos) {
	return (50 * Math.log(0.99 * pos + 0.01) / Math.LN10);
}

function vol2pos(v) {
	return ((Math.pow(10, v / 50) - 0.01) / 0.99);
}
