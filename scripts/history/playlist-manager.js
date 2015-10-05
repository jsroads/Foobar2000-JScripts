// created by Jeanne

var Item = {};

Item.playlistManager = function(id) {
	this.id = id;
	this.type = fb.IsAutoPlaylist(this.id) | 0;
	this.name = fb.GetPlaylistName(this.id);
	this.count = fb.PlaylistItemCount(this.id);
};

var ScrollbarObject = function() {
	this.show = false;
};

var scrb = new ScrollbarObject();

var List = {};
List.playlistManager = function() {

	var ROW_HEIGHT = 35;
	var LC = DT_VCENTER | DT_END_ELLIPSIS | DT_CALCRECT;
	var font = gdi.Font(g_font_name, 12, 0);

	this.startId = 0;
	this.playingId = -1;
	this.activeId = -1;
	this.hoverId = -1;
	//
	this.init = function() {
		this.items = [];
		var listCount = fb.PlaylistCount;
		for (var j = 0; j < listCount; j++) {
			this.items[j] = new Item.playlistManager(j);
		}
		this.activeId = fb.ActivePlaylist;
	};
	this.init();

	this.repaint = function() {
		window.Repaint();
	};


	this.locate = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.visibleItemCount = Math.floor(this.h/ROW_HEIGHT);
		scrb.show = (fb.PlaylistCount > this.visibleItemCount);
		if (this.startId + this.visibleItemCount > fb.PlaylistCount) this.startId = fb.PlaylistCount - this.visibleItemCount;
		if (this.startId < 0) this.startId = 0;
	}


	this.draw = function(gr) {
		var rY;
		var lid = 0, txtColor;
		var padding = 8;

		for (var k = 0; (k + this.startId < fb.PlaylistCount) && (k <= this.visibleItemCount); k++) {
			lid = k + this.startId;
			rY =  k * ROW_HEIGHT + this.y;

			// selected bg
			if (lid == this.activeId) {
				gr.FillSolidRect(this.x, rY + 2, this.w, ROW_HEIGHT-4, g_color_txt & 0x10ffffff);
			};

			// text color
			if (fb.IsPlaying && lid == fb.PlayingPlaylist) {
				txtColor = g_color_hi;
			} else {
				txtColor = g_color_txt;
			}
			// draw text
			gr.GdiDrawText(this.items[lid].name, font, txtColor, this.x + padding, rY, this.w - padding * 2, ROW_HEIGHT, LC);
		}
	};


	this.trace = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};

	var mx, my;
	
	this.check = function(event, x, y) {
		switch (event) {
			case "down":
				if (!this.trace(x, y)) { return; };
				this.activeId = this.getPlaylistId(y);
				if (this.activeId > -1) {
					fb.ActivePlaylist = this.activeId;
					this.repaint();
				}
				break;
			case "dblclk":
				if (!this.trace(x, y)) { return; };
				this.activeId = this.getPlaylistId(y);
				if (this.activeId > -1) {
					fb.ActivePlaylist = this.activeId;
					if (this.items[this.activeId].count > 0) {
						plman.ExecutePlaylistDefaultAction(this.activeId, 0);
					};
					this.repaint();
				}
				break;
			case "move":
				mx = x;
				my = y;
				break;
			case "wheel":
				if (!this.trace(mx, my)) { return; };
				if (fb.PlaylistCount > this.visibleItemCount) {
					var delta = x;
					this.startId -= delta;
					if (this.startId < 0) {
						this.startId = 0;
					}
					if (this.startId > fb.PlaylistCount - this.visibleItemCount) {
						this.startId = fb.PlaylistCount - this.visibleItemCount;
					}
					this.repaint();
				}
				break;
		}
	};

	var thisId;

	this.getPlaylistId = function(y) {
		var pl = Math.floor((y - this.y) / ROW_HEIGHT) + this.startId;
		if (pl >= 0 && pl < fb.PlaylistCount) {
			return pl;
		} else {
			return -1;
		}
	};


}



var g_font_name = "Segoe UI";
var g_color_txt = RGB(152, 152, 152);
var g_color_bg = RGB(40, 40, 40);
var g_color_sel = RGB(50, 50, 50);
var g_color_hi = RGB(192, 168, 50);


var li = new List.playlistManager();

function on_size() {
	if (!window.Width || !window.Height) return ;
	ww = window.Width;
	wh = window.Height;
	li.locate(0, 0, ww, wh);
}

function on_paint(gr) {
	gr.FillSolidRect(0, 0, ww, wh, g_color_bg);
	li.draw(gr);
}


function on_mouse_lbtn_down(x, y, m) {
	li.check("down", x, y);
}

function on_mouse_lbtn_dblclk(x, y, m) {
	li.check("dblclk", x, y);
}

function on_mouse_lbtn_up(x, y, m) {
}

function on_mouse_move(x, y, m) {
	li.check("move", x, y);
}

function on_mouse_wheel(delta) {
	li.check("wheel", delta);
}

function on_mouse_rbtn_up(x, y, m) {
	var VK_SHIFT = 4;
	if (m !== VK_SHIFT) {
	} else {
	}
}

function on_mouse_rbtn_down(x, y, m) {
}

function on_playlists_changed() {
	li.init();
	li.repaint();
};

function on_playlist_switch() {
	li.repaint();
};

function on_playback_starting() {
	li.repaint();
}

function on_playback_stop() {
	li.repaint();
}


// TODO:
// 2015/05/11 
// * add NowPlaying, Faverite, History items;
// * add "Create New Playlist" item
// * finish and enhance
