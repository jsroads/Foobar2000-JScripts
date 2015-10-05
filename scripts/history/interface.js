Button = function(imageNormal, imageHover, imageDown) {

	this.img = [imageNormal, imageHover, imageDown];
	this.w = this.img[0].Width;
	this.h = this.img[0].Height;
	this.state = 0; //0: normal, 1: hover, 2: down;

	this.update = function (imageNormal, imageHover, imageDown) {
		this.img = [imageNormal, imageHover, imageDown];
		this.w = this.img[0].Width;
		this.h = this.img[0].Height;
	};

	this.repaint = function() {
		window.RepaintRect(this.x-1, this.y-1, this.w+2, this.h+2);
	};

	this.draw = function(gr, x, y) {
		this.x = x;
		this.y = y;
		this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 255);
	};

	this.check = function(event, x, y) {
		this._ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
		this._old = this.state;
		switch (event) {
			case "down":
				switch (this.state) {
					case 0:
					case 1:
						this.state = this._ishover ? 2 : 0;
						break;
				};
				break;
			case "up":
				this.state = this._ishover ? 1 : 0;
				break;
			case "move":
				switch (this.state) {
					case 0:
					case 1:
						this.state = this._ishover ? 1 : 0;
						break;
				};
				break;
			case "leave":
				this.state = this._isdown ? 2 : 0;
				break;
		};
		if (this.state !== this._old) this.repaint();
		return this.state;
	};
}




PlaylistManager = function() {
	var _Item = function(id) {
		this.id = id;
		this.type = fb.IsAutoPlaylist(this.id) | 0;
		this.name = fb.GetPlaylistName(this.id);
		this.count = fb.PlaylistItemCount(this.id);
		this.state = 0;
	};

	var _rowH = 35;
	this.startId = 0;

	this._init = function() {
		this.items = [];
		for (var j = 0; j < fb.PlaylistCount; j++) {
			this.items[j] = new _Item(j);
		};
		this.repaint();
	};

	this.repaint = function() {
		window.Repaint();
	};

	this.setSize = function(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.visibleItemsCount = Math.floor(this.h / _rowH) | 0;
		
		if (this.startId + this.visibleItemsCount > fb.PlaylistCount) {
			this.startId = fb.PlaylistCount - this.visibleItemsCount;
		}
		if (this.startId < 0) this.startId = 0;
	};

	this.draw = function(gr) {
		gr.FillSolidRect(this.x, this.y, this.w, this.h, 0xffffffff);
	};

	this.check = function(event, x, y) {
	};
}
