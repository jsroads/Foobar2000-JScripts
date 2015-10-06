oCover = function() {
	this.images = [];
	this.displayId = prop.defaultArt;

	this.getArtImages = function(metadb) {
		if (metadb == null) {
			this.images[this.displayId] = null;
			window.Repaint();
			return;
		};

		this.group = $(prop.groupFormat, metadb);

		if (this.group == this.groupSaved) {
			if (this.images[this.displayId] === null) {
				window.Repaint();
			};
			return;
		};

		this.displayId = prop.defaultArt;
		this.images = [];
		window.Repaint();
		window.ClearInterval(this.timer);

		var artId = 0;

		this.timer = window.SetInterval(function() {
			utils.GetAlbumArtAsync(window.ID, metadb, (artId == 3) ? artId = 4 : artId);

			if (artId >= 3) {
				window.ClearInterval(aart.timer);
			};

			artId++;
		}, 50);

		this.groupSaved = this.group;
	};

	this.onGetArtDone = function(metadb, art_id, image, image_path) {
		if (!image) {
			this.images[art_id] = null;
			if (this.displayId == art_id)
				window.Repaint();
			return;
		};

		if (art_id == 4) art_id = 3;

		var artW = image.Width;
		var artH = image.Height;

		if (this.group == $(prop.groupFormat, metadb)) {
			if (artW > artH) {
				if (artH > prop.maxImageSize) {
					var r = artW / artH;
					var newH = prop.maxImageSize;
					var newW = newH * r;
					image = image.Resize(newW, newH, 0);
				}
			} else {
				if (artW > prop.maxImageSize) {
					var r = artH / artW;
					var newW = prop.maxImageSize;
					var newH = newW * r;
					image = image.Resize(newW, newH, 0);
				};
			};

			var isEmbedded = (image_path.slice(image_path.lastIndexOf(".") + 1) == $("$ext(%path%)", metadb));
			this.images[art_id] = {};
			this.images[art_id].img = image;
			this.images[art_id].w = image.Width;
			this.images[art_id].h = image.Height;
			this.images[art_id].path = image_path;
			this.images[art_id].isEmbedded = isEmbedded;
		};

		if (art_id == this.displayId) {
			this.calcScale(this.images[this.displayId]);
			window.Repaint();
		};

	};

	this.calcScale = function(art_obj) {
		if (!art_obj) return;

		var artW = art_obj.w;
		var artH = art_obj.h;

		var sx = 0,
			sy = 0,
			sw = this.w / artW,
			sh = this.h / artH,
			s = Math.min(sw, sh);

		if (sw < sh) {
			//sy = Math.floor((this.h - artH * s) / 2);
		} else {
			sx = Math.floor((this.w - artW * s) / 2);
		}

		this.artX = this.x + sx;
		this.artY = this.y + sy;
		this.artW = Math.max(0, Math.floor(artW * s));
		this.artH = Math.max(0, Math.floor(artH * s));
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.calcScale(this.images[this.displayId]);
	};

	this.draw = function(gr) {
		var art = this.images[this.displayId];
		var font = gdi.Font("Segoe UI", 24);
		if (art) {
			if (this.artW + this.artH > 10) {
				try {
					gr.DrawImage(art.img, this.artX + 2, this.artY + 2, this.artW - 4, this.artH - 4, 0, 0, art.w, art.h, 0, 255);
				} catch (e) {};
				if (this.displayId != AlbumArtId.disc) {
					gr.DrawRect(this.artX, this.artY, this.artW - 1, this.artH - 1, 1, colors.normalTxt & 0x25ffffff);
				};
			}
		} else if (art === null) {
			gr.GdiDrawText("No Cover", font, RGB(200, 200, 200), this.x, this.y, this.w, this.h, dt);
			//gr.DrawRect(this.x, this.y, this.w - 1, this.h - 1, 1, RGBA(0, 0, 0, 50));
		} else {
			gr.GdiDrawText("Loading", font, RGB(200, 200, 200), this.x, this.y, this.w, this.h, dt);
			//gr.DrawRect(this.x, this.y, this.w - 1, this.h - 1, 1, RGBA(0, 0, 0, 50));
		}
	};

};

///////////////////////////////////////////////////////

var ww, wh;
var dt = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS;
var headerHeight = 24;

colors = {
	normalTxt: 0,
	selectedTxt: 0,
	normalBg: 0,
	selectedBg: 0,
	highlight: 0,
};


//////////////////////////////////////////////////////// 
prop = {
	margin: window.GetProperty("Margin", 15),
	groupFormat: window.GetProperty("Group format", "%album artist%%album%"),
	defaultArt: window.GetProperty("Default AlbumArt ID", AlbumArtId.front),
	maxImageSize: window.GetProperty("Max Image Size", 600),
}



///////////////////////////////////////////////////////

var aart = new oCover();
aart.getArtImages(fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());
getColors();

function on_size() {
	if (!window.Width || !window.Height) return;
	ww = window.Width;
	wh = window.Height;

	var mg = prop.margin;
	var aartX = mg;
	var aartY = headerHeight + mg;
	var aartW = ww - mg * 2;
	var aartH = wh - aartY - mg;
	aart.setSize(aartX, aartY, aartW, aartH);
};

function on_paint(gr) {
	// bg
	gr.FillSolidRect(0, 0, ww, wh, colors.normalBg);
	// header
	gr.FillSolidRect(0, 0, ww, headerHeight, RGB(247, 247, 247));
	gr.FillSolidRect(0, headerHeight, ww, 2, RGB(240, 240, 240));

	aart.draw(gr);

};

function on_get_album_art_done(metadb, art_id, image, image_path) {
	aart.onGetArtDone(metadb, art_id, image, image_path);
};
	
function on_item_focus_change(_playlist, from, to) {
	if (fb.IsPlaying) return;
	aart.getArtImages(fb.GetFocusItem());
};

function on_playback_starting(cmd, is_paused) {
	if (cmd == 6){
	   aart.getArtImages(fb.GetNowPlaying());
	}
};

function on_playback_new_track(metadb) {
	aart.getArtImages(metadb);
};

function on_playback_stop(reason) {
	if (reason != 2) {
		aart.getArtImages(fb.GetFocusItem());
	};
};

function on_colors_changed() {
	getColors();
	window.Repaint();
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
