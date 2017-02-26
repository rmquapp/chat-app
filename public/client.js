var userColor = '000000'
var userNickname =  ''

function updateScroll(){
    var element = document.getElementById("chat");
    element.scrollTop = element.scrollHeight;
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
		var message = document.createElement('span');

		// If current user
    	if (id == userNickname) {
    		message.setAttribute('style', 'font-weight: bold');

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

		username.setAttribute('style', 'color: #' + code);
		time.setAttribute('style', 'color: #A8A8A8');

    	username.innerHTML = id + ': &nbsp';
		time.innerHTML = timestamp + ' &nbsp&nbsp';
		message.innerHTML = msg;

    	li.appendChild(time);
    	li.appendChild(username);
    	li.appendChild(message);

    	$('#messages').append(li);

    	updateScroll();
    });

    socket.on("setNickname", function(oldNickname, newNickname){
    	if (userNickname == oldNickname) {
    		userNickname = newNickname;
		    var displayName = document.getElementById("nicknameMessage");
		    displayName.innerHTML = "You are " + newNickname + ".";
    	}
    });
});