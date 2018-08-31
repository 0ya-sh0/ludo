function game(id,ps0){
    this.gameId = id;
    this.ps = new Array(4);
    this.ps[0] = ps0;
    this.isGameOn = false;
    this.count = 1;
}
 
game.prototype.startGame = function() {
    for (const i in this.ps) {
        this.ps[i].emit('startGame',this.gameId,i);
    }
    this.isGameOn = true;
    console.log("starting @game: "+this.gameId);
}
 
game.prototype.sendOtherQuit = function(sock) {
    console.log("force killing @game: "+this.gameId);
    for (const i in this.ps) { 
        if (this.ps[i]) {
            this.ps[i].emit("otherQuit");
        }
    }
}

game.prototype.endGame = function() {
    console.log("ending @game: "+this.gameId);
    for (const i in this.ps) { 
        if (this.ps[i]) {
            this.ps[i].gameId = undefined;
            this.ps[i].disconnect();
        }
    }
}

game.prototype.sendMove = function(dice,tid) {
    for (const i in this.ps) {
        this.ps[i].emit("moveR",dice,tid);
    }
}

game.prototype.sendNoMove = function(dice,tid) {
    for (const i in this.ps) {
        this.ps[i].emit("noMoveR");
    }
}

module.exports = game;