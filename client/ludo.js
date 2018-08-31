

var game, socket = new io(), gameId, playerId;
/*window.onload = function() {
    socket = new io();
}*/

var submitId = function() {
    gameId = document.getElementById("gid").value;
    socket.emit("joinGame",gameId);
}

socket.on("startGame",function(gameId,playerId) {
    createGame(gameId,playerId);
});

var createGame = function(gameId,playerId) {
    game = new Game(socket,gameId,playerId);
    document.getElementById("input-container").style.display = "none";
    document.getElementById("game-div").style.display = "block";
}

/*
 *      GAME
 */

function Game(socket,gameId,playerId) {
    this.socket = socket;
    this.gameId = gameId;
    this.playerId = playerId;
    this.appendContainers();
    this.gComplete = false;
    this.players = [];
    for(let i=0;i<4;i++) {
        this.players[i] = new Player(this,i);
    }
    this.safe = ["dc1","dc14","dc27","dc40","dc9","dc22","dc35","dc48"];
    this.currPlayer = 0;
    this.dice = new Dice(this);
    this.changePlayer(-1); 
    this.socket.on("moveR",function(di,tid) {
        game.dice.num = di;
        game.mover(
            game.players[game.currPlayer].tokens[parseInt(tid)]
        );
    });
    this.socket.on("noMoveR",function() {
        game.changePlayer(1);
    });
}

Game.prototype.appendContainers = function() {
    var p = [];
    for (let i = 1; i <= 52; i++) {
        p.push("c"+i);
    }
    for(let i=1;i<=4;i++)
        for(let j=1;j<7;j++)
            p.push("p"+i+j);
    for (id in p) {
        var extDiv = document.createElement("div");
        extDiv.className = "container-token";
        extDiv.id = "d"+p[id];
        var c = document.getElementById(p[id]);
        if(!c) 
        console.log(p[id]);
        c.appendChild(extDiv);
    }
}

Game.prototype.changePlayer = function(pl) {
    var player;
    if(pl == -1) {        
        player = 0; 
    }     
    else if(pl == 0) {
        player = this.currPlayer;
    }   
    else {
        this.players[this.currPlayer].highlight(false);
        player = (this.currPlayer+1)%4;
    }
    this.currPlayer = player;
    if(this.players[this.currPlayer].pComplete) {
        game.changePlayer(1);
        return;
    }
    this.players[this.currPlayer].highlight(true);
    document.getElementById("pname").innerHTML= player + 1;
    this.dice.setReady(true);
}

Game.prototype.clicked = function(id) {
    if(this.dice.ready||this.currPlayer!=this.playerId)
        return;
    var pid = parseInt(id[1]);
    if(this.currPlayer!=pid)
        return;
    var tid = parseInt(id[3]); 
    var rPlayer = this.players[pid];
    var rToken = rPlayer.tokens[tid];    
    if(rToken.tComplete)   
        return;       
    if(!rToken.movable) 
        return ;
    //this.mover(rToken);
    this.socket.emit("move",this.gameId,this.dice.num,tid);
}

Game.prototype.mover = function(rToken) {
    var cid = rToken.move();

    if(!this.safe.includes(cid)) {
        var rCell = document.getElementById(cid);
        if(rCell.childNodes.length>=2) {
            var t0 = rCell.childNodes[0];
            if(t0.id[1] != this.currPlayer) {
                this.players[parseInt(t0.id[1])].tokens[parseInt(t0.id[3])].killToken();
                this.changePlayer(0);
                return ;
            }
        }
    }
    if(rToken.tComplete) {
        if(rToken.player.pComplete) {
            if(rToken.player.game.gComplete) {
                return;
            }
            this.changePlayer(1);
            return;
        }
        this.changePlayer(0);
        return;
    }
    if(this.dice.num==6) {
        this.changePlayer(0);
        return ;
    }
    this.changePlayer(1);
}

Game.prototype.diceRolled = function(){
    var count = 0,x;
    var rToken;
    for(let i=0;i<4;i++) {
        x= this.players[this.currPlayer].tokens[i].isMovable(this.dice.num);
        if(x) {
            count++;
            rToken = this.players[this.currPlayer].tokens[i];
        }
    }
    if(count<=0) {
        //this.changePlayer(1);
        this.socket.emit("noMove",this.gameId);
    }
    else if(count == 1) {
        //this.mover(rToken);
        this.socket.emit("move",this.gameId,this.dice.num,rToken.tid);
    }
}

Game.prototype.checkComplete = function() {
    var completeCount = 0;
    for (var i = 0; i < 4; i++) {
        if(this.players[i].pComplete) {
            completeCount++;
        }
    }
    if(completeCount == 3) {
        this.gComplete = true;
        this.gameComplete();
    }
}

Game.prototype.gameComplete = function() {
    this.dice.stready = false;
    alert("Game complete");
}

/*
 *      PLAYER
 */

