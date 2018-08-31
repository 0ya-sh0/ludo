const mexpress = require('express');
const mhttp = require('http');
const mio = require('socket.io');
const Games = require('./games');

const app = mexpress();
const http = mhttp.Server(app);
const io = mio(http);

const ipadd2= '192.168.43.1';
const ipadd1 = '0.0.0.0';
const ipadd = ipadd1;
const port = 8000;

http.listen(port,ipadd,function(){
	console.log(`listening on... http://${ipadd}:${port}`);
});

app.get('/',function(req,res){
	res.sendFile(__dirname + '/client/ludo.html');
});

app.get('/ludo.css',function(req,res){
	res.sendFile(__dirname + '/client/ludo.css');
});

app.get('/ludo.js',function(req,res){
	res.sendFile(__dirname + '/client/ludo.js');
});

const games = new Games();

io.on("connection",(sock)=>games.connectionHandler(sock));