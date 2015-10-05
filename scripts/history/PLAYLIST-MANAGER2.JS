// ==PREPROCESSOR==
//@name "foobox WSH Playlist Manager"
// @feature "dragdrop"
// ==/PREPROCESSOR==

// Graphical playlist switcher by Fanco86, mod by dreamawake

//==load script====
var scriptPath = fb.FoobarPath+"skins\\foobox";
var script = utils.ReadTextFile(scriptPath+"\\textfont.js");
eval(script);
var script = utils.ReadTextFile(scriptPath+"\\button.js");
eval(script);
script = undefined;
//==
var tray=[];
window.NotifyOthers("Get_Lang_Plman", tray);
////////////////////////////////////
var ww,wh;
var g_handles = null;
//Text
IFormat = DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_END_ELLIPSIS | DT_NOPREFIX;
IFormat_c = DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_END_ELLIPSIS | DT_NOPREFIX;
var textcolor_normal = RGB(220,220,220);
var textcolor_active = RGB(255,255,255)
	var textcolor_playing= RGB(255,255,255);
	function getfont(){
		fontName = GetFontName();
		fs = GetFontStyle();
		g_font = gdi.Font(fontName,font_size,fs);
		g_font_b=gdi.Font(fontName,font_size,1);
		window.SetProperty("Display.font.size",font_size);
	}
//-------------------------
function StringFormat(h_align, v_align, trimming, flags) {return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);}
function RGBA(r, g, b, a) { return (a << 24)|(r << 16)|(g << 8)|(b);}
function RGB(r, g, b) { return 0xff000000|(r << 16)|(g << 8)|(b);}

function Img(path){return gdi.Image(fb.FoobarPath + "\\skins\\foobox\\images\\" + path);}
//-------------------------

ROW_HEIGHT = 34;
PADDING_TOP = ROW_HEIGHT;
PADDING_LEFT = 8;
PADDING_RIGHT = 8;
SCROLLBAR_WIDTH = 12;
//-------------------------
var iconSize = 12;
var PlaylistIcon = Img("ico-playlist.png");
var PlaylistsArr = [];
//===========
var font_size=window.GetProperty("Display.font.size",12);
//=========
var SCROLLBAR_MODE = window.GetProperty("Scrollbar Mode", 2); //0=always, 1=never, 2=auto hide
var SHOW_COUNT = window.GetProperty("Show TrackCount", true);
//-------------------------
var NewPlaylistButton = new ButtonUI(6,6,34,34,Img("btn-pl-add.png"),tray[0],0);
var NewPlaylistMenuButton = new ButtonUI(6+36,6,34,34,Img("btn-pl-dd.png"),"",0);
//-------------------------
function Init_Playlists(){
	var itemCount;
	PlaylistsArr.Length = 0;
	for(j=0; j<fb.PlaylistCount; j++){
		itemCount = "("+fb.PlaylistItemCount(j) +")";
		itemCount = (itemCount!=null) ? itemCount : 0;
		PlaylistsArr[j] = [fb.IsAutoPlaylist(j)|0, fb.GetPlaylistName(j), itemCount];
	}
}
Init_Playlists();
//==========
var time000 = window.SetTimeout(function(){
	Init_Playlists();
	window.Repaint();
	window.ClearTimeout(time000);
}, 150);

var scrollBarVisible = false;
function RefreshScrollbar(){
	scrollerHeight = (visibleItemCount * windowHeight / fb.PlaylistCount)|0;
	scrollbar_Y = ((idxStart * windowHeight / fb.PlaylistCount)|0) + PADDING_TOP;
	if(scrollerHeight<25) scrollerHeight_2 = 25;
	else scrollerHeight_2 = scrollerHeight;
}

function GetPlaylistIdx(y){
	var p = Math.floor((y-PADDING_TOP)/ROW_HEIGHT) + idxStart;
	if(p>=0 && p<fb.PlaylistCount) {return p} else {return null};
}

var windowHeight = 0;//window.Height - PADDING_TOP;
var visibleItemCount = (windowHeight / ROW_HEIGHT)|0 ;

var idxStart = 0;
var hasScrollbar = false;

var scrollStart_Y = 0;
var scrolling = false;

var draggingFile = false;
var dropHover_Y = 0;

var draggingPlaylist = false;
var movePlaylistIdx;
var movetoPlaylistIdx;
var dragSplitter_Y = 0;

