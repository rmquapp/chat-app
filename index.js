var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var people = {};  
var colors = {};

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));


io.on("connection", function (socket) {
    socket.on("join", function(){
    	var nickname = 'user' + (Object.keys(people).length + 1)
        people[socket.id] = nickname;
        colors[socket.id] = '000000';
        io.sockets.emit("setNickname", '', nickname)
    });

    socket.on("send", function(msg){
    	var date = new Date;
    	var minutes = date.getMinutes();
		var hour = date.getHours();
		var timestamp = hour + ':' + minutes;
        io.sockets.emit("chat", timestamp, people[socket.id], colors[socket.id], msg);
    });

    socket.on("disconnect", function(){
        delete people[socket.id];
    });

    socket.on("changeNickname", function(nickname){
    	var unique = true;
		for(var key in people){
  			if (people[key] == nickname) {
  				unique = false;
  			}
  		}
  		if (unique) {
  			oldNickname = people[socket.id];
      		people[socket.id] = nickname;
      		io.sockets.emit("setNickname", oldNickname, nickname);
    	}
    });

    socket.on("changeColor", function(color){
    	colors[socket.id] = color;
    });
});