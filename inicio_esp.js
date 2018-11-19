//const utiles = require('./utiles');
const Parse = require('parse/node');
const rp = require('request-promise');
const request = require('request');
const cheerio = require('cheerio');
const Save = require('./SaveRetrieve.js');
const tz = require('moment-timezone');
const Agenda = require('agenda');
const moment = require('moment');
const { MongoClient } = require('mongodb');


Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq","KHbvuLSzmseM7U4QKcNP9bBsYXxbzDsiPVAJ5uhl");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse';
const mongoConnectionString = 'mongodb://heroku_253vdv8v:4m9qab9skph076ov6sujdjgoir@ds019488.mlab.com:19488/heroku_253vdv8v';

//ARRAY CON LAS WEB DE LAS LIGAS RFEN
const datosligas = [
                      {"url":"693506/calendar/1783704/", "urljornada":9636059, "nombre":"DHM", "numjornadas": 22}, 
                      {"url":"693435/calendar/1782173/", "urljornada":9622408, "nombre":"DHF", "numjornadas": 22},
                      {"url":"698931/calendar/1789530/", "urljornada":9674865, "nombre":"PDM", "numjornadas": 18},
                      {"url":"696708/calendar/1785001/", "urljornada":9636114, "nombre":"PDF", "numjornadas": 18},
                      {"url":"703924/calendar/1804510/", "urljornada":9730530, "nombre":"SDM", "numjornadas": 22}
                   ];






const agenda = new Agenda({db: {address: mongoConnectionString, useNewUrlParser: true }});



agenda.define('hello', (job, done) => {
  console.log('Hello! la hora es ', moment().toString());
});

(async function() { // IIFE to give access to async/await
  
  await agenda.start();
  
  await agenda.every('15 minutes', 'hello');
})();




function scrapeDatosPartido(jornada,url,fecha) {
  
  //Preparar JSON de retorno
  let datosPartidoJSON = { "id":"", "jornada":jornada, "fhora":fecha, "periodo":"", "local":"", "visitante":"", "goll":"", "golv":"", "url":url, "localJug":[], "visitanteJug":[]};
  
  return rp(url)
    .then(function (html) {
      let $ = cheerio.load(html);
      
      let id = $('h1').text().replace(" — "," - ");
      let equipos = id.split(" - ");
      datosPartidoJSON.local = equipos[0];
      datosPartidoJSON.visitante = equipos[1];
      datosPartidoJSON.id = id;
      
      let localg = $('#match-summary div span').eq(2).text();
      let visitanteg = $('#match-summary div span').eq(6).text();
      
      if (localg.length > 0){
        
        datosPartidoJSON.goll = localg;
        datosPartidoJSON.golv = visitanteg;
        datosPartidoJSON.periodo = 5;
        
        //DAtos de jugadores
        $('.match-data').find('.rowlink').each((i,table) => {
           $(table).find('tr').each((j, tr) => {
            //Preparar JSON de jugador
            let jugadoresPartidoJSON = { "nombre":"", "GT":"", "IGD":"", "SUP":"", "GPEN":"", "EXP":"", "PEN":""};
            
            jugadoresPartidoJSON.nombre = $(tr).find('.colstyle-nombre').first().text().trim();
            jugadoresPartidoJSON.GT = $(tr).find('.colstyle-goles').first().text().trim();
            jugadoresPartidoJSON.IGD = $(tr).find('.colstyle-goles-igualdad').first().text().trim();
            jugadoresPartidoJSON.SUP = $(tr).find('.colstyle-goles-superior').first().text().trim();
            jugadoresPartidoJSON.GPEN = $(tr).find('.colstyle-goles-penalti').first().text().trim();
            jugadoresPartidoJSON.PEN = $(tr).find('.colstyle-faltas-por-penalti').first().text().trim();
            jugadoresPartidoJSON.EXP = $(tr).find('.colstyle-expulsion').first().text().trim();
            
            
            //Elegir donde meter datos
            if (i==0) {
              datosPartidoJSON.localJug.push(jugadoresPartidoJSON);
            }
            else
            {
              datosPartidoJSON.visitanteJug.push(jugadoresPartidoJSON);
            }
          
          });
          
        });
        
      }
      else
      {
        datosPartidoJSON.periodo = 0;
        datosPartidoJSON.goll = 0;
        datosPartidoJSON.golv = 0;
      }
      
      
      
      //console.log(datosPartidoJSON.id);
      //console.log(datosPartidoJSON.fhora);
      return datosPartidoJSON;
      
    })
    .catch(function (err) {
        console.log(err);
    });
  

}

