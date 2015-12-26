var path = require('path');
var fs = require('fs'); // use to test load mock angel
var express = require('express');
var bodyParser = require('body-parser');
var Appbase = require('appbase-js');
var Nodemailer = require("nodemailer");
var CronJob = require('cron').CronJob;
var SgTransport = require('nodemailer-sendgrid-transport');
var Map = require("collections/map");
var accessToken = "b8a93c9ae8a66c16f77c734a2eb0f423d7f906964948087c";
var angel = require('angel.co-promise')('dbb9c3878a9ddbe0fe76fb2e7ae13c1bc5b95ebd0421b2a2', 'cea006ffd06f4b390f2107d7f323c39690d1da9be919bbc7');
angel.setAccessToken(accessToken);
var http = require('http').Server(app);
var io = require('socket.io')(http);

var KEY_ANGEL_TOKEN = 'angel_key_token';
var MOCK_FILE = path.join(__dirname, 'angelMock.json'); // Mock data angel list
var TAG_LOCATION = 'LocationTag';
var TAG_ROLE = 'RoleTag';

var app = express();
var nameApp = 'AngelAppBaseEx'; // Name app for created in appbase.io
var userName = "CoJNVLrNB"; // Your credential username
var passwd = "f449631d-30e9-47bd-8589-16cfbb3c06a0"; //Your credential password
var credentials = {
  auth: {
    api_user: 'yashshah',
    api_key: 'appbase12'
  }
}
var countryCodesSet=[];
//countryCodesSet['1622'] = '1622';
var trsnp = Nodemailer.createTransport(SgTransport(credentials));

var ipListen = "127.0.0.1";
http.listen(9595, ipListen);

//connection websocket
io.on('connection', function(socket){
  //console.log(socket);
  socket.on('job_list', function(msg){
    
  });
});

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
    var msgToSend = "This job may be of interest: "+jobText;
    var mail = {
        from: "appbase.io",
        to: email,
        subject: "New job recently registered",
        text: msgToSend,
        html: "<b>"+msgToSend+"</b>"
    }
    console.log(mail);
    trsnp.sendMail(mail, function(error, info){
      if(error){
        return console.log(error);
      }
      console.log('Response: ' + info.response);
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
    /*fs.readFile(MOCK_FILE, function(err, data) {
      if (err) {
        console.error(err);
        process.exit(1);
      }*/
      Object.keys(countryCodesSet).forEach(function (countryCode) {
        if(countryCode!=null && countryCode!=""){
          runInsertJobsInAppBase(countryCode);
        }
      });
    /*});*/
  }, function () {
    /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  'America/Los_Angeles' /* Time zone of this job. */
);

function runInsertJobsInAppBase(countryCode){
      angel.jobs.tag(countryCode).then(function(body) {
          console.log(body);
          var jsonList = body.jobs;
          //var jsonList = bodyJSON.parse(data);

          var obj;
          for(i=0;i<jsonList.length; i++){
            obj =  jsonList[i];

            appbaseRef.index(createObjToAppBase(obj, countryCode)).on('data', function(res) {
                if(res.created){
                  console.log(res);
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

app.get('/api/list', function(req, res) {
    var jobsList = new Map();
    var country = req.query.country.trim();
    var city = req.query.city.toLowerCase();
    var email = req.query.email.toLowerCase();
   
    if(!isNaN(country)){
       countryCodesSet[country] = country;
    }
    /*appbaseRef.searchStream({
        type: 'job',
        body: {
            query: {
                filtered: {
                  filter : {
                    terms : { 
                      location : [city]
                    }
                  }
                }
              }
              query: {
                  match_all: {}
              }
            }
    })*/
    appbaseRef.search({
        type: 'job',
        body: {
            query: {
                match : { 
                      location : city
                    }
            }
        }
    }).on('data', function(opr, err) {
      
      //console.log(opr);
      jobsList.set(opr._id, opr);
      //WebSocket to sinalize new job
      io.emit('job_list', JSON.stringify(jobsList.values()));      
    }).on('error', function(err) {
      console.log("caught a stream error", err);
    }); 
    res.json([]);   
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
