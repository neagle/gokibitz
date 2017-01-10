const smartgame = require('smartgame');
const smartgamer = require('smartgamer');
const Weiqi = require('weiqi').default;

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

	return [x, y];
}

function serializeBoardState(gameState) {
	const size = gameState.get('board').get('size');
	const boardArray = Array.apply(null, Array(size)).map(() => Array(size).fill('.'));
	const boardState = gameState.get('board').get('stones');
	boardState.forEach((stoneColor, position) => {
		const character = stoneColor === 'black' ? stone.black : stone.white;
		boardArray[position.get('j')][position.get('i')] = character;
	});
	return boardArray;
}

function getBoard(path) {
	let game = Weiqi.createGame(this.size);

	path = path || Math.floor(this.gamer.totalMoves() / 2);
	path = this.gamer.pathTransform(String(path), 'object');

	let n = this.gamer.node();

	let error;
	for (let i = 0; i < path.m && n && !error; i += 1) {
		let variation = path[i + 1] || 0;

		n = this.gamer.next(variation);

		const node = this.gamer.node();
		let move = node.W || node.B;

		const player = node.W ? 'white' : 'black';
		const coords = alphaToNum(move);

		try {
			game = Weiqi.play(game, player, coords);
		} catch (e) {
			error = e;
		}
	}

	this.board = serializeBoardState(game);
}

function drawGrid() {
	const size = this.size;
	const canvas = this.canvas;
	const ctx = this.ctx;
	const margin = this.margin = (canvas.width / size) / 2;
	const step = this.step = (canvas.width - (margin * 2)) / size;
	const inset = this.inset = step / 2;
	const gridColor = 'hsl(50, 50%, 30%)';

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
		13: [
			[3, 3],
			[9, 3],
			[3, 9],
			[9, 9]
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

	const starRadius = step / 10;

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

function drawStone(x, y, color) {
	x = x * this.step + this.inset + this.margin;
	y = y * this.step + this.inset + this.margin;

	const stoneSize = this.step / 2;
	const ctx = this.ctx;

	ctx.beginPath();
	ctx.fillStyle = (color === 'black') ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 90%)';
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

	const x = coords[0] * this.step + this.inset + this.margin;
	const y = coords[1] * this.step + this.inset + this.margin;

	const markSize = this.step / 3.5;
	const ctx = this.ctx;

	ctx.beginPath();
	ctx.strokeStyle = (player === 'white') ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 90%)';
	ctx.lineWidth = 5;
	ctx.arc(x, y, markSize, 0, 2 * Math.PI, false);
	ctx.stroke();
	ctx.closePath();
}

function drawStones() {
	this.board.forEach((row, y) => {
		row.forEach((intersection, x) => {
			let color;

			if (intersection === stone.black) {
				color = 'black';
			}

			if (intersection === stone.white) {
				color = 'white';
			}

			if (color) {
				drawStone(x, y, color);
			}
		});
	});
}

function draw(kifu, path) {
	const game = smartgame.parse(kifu.game.sgf);
	const gamer = smartgamer(game);

	let Canvas = require('canvas'),
		canvas = new Canvas(1200, 1200),
		ctx = canvas.getContext('2d');

	this.canvas = canvas;
	this.ctx = ctx;
	this.gamer = gamer;
	this.size = parseInt(this.gamer.getGameInfo().SZ, 10);

	getBoard(path);

	ctx.fillStyle = '#E4BB5C';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	drawGrid();
	drawStones();
	markLastStone();

	return canvas;
}

module.exports = draw;