//=========================    
function on_size(){
	ww = window.Width;
	wh = window.Height;
	windowHeight = wh - PADDING_TOP;
	visibleItemCount = ((windowHeight / ROW_HEIGHT)|0);

	ROW_WIDTH = ww - PADDING_RIGHT;

	hasScrollbar = (fb.PlaylistCount > visibleItemCount);

	if(idxStart + visibleItemCount > fb.PlaylistCount){
		idxStart = fb.PlaylistCount - visibleItemCount;
	}
	if(idxStart<0)idxStart=0;

	RefreshScrollbar();
	getfont();
}

var icon_y_offset = (ROW_HEIGHT - iconSize)/2+1 |0;

function on_paint(gr){
	gr.FillSolidRect(0,0,ww,wh,RGBA(40,40,40,255));
	//buttons
	var btcolor=RGB(220,220,220);

	//draw playlist
	var idx = 0,itemCountTextWidth = 0;
	var text_color;
	for(var k = 0; (k + idxStart < fb.PlaylistCount) && k<=visibleItemCount; k++){
		idx = k + idxStart;
		if(SHOW_COUNT){
			itemCountTextWidth = gr.CalcTextWidth(PlaylistsArr[idx][2]+" ", g_font_b);
		}
		//gr.DrawLine(0,(k+1)*ROW_HEIGHT-1,ww,(k+1)*ROW_HEIGHT-1,1,RGB(20,20,20));
		gr.DrawLine(0,(k+1)*ROW_HEIGHT-1,ww,(k+1)*ROW_HEIGHT-1,1,RGB(28,28,28));
		// gr.DrawLine(0,(k+1)*ROW_HEIGHT,ww,(k+1)*ROW_HEIGHT,1,RGB(55,55,55));
		if(idx == fb.PlayingPlaylist && fb.IsPlaying){
			text_color=textcolor_playing;
			gr.FillSolidRect(0, k*ROW_HEIGHT+PADDING_TOP,ww, ROW_HEIGHT,RGB(41,138,190));
		} else if (idx == fb.ActivePlaylist){
			text_color=textcolor_active;
			gr.FillSolidRect(0, k*ROW_HEIGHT+PADDING_TOP,ww, ROW_HEIGHT,RGB(20,20,20));
		} else {
			text_color=textcolor_normal;
		}
		gr.DrawImage(PlaylistIcon, PADDING_LEFT, (k*ROW_HEIGHT+PADDING_TOP+icon_y_offset), 12, 12, (PlaylistsArr[idx][0]*12),  0, 12, 12);
		gr.GdiDrawText(PlaylistsArr[idx][1], g_font, text_color, PADDING_LEFT+iconSize+8, k*ROW_HEIGHT+PADDING_TOP+2,ROW_WIDTH - itemCountTextWidth-35,ROW_HEIGHT-4,IFormat);
		if(SHOW_COUNT)  gr.gdiDrawText(PlaylistsArr[idx][2],g_font_b,text_color,ROW_WIDTH-itemCountTextWidth-5, k*ROW_HEIGHT+PADDING_TOP+2, itemCountTextWidth, ROW_HEIGHT-4,IFormat_c);
	}
	//gr.DrawLine(0,(k+1)*ROW_HEIGHT-1,ww,(k+1)*ROW_HEIGHT-1,1,RGB(20,20,20));
	gr.DrawLine(0,(k+1)*ROW_HEIGHT-1,ww,(k+1)*ROW_HEIGHT-1,1,RGB(28,28,28));
	//gr.DrawLine(0,(k+1)*ROW_HEIGHT,ww,(k+1)*ROW_HEIGHT,1,RGB(55,55,55));
	//draws scrollbar
	if(hasScrollbar && (SCROLLBAR_MODE==0 || (SCROLLBAR_MODE==2 && scrollBarVisible)) && (wh>PADDING_TOP+scrollerHeight_2)){
		gr.SetSmoothingMode(2);
		if((scrollbar_Y+scrollerHeight_2)<wh) gr.FillRoundRect(ww-SCROLLBAR_WIDTH,scrollbar_Y,SCROLLBAR_WIDTH-2,scrollerHeight_2 - 4,4,4,RGBA(0,0,0,150));
		else gr.FillRoundRect(ww-SCROLLBAR_WIDTH,wh-scrollerHeight_2,SCROLLBAR_WIDTH-2,scrollerHeight_2 - 4,4,4,RGBA(0,0,0,150));
		gr.SetSmoothingMode(0);
	}

	if(draggingFile && dropHover_Y>=PADDING_TOP)
	{
		gr.FillSolidRect(0, dropHover_Y,ww, ROW_HEIGHT,RGBA(0,0,0,200));
	}
	if(draggingPlaylist && dragSplitter_Y>=PADDING_TOP && movePlaylistIdx!=movetoPlaylistIdx)
	{
		gr.FillSolidRect(0, dragSplitter_Y, ww, 2, RGBA(0,0,0,200));
	}
	//==========
	NewPlaylistButton.Paint(gr);
	NewPlaylistMenuButton.Paint(gr);
	gr.FillSolidRect(54,20,9,1,btcolor);
	gr.FillSolidRect(55,21,7,1,btcolor);
	gr.FillSolidRect(56,22,5,1,btcolor);
	gr.FillSolidRect(57,23,3,1,btcolor);
	gr.FillSolidRect(58,24,1,1,btcolor);

	gr.drawline(0,0,ww,0,1,RGBA(0,0,0,100));
	gr.drawline(0,1,ww,1,1,RGBA(0,0,0,60));
	gr.drawline(0,2,ww,2,1,RGBA(0,0,0,30));    
	gr.drawline(0,3,ww,3,1,RGBA(0,0,0,15)); 

	gr.drawline(0,wh-1,ww,wh-1,1,RGBA(0,0,0,100));
	gr.drawline(0,wh-2,ww,wh-2,1,RGBA(0,0,0,60));
	gr.drawline(0,wh-3,ww,wh-3,1,RGBA(0,0,0,30));    
	gr.drawline(0,wh-4,ww,wh-4,1,RGBA(0,0,0,15));  
}
//============

