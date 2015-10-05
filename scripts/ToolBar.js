////////////////////////////////////////// objects
oSearchbox = function() {
	// inputbox variables
	var temp_bmp = gdi.CreateImage(1, 1);
	var temp_gr = temp_bmp.GetGraphics();
	var g_timer_cursor = false;
	var g_cursor_state = true;
	var doc = new ActiveXObject("htmlfile");
	clipboard = {
		text: null
	};
	this.font = gdi.Font("Arial", 12, 1);
	var images = {
		filterIcon: null,
        loupe_off: null,
        loupe_ov: null,
        resetIcon_off: null,
        resetIcon_ov: null,

	}
    
    this.repaint = function() {
        window.Repaint();
    }
    
	this.getImages = function() {
		var gb;

        images.loupe_off = gdi.CreateImage(18, 14);
        gb = images.loupe_off.GetGraphics();
        var color2 = RGB(255, 255, 255);
        var color1 = RGB(70, 70, 70);
        gb.SetSmoothingMode(2);
        gb.DrawEllipse(1,1,9,9,2.0,color1);
        gb.DrawEllipse(-1,-1,13,13,2.0,color2);
        gb.DrawLine(9,9,12.5,12.5,2.0,color1);
        var pts = Array(12,6,16,6,14,9);
        gb.SetSmoothingMode(0);
        gb.DrawLine(13,6,17,6,1.0,color1);
        gb.DrawLine(14,7,16,7,1.0,color1);
        gb.FillSolidRect(15,8,1,1,color1); 
        images.loupe_off.ReleaseGraphics(gb);

        images.loupe_ov = gdi.CreateImage(18, 14);
        gb = images.loupe_ov.GetGraphics();
        var color2 = RGB(255, 255, 255);
        var color1 = RGB(130, 140, 240);
        gb.SetSmoothingMode(2);
        gb.DrawEllipse(1,1,9,9,2.0,color1);
        gb.DrawEllipse(-1,-1,13,13,2.0,color2);
        gb.DrawLine(9,9,12.5,12.5,2.0,color1);
        var pts = Array(12,6,16,6,14,9);
        gb.SetSmoothingMode(0);
        gb.DrawLine(13,6,17,6,1.0,color1);
        gb.DrawLine(14,7,16,7,1.0,color1);
        gb.FillSolidRect(15,8,1,1,color1); 
        images.loupe_ov.ReleaseGraphics(gb);

        if (typeof(this.loupe_bt) == "undefined") {
            this.loupe_bt = new oButton([images.loupe_off, images.loupe_ov, images.loupe_ov], 0, 0);
        } else {
            this.loupe_bt.img[0] = images.loupe_off;
            this.loupe_bt.img[1] = images.loupe_ov;
            this.loupe_bt.img[2] = images.loupe_ov;
        }

        images.resetIcon_off = gdi.CreateImage(18, 18);
        gb = images.resetIcon_off.GetGraphics();
            gb.setSmoothingMode(2);
            var xpts1 = Array(6,5, 13,12, 12,13, 5,6);
            var xpts2 = Array(5,12, 12,5, 13,6, 6,13); 
            gb.FillPolygon(RGB(170,170,170), 0, xpts1);
            gb.FillPolygon(RGB(170,170,170), 0, xpts2);
            gb.DrawLine(6,6, 12, 12, 1.0, RGB(170,170,170));
            gb.DrawLine(6,12, 12, 6, 1.0, RGB(170,170,170));
            gb.setSmoothingMode(0);
        images.resetIcon_off.ReleaseGraphics(gb);

        images.resetIcon_ov = gdi.CreateImage(18, 18);
        gb = images.resetIcon_ov.GetGraphics();
            gb.setSmoothingMode(2);
            gb.DrawLine(5,5, 13, 13, 2.0, RGB(130,140,240));
            gb.DrawLine(5,13, 13, 5, 2.0, RGB(130,140,240));
            gb.setSmoothingMode(0);
        images.resetIcon_ov.ReleaseGraphics(gb);
                
        if(typeof(this.reset_bt) == "undefined") {
            this.reset_bt = new oButton([images.resetIcon_off, images.resetIcon_ov, images.resetIcon_ov], 0, 0);
        } else {
            this.reset_bt.img[0] = images.resetIcon_off;
            this.reset_bt.img[1] = images.resetIcon_ov;
            this.reset_bt.img[2] = images.resetIcon_ov;
        }
	}
	this.getImages();
    
	this.on_init = function() {
		this.inputbox = new oInputbox(120, 20, "", "Library Search", RGB(0, 0, 0), RGB(255, 255, 255), 0, RGB(150, 170, 255), sendResponse, "searchBox");
        this.inputbox.autovalidation = autoSearch;
	}
	this.on_init();
    
    this.setSize = function() {
        //this.reset_bt.x = this.x + this.inputbox.w+3+22; 
        //this.reset_bt.y = this.y + 1;
    }
	this.draw = function(gr, x, y) {
        var bx = x;
		var by = y;
        var bw = this.inputbox.w + 44;
		var bh = this.inputbox.h;
        //gr.FillSolidRect(bx-2, by, bw+2, 20, RGB(255, 255, 255));
        if(this.inputbox.edit) {
            gr.SetSmoothingMode(4);
            gr.DrawRoundRect(bx, by-2, bw+4, 23, 11.5, 11.5, 2.0, RGB(130,140,240));
            gr.SetSmoothingMode(0);
        }
		this.inputbox.draw(gr, bx+28, by, 0, 0);
        if(this.inputbox.text.length > 0) {
            this.reset_bt.x = bx + this.inputbox.w+3+22;
            this.reset_bt.y = by + 1;
            this.reset_bt.draw(gr, 255);
        }

        this.loupe_bt.x = bx+6;
        this.loupe_bt.y = by+4;
        this.loupe_bt.draw(gr, 255);
    }
    
    this.on_mouse = function(event, x, y, delta) {
        switch(event) {
            case "lbtn_down":
                this.loupe_bt.checkState("down", x, y);
				this.inputbox.check("down", x, y);
                if(this.inputbox.text.length > 0) this.reset_bt.checkState("down", x, y);
                break;
            case "lbtn_up":
                if (this.loupe_bt.checkState("up", x, y) == ButtonStates.hover) {
                }

				this.inputbox.check("up", x, y);
                if(this.inputbox.text.length > 0) {
                    if(this.reset_bt.checkState("up", x, y) == ButtonStates.hover) {
                        this.inputbox.text = "";
                        this.inputbox.offset = 0;
                        sendResponse();
                    }
                }
                break;
            case "lbtn_dblclk":
				this.inputbox.check("dblclk", x, y);
                break;
            case "rbtn_down":
				this.inputbox.check("right", x, y);
                break;
            case "move":
                this.loupe_bt.checkState("move", x, y);
				this.inputbox.check("move", x, y);
                if(this.inputbox.text.length > 0) var bt_state = this.reset_bt.checkState("move", x, y);
                return (this.inputbox.hover || bt_state == ButtonStates.hover);
                break;
        }
    }
    
    this.on_key = function(event, vkey) {
        switch(event) {
            case "down":
				this.inputbox.on_key_down(vkey);
                break;
        }
    }
    
    this.on_char = function(code) {
        this.inputbox.on_char(code);
    }
    
	this.on_focus = function(is_focused) {
		this.inputbox.on_focus(is_focused);
	}
}

