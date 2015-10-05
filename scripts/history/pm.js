oPlaylistManager = function(objectName) {
	this.objectName = objectName;
	this.visible = true;
	this.playlist = [];
	this.scrollbar = null;
	this.scrollbarW = 0;

	this.total;
	this.totalRows = 0;
	this.startId = 0;
	this.hoverId = -1;
	this.activeId = -1;

	this.rowHeight = 24;
	this.showCount = true;


	// set font
	this.setFonts = function() {
		this.fontItem = gdi.Font(g_fontName, 12, 0);
	};
	this.setFonts();

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w, this.h);
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.totalRows = (this.h / this.rowHeight) | 0;
		this.checkStartId();
	};

	this.checkStartId = function() {
		var _ret = true;
		if (this.startId + this.totalRows > this.total) {
			this.startId = this.total - this.totalRows;
			_ret = false;
		}
		if (this.startId < 0) {
			this.startId = 0;
			_ret = false;
		}
		return _ret;
	};

	this.refresh = function(repaint) {
		this.playlist = [];
		this.total = fb.PlaylistCount;
		for (var i = 0; i < this.total; i++) {
			this.playlist[i] = {};
			this.playlist[i].name = plman.GetPlaylistName(i);
			this.playlist[i].isAuto = fb.IsAutoPlaylist(i);
			this.playlist[i].totalTracks = fb.PlaylistItemCount(i);
		};
		repaint && this.repaint();
	};
	this.refresh();

	this.draw = function(gr) {
		if (!this.visible) return;
		var idx;
		var rx, ry, rw, rh;
		var textColor, backColor;
		var icon, iconX, iconW, iconY;
		var countX, countW;

		rh = this.rowHeight;

		for (var k = 0; (k + this.startId < this.total) && k <= this.totalRows; k++) {
			idx = k + this.startId;
			ry = this.y + k * rh;

			// item bg
			textColor = panelColor.txt;
			backColor = panelColor.bg;
			if (idx == this.activeId) {
				backColor = blendColors(panelColor.bg, panelColor.txt, 0.2);
				gr.FillSolidRect(this.x, ry, this.w, rh, backColor);
			}
			if (idx == this.hoverId) {
				backColor = blendColors(panelColor.bg, panelColor.sel, 0.2);
			};
			if (idx == fb.PlayingPlaylist && fb.IsPlaying) {
				textColor = panelColor.high;
			};

			// icon
			iconX = 0;
			iconW = rh;

			// item count
			countW = 0;
			countX = this.x + this.w;
			if (this.showCount) {
				countW = Math.ceil(gr.CalcTextWidth(this.playlist[idx].totalTracks, this.fontItem));
			}
			if (countW > 0) {
				countX = countX - countW;
				gr.GdiDrawText(this.playlist[idx].totalTracks, this.fontItem, textColor, countX, ry, countW, rh, dt_lc);
			}

			// playlist name
			rx = iconX + iconW + 5;
			rw = countX - rx - 5;
			gr.GdiDrawText(this.playlist[idx].name, this.fontItem, textColor, rx, ry, rw, rh, dt_lc);
		};

	};

};




var panelColor = {
	txt: 0,
	bg: 0,
	sel: 0,
	high: 0,
};

var images = {
};

var ww, wh;
var g_fontName = "Segoe UI";
var dt_lc = DT_VCENTER | DT_LEFT | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
var margin = {r: 15, l: 15, t: 15, b: 15};









prop = {
	useCustomColor: window.GetProperty("user.Use Custom Color", false),
}


var plmanager = new oPlaylistManager("Playlist Manager");


/////////////////////////////////////////// callbacks
function on_size() {
	if (!window.Width || !window.Height) return;
	ww = window.Width;
	wh = window.Height;

	plmanager.setSize(margin.l, margin.t, ww - margin.l - margin.r, wh - margin.t - margin.b);
};

function on_paint(gr) {
	gr.FillSolidRect(0, 0, ww, wh, panelColor.bg);
	plmanager.draw(gr);
};


/////////////////////////////////////////// functions
function getColors() {
	if (prop.useCustomColor) {
		panelColor.txt = eval(window.GetProperty("user.Custom Panel Color", "RGB(0, 0, 0)"));
		panelColor.bg = eval(window.GetProperty("user.Custom Panel Color", "RGB(245, 245, 245)"));
		panelColor.sel = eval(window.GetProperty("user.Custom Panel Color", "RGB(192, 192, 192)"));
		panelColor.high = eval(window.GetProperty("user.Custom Panel Color", "RGB(48, 48, 48)"));
	} else {
		if (window.InstanceType == 1) { // dui
			panelColor.txt = window.GetColorDUI(ColorTypeDUI.text);
			panelColor.bg = window.GetColorDUI(ColorTypeDUI.background);
			panelColor.sel = window.GetColorDUI(ColorTypeDUI.selection);
			panelColor.high = window.GetColorDUI(ColorTypeDUI.highlight);
		};
	};
};



