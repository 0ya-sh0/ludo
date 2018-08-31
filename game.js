function game(id,ps0){
    this.gameId = id;
    this.ps = new Array(4);
    this.ps[0] = ps0;
    this.isGameOn = false;
}
 
game.prototype.startGame = function() {
    for (const i in this.ps) {
        ps[i].emit('startGame',this.gameId,i);
    }
    this.isGameOn = true;
    console.log("starting game: "+this.gameId);
}
 
game.prototype.endGame = function() {
    console.log("ending game: "+this.gameId);
    for (const i in this.ps) { 
        delete this.ps[i].gameId;
        this.ps[i].disconnect();
    }
}

module.exports = game;