/////////////////////////////////////////////// globals
var ww, wh;
var buttons = [];
var playback_buttons_x = 0;
var images = {};
var images_path = fb.ProfilePath + "common\\images\\";
var bg_color, txt_color;
var searchBox;
var autoSearch = window.Getproperty("system.SearchBox Auto-validation", false);
var keepSearchResult = false;
var searchboxScrope = 0;

var IDC_ARROW = 32512;
var IDC_IBEAM = 32513;

var VK_BACK = 0x08;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_INSERT = 0x2D;
var VK_DELETE = 0x2E;
var VK_SPACEBAR = 0x20;
var KMask = {
    none: 0,
    ctrl: 1,
    shift: 2,
    ctrlshift: 3,
    ctrlalt: 4,
    ctrlaltshift: 5,
    alt: 6
};


///////////////////////////////// 
if (window.Instancetype == 1) {
	window.DlgCode = DLGC_WANTALLKEYS;
};
get_colors();
get_images();
searchBox = new oSearchbox();
searchBox.inputbox.visible = true;

set_buttons();


//////////////////////////////////////////////  callback functions

function on_size() {
	window.MaxHeight = window.MinHeight = 36;
	//
	if (!window.Width || !window.Height) { return };
	ww = window.Width;
	wh = window.Height;
	//
	searchBox.setSize();

	// buttons
	var w = images.play[0].Width;
	var y = Math.floor(wh / 2 - w / 2)+1;
	var p = 5;
	var x = ww - (w + p) * 5;
	buttons[0].setPos(x, y);
	buttons[1].setPos(x + w + p, y);
	buttons[2].setPos(x + (w + p) * 2, y);
	buttons[3].setPos(x + (w + p) * 3, y);

	//x = ww - 30;
	buttons[4].setPos(x + (w + p) * 4, y);

	y = Math.floor(wh / 2 - images.mainMenu[0].Height / 2) + 1;
	buttons[5].setPos(10, y);
	
};

