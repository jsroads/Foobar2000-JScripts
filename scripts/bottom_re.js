// updated: 2015/05/10
// created by jeanne

var sys_paint_called = false;

function TraceLog() {
	this.enable = false;
	this.startTime = -1;
	this.start = function(msg) {
		if (!this.enable) return;
		this.msg = msg;
		this.startTime = new Date().getTime();
		fb.trace('[' + msg + '] has started');
	};
	this.stop = function() {
		if (!this.enable) return;
		var curr = new Date().getTime();
		var end_time = curr - this.startTime;
		fb.trace('[' + this.msg + '] has finished at ' + end_time + ' ms');
	};
};

var Trace = new TraceLog();
Trace.enable = false;


function Properties() {
	this.enableSysColor = window.GetProperty("Color.use system color", false);
	this.sliderHeight = window.GetProperty("Slider.height", 3);
	this.sliderHoverHeight = window.GetProperty("Slider.hover height", 10);
	this.shuffle = window.GetProperty("Shuffle type", 4);
};


var prop = new Properties();


function UserInterface() {
	this.type = window.InstanceType;
	this.colors = {};
	this.get_colors = function() {
		var arr;
		arr = window.GetProperty("Color.highlight", "1-160-216").split("-");
		this.colors.highlight = RGB(arr[0], arr[1], arr[2]);
		// get foobar2000's default highlight color
		if (prop.enableSysColor) {
			if (this.type) { // DUI
				this.colors.highlight = window.GetColorDUI(ColorTypeDUI.highlight);
			} else { // CUI
				this.colors.highlight = window.GetColorDUI(ColorTypeDUI.active_item_frame);
			}
		};
		// background color
		arr = window.GetProperty("Color.background", "240-240-240").split("-");
		this.colors.background = RGB(arr[0], arr[1], arr[2]);
		// misc
		this.colors.slider_bg = RGB(200, 200, 200);
	};
	this.get_colors();
};

var ui = new UserInterface();


function on_color_changed() {
	ui.get_colors();
	p.repaint();
};


function Panel(x, y) {

	this.x = x;
	this.y = y;
	this.stopped = false;
	this.hand = false;
	this.hand_prev = false;
	this.metadb = null;
	var tf_artist = "[%artist%]";
	var tf_title = "%title%";
	var tf_length = "$if2(%length%, '0:00')";
	var tf_playback_time = "$if2(%playback_time%, '0:00')";
	this.paint_called = false;
	var metadb_old = null;

	this.repaint = function() {
		this.paint_called = true;
		window.Repaint();
	};

	this.get_metadb = function() {
		this.metadb = fb.IsPlaying ? fb.GetNowPlaying() : null;
	};
	this.on_metadb_changed = function() {
		this.get_metadb();
		if (this.metadb) {
			this.title = $(tf_title, this.metadb);
			this.artist = $(tf_artist, this.metadb);
			this.length = fb.TitleFormat(tf_length).Eval();
			this.playback_time = fb.TitleFormat(tf_playback_time).Eval();

			aa.get(this.metadb);
			
		} else {
			this.title = "";
			this.artist = "";
			this.length = "0:00";
			this.playback_time = "0:00";
		}

		metadb_old = this.metadb;
		this.repaint();
	};
	this.on_playback_time = function() {
		this.playback_time = fb.TitleFormat(tf_playback_time).Eval();
	};
};

var p = new Panel(0, 0);


function Volume() {
	this.pos = 0;
	this.drag = false;
	this.drag_hov = false;
	this.w = 105;
	this.h = prop.sliderHeight;

	this.isMouseOver = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + prop.sliderHoverHeight);
	};

	this.repaint = function(x, y) {
		this.paint_called = true;
		window.RepaintRect(this.x, this.y, this.w, prop.sliderHeight + 1);
	};

	this.draw = function(gr, x, y) {
		this.x = x;
		this.y = y;
		// draw background
		gr.FillSolidRect(this.x, this.y, this.w, this.h, ui.colors.slider_bg);
		// cursor
		this.pos = vol2pos(fb.Volume);;
		if (this.pos > 0) {
			gr.FillSolidRect(this.x, this.y, this.pos * this.w, this.h, ui.colors.highlight);
		};
		this.paint_called = false;
	};

	this.move = function(x, y) {
		var pos;
		if (this.isMouseOver(x, y)) {
			this.drag_hov = true;
			p.hand = true;
		} else {
			this.drag_hov = false;
		};

		if (this.drag) {
			x -= this.x;
			pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
			fb.Volume = pos2vol(pos);
		};
	};

	this.lbtn_down = function(x, y) {
		if (this.drag_hov) {
			this.drag = true;
			this.move(x, y);
		} else {
			this.drag = false;
		};
	};

	this.lbtn_up = function(x, y){
		this.drag = false;
	};

	this.wheel = function(delta) {
		this.pos += delta/100;
		this.pos < 0 ? 0 : this.pos > 1 ? 1 : this.pos;
		fb.Volume = pos2vol(this.pos);
	};

	this.on_volume_change = function(val) {
		this.repaint();
	};
};

