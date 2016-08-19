//===================================================
//=========Syair Source For ESLyric===========
//========See "Tools->Readme" for more info==========
//===================================================

var xmlhttp = new ActiveXObject("Msxml2.ServerXMLHTTP.6.0");
var doc = new ActiveXObject("htmlfile");

var debug = true; // 如果要调试的话，改为 true.


function get_my_name()
{
	return "Syair";
}

function get_version() 
{
	return "0.0.1";
}

function get_author() 
{
	return "Jeannela";
}

function start_search(info, callback)
{
	var url = "http://syair.info";

	//
	var title = process_keywords(info.Title);
	var artist = process_keywords(info.Artist);

	var search_url = url + "/search.php?artist=" + artist + "&title=" + title;

	try {
		xmlhttp.open("GET", search_url, false);
		xmlhttp.send();
	} catch (e) {
		fb.trace(get_my_name() + ": can't get access to site.");
		return;
	}

	var new_lyric = fb.CreateLyric();

	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		// parse HTML
		var reList = /<h3.*href=\"(.+?)\">(.+?).lrc<\/a><\/h3>/g;
		var list = [];
		var ret;

		for (var i = 0; ;i++) {
			ret = reList.exec(xmlhttp.responseText);
			if (ret == null) {
				break;
			}
			list.push(ret);
		}

		debug && fb.trace(list.length);
		debug && fb.trace(list[0]);

		var page_url = "";
		//var reLRC = /<a href=\"(.+?)\".*rel="nofollow"><span>Download/g;
		// 遍历每一个歌词项
		var len = Math.min(10, list.length);
		for (var i = 0; i < len; i++) {

            page_url = url + list[i][1];
            
			try {
				xmlhttp.open("GET", page_url, false);
				xmlhttp.send();
			} catch (e) {
				continue;
			}

			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var arr = list[i][2].split(" - ");
                var content = getElementsByTagName(xmlhttp.responseText, "span");
                for (var j in content) {            
                    if (content[j].innerText && content[j].innerText.indexOf("[id:") > -1) {
                        debug && fb.trace(content[j].innerText);
                        
                        new_lyric.Artist = arr[0];
                        new_lyric.Title = arr[1];
                        new_lyric.Source = get_my_name();
                        new_lyric.LyricText = content[j].innerText;
                        callback.AddLyric(new_lyric);
                                              
                        break;
                    }
                
                }
			}

		}

	}
    new_lyric.Dispose();


}

function getElementsByTagName(value, tag) {
	doc.open();
	var div = doc.createElement("div");
	div.innerHTML = value;
	var data = div.getElementsByTagName(tag);
	doc.close();
	return data;
};


function process_keywords(str) {
	var s = str;
	s = s.toLowerCase();
	s = s.replace(/\'|·|\$|\&|–/g, "");
	//truncate all symbols
	s = s.replace(/\(.*?\)|\[.*?]|{.*?}|（.*?/g, "");
	s = s.replace(/[-/:-@[-`{-~]+/g, "");
		s = s.replace(/[\u2014\u2018\u201c\u2026\u3001\u3002\u300a\u300b\u300e\u300f\u3010\u3011\u30fb\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e\uffe5]+/g, "");
		return s;
	}


