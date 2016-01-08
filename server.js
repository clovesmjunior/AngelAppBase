var path = require('path');
var fs = require('fs'); // use to test load mock angel
var express = require('express');
var bodyParser = require('body-parser');
var Appbase = require('appbase-js');
var CronJob = require('cron').CronJob;
var SgTransport = require('nodemailer-sendgrid-transport');
var Map = require("collections/map");
var angel = require('angel.co-promise')('dbb9c3878a9ddbe0fe76fb2e7ae13c1bc5b95ebd0421b2a2', 'cea006ffd06f4b390f2107d7f323c39690d1da9be919bbc7');
angel.setAccessToken("b8a93c9ae8a66c16f77c734a2eb0f423d7f906964948087c");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var SENDGRID_API_KEY = "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";
var MAIL_FROM = "angelappbase@gmail.com";

var sendgrid   = require('sendgrid')(SENDGRID_API_KEY);

var KEY_ANGEL_TOKEN = 'angel_key_token';
var MOCK_FILE = path.join(__dirname, 'angelMock.json'); // Mock data angel list
var TAG_LOCATION = 'LocationTag';
var TAG_ROLE = 'RoleTag';

var app = express();
var nameApp = 'AngelAppBaseEx'; // Name app for created in appbase.io
var userName = "CoJNVLrNB"; // Your credential username
var passwd = "f449631d-30e9-47bd-8589-16cfbb3c06a0"; //Your credential password
var countryCodesSet=[];
countryCodesSet['1622'] = '1622';
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

function sendEmail(jobText,email)
{
    var email      = new sendgrid.Email();
    email.addTo(email);
    email.setFrom(MAIL_FROM);
    email.setSubject("[AngelAppBase appbase.io] New job recently registered");
    email.setText("This job may be of interest: "+jobText);
    email.setHtml("<strong>This job may be of interest: </strong> %how%");
    email.addSubstitution("%how%", jobText);
    email.addHeader('X-Sent-Using', 'SendGrid-API');
    email.addHeader('X-Transport', 'web');
    //email.addFile({path: './gif.gif', filename: 'owl.gif'});

    sendgrid.send(email, function(err, json) {
      if (err) { 
        return console.error(err); 
      }
      console.log(json);
    });
}

function createObjToAppBase(obj, countryCode){
  

  var objCreated = {           
      type: "job",
      id: obj.id,
      body: {
        title: obj.title,
        country_code: countryCode,
        created_at: obj.created_at,
        updated_at: obj.updated_at,
        salary_min: obj.salary_min,
        salary_max: obj.salary_max,
        job_type: obj.job_type,
        angellist_url: obj.angellist_url,
        location: getRefTypeTag(obj, TAG_LOCATION).toLowerCase(),
        role_tag: getRefTypeTag(obj, TAG_ROLE),
        tags:obj.tags              
      }
  };
  return objCreated;
}

// Run in determineted time for search jobs in angel-list
// Run every five minutes
new CronJob('*/1 * * * *', function() {   
      console.log(angel.tags.parents());
      Object.keys(countryCodesSet).forEach(function (countryCode) {
        if(countryCode!=null && countryCode!=""){
          runInsertJobsInAppBase(countryCode);
        }
      });    
  }, function () {
    /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);

function broadcastForEmail(msg){
  appbaseRef.search({
        type: 'email',
        body: {
            query: {
                match_all : {}
            }
        }
    }).on('data', function(opr, err) {          
      sendEmail(msg,email)     
      console.log(opr);
    }).on('error', function(err) {
      console.log("caught a stream error", err);
    }); 
}

function runInsertJobsInAppBase(countryCode){
      angel.jobs.tag(countryCode).then(function(body) {
          //console.log(body);
          var jsonList = body.jobs;
          //var jsonList = bodyJSON.parse(data);

          var obj;
          for(i=0;i<jsonList.length; i++){
            obj =  jsonList[i];

            appbaseRef.index(createObjToAppBase(obj, countryCode)).on('data', function(res) {
                if(res.created){
                  console.log(res);
                  broadcastForEmail(obj.title);                  
                }            
            }).on('error', function(err) {
                console.log(err);
            });
          }
    
      }).catch(function(error){
          console.log(error);
      });
}

function getRefTypeTag(obj, typeTag){
  var displayName = "";
  obj.tags.forEach(function(tag){
    if(tag.tag_type == typeTag){     
        displayName = tag.display_name;
      return;      
    }
  });
  return displayName;
}

app.post('/api/newmail', function(req, res) {
    res.setHeader('Cache-Control', 'no-cache');
    body = {msg: ""};
    var mail = req.body.email.toLowerCase();
    var objCreated = {           
      type: "email",
      id: mail,
      body: {
        email: mail            
      }
    };

     appbaseRef.index(objCreated).on('data', function(res) {
        if(res.created){
          console.log(res);
          body = {msg: "Email registered successfully"};
        }else{
          body = {msg: "E-mail is already in our database!"};
        }   
        broadcastForEmail("Tste");         
    }).on('error', function(err) {
        console.log(err);
        body = {msg: "Error registering email."};
    });
    res.setHeader('Cache-Control', 'no-cache');
    res.json(body);
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

app.get('/auth/autenticate', function(req, res) {
    //console.log(angel.auth.getAuthorizeUrl());
    res.redirect(angel.auth.getAuthorizeUrl());
});

app.get('/auth/autenticate/callback', function(req, res) {
    angel.auth.requestAccessToken(req.query.code, function(err, response) {
        if ( err )
            return console.error(err); //Something went wrong.

        // I got the Token. Ain't you?
        app.set(KEY_ANGEL_TOKEN, response.access_token); // Persist it anywhere.
        res.redirect('/'); // Go back to the homepage.
    });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