var vol = new Volume();
function on_volume_change(val) {
	vol.on_volume_change(val);
};


function Seekbar() {
	this.h = prop.sliderHeight;
	this.on_size = function() {
		//this.w = vol.x - this.x - 4;
	};

	this.draw = function(gr, x, y) {
		var pos;
		this.x = x;
		this.y = y;
		this.w = vol.x - this.x - 4;
		//this.h = this.isMouseOver(x, y) ? this.sliderHoverHeight : this.sliderHeight;
		// bg
		gr.FillSolidRect(this.x, this.y, this.w, this.h, ui.colors.slider_bg);
		// cursor
		if (fb.IsPlaying) {
			pos = fb.PlaybackTime / fb.PlaybackLength;
			if (pos > 0) gr.FillSolidRect(this.x, this.y, this.w * pos, this.h, ui.colors.highlight);
		}
		this.paint_called = false;
	};

	this.repaint = function() {
		this.paint_called = true;
		window.RepaintRect(this.x, this.y, this.w, prop.sliderHeight+1);
		//window.RepaintRect(this.x, this.y, this.w, this.h+1);
	};

	this.changeState = function() {
	};

	this.isMouseOver = function(x, y) {
		return (x >  this.x && x < this.x + this.w && y > this.y && y < this.y + prop.sliderHoverHeight);
	};

	this.lbtn_down = function (x, y){ 
		if (this.isMouseOver(x, y)) {
			if (fb.PlaybackLength > 0 && fb.IsPlaying) {
				this.drag = true;
				this.move(x, y);
			}
		}
	};

	this.lbtn_up = function(x, y) {
		this.drag = false;
	};

	this.move = function (x, y) {
		var pb_pos;
		if (this.isMouseOver(x, y)) p.hand = true;

		if (this.drag) {
			x -= this.x;
			this.pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
			pb_pos = fb.PlaybackLength * this.pos;
			fb.PlaybackTime = pb_pos < fb.PlaybackLength - 2 ? pb_pos : fb.PlaybackLength - 2;
			this.repaint();
		}
	};

	window.SetInterval(function() {
		if (!fb.IsPlaying || fb.IsPaused || fb.PlaybackLength <= 0) return;
		sk.repaint();
	}, 250);

};

var sk = new Seekbar();

function ButtonV3(img, img_ln, w, h, func) {
	this.img = img;
	this.img_ln = img_ln;
	this.w = w;
	this.h = h;
	this.state = 0;
	this.state_old = -1;
	this.menu = null;
	this.on_click = function(x, y) {
		func && func(x, y);
	};
	this.update = function (img, img_ln) {
		this.img = img;
		this.img_ln = img_ln;
		this.repaint();
	};
	this.repaint = function() {
		window.RepaintRect(this.x, this.y ,this.w+1, this.h+1);
	};
	this.draw = function(gr, x, y) {
		var x_offst = (this.state == 2 ? 1 : 0) * this.w;
		var y_offst = this.img_ln * this.h;
		this.x = x;
		this.y = y;
		gr.DrawImage(this.img, this.x, this.y, this.w, this.h, x_offst, y_offst, this.w, this.h, 0, 255);
	};
	this.isMouseOver = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};
	this.changeState = function(state) {
		if (this.state == state || (state == 0 & this.menu && this.menu.showing)) return;
		this.state_old = this.state;
		this.state = state;
		this.repaint();
	};
};