function on_paint(gr) {
	var sx, sy, sw, sh;
	var i;
	// bg
	gr.FillSolidRect(0, 0, ww, wh, bg_color);
	// searchbox
	var sbx = 50;
	gr.SetSmoothingMode(4);
	gr.FillRoundRect(sbx, (wh - 24) / 2, 168, 24, 11, 11, RGBA(255, 255, 255, 255));
	gr.SetSmoothingMode(0);

	if (searchBox.inputbox.visible) {
		searchBox.draw(gr, sbx, (wh - 20) / 2);
	};

	// buttons
	for (i = 0; i < buttons.length; i++) {
		buttons[i].draw(gr);
	};

};

function on_mouse_lbtn_down(x, y, mask) {
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].checkState("down", x, y);
	};

	// searchbox
	if (searchBox.inputbox.visible) {
		searchBox.on_mouse("lbtn_down", x, y);
	};
};

function on_mouse_lbtn_up(x, y, mask) {
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i].checkState("up", x, y) == ButtonStates.hover) {
			buttons[i].onClick();
		};
	};

	if (searchBox.inputbox.visible) {
		searchBox.on_mouse("lbtn_up", x, y);
	};

};

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (searchBox.inputbox.visible) {
		searchBox.on_mouse("lbtn_dblclk", x, y);
	};

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].checkState("down", x, y);
	};
};

function on_mouse_rbtn_down(x, y, mask) {
	if (searchBox.inputbox.visible) {
		searchBox.on_mouse("rbtn_down", x, y);
	};
};

function on_mouse_move(x, y, mask) {
	for (var i = 0; i< buttons.length; i++) {
		buttons[i].checkState("move", x, y);
	};

	if (searchBox.inputbox.visible) {
		searchBox.on_mouse("move", x, y);
	};
};

function on_mouse_leave() {
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].checkState("leave", 0, 0);
	};

	if (searchBox.inputbox.visible) {
		searchBox.on_mouse("leave");
	};
};

function on_mouse_wheel(delta) {
	if (searchBox.inputbox.visible) {
		searchBox.on_mouse("wheel");
	};
};

//////
function on_key_up(vkey) {
	if (searchBox.inputbox.visible) {
		searchBox.on_key("up", vkey);
	};
};

function on_key_down(vkey) {
	if (searchBox.inputbox.visible) {
		searchBox.on_key("down", vkey);
	};
};

function on_char(code) {
	if (searchBox.inputbox.visible) {
		searchBox.on_char(code);
	}
};
//////
function on_playback_starting() {
	refresh_playOrPause_button();
};

function on_playback_stop() {
	refresh_playOrPause_button();
};

function on_playback_pause() {
	refresh_playOrPause_button();
};

/////
function on_notify_data(name, info) {
	switch(name) {
		case "another_panel_is_clicked":
			searchBox.on_mouse("lbtn_down", 1, 1);
			break;
	};
};


///////////////////////////////////////////// functions
function get_colors() {
	bg_color = utils.GetSysColor(15);
	bg_color = RGB(247, 247, 247);
	//bg_color = RGB(38, 38, 38);
	txt_color = RGB(25, 25, 25);
};

