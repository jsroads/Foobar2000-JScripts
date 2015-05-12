// update 2015/05/11
// created by Jeanne

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


function UserInterface() {
	this.type = window.InstanceType;
	this.colors = {};
	this.fonts = {};
	this.get_colors = function() {
		if (this.type) {
			this.text =  window.GetColorDUI(ColorTypeDUI.text);
			this.selection = window.GetColorDUI(ColorTypeDUI.selection);
			this.background = window.GetColorDUI(ColorTypeDUI.background);
			this.highlight = window.GetColorDUI(ColorTypeDUI.highlight);
		} else {
			try {
				this.text = window.GetColorCUI(ColorTypeCUI.text);
				this.selection = window.GetColorCUI(ColorTypeCUI.selection_background);
				this.background = window.GetColorCUI(ColorTypeCUI.background);
				this.highlight = window.GetColorCUI(ColorTypeCUI.highlight);
			} catch (e) {};
		}
		// process colors
		this.bg_active = this.selection & 0x10000000;
		this.bg_active_border = this.selection & 0xaa000000;
		this.text_normal = this.text;
		this.text_playing = this.highlight;
	};
	this.get_colors();

	this.get_fonts = function() {
		var fontError;
		if (this.type) this.font = window.GetFontDUI(FontTypeDUI.lists);
		else try { this.font = window.GetFontCUI(FontTypeCUI.items); } catch(e) {};
	
		// if font error
		try {
			this.font.Name;
			this.font.Size;
			this.font.Style;
		} catch(e) {
			this.font = gdi.Font("Segoe Ui", 12, 0);
		}

		this.item_font = gdi.font(this.font.Name, 12, 0);
		this.font_wd2 = gdi.font("wingdings 2", 22, 0);

	};
	this.get_fonts();
};

var ui = new UserInterface();

function on_font_changed() {
	ui.get_fonts();
	window.Repaint();
}

function on_colors_changed() {
	ui.get_colors();
	window.Repaint();
}

function Panel(x, y) {
	this.x = x;
	this.y = y;
	this.repaint = function() {
		window.Repaint();
	};
};

var p = new Panel(0, 0);


function PanelInfo() {
	this.draw = function(gr) {
		gr.FillSolidRect(p.x, p.y, p.w, p.h, ui.text_normal & 0x10ffffff);
	};
}

var pi = new PanelInfo();




function Playlist_Manager() { // playlist manager
	this.arr = [];

	this.on_init = function(callback) {
		var count_text;
		this.arr.splice(0, this.arr.length);
		for (var j = 0; j < fb.PlaylistCount; j++) {
			count_text = "[" + fb.PlaylistItemCount(j) + "]";
			this.arr[j] = [fb.IsAutoPlaylist(j) | 0, fb.GetPlaylistName(j), count_text];
		}
		callback && callback();
	};
	var on_init_done = function() {
		window.Repaint();
	};
	this.on_init(function() {window.Repaint();});
};

var pm = new Playlist_Manager();

function ScrollbarObject() {
	this.show = false;
};

var scrb = new ScrollbarObject();


function ListItem() {
	this.state = 0; // 1: hover, 2: down/active
}

