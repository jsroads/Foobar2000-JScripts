(function () {

	Cover = function() {
		this.image_obj = [];
		this.display_id = prop.cover_art.albumart_id;
		this.get_album_art = function(metadb) {
			if (metadb == null) {
				this.image_obj[this.display_id] = null;
				this.repaint();
				return;
			};

			this.grp = $(prop.cover_art.grp_format, metadb);

			if (this.grp == this.grp_saved) {
				(this.image_obj[this.display_id] == null) && this.repaint();
				return;
			};

			this.display_id = prop.cover_art.albumart_id;
			this.image_obj = [];
			this.repaint(); // "Loading" will be visible;
			this.timer && window.ClearInterval(this.timer);
			var art_id = 0;

			this.timer = window.SetInterval(function() {
				utils.GetAlbumArtAsync(window.ID, metadb, (art_id == 3) ? art_id = 4 : art_id);
				(art_id >= 3) && window.ClearInterval(aart.timer);
				art_id++;
			}, 50);

			this.grp_saved = this.grp;
		};

		this.on_get_album_art_done = function(metadb, art_id, image, image_path) {
			if (!image) {
				this.image_obj[art_id] = null;
				(this.display_id == art_id) && this.repaint();
				return;
			};

			if (art_id == 4) art_id = 3;

			var art_w = image.Width;
			var art_h = image.Height;
			var max_size = prop.cover_art.max_size;

			if (this.grp == $(prop.cover_art.grp_format, metadb)) {
				if (art_w > art_h) {
					if (art_h > max_size) {
						var r = art_w / art_h;
						var new_h = max_size;
						var new_w = new_h * r;
						image = image.Resize(new_w, new_h, 0);
					};
				} else {
					if (art_w > max_size) {
						var r = art_h / art_w;
						var new_w = max_size;
						var new_h = new_w * r;
						image = image.Resize(new_w, new_h, 0);
					};
				};

				var is_embedded = (image_path.slice(image_path.lastIndexOf(".") + 1) == $("$ext(%path%)", metadb));
				this.image_obj[art_id] = {};
				this.image_obj[art_id].img = image;
				this.image_obj[art_id].w = image.Width;
				this.image_obj[art_id].h = image.Height;
				this.image_obj[art_id].path = image_path;
				this.image_obj[art_id].is_embedded = is_embedded;

			};

			if (art_id == this.display_id) {
				this.calc_scale(this.image_obj[this.display_id]);
				this.repaint();
			};
		};

		this.repaint = function() {
				window.RepaintRect(this.x, this.y, this.w, this.h);
		};

		this.calc_scale = function(art_obj) {
			if (!art_obj) return;

			var art_w = art_obj.w;
			var art_h = art_obj.h;

			var sx = 0;
			var sy = 0;
			var sw = this.area_w / art_w;
			var sh = this.area_h / art_h;
			var s = Math.min(sw, sh);

			if (sw > sh) {
				sx = Math.floor((this.area_w - art_w * s) / 2);
			} else {
				sy = Math.floor((this.area_h - art_h * s) / 2);
			};

			this.art_x = this.area_x + sx;
			this.art_y = this.area_y + sy;
			this.art_w = Math.max(0, Math.floor(art_w * s));
			this.art_h = Math.max(0, Math.floor(art_h * s));
		};

		this.margin = prop.margin;

		this.set_size = function(x, y, w, h) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.area_x = this.x + this.margin;
			this.area_y = this.y + this.margin;
			this.area_w = this.w - this.margin * 2;
			this.area_h = this.h - this.margin * 2;
			this.calc_scale(this.image_obj[this.display_id]);
		};

		this.draw = function(gr) {
			var art = this.image_obj[this.display_id];
			var font = gdi.Font("Segoe UI", 24, 0);
			var color = g_colors.txt_normal & 0x25ffffff;
			// bg
			gr.FillSolidRect(this.x, this.y, this.w, this.h, g_colors.bg_normal);
			// art
			if (art) {
				if (this.art_w + this.art_h > 10) {
					try {
						gr.DrawImage(art.img, this.art_x + 2, this.art_y + 2, this.art_w - 4, this.art_h - 4, 0, 0, art.w, art.h, 0, 225);
					} catch (e) {};
					if (this.display_id !== AlbumArtId.disc) {
						gr.DrawRect(this.art_x, this.art_y, this.art_w - 1, this.art_h - 1, 1, color);
					}
				}
			} else if (art === null) {
				gr.GdiDrawText("No Cover", font, color, this.x, this.y, this.w, this.h, dt_cc);
			} else {
				gr.GdiDrawText("Loading", font, color, this.x, this.y, this.w, this.h, dt_cc);
			};
		};

	};

	//
	prop = new function() {
		this.use_sys_color = window.GetProperty("_prop: colorscheme use system color", false);
		this.colorscheme = window.GetProperty("_prop: colorscheme name(dark, light, user)", "light");
		this.margin = window.GetProperty("_prop: margin", 15);
		this.cover_art = {
			grp_format: window.GetProperty("_prop_cover_art: group format", "%album artist% | %album%"),
			albumart_id: window.GetProperty("_prop_cover_art: displayed albumart id", AlbumArtId.front),
			max_size: window.GetProperty("_prop_cover_art: maximum image size", 300),
		};
		this.font_name = "Segoe UI";
		this.scrb_width = 10;
	};

	var g_colors = {};
	var g_fonts = {};

	var colorscheme = {
		light: {
			txt_normal: RGB(70, 70, 70),
			txt_selected: RGB(0, 0, 0), 
			bg_normal: RGB(245, 245, 245),
			bg_selected: RGB(120, 120, 120),
			highlight: RGB(215, 65, 100)
		},
		dark: {
			txt_normal: RGB(190, 190, 190),
			txt_selected: RGB(255, 255, 255), 
			bg_normal: RGB(76, 76, 76),
			bg_selected: RGB(140, 140, 140),
			highlight: RGB(255, 142, 196)
		},
		user: {
			txt_normal: eval(window.GetProperty("colorscheme: text normal", "RGB(70, 70, 70)")),
			txt_selected: eval(window.GetProperty("colorscheme: text selected", "RGB(0, 0, 0)")),
			bg_normal: eval(window.GetProperty("colorscheme: background normal", "RGB(245, 245, 245)")),
			bg_selected: eval(window.GetProperty("colorscheme: background selected", "RGB(110, 110, 110)")),
			highlight: eval(window.GetProperty("colorscheme: highlight", "RGB(215, 65, 100)"))
		}
	};


	function get_fonts() {
		g_fonts.name = prop.font_name;
		g_fonts.item = gdi.Font(g_fonts.name, 12);
		g_fonts.header = gdi.Font(g_fonts.name, 14);
	};

	function get_colors() {
		g_colors = colorscheme[prop.colorscheme];
		if (prop.use_sys_color) {
			if (window.InstanceType == 1) {
				g_colors.txt_normal = window.GetColorDUI(ColorTypeDUI.text);
				g_colors.bg_normal = window.GetColorDUI(ColorTypeDUI.background);
				g_colors.bg_selected = window.GetColorDUI(ColorTypeDUI.selection);
				g_colors.highlight = window.GetColorDUI(ColorTypeDUI.highlight);
				var c = combineColors(g_colors.bg_normal, g_colors.bg_selected & 0x39ffffff);
				g_colors.txt_selected = (Luminance(c) > 0.6 ? 0xff000000 : 0xffffffff);
			} else { try {
				g_colors.txt_normal = window.GetColorCUI(ColorTypeCUI.text);
				g_colors.txt_selected = window.GetColorCUI(ColorTypeCUI.selection_text);
				g_colors.bg_normal = window.GetColorCUI(ColorTypeCUI.background);
				g_colors.bg_selected = window.GetColorCUI(ColorTypeCUI.selection_background);
				g_colors.highlight = window.GetColorCUI(ColorTypeCUI.active_item_frame);
			} catch (e) {} };
		}
	};


	var dt_cc = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX;
	var dt_lc = DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX;
	var ww, wh;


	aart = new Cover();
	aart.get_album_art(fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());

	$Event.add("on_size", function() {
		if (!window.Width || !window.Height) return;
		ww = window.Width;
		wh = window.Height;
	});
	$Event.add("on_size", function() {
		aart.set_size(0, 0, ww, wh);
	});

	$Event.add("on_paint", function(gr) {
		aart.draw(gr);
	});

	//// playback callbacks

	$Event.add("on_playback_starting", function (cmd, is_paused) {
		if (cmd == 6) {
			aart.get_album_art(fb.GetNowPlaying());
			plm.repaint();
		};
	});

	$Event.add("on_playback_new_track", function (metadb) {
		aart.get_album_art(metadb);
	});

	$Event.add("on_playback_stop", function (reason) {
		if (reason !== 2) {
			aart.get_album_art(fb.GetFocusItem());
			plm.repaint();
		};
	});


	///// misc
	$Event.add("on_get_album_art_done", function (metadb, art_id, image, image_path) {
		aart.on_get_album_art_done(metadb, art_id, image, image_path);
	});

	$Event.add("on_item_focus_change", function (playlist, from, to) { 
		if (!fb.IsPlaying) aart.get_album_art(fb.GetFocusItem());
	});

	$Event.add("on_colors_changed", function () {
		get_colors();
		get_images();
		window.Repaint();
	});

})();

