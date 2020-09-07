// Example express application adding the parse-server module to expose Parse
// compatible API routes.
var path    = require("path");
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var cors = require('cors');
var Agenda = require('agenda');
var Agendash = require('agendash');
const mongoConnectionString = 'mongodb+srv://heroku_253vdv8v:4m9qab9skph076ov6sujdjgoir@cluster0.atsqf.mongodb.net/heroku_253vdv8v?retryWrites=true&w=majority';
var pushConfig = {};



var databaseUri = process.env.DB_URI || process.env.DATABASE_URI;


if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
if (process.env.FCM_API_KEY) {
   pushConfig['android'] = { 
   apiKey: process.env.FCM_API_KEY || ''};
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb+srv://heroku_253vdv8v:4m9qab9skph076ov6sujdjgoir@cluster0.atsqf.mongodb.net/heroku_253vdv8v?retryWrites=true&w=majority',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '' , //Add your master key here. Keep it secret! 
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey
  verbose: true,

push: pushConfig,
    
  
});

var trustProxy = true;



var app = express();
app.use(cors());


// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

const agenda = new Agenda({db: {address: mongoConnectionString}});
app.use('/agendash', Agendash(agenda));


var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

var httpServer = require('http').createServer(app);
httpServer.listen(4040);

app.get('/pp',function(req,res){
  res.sendFile(path.join(__dirname+'/pp.html'));
  //__dirname : It will resolve to your project folder.
});
