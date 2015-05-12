// update 2015/05/11
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

function Panel(x, y) {
	this.x = x;
	this.y = y;
	this.repaint = function() {
		window.Repaint();
	};
}

var p = new Panel(0, 0);






function on_size() {
	window.MaxHeight = window.MinHeight = 45;
	if (!window.Width || !window.Height) return;
	p.w = window.Width;
	p.h = window.Height;
}
