const padding = 50;
const circleRadius = 40;
let turn = "w";
let currentPiece = null;
let cooordinateCurPiece = null;
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
canvas.style.border = "2px solid black";
let state = [
  ['w1', 'w2', 'w3'],
  [null, null, null],
  ['b1', 'b2', 'b3'],
];
const drawLine = (x1, y1, x2, y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = 2;
  ctx.stroke();
};
const drawCircle = (i, j, type, player) => {
  const [x, y] = [padding + ((canvas.width - padding * 2) / 2) * j, padding + ((canvas.height - padding * 2) / 2) * i]
  if (type === "piece" || type === "p") {
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = player === "w" ? "white" : "black";
    ctx.fill();
    ctx.stroke();
  } else if (type === "ghost" || type === "g") {
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "gray";
    ctx.fillStyle = "rgba(211,211,211,0.6)";
    ctx.fill();
    ctx.stroke();
  }
};
const redraw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawOutline();
  drawBoard();
  drawPieces();
  document.getElementById("message").innerHTML = `Turn: ${turn=='w'?'white':'black'}`;
};
const drawOutline = () => {
  ctx.beginPath();
  ctx.rect(
    padding,
    padding,
    canvas.width - padding * 2,
    canvas.height - padding * 2,
  );
  ctx.lineWidth = 2;
  ctx.stroke();
}
const drawBoard = () => {
  drawLine(padding, padding, canvas.width - padding, canvas.height - padding);
  drawLine(padding, canvas.height - padding, canvas.width - padding, padding);
  drawLine(
    canvas.width / 2,
    padding,
    canvas.width / 2,
    canvas.height - padding,
  );
  drawLine(
    padding,
    canvas.height / 2,
    canvas.width - padding,
    canvas.height / 2,
  );
};
const drawPieces = () => {
  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state[i].length; j++) {
      if (state[i][j] !== null) {
        drawCircle(
          i, j,
          "p",
          state[i][j][0],
        );
      }
    }
  }
};
redraw();
const findCoordinate = (x, y, listenerRadius) => {
  let i, j = null;
  if (x >= padding - listenerRadius && x <= padding + listenerRadius) j = 0;
  else if (
    x >= padding + (canvas.width - padding * 2) / 2 - listenerRadius &&
    x <= padding + (canvas.width - padding * 2) / 2 + listenerRadius
  ) {
    j = 1;
  } else if (
    x >= padding + (canvas.width - padding * 2) - listenerRadius &&
    x <= padding + (canvas.width - padding * 2) + listenerRadius
  ) {
    j = 2;
  }
  if (y >= padding - listenerRadius && y <= padding + listenerRadius) i = 0;
  else if (
    y >= padding + (canvas.height - padding * 2) / 2 - listenerRadius &&
    y <= padding + (canvas.height - padding * 2) / 2 + listenerRadius
  ) {
    i = 1;
  } else if (
    y >= padding + (canvas.height - padding * 2) - listenerRadius &&
    y <= padding + (canvas.height - padding * 2) + listenerRadius
  ) {
    i = 2;
  }
  return [i, j]
}
const handleClick = (e) => {
  e.preventDefault();
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;
  const [i, j] = findCoordinate(x, y, circleRadius);
  if (i !== null && j !== null && state && state[i] && state[i][j] && state[i][j][0] !== turn) return;
  if (currentPiece !== null && state && state[i] && state[i][j] === null) {
    const spots = availableSpots(cooordinateCurPiece[0], cooordinateCurPiece[1]);
    const move = spots.find(([a, b]) => a === i && b === j);
    if (move && i !== null && j !== null) {
      state[cooordinateCurPiece[0]][cooordinateCurPiece[1]] = null;
      state[move[0]][move[1]] = currentPiece;
      currentPiece = null;
      cooordinateCurPiece = null;
      turn = turn === "w" ? "b" : "w";
      redraw();
      const w1 = findWinner(state);
      if (w1) {
        document.getElementById("message").innerHTML = `Winner: ${w1}`;
        return;
      }
      botPlayer(state, 'b');
      const w2 = findWinner(state);
      if (w2) {
        document.getElementById("message").innerHTML = `Winner: ${w2}`;
        return;
      }
    }
  } else if (i !== null && j !== null && state && state[i] && state[i][j] !== null) {
    currentPiece = state[i][j]
    cooordinateCurPiece = [i, j];
    redraw();
    drawGhost(i, j);
  }
};
const findWinner = (state) => {
  const white = []
  const black = []
  for (let i = 0; i < state.length; i++) {
    for (let j = 0; j < state[i].length; j++) {
      if (state[i][j] !== null) {
        if (state[i][j][0] === "w") white.push([i, j])
        else black.push([i, j])
      }
    }
  }
  if (white.some(e => e.toString() === '1,1')) {
    const r = [...white.filter(e=> e.toString()!='1,1')]
    if ((r[1][1] - r[0][1])/(r[1][0]-r[0][0]) === (r[1][1]-1)/(r[1][0]-1)) return "white";
  }
  if(black.some(e => e.toString() === '1,1')) {
    const r = [...black.filter(e=> e.toString()!='1,1')]
    if ((r[1][1] - r[0][1])/(r[1][0]-r[0][0]) === (r[1][1]-1)/(r[1][0]-1)) return "black";
  }
  return null
}
const drawGhost = (i, j) => availableSpots(i, j).map(([i, j]) => drawCircle(i, j, 'g', -1))
const availableSpots = (i, j) => {
  const spots = [];
  if (i > 0) {
    !state[i - 1][j] ? spots.push([i - 1, j]) : null;
  }
  if (i < 2) {
    !state[i + 1][j] ? spots.push([i + 1, j]) : null;
  }
  if (j > 0) {
    !state[i][j - 1] ? spots.push([i, j - 1]) : null;
  }
  if (j < 2) {
    !state[i][j + 1] ? spots.push([i, j + 1]) : null;
  }
  if (i === 1 && j === 1) {
    !state[0][0] ? spots.push([0, 0]) : null;
    !state[0][1] ? spots.push([0, 1]) : null;
    !state[0][2] ? spots.push([0, 2]) : null;
    !state[1][0] ? spots.push([1, 0]) : null;
    !state[1][2] ? spots.push([1, 2]) : null;
    !state[2][0] ? spots.push([2, 0]) : null;
    !state[2][1] ? spots.push([2, 1]) : null;
    !state[2][2] ? spots.push([2, 2]) : null;
  }
  !state[1][1] ? spots.push([1, 1]) : null;
  return [... new Set(spots)];
}
canvas.addEventListener("click", handleClick);