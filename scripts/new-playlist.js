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
	this.getColors = function() {
		if (this.type) {
			this.colors.text =  window.GetColorDUI(ColorTypeDUI.text);
			this.colors.selection = window.GetColorDUI(ColorTypeDUI.selection);
			this.colors.backgroud = window.GetColorDUI(ColorTypeDUI.background);
			this.colors.highlight = window.GetColorDUI(ColorTypeDUI.highlight);
		} else {
			try {
				this.colors.text = window.GetColorCUI(ColorTypeCUI.text);
				this.colors.selection = window.GetColorCUI(ColorTypeCUI.selection_background);
				this.colors.background = window.GetColorCUI(ColorTypeCUI.background);
				this.colors.highlight = window.GetColorCUI(ColorTypeCUI.highlight);
			} catch (e) {};
		}
		this.themeType = Luminance(this.colors.background) > 0.6 ? 1 : 0;
		this.colors.foused = RGB(127, 127, 127);
	};
	this.getColors();

	this.getFonts = function() {
		var fontError = false;
		if (this.type) {
			this.fonts.item = window.GetFontDUI(FontTypeDUI.playlists);
		} else {
			try {
				this.fonts.item = window.GetFontDUI(FontTypeCUI.items);
			} catch (e) {};
		}
		// if failed to load fonts
		try {
			this.fonts.name = this.fonts.item.Name;
			this.fonts.size = this.fonts.item.Size;
			this.fonts.style = this.fonts.item.Style;
		} catch (e) {
			this.fonts.name = 'Segoe ui';
			this.fonts.size = 12;
			this.fonts.style = 0;
			fontError = true;
		}
		
		if (fontError) this.fonts.item = gdi.Font(this.fonts.name, this.fonts.size, this.fonts.style);
		this.fonts.nameBold = this.fonts.name;
		if (this.fonts.name.toLowerCase() == 'segoe ui semibold') {
			this.fonts.nameBold = 'segoe ui';
			this.fonts.itemBold = gdi.Font("segoe ui", this.fonts.size, this.fonts.style);
		};

		// set row height;
	};
	this.getFonts();
}

var ui = new UserInterface();

function on_font_changed() {
	ui.getFonts();
	p.repaint();
}

function on_colors_changed() {
	ui.getColors();
	p.repaint();
};
	
	




function Panel() {
	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	};
	this.repaint = function() {
		window.Repaint();
	};
}

var p = new Panel();

function Group(idx, metadb, firstItemIdx, lastItemIdx) {
	this.idx = idx;
	this.firstItemIdx = firstItemIdx;
	this.lastItemIdx = lastItemIdx;
	this.count = this.lastItemIdx - this.firstItemIdx + 1;
};


function PlaylistItems() {
	var grp_pattern = "%album artist% %album%";
	this.listId = fb.ActivePlaylist;
	this.handles;
	this.titles = [];
	this.groups = [];
	this.items = [];
	this.init = function(callback) {
		this.count = plman.PlaylistItemCount(this.listId);
		this.handles = plman.GetPlaylistItems(this.listId);

		this.groups = [];
		this.items = [];
		this.titles = [];
		var firstItemIdx = 0;
		var groupId = 0;
		
		var metadb, curr, prev;

		for (var j = 0; j < this.count; j++) {
			this.titles[j] = $("%title%", this.handles.Item(j));
			metadb = this.handles.Item(j);
			curr = $(grp_pattern, metadb);
			if (curr != prev) {
				if (groupId > 0) {
					this.groups[groupId - 1] = new Group(groupId - 1, metadb, firstItemIdx, j - 1);
					firstItemIdx = j;
				}

				groupId += 1;
				prev = curr;

			}
			this.items[j] = metadb;

		};
		this.groups[groupId - 1] = new Group(groupId - 1, metadb, firstItemIdx, j - 1);

		fb.trace("group count: " + this.groups.length);
		for (var i = 0; i < this.groups.length; i++) {
			//fb.trace(this.groups[i].firstItemIdx);
			//fb.trace(this.groups[i].idx);
			fb.trace(this.groups[i].count);
		}


		callback && callback();
	};
	this.init(function() {
		p.repaint();
	});
};