function ListObject() {

	var ROW_HEIGHT = 40;
	var PADDING_TOP = 8;
	var PADDING_LEFT = 8;
	var PADDING_RIGHT = 8;

	this.startIdx = 0;

	this.repaint = function() {
		window.Repaint();
	};

	this.on_size = function() {
		this.rh = p.h - PADDING_TOP;
		this.rw = p.w - PADDING_RIGHT;

		this.visibleItemCount = (this.rh / ROW_HEIGHT) | 0;
		scrb.show = (fb.PlaylistCount > this.visibleItemCount);

		if (this.startIdx + this.visibleItemCount > fb.PlaylistCount) {
			this.startIdx = fb.PlaylistCount - this.visibleItemCount;
		}

		if (this.startIdx < 0) this.startIdx = 0;
	};

	this.wheel = function(delta) {
		if (scrb.show) {
			this.startIdx -= delta;
			this.startIdx = this.startIdx < 0 ? 0 : this.startIdx;
			if (this.startIdx > fb.PlaylistCount - this.visibleItemCount) this.startIdx = fb.PlaylistCount - this.visibleItemCount;
			// scrb.refresh();
			this.repaint();
		};
	}

	this.move = function(x, y) {
		if (y > PADDING_TOP) {


		}
	};

	this.lbtn_down = function(x, y) {
		var t;
		if (y > PADDING_TOP) {
			t = this.getPlaylistId(y);
			if (t != null) {
				fb.ActivePlaylist = t;
				this.drag = true;
			}
		}
	}

	this.lbtn_up = function(x, y) {
		if (this.drag) this.drag = false;
	}

	this.dblclk =function(x, y) {
	}

	this.rbtn_up = function(x, y) {
	}

	this.leave = function() {
	}

	this.getPlaylistId = function(y) {
		var p = Math.floor((y - PADDING_TOP) / ROW_HEIGHT) + this.startIdx;
		if (p >= 0 && p < fb.PlaylistCount) return p;
		else return null;
	};

	var lc = DT_VCENTER | DT_CALCRECT | DT_SINGLELINE | DT_END_ELLIPSIS;
	var cc = DT_CENTER | lc;

	this.draw = function(gr) {
		var list_item_x = p.x + PADDING_LEFT;
		var list_item_w = p.w - PADDING_RIGHT - PADDING_LEFT;
		var icon_w = 35;
		var text_x = list_item_x + icon_w;
		var text_w = list_item_w - icon_w;


		// draw playlist items only
		var text_color, bg_color; 
		var idx = 0;
		for (var k = 0 ; (k + this.startIdx < fb.PlaylistCount) && (k <= this.visibleItemCount); k++) {
			idx = k + this.startIdx;
			// for test
			// draw playlist background
			if (idx == fb.ActivePlaylist) {
				gr.FillSolidRect(list_item_x, k * ROW_HEIGHT + PADDING_TOP + 5, list_item_w, ROW_HEIGHT - 5*2, ui.bg_active);
			};
			var icon_text = String.fromCharCode(pm.arr[idx][0] ? 0x2c : 0x29);

			// draw text
			if (fb.IsPlaying && idx == fb.PlayingPlaylist) {
				text_color = ui.text_playing;
			} else {
				text_color = ui.text_normal;
			}
			gr.GdiDrawText(icon_text, ui.font_wd2, text_color, list_item_x, k * ROW_HEIGHT + PADDING_TOP + 5, icon_w, ROW_HEIGHT - 5 * 2, cc);
			gr.GdiDrawText(pm.arr[idx][1], ui.item_font, text_color, text_x, k * ROW_HEIGHT + PADDING_TOP + 5, text_w, ROW_HEIGHT - 5 * 2, lc);
		}
	}
};


var list = new ListObject();


function on_size() {
	if (!window.Width || !window.Height) return ;
	p.w = window.Width;
	p.h = window.Height;
	list.on_size();
}

function on_paint(gr) {
	gr.FillSolidRect(0, 0, window.Width, window.Height, RGB(255, 255, 255));
	pi.draw(gr);
	list.draw(gr);
}

function on_mouse_wheel(delta) {
	list.wheel(delta);
}

function on_mouse_lbtn_down(x, y, m) {
	list.lbtn_down(x, y);
}

function on_mouse_lbtn_up(x, y, m) {
	list.lbtn_up(x, y);
}

function on_playlists_changed() {
	p.repaint();
};

function on_playlist_switch() {
	p.repaint();
};

function on_playback_starting() {
	p.repaint();
}

function on_playback_stop() {
	p.repaint();
}

// TODO:
// 2015/05/11 
// * add NowPlaying, Faverite, History items;
// * add "Create New Playlist" item
// * finish and enhance
