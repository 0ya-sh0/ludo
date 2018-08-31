const Game = require("./game");

function games() {
    this.dict = new Map();
}

/**/ 
games.prototype.handleQuit = function(sock) {
   /* //console.log("inside handle");
    if(games.get(sock.gameId).p2s == null){
        games.delete(sock.gameId);
        //delete sock.gameId;
        return;
    }
    if(sock.id == games.get(sock.gameId).p1s.id){
    games.get(sock.gameId).p2s.emit('otherQuit');
   
    delete games.get(sock.gameId).p2s.gameId;
    games.get(sock.gameId).p2s.disconnect();
    games.delete(sock.gameId);
    //delete sock.gameId;
    return;
    }
    games.get(sock.gameId).p1s.emit('otherQuit');

    delete games.get(sock.gameId).p1s.gameId;
    games.get(sock.gameId).p1s.disconnect();
    games.delete(sock.gameId);
    //delete sock.gameId;*/
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
    }else{
        if(this.dict.get(id).isGameOn)
            return;
        if(socket.id === this.dict.get(id).ps[0].id){
            console.log("same user tried connecting @game: "+id);
            return;
        }
        const g = this.dict.get(id);
        g.ps[g.count++] = socket;
        socket.gameId = id;
        if (g.count == 4) {
            console.log("all players connected @game: "+id);
            g.startGame();
        }
    }
}

games.prototype.moveHandler = function(socket,gid, dice, tid) {
    /*console.log(g+" "+cid);
    //console.log(games);
    var p1s = games.get(g).p1s;
    var p2s = games.get(g).p2s;
    p1s.emit('moveR',cid);
    p2s.emit('moveR',cid);*/
    this.dict.get(gid).sendMove(dice,tid);
}

games.prototype.noMoveHandler = function(socket,gid) {
    /*console.log(g+" "+cid);
    //console.log(games);
    var p1s = games.get(g).p1s;
    var p2s = games.get(g).p2s;
    p1s.emit('moveR',cid);
    p2s.emit('moveR',cid);*/
    this.dict.get(gid).sendNoMove();
}

games.prototype.disconnetHandler = function(socket) {
    /*if(socket.gameId != undefined){     
        handleQuit(socket);
        console.log("unexpected close "+socket.gameId);
        //console.log(games);
    } else {
        console.log('dis');
    }*/
}

games.prototype.endGameHandler = function(socket, id) {
    //endGame(id);
    //
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
    socket.on('endGame',function(id){
        //this.endGameHandler(socket,id);
    });
	socket.on('disconnect',function(){
        //this.disconnetHandler(socket);
	});
}

module.exports = games;