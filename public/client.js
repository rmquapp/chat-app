var userColor = '000000';
var userNickname =  '';
var users = {};

function updateScroll(){
	$("#chat").scrollTop($("#chat")[0].scrollHeight);
}

function updateUsers(people){
	$('#userList').empty();
	for(var key in people){
		$('#userList').append($('<li>').text(people[key]));
	}
}

$(function() {
	$('#m').focus();

    var socket = io();
    socket.emit("join");

    $('form').submit(function(){
		socket.emit('send', $('#m').val());
		$('#m').val('');
		return false;
    });

    socket.on("chat", function(timestamp, id, code, msg){    	
    	var li = document.createElement('li');
    	var time = document.createElement('span');
		var username = document.createElement('span');
		var content = document.createElement('span');

		username.setAttribute('style', 'color: #' + code);

		// If current user
    	if (id == userNickname) {
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

    	username.innerHTML = id + ': &nbsp';
		time.innerHTML = timestamp + ' &nbsp&nbsp';
		content.innerHTML = msg;

    	li.appendChild(time);
    	li.appendChild(username);
    	li.appendChild(content);

    	$('#messages').append(li);

    	socket.emit('updateLog', time.innerHTML + username.innerHTML + content.innerHTML);

    	updateScroll();

    	updateUsers(users);
    });

    socket.on("setNickname", function(oldNickname, newNickname){
    	if (userNickname == oldNickname) {
    		userNickname = newNickname;
		    var displayName = document.getElementById("nicknameMessage");
		    displayName.innerHTML = "You are " + newNickname + ".";
    	}
    });

    socket.on("setUsers", function(people){
    	users = people;
    	updateUsers(people);
  	});

  	socket.on("showLog", function(log, nickname){
    	if (userNickname == nickname) {
			for (var i = 0; i < log.length; i++) {
				var li = document.createElement('li');
				var message = document.createElement('span');

				message.innerHTML = log[i];
				message.setAttribute('style', 'color: #A8A8A8');

				li.appendChild(message);
				$('#messages').append(li);
	  		}
  		  	updateScroll();
	  	}
  	});
});