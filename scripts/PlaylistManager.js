///////////////////////////////////////////  objects
// scrollbar and scroll function
oScroll = function (parent, vertical) {
	this.parent = parent;
	this.vertical = vertical;
	this.needed = false;
	this.visible = false;
	this.cursorClicked = false;
	this.hoverCursor = false;

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.refresh();
	};

	this.refresh = function() {
		if (this.parent.visible && this.parent.showScrollbar) {
		   	this.visible =true;
		} else {
			this.visible = false;
		}

		if (this.vertical) {
			if (this.parent.visible && this.parent.total > this.parent.totalRows) {
			   this.needed = true;
			} else {
				this.needed = false;
			}
		};

		if (this.visible && this.needed) {
			this.cursorH = this.parent.totalRows / this.parent.total * this.h;
			this.cursorY = this.parent.startId / this.parent.total * this.h + this.y;
			if (this.cursorH < 25) {
				this.cursorH = 25;
				this.cursorY = this.parent.startId / this.parent.total * (this.h - this.cursorH) + this.y;
			};
		};

	};

	this.draw = function(gr) {
		if (!this.needed || !this.visible) return;

		gr.FillSolidRect(this.x, this.y, this.w, this.h, colors.normalTxt & 0x10ffffff);
		if (this.cursorClicked) {
			gr.FillSolidRect(this.x, this.cursorY, this.w, this.cursorH, colors.normalTxt & 0x99ffffff);
		} else {
			if (this.hoverCursor) {
				gr.FillSolidRect(this.x, this.cursorY, this.w, this.cursorH, colors.normalTxt & 0x55ffffff);
			} else {
				gr.FillSolidRect(this.x, this.cursorY, this.w, this.cursorH, colors.normalTxt & 0x33ffffff);
			}
		}
		//}
	};

	this.isHover =function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y +  this.h);
	}

	this.monitor = function(event, x, y, mask) {
		if (!this.needed || !this.visible) return;

		this.hoverCursor = this.isHover(x, y) && (y > this.cursorY && y < this.cursorY + this.cursorH);

		switch(event) {
			case "move":
				if (this.hoverCursor != this.hoverCursorSaved) {
					this.hoverCursorSaved = this.hoverCursor;
					this.parent.repaint();
				};

				if (this.cursorClicked) {
						this.cursorY = y - this.cursorClickedDelta;
						if (this.cursorY < this.y) {
							this.cursorY = this.y;
						};
						if (this.cursorY + this.cursorH > this.y + this.h) {
							this.cursorY = this.y + this.h - this.cursorH;
						};
						this.parent.startId = Math.floor((this.cursorY - this.y) * this.parent.total / this.h);
						this.parent.checkStartId();
						this.parent.repaint();
				};
				break;
			case "down":
				if (this.isHover(x, y)) {
					if (y < this.cursorY) {
						this.scroll(3) && this.parent.repaint();
					}
					if (y > this.cursorY && y < this.cursorY + this.cursorH) {
						this.cursorClicked = true;
						this.cursorClickedDelta = y - this.cursorY;
						this.parent.repaint();
					}
					if (y > this.cursorY + this.cursorH) {
						this.scroll(-3) && this.parent.repaint();
					};
				};
				break;
			case "up":
				this.cursorClicked = false;
				this.parent.repaint();
				break;
		}

	};

	this.scroll = function(delta) {
		this.parent.startId -= delta;
		return this.parent.checkStartId();
	};

};


oPlaylist = function(idx, parent) {
	this.idx = idx;
	this.name = plman.GetPlaylistName(this.idx);
	this.isAuto = fb.IsAutoPlaylist(this.idx);
	this.totalTracks = fb.PlaylistItemCount(this.idx);
	this.closebtn = null;
};

