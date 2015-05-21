// updated 2015/05/11
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
		var endTime = curr - this.startTime;
		fb.trace('[' + this.msg + '] has finished at ' + endTime + ' ms');
	};
};

var Trace = new TraceLog();

function UserInterface() {
	this.type = window.InstanceType;
	this.color = {};
	this.font = {};
	this.getColor = function() {
		if (this.type) {
			this.color.text =  window.GetColorDUI(ColorTypeDUI.text);
			this.color.selection = window.GetColorDUI(ColorTypeDUI.selection);
			this.color.background = window.GetColorDUI(ColorTypeDUI.background);
			this.color.highlight = window.GetColorDUI(ColorTypeDUI.highlight);
		} else {
			try {
				this.color.text = window.GetColorCUI(ColorTypeCUI.text);
				this.color.selection = window.GetColorCUI(ColorTypeCUI.selection_background);
				this.color.background = window.GetColorCUI(ColorTypeCUI.background);
				this.color.highlight = window.GetColorCUI(ColorTypeCUI.highlight);
			} catch (e) {};
		}
		// process colors
	};
	this.getColor();

	this.getFonts = function() {
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

		this.font_item = gdi.font(this.font.Name, 12, 0);
		this.font_wd2 = gdi.font("wingdings 2", 22, 0);

	};
	this.getFonts();
};

var ui = new UserInterface();

function Panel() {
	this.repaint = function() {
		window.Repaint();
	};
	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.h = h;
		this.w = w;
	};
	this.setSize(0, 0, window.Width, window.Height);
	this.drawBg = function(gr) {
		gr.FillSolidRect(p.x, p.y, p.w, p.h, RGB(240, 240, 240));
	};
	this.console = function(str) {
		fb.trace(str);
	};
};

var p = new Panel();

var Item = {};

Item.playlistManager = function(id) {
	this.id = id;
	this.type = fb.IsAutoPlaylist(this.id) | 0;
	this.name = fb.GetPlaylistName(this.id);
	this.contentCount = fb.PlaylistItemCount(this.id);
	this.state = 0;
};

var ScrollbarObject = function() {
	this.show = false;
};

var scrb = new ScrollbarObject();

