const mexpress = require('express');
const mhttp = require('http');
const mio = require('socket.io');

const app = mexpress();
const http = mhttp.Server(app);
const io = mio(http);

const games = new Map();
const ipadd2= '192.168.43.1';
const ipadd1 = '0.0.0.0';
const ipadd = ipadd1;
const port = 8080;

http.listen(port,ipadd,function(){
	console.log(`listening on... http://${ipadd}:${port}`);
});

app.get('/',function(req,res){
	res.sendFile(__dirname + 'client/ludo.html');
});