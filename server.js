var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var spotify = require('./config/spotify.json');
var engines = require('consolidate');
var request = require('request'); // "Request" library
var path    = require("path");
var bodyParser = require('body-parser');

var app = express();
var access_token;

const port = 3000;
var user_approved_access_token;

app.use(express.static(__dirname + '/View'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

app.get('/spotify/first-time-auth/', function(req, res){

	// user_approved_access_token = req.query.access_token; 

	res.sendFile(path.join(__dirname+'/views/first-time-auth.html'));
});

app.get('/spotify/save-access-token', function(req,res) {
	user_approved_access_token = req.query.access_token;

	if(user_approved_access_token === null) {
		res.status(400); 
		res.send('token could not be saved');
	} else {
		res.status(200);
		res.send('token saved');
	}		
});

app.get('/spotify/refresh-auth/', function(req, res){ 
	
	res.sendFile(path.join(__dirname+'/views/refresh-auth.html'));
});

app.get('/spotify/get-recent', function(req, res) {

	var options = {
		url: 'https://api.spotify.com/v1/me/player/recently-played',
		headers: { 'Authorization': 'Bearer ' + user_approved_access_token },
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
        	'Authorization': 'Bearer ' + user_approved_access_token,
      	},
      	body: JSON.stringify({name: 'DGD - test', public: false}),
      	dataType:'json'
    };

    request.post(options, function(error, response, body) {
    	res.send(response.body);
	});
});

app.get('/spotify/auth/', function(req,res) {
	var options = {
		url: 'https://accounts.spotify.com/authorize?response_type=token' +
			'&client_id=' + spotify.client_id + 
			'&scope=playlist-modify-private playlist-modify-public' +
			'&redirect_uri=http://localhost:3000/spotify/first-time-auth?' +
			'&expires_in=10000',
		headers: { 'Authorization': 'Bearer ' + spotify.bearer },
		dataType:'json'
	}

	res.redirect(options.url);
});

app.get('/spotify/auth/refresh', function(req,res) {
	var options = {
		url: 'https://accounts.spotify.com/authorize?response_type=token' +
			'&client_id=' + spotify.client_id + 
			'&scope=playlist-modify-private playlist-modify-public?' +
			'&redirect_uri=http://localhost:3000' +
			'&expires_in=10000',
		headers: { 'Authorization': 'Bearer ' + spotify.bearer },
		dataType:'json'
	}

	res.redirect(options.url);
});

app.listen(port, () => {
    console.log('We are live on ' + port);
});   
