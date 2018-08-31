function games() {
    this.dict = new Map();
}

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

games.prototype.connectionHandler = function(socket) {
    console.log('user');
    socket.on('joinGame',function(id){
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
    });
    socket.on('move',function(cid,g){
        console.log(g+" "+cid);
        //console.log(games);
        var p1s = games.get(g).p1s;
        var p2s = games.get(g).p2s;
        p1s.emit('moveR',cid);
        p2s.emit('moveR',cid);
    });
    socket.on('endGame',function(id){
        endGame(id);
    });
	socket.on('disconnect',function(){
        if(socket.gameId != undefined){
            
            handleQuit(socket);
            console.log("unexpected close "+socket.gameId);
            //console.log(games);
        }
        else
		console.log('dis');
	});
}

module.exports = games;