function on_mouse_wheel(step){
	if(hasScrollbar){
		idxStart -= step;
		if(idxStart < 0) idxStart = 0;
		if(idxStart > fb.PlaylistCount - visibleItemCount) idxStart = fb.PlaylistCount - visibleItemCount;
		RefreshScrollbar();
		window.Repaint();
	}
}

var hbtn=false;

function on_mouse_move(x, y){
	if(NewPlaylistButton.MouseMove(x, y)) hbtn=true;
	if(NewPlaylistMenuButton.MouseMove(x, y)) hbtn=true;
	if(hasScrollbar) {
		if(!scrollBarVisible){
			scrollBarVisible = true;
			window.Repaint();
		}
	}
	if(hasScrollbar && scrolling){
		scrollbar_Y = Math.max(y - scrollStart_Y + exScrollbar_Y,PADDING_TOP);
		if(scrollbar_Y + scrollerHeight > wh){scrollbar_Y = wh - scrollerHeight;}
		idxStart = ((scrollbar_Y-PADDING_TOP) * fb.PlaylistCount / windowHeight)|0;
		if(idxStart > fb.PlaylistCount - visibleItemCount) idxStart = fb.PlaylistCount - visibleItemCount;
		window.Repaint();
	}

	if(draggingPlaylist){
		dragSplitter_Y = Math.floor((y-PADDING_TOP)/ROW_HEIGHT+1)*ROW_HEIGHT + PADDING_TOP;
		var t = GetPlaylistIdx(y);
		if(t != null){
			movetoPlaylistIdx = t;
		}
		window.Repaint();
		if(y<PADDING_TOP)on_mouse_wheel(1);
		if(y>wh-20)on_mouse_wheel(-1);
	} 
	var idx2=GetPlaylistIdx(y);
	//drag WSH playlist viewer tracks           
	if(g_handles!=null) {
		if (idx2 != null){
			var insert_index = fb.PlaylistItemCount(idx2);
			plman.InsertPlaylistItems(idx2, insert_index, g_handles, false); 
		} 
		else{
			fb.RunMainMenuCommand(tray[15]);
			//fb.CreatePlaylist(fb.PlaylistCount,"");
			var insert_index = fb.PlaylistItemCount(fb.PlaylistCount-1);
			plman.InsertPlaylistItems(fb.PlaylistCount-1, insert_index, g_handles, false);                        
		}              
	}
	g_handles = null;

}


