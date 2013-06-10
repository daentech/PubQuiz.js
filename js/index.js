var jqmReady = $.Deferred();
var signed_in = false;
var teamname;


$(document).bind("pageinit", function() {
    jqmReady.resolve();
});

$.when(jqmReady).then(function() {
    console.log("Ready to begin...");

    $(document).trigger("PG_pageinit");
    $('#question').live('pageshow', questioninit);
    $('#leaderboard').live('pagebeforeshow', leaderboardinit);
});

var questioninit = function(){
	if(!signed_in){
	var storedTeamName = localStorage.getItem("teamname");
		if(storedTeamName === null || storedTeamName.length === 0){
			$('#btnSignup').off('click');
			$('#btnSignup').click(function(e){
				// Register team
				$('#popupLogin').popup('close');
				if($('#tn').val().length === 0){
					$('#popupLogin').popup('open');
				} else {
					console.log("Should be closing the popup...");
					signed_in = true;
					teamname = $('#tn').val();
					$('#teamname').text(teamname);
					localStorage['teamname'] = teamname;
					socket.emit('registerteam', {name : teamname});
					window.location.hash = '';
				}
				
				return false;
			});
			$('#popupLogin').popup('open');
		} else {
			// We have a stored team name,
			socket.emit('registerteam', {name : storedTeamName});
			$('#teamname').text(storedTeamName);			
			
		}
	}
}

var leaderboardinit = function(){
	
}