oPlaylistManager = function(objectName) {
	this.objectName = objectName;
	this.visible = true;

	this.playlist = [];
	this.scrollbar = new oScroll(this, true);
	this.scrollbarW = 0;

	this.totalRows = 0;
	this.startId = 0;
	this.rightClickedId = -1;
	this.dragId = -1;
	this.dragHoverId = -1;
	this.oldHoverId = -1;
	this.hoverId = -1;
	this.activeId = fb.ActivePlaylist;

	this.showCount = window.GetProperty("plman.Show Playlist Count", true);
	this.showScrollbar = window.GetProperty("plman.Show Scrollbar", true);
	this.rowHeight = window.GetProperty("plman.Row Height", 30);
	this.marginT = 0;


	this.setFonts = function() {
		this.font_item = gdi.font(g_font_name, 12, 0);
		this.font_header = gdi.Font(g_font_name, 16, 0);
	};
	this.setFonts();

	this.repaint = function() {
		//window.RepaintRect(this.x, this.y, this.w, this.h);
		window.Repaint();
	};

	this.setSize = function(x, y,w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.totalRows = Math.floor(this.h / this.rowHeight);
		this.checkStartId();
		var scrbW = 10;
		this.scrollbar.setSize(this.x + this.w - scrbW - 0, this.y, scrbW, this.h);
	};

	this.checkStartId = function() {
		var ret = true;
		if (this.startId + this.totalRows > this.total) {
			this.startId = this.total - this.totalRows;
			ret = false;
		};
		if (this.startId < 0) {
			this.startId = 0;
			ret = false;
		};
		return ret;
	};

	this.refresh = function(repaint) {
		this.playlist = [];
		this.total = fb.PlaylistCount;
		
		for (var i = 0; i < this.total; i++) {
			this.playlist[i] = new oPlaylist(i, this);
		};

		this.scrollbar.refresh();
		repaint && this.repaint();
	};

	this.refresh();

	this.draw = function(gr) {
		if (!this.visible) {
			return;
		};
		var cx, cy, cw, ch;
		var idx;
		var color_txt;
		var icon, iconX, iconW, iconY, iconId;
		var countX, countW;
		var pad = 8;

		if (this.scrollbar.needed && this.scrollbar.visible) {
			this.scrollbarW = this.scrollbar.w + 2;
		} else {
			this.scrollbarW = 0;
		};

		ch = this.rowHeight;

		idx = 0;

		for (var k = 0; (k + this.startId < this.total) && k <= this.totalRows; k++) {
			idx = k + this.startId;
			cy = this.y + k * ch;

			color_txt = colors.normalTxt;

			// item bg
			if (idx == this.activeId) {
				gr.FillSolidRect(this.x, cy, this.w - this.scrollbarW, ch, colors.selectedBg & 0x39ffffff);
				gr.DrawRect(this.x, cy, this.w - this.scrollbarW - 1, ch - 0, 1, colors.selectedBg);
			}
			if (idx == this.hoverId && this.dragId < 0) {
				gr.FillSolidRect(this.x, cy, this.w - this.scrollbarW, ch, colors.selectedBg & 0x20ffffff);
				gr.DrawRect(this.x, cy, this.w - this.scrollbarW - 1, ch - 0, 1, colors.selectedBg & 0xa0ffffff);
			};

			iconId = 0;
			if (idx == fb.PlayingPlaylist && fb.IsPlaying) {
				color_txt = colors.highlight;
				iconId = 1;
			};

			// icons
			//icon = this.playlist[idx].isAuto ? images.autoList : images.list;
			icon = images.list;
			if (this.playlist[idx].isAuto) icon = images.autoList;
			if (this.playlist[idx].name.slice(0, 8) == "Search [") icon = images.searchList;
			iconW = icon[0].Width;
			iconX = this.x + pad;
			iconY = cy + (this.rowHeight - iconW) / 2;

			try {
				gr.DrawImage(icon[iconId], iconX, iconY, iconW, iconW, 0, 0, iconW, iconW, 0, 255);
			} catch (e) {};

			// item count
			countW = 0;
			if (this.showCount){
				countW = Math.ceil(gr.CalcTextWidth(this.playlist[idx].totalTracks, this.font_item));
			};

			if (countW > 0) {
				countX = this.x + this.w - this.scrollbarW - countW - pad;
				gr.GdiDrawText(this.playlist[idx].totalTracks, this.font_item, colors.normalTxt, countX, cy + 1, countW, ch, dt_lc);
			};

			// items
			cx = iconX + iconW + pad;
			cw = countX - cx - pad;

			gr.GdiDrawText(this.playlist[idx].name, this.font_item, color_txt, cx, cy + 1, cw, ch, dt_lc);

			// drag split-line
			if (this.dragId > -1 && this.dragHoverId == idx) {
				//if (this.dragId > this.dragHoverId) {
					gr.DrawLine(this.x, cy+1, this.x + this.w - this.scrollbarW, cy+1, 2, colors.highlight);
				//} else {
				//	gr.DrawLine(this.x, cy+ch, this.x + this.w - this.scrollbarW, cy+ch, 2, colors.highlight);
				//};
			};

		};

		if (this.dragId > -1 && this.dragHoverId == this.total) {
			var max = Math.min(this.totalRows, this.total);
			var Y = this.y + max * this.rowHeight + 1;
			gr.DrawLine(this.x, Y, this.x + this.w - this.scrollbarW, Y, 2, colors.highlight);
		};

		// scrollbar
		this.scrollbar.draw(gr);
	};

	this.isHover = function(x, y) {
		return (x > this.x && x < this.x + this.w - this.scrollbarW && y > this.y && y < this.y + this.h);
	};

	this.on_mouse = function(event, x, y, mask) {
		this._isHover = this.isHover(x, y);
		this._isHoverScroll = this.scrollbar.isHover(x, y);

		this.hoverId = -1;
		if (this._isHover) {
			this.hoverId = Math.floor((y - this.y) / this.rowHeight) + this.startId;
			if (this.hoverId < 0 || this.hoverId >= this.total) {
				this.hoverId = -1;
			};
		};

		switch(event) {
			case "move":
				this.scrollbar.monitor("move", x, y);

				if (this.hoverId != this.hoverIdSaved) {
					this.hoverIdSaved = this.hoverId;
					this.repaint();
				};


				if (this.dragId > -1) {
					if (this.hoverId > -1) {
						this.dragHoverId = this.hoverId;
					};
					if (this.totalRows < this.total) {

						window.ClearInterval(plm.scrollTimer);

						if (y < this.y + this.rowHeight) {
							this.scrollTimer = window.SetInterval(function() {
								var scrolling = plm.scrollbar.scroll(1);
								if (scrolling) {
									plm.scrollbar.refresh();
									plm.dragHoverId = plm.startId;
									plm.repaint();
								} else {
									window.ClearInterval(plm.scrollTimer);
								}
							}, 100);
						} else 
						if (y > this.y + this.h - this.rowHeight) {
							this.scrollTimer = window.SetInterval(function() {
								var scrolling = plm.scrollbar.scroll(-1);
								if (scrolling) {
									plm.scrollbar.refresh();
									plm.dragHoverId = plm.startId + plm.totalRows;
									plm.repaint();
								} else {
									window.ClearInterval(plm.scrollTimer);
								}
							}, 100);
						} else 
						{
						};
					} else {
						if (y < this.y) this.dragHoverId = 0;
						if (y > this.y + this.total * this.rowHeight){
						   this.dragHoverId = this.total;
						   this.repaint();
						}
					}
				};
				break;
			case "lbtn_down":
				if (this._isHoverScroll) {
					this.scrollbar.monitor("down", x, y, mask);
				} else {
					if (this.hoverId > -1) {
						if (this.hoverId != this.activeId) {
							this.activeId = this.hoverId;
							this.repaint();
							fb.ActivePlaylist = this.activeId;
						} else {
							this.dragId = this.hoverId;
						};
					};
				};
				break;
			case "dblclk":
				if (this._isHoverScroll) {
					this.scrollbar.monitor("down", x, y);
				} else {
					if (this.hoverId > -1) {
						fb.PlayingPlaylist = this.hoverId;
						fb.Play();
					}
				};
				break;
			case "lbtn_up":
				this.scrollbar.monitor("up", x, y);
				if (this.dragId > -1) {
					if (this.dragHoverId > -1) {
						if (this.dragHoverId == this.total) {
							fb.MovePlaylist(this.dragId, this.dragHoverId - 1);
						} else {
							fb.MovePlaylist(this.dragId, this.dragHoverId);
						};
					};
					this.dragId = -1;
					this.dragHoverId = -1;
					this.repaint();
				};
				break;
			case "rbtn_down":
				break;
			case "rbtn_up":
				if (this._isHover) {
					this.contextMenu(x, y, this.hoverId);
				}
				break;
			case "leave":
				this.hoverId = -1;
				this.hoverIdSaved = -1;
				this.repaint();
				break;
			case "wheel":
				if (this.totalRows < this.total) {
					if (this.scrollbar.scroll(mask)) {
						this.scrollbar.refresh();
						this.repaint();
					};
				};
				break;
				
		};

	};

	this.contextMenu = function(x, y, pl) {
		var MF_SEPARATOR = 0x00000800;
		var MF_STRING = 0x00000000;
		var _menu = window.CreatePopupMenu();
		var _newplaylist = window.CreatePopupMenu();
		var addMode = (pl == null || pl < 0);
		var isAuto = fb.IsAutoPlaylist(pl);
		var idx;

		if (!addMode){
			_menu.AppendMenuItem(MF_STRING, 100, "Rename");
			_menu.AppendMenuItem(MF_STRING, 101, "Delete");
			_menu.AppendMenuItem(MF_STRING, 102, "Duplicate");
			_menu.AppendMenuItem(MF_STRING, 103, "Save...");
			_menu.AppendMenuSeparator();

			_newplaylist.AppendTo(_menu, MF_STRING, "Insert...");

		} else {
			pl = fb.PlaylistCount;
			_newplaylist.AppendTo(_menu, MF_STRING, "Add...");
		};
		_menu.AppendMenuItem(MF_STRING, 104, "Load playlist...");

		if (!addMode) {
			if (isAuto) {
				_menu.AppendMenuSeparator();
				_menu.AppendMenuItem(MF_STRING, 105, "Edit autoplaylist...");
				_menu.AppendMenuItem(MF_STRING, 106, "Convert to a normal playlist");
			};
		}

		_newplaylist.AppendMenuItem(MF_STRING, 200, "New playlist...");
		_newplaylist.AppendMenuItem(MF_STRING, 201, "New autoplaylist...");

		idx = _menu.TrackPopupMenu(x, y);

		switch(idx) {
			case 100:
				break;
			case 101:
				plman.RemovePlaylist(pl);
				break;
			case 102:
				plman.DuplicatePlaylist(pl, "");
				break;
			case 103:
				fb.SavePlaylist();
				break;
			case 104:
				fb.LoadPlaylist();
				break;
			case 105:
				break;
			case 106:
				break;
			case 200:
				fb.RunMainMenuCommand("File/New playlist");
				break;
			case 201:
				break;
		};

		this.rightClickedId = -1;
		this.repaint();

		_newplaylist.Dispose();
		_menu.Dispose();

		return true;
	};
};


