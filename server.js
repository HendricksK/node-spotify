var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var spotify = require('./config/spotify');

var app = express();

const port = 8081;

app.get('/spotify/get-recent', function(req, res) {

	var options = {
		url: 'https://api.spotify.com/v1/me/player/recently-played',
		headers: { 'Authorization': 'Bearer ' + spotify.bearer },
		dataType:'json'
	}

	request.get(options, function(error, response, body) {
		res.send(response.body);
	});
});

app.post('/spotify/create-playlist', function(req, res) {

	var options = {
	    url: 'https://api.spotify.com/v1/users/' + spotify.user_id + '/playlists',
      	headers: {
        	'Authorization': 'Bearer ' + spotify.bearer,
      	},
      	body: JSON.stringify({name: "test", public: false}),
      	dataType:'json'
    };

    request.post(options, function(error, response, body) {
    	res.send(response.body);
	});
});

app.listen(port, () => {
    console.log('We are live on ' + port);
});   
