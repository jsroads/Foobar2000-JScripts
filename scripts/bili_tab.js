// update 2015/05/09 
// created by Jeanne

function TraceLog() {
	this.enable = false;
	this.startTime = -1;
	this.start = function(msg) {
		if (!this.enable) return;
		this.msg = msg;
		this.startTime = new Date().getTime();
		fb.trace('[' + msg + '] has started');
	};
	this.stop = function() {
		if (!this.enable) return;
		var curr = new Date().getTime();
		var end_time = curr - this.startTime;
		fb.trace('[' + this.msg + '] has finished at ' + end_time + ' ms');
	};
};

var Trace = new TraceLog();


function UserInterface() {
	this.type = window.InstanceType;
	this.colors = {};
	this.fonts = {};
	this.get_colors = function() {
	};
	this.get_colors();

	this.get_fonts = function() {
	};
	this.get_fonts();
};

function Panel(x, y) {
	this.x = x;
	this.y = y;
	this.repaint = function() {
		window.Repaint();
	};

};

function PlaylistsObject() {
};


