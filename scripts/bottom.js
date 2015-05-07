// vim:set ft=javascript et:
// updated: 2015/04/27


// settings
var properties = {
    enableCustomColors: window.GetProperty("*Color.Enable Custom Color", false),
    sliderHeight: window.GetProperty("*Slider.Height", 2),
    panelHeight: 56,

};

function getImagePath(image) {
	return gdi.Image(imagePath + image);
};

var MENU_ITEM_CHECKED = 1 << 1;


var ww = 0, wh = 0;

var buttons = [];
var fonts = {};
var colors = {};
var imagePath = fb.ProfilePath + 'common\\icons\\';
var images = {
	// button icons
	lrc_off_normal: getImagePath("lrc_off-normal.png"),
	lrc_off_down: getImagePath('lrc_off-down.png'),
	lrc_on_normal: getImagePath('lrc_on-normal.png'),
	lrc_on_down: getImagePath('lrc_on-down.png'),
	back_normal: getImagePath('back.png'),
	back_down: getImagePath('back-down.png'),
	next_normal: getImagePath('next.png'),
	next_down: getImagePath('next-down.png'),
	play_normal: getImagePath('play.png'),
	play_down: getImagePath('play-down.png'),
	pause_normal: getImagePath('pause.png'),
	pause_down: getImagePath('pause-down.png'),
	stop_normal: getImagePath('stop.png'),
	stop_down: getImagePath('stop-down.png'),
	repeat_off_normal: getImagePath('repeat_off.png'),
	repeat_off_down: getImagePath('repeat_off-down.png'),
	repeat_on_normal: getImagePath('repeat_on.png'),
	repeat_on_down: getImagePath('repeat_on-down.png'),
	repeat_one_normal: getImagePath('repeat_one.png'),
	repeat_one_down: getImagePath('repeat_one-down.png'),
	shuffle_off_normal: getImagePath('shuffle_off.png'),
	shuffle_off_down: getImagePath('shuffle_off-down.png'),
	shuffle_on_normal: getImagePath('shuffle_on.png'),
	shuffle_on_down: getImagePath('shuffle_on-down.png'),
	// volume knob
	soundBar_knob: getImagePath('soundBar-knob.png'),
    seekSlider_cursor: getImagePath('cursor.png'),
};

var hand = false;
var handPrev = false;
var mouseOver = false;
var stopped = false;  // playback status: stopped
var shuffleType = window.GetProperty("shuffle type", 4);

window.MaxHeight = window.MinHeight = properties.panelHeight;
window.MinWidth = 350;
// init buttons
buttons = [
	new Button(images.lrc_off_normal, images.lrc_off_normal, images.lrc_off_down),
	new Button(images.back_normal, images.back_normal, images.back_down),
	new Button(images.play_normal, images.play_normal, images.play_down),
	new Button(images.next_normal, images.next_normal, images.next_down),
	new Button(images.repeat_off_normal, images.repeat_off_normal, images.repeat_off_down),
	new Button(images.shuffle_off_normal, images.shuffle_off_normal, images.shuffle_off_down) 
];

// refresh buttons
refreshPlayOrPauseButton();
refreshPlaybackOrderButton();
getColors();



// volumebar
var volumeBar = new function() {

	this.pos = 0;
	this.hovX = 0;
	this.drag = 0;
	this.dragHov = false;
	this.x = 0;
	this.y;
    this.w = 105;
    this.h = properties.sliderHeight;

	this.draw = function(gr, x, y) {

		this.x = x;
		this.y = y;

		// background
        gr.FillSolidRect(this.x, this.y, this.w, this.h, RGB(226, 226, 226));

        // cursor 
        this.pos = vol2pos(fb.Volume) * this.w;
        //fb.trace(this.pos);
        if (this.pos > 0) {
            gr.FillSolidRect(this.x, this.y, this.pos, this.h , colors.highlight);
        }

	};

    this.isMouseOver = function(x, y) {
        return (x > this.x && x < this.x + this.w && y > this.y -3 && y < this.y + this.h + 5);
    };


	this.on_mouse_move = function (x, y) {

		// vol hover?
        this.dragHov = this.isMouseOver(x, y) ? true : false;

		// volume seeker
		if (this.drag) {
            x -= this.x;
            var pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
			var v = pos2vol(pos);
			fb.Volume = v;
		}
	}

	this.on_mouse_lbtn_down = function(x, y) {
		// if volume click
		if (this.dragHov) {
			this.drag = true;
			this.on_mouse_move(x, y);
		} else {
			this.drag = false;
		}
	}

	this.on_mouse_lbtn_up = function(x, y) {
		this.drag = false;
	}

	this.on_mouse_wheel = function(delta) {

	}

	this.on_volume_change = function(val) {
		window.RepaintRect(this.x, this.y, this.w+1, this.h);
	};


}();

