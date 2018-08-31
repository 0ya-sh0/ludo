const Game = require("./game");

function games() {
    this.dict = new Map();
}

games.prototype.handleQuit = function(sock) {
    const gid = sock.gameId;
    const g = this.dict.get(gid);
    g.sendOtherQuit(sock);
    g.endGame();
    this.dict.delete(gid);
}

games.prototype.joinGameHandler = function(socket, id) {
    if(socket.gameId) {
        console.log('same user tried again @game: '+id);
        return;
    }
    if(!this.dict.has(id)){
        this.dict.set(id,new Game(id,socket));
        socket.gameId = id;
        console.log("user created game: "+id);
        socket.emit("succesCreateGame");
    }else{
        if(this.dict.get(id).isGameOn) {
            socket.emit("failedCreateGame");
            console.log("user tried used id "+id);
            return;
        } 
        if(socket.id === this.dict.get(id).ps[0].id){
            console.log("same user tried connecting @game: "+id);
            return;
        }
        const g = this.dict.get(id);
        g.ps[g.count++] = socket;
        socket.gameId = id;
        if (g.count == 4) {
            console.log("user connected succesfully @game: "+id);
            console.log("all players connected @game: "+id);
            g.startGame();
        } else {
            socket.emit("succesJoinGame");
            console.log("user connected succesfully @game: "+id);
        }
    }
}

games.prototype.moveHandler = function(socket,gid, dice, tid) {
    console.log(`@move: token: ${tid} dice: ${dice} @game: ${gid}`);
    this.dict.get(gid).sendMove(dice,tid);
}

games.prototype.noMoveHandler = function(socket,gid) {
    console.log(`@move: nomove @game: ${gid}`);
    this.dict.get(gid).sendNoMove();
}

games.prototype.disconnetHandler = function(socket) {
    if(socket.gameId){  
        console.log("user unexpectedly resigned @game: "+socket.gameId);   
        this.handleQuit(socket);
    } else {
        console.log('user disconnected...');
    }
}

games.prototype.endGameHandler = function(socket, id) {
    this.dict.get(id).endGame();
    this.dict.delete(id);
}

games.prototype.connectionHandler = function(socket) {
    console.log('user connected...');
    socket.on('joinGame',(function(id) {
            this.joinGameHandler(socket, id);
        }).bind(this)
    )
    socket.on('move',(function(gid, dice, tid){
            this.moveHandler(socket, gid, dice, tid);
        }).bind(this)
    );
    socket.on('noMove',(function(gid){
            this.noMoveHandler(socket, gid);
        }).bind(this)
    );
    socket.on('endGame',(function(id){
            this.endGameHandler(socket,id);
        }).bind(this)
    );
	socket.on('disconnect',(function(){
            this.disconnetHandler(socket);
        }).bind(this)
    );
}

module.exports = games;