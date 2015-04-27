// vim:set ft=javascript et:
// updated: 2015/04/27

function getImagePath(image) {
	return gdi.Image(imagePath + image);
};

var MENU_ITEM_CHECKED = 1 << 1;


var ww = 0, wh = 0;

var buttons = [];
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
};

var hand = false;
var handPrev = false;
var mouseOver = false;
var stopped = false;  // playback status: stopped
var shuffleType = window.GetProperty("shuffle type", 4);

window.MaxHeight = window.MinHeight = 50;
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



// volumebar
var volumeBar = new function() {
	this.pos = 0;
	this.start = 0;
	this.hovX = 0;
	this.drag = 0;
	this.dragHov = false;
	var w1 = 105;
	var w2 = 101;
	this.y;


	this.draw = function(gr, start, y) {
		this.start = start;
		this.y = y;
		// background
		gr.SetSmoothingMode(2);
		gr.FillRoundRect(this.start + 0, this.y - 1.5, w1, 9.5, 4.5, 4.5, RGBA(255, 255, 255, 210));
		gr.FillRoundRect(this.start + 0, this.y - 1.5, w1, 8.5, 4.0, 4.0, RGBA(0, 0, 0, 140));
		gr.FillRoundRect(this.start + 1, this.y + 0.5, w1 - 2, 6, 3, 3, RGBA(255, 255, 255, 110));
		gr.FillRoundRect(this.start + 0, this.y - 0.5, w1, 6, 3, 3, RGBA(255, 255, 255, 10));
		gr.DrawRoundRect(this.start + 0, this.y - 1.5, w1, 8.0, 4.0, 4.0, 1.0, RGBA(0, 0, 0, 25));
		gr.FillRoundRect(this.start + 0.5, this.y - 0.5, w1-1, 3, 1.2, 1.2, RGBA(0, 0, 0, 15));
		gr.SetSmoothingMode(0);
		// cursor
		gr.SetSmoothingMode(2);
		this.pos = vol2pos(fb.Volume);
		if (this.pos > 0) {
			gr.FillRoundRect(this.start + 1, this.y - 0, 6 + this.pos - 1, 6, 2.5, 2.5, RGBA(12, 12, 12, 90));
			gr.FillRoundRect(this.start + 2, this.y + 1, 6 + this.pos - 3, 4.5, 2.0, 2.0, RGBA(255, 255, 255, 40));
		}
		gr.SetSmoothingMode(0);
		var knob = images.soundBar_knob;
		gr.DrawImage(knob, this.start + this.pos - 9 + 2, this.y - 5, knob.Width - 0, knob.Height, 0, 0, knob.Width, knob.Height, 0, 255);
	};

	this.on_mouse_move = function (x, y) {
		// vol hover?
		// var temp = this.dragHov;
		if ((x - 1) >= this.start && (x-1) <= this.start+w1 && y > this.y - 3 && y < this.y + 9) {
			this.dragHov = true;
		} else {
			this.dragHov = false;
		}

		// volume seeker
		if (this.drag) {
			var v = pos2vol((x - 1) - this.start);
			v = (v <= -100) ? -100 : (v >= 0) ? 0 : v;
			fb.Volume = v;
		}
	}

	this.on_mouse_lbtn_down = function(x, y) {
		// if volume click
		if (this.dragHov) {
			this.drag = true;
			this.on_mouse_move(x - 1, y + 1);
		} else {
			this.drag = false;
		}
	}

	this.on_mouse_lbtn_up = function(x, y) {
		this.drag = false;
	}

	this.on_mouse_wheel = function(delta) {
		if (this.dragHov) {
			if (delta > 0) {
				this.pos = this.pos < this.start + w2 ? this.pos+2 : this.pos;
			} else {
				this.pos = this.pos <= 0 ? this.pos : this.pos - 2;
			}
			var v = pos2vol(this.pos);
			v = (v <= 100) ? -100 : (v >= 0) ? 0 : v;
			fb.Volume = v;
			window.RepaintRect(this.start - 15, 0, w2 + 30, wh);
		}
	}

	this.on_volume_change = function(val) {
		window.RepaintRect(this.start - 15, 0, w2 + 30, wh);
	};

	function pos2vol(pos) {
		return (50 * Math.log(0.99 * (pos/w2<0?0:pos/w2) + 0.01) / Math.LN10);
	}

	function vol2pos(v){
		return (Math.round(((Math.pow(10, v / 50) - 0.01) / 0.99)*w2));
	}

}();

