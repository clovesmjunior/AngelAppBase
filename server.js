var path = require('path');
var fs = require('fs'); // use to test load mock angel
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

var MOCK_FILE = path.join(__dirname, 'angelMock.json'); // Mock data angel list

app.set('port', (process.env.PORT || 3001));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


 


(function(y)
  {
        setInterval(function(){
          fs.readFile(MOCK_FILE, function(err, data) {
          if (err) {
            console.error(err);
            process.exit(1);
          }

          var jsonList = JSON.parse(data);

          var obj;
          for(i=0;i<jsonList.length; i++){
            obj =  jsonList[i];

            appbaseRef.index({           
              type: "job",
              id: obj.id,
              body: {
                title: obj.title,
                created_at: obj.created_at,
                updated_at: obj.updated_at,
                salary_min: obj.salary_min,
                salary_max: obj.salary_max,
                job_type: obj.job_type,
                angellist_url: obj.angellist_url               
              }
            }).on('data', function(res) {
                console.log(res);
            }).on('error', function(err) {
                console.log(err);
            });
          }
         });

         /* angel.jobs.list().then(function(err, body) {
              console.log(body);
              res.setHeader('Cache-Control', 'no-cache');
              res.json(body);
              
          }).catch(function(error){
              console.log(error);
          });*/
    }, 30000);
  })();

app.get('/api/list', function(req, res) {
    var jobsList = [];
    appbaseRef.searchStream({
      type: 'job',
      body: {
          query: {
              match_all: {}
          }
      }
    }).on('data', function(opr, err) {
      //console.log(opr);
      jobsList.push(opr);
      
    }).on('error', function(err) {
      console.log("caught a stream error", err);
    });

    res.json(jobsList);
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
