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

	// draw scrollbar
	this.draw = function(gr) {
		if (!this.needed || !this.visible) return;

		gr.FillSolidRect(this.x, this.y, this.w, this.h, colors.TextNormal & 0x10ffffff);
		if (this.cursorClicked) {
			gr.FillSolidRect(this.x, this.cursorY, this.w, this.cursorH, colors.TextNormal & 0x99ffffff);
		} else {
			if (this.hoverCursor) {
				gr.FillSolidRect(this.x, this.cursorY, this.w, this.cursorH, colors.TextNormal & 0x55ffffff);
			} else {
				gr.FillSolidRect(this.x, this.cursorY, this.w, this.cursorH, colors.TextNormal & 0x33ffffff);
			}
		}
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
		return (this.parent.checkStartId());
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
	this.rowHeight = window.GetProperty("plman.Row Height", 22);
	this.marginT = 0;


	this.dragdrop = {
		targetId: -1,
		isHoverArea: false,
	};

	this.setFonts = function() {
		this.fontItem = gdi.font(prop.fontName, 12, 0);
	};
	this.setFonts();

	this.repaint = function() {
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

	// draw playlist-manager
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

			color_txt = colors.TextNormal;

			// item bg
			// active playlist
			if (idx == this.activeId) {
				gr.FillSolidRect(this.x, cy, this.w - this.scrollbarW, ch, colors.BackSelected & 0x39ffffff);
				gr.DrawRect(this.x, cy, this.w - this.scrollbarW - 1, ch - 0, 1, colors.BackSelected);
			}
			// hover playlist
			if (idx == this.hoverId && this.dragId < 0 && !this.dragdrop.actived) {
				gr.FillSolidRect(this.x, cy, this.w - this.scrollbarW, ch, colors.BackSelected & 0x20ffffff);
				gr.DrawRect(this.x, cy, this.w - this.scrollbarW - 1, ch - 0, 1, colors.BackSelected & 0xa0ffffff);
			};
			// dragover playlist
			if (this.dragdrop.targetId == idx && (dragdrop.dragFile || this.dragdrop.actived)) {
				gr.DrawRect(this.x, cy+2, this.w - this.scrollbarW - 1, ch-2, 2, colors.Highlight);
			};

			iconId = 0;
			if (idx == fb.PlayingPlaylist && fb.IsPlaying) {
				color_txt = colors.Highlight;
				iconId = 1;
			};

			// icons
			icon = images.list;
			if (this.playlist[idx].isAuto) {
			   icon = images.autoList;
			};
			if (this.playlist[idx].name.slice(0, 8) == "Search [") {
			   icon = images.searchList;
			};
			iconW = icon[0].Width;
			iconX = this.x;
			iconY = cy + (this.rowHeight - iconW) / 2;

			try {
				gr.DrawImage(icon[iconId], iconX, iconY, iconW, iconW, 0, 0, iconW, iconW, 0, 255);
			} catch (e) {};

			// item count
			countW = 0;
			if (this.showCount){
				countW = Math.ceil(gr.CalcTextWidth(this.playlist[idx].totalTracks, this.fontItem));
			};

			if (countW > 0) {
				countX = this.x + this.w - this.scrollbarW - countW - pad;
				gr.GdiDrawText(this.playlist[idx].totalTracks, this.fontItem, colors.TextNormal, countX, cy + 1, countW, ch, dt_lc);
			};

			// items
			cx = iconX + iconW + pad;
			cw = countX - cx - pad;

			gr.GdiDrawText(this.playlist[idx].name, this.fontItem, color_txt, cx, cy + 1, cw, ch, dt_lc);

			// drag split-line
			if (this.dragId > -1 && this.dragHoverId == idx) {
				gr.DrawLine(this.x, cy+1, this.x + this.w - this.scrollbarW, cy+1, 2, colors.Highlight);
			};

		};

		if (this.dragId > -1 && this.dragHoverId == this.total) {
			var max = Math.min(this.totalRows, this.total);
			var Y = this.y + max * this.rowHeight + 1;
			gr.DrawLine(this.x, Y, this.x + this.w - this.scrollbarW, Y, 2, colors.Highlight);
		};

		// scrollbar
		this.scrollbar.draw(gr);
	};

	this.isHover = function(x, y) {
		return (x > this.x && x < this.x + this.w - this.scrollbarW && y > this.y && y < this.y + this.h);
	};

	this.startAutoScroll = function(delta, onScrolling) {
		if (!this.autoScrolling) {
			plm.scrollTimeout = window.SetTimeout(function() {
				plm.scrollInterval = window.SetInterval(function() {
					var scrolling = plm.scrollbar.scroll(delta);
					if (scrolling) {
						onScrolling && onScrolling();
						plm.scrollbar.refresh();
						plm.repaint();
					} else {
						plm.stopAutoScroll();
					};
				}, 50);
			}, 350);
			this.autoScrolling = true;
		}
	};

	this.stopAutoScroll = function() {
		window.ClearInterval(this.scrollInterval);
		window.ClearTimeout(this.scrollTimeout);
		this.autoScrolling = false;
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

				if (this.dragId > -1) {
					if (this.hoverId > -1) {
						this.dragHoverId = this.hoverId;
					};
					if (this.totalRows < this.total) {
						if (y > this.y + this.totalRows * this.rowHeight) {
							this.dragHoverId = this.total;
							this.repaint();
						};
						if (y < this.y + this.rowHeight / 2) {
							this.startAutoScroll(1, function() {
								plm.dragHoverId = plm.startId;
							});
						} else if (y > this.y + this.h - this.rowHeight / 2) {
							this.startAutoScroll(-1, function() {
								plm.dragHoverId = plm.startId + plm.totalRows;
							});
							if (!this.checkStartId()) {
								this.dragHoverId = this.total;
							};
						}
					} else {
						if (y < this.y) this.dragHoverId = 0;
						if (y > this.y + this.total * this.rowHeight){
						   this.dragHoverId = this.total;
						   this.repaint();
						}
					}
				};

				if (dragdrop.handlesIn != null) {
					if (this.hoverId > -1 && this.hoverId != this.activeId) {
						this.dragdrop.targetId = this.hoverId;
						var iidx = fb.PlaylistItemCount(this.hoverId);
						plman.InsertPlaylistItems(this.hoverId, iidx, dragdrop.handlesIn, false);

						window.ClearTimeout(this.dragdrop.timer);
						this.dragdrop.actived = true;
						this.repaint();
						this.dragdrop.timer = window.SetTimeout(function() {
							plm.dragdrop.actived = false;
							plm.repaint();
						}, 500);
					};

					dragdrop.handlesIn = null;

				};

				if (this.hoverId != this.hoverIdSaved) {
					this.hoverIdSaved = this.hoverId;
					this.repaint();
				};

				if (this.dragId > -1) {
					window.SetCursor(32651);
				} else {
					window.SetCursor(32512);
				}

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
						fb.RunMainMenuCommand("View/Show now playing");
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

				if (this.autoScrolling) {
					this.stopAutoScroll();
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

	this.on_drag = function(event, action, x, y, mask) {
		this.dragdrop.isHoverArea = this.isHover(x, y);
		switch(event) {
			case "enter":
				dragdrop.dragFile = true;
				break;
			case "over":
				this.dragdrop.targetId = -1;
				if (this.dragdrop.isHoverArea) {
					this.dragdrop.targetId = Math.floor((y - this.y) /this.rowHeight) + this.startId;
					if (this.dragdrop.targetId < 0) {
						this.dragdrop.targetId = -1;
					}
					if (this.dragdrop.targetId >= this.total) {
						this.dragdrop.targetId = this.total;
					}
				};

				if (this.dragdrop.targetIdSaved != this.dragdrop.targetId) {
					this.dragdrop.targetIdSaved = this.dragdrop.targetId;
					this.repaint();
				}

				if (this.total > this.totalRows) {
					if (y < this.y + this.rowHeight / 2) {
						this.startAutoScroll(1, function() {
							plm.dragdrop.targetId = -1;
							if (plm.dragdrop.isHoverArea) {
								plm.dragdrop.targetId = Math.floor((y - plm.y) /plm.rowHeight) + plm.startId;
								if (plm.dragdrop.targetId < 0) {
									plm.dragdrop.targetId = -1;
								}
								if (plm.dragdrop.targetId >= plm.total) {
									plm.dragdrop.targetId = plm.total;
								}
							};
						});
					};
					if (y > this.y + this.h - this.rowHeight / 2) {
						this.startAutoScroll(-1, function() {
							plm.dragdrop.targetId = -1;
							if (plm.dragdrop.isHoverArea) {
								plm.dragdrop.targetId = Math.floor((y - plm.y) /plm.rowHeight) + plm.startId;
								if (plm.dragdrop.targetId < 0) {
									plm.dragdrop.targetId = -1;
								}
								if (plm.dragdrop.targetId >= plm.total) {
									plm.dragdrop.targetId = plm.total;
								}
							};
						});
					};
				};

				break;
			case "drop":
				if (this.dragdrop.targetId == -1) return;
				dragdrop.dragFile = false;
				if (this.dragdrop.targetId < this.total) {
					action.ToPlaylist();
					action.Playlist = this.dragdrop.targetId;
					action.ToSelect = false;
				};
				window.ClearTimeout(this.dragdrop.timer);
				this.dragdrop.actived = true;
				this.repaint();
				this.dragdrop.timer = window.SetTimeout(function() {
					plm.dragdrop.actived = false;
					plm.repaint();
				}, 500);
				this.dragdrop.targetId = -1;
				break;
			case "leave":
				dragdrop.dragFile = false;
				if (this.autoScrolling) {
					this.stopAutoScroll();
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

	// draw cover-art
	this.draw = function(gr) {
		var art = this.images[this.displayId];
		var font = gdi.Font("Segoe UI", 24);
		if (art) {
			if (this.artW + this.artH > 10) {
				try {
					gr.DrawImage(art.img, this.artX + 2, this.artY + 2, this.artW - 4, this.artH - 4, 0, 0, art.w, art.h, 0, 255);
				} catch (e) {};
				if (this.displayId != AlbumArtId.disc) {
					gr.DrawRect(this.artX, this.artY, this.artW - 1, this.artH - 1, 1, colors.TextNormal & 0x25ffffff);
				};
			}
		} else if (art === null) {
			gr.GdiDrawText("No Cover", font, RGB(200, 200, 200), this.x, this.y, this.w, this.h, dt_cc);
		} else {
			gr.GdiDrawText("Loading", font, RGB(200, 200, 200), this.x, this.y, this.w, this.h, dt_cc);
		}
	};

};

///////////////////////////////////////////////////////
var thisPanelName = "P3";
var ww, wh;
var dt_cc = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX;
var dt_lc = DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX;
var colors = {};
var images = {
	list: null,
	autoList: null,
	searchList: null
};

dragdrop = {
	dragFile: false,
	handlesIn: null,
	handlesOut: null
};


prop = {
	colorSchemeId: window.GetProperty("ColorScheme ID", 1), // 0: system, 1: Light, 2: Dark, 3: User
	margin: window.GetProperty("Margin", 15),
	groupFormat: window.GetProperty("Group format", "%album artist%%album%"),
	defaultArt: window.GetProperty("Default AlbumArt ID", AlbumArtId.front),
	maxImageSize: window.GetProperty("Max Image Size", 300),
	fontName: "Segoe UI",
}


///////////////////////////////////////////////////////
{
	var aart = new oCover();
	aart.getArtImages(fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());
	var plm = new oPlaylistManager("PlaylistManager");

	getColors();
	getImages();
}

function on_size() {
	if (!window.Width || !window.Height) return;
	ww = window.Width;
	wh = window.Height;

	var p2 = 0;
	var p3 = 0;

	var mg = prop.margin;
	var aartX = mg;
	var aartY = mg;
	var aartW = ww - mg * 2;
	var aartH = Math.min(wh - aartY - mg, 300, aartW);
	aart.setSize(aartX, aartY, aartW, aartH);
	plm.setSize(mg, aartY + aartH + mg * 2 + p2, aartW, wh - aartY - aartH - mg*3 - p2);
};

function on_paint(gr) {
	// bg
	gr.FillSolidRect(0, 0, ww, wh, colors.BackNormal);
	//
	aart.draw(gr);
	plm.draw(gr);

};

////////////////////////////////////////////////// mouse event callbacks
function on_mouse_move(x, y, mask) {
	plm.on_mouse("move", x, y);
};

function on_mouse_lbtn_down(x, y, mask) {
	window.NotifyOthers("AnotherPanelIsClicked", thisPanelName);
	plm.on_mouse("lbtn_down", x, y);
}

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

function on_mouse_leave() {
	plm.on_mouse("leave", 0, 0, 0);
};

//////////////////////////////////////////////// playback callbacks

function on_playback_starting(cmd, is_paused) {
	if (cmd == 6){
	   aart.getArtImages(fb.GetNowPlaying());
	   plm.repaint();
	}
};

function on_playback_new_track(metadb) {
	aart.getArtImages(metadb);
};

function on_playback_stop(reason) {
	if (reason != 2) {
		aart.getArtImages(fb.GetFocusItem());
		plm.repaint();
	};
};

//////////////////////////////////////////////// playlist callbacks

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

function on_get_album_art_done(metadb, art_id, image, image_path) {
	aart.onGetArtDone(metadb, art_id, image, image_path);
};
	

////////////////////////////////////////////////////// dragdrop callbacks

function on_drag_enter() {
	plm.on_drag("enter");
};

function on_drag_leave() {
	plm.on_drag("leave");
};

function on_drag_over(action, x, y, mask) {
	plm.on_drag("over", action, x, y, mask);
};

function on_drag_drop(action, x, y, mask) {
	plm.on_drag("drop", action, x, y, mask);
};


////////////////////////////////////////////////////// misc callbacks

function on_item_focus_change(_playlist, from, to) {
	if (fb.IsPlaying) return;
	aart.getArtImages(fb.GetFocusItem());
};

function on_colors_changed() {
	getColors();
	getImages();
	window.Repaint();
};

function on_notify_data(name, info) {
	switch(name) {
		case "WshPlaylistDragDrop":
			dragdrop.handlesIn = info;
			break;
	};
};


function getImages() {

	var fontAwesome = gdi.Font("FontAwesome", 14, 0);
	var w = 22;
	var cNormal, cPlaying, c;
	var s, imgArr, img, g;
	var sf = StringFormat(1, 1);

	cNormal = colors.TextNormal & 0xaaffffff;
	cPlaying = colors.Highlight;

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
	ColorScheme.LoadUserColor();
	switch (prop.colorSchemeId) {
		case 0:
			if (window.InstanceType == 1) { // dui
				colors.TextNormal = window.GetColorDUI(ColorTypeDUI.text);
				colors.BackSelected = window.GetColorDUI(ColorTypeDUI.selection);
				colors.BackNormal = window.GetColorDUI(ColorTypeDUI.background);
				colors.Highlight = window.GetColorDUI(ColorTypeDUI.highlight);

				var c = combineColors(colors.BackNormal, colors.BackSelected & 0x55ffffff);
				colors.TextSelected = DetermineTextColor(c);
			} else {
				// else
			};
		case 1:
			colors = ColorScheme.Light;
			break;
		case 2:
			colors = ColorScheme.Dark;
			break;
		case 3:
			colors = ColorScheme.User;
			break;
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
