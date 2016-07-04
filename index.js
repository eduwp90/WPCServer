// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var cors = require('cors');
var Agenda = require('agenda');



var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;


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
});
var agenda = new Agenda(databaseUri);

var app = express();
app.use(cors());


// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a web site.');
});

var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

agenda.define('greet the world', function(job, done) {
  console.log(job.attrs.data.time, 'hello world!');
  done();
});

agenda.schedule('every 10 seconds', 'greet the world', {time: new Date()});
agenda.start();

console.log('Wait 10 seconds...');