function pos2vol(pos) {
     return (50 * Math.log(0.99 * pos + 0.01) / Math.LN10);
}

// Inverse function of pos2vol()
function vol2pos(v){
     return ((Math.pow(10, v / 50) - 0.01) / 0.99);
}

var seekSlider = new function() {

    this.h = properties.sliderHeight;

    this.draw = function(gr, x, y) {
        this.x = x;
        this.y = y;
        // seek bg
        gr.FillSolidRect(this.x, this.y, this.w, this.h, RGB(200, 200, 200));
        // seek cursor
        if (fb.PlaybackLength > 0) {
            if (this.pos > 1) {
                gr.FillSolidRect(this.x, this.y, this.pos, this.h, colors.highlight);
            }
        }
                
    };
    this.on_size = function () {
        this.w = ww - volumeBar.w - 5;
    };
    this.on_playback_seek = function (time) {
        this.pos = (fb.PlaybackTime / fb.PlaybackLength) * this.w;
        this.repaint();
    }; 
    this.repaint = function() {
        window.RepaintRect(0, this.y - 2, ww, 10);
    };

    this.isMouseOver = function(x, y) {
        return (x > this.x && x < this.x + this.w && y > this.y-5 && y < this.y + this.h + 10);
    };

    this.on_mouse_lbtn_down = function(x, y) {
        if (this.isMouseOver(x, y)) {
            if (fb.PlaybackLength) {
                this.drag = true;
                this.dragSeek = (x > this.x) ? (x - this.x)/this.w : (x < this.x + this.w) ? (x - this.x)/this.w : 1;
                this.dragSeek = (this.dragSeek < 0) ? 0 : (this.dragSeek < 1) ? this.dragSeek : 1;
                fb.PlaybackTime = fb.PlaybackLength * this.dragSeek;
                this.on_playback_seek();
            }
        }
    };

    this.on_mouse_lbtn_up = function(x, y) {
        if (this.drag) {
            this.drag = false;
        }
    };

    this.on_mouse_move = function(x, y) {
        if (this.drag) {
            this.dragSeek = (x > this.x) ? (x - this.x)/this.w : (x < this.x + this.w) ? (x - this.x)/this.w : 1;
            this.dragSeek = (this.dragSeek < 0) ? 0 : (this.dragSeek < 1) ? this.dragSeek : 1;
            fb.PlaybackTime = fb.PlaybackLength * this.dragSeek;
            this.on_playback_seek();
        }
    };


    this.pos = 0;
    this.drag = false;
    this.x;
    this.y;
    this.w;
    this.h;
}();



window.NotifyOthers("_eslyric_set_text_fallback_", "This is Jeanne's foobar2000!\n- ESLyric -");
window.NotifyOthers("_eslyric_set_text_titleformat_fallback_", "[Artist: %artist%$crlf()]Title: %title%$crlf()- No Lyric -");


function on_size() {
    if (!window.Width || !window.Height) return;
    ww = window.Width;
    wh = window.Height;
    
    seekSlider.on_size();
}