////////////////////////////////////////////////////// globals

var panel_name = "Playlist Manager"
// font
var g_font_name = "Segoe UI";


//
var ww, wh;
var margin = { t: 2, b: 2, l: 2, r: 2};
var dt_lc = DT_VCENTER | DT_LEFT | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;

prop = {
	useCustomColor: window.GetProperty("system.Use Custom Color", false),

};

colors = {
	normalTxt: 0,
	selectedTxt: 0,
	normalBg: 0,
	selectedBg: 0,
	highlight: 0,
};

images = {
	list: null,
	autoList: null,
	searchList: null,
};


var plm;
plm = new oPlaylistManager("PlaylistManager");

////////////////////////////////////////////////////////// main process
getColors();
getImages();


///////////////////////////////////////////////////////// callback functions
function on_size() {
	if (!window.Width || !window.Height)  { return; }
	//window.MinWidth = window.MaxWidth = 220;

	window.DlgCode = DLGC_WANTALLKEYS;
	ww = window.Width;
	wh = window.Height;

	plm.setSize(margin.l, margin.t, ww - margin.l - margin.r, wh - margin.t - margin.b);
};

function on_paint(gr) {
	gr.FillSolidRect(0, 0, ww, wh, colors.normalBg);
	plm.draw(gr);
};


