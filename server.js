var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var appBase = require('appbasejs');
var app = express();
var userName = "CoJNVLrNB";
var passwd = "f449631d-30e9-47bd-8589-16cfbb3c06a0";

var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'AngelAppBaseEx',
  username: userName,
  password: passwd
});

app.set('port', (process.env.PORT || 3001));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/angellist', function(req, res) {
  
});

app.post('/api/angelreq', function(req, res) {
  
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
