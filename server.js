var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var Appbase = require('appbase-js');
var angel = require('angel.co')('APP_ID', 'APP_SECRET');

var app = express();
var nameApp = 'AngelAppBaseEx'; // Name app for created in appbase.io
var userName = "CoJNVLrNB"; // Your credential username
var passwd = "f449631d-30e9-47bd-8589-16cfbb3c06a0"; //Your credential password

var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: nameApp,
  username: userName,
  password: passwd
});

app.set('port', (process.env.PORT || 3001));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/list', function(req, res) {
    angel.jobs.list().then(function(err, body) {
        console.log(body);
        res.setHeader('Cache-Control', 'no-cache');
        res.json(body);
    }).catch(function(error){
        console.log(error);
    });
  
});

app.post('/api/req', function(req, res) {
    var refId = req.body.job_id;
    angel.jobs.job(refId).then(function(err, body) {
        res.setHeader('Cache-Control', 'no-cache');
        res.json(body);
    }).catch(function(error){
        console.log(error);
    });
});

app.get('/auth/angel-list', function(req, res) {
    res.redirect(angel.getAuthorizeUrl());
});

app.get('/auth/angel-list/callback', function(req, res) {
    angel.auth.requestAccessToken(req.query.code, function(err, response) {
        if ( err )
            return console.error(err); //Something went wrong.

        // I got the Token. Ain't you?
        app.set('my_key_to_token', response.access_token); // Persist it anywhere.
        res.redirect('/'); // Go back to the homepage.
    });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
