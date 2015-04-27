// ====================================== //
// @name "Common (22.10.2013)"
// @author "eXtremeHunter"
// ====================================== //
//---> 
//---> Common Helpers, Flags
//--->
var themeName = "CaTRoX";
var themeVersion = "";

// ================================================================================= //
var safeMode = uiHacks = false;
var UIHacks;
try {
    WshShell = new ActiveXObject("WScript.Shell");
} catch (e) {
    fb.trace("----------------------------------------------------------------------");
    fb.trace(e + "\nFix: Disable safe mode in Preferences > Tools > WSH Panel Mod");
    fb.trace("----------------------------------------------------------------------");
    safeMode = true;
}

if (!safeMode) {
    uiHacks = utils.CheckComponent("foo_ui_hacks");
    if (uiHacks) {
        UIHacks = new ActiveXObject("UIHacks");
    }
}
var panelsBackColor = RGB(255, 255, 255);
var panelsLineColor = RGBA(51, 153, 255, 155);
var panelsLineColorSelected = panelsLineColor;
var panelsNormalTextColor = RGB(62, 62, 62);
// ================================================================================= //
//--->

String.prototype.trim = function (s) {
    return this.replace(/^[\s　]*|[\s　]*$/g, "");
};
String.prototype.validate = function() {
	return this.replace(/[\/\\|:]/g, '-').replace(/\*/g, 'x').replace(/"/g, "''").replace(/[<>]/g, '_').replace(/\?/g, "");
};
Array.prototype.unique = function() {
	var a = [];
	var l = this.length;
	for (var i = 0; i < l; i++) {
		for (var j = i + 1; j < l; j++) {
			if (this[i] === this[j]) {
				j = ++i;
			}
			a.push(this[i]);
		}
		return a;
	}
};


function print(msg) {
    fb.trace("---> " + msg);
}
//--->

function caller() {
    var caller = /^function\s+([^(]+)/.exec(arguments.callee.caller.caller);
    if (caller) return caller[1];
    else return 0;
}

// only compatible with foo_wsh_panel_mod_plus >>> @ttsping
function GetFBWnd(){
    return utils.CreateWND(window.ID).GetAncestor(2);
}

function InputBox(caption, promp, defval, num_only) {
	return GetFBWnd().InputBox(caption, promp, defval, num_only);
}

function MsgBox(caption, promp, type) {
	return GetFBWnd().MsgBox(caption, promp, type);
}

//--->

function $(field, metadb) {
	return metadb ? fb.TitleFormat(field).EvalWithMetadb(metadb) : "";
}
//--->

function timeFormat(s) {

    var weeks = Math.floor(s / 604800),
        days = Math.floor(s % 604800 / 86400),
        hours = Math.floor((s % 86400) / 3600),
        minutes = Math.floor(((s % 86400) % 3600) / 60),
        seconds = Math.round((((s % 86400) % 3600) % 60)),
        weeks = weeks > 0 ? weeks + "wk " : "",
        days = days > 0 ? days + "d " : "",
        hours = hours > 0 ? hours + ":" : "",
        seconds = seconds < 10 ? "0" + seconds : seconds;
        ((caller() == "sliderEventHandler") ? minutes = minutes + ":" : minutes = (minutes < 10 ? "0" + minutes : minutes) + ":");
        
    return weeks + days + hours + minutes + seconds;

}

function formatTracksLength(t) {
	if (t > 0) {
		var days, hours, minutes, seconds;
		days = Math.floor(t / 86400);
		hours = Math.floor((t % 86400) / 3600);
		minutes = Math.floor(((t % 86400) % 3600) / 60);
		seconds = Math.round(((t % 86400) % 3600) % 60);
		days = days > 1 ? days + " days " : (days > 0 ? days + " day " : "");
		hours = hours > 1 ? hours + " hours " : (hours > 0 ? hours + " hour " : "");
		minutes = minutes > 1 ? minutes + " minutes " : (minutes > 0 ? minutes + " minute " : "");
		seconds = seconds > 1 ? seconds + " seconds " : (seconds > 0 ? seconds + " second " : "");
		return days + hours + minutes + seconds;
	} else {
		return null;
	}
}

//--->
(function () {

    var _ww,
        _resizeTimerStarted;

    isResizingDone = function (ww, wh) {

        if (!_resizeTimerStarted) {

            _resizeTimerStarted = true;
            var resizingIsDone = false;

            var resizeTimer = window.SetInterval(function () {

                if (_ww == window.Width) {

                    resizeDone();

                    resizingIsDone = true;

                    _resizeTimerStarted = false;

                    window.ClearInterval(resizeTimer);

                }

            }, 200);

        }
        _ww = ww;
    }
})();
//--->

function RGBA(r, g, b, a) {
    return ((a << 24) | (r << 16) | (g << 8) | (b));
}
//--->

function RGB(r, g, b) {
    return (0xff000000 | (r << 16) | (g << 8) | (b));
}
//--->

function StringFormat() {
    var h_align = 0,
        v_align = 0,
        trimming = 0,
        flags = 0;
    switch (arguments.length) {
        // fall-thru
    case 4:
        flags = arguments[3];
    case 3:
        trimming = arguments[2];
    case 2:
        v_align = arguments[1];
    case 1:
        h_align = arguments[0];
        break;
    default:
        return 0;
    }
    return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
}


function toRGB(d){ // convert back to RGB values
	var d = d - 0xff000000;
	var r = d >> 16;
	var g = d >> 8 & 0xFF;
	var b = d & 0xFF;
	return [r,g,b];
};

function blendColors(c1, c2, factor) {
	// When factor is 0, result is 100% color1, when factor is 1, result is 100% color2.
	var c1 = toRGB(c1);
	var c2 = toRGB(c2);
	var r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
	var g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
	var b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
	//fb.trace("R = " + r + " G = " + g + " B = " + b);
	return (0xff000000 | (r << 16) | (g << 8) | (b));
};

// http://www.easyrgb.com/index.php?X=MATH&H=07#text7
function RGB2XYZ(R, G, B) {
	var X, Y, Z;

	var gamma = function(x) {
		return (x > 0.04045) ? pow((x+0.055)/1.055, 2.4) : x / 12.92;
	};

	R = gamma(R/255) * 100;
	G = gamma(G/255) * 100;
	B = gamma(B/255) * 100;

	X = R * 0.4124 + G * 0.3576 + B * 0.1806;
	Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
	Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

	return [X, Y, Z];
};

// Lab -> CIE-L*ab
function XYZ2Lab(X, Y, Z) {
	var L, a, b;

	var f = function(t) {
		return (t > 0.008856) ? Math.pow(t, 1/3) : (7.787*t + 16/116);
	};

	// Observer = 2 degree, Illuminant = D65;
	X = f(X / 95.047);
	Y = f(Y / 100.000);
	Z = f(Z / 108.883);

	L = (116 * Y) - 16;
	a = 500 * (X - Y);
	b = 200 * (Y - Z);
	return [L, a, b];
}

function RGB2Lab(R, G, B) {
	var c;
	c = RGB2XYZ(R, G, B);
	c = XYZ2Lab(c[0], c[1], c[2]);
	return c;
}

function calcColorDistance(c1, c2) {
	var delta_E;
	// to R, G, B
	c1 = toRGB(c1);
	c2 = toRGB(c2);
	// convert color to CIE-L*ab
	c1 = RGB2Lab(c1[0], c1[1], c1[2]);
	c2 = RGB2Lab(c2[0], c2[1], c2[2]);
	// color difference, in CIE76
	delta_E = sqrt(pow((c1[0]-c2[0]), 2) + pow((c1[1]-c2[1]), 2) + pow((c1[2]-c2[2]), 2));
	return delta_E;
}

function sqrt(a) {
	return Math.sqrt(a);
}

function pow(a, b) {
	return Math.pow(a, b);
}

function DetermineTextColor(bk) {
	return (Luminance(bk) > 0.6 ? 0xff000000 : 0xffffffff);
}

function Luminance(color) {
	color = toRGB(color);
	return (0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2]) / 255.0;
}

//--->

function numericAscending(a, b) {

    return (a - b);

}
//--->

function numericDescending(a, b) {

    return (b - a);

}

//--->
VK_CONTROL = 0x11;
VK_SHIFT = 0x10;
VK_PAUSE = 0x13;
VK_ESCAPE = 0x1B;
VK_SPACE = 0x20;
VK_DELETE = 0x2E;
VK_PRIOR = 0x21; // PAGE UP key
VK_NEXT = 0x22; // PAGE DOWN key
VK_END = 0x23;
VK_HOME = 0x24
VK_LEFT = 0x25
VK_UP = 0x26;
VK_RIGHT = 0x27;
VK_DOWN = 0x28;
VK_RETURN = 0x0D //Enter
VK_LSHIFT = 0xA0; // Left SHIFT key
VK_RSHIFT = 0xA1; // Right SHIFT key
VK_LCONTROL = 0xA2 // Left CONTROL key
VK_RCONTROL = 0xA3 // Right CONTROL key
VK_LMENU = 0xA4 // Left MENU key (Left Alt)
VK_RMENU = 0xA5 // Right MENU key (Right Alt)

VK_KEY_0 = 0x30 //	0
VK_KEY_1 = 0x31 //	1
VK_KEY_2 = 0x32 //	2
VK_KEY_3 = 0x33 //	3
VK_KEY_4 = 0x34 //	4
VK_KEY_5 = 0x35 //	5
VK_KEY_6 = 0x36 //	6
VK_KEY_7 = 0x37 //	7
VK_KEY_8 = 0x38 //	8
VK_KEY_9 = 0x39 //	9
VK_KEY_A = 0x41 //	A
VK_KEY_B = 0x42 //	B
VK_KEY_C = 0x43 //	C
VK_KEY_D = 0x44 //	D
VK_KEY_E = 0x45 //	E
VK_KEY_F = 0x46 //	F
VK_KEY_G = 0x47 //	G
VK_KEY_H = 0x48 //	H
VK_KEY_I = 0x49 //	I
VK_KEY_J = 0x4A //	J
VK_KEY_K = 0x4B //	K
VK_KEY_L = 0x4C //	L
VK_KEY_M = 0x4D //	M
VK_KEY_N = 0x4E //	N
VK_KEY_O = 0x4F //	O
VK_KEY_P = 0x50 //	P
VK_KEY_Q = 0x51 //	Q
VK_KEY_R = 0x52 //	R
VK_KEY_S = 0x53 //	S
VK_KEY_T = 0x54 //	T
VK_KEY_U = 0x55 //	U
VK_KEY_V = 0x56 //	V
VK_KEY_W = 0x57 //	W
VK_KEY_X = 0x58 //	X
VK_KEY_Y = 0x59 //	Y
VK_KEY_Z = 0x5A //	Z

VK_F1	= 0x70 //	F1
VK_F10	= 0x79 //	F10
VK_F11	= 0x7A //	F11
VK_F12	= 0x7B //	F12
VK_F13	= 0x7C //	F13
VK_F14	= 0x7D //	F14
VK_F15	= 0x7E //	F15
VK_F16	= 0x7F //	F16
VK_F17	= 0x80 //	F17
VK_F18	= 0x81 //	F18
VK_F19	= 0x82 //	F19
VK_F2	= 0x71 //	F2
VK_F20	= 0x83 //	F20
VK_F21	= 0x84 //	F21
VK_F22	= 0x85 //	F22
VK_F23	= 0x86 //	F23
VK_F24	= 0x87 // F24
VK_F3	= 0x72 //	F3
VK_F4	= 0x73 //	F4
VK_F5	= 0x74 // F5
VK_F6	= 0x75 // F6
VK_F7	= 0x76 // F7
VK_F8	= 0x77 // F8
VK_F9	= 0x78 // F9
//--->
// Flags, used with GdiDrawText()
// For more information, see: http://msdn.microsoft.com/en-us/library/dd162498(VS.85).aspx
DT_TOP = 0x00000000;
DT_LEFT = 0x00000000;
DT_CENTER = 0x00000001;
DT_RIGHT = 0x00000002;
DT_VCENTER = 0x00000004;
DT_BOTTOM = 0x00000008;
DT_WORDBREAK = 0x00000010;
DT_SINGLELINE = 0x00000020;
DT_EXPANDTABS = 0x00000040;
DT_TABSTOP = 0x00000080;
DT_NOCLIP = 0x00000100;
DT_EXTERNALLEADING = 0x00000200;
DT_CALCRECT = 0x00000400; // [1.2.1] Handles well
DT_NOPREFIX = 0x00000800; // NOTE: Please use this flag, or a '&' character will become an underline '_'
DT_INTERNAL = 0x00001000;
DT_EDITCONTROL = 0x00002000;
DT_PATH_ELLIPSIS = 0x00004000;
DT_END_ELLIPSIS = 0x00008000;
DT_MODIFYSTRING = 0x00010000; // do not use
DT_RTLREADING = 0x00020000;
DT_WORD_ELLIPSIS = 0x00040000;
DT_NOFULLWIDTHCHARBREAK = 0x00080000;
DT_HIDEPREFIX = 0x00100000;
DT_PREFIXONLY = 0x00200000;
//--->
// Used in AppendMenuItem()
// For more information, see: http://msdn.microsoft.com/en-us/library/ms647616(VS.85).aspx
MF_SEPARATOR = 0x00000800;
MF_ENABLED = 0x00000000;
MF_GRAYED = 0x00000001;
MF_DISABLED = 0x00000002;
MF_UNCHECKED = 0x00000000;
MF_CHECKED = 0x00000008;
MF_STRING = 0x00000000;
MF_POPUP = 0x00000010;
MF_MENUBARBREAK = 0x00000020;
MF_MENUBREAK = 0x00000040;
//--->
// Used in window.SetCursor()
IDC_ARROW = 32512;
IDC_IBEAM = 32513;
IDC_WAIT = 32514;
IDC_CROSS = 32515;
IDC_UPARROW = 32516;
IDC_SIZE = 32640;
IDC_ICON = 32641;
IDC_SIZENWSE = 32642;
IDC_SIZENESW = 32643;
IDC_SIZEWE = 32644;
IDC_SIZENS = 32645;
IDC_SIZEALL = 32646;
IDC_NO = 32648;
IDC_APPSTARTING = 32650;
IDC_HAND = 32649;
IDC_HELP = 32651;
//--->
// Used in utils.Glob()
// For more information, see: http://msdn.microsoft.com/en-us/library/ee332330%28VS.85%29.aspx
FILE_ATTRIBUTE_READONLY = 0x00000001;
FILE_ATTRIBUTE_HIDDEN = 0x00000002;
FILE_ATTRIBUTE_SYSTEM = 0x00000004;
FILE_ATTRIBUTE_DIRECTORY = 0x00000010;
FILE_ATTRIBUTE_ARCHIVE = 0x00000020;
//FILE_ATTRIBUTE_DEVICE            = 0x00000040; // do not use
FILE_ATTRIBUTE_NORMAL = 0x00000080;
FILE_ATTRIBUTE_TEMPORARY = 0x00000100;
FILE_ATTRIBUTE_SPARSE_FILE = 0x00000200;
FILE_ATTRIBUTE_REPARSE_POINT = 0x00000400;
FILE_ATTRIBUTE_COMPRESSED = 0x00000800;
FILE_ATTRIBUTE_OFFLINE = 0x00001000;
FILE_ATTRIBUTE_NOT_CONTENT_INDEXED = 0x00002000;
FILE_ATTRIBUTE_ENCRYPTED = 0x00004000;
//FILE_ATTRIBUTE_VIRTUAL           = 0x00010000; // do not use
//--->
// With window.DlgCode, can be combined.
// If you don't know what they mean, igonre them.
DLGC_WANTARROWS = 0x0001; /* Control wants arrow keys         */
DLGC_WANTTAB = 0x0002; /* Control wants tab keys           */
DLGC_WANTALLKEYS = 0x0004; /* Control wants all keys           */
DLGC_WANTMESSAGE = 0x0004; /* Pass message to control          */
DLGC_HASSETSEL = 0x0008; /* Understands EM_SETSEL message    */
DLGC_DEFPUSHBUTTON = 0x0010; /* Default pushbutton               */
DLGC_UNDEFPUSHBUTTON = 0x0020; /* Non-default pushbutton           */
DLGC_RADIOBUTTON = 0x0040; /* Radio button                     */
DLGC_WANTCHARS = 0x0080; /* Want WM_CHAR messages            */
DLGC_STATIC = 0x0100; /* Static item: don't include       */
DLGC_BUTTON = 0x2000; /* Button item: can be checked      */
//--->
// Used in IFbTooltip.GetDelayTime() and IFbTooltip.SetDelayTime()
// For more information, see: http://msdn.microsoft.com/en-us/library/bb760404(VS.85).aspx
TTDT_AUTOMATIC = 0;
TTDT_RESHOW = 1;
TTDT_AUTOPOP = 2;
TTDT_INITIAL = 3;
//--->
// Used in gdi.Font(), can be combined
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534124(VS.85).aspx
FontStyle = {
    Regular: 0,
    Bold: 1,
    Italic: 2,
    BoldItalic: 3,
    Underline: 4,
    Strikeout: 8
};
StringTrimming = {
    None: 0,
    Character: 1,
    Word: 2,
    EllipsisCharacter: 3,
    EllipsisWord: 4,
    EllipsisPath: 5
};

// flags, can be combined of:
// http://msdn.microsoft.com/en-us/library/ms534181(VS.85).aspx
StringFormatFlags = {
    DirectionRightToLeft: 0x00000001,
    DirectionVertical: 0x00000002,
    NoFitBlackBox: 0x00000004,
    DisplayFormatControl: 0x00000020,
    NoFontFallback: 0x00000400,
    MeasureTrailingSpaces: 0x00000800,
    NoWrap: 0x00001000,
    LineLimit: 0x00002000,
    NoClip: 0x00004000
};

//--->
// Used in SetTextRenderingHint()
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534404(VS.85).aspx
TextRenderingHint = {
    SystemDefault: 0,
    SingleBitPerPixelGridFit: 1,
    SingleBitPerPixel: 2,
    AntiAliasGridFit: 3,
    AntiAlias: 4,
    ClearTypeGridFit: 5
};
//--->
// Used in SetSmoothingMode()
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534173(VS.85).aspx
SmoothingMode = {
    Invalid: -1,
    Default: 0,
    HighSpeed: 1,
    HighQuality: 2,
    None: 3,
    AntiAlias: 4
};
//--->
// Used in SetInterpolationMode()
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534141(VS.85).aspx
InterpolationMode = {
    Invalid: -1,
    Default: 0,
    LowQuality: 1,
    HighQuality: 2,
    Bilinear: 3,
    Bicubic: 4,
    NearestNeighbor: 5,
    HighQualityBilinear: 6,
    HighQualityBicubic: 7
};
//--->
var PlaybackOrder = {
	Default: 0,
	Repeat: 1,
	Repeat1: 2,
	Random: 3,
	ShuffleT: 4,
	ShuffleA: 5,
	ShuffleF: 6
};
//--->

Guifx = {

    Play: 1,
    Pause: 2,
    Stop: 3,
    Record: 4,
    Rewind: 5,
    FastForward: 6,
    Previous: 7,
    Next: 8,
    Replay: 9,
    Refresh: 0,
    Mute: "!",
    Mute2: "@",
    VolumeDown: "#",
    VolumeUp: "$",
    ThumbsDown: "%",
    ThumbsUp: "^",
    Shuffle: "\&",
    Repeat: "*",
    Repeat1: "(",
    Zoom: ")",
    ZoomOut: "_",
    ZoomIn: "+",
    Minus: "-",
    Plus: "=",
    Up: "W",
    Down: "S",
    Left: "A",
    Right: "D",
    Up2: "w",
    Down2: "s",
    Left2: "a",
    Right2: "d",
    Start: "{",
    End: "}",
    Top: "?",
    Bottom: "/",
    JumpBackward: "[",
    JumpForward: "]",
    SlowBackward: ":",
    SlowForward: "\"",
    Eject: "\'",
    Reject: ";",
    Up3: ".",
    Down3: ",",
    Left3: "<",
    Right: ">",
    Guifx: "g",
    ScreenUp: "|",
    ScreenDown: "\\",
    Power: "q",
    Checkmark: "z",
    Close: "x",
    Hourglass: "c",
    Heart: "v",
    Star: "b",
    Fire: "i",
    Medical: "o",
    Police: "p"

}
//--->

function link(site, metadb) {

    if (!metadb) return;

    var meta_info = metadb.GetFileInfo();
    var artist = meta_info.MetaValue(meta_info.MetaFind("artist"), 0).replace(/\s+/g, "+").replace(/\&/g, "%26");
    var album = meta_info.MetaValue(meta_info.MetaFind("album"), 0).replace(/\s+/g, "+");


    switch (site) {

    case "google":
        site = (artist ? "http://images.google.com/search?q=" + artist + "&ie=utf-8" : null);
        break;
    case "googleImages":
        site = (artist ? "http://images.google.com/images?hl=en&q=" + artist + "&ie=utf-8" : null);
        break;
    case "eCover":
        site = (artist || album ? "http:ecover.to/?Module=ExtendedSearch&SearchString=" + artist + "+" + album + "&ie=utf-8" : null);
        break;
    case "wikipedia":
        site = (artist ? "http://en.wikipedia.org/wiki/" + artist.replace(/\+/g, "_") : null);
        break;
    case "youTube":
        site = (artist ? "http://www.youtube.com/results?search_type=&search_query=" + artist + "&ie=utf-8" : null);
        break;
    case "lastFM":
        site = (artist ? "http://www.last.fm/music/" + artist.replace("/", "%252F") : null);
        break;
    case "discogs":
        site = (artist || album ? "http://www.discogs.com/search?q=" + artist + "+" + album + "&ie=utf-8" : null);
        break;
    default:
        site = undefined;
    }

    if (!site || safeMode) return;

    try {
        WshShell.run(site);
    } catch (e) {
        fb.trace(e)
    };

}

String.prototype.ucfirst = function() {
	return this.charAt(0).toUpperCase() + this.substr(1);
};

var ButtonStates = {normal: 0, hover: 1, down: 2};
var ButtonV2 = function(x, y, w, h) {
	this.isMouseOver = function(x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};
	this.repaint = function() {
		window.RepaintRect(this.x-5, this.y, this.w+10, this.h);
	};
	this.checkState = function(event, x, y) {
		this.isHover = this.isMouseOver(x, y);
		this.oldState = this.state;
		switch (event) {
			case 'down':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.down : ButtonStates.normal;
						break;
				}
				break;
			case 'up':
				this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
				break;
			case 'right':
				break;
			case 'move':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
						break;
				}
				break;
			case 'leave':
				this.state = this.isDown ? ButtonStates.down : ButtonStates.normal;
				break;
		}
		if (this.state !== this.oldState) this.repaint();
		return this.state;
	};
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.state = ButtonStates.normal;
	this.oldState;
	this.isDown;
	this.isHover;
}

