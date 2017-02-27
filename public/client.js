var userColor = '000000';
var userNickname =  '';
var users = {};
var firstTime = true;

function updateScroll(){
	$("#chat").scrollTop($("#chat")[0].scrollHeight);
}

function updateUsers(people){
	$('#userList').empty();

	var uniqueUsers = [];
	for (var key in people) {
		var nickname = people[key];
		if (!uniqueUsers.includes(nickname)) {
			uniqueUsers.push(nickname);
		}
  	}
	for (var i = 0; i < uniqueUsers.length; i++) {
		$('#userList').append($('<li>').text(uniqueUsers[i]));
	}
}

$(function() {
	$('#m').focus();

    var socket = io();
    socket.emit("join", getCookie());

    $('form').submit(function(){
		socket.emit('send', $('#m').val());
		$('#m').val('');
		return false;
    });

    socket.on("chat", function(socketId, timestamp, name, code, msg){	
    	var li = document.createElement('li');
    	var time = document.createElement('span');
		var username = document.createElement('span');
		var content = document.createElement('span');

		username.setAttribute('style', 'color: #' + code);

		// If current user
    	if (name == userNickname) {
    		time.setAttribute('style', 'font-weight: bold');
    		username.setAttribute('style', 'font-weight: bold; color: #' + code);
    		content.setAttribute('style', 'font-weight: bold');

	    	// If change nickname
	    	if (msg.startsWith('/nick ')) {
	    		var nickname = msg.split(' ')[1];
	    		socket.emit('changeNickname', nickname);
	    	}

	    	// If change nickname color
	    	if (msg.startsWith('/nickcolor ')) {
	    		userColor = msg.split(' ')[1];
	    		socket.emit('changeColor', userColor);
	    	}
    	}

    	username.innerHTML = name + ': &nbsp';
		time.innerHTML = timestamp + ' &nbsp&nbsp';
		content.innerHTML = msg;

    	li.appendChild(time);
    	li.appendChild(username);
    	li.appendChild(content);

    	$('#messages').append(li);

    	if (name == userNickname) {
    		socket.emit('updateLog', socketId, time.innerHTML + username.innerHTML + content.innerHTML);
    	}

    	updateScroll();

    	updateUsers(users);
    });

    socket.on("setNickname", function(oldNickname, newNickname){
    	if (userNickname == oldNickname) {
    		userNickname = newNickname;
		    var displayName = document.getElementById("nicknameMessage");
		    displayName.innerHTML = "You are " + newNickname + ".";
		    setCookie(newNickname);
    	}
    });

    socket.on("setUsers", function(people){
    	users = people;
    	updateUsers(people);
  	});

  	socket.on("showLog", function(log, nickname){
    	if (userNickname == nickname && firstTime) {
			for (var i = 0; i < log.length; i++) {
				var li = document.createElement('li');
				var message = document.createElement('span');

				message.innerHTML = log[i];
				message.setAttribute('style', 'color: #A8A8A8');

				li.appendChild(message);
				$('#messages').append(li);
	  		}
  		  	updateScroll();
  		  	firstTime = false;
	  	}
  	});
});

function setCookie(username) {
    var d = new Date();
    d.setTime(d.getTime() + (1*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = "username=" + username + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = "username=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}