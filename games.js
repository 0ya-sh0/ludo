const Game = require("./game");

function games() {
    this.dict = new Map();
}

/**/ 
games.prototype.handleQuit = function(sock) {
    //console.log("inside handle");
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
    //delete sock.gameId;
}

games.prototype.joinGameHandler = function(socket, id) {
    if(socket.gameId != undefined){
        console.log('smae');
        return;
    }
    if(!games.has(id)){
        games.set(id,new game(id,socket));
        socket.gameId= id;
        console.log("joinNew "+id);
    }else{
        if(games.get(id).isGameOn)
            return;
        if(socket.id==games.get(id).p1s.id){
            console.log("smae");
            return;
        }
        games.get(id).p2s = socket;
        console.log("joinComplete "+id);
        socket.gameId = id;
        startGame(id);
    }
}

games.prototype.moveHandler = function(socket,cid,g) {
    console.log(g+" "+cid);
    //console.log(games);
    var p1s = games.get(g).p1s;
    var p2s = games.get(g).p2s;
    p1s.emit('moveR',cid);
    p2s.emit('moveR',cid);
}

games.prototype.disconnetHandler = function(socket) {
    if(socket.gameId != undefined){     
        handleQuit(socket);
        console.log("unexpected close "+socket.gameId);
        //console.log(games);
    } else {
        console.log('dis');
    }
}

game.prototype.endGameHandler = function(socket, id) {
    endGame(id);
    //
}

games.prototype.connectionHandler = function(socket) {
    console.log('user connected...');
    socket.on('joinGame',function(id){
        this.joinGameHandler(socket, id);
    });
    socket.on('move',function(cid,g){
        this.moveHandler(socket, cid, g);
    });
    socket.on('endGame',function(id){
        this.endGameHandler(socket,id);
    });
	socket.on('disconnect',function(){
        this.disconnetHandler(socket);
	});
}

module.exports = games;