var router = require('express').Router();
var request = require('request');

require('dotenv').config();
var SpotifyWebApi = require('spotify-web-api-node');

var scopes = ['user-read-private', 'user-read-email', 'user-library-read', 'user-top-read', 'user-read-recently-played', 'user-read-currently-playing', 'user-modify-playback-state', 'user-read-playback-state'],
    redirectUri = 'http://localhost:8080/spotify/callback',
    clientId = process.env.SPOTIFY_ID,
    clientSecret = process.env.SPOTIFY_SECRET,
    state = 'some-state-of-my-choice';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri : redirectUri,
  clientId : clientId,
  clientSecret : clientSecret
});

var access_token = 'BQAUWc52D_4nKJPXBFd9FQaayC_ZYSN2amoMDKFn_DnQYce0o1dy6sP8WRkPRCN0GbzbrmPd2h9sFgFwcpg';
var refresh_token = process.env.SPOTIFY_REFRESH;

router.all('/', function(req, res){
	var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

	// https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
	console.log(authorizeURL);

	// res.send({url: authorizeURL})
	res.render('spotify', {url: authorizeURL});
  spotifyApi.setRefreshToken(refresh_token);
  spotifyApi.getMyRecentlyPlayedTracks(null, function(err, response){
    console.log('err', err);
    if(err && err.statusCode == '401'){
      // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
      spotifyApi.refreshAccessToken()
        .then(function(data) {
          console.log('The access token has been refreshed!');

          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
        }, function(err) {
          console.log('Could not refresh access token', err);
        });
    }
    // console.log('response:', response);
  });
});

router.all('/callback', function(req, res){
  console.log('what', req.query.code);
  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(req.query.code)
    .then(function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);
      refresh_token = data.body['refresh_token'];

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      spotifyApi.getMyRecentlyPlayedTracks(null, function(err, response){
        console.log('err', err);
        console.log('response:', response.body.items);
        response.body.items.forEach(function(data){
          var now_playing = data.track.artists[0].name + ' - ' + data.track.name;
          console.log('now playing:', now_playing);
        })
      });
    }, function(err) {
      console.log('Something went wrong!', err);
    });
  res.render('spotify', {});
})



// var options = {};
// options.url = '/peggy/write?board=1&x=1&y=9&text=' + encodeURIComponent(nowPlayingText);
// http.get(options).on('error', function (e) {
//     e = e || {};
//     console.log('Got error: ' + e.message);
// });
//
// options.path = '/peggy/write?board=1&x=1&y=10&text=' + encodeURIComponent(lastPlayedText);
// http.get(options).on('error', function (e) {
//     e = e || {};
//     console.log('Got error: ' + e.message);
// });
//
// options.path = '/peggy/write?board=1&x=1&y=11&text=' + encodeURIComponent(doublePrevText);
// http.get(options).on('error', function (e) {
//     e = e || {};
//     console.log('Got error: ' + e.message);
// });

module.exports = router;
