console.log('currentTrack loaded');
require('dotenv').config();
var Spotify = require('spotify-web-api-node');
var fs = require('fs');
var path = require('path');
var request = require('request');
var host = '10.1.100.4'; // or maybe localhost

var spotify = new Spotify({
    redirectUri: 'http://localhost:3009/callback',
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET
});

var refresh_token = fs.readFileSync(path.join(__dirname, '../token.txt'), 'utf-8').trim();
var access_token;
var tracks = [];
var PADDING = '                                                              ';


console.log('token:', refresh_token);

spotify.setRefreshToken(refresh_token);
spotify.refreshAccessToken().then(function(response){
    console.log('new token:', response.body.access_token);
    access_token = response.body.access_token;
    spotify.setAccessToken(access_token);

    getRecentlyPlayed()
}).catch(function(err){
    console.log('err:', err);
});

setInterval(getRecentlyPlayed, 10000);

function getRecentlyPlayed() {
    spotify.getMyCurrentPlayingTrack().then(function(response){
        // console.log('response:', response);
        var track = response.body.item.name;
        var artist = response.body.item.artists[0].name;
        console.log(track + ' - ' + artist)
        tracks.push({
            track: track,
            artist: artist
        });
        if(tracks.length > 3){
            tracks.pop();
        }

        // write to board
        tracks.forEach(function(item, index){
            var prefix = getPrefix(index);
            var text = `${prefix} ${item.artist} - ${item.track}${PADDING}`;
            var line = index + 9;
            var options = {
                uri: `http://${host}/peggy/write?board=1&y=${line}&x=0&text=${text}`
            }
            request.get(options, function(err, response){
                console.log(err || 'wrote track ' + index)
            });
        });

    }).catch(function(err){
        console.log('err:', err);
        if(err.statusCode == 401){
            refreshToken();
        }
    });
}

function refreshToken() {
    spotify.refreshAccessToken().then(function(response){
        console.log('new token:', response.body.access_token);
        access_token = response.body.access_token;
        spotify.setAccessToken(access_token);
    }).catch(function(err){
        console.log('err:', err);
    });
}

function getPrefix(index){
    switch(index){
        case 0:
            return '{g}Now Playing: ';
        case 1:
            return '{r}Just Played: ';
        case 2:
            return '{g}Before That: ';
    }
}

// options.path = '/peggy/write?board=1&x=1&y=9&text=' + encodeURIComponent(nowPlayingText);
// options.path = '/peggy/write?board=1&x=1&y=10&text=' + encodeURIComponent(lastPlayedText);
// options.path = '/peggy/write?board=1&x=1&y=11&text=' + encodeURIComponent(doublePrevText);