function get_images() {

	var fontAwesome = gdi.Font("FontAwesome", 18, 0);
	var img = gdi.Image(images_path + "logo.png").Resize(28, 28, 7);;
	images.mainMenu = [img, img, img];

	var fontGuifx = gdi.Font("Guifx v2 Transports", 17, 0);
	var fontGuifx2 = gdi.Font("Guifx v2 Transports", 19, 0);
	var w = 32;
	var normalColor, hoverColor, downColor, color;
	var s, imgArr, img, font;
	var sf = StringFormat(1, 1);

	normalColor = RGB(150, 150, 150);
	hoverColor = RGB(120, 120, 120);
	downColor = RGB(100, 100, 100);

	// play
	imgArr = [];
	for (s = 0; s < 3; s++) {
		color = normalColor;
		font = fontGuifx;
		if (s == 1) {color = hoverColor};
		if (s == 2) {
			color = downColor;
			font = fontGuifx2;
		};
		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(5);

		g.FillSolidRect(1, 0, w, w, bg_color);
		g.DrawString("1", font, color, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.play = imgArr;

	// pause
	imgArr = [];
	for (s = 0; s < 3; s++) {
		color = normalColor;
		font = fontGuifx;
		(s == 1) && (color = hoverColor);
		if (s == 2) {
			color = downColor;
			font = fontGuifx2;
		};
		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(5);

		g.FillSolidRect(0, 0, w, w, bg_color);
		g.DrawString("2", font, color, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.pause = imgArr;

	// stop
	imgArr = [];
	for (s = 0; s < 3; s++) {
		color = normalColor;
		font = fontGuifx;
		(s == 1) && (color = hoverColor);
		if (s == 2) { 
			color = downColor;
			font = fontGuifx2;
		};

		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(5);

		g.FillSolidRect(0, 0, w, w, bg_color);
		g.DrawString("3", font, color, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.stop = imgArr;

	// prev
	imgArr = [];
	for (s = 0; s < 3; s++) {
		color = normalColor;
		font = fontGuifx;
		(s == 1) && (color = hoverColor);
		if (s == 2) {
			color = downColor;
			font = fontGuifx2;
		};
		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(5);

		g.FillSolidRect(0, 0, w, w, bg_color);
		g.DrawString("5", font, color, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.prev = imgArr;

	// next
	imgArr = [];
	for (s = 0; s < 3; s++) {
		color = normalColor;
		font = fontGuifx;
		(s == 1) && (color = hoverColor);
		if (s == 2) {
		   color = downColor;
		   font = fontGuifx2;
		}
		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(5);

		g.FillSolidRect(0, 0, w, w, bg_color);
		g.DrawString("6", font, color, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.next = imgArr;

	// heart
	imgArr = [];
	for (s = 0; s < 3; s++) {
		color = normalColor;
		font = fontGuifx;
		if (s == 1) { color = hoverColor; }
		if (s == 2) { 
			color = downColor; 
			font = fontGuifx2;
		}
		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(5);

		g.FillSolidRect(0, 0, w, w, bg_color);
		g.DrawString("v", font, color, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.heart = imgArr;
};

function set_buttons() {
	buttons[0] = new oButton(images.stop, 0, 0, function() { fb.Stop() });
	buttons[1] = new oButton(images.prev, 0, 0, function() { fb.Prev() });
	buttons[2] = new oButton(images.play, 0, 0, function() { fb.PlayOrPause() });
	buttons[3] = new oButton(images.next, 0, 0, function() { fb.Next() });
	buttons[4] = new oButton(images.heart, 0, 0, function() {});
	buttons[5] = new oButton(images.mainMenu, 0, 0, function() {});

	refresh_playOrPause_button();
};

function refresh_playOrPause_button() {
	if (fb.IsPlaying && !fb.IsPaused) {
		buttons[2].update(images.pause);
	} else {
		buttons[2].update(images.play);
	}
	buttons[2].repaint();
};

function sendResponse() {

	var s2 = searchBox.inputbox.text;
	var pl_to_move = [];
	if (s2.length == 0) return true;
	var found = false;
	var total = plman.PlaylistCount;
	for (var i = 0; i < total; i++) {
		if (plman.GetPlaylistName(i).substr(0, 8) == "Search [") {
			if (!keepSearchResult) {
				if (!found) {
					var plId = i;
					found = true;
				}
				pl_to_move.push(i);
			};
		}
	}

	if (found && !keepSearchResult) {
		var r = pl_to_move.length - 1;
		while (r >= 0) {
			plman.RemovePlaylist(pl_to_move[r]);
			r--;
		};
		plId = plman.PlaylistCount;
	} else {
		plId = total;
	};

	var handles = fb.GetAllItemsInMediaLibrary();
	var results;
	switch(searchboxScrope) {
		case 0:
			results = fb.QueryMulti(handles, s2);
			break;
	};

	fb.CreatePlaylist(plId, "Search [" + s2 + "]");
	plman.InsertPlaylistItems(plId, 0, results, select = true);
	plman.ActivePlaylist = plId;

};

function GetKeyboardMask() {
    var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
    var a = utils.IsKeyPressed(VK_ALT) ? true : false;
    var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
    var ret = KMask.none;
    if (c && !a && !s) ret = KMask.ctrl;
    if (!c && !a && s) ret = KMask.shift;
    if (c && !a && s) ret = KMask.ctrlshift;
    if (c && a && !s) ret = KMask.ctrlalt;
    if (c && a && s) ret = KMask.ctrlaltshift;
    if (!c && a && !s) ret = KMask.alt;
    return ret;
};
