// vim: set ft=javascript fileencoding=utf-8 bomb et:


var Language = function () {

    this.code = "";
    this.pack = {};
    this.cacheFolder = fb.ProfilePath + "cache\\";
    this.langFolder = this.cacheFolder + "lang\\";
    this.file = "";
    if (!fso) var fso = new ActiveXObject("Scripting.FileSystemObject");

    this.Write = function (lang) {
        try {
            var file = fso.OpenTextFile(fb.ProfilePath+"cache\\lang\\" + lang + ".JSON", 2, true, 0);
            file.WriteLine(JSON.stringify([this.pack]));
            file.Close();
        } catch (e) {};
        this.Read("cn");
    }

    this.Read = function(lan, force) {
        lan = lan.toUpperCase();
        if (!fso.FileExists(fb.ProfilePath + "cache\\lang\\" + lan + ".JSON")) {
            if (!fso.FolderExists(fb.ProfilePath + "cache"))
                fso.CreateFolder(fb.ProfilePath + "cache");
            if (!fso.FolderExists(fb.ProfilePath + "cache\\lang"))
                fso.CreateFolder(fb.ProfilePath + "cache\\lang");
            var file = fso.CreateTextFile(fb.ProfilePath + "cache\\lang\\" + lan + ".JSON", true, 65001);
            file.WriteLine(JSON.stringify([{}]));
            file.Close();
            fb.trace("Create file: " + fb.ProfilePath + "cache\\lang\\" + lan + ".JSON");
        }
        var data = utils.ReadTextFile(fb.ProfilePath + "cache\\lang\\" + lan + ".JSON", 65001);
        data = JSON.parse(data);
        this.pack = data[0];
        if (typeof this.pack != "object") {
            this.pack = {};
        }
    }

    this.Add = function (obj) {
        for (var i in obj) {
            if (!(i in this.pack))
                this.pack[i] = obj[i];
        }
    }

    this.Map = function (name) {
        return (!this.pack[name] ? name : this.pack[name]);
    }

}

function get_lang() {
    var la = window.GetProperty("Lang(cn: 中文, en: English)", "auto").toLowerCase();
    if (la != "cn" && lang != "en")
        la = (fb.TitleFormat("$meta()").Eval(true) == "[未知函数]") ? "cn" : "en";
    lang.Read(la);
    
    // debug
    var count = 0;
    for (var i in lang.pack) {
        count++;
    }
    fb.trace("Dic count: " + count);
}


var lang = new Language();
get_lang();
