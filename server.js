var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var spotify = require('./config/spotify.json');
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

app.get('/', function(req, res){
	res.send('...');
});

app.get('/ping', function(req, res){ 

	res.send(access_token);
});

app.get('/first-time-auth/', function(req, res){

	res.sendFile(path.join(__dirname+'/views/first-time-auth.html'));
});

app.get('/refresh-auth/', function(req, res){ 
	
	res.sendFile(path.join(__dirname+'/views/auth-refresh.html'));
});

app.get('/save-access-token', function(req,res) {
	user_approved_access_token = req.query.access_token;

	if(user_approved_access_token === null) {
		res.status(400); 
		res.send('token could not be saved');
	} else {
		res.status(200);
		res.send('token saved');
	}		
});



app.get('/create-playlist-from-recent', function(req, res) {

	var options = {
		url: 'https://api.spotify.com/v1/me/player/recently-played' + '?type=track&limit=50',
		headers: { 'Authorization': 'Bearer ' + user_approved_access_token },
		dataType:'json'
	}

	request.get(options, function(error, response, body) {

		var response = JSON.parse(response.body);
		var tracks = '';
		var items = response.items
		
		var x = 0;

		//need to check for the auth token, currently breaks after 3600 seconds

		items.forEach(function(item) {
			tracks = tracks + encodeURIComponent(item.track.uri) + ',';
		});

		// createPlaylist(tracks);

		exports.createPlaylist(tracks)  // Returns a Promise!
		  .then(data => {
		  	res.send(data)
		    // Do stuff with users
		  })
		  .catch(err => {
		    // handle errors
		  })

	});
});

/**
 get specific history for specific time
 to get 50 songs for that specific day
*/
app.get('/get-play-history/:date_time', function(req, res) {

	// refreshAuthToken();

	var dateTime = req.params.date_time;
	dateTime = new Date(dateTime);
	dateTime = dateTime.getTime() / 1000;
	var tracks = '';
	// res.send('timestamp -> ' + dateTime);

	var options = {
		url: 'https://api.spotify.com/v1/me/player/recently-played' + 
		'?type=track&limit=50' + 
		'&after=' + dateTime,
		headers: { 'Authorization': 'Bearer ' + user_approved_access_token },
		dataType:'json'
	}

	request.get(options, function(error, response, body) {

		var response = JSON.parse(response.body);
		var items = response.items
		
		var x = 0;

		console.log(response);

		//need to check for the auth token, currently breaks after 3600 seconds

		items.forEach(function(item) {
			tracks = tracks + encodeURIComponent(item.track.uri) + ',';
		});

		if(tracks != '' || tracks != null) {
			res.send('track list' + tracks);	
			return true;
		} else {
			return false;
		}

	});
});


/**
 first point of call does auth for app where you
 gets auth from spotify servers
*/
app.get('/auth/', function(req,res) {
	var options = {
		url: 'https://accounts.spotify.com/authorize?response_type=code' +
			'&client_id=' + spotify.client_id + 
			'&scope=playlist-modify-private playlist-modify-public user-read-recently-played' +
			'&redirect_uri=http://spotify.local/spotify/first-time-auth?' +
			'&expires_in=10000',
		headers: { 'Authorization': 'Bearer ' + spotify.bearer },
		dataType:'json'
	}

	res.redirect(options.url);
});

/**
 will be used when any other end point is called to refresh 
 the auth token given to us from spotify
 so we can continuously use the same one
 there will be times where we need to do a fresh auth
*/
app.get('/auth/refresh', function(req,res) {

	refreshAuthToken(res);

});

/**
 function refreshAuthToken
 will be used when any other end point is called to refresh 
 the auth token given to us from spotify
 so we can continuously use the same one
 there will be times where we need to do a fresh auth
*/

/**
expected response
{
   "access_token": "NgCXRK...MzYjw",
   "token_type": "Bearer",
   "scope": "user-read-private user-read-email",
   "expires_in": 3600,
   "refresh_token": "NgAagA...Um_SHo"
}
*/
function refreshAuthToken(res) {

	var authOptions = {
	    url: 'https://accounts.spotify.com/api/token',
	      form: {
	        code: user_approved_access_token,
	        redirect_uri: '/#',
	        grant_type: 'authorization_code'
	      },
	      headers: {
	        'Authorization': 'Basic ' + (new Buffer(spotify.client_id + ':' + spotify.client_secret).toString('base64'))
	      },
	      json: true
	};

	console.log(user_approved_access_token);

	request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

            console.log(access_token)

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/spotify/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {

      	console.log(error);
      	console.log(response.statusCode);
      	console.log(response.statusMessage);

        res.redirect('/spotify/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });

}

exports.createPlaylist = function createPlaylist (tracks) {
  // Return the Promise right away, unless you really need to
  // do something before you create a new Promise, but usually
  // this can go into the function below
  return new Promise((resolve, reject) => {
    // reject and resolve are functions provided by the Promise
    // implementation. Call only one of them.

    var track_string = tracks;

	var playlist_name = new Date();

	var options = {
	    url: 'https://api.spotify.com/v1/users/' + spotify.user_id + '/playlists',
      	headers: {
        	'Authorization': 'Bearer ' + user_approved_access_token,
      	},
      	body: JSON.stringify({name: playlist_name, public: true}),
      	dataType:'json'
    };

    request.post(options, function(error, response, body) {
		// res.send(response.body);

		var response = JSON.parse(response.body);
		var playlist_id = response.id;

		var options = {
			url: 'https://api.spotify.com/v1/users/' + spotify.user_id + '/playlists/' + playlist_id +
			'/tracks?uris=' + track_string,
	      	headers: {
	        	'Authorization': 'Bearer ' + user_approved_access_token,
	      	},
	      	dataType:'json'
		}

		request.post(options, function(error, response, body) {
			if(error) {
				return reject(error)
			}
			return resolve(response.body);
		});

	});
    
  })
}

app.listen(port, () => {
    console.log('We are live on ' + port);
});   