var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var spotify = require('./config/spotify.json');

var app = express();

const port = 3000;

var request = require('request'); // "Request" library

var access_token;

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(spotify.client_id + ':' + spotify.client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {

    // use the access token to access the Spotify Web API
    var token = body.access_token;
    access_token = body.access_token;

    var options = {
      url: 'https://api.spotify.com/v1/users/' + spotify.user_id,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };
    request.get(options, function(error, response, body) {
      console.log(body);
    });
  }
});

///my API calls below

app.get('/ping', function(req, res){ 

	res.send(access_token);
});

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
        	'Authorization': 'Bearer ' + access_token,
      	},
      	body: JSON.stringify({name: 'DGD - test', public: false}),
      	dataType:'json'
    };

    request.post(options, function(error, response, body) {
    	res.send(response.body);
	});
});

app.post('/spotify/auth/', function(req,res) {
	var options = {
		url: 'https://accounts.spotify.com/authorize?response_type=token' +
			'&client_id=' + spotify.client_id + 
			'&scope=playlist-modify-private playlist-modify-public' +
			'&redirect_uri=http://localhost:3000',
		headers: { 'Authorization': 'Bearer ' + spotify.bearer },
		dataType:'json'
	}

	console.log(options.url)

	request.get(options, function(error, response, body) {
		res.send(response.body);
	});
})

app.listen(port, () => {
    console.log('We are live on ' + port);
});   
