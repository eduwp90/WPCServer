//const utiles = require('./utiles');
require('dotenv').config()
const Parse = require('parse/node');
const request = require('request');
const cheerio = require('cheerio');
const Save = require('./SaveRetrieve.js');
const tz = require('moment-timezone');
const Agenda = require('agenda');
const moment = require('moment');
const Utiles = require("./utiles.js");
const { MongoClient } = require('mongodb');
const rp = require('axios').default;


Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY,process.env.MASTER_KEY);
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse';
var databaseUri = process.env.DB_URI || process.env.DATABASE_URI;
if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

const mongoConnectionString = databaseUri;

//ARRAY CON LAS WEB DE LAS LIGAS RFEN
const datosligas = Utiles.datosligas;
console.log(datosligas);