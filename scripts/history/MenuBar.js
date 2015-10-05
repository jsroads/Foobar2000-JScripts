//## a foobar2000's menubar WSH script.
//## created by Ja
//## updated: 2015/05/04



// ==================== global parameters ==================
var DT_CC = DT_CENTER | DT_VCENTER | DT_CALCRECT;

var ww, wh;
var mbg_id = null;
var pressedId = null;


	
window.DlgCode = DLGC_WANTALLKEYS;

function initMenus() {
	var i;

	// file, edit, view, playback, library, help
	for (i = 0; i < 7; i++) {
        panel.menuImages[i] = setMenuButtons(panel.menu.str[i]);
		panel.menus[i] = new oButton(panel.menuImages[i], 0, 0);
	}
}

// ---------- update panel size -----------


function popupMainMenu(entry, x, y) {
	var menuman = fb.CreateMainMenuManager();
	var menu = window.CreatePopupMenu();
	var ret;

	menuman.Init(entry);
	menuman.BuildMenu(menu, 1, 512);

	ret = menu.TrackPopupMenu(x, y);

	if (ret > 0) { 
		menuman.ExecuteByID(ret - 1); 
	}

	menuman.Dispose();
	menu.Dispose();


	if (mbg_id != null) {
		panel.menus[mbg_id].updateImage(setMenuButtons(panel.menu.str[mbg_id]));
		mbg_id = null;
		window.Repaint();
	}
}


// ==================== main process =======================
// exec once on start
initMenus();

// ================= callbacks functions  ==================
// exec on events
function on_size() {
	ww = window.Width;
	wh = window.Height;
	if(!ww || !wh) { return; }

	// set menu locations
	if (panel.menu.visible) {
		var menu_start_x = 5;
		for (var i = 0; i < panel.menus.length; i++) {
			switch(i) {
				case 0:
					panel.menus[i].updatePosition(menu_start_x, (panel.menu.h-21)/2);
					break;
				default:
					panel.menus[i].updatePosition(panel.menus[i-1].x + panel.menus[i-1].w + 2, (panel.menu.h-21)/2);
					break;
			}
		}
	}

}

function on_paint(gr) {
	// draw background
    gr.FillSolidRect(0, 0, ww, wh, RGB(195, 195, 195));
    //gr.FillGradRect(0, 0, ww, wh, 90, 0, RGBA(0, 0, 0, 25));
    gr.DrawLine(0, wh-2, ww, wh-2, 1, RGBA(255, 255, 255, 5));
    gr.DrawLine(0, wh-1, ww, wh-1, 1, RGBA(0, 0, 0, 55));
//	gr.SetSmoothingMode(0);

	// draw menus
	if (panel.menu.visible) {
		var mcolor;
		for (var i = 0; i < panel.menus.length; i++) {
			panel.menus[i].draw(gr, 255);
			mcolor = (mbg_id == i) ? RGB(240, 240, 240) : RGB(0, 0, 0);
			gr.GdiDrawText(panel.menu.str[i], panel.menu.font, mcolor,
					panel.menus[i].x, panel.menus[i].y, panel.menus[i].w, panel.menus[i].h, DT_CC);
		}
	}
}



function on_mouse_lbtn_down(x, y, mask) {

	// buttons
    pressedId = null;
    window.Repaint();


	// menu buttons
	
	if (panel.menu.visible) {
		mbg_id = null;
		window.Repaint();
		for (var i = 0; i < panel.menus.length; i++) {
			if (panel.menus[i].checkState("down", x, y, i) == 2) {

				mbg_id = i;

				panel.menus[mbg_id].updateImage([
						setMenuButtons(panel.menu.str[mbg_id])[2],
						setMenuButtons(panel.menu.str[mbg_id])[1],
						setMenuButtons(panel.menu.str[mbg_id])[2]
						]);
				
				if (i == panel.menus.length - 1) { 
					setOptionsMenu(panel.menus[i].x, panel.menus[i].y + panel.menus[i].h); }
				else { 
					setMainMenuEntry(panel.menu.str[i], panel.menus[i].x, 
							panel.menus[i].y + panel.menus[i].h); 
				}

				panel.menus[i].checkState("move", 0, 0, i);
			}	
		}
	}

    window.Repaint();

}

function on_mouse_lbtn_up(x, y, mask) {
	// menu buttons

	if (panel.menu.visible) {
		mbg_id = null;
		window.Repaint();

		for (var i = 0; i < panel.menus.length; i++) {
			if (panel.menus[i].checkState("down", x, y, i) == 2) { 

				mbg_id = i;

				panel.menus[mbg_id].updateImage([
						setMenuButtons(panel.menu.str[mbg_id])[2],
						setMenuButtons(panel.menu.str[mbg_id])[1],
						setMenuButtons(panel.menu.str[mbg_id])[2]
						]);

				if (i !== panel.menus.length -1) {
					setMainMenuEntry(panel.menu.str[i], 
                            panel.menus[i].x, panel.menus[i].y +panel.menus[i].h);
				} else {
					setOptionsMenu(panel.menus[i].x, panel.menus[i].y + panel.menus[i].h);
				}
				panel.menus[i].checkState("move", x, y, i);
			}
		}
	}

}

function on_mouse_lbtn_dblclk(x, y) {
}

function on_mouse_rbtn_down(x, y) {
}

function on_mouse_move(x, y) {
	// menus
	if (panel.menu.visible) {
		for (var i = 0; i < panel.menus.length; i++) {
			if (panel.menus[i].checkState("move", x, y) == 1) { }
		}
	}

}

function on_mouse_leave() {
	// menus
	if (panel.menu.visible) {
		for (var i = 0; i < panel.menus.length; i++) {
			panel.menus[i].checkState("leave");
		}
	}
}



// vi:set ft=javascript et:
