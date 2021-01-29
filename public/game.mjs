import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { dimension } from './dimension.mjs';
const socket = io();

let tick;
let playersList = [];
let collectibleObj;
let playerObj;

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let playerIm = new Image();
let othersIm = new Image();
let collectibleIm = new Image();

const init = () => {

  // load images
  playerIm.src = 'public/img/player.png';
  othersIm.src = 'public/img/other.png'
  collectibleIm.src = 'public/img/collectible.png';

  // create player
  socket.on('init', ({id, players, collectible}) => {
    collectibleObj = new Collectible(collectible);
    playerObj = players.filter(x => x.id == id)[0];
    playerObj = new Player(playerObj);
    
    playersList = players

    document.onkeydown = e => {
      let  dir = null
      switch(e.keyCode) {
        case 87:
        case 38:
          dir = 'up';
          break;
        case 83:
        case 40:
          dir = 'down';
          break;
        case 65:
        case 37:
          dir = 'left';
          break;
        case 68:
        case 39:
          dir = 'right';
          break;
      }
      if (dir) {
        playerObj.movePlayer(dir, 10);
        socket.emit('update', playerObj);
      }
    }

    // update
    socket.on('update', ({players:players, collectible:collectible, player:player}) => {
      playersList = players;
      collectibleObj = new Collectible(collectible);
      if(player) {
        if (player.id == playerObj.id){
          playerObj = new Player(player);
        }
      }

    });
  });

  window.requestAnimationFrame(update);
}

const update = () => {

  context.clearRect(0, 0, canvas.width, canvas.height);

  // background color
  context.fillStyle = '#70a2d2';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // border
  context.strokeStyle = 'black';
  context.strokeRect(dimension.minX, dimension.minY, dimension.arenaSizeX, dimension.arenaSizeY);

  // text
  context.fillStyle = 'black'
  context.font = "20px Verdana";
  context.textAlign = 'center';
  context.fillText('Controls', 150, 20);
  context.textAlign = 'center';
  context.fillText('Arrow keys (or WASD)', 150, 45);

  // title
  context.font = "40px Verdana";
  context.fillText('Get Da Mushroom!', 520, 40);

  if (playerObj) {
    playerObj.draw(context, playerIm);
    context.font = "26px Verdana";
    context.fillText(playerObj.calculateRank(playersList), 900, 40);
    playersList.forEach((player)=> {
      if (player.id !== playerObj.id) {
        let p = new Player(player);
        p.draw(context, othersIm);
      }
    });
    if (collectibleObj){
      collectibleObj.draw(context, collectibleIm);
    }
  }
  tick = requestAnimationFrame(update);
}
init();