function ButtonManager() {
	var image_path = fb.ProfilePath + "\\Jeanne\\images\\";
	var icon_img = gdi.Image(image_path + "icons-24x20.png");
	var b_w = 24, b_h = 20;
	var btns = [], hbtn, dbtn;
	// mouse event handlers
	this.move = function(x, y) {
		if (dbtn) {
			if (dbtn.isMouseOver(x, y)) {
				if (dbtn.state != 2) dbtn.changeState(2);
			} else {
				if (dbtn.state != 1) dbtn.changeState(1);
			}
		} else {
			for (var i = 0; i < btns.length; i++) {
				var b = btns[i];
				if (b.isMouseOver(x, y)) {
					if (hbtn != b) {
						hbtn && hbtn.changeState(0);
						hbtn = b;
						hbtn.changeState(1);
					} break;
				}
			}
			if (i == btns.length && hbtn) {
				hbtn.changeState(0);
				hbtn = null;
			}
		}
	};
	this.lbtn_down = function(x, y) {
		if (hbtn) {
			dbtn = hbtn;
			dbtn.changeState(2);
		};
	};

	this.lbtn_dblclk = function(x, y) {
		if (fb.IsPlaying) {
			if (btns[2].state > 0) {
				fb.Stop();
				p.stopped = true;
			}
		}
	};

	this.lbtn_up = function (x, y) {
		if (!dbtn) return;
		if (dbtn.state == 2) dbtn.on_click(x, y);
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
	//->

	this.init_btns = function() {
		var func;
		for (var i = 0; i < 6; i++) {
			switch (i) {
				case 0: // bt eslyric
					btns.push(new ButtonV3(icon_img, 1, b_w, b_h, function() {}));
					break;
				case 1: // bt prev
					btns.push(new ButtonV3(icon_img, 0, b_w, b_h, function() {
						fb.Prev()
					}));
					break;
				case 2: // bt play or pause
					btns.push(new ButtonV3(icon_img, 4, b_w, b_h, function() {
						if (p.stopped) p.stopped = false;
						else fb.PlayOrPause();
					}));
					break;
				case 3: // next
					btns.push(new ButtonV3(icon_img, 3, b_w, b_h, function() {
						fb.Next();
					}));
					break;
				case 4:
					btns.push(new ButtonV3(icon_img, 9, b_w, b_h, function() {
						if (fb.PlaybackOrder > PlaybackOrder.Random) fb.PlaybackOrder = PlaybackOrder.Repeat;
						else fb.PlaybackOrder = (fb.PlaybackOrder > 1) ? 0 : fb.PlaybackOrder + 1;
					}));
					break;
				case 5:
					btns.push(new ButtonV3(icon_img, 11, b_w, b_h, function() {
						fb.PlaybackOrder = (fb.PlaybackOrder >= PlaybackOrder.Random) ? 0 : prop.shuffle;
					}));
					break;
			}
		};
	};
	this.init_btns();

	this.draw = function(gr) {
		var b_x = 10, b_y;
		for (var i = 0; i < btns.length; i++) {
			b_y = p.y + (p.h + prop.sliderHeight - btns[i].h) / 2;
			btns[i].draw(gr, b_x, b_y);
			b_x += btns[i].w + 10;
		};
		this.end_x = btns[btns.length - 1].x + btns[btns.length - 1].w;
	};

	this.rfs_playorpause_btn = function() {
		if (fb.IsPlaying) {
			if (fb.IsPaused) btns[2].update(icon_img, 5);
			else btns[2].update(icon_img, 4);
		} else {
			btns[2].update(icon_img, 13);
		}
	};
	this.rfs_playorpause_btn();

	this.rfs_pbo_btns = function() {
		switch(fb.PlaybackOrder) {
			case 0:
				btns[4].update(icon_img, 9);
				btns[5].update(icon_img, 11);
				break;
			case 1:
				btns[4].update(icon_img, 10);
				btns[5].update(icon_img, 11);
				break;
			case 2:
				btns[4].update(icon_img, 8);
				btns[5].update(icon_img, 11);
				break;
			case 3:
			case 4:
			case 5:
			case 6:
				btns[4].update(icon_img, 9);
				btns[5].update(icon_img, 12);
				break;
		}
	};
	this.rfs_pbo_btns();
}

var bm = new ButtonManager();


function AlbumArt() {
	var img_path = fb.ProfilePath + "\\Jeanne\\images\\";
	this.nocover = gdi.Image(img_path + "nocover.png");
	this.cover = null;
	this.cover_next = null;
	this.timer = false;
	this.alpha = 0;
	var tf_artistalbum = "%album artist%%artist%", album, album_old;

	var album, album_old;

	this.get = function(metadb) {
		//if (metadb == null) return;
		album = $(tf_artistalbum, metadb);
		//if (album != album_old) {
		if (metadb) {
			if (album != album_old) utils.GetAlbumArtAsync(window.ID, metadb, 0);
		} //else this.cover = null;
		//if (althis.cover = null;
		//}
	};

	this.on_get_done = function(metadb, art_id, image, image_path) {
		
		//if (!metadb) image = null;
		//if (!image) {
			this.cover = image;
		//} else {
		if (this.cover) this.cover = this.cover.Resize(50, 50, 2);
		//fb.trace("hello");
		//}
		it.repaintInfo();
		album_old = $(tf_artistalbum, metadb);
	};
};

var aa = new AlbumArt();


function InfoText() {
	this.time_w = 60; 
	this.time_x;
	var cover_w, cover_x;
	var cc = StringFormat(1, 1, 3, 0x1000);
	var rc = StringFormat(2, 1, 3, 0x1000);
	var f1 = gdi.font("Segoe Ui", 14, 1), f2 = gdi.font("Segoe Ui", 12, 1);
	var fc1 = RGB(255, 255, 255), fs1 = RGB(100, 100, 100);
	var fc2 = RGB(88, 88, 88), fs2 = fs1;
	var info_x, info_w;
	var glow_r = 2, glow_i = 1;


	this.draw = function(gr) {
		this.l1y = prop.sliderHeight;
		this.l2y = (p.h + prop.sliderHeight)/2;
		this.time_x = p.x + p.w - this.time_w;
		cover_w = Math.ceil(p.h - prop.sliderHeight - 4 * 2);

		this.time_x = Math.max(this.time_x, bm.end_x + cover_w + 20);

		//if (this.paint_time_called || sys_paint) {
			// draw time
			gr.FillGradRect(this.time_x + 4, this.l2y, this.time_w - 8, 1, 0, 0, RGB(100, 100, 100), 0.5);
			DrawGlowString(gr, p.playback_time, f1, fc1, fs1, glow_r, glow_i, this.time_x, this.l1y, this.time_w - 8, this.l2y - this.l1y, cc);
			DrawGlowString(gr, p.length, f2, fc2, fs2, glow_r, glow_i, this.time_x, this.l2y, this.time_w - 8, p.y + p.h - this.l2y, cc);
			this.paint_time_called = false;
		//};


		if (sys_paint_called) {

			cover_x = this.time_x - cover_w - 4*2;
			cover_y = p.y + prop.sliderHeight + 4;
			// album art

			if (p.metadb && aa.cover) gr.DrawImage(aa.cover, cover_x+1, cover_y+1, cover_w-1, cover_w-1, 0, 0, aa.cover.Width, aa.cover.Height, 0, 220);
			else gr.DrawImage(aa.nocover, cover_x, cover_y, cover_w, cover_w, 0, 0, aa.nocover.Width, aa.nocover.Height, 0, 220);

			gr.DrawRect(cover_x, cover_y, cover_w, cover_w, 1, RGB(180, 180, 180));
			// draw info text
			info_x = bm.end_x + 20;
			info_w = Math.max(gr.CalcTextWidth(p.title, f1), gr.CalcTextWidth(p.artist, f2))+5;
			info_w = Math.min(info_w, cover_x - info_x - 20);
			info_x = cover_x - info_w - 20;

			if (cover_x - bm.end_x - 50 > 0) {
				gr.FillGradRect(info_x - 15, this.l2y, info_w - 4 + 30, 1, 0, 0, RGB(100, 100, 100), 0.5);
				DrawGlowString(gr, p.title, f1, fc1, fs1, glow_r, glow_i, info_x, this.l1y, info_w, this.l2y - this.l1y, rc);
				DrawGlowString(gr, p.artist, f2, fc2, fs2, glow_r, glow_i, info_x, this.l2y, info_w, p.y + p.h - this.l2y, rc);
			};

			this.paint_info_called = false;
			//fb.trace("hello");
		};
	};

	this.repaintTime = function() {
		this.paint_time_called = true;
		window.RepaintRect(it.time_x, it.l1y, it.time_w, it.l2y-it.l1y);
	};

	this.repaintInfo = function() {
		this.paint_info_called = true;
		p.repaint();
	};

	this.on_size = function() {
		this.paint_info_called = true;
	};

};

var it = new InfoText();

function pos2vol(pos){return(50*Math.log(0.99*pos+0.01)/Math.LN10);}
function vol2pos(v){return((Math.pow(10,v/50)-0.01)/0.99);}
function DrawGlowString(gr,text,font,font_color,shadow_color,radius,iteration,x,y,w,h,align){var img_to_blur,_g;img_to_blur=gdi.CreateImage(w*5,h*5);_g=img_to_blur.GetGraphics();_g.SetTextRenderingHint(TextRenderingHint.AntiAlias);_g.DrawString(text,font,shadow_color,2*w,2*h,w,h,align);img_to_blur.ReleaseGraphics(_g);img_to_blur.BoxBlur(radius,iteration);img_to_blur&&gr.DrawImage(img_to_blur,x-w,y-h,w*3,h*3,w*1,h*1,w*3,h*3,0,255);gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);gr.DrawString(text,font,font_color,x,y,w,h,align);gr.SetTextRenderingHint(TextRenderingHint.Default);}

