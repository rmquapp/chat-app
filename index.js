var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var people = {};  
var colors = {};
var log = [];

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));


io.on("connection", function (socket) {
    socket.on("join", function(nickname){
    	if (nickname == "") {
    		nickname = 'User' + (Object.keys(people).length + 1)
    	}

        people[socket.id] = nickname;
        colors[socket.id] = '000000';

        io.sockets.emit("setNickname", '', nickname);
        io.sockets.emit("setUsers", people);
    	io.sockets.emit("showLog", log, nickname);
    });

    socket.on("send", function(msg){
    	var date = new Date;
    	var minutes = date.getMinutes();
		var hour = date.getHours();
		var timestamp = hour + ':' + minutes;

        io.sockets.emit("chat", socket.id, timestamp, people[socket.id], colors[socket.id], msg);
    });

    socket.on("disconnect", function(){
        delete people[socket.id];
        io.sockets.emit("setUsers", people);

        // Clear the log if chat is empty
        if (Object.keys(people).length === 0) {
        	log = [];
        }
    });

    socket.on("changeNickname", function(nickname){
        var unique = true;
        for (var key in people) {
            if (people[key] == nickname) {
                unique = false;
            }
        }
        if (unique) {
            oldNickname = people[socket.id];
            for (var key in people) {
                if (people[key] == oldNickname) {
                    people[key] = nickname
                }
            }

            io.sockets.emit("setNickname", oldNickname, nickname);
            io.sockets.emit("setUsers", people);
        }
    });

    socket.on("changeColor", function(color){
    	colors[socket.id] = color;
    });

    socket.on("updateLog", function(socketId, message){
    	if (socketId == socket.id) {
    		log.push(message);
    	}
    });

});