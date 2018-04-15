var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var spotify = require('./config/spotify');

var app = express();

const port = 8081;

app.get('/spotify/get-recent', function(req, res) {
	
	request({
		method: 'GET',
		uri: 'https://api.spotify.com/v1/me/player/recently-played',
		type: 'json',
		'auth': {
		    'bearer': spotify.bearer
		}, 
	}, function(error, response, body) {
		res.send(response.body);
	});
});

app.listen(port, () => {
    console.log('We are live on ' + port);
});   
