// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var cors = require('cors');
var Agenda = require('agenda');
var Agendash = require('agendash');
const mongoConnectionString = 'mongodb://heroku_253vdv8v:4m9qab9skph076ov6sujdjgoir@ds019488.mlab.com:19488/heroku_253vdv8v';




var databaseUri = process.env.MONGOLAB_URI || process.env.DATABASE_URI;


if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_253vdv8v:4m9qab9skph076ov6sujdjgoir@ds019488.mlab.com:19488/heroku_253vdv8v',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '' , //Add your master key here. Keep it secret! 
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey
  verbose: true,

push: {
    android: {
      senderId: '784042569697', // The Sender ID of GCM
      apiKey: 'AIzaSyCgFPrx6ZeqZjcMrBRVQoB7PPeW9JudLM0' // The Server API Key of GCM
    }
    
  }
});



var app = express();
app.use(cors());


// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

const agenda = new Agenda({db: {address: mongoConnectionString}});
app.use('/dash', Agendash(agenda));

var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