function on_size() {
	window.MaxHeight = window.MinHeight = 50;
	if (!window.Width || !window.Height) return;
	p.w = window.Width;
	p.h = window.Height;
	// sk
	it.on_size();
};

sys_paint_called = true;
function on_paint(gr) {

	// =====>
	sys_paint_called = true;
	if (sk.paint_called || it.paint_time_called) {
		sys_paint_called = false;
	};
	if (it.paint_info_called) {
		sys_paint_called = true;
	}
	if (p.paint_called) sys_paint_called = true;
	// ================================================== //

	Trace.start("draw");
	// background
	gr.FillSolidRect(p.x, p.y, p.w, p.h, ui.colors.background);
	var vol_x = Math.max(p.x + p.w - vol.w - 4, 200);
	vol.draw(gr, vol_x, p.y);

	sk.draw(gr, p.x, p.y);
	bm.draw(gr);

	it.draw(gr); // will costs 22ms

	Trace.stop();
	sys_paint_called = false;
	p.paint_called = false;
	
};

function on_mouse_move(x, y) {
	p.hand = false;
	vol.move(x, y);
	sk.move(x, y);
	bm.move(x, y);
	if (p.hand != p.hand_prev) window.SetCursor(p.hand ? IDC_HAND : IDC_ARROW);
	p.hand_prev = p.hand;
};

