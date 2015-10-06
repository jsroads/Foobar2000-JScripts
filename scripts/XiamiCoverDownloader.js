XiamiCover = new function() {
	this.metadb = null;
	this.results = [];

	this.query = function() {
		var url, htmlText, xmlText;
		this.metadb = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
		var title = $("[%title%]", this.metadb);
		var album = $("[%album%]", this.metadb);
		var artist = $("[%artist%]", this.metadb);

		if (artist == "" && album == "") { return };

		artist = artist.replace(/\s+/g, "+");
		album = album.replace(/\s+/g, "+");
		url = "http://www.xiami.com/search/song/?key=" + artist + "+" + album;
		console(url);

		htmlText = xiamiHttpRequest.Run(url);

		var albumReg;
		var albumId, albumElem;
		var count = 0;
		var total;
		this.results = [];

		if (htmlText) {
			albumReg = new RegExp("<a.*href=\".*?/album/(\\d+).*?>", "g");
			albumId = [];

			for (var i = 0;; i++) {
				albumElem = albumReg.exec(htmlText);
				if (albumElem == null) { break };
				albumId[i] = albumElem[1];
			}
			albumId.unique();

			total = Math.min(15, albumId.length);
			var trackArr, track;
			for (var i = 0; i < total; i++) {
				url = "http://www.xiami.com/song/playlist/id/" + albumId[i] + "/type/1";
				xmlText = xiamiHttpRequest.Run(url);
				if (xmlText) {
					xmlDoc.loadXML(xmlText);
					trackArr = xmlDoc.getElementsByTagName("trackList");
					if (trackArr) {
						track = trackArr[0].getElementsByTagName("track");
						for (var k = 0; k < track.length; k++) {
							this.results[count] = {
								artist: track[k].getElementsByTagName("artist")[0].childNodes[0].nodeValue,
								album: track[k].getElementsByTagName("album_name")[0].childNodes[0].nodeValue,
								albumPic: track[k].getElementsByTagName("album_pic")[0].childNodes[0].nodeValue
							};
						};
						count++;
					}
				};
			};
			console("Download Successful: " +  this.results.length + " results have been found.");
			return this.results;
				
		};
		this.results = [];
		return this.results;
	};

	this.exec = function(c, w) {
		try { WshShell.Run(c, 0, w); } catch(e) {};
	};

	this.saveToFolder = function(id) {
		if (this.results.length == 0) { return false };
		var albumArtist = $("[%album artist%]", this.metadb);
		var album = $("[%album%]", this.metadb);
		var url = this.results[id].albumPic;
		var ext = /.[^.]+$/.exec(url.substring(url.lastIndexOf("/") + 1));
		var file;

		this.checkDownloadVbs();
		this.checkCoverFolder();

		file = "\"" + this.coverFolder + albumArtist.validate() + "-" + album.validate() + ext + "\"";
		try {
			this.exec(this.vbs + " " + url + " " + " -O " + file, false);
			console(this.vbs + " " + url + " " + file);
			console("Save to " + file + " successfully!");
		} catch(e) {
			console("Failed to save " + file);
		}
		return true;
	};

	this.checkDownloadVbs = function(force) {
		var path = window.GetProperty("system.Vbs Path");
		if (!path) {
			path = FileDialog(0, "Open", "All Files|*.*", "download.vbs");
			window.SetProperty("system.Vbs Path", path);
		}
		this.vbs = "\'" + path + "\'";
		this.vbs = "wget";
	};

	this.checkCoverFolder = function() {
		var folder = window.GetProperty("system.Cover folder path", "");
		if (!folder) {
			folder = FileDialog(2, "Select cover folder", "*", "");
			window.SetProperty("system.Cover folder path", folder);
		}
		this.coverFolder = folder + "\\";
	};

}();

function on_query() {
	queryTimer = window.SetTimeOut(function() {
		XiamiCover.query();
	}, 100);
};
	

var WshShell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");
var xiamiHttpRequest = utils.CreateHttpRequest("GET");
var xmlDoc = new ActiveXObject("MSXML.DOMDocument");
var ww, wh;


function on_mouse_lbtn_dblclk(x, y) {
	on_query();
};

function on_mouse_rbtn_up(x, y, mask) {
	if (mask == 0x10) {
		return false;
	} else {
		var _menu = window.CreatePopupMenu();
		var id;
		var idOffset = 10;
		var results = XiamiCover.results;
		var total = results.length;

		_menu.AppendMenuItem(MF_STRING, 1, "Download");
		if (results.length > 0) {
			_menu.AppendMenuSeparator();

			for (var i = 0; i < total; i++) {
				_menu.AppendMenuItem(MF_STRING, i + idOffset, results[i].artist + 
						" >> " + results[i].album);
			}
		}
		id = _menu.TrackPopupMenu(x, y);
		switch(id) {
			case 1:
				on_query();
				break;
		};
		if (results) {
			for (var i = 0; i < total; i++) {
				if (id == idOffset + i) {
					XiamiCover.saveToFolder(i);
				}
			}
		};

		_menu.Dispose();
		return true;
	}
}


function isFoler(str) {
	return fso.FolderExists(str);
}

function isFile(str) {
	return fso.FileExists(str);
}

function createFolder(str) {
	if (!isFoler(str)) {
		fso.CreateFolder(str);
	}
}

function processKeywords(str) {
	var s = str;
	s = s.toLowerCase();
	s = s.replace(/\'|·|\$|\&|–/g, "");
	//truncate all symbols
	s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, "");
	s = s.replace(/[-/:-@[-`{-~]+/g, "");
	s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, "");
	return s;
}