function on_paint(gr) {
    
	// draw background
    gr.FillSolidRect(0, 0, ww, wh, colors.background);

	// draw buttons
	for (var i = 0; i < buttons.length; i++) {
        var bh = properties.sliderHeight + (wh - properties.sliderHeight - buttons[i].h) / 2;
		switch (i) {
			case 0:
				if (fb.GetMainMenuCommandStatus('View/ESLyric/显示桌面歌词') & MENU_ITEM_CHECKED) {
					buttons[0].update(images.lrc_on_normal, images.lrc_on_normal, images.lrc_on_down);
				} else {
					buttons[0].update(images.lrc_off_normal, images.lrc_off_normal, images.lrc_off_down);
				}
				buttons[i].draw(gr, 10, bh);
				break;
			case 1:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 10, bh);
				break;
			case 2:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 10, bh);
				break;
			case 3:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 10, bh);
				break;
			case 4:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 10, bh);
				break;
			case 5:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 10, bh);
				break;
		}
	}

	// draw volumeBar
	volumeBar.draw(gr, ww - volumeBar.w, 0);
    
    // draw seekbar
    seekSlider.draw(gr, 0, 0);
    

    //DrawBoxBlurText(gr, "Text 汉字", gdi.font("Segoe UI", 14, 1), RGB(50, 50, 50), RGB(0, 20, 100), 4, 3, 200, 10 , 80, 20, StringFormat(1, 1));

}

// ========================================== // mouse event
function on_mouse_move(x, y) {
	// buttons
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].checkState('move', x, y);
	}
	
	// sound bar
	volumeBar.on_mouse_move(x, y);

    // seek slider
    seekSlider.on_mouse_move(x, y);

}

function on_mouse_lbtn_down(x, y, m) {
	// buttons
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i].checkState('down', x, y) == ButtonStates.down) {
			//return;
		}
	}

	// sound bar
	volumeBar.on_mouse_lbtn_down(x, y);

    // seek slider
    seekSlider.on_mouse_lbtn_down(x, y);
}

function on_mouse_lbtn_dblclk(x, y, m) {
	// double click to stop
	if (fb.IsPlaying) {
		if (buttons[2].state == ButtonStates.hover) {
			fb.Stop();
			stopped = true;
		}
	};
}

function on_mouse_lbtn_up(x, y, m) {
	// buttons 
	for (var i = 0; i < buttons.length; i++) {
		switch (i) {
			case 0:
				if (buttons[i].checkState('up', x, y) == ButtonStates.hover) {
					ESLyricPopupMenu(buttons[0].x, buttons[0].y);
                    //ReloadLyric();
				}
				break;
			case 1:
				if (plman.PlaylistItemCount(plman.ActivePlaylist) > 0) {
					if (buttons[i].checkState('up', x, y) == ButtonStates.hover) {
						fb.Prev();
					}
				}
				break;
			case 2:
				if (fb.IsPlaying || plman.PlaylistItemCount(plman.ActivePlaylist) > 0 || plman.GetPlaybackQueueCount() > 0) {
					if (buttons[i].checkState('up',x ,y) == ButtonStates.hover) {
						if (stopped) {
							stopped = false;
						} else {
							fb.PlayOrPause();
						}
					}
				}
				break;
			case 3: 
				if (plman.PlaylistItemCount(plman.ActivePlaylist) > 0 || plman.GetPlaybackQueueCount() > 0) {
					if (buttons[i].checkState('up', x, y) == ButtonStates.hover) {
						fb.Next();
					}
				}
				break;
			case 4:
				if (buttons[i].checkState('up', x, y) == ButtonStates.hover) {
					if (fb.PlaybackOrder >= PlaybackOrder.Random) { 
						fb.PlaybackOrder = PlaybackOrder.Repeat;
					} else {
						fb.PlaybackOrder = (fb.PlaybackOrder > 1) ? 0 : fb.PlaybackOrder + 1
					}
				}
				break;
			case 5:
				if (buttons[i].checkState('up', x, y) == ButtonStates.hover) {
					fb.PlaybackOrder = (fb.PlaybackOrder >= PlaybackOrder.Random) ? 0 : shuffleType;
				}
				break;
		}
	}

	// sound bar
	volumeBar.on_mouse_lbtn_up(x, y);

    // seek slider 
    seekSlider.on_mouse_lbtn_up(x, y);
}



function on_mouse_rbtn_up(x, y, mask) {
	if (mask == 0x0004) {
		return false;
	} else {
		return true;
	}
}

function on_mouse_leave() {
	// buttons 
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].checkState('leave', 0, 0);
	}
}

function on_mouse_wheel(step) {
	// sound bar
	volumeBar.on_mouse_wheel(step);
}

// ========================================================================
function on_playback_order_changed(new_order) {
	refreshPlaybackOrderButton();
}