var tks = new PlaylistItems();

function Scrollbar() {
	this.show = false;
}

var scrb = new Scrollbar();


function Playlist() {

	var PADDING_TOP = 35;
	var PADDING_LEFT = 15;
	var PADDING_RIGHT = PADDING_LEFT;
	var PADDING_BOTTOM = 15;

	this.rowH = 28;
	this.startIdx = 0;
	this.repaint = function() {
		p.repaint();
	};
	this.groupHeaderRows = 2;
	this.minGroupRows = 5;

	this.rows = [];

	this.init = function() {
		var rows;
		var idx = 0;
		for (var i = 0; i < tks.groups.length; i++) {
			rows = tks.groups[i].count + this.groupHeaderRows;
			if (rows < this.minGroupRows) rows = this.minGroupRows;
			for (var j = 0; j < rows; j++) {
				this.rows[idx] = 
				
		//if (rows 
	};

	this.onSize = function() {
		this.x = PADDING_LEFT;
		this.y = PADDING_TOP;
		this.h = p.h - PADDING_TOP - PADDING_BOTTOM;
		this.w = p.w - PADDING_LEFT - PADDING_RIGHT;
		this.visibleItemCount = Math.min(this.h / this.rowH) | 0;

		scrb.show = (tks.count > this.visibleItemCount);

		if (this.startIdx + this.visibleItemCount > tks.count) {
			this.startIdx = tks.count - this.visibleItemCount;
		}
		if (this.startIdx < 0) this.startIdx = 0;
	};

	var lc = DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS;
	var cc = lc | DT_CENTER;
	var lt = DT_CALCRECT | DT_END_ELLIPSIS;

	this.draw = function(gr) {
		var rX = this.x;
		var rW = this.w;
		var rH = this.rowH;
		var rY;
		var tX = rX + 10;
		var tW = rW - 20;
		var ft = ui.fonts.item;
		var cl = ui.colors.text;
		var idx = 0;
		var tP = (this.rowH - ui.fonts.item.Height)/2;

		for (var k = 0; (k + this.startIdx < tks.count) && (k <= this.visibleItemCount); k++) {
			idx = k + this.startIdx;
			rY = this.y + k * this.rowH;
			rH = this.rowH;

			if (rY + rH > this.y + this.h) {
				rH = rH - (rY + rH - this.y - this.h);
			}

			//if (k % 2 == 1)
			gr.FillSolidRect(rX, this.y + k * this.rowH, rW, rH, 0x10000000);

			if (rY + this.rowH > this.y + this.h) {
				gr.GdiDrawText(tks.titles[idx], ft, cl, tX, rY + tP, tW, rH-tP, lt);
			} else {
				gr.GdiDrawText(tks.titles[idx], ft, cl, tX, rY, tW, rH, lc);
			}


				

			//if (k % 2 !== 0) gr.FillSolidRect(rX, this.y + k * this.rowH, rW, this.rowH, 0xffffffff);

			//if (k < this.visibleItemCount) {
			//}
		}
	};

	this.wheel = function(delta) {
		if (scrb.show) {
			this.startIdx -= delta * 3;
			this.startIdx = this.startIdx < 0 ? 0 : this.startIdx;
			if (this.startIdx > tks.count - this.visibleItemCount)  {
				this.startIdx = tks.count - this.visibleItemCount;
			};
			this.repaint();
		}
	}

	
};

var li = new Playlist();



function on_size() {
	if (!window.Width || !window.Height) return;
	p.setSize(0, 0, window.Width, window.Height);
	li.onSize();
}

function on_paint(gr) {
	li.draw(gr);
}

function on_mouse_wheel(delta) {
	li.wheel(delta);
}