function Player(game,id) {
    this.game = game;
    this.pComplete = false;
    this.id = id;
    this.tokens = [];
    for(let i=0;i<4;i++) {
        this.tokens[i] = new Token(this,this.id,i,this.createTokenPath(this.id));
    }
}

Player.prototype.removeTokensHighlight = function() {
    for (var i = 0; i < this.tokens.length; i++) {
        this.tokens[i].highlight(false);
    };
}

Player.prototype.highlight = function(bool) {
    var tb = document.getElementById("ht"+(this.id+1));
    if(bool) {
        tb.classList.add("hl");
    }else{
        tb.classList.remove("hl");
    }  
}

Player.prototype.createTokenPath = function(id){
    var p = [];
    var cellId;
    var skipOne = false;
    for(let i=1,index=0;i<=51;i++,index++){
        cellId = (i+ id*13)%53;   
        if(cellId==0) skipOne = true;
        if(skipOne) cellId++;
        p[index] = "dc"+cellId;
    }
    for(let index=51;index<=57;index++){
        p[index] = ("dp"+(id+1))+(index-50);
    }
    return p;
}

Player.prototype.checkComplete = function() {
    var completeCount = 0;
    for (var i = 0; i < 4; i++) {
        if(this.tokens[i].tComplete) {
            completeCount++;
        }
    }
    if(completeCount == 4) {
        this.pComplete = true;
        this.game.checkComplete();
    }
}

/*
 *      DICE
 */

function Dice(game){
    this.game = game;
    this.setReady(true);
    if(this.currPlayer == this.playerId)
        this.num = "roll";
    else
        this.num = "wait";
    document.getElementById("dice").innerHTML = this.num;    
}

Dice.prototype.roll = function() {
    if(this.ready && game.currPlayer == game.playerId) {
       // alert(game.playerId);
        this.num = Math.floor(Math.random()*6)+1;
        document.getElementById("dice").innerHTML = this.num;
        this.setReady(false);
        this.game.diceRolled();
    }
    return;
}

Dice.prototype.setReady = function(bool) {
    this.ready = bool;
    if(bool) {
        document.getElementById("dice").classList.add("hl");
        if(this.game.currPlayer==this.game.playerId) 
            document.getElementById("dice").innerHTML = "roll";
        else
            document.getElementById("dice").innerHTML = "wait";
    }else{
        document.getElementById("dice").classList.remove("hl");
    }
}

/*
 *      TOKEN
 */

function Token(player,pid,id,path) {
    this.player = player
    this.tComplete = false;
    this.maxCount = 56;
    this.movable = false;
    this.playerId = pid;
    this.tid = id;
    this.path = path;
    this.count = -6;
    this.cell = "p"+(this.playerId+1)+"h"+(this.tid+1);          
    this.placeToken();
}

Token.prototype.highlight = function(bool) {
    var el = document.getElementById(this.cell);
    //console.log(el.id)
    if(bool) {
        el.classList.add("hl");
    }else{
        el.classList.remove("hl");
    }

}

Token.prototype.createTokenDiv = function() {
    var innDiv = document.createElement("div");
    innDiv.className = "token p"+(this.playerId+1);
    innDiv.id = "p"+ this.playerId+"t"+this.tid; 
    var fn = function() {
        game.clicked(this.id);
    }
    innDiv.addEventListener("click",fn);
    return innDiv;
}  

Token.prototype.placeToken = function(pos) {
    if(pos==null) {
        this.cell = "dp"+(this.playerId+1)+"h"+(this.tid+1)
        var td = document.getElementById(this.cell);    
        td.appendChild(this.createTokenDiv());  
        return ;  
    }
    this.cell = this.path[pos];
    var td = document.getElementById(this.cell);    
    td.appendChild(this.createTokenDiv()); 
}

Token.prototype.removeToken = function() {
    var id = "p"+(this.playerId)+"t"+(this.tid);
    var t= document.getElementById(id);
    t.parentNode.removeChild(t);
    this.cell = null;
}

Token.prototype.move = function() {
    this.player.removeTokensHighlight();
    this.count += game.dice.num;
    this.removeToken();
    this.placeToken(this.count);
    if(this.cell == "dp"+(this.playerId+1)+"6") {
        this.tComplete = true;
        this.movable = false;
        this.player.checkComplete();
    }
    return this.cell;
}

Token.prototype.killToken = function() {
    this.count = -6;
    this.removeToken();
    this.placeToken();  
}

Token.prototype.isMovable = function(count) {
    if(this.tComplete) 
        return 0;
    if(this.cell==(("dp"+(this.playerId+1)+"h"+(this.tid+1)))) {
            if(count!=6){
                this.movable = false;
                return 0;
           }               
        } 
        if((this.count+count)>this.maxCount){
            this.movable = false;
                return 0;
        }
        this.movable = true;
        this.highlight(true);
                return 1;
}