function on_playback_stop(reason) {
	//if (reason === 0) {
		refreshPlayOrPauseButton();
        seekSlider.repaint();
	//}
}

function on_playback_starting(cmd, is_paused) {
	refreshPlayOrPauseButton();
    seekSlider.repaint();
}

function on_playback_new_track(metadb) {
	refreshPlayOrPauseButton();
    seekSlider.repaint();
}

function on_playback_pause(state) {
	refreshPlayOrPauseButton();
}

function on_playback_time(time) {
    seekSlider.on_playback_seek();
}
 

function on_volume_change(val) {
	volumeBar.on_volume_change(val);
}

function on_colors_changed() {
    getColors();
    window.Repaint();
};

// ================================================= // tool functions

function refreshEslyricButton() {
	var eslyric = utils.CheckComponent('foo_uie_eslyric', true);
	if (!eslyric) {
		//buttons.lrc.update(images.lrc_off_hover, images.lrc_off_hover, images.lrc_off_hover);
	} else {
		if (fb.GetMainMenuCommandStatus('View/ESLyric/显示桌面歌词') & MENU_ITEM_CHECKED) {
			buttons[0].update(images.lrc_off_normal, images.lrc_off_normal, images.lrc_off_down);
		} else {
			buttons[0].update(images.lrc_on_normal, images.lrc_on_normal, images.lrc_on_down);
		}
	}
	buttons[0].repaint();
}

function refreshPlayOrPauseButton() {
	if (fb.IsPlaying) {
		if (fb.IsPaused) buttons[2].update(images.play_normal, images.play_normal, images.play_down);
		else buttons[2].update(images.pause_normal, images.pause_normal, images.pause_down);
	} else {
		buttons[2].update(images.stop_normal, images.stop_normal, images.stop_down);
	}
	buttons[2].repaint();
}

function refreshPlaybackOrderButton() {
	switch (fb.PlaybackOrder) {
		case PlaybackOrder.Default:
			buttons[4].update(images.repeat_off_normal, images.repeat_off_normal, images.repeat_off_down);
			buttons[5].update(images.shuffle_off_normal, images.shuffle_off_normal, images.shuffle_off_down);
			break;
		case PlaybackOrder.Repeat:
			buttons[4].update(images.repeat_on_normal, images.repeat_on_normal, images.repeat_on_down);
			buttons[5].update(images.shuffle_off_normal, images.shuffle_off_normal, images.shuffle_off_down);
			break;
		case PlaybackOrder.Repeat1:
			buttons[4].update(images.repeat_one_normal, images.repeat_one_normal, images.repeat_one_down);
			buttons[5].update(images.shuffle_off_normal, images.shuffle_off_normal, images.shuffle_off_down);
			break;
		case PlaybackOrder.ShuffleT:
		case PlaybackOrder.ShuffleF:
		case PlaybackOrder.ShuffleA:
			buttons[4].update(images.repeat_off_normal, images.repeat_off_normal, images.repeat_off_down);
			buttons[5].update(images.shuffle_on_normal, images.shuffle_on_normal, images.shuffle_on_down);
			break;
	}
	buttons[4].repaint();
	buttons[5].repaint();
}

