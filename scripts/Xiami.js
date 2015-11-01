Cover = function() {
	this.images = [];
	this.display_art_id = prop.default_art;
	
	this.repaint = function () {
		window.Repaint();
	};

	this.get_album_art = function(metadb) {
		if (metadb == null) {
			this.images[this.display_art_id] = null;
			this.repaint();
			return;
		};

		this.group = $(prop.group_format, metadb);

		if (this.group == this.group_saved) {
			if (this.images[this.display_art_id] == null) {
				this.repaint();
			};