function on_mouse_lbtn_down(x, y){
	NewPlaylistButton.MouseDown(x, y);
	if(NewPlaylistMenuButton.MouseDown(x, y)){
		hbtn=false;
		var a = CreateNewMenu.TrackPopupMenu(47, 38);
		switch(a){
			case 1:
				fb.ActivePlaylist = fb.CreateAutoPlaylist(fb.PlaylistCount,"","");
				RenamePL(fb.ActivePlaylist);
				fb.ShowAutoPlaylistUI(fb.ActivePlaylist);
				break;
			case 2:
				fb.LoadPlaylist();
				break;
			case 3:
				fb.RunMainMenuCommand(tray[16]);
				break;
			case 4:
				fb.RunMainMenuCommand(tray[17]);
				break;
			case 5:
				SHOW_COUNT=!SHOW_COUNT;
				window.SetProperty("Show TrackCount", SHOW_COUNT);
				CreateNewMenu.CheckMenuItem(5,SHOW_COUNT);
				window.Repaint();
				break;
			case 6:
				SCROLLBAR_MODE=0;
				window.SetProperty("Scrollbar Mode", 0);
				_ScrollbarOption.CheckMenuRadioItem(6,8,6);
				break;
			case 7:
				SCROLLBAR_MODE=1;
				window.SetProperty("Scrollbar Mode", 1);
				_ScrollbarOption.CheckMenuRadioItem(6,8,7);
				break;
			case 8:
				SCROLLBAR_MODE=2;
				window.SetProperty("Scrollbar Mode", 2);
				_ScrollbarOption.CheckMenuRadioItem(6,8,8);
				break;
			default:
				break;        
		}
		NewPlaylistMenuButton.Reset();
	}

	if(hasScrollbar && (x > ww-SCROLLBAR_WIDTH) && y>PADDING_TOP){
		var scroller_area = scrollbar_Y + scrollerHeight_2;
		var scroller_start = (scroller_area>wh) ? (wh - scrollerHeight_2) : scrollbar_Y;
		var scroller_end = scroller_start + scrollerHeight_2;
		if(y < scroller_start){on_mouse_wheel(3)}
		if(y>scroller_start && y < scroller_end){
			exScrollbar_Y = scrollbar_Y;
			scrollStart_Y = y;
			scrolling = true;
		}
		if(y > scroller_end){on_mouse_wheel(-3)}
	}else{
		if(y>PADDING_TOP){
			var t = GetPlaylistIdx(y);
			if(t != null){
				fb.ActivePlaylist = t;
				draggingPlaylist = true;
				dragSplitter_Y = Math.floor(y/ROW_HEIGHT+1)*ROW_HEIGHT;
				movePlaylistIdx = t;
				movetoPlaylistIdx = t;
			}
		}
	}
	//window.Repaint();
}


function on_mouse_lbtn_up(){
	if(NewPlaylistButton.MouseUp()){
		fb.RunMainMenuCommand(tray[15]);
		//fb.ActivePlaylist = fb.CreatePlaylist(fb.PlaylistCount,"");
		//fb.RunMainMenuCommand("File/Rename playlist");
		RenamePL(fb.ActivePlaylist);
	}
	NewPlaylistMenuButton.MouseUp();
	scrolling = false;
	scrollStart_Y = 0;
	if(draggingPlaylist){
		if(dragSplitter_Y > PADDING_TOP){
			if(movePlaylistIdx > movetoPlaylistIdx)movetoPlaylistIdx += 1;
		}
		fb.MovePlaylist(movePlaylistIdx,movetoPlaylistIdx);
	}
	draggingPlaylist = false;
}

function on_mouse_lbtn_dblclk(x, y){
	if(y>PADDING_TOP){
		var t = GetPlaylistIdx(y);
		if(t!= null){
			fb.PlayingPlaylist = t;
			fb.Play();
		}
		else{
			fb.RunMainMenuCommand(tray[15]);
		}
	}
	else if (x>80){
		var act_pls = plman.ActivePlaylist;
		if(act_pls<idxStart) on_mouse_wheel(idxStart-act_pls);
		else if(act_pls>(idxStart+visibleItemCount)) on_mouse_wheel(idxStart-act_pls+visibleItemCount-1);
	}
}