var Button = function(img_normal, img_hover, img_down) {

	this.img = [img_normal, img_hover, img_down];
	this.w = img_normal.Width;
	this.h = img_normal.Height;
	this.state = ButtonStates.normal;
	this.oldState;
	this.isDown;

	this.update = function (img_normal, img_hover, img_down) {
		this.img = [img_normal, img_hover, img_down];
		this.w = img_normal.Width;
		this.h = img_hover.Height;
	}

	this.draw = function(gr, x, y, alpha) {
		this.x = x;
		this.y = y;
		this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha || 255);
	}

	this.repaint = function() {
		window.RepaintRect(this.x, this.y, this.w+1, this.h+1);
	}

	this.checkState = function(event, x, y) {
		this.isHover = (x > this.x && x < this.x + this.w - 1 && y > this.y &&  y < this.y + this.h - 1);
		this.oldState = this.state;
		switch (event) {
			case 'down':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.down : ButtonStates.normal;
						break;
				}
				break;
			case 'up':
				this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
				break;
			case 'right':
				break;
			case 'move':
				switch(this.state) {
					case ButtonStates.normal:
					case ButtonStates.hover:
						this.state = this.isHover ? ButtonStates.hover : ButtonStates.normal;
						break;
				}
				break;
			case 'leave':
				this.state = this.isDown ? ButtonStates.down : ButtonStates.normal;
				break;
		}
		if (this.state !== this.oldState) this.repaint();
		return this.state;
	}
}
