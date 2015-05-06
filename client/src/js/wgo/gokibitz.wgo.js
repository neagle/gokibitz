/*jshint camelcase:false*/
/*global WGo:true*/

// GoKibitz's custom flat stones
WGo.Board.drawHandlers.FLAT = {
	stone: {
		draw: function (args, board) {
			var xr = board.getX(args.x),
				yr = board.getY(args.y),
				sr = board.stoneRadius - 0.5;

			if (args.c === WGo.W) {
				this.fillStyle = 'hsl(0, 0%, 95%)';
			} else {
				this.fillStyle = 'hsl(0, 0%, 20%)';
			}

			this.beginPath();
			this.arc(xr, yr, Math.max(0, sr), 0, 2 * Math.PI, true);
			this.fill();
		}
	}
};
