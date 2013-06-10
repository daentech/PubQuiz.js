var url = require("url");
var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')

var teamnames = new Array();
var questions = 0;
var currQuestion = 0;
var quizStarted = false;
var teamBuzzed = false;
var currTeam = '';


app.listen(8080);

function handler (req, res) {
    var pathname = url.parse(req.url).pathname;
    console.log(pathname);
    if(pathname === '/admin'){
        fs.readFile(__dirname + '/admin.html',
                function(err, data) {
                if(err){
                return error(res, "Error loading admin page", 500);
                }
                res.writeHead(200);
                console.log("Writing out admin page");
                res.end(data);
                });
    } else if(pathname === '' || pathname === '/' || pathname.indexOf('#') != -1) {
        fs.readFile(__dirname + '/index.html',
                function (err, data) {
                if (err) {
                return error(res, 'Error loading index.html', 500);
                }

                res.writeHead(200);
                res.end(data);
                });
    } else if(pathname === '/view'){
        fs.readFile(__dirname + '/view.html',
            function (err, data) {
                if (err) {
                return error(res, 'Error loading view page', 500);
                }

                res.writeHead(200);
                res.end(data);
                });
    
    } else if (pathname.indexOf(".js") != -1 || pathname.indexOf(".css") != -1){
     fs.readFile(__dirname + pathname,
                function(err, data) {
                if(err){
                return error(res, "Error loading page", 404);
                }
                res.writeHead(200);
                res.end(data);
                });
    } else {
        error(res, "Page not found", 404);
    }
}

io.sockets.on('connection', function (socket) {
        
        socket.on('buzz', function (data) {
        	if(teamBuzzed && data.team === currTeam) return;
        	if(!teamBuzzed){
        		teamBuzzed = true;
        		currTeam = data.team;
		        socket.broadcast.emit('user-buzzed', data);
		        socket.emit('answering', data);
		    } else {
			    socket.emit('tooslow');
		    }
        });
        
        socket.on('nextquestion', function(data){
	        // Move to the next question
	        currQuestion++;
	        socket.broadcast.emit('nextquestion', { question_no: currQuestion, totalQuestions : questions});
            socket.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
            socket.broadcast.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
        });
        
        socket.on('previousquestion', function(data){
	        // Move to the next question
	        currQuestion--;
	        socket.broadcast.emit('previousquestion', { question_no: currQuestion, totalQuestions : questions});
            socket.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
            socket.broadcast.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
        });
        
        socket.on('playercorrect', function(data){
        	if(teamBuzzed){
	       		socket.broadcast.emit('playercorrect'); 
	       		incrementScore();
	       		teamBuzzed = false;
	            socket.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
	            socket.broadcast.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
	       	} else {
		       	socket.emit('noteambuzzed');
	       	}
        });
        
        socket.on('askanother', function(data){
	        socket.broadcast.emit('askanother');
	        teamBuzzed = false;
        });
        
        socket.on('startquiz', function(data){
        	quizStarted = !quizStarted;
	        socket.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
	        socket.broadcast.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
        });
        
        socket.on('registerteam', function(data){
	        console.log(JSON.stringify(data));
	        // Check if teamname already exists
	        // If it exists, alert the user that the team name is taken
	        // if not
	        teamnames.push({name : data.name, socket_id : socket.id, score: 0});
	    	socket.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
	    	socket.broadcast.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
        });
        
        socket.emit('updatestate', {started : quizStarted, teams : teamnames, question_no : currQuestion, totalQuestions : questions});
    });

function error(res, message, errCode){
    
    res.writeHead(errCode);
    return res.end(message);
}

function incrementScore(){
	for(i = 0; i < teamnames.length; i++){
		if(teamnames[i].name === currTeam){
			teamnames[i].score++;
		}
	}
}