var rbtnDown;
function on_mouse_rbtn_down(x, y,vkey){
	if(y>PADDING_TOP){
		var t = GetPlaylistIdx(y);
		if(t != null){
			//fb.ActivePlaylist = t;
			var a = fb.IsAutoPlaylist(t) ? AutoplaylistMenu.TrackPopupMenu(x, y, 0) : PlaylistMenu.TrackPopupMenu(x, y, 0);
			switch(a){
				case 1:
					RenamePL(t)
						break;
				case 2:
					fb.RemovePlaylist(t);
					fb.ActivePlaylist =  t;
					break;
				case 3:
					fb.ActivePlaylist = t;
					fb.SavePlaylist();
					break;
				case 4:
					fb.ShowAutoPlaylistUI(t);
					break;
				case 5:
					var auto_name = plman.GetPlaylistAutoName(plman.ActivePlaylist);
					plman.RenamePlaylist(plman.ActivePlaylist, auto_name);
					break;
			}
		}
	}
	rbtnDown = vkey==6 ? true : false;	
}

function on_mouse_leave(){
	scrollBarVisible = false;
	scrolling = false;
	window.Repaint();
	if(!hbtn) return;
	else {
		NewPlaylistMenuButton.Reset();
		NewPlaylistButton.Reset();
	}
}

function on_playlists_changed(){
	Init_Playlists();
	on_size();
	window.Repaint();
}

function on_playlist_switch(){
	//Init_Playlists();
	window.Repaint();
}

function on_playback_starting(){
	window.Repaint();
}

function on_playlist_items_added(playlist){
	Init_Playlists();
	window.Repaint();
}

function on_playlist_items_removed(playlist, new_count){
	Init_Playlists();
	window.Repaint();
}


//----------Drag & Drop------------
function on_drag_enter() {
	draggingFile = true;
}

function on_drag_leave() {
	draggingFile = false;
	scrolling = false;
	window.Repaint();
}

function on_drag_over(action, x, y, mask) {
	dropHover_Y = (((y-PADDING_TOP)/ROW_HEIGHT)|0)*ROW_HEIGHT + PADDING_TOP;
	window.Repaint();
	if(y<PADDING_TOP)on_mouse_wheel(1);
	if(y>wh-20)on_mouse_wheel(-1);
}

function on_drag_drop(action,x, y, mask) {
	// var gb;
	draggingFile = false;
	var t = GetPlaylistIdx(y);
	if (t){
		// We are going to process the dropped items to a playlist
		action.ToPlaylist();
		action.Playlist = t;
		action.ToSelect = false;
	}else{
		//fb.CreatePlaylist(fb.PlaylistCount,"");
		fb.RunMainMenuCommand(tray[15]);
		action.Playlist = fb.PlaylistCount-1;
		action.ToPlaylist();
		action.ToSelect = false;
	}
}

function on_mouse_rbtn_up(x, y,vkey){
	if (rbtnDown) {
		rbtnDown=false;
		return vkey==4 ? false : true;
	} else return true;
}

function on_notify_data(name, info) {
	switch(name) {
		case "WSH_playlist_drag_drop": // send from a WSH playlist panel to simulate a drag and drop feature
			g_handles = info;
			break;
		case "fontsize_update":
			font_size = Number(info);
			on_font_changed();
			break;
	}
}
//==========Menu===
var CreateNewMenu = window.CreatePopupMenu();
var _ScrollbarOption = window.CreatePopupMenu();
CreateNewMenu.AppendMenuItem(0, 1, tray[1]);
CreateNewMenu.AppendMenuItem(0, 2, tray[2]);
CreateNewMenu.AppendMenuItem(0, 3, tray[3]);
CreateNewMenu.AppendMenuSeparator();
CreateNewMenu.AppendMenuItem(0, 4, tray[4]);
CreateNewMenu.AppendMenuSeparator();
CreateNewMenu.AppendMenuItem(0, 5, tray[5]);
CreateNewMenu.CheckMenuItem(5, SHOW_COUNT?1:0);
_ScrollbarOption.AppendTo(CreateNewMenu,0, tray[6]);
_ScrollbarOption.AppendMenuItem(0, 6, tray[7]);
_ScrollbarOption.AppendMenuItem(0, 7, tray[8]);
_ScrollbarOption.AppendMenuItem(0, 8, tray[9]);
_ScrollbarOption.CheckMenuRadioItem(6,8,SCROLLBAR_MODE+6);

var PlaylistMenu = window.CreatePopupMenu();
PlaylistMenu.AppendMenuItem(0, 2, tray[10]);
PlaylistMenu.AppendMenuItem(0, 3, tray[12]+"...");
PlaylistMenu.AppendMenuItem(0, 1, tray[11]);
PlaylistMenu.AppendMenuItem(0, 5, tray[27]);

var AutoplaylistMenu = window.CreatePopupMenu();
AutoplaylistMenu.AppendMenuItem(0, 2, tray[10]);
AutoplaylistMenu.AppendMenuItem(0, 3, tray[12]+"...");
AutoplaylistMenu.AppendMenuItem(0, 1, tray[11]);
AutoplaylistMenu.AppendMenuItem(0, 5, tray[27]);
AutoplaylistMenu.AppendMenuSeparator();
AutoplaylistMenu.AppendMenuItem(0, 4, tray[13]);

function RenamePL(idx){
	fb.ActivePlaylist = idx;
	fb.RunMainMenuCommand(tray[18]);
}


function on_font_changed() {
	getfont();
	window.Repaint();
}

function on_playback_stop(reason) {
	window.Repaint();
}
// Keyboard Flags & Tools
var VK_BACK = 0x08;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_INSERT = 0x2D;
var VK_DELETE = 0x2E;
var VK_SPACEBAR = 0x20;
var KMask = {
	none: 0,
	ctrl: 1,
	shift: 2,
	ctrlshift: 3,
	ctrlalt: 4,
	ctrlaltshift: 5,
	alt: 6
};
function GetKeyboardMask() {
	var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
	var a = utils.IsKeyPressed(VK_ALT) ? true : false;
	var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
	var ret = KMask.none;
	if (c && !a && !s) ret = KMask.ctrl;
	if (!c && !a && s) ret = KMask.shift;
	if (c && !a && s) ret = KMask.ctrlshift;
	if (c && a && !s) ret = KMask.ctrlalt;
	if (c && a && s) ret = KMask.ctrlaltshift;
	if (!c && a && !s) ret = KMask.alt;
	return ret;
};
function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	var act_pls = plman.ActivePlaylist;
	if (mask == KMask.none && fb.PlaylistCount>0) {
		switch (vkey) {
			case VK_UP:
				if(act_pls<idxStart) on_mouse_wheel(idxStart-act_pls);
				else if(act_pls>(idxStart+visibleItemCount)) on_mouse_wheel(idxStart-act_pls+visibleItemCount-1);
				else{
					if(act_pls==idxStart) on_mouse_wheel(1);
					if (act_pls > 0) fb.ActivePlaylist =  act_pls-1;
				}
				break;
			case VK_DOWN:
				if(act_pls<idxStart) on_mouse_wheel(idxStart-act_pls);
				else if(act_pls>(idxStart+visibleItemCount)) on_mouse_wheel(idxStart-act_pls+visibleItemCount-1);
				else {
					if (act_pls != fb.PlaylistCount-1) fb.ActivePlaylist =  act_pls+1;
					if((act_pls-idxStart)==(visibleItemCount-1)) on_mouse_wheel(-1);
				}
				break;
			case VK_PGUP:
				on_mouse_wheel(10);
				break;
			case VK_PGDN:
				on_mouse_wheel(-10);
				break;
			case VK_RETURN:
				fb.PlayingPlaylist = act_pls;
				fb.Play();        
				break;
			case VK_END:
				on_mouse_wheel(-fb.PlaylistCount);
				break;
			case VK_HOME:
				on_mouse_wheel(fb.PlaylistCount);
				break;
			case VK_DELETE:
				fb.RemovePlaylist(act_pls);
				fb.ActivePlaylist =  act_pls;
				break;
		};
	} else {
		switch(mask) {
			case KMask.ctrl:
				if(vkey==65) { // CTRL+A
					fb.RunMainMenuCommand(tray[19]);
					//   window.Repaint();
				};            
				if(vkey==70) { // CTRL+F
					fb.RunMainMenuCommand(tray[20]);//search
				};
				if(vkey==78) { // CTRL+N
					fb.RunMainMenuCommand(tray[21]);
				};
				if(vkey==79) { // CTRL+O
					fb.RunMainMenuCommand(tray[22]);
				};
				if(vkey==80) { // CTRL+P
					fb.RunMainMenuCommand(tray[23]);
				};
				if(vkey==83) { // CTRL+S
					fb.RunMainMenuCommand(tray[24]);
				};
				if(vkey==87) { // CTRL+W
					fb.RunMainMenuCommand(tray[25]);
				};                
				break;
			case KMask.alt:
				if(vkey==65) { // ALT+A
					fb.RunMainMenuCommand(tray[26]);
				};
				if(vkey==115) { // ALT+F4
					fb.RunMainMenuCommand(tray[28]);
				};
				break;
		};
	};
};