///////////////////////////////////////// Mouse event callbacks
function on_mouse_move(x, y, mask) {
	plm.on_mouse("move", x, y);
};

function on_mouse_lbtn_down(x, y, mask) {
	window.NotifyOthers("another_panel_is_clicked", panel_name);
	plm.on_mouse("lbtn_down", x, y);
};

function on_mouse_lbtn_up(x, y, mask) {
	plm.on_mouse("lbtn_up", x, y);
};

function on_mouse_rbtn_up(x, y, mask) {
	plm.on_mouse("rbtn_up", x, y);
	return true;
};

function on_mouse_rbtn_down(x, y, mask) {
	plm.on_mouse("rbtn_down", x, y);
};

function on_mouse_lbtn_dblclk(x, y, mask) {
	plm.on_mouse("dblclk", x, y);
};

function on_mouse_wheel(delta) {
	plm.on_mouse("wheel", 0, 0, delta);
};


////////////////////////////////////////// playlist callbacks
function on_playlist_switch() {
	plm.activeId = fb.ActivePlaylist;
	plm.repaint();
};

function on_playlists_changed() {
	plm.activeId = fb.ActivePlaylist;
	plm.refresh(true);
};

function on_playlist_items_added(playlist) {
	plm.refresh(true);
};


function on_playlist_items_removed(playlist, new_count) {
	plm.refresh(true);
};

///////////////////////////////////////////// playback callbacks
function on_playback_starting() {
	plm.repaint();
};

function on_playback_stop(reason) {
	plm.repaint();
};


function on_colors_changed() {
	getColors();
	getImages();
	window.Repaint();
};


function on_notify_data(name, info) {
	if (info == "IsHoverOtherPanel") {
		plm.on_mouse("move", -1, -1, 0);
	};
};

///////////////////////////////////////////// functions
function getImages() {

	var fontAwesome = gdi.Font("FontAwesome", 14, 0);
	var w = 22;
	var cNormal, cPlaying, c;
	var s, imgArr, img, g;
	var sf = StringFormat(1, 1);

	cNormal = colors.normalTxt & 0xaaffffff;
	cPlaying = colors.highlight;

	imgArr = [];
	for (s = 0; s < 2; s++) {
		c = cNormal;
		if (s == 1) {
			c = cPlaying;
		};

		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(4);
		//
		g.DrawString("\uf001", fontAwesome, c, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.list = imgArr;

	imgArr = [];
	for (s = 0; s < 2; s++) {
		c = ((s == 1) ? cPlaying : cNormal);
		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(4);
		g.DrawString("\uf013", fontAwesome, c, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.autoList = imgArr;

	imgArr = [];
	for (s = 0; s < 2; s++) {
		c = ((s == 1) ? cPlaying : cNormal);
		img = gdi.CreateImage(w, w);
		g = img.GetGraphics();
		g.SetTextRenderingHint(4);
		g.DrawString("\uf002", fontAwesome, c, 0, 0, w, w, sf);
		img.ReleaseGraphics(g);
		imgArr[s] = img;
	};
	images.searchList = imgArr;
};

function getColors() {
	colors.normalTxt = eval(window.GetProperty("custom.Color normal text", "RGB(180, 180, 180)"));
	colors.selectedTxt = eval(window.GetProperty("custom.Color selected text", "RGB(255, 255, 255)"));
	colors.normalBg = eval(window.GetProperty("custom.Color normal background", "RGB(25, 25, 25)"));
	colors.selectedBg = eval(window.GetProperty("custom.Color selected background", "RGB(130, 150, 255)"));
	colors.highlight = eval(window.GetProperty("custom.Color highlight", "RGB(255, 170, 50)"));
	if (!prop.useCustomColor) {
		if (window.InstanceType == 1) { // dui
			colors.normalTxt = window.GetColorDUI(ColorTypeDUI.text);
			colors.selectedBg = window.GetColorDUI(ColorTypeDUI.selection);
			colors.normalBg = window.GetColorDUI(ColorTypeDUI.background);
			colors.highlight = window.GetColorDUI(ColorTypeDUI.highlight);

			var c = combineColors(colors.normalBg, colors.selectedBg & 0x55ffffff);
			colors.selectedTxt = DetermineTextColor(c);
		} else {
			// else
		};
	};
};

function combineColors(bg, color) {
	var b = toRGB(bg);
	var c = [getRed(color), getGreen(color), getBlue(color), getAlpha(color) / 255];
	return RGB(
			(1 - c[3]) * b[0] + c[3] * c[0],
			(1 - c[3]) * b[1] + c[3] * c[1],
			(1 - c[3]) * b[2] + c[3] * c[2]
		  );
}

function DetermineTextColor(bk) {
	return (Luminance(bk) > 0.6 ? 0xff000000 : 0xffffffff);
}

// brightness of a color
function Luminance(color) {
	color = toRGB(color);
	return (0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]) / 255.0;
}

