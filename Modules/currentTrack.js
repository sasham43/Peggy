console.log('currentTrack loaded');
require('dotenv').config();
var Spotify = require('spotify-web-api-node');
var fs = require('fs');
var path = require('path');

var spotify = new Spotify({
    redirectUri: 'http://localhost:3009/callback',
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET
});

// var refresh_token;

var refresh_token = fs.readFileSync(path.join(__dirname, '../token.txt'), 'utf-8').trim();
// var refresh_token = 'AQDtK-bRlhqdxVHIbp5CSM_z5K14_CXsOkLOKx0bxaTTAiisOlmYjW9_mQrei35TZr9XgRWdC4XPudMXkFTHY9QpYHvbJ2oUnojqY2tJVzB7rXppwEzZyaCM2JSob9gXWSw'
var access_token;
var tracks = [];

console.log('token:', refresh_token);

spotify.setRefreshToken(refresh_token);
spotify.refreshAccessToken().then(function(response){
    console.log('new token:', response.body.access_token);
    access_token = response.body.access_token;
    spotify.setAccessToken(access_token);

    getRecentlyPlayed()
}).catch(function(err){
    console.log('err:', err);
});;

function getRecentlyPlayed(){
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
    });


    return;
    spotify.getMyRecentlyPlayedTracks().then(function(response){
        // console.log('response:', response.body.items);
        tracks = response.body.items;
        tracks.forEach(function(item, index){
            console.log(index, item.track.name, item.track.artists[0].name)
        })
    }).catch(function(err){
        console.log('err:', err);
    });
}


// options.path = '/peggy/write?board=1&x=1&y=9&text=' + encodeURIComponent(nowPlayingText);
// options.path = '/peggy/write?board=1&x=1&y=10&text=' + encodeURIComponent(lastPlayedText);
// options.path = '/peggy/write?board=1&x=1&y=11&text=' + encodeURIComponent(doublePrevText);