var seekSlider = new function() {
    this.draw = function(gr, x, y) {
        this.x = x;
        this.y = y;
        this.w = ww - this.x * 2;
        // seek bg
        gr.SetSmoothingMode(2);
        gr.FillRoundRect(this.x + 1, this.y + 0, this.w - 2, 7, 3, 3, RGBA(0, 0, 0, 140));
        gr.FillRoundRect(this.x + 2, this.y + 2, this.w - 4, 5, 1, 1, RGBA(255, 255, 255, 110));
        gr.FillRoundRect(this.x + 1, this.y + 1, this.w - 2, 5, 1, 1, RGBA(255, 255, 255, 110));
        // seek cursor
        if (fb.PlaybackLength > 0) {
            if (this.pos > 1) {
                gr.FillRoundRect(this.x + 0, this.y + 0.5, 3 + this.pos, 6, 2.0, 2.0, RGBA(70, 72, 75, 120));
            }
        }
                
    };
    this.on_size = function () {
       // this.w  = ww - this.x * 2;
        this.h = 8;
    };
    this.on_playback_time = function (time) {
        this.pos = (fb.PlaybackTime / fb.PlaybackLength) * this.w;
        this.repaint();
    }; 
    this.repaint = function() {
        window.RepaintRect(0, this.y - 2, ww, 10);
    }        
    this.pos = 0;
    this.x;
    this.y;
    this.w;
    this.h;
}()


function on_size() {
    if (!window.Width || !window.Height) return;
    ww = window.Width;
    wh = window.Height;
    
    seekSlider.on_size();
}

function on_paint(gr) {
    
	// draw background

    gr.FillSolidRect(0, 0, ww, wh, RGB(195, 195, 195));
    gr.FillSolidRect(0, 0, ww, 1, RGBA(0, 0, 0, 100));
    gr.FillSolidRect(0, wh-31, ww, 1, RGBA(0, 0, 0, 50));
    gr.FillSolidRect(0, wh-30, ww, 1, RGBA(255, 255, 255, 100));

	// draw buttons
	for (var i = 0; i < buttons.length; i++) {
		var bh = (wh - 30) + (30 - buttons[i].h) / 2;
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
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 15, bh);
				break;
			case 2:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 5, bh);
				break;
			case 3:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 5, bh);
				break;
			case 4:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 20, bh);
				break;
			case 5:
				buttons[i].draw(gr, buttons[i-1].x + buttons[i-1].w + 5, bh);
				break;
		}
	}

	// draw volumeBar
	volumeBar.draw(gr, ww - 125, (wh - 30) + (30-6)/2);
    
    // draw seekbar
    seekSlider.draw(gr, 5, 6);

}

// ========================================== // mouse event
function on_mouse_move(x, y) {
	// buttons
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].checkState('move', x, y);
	}
	
	// sound bar
	volumeBar.on_mouse_move(x, y);
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
					//fb.RunMainMenuCommand('View/ESLyric/显示桌面歌词');

					//refreshEslyricButton();
					ESLyricPopupMenu(buttons[0].x, buttons[0].y);
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

//function updateESLyric() {
  //  if (fb.IsPlaying) {
        window.NotifyOthers("_eslyric_set_text_fallback_", "This is Jeannela's foobar2000!\n- ESLyric -");
        window.NotifyOthers("_eslyric_set_text_titleformat_fallback_", "[Artist: %artist%$crlf()]Title: %title%$crlf()- No Lyric -");
        
   // }   
//}
//updateESLyric();
// ========================================================================
function on_playback_order_changed(new_order) {
	refreshPlaybackOrderButton();
}

function on_playback_stop(reason) {
	//if (reason === 0) {
		refreshPlayOrPauseButton();
	//}
}

function on_playback_starting(cmd, is_paused) {
	refreshPlayOrPauseButton();
}

function on_playback_new_track(metadb) {
	refreshPlayOrPauseButton();
}

function on_playback_pause(state) {
	refreshPlayOrPauseButton();
}

function on_playback_time(time) {
    seekSlider.on_playback_time();
}

function on_volume_change(val) {
	volumeBar.on_volume_change(val);
}

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

function ESLyricPopupMenu(x, y) {
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
                fb.RunMainMenuCommand("View/ESLyric/重载歌词") || fb.RunMainMenuCommand("视图/ESLyric/重载歌词");
            };
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