function ESLyricPopupMenu(x, y, callback) {
    var timer_id;
    var metadb = fb.IsPlaying ? fb.GetNowPlaying() : null;
    var no_lyric;
    if (metadb) {
        var no_lyric = $("$meta(ESLYRIC)", metadb).toLowerCase() == "no-lyric";
    }
	if (fb.GetMainMenuCommandStatus('View/ESLyric/显示桌面歌词') & MENU_ITEM_CHECKED) {
		buttons[0].update(images.lrc_on_down, images.lrc_on_down, images.lrc_on_down);
	} else {
		buttons[0].update(images.lrc_off_down, images.lrc_off_down, images.lrc_off_down);
	}
	var _esl = window.CreatePopupMenu();
	_esl.AppendMenuItem(MF_STRING, 1, "ESLyric 面板");
	_esl.AppendMenuItem(MF_STRING, 2, "显示桌面歌词");
    _esl.CheckMenuItem(2, fb.GetMainMenuCommandStatus("View/ESLyric/显示桌面歌词") & MENU_ITEM_CHECKED);
	_esl.AppendMenuSeparator();
    if (metadb) {
        _esl.AppendMenuItem(MF_STRING, 10, "Set NO-LYRIC");
        _esl.CheckMenuItem(10, no_lyric);
        _esl.AppendMenuSeparator();
    };
	_esl.AppendMenuItem(MF_STRING, 3, "歌词搜索...");
	_esl.AppendMenuItem(MF_STRING, 4, "重载歌词");
	_esl.AppendMenuItem(MF_STRING, 5, "置顶桌面歌词");
    _esl.CheckMenuItem(5, fb.GetMainMenuCommandStatus("View/ESLyric/置顶桌面歌词") & MENU_ITEM_CHECKED);
	_esl.AppendMenuItem(MF_STRING, 6, "锁定桌面歌词");
    _esl.CheckMenuItem(6, fb.GetMainMenuCommandStatus("View/ESLyric/锁定桌面歌词") & MENU_ITEM_CHECKED);
	_esl.AppendMenuItem(MF_STRING, 7, "参数设置...");

	var id = _esl.TrackPopupMenu(x, y);
	switch(id) {
        case 1:
            fb.RunMainMenuCommand("View/ESLyric/ESLyric 面板");
            break;
		case 2:
            fb.RunMainMenuCommand("View/ESLyric/显示桌面歌词");
            break;
        case 3:
            fb.RunMainMenuCommand("View/ESLyric/歌词搜索...");
            break;
        case 4:
            fb.RunMainMenuCommand("View/ESLyric/重载歌词");
            break;
        case 5:
            fb.RunMainMenuCommand("View/ESLyric/置顶桌面歌词");
            break;
        case 6:
            fb.RunMainMenuCommand("View/ESLyric/锁定桌面歌词");
            break;
        case 7:
            fb.RunMainMenuCommand("View/ESLyric/参数设置...");
            break;
        case 10:
            if (metadb) {
                if (no_lyric) {
                    metadb.UpdateFileInfoSimple("ESLYRIC", "");
                } else {
                    metadb.UpdateFileInfoSimple("ESLYRIC", "NO-LYRIC");
                };
            };
            ReloadLyric();
			break;
	};

	_esl.Dispose();
	if (fb.GetMainMenuCommandStatus('View/ESLyric/显示桌面歌词') & MENU_ITEM_CHECKED) {
		buttons[0].update(images.lrc_on_normal, images.lrc_on_normal, images.lrc_on_down);
	} else {
		buttons[0].update(images.lrc_off_normal, images.lrc_off_normal, images.lrc_off_down);
	}
	buttons[0].repaint();

}

function ReloadLyric() {
    window.SetTimeout(function() {
        fb.RunMainMenuCommand("View/ESLyric/重载歌词");
        fb.trace("reload lyric");
    }, 200);
};

function getColors() {

    var arr;
    arr = window.GetProperty("*Colors.Highlight", "1-160-216").split("-");
    colors.highlight = RGB(arr[0], arr[1], arr[2]);

    // get system's highlight color
    if (!properties.enableCustomColors) {
        if (window.InstanceType ==0) {
            colors.highlight = window.GetColorCUI(ColorTypeCUI.active_item_frame);
        } else if (window.InstanceType == 1) {
            colors.highlight = window.GetColorDUI(ColorTypeDUI.highlight);
        }
    }

    // background color
    arr = window.GetProperty("*Colors.Background", "240-240-240").split("-");
    colors.background = RGB(arr[0], arr[1], arr[2]);

};


function DrawBoxBlurText(gr, text, font, font_color, shadow_color, radius, iteration, x, y, w, h, align) {

    var img_to_blur, _g;

    img_to_blur = gdi.CreateImage(w*10, h*10);
    _g = img_to_blur.GetGraphics();

    _g.SetTextRenderingHint(TextRenderingHint.AntiAlias);
    _g.DrawString(text, font, shadow_color, 2*x, 2*y, w, h, align);

    img_to_blur.ReleaseGraphics(_g);
    img_to_blur.BoxBlur(radius, iteration);

    img_to_blur && gr.DrawImage(img_to_blur, x, y, w, h, x*2, y*2, w, h, 0, 255);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
    gr.DrawString(text, font, font_color, x, y, w, h, align);
    gr.SetTextRenderingHint(TextRenderingHint.Default);

};