var List = {};
List.playlistManager = function() {
	//
	this.init = function(callback) {
		this.arr = [];
		var listCount = fb.PlaylistCount;
		for (var j = 0; j < listCount; j++) {
			this.arr[j] = new Item.playlistManager(j);
		}
		callback && callback();
	};
	this.init(function() { window.Repaint(); });

	var ROW_HEIGHT = 40;
	var PADDING_TOP = 8;
	var PADDING_LEFT = 8;
	var PADDING_RIGHT = 8;
	var PADDING_BOTTOM = 8;


	this.repaint = function() {
		window.Repaint();
	};

	this.x = p.x + PADDING_LEFT;
	this.y = PADDING_TOP;
	this.startId = 0;

	this.on_size = function() {
		this.h = p.h - PADDING_TOP - PADDING_BOTTOM;
		this.w = p.w - PADDING_LEFT - PADDING_RIGHT;
		this.visibleItemCount = Math.floor(this.h / ROW_HEIGHT) | 0;
		scrb.show = (fb.PlaylistCount > this.visibleItemCount);

		if (this.startId + this.visibleItemCount > fb.PlaylistCount) this.startId = fb.PlaylistCount - this.visibleItemCount;
		if (this.startId < 0) this.startId = 0;
	}

	var LT = DT_END_ELLIPSIS;

	this.on_paint = function(gr) {
		gr.FillSolidRect(this.x, this.y, this.w, this.h, 0xffffffff);
		var rX = this.x, rW = this.w, rY;
		var icoW = 32, icoH = ui.font_wd2.Height, icoY;
		var tX = rX + icoW, tW = rW - icoW, tH = ui.font_item.Height, tY;
		var lid = 0, txtColor, icoChar;

		for (var k = 0; (k + this.startId < fb.PlaylistCount) && (k <= this.visibleItemCount); k++) {
			lid = k + this.startId;
			rY =  k * ROW_HEIGHT + this.y;
			tY = rY + (ROW_HEIGHT - tH) / 2;
			icoY = rY + (ROW_HEIGHT - icoH) / 2 - 2;

			if (k == this.visibleItemCount) {
				tH = this.y + this.h - tY-1;
				icoH = this.y + this.h - icoY;
			};

			if (this.arr[lid].state == 2) {
				gr.FillSolidRect(rX, rY + 5, rW, ROW_HEIGHT-10,ui.color.text & 0x20ffffff);
			}
			if (lid == fb.ActivePlaylist) {
				gr.FillSolidRect(rX, rY + 5, rW, ROW_HEIGHT-10, ui.color.text & 0x10ffffff);
			};

			// icon char
			icoChar = String.fromCharCode(this.arr[lid].type ? 0x2c : 0x29);
			
			// text color
			if (fb.IsPlaying && lid == fb.PlayingPlaylist) {
				txtColor = ui.color.highlight;
			} else {
				txtColor = ui.color.text;
			}
			// draw text
			gr.GdiDrawText(icoChar, ui.font_wd2, txtColor, rX+8, icoY, icoW, icoH, LT);
			gr.GdiDrawText(this.arr[lid].name, ui.font_item, txtColor, tX, tY+2, tW, tH, LT);
		}
	};


	var thisId;

	this.move = function(x, y) {

	};

	this.lbtn_down = function(x, y) {
		var thisId;
		if (y > this.y && y < this.y + this.h) {
			thisId = this.getPlaylistId(y);
			if (thisId != null) {
				fb.ActivePlaylist = thisId;
			}
		}
	};

	this.rbtn_down = function(x, y) {
		if (y > this.y && y < this.y + this.h) {
			thisId = this.getPlaylistId(y);
			if (thisId) this.arr[thisId].state = 2;
			p.repaint();
		}
	}

	this.lbtn_up = function(x, y) {

	};

	this.rbtn_up = function(x, y) {
	};

	this.leave = function() {
	};

	this.wheel = function(delta) {
		if (scrb.show) {
			this.startId -= delta;
			this.startId = this.startId < 0 ? 0 : this.startId;
			if (this.startId > fb.PlaylistCount - this.visibleItemCount) {
				this.startId = fb.PlaylistCount - this.visibleItemCount;
			};
			this.repaint();
		};
	};

	this.getPlaylistId = function(y) {
		var pl = Math.floor((y - this.y) / ROW_HEIGHT) + this.startId;
		if (pl >= 0 && pl < fb.PlaylistCount) return pl;
		else return null;
	};


}

var li = new List.playlistManager();

function on_size() {
	if (!window.Width || !window.Height) return ;
	p.setSize(0, 0, window.Width, window.Height);
	li.on_size();
}

function on_paint(gr) {
	p.drawBg(gr);
	li.on_paint(gr);
}

function on_mouse_wheel(delta) {
	li.wheel(delta);
}

function on_mouse_lbtn_down(x, y, m) {
	li.lbtn_down(x, y);
}

function on_mouse_lbtn_up(x, y, m) {
	li.lbtn_up(x, y);
}

function on_mouse_rbtn_up(x, y, m) {
	var VK_SHIFT = 4;
	if (m !== VK_SHIFT) {
		return true;
	} else {
		li.rbtn_up(x, y);
	}
}

function on_mouse_rbtn_down(x, y, m) {
	li.rbtn_up(x, y);
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

function on_font_changed() {
	ui.getFonts();
	p.repaint();
}

function on_colors_changed() {
	ui.getColor();
	p.repaint();
}

// TODO:
// 2015/05/11 
// * add NowPlaying, Faverite, History items;
// * add "Create New Playlist" item
// * finish and enhance
