var smartgame = require('smartgame');
var smartgamer = require('smartgamer');
var Weiqi = require('weiqi').default;

const stone = {
	black: 'x',
	white: 'o'
};

function alphaToNum(alpha) {
	if (!alpha) {
		return;
	}

	const alphabet = 'abcdefghijklmnopqrstuvwxyz';
	let x = alpha.substring(0, 1);
	let y = alpha.substring(1);

	x = alphabet.indexOf(x.toLowerCase());
	y = alphabet.indexOf(y.toLowerCase());

	console.log('alpha', alpha, 'x, y', x, y);
	return [(size - 1) - x, (size - 1) - y];
}

function serializeBoardState(gameState) {
	const size = gameState.get('board').get('size');
	const boardArray = Array.apply(null, Array(size)).map(() => Array(size).fill('.'));
	const boardState = gameState.get('board').get('stones');
	boardState.forEach((stoneColor, position) => {
		const character = stoneColor === 'black' ? stone.black : stone.white;
		boardArray[position.get('i')][position.get('j')] = character;
	});
	//console.log('boardArray', boardArray);
	return boardArray;
}

function getBoard() {
	//console.log('Weiqi', Weiqi);
	//console.log('typeof Weiqi.createGame', typeof Weiqi.createGame);
	var game = Weiqi.createGame(this.size);
	//console.log('game', game);
	//console.log('this.gamer.totalMoves()', this.gamer.totalMoves());
	let i = 1;
	let end = 5;
	//let end = this.gamer.totalMoves() / 2;

	this.gamer.goTo(1);

	while (i < end) {
		//console.log('this.gamer.node', this.gamer.node());
		const node = this.gamer.node();
		let move = node.W || node.B;
		const player = node.W ? 'white' : 'black';
		const coords = alphaToNum(move);

		//console.log('tryna play', player, coords);
		game = Weiqi.play(game, player, coords);
		//console.log('game', game);
		//console.log('typeof game', typeof game);
		//console.log('Object.keys(game)', Object.keys(game));
		//console.log('game.toObject()', game.toObject().board.stones);
		//console.log('game.get("board")', game.get('board').get('stones'));
		//this.board = game.get('board').get('stones').toObject();
		this.board = serializeBoardState(game);
		//console.log('this.board', this.board);

		this.gamer.next();
		i += 1;
	}

	//console.log('Weiqi', Weiqi);

	let boardStr = '';
	this.board.forEach(row => {
		row.forEach((intersection, i) => {
			boardStr += ' ' + intersection + ' ';
			if (i === row.length - 1) {
				boardStr += '\n';
			}
		});
	});
	console.log('boardStr', boardStr);
}

function drawGrid() {
	var size = this.size;
	//console.log(`drawing grid of ${size} by ${size}`);
	var canvas = this.canvas;
	var ctx = this.ctx;
	var margin = this.margin = (canvas.width / size) / 2;
	var step = this.step = (canvas.width - (margin * 2)) / size;
	var inset = this.inset = step / 2;
	var gridColor = 'hsl(50, 50%, 30%)';

	//console.log('margin, step, inset', margin, step, inset);

	ctx.lineWidth = 1;
	ctx.lineCap = 'square';
	ctx.strokeStyle = gridColor;
	ctx.fillStyle = gridColor;

	for (let i = 0; i < size; i += 1) {
		ctx.beginPath();

		// Draw vertical lines
		ctx.moveTo(step * i + inset + margin, margin + inset);
		ctx.lineTo(step * i + inset + margin, canvas.height - (margin + inset));
		ctx.stroke();

		// Draw horizontal lines
		ctx.moveTo(margin + inset, step * i + inset + margin);
		ctx.lineTo(canvas.width - (margin + inset), step * i + inset + margin);
		ctx.stroke();
	}

	const starPoints = {
		9: [
			[2, 2],
			[5, 5],
			[7, 7]
		],
		19: [
			[3, 3],
			[9, 3],
			[15, 3],
			[3, 9],
			[9, 9],
			[15, 9],
			[3, 15],
			[9, 15],
			[15, 15]
		]
	};

	const starRadius = 5;

	starPoints[this.size].forEach(coordinates => {
		let x = coordinates[0],
			y = coordinates [1];

		x = x * step + inset + margin;
		y = y * step + inset + margin;

		ctx.fillStyle = gridColor;
		ctx.moveTo(x, y);
		ctx.arc(x, y, starRadius, 0, 2 * Math.PI, false);
		ctx.fill();
	});
}

function drawStarpoints() {
}

function drawStone(x, y, color) {
	x = x * this.step + this.inset + this.margin;
	y = y * this.step + this.inset + this.margin;

	const stoneSize = this.step / 2;
	const ctx = this.ctx;

	ctx.beginPath();
	ctx.fillStyle = (color === 'black') ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 90%)';
	//console.log('ctx.fillStyle', ctx.fillStyle);
	ctx.moveTo(x, y);
	ctx.arc(x, y, stoneSize, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
}

function markLastStone() {
	const node = this.gamer.node();
	let move = node.W || node.B;
	const player = node.W ? 'white' : 'black';
	const coords = alphaToNum(move);

	x = coords[0] * this.step + this.inset + this.margin;
	y = coords[1] * this.step + this.inset + this.margin;

	//console.log('move', move);
	//console.log('mark the last stone at', x, y);

	const markSize = this.step / 3;
	const ctx = this.ctx;

	ctx.beginPath();
	ctx.strokeStyle = (player === 'white') ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 90%)';
	//console.log('ctx.fillStyle', ctx.fillStyle);
	ctx.moveTo(x, y);
	ctx.arc(x, y, markSize, 0, 2 * Math.PI, false);
	ctx.stroke();
	ctx.closePath();
}

function drawStones() {
	this.board.forEach((row, y) => {
		//console.log('row', row);
		row.forEach((intersection, x) => {
			//console.log('intersection', intersection);
			//console.log('x, y', x, y);
			let color;

			if (intersection === stone.black) {
				color = 'black';
			}

			if (intersection === stone.white) {
				color = 'white';
			}

			if (color) {
				//console.log('draw a', color, 'stone');
				drawStone(x, y, color);
			}
		});
	});
}

function draw(kifu) {
	//console.log('kifu', kifu);

	var game = smartgame.parse(kifu.game.sgf);
	var gamer = smartgamer(game);

	//console.log('gamer', gamer);
	//console.log('gamer.getGameInfo()', gamer.getGameInfo());

	var Canvas = require('canvas'),
		Image = Canvas.Image,
		canvas = new Canvas(1200, 1200),
		ctx = canvas.getContext('2d');

	this.canvas = canvas;
	this.ctx = ctx;
	this.gamer = gamer;
	this.size = parseInt(this.gamer.getGameInfo().SZ, 10);

	getBoard();

	ctx.fillStyle = '#E4BB5C';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawGrid();
	drawStones();
	markLastStone();

	return canvas;
}

module.exports = draw;