function on_mouse_lbtn_down(x, y, mask) {
	vol.lbtn_down(x, y);
	sk.lbtn_down(x, y);
	bm.lbtn_down(x, y);
};

function on_mouse_lbtn_dblclk(x, y, m) {
	bm.lbtn_down(x, y);
	bm.lbtn_dblclk(x, y);
};

function on_mouse_lbtn_up(x, y, mask) {
	vol.lbtn_up(x, y);
	sk.lbtn_up(x, y);
	bm.lbtn_up(x, y);
};

function on_mouse_rbtn_up(x, y, mask) {
	return !(mask == 0x0004);
};

function on_mouse_leave() {
	bm.leave();
};

function on_mouse_wheel(delta) {
	vol.wheel(delta);
};


function on_playback_stop(reason) {
	if (reason !=2) {
		sk.repaint();
		bm.rfs_playorpause_btn();
		p.on_metadb_changed();
		it.repaintInfo();
	};
};

function on_playback_pause(state) {
	bm.rfs_playorpause_btn();
};

function on_playback_starting(cmd, is_paused) {
	bm.rfs_playorpause_btn();
};

function on_playback_order_changed(new_order) {
	bm.rfs_pbo_btns();
};


function on_metadb_changed(metadb, fromhook) {
	p.on_metadb_changed();
};

function on_playback_time(time) {
	p.on_playback_time();
	it.repaintTime();
};

function on_playback_new_track(metadb) {
	p.on_metadb_changed();
};

function on_get_album_art_done(metadb, art_id, image, image_path) {
//	fb.trace("path: " + image_path);
	aa.on_get_done(metadb, art_id, image, image_path);
	it.repaintInfo();
};

function on_focus() {
	p.repaint();
}

p.on_metadb_changed();
