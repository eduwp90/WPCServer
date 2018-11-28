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
                      {"url":"693435/calendar/1782173/", "urljornada":9622408, "nombre":"DHF", "numjornadas": 18},
                      {"url":"698931/calendar/1789530/", "urljornada":9674865, "nombre":"PDM", "numjornadas": 22},
                      {"url":"696708/calendar/1785001/", "urljornada":9636114, "nombre":"PDF", "numjornadas": 18},
                      {"url":"703924/calendar/1804510/", "urljornada":9730530, "nombre":"SDM", "numjornadas": 22}
                   ];

(async function() { // IIFE to give access to async/await
const db = await MongoClient.connect(mongoConnectionString);
const agenda = new Agenda.mongo(db);



agenda.define('actualizarJActivas', async (job) => {
  console.log('ACT.JORNADAS ACTIVAS! la hora es ', moment().tz("Europe/Madrid").format().toString());
  Save.actualizarJActivasESP(await scrapeDatosJornadaActiva());
  console.log('ACT.JORNADAS ACTIVAS! FIN ', moment().tz("Europe/Madrid").format().toString());
  
  
});

agenda.define('actualizarFechas', (job) => {
  console.log('ACT.FECHAS! la hora es ', moment().tz("Europe/Madrid").format().toString());
  scrapeFechas();
  console.log('ACT.FECHAS! FIN ', moment().tz("Europe/Madrid").format().toString());
  
  
});
agenda.define('programarProxPartidos', async (job) => {
  console.log('programarProxPartidos! la hora es ', moment().tz("Europe/Madrid").format().toString());
  let partidos = await Save.recuperarPartidosActivosESP();
  console.log(partidos);
  if (partidos != null){
    
    for (var i = 0; i < partidos.length; i++) {
      let nombrejob = partidos[i].id+" - "+partidos[i].liga;
      
    }
    
  }
  
  console.log('programarProxPartidos FIN', moment().tz("Europe/Madrid").format().toString());
  
  
});

agenda.define('C. WATERPOLO CASTELLÓ - C.D. WATERPOLO TURIA - SDM', async (job) => {
  
  console.log('programarProxPartidos FIN', moment().tz("Europe/Madrid").format().toString());
  job.repeatEvery('24 hours');
  job.save();
  
});



  
    
  await agenda.start();
  
  await agenda.every('0 3 * * *', 'actualizarJActivas');
  await agenda.every('30 3 * * *', 'actualizarFechas');
  //await agenda.now('programarProxPartidos');
  
  
})();

async function scrapeFechas(){
  for (var i = 0; i < datosligas.length; i++){
    for (var k = 0; k < datosligas[i].numjornadas; k++){
      
      let url = 'https://rfen.es/es/tournament/'+datosligas[i].url+(datosligas[i].urljornada+k)
  
      await rp(url)
          .then(async function (html) {
            let $ = await cheerio.load(html);
            await $('.rowlink tr').each(async (j,tr) => {
              let local = await $(tr).find('.colstyle-equipo').find('.ellipsis').first().text().trim();
              let visitante = await $(tr).find('.colstyle-equipo').find('.ellipsis').eq(1).text().trim();
              let fechaText = await $(tr).find('.colstyle-fecha').text().replace(/\s\s+/g, '').slice(5, 21).replace(/[^0-9/: ]/g, '').trim();
              fechaText = moment(fechaText, 'DD/MM/YYYY HH:mm').toDate();
              let id = local+" - "+visitante;
              //console.log(url);
              //console.log(local);
              //console.log(visitante);
              if (id != null || fechaText != null) {
                await Save.actualizarFechaPartidoESP(id, datosligas[i].nombre, fechaText);
              }
            });
          })
          .catch(function (err) {
              console.log('NO SE HA ENCONTRADO LA PAGINA - '+url);
              console.error(err);
          });
    }
  }
}

async function test1(){
  
  
  
};

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

async function scrapeDatosJornadaActiva() {
  
  //Preparar JSON de retorno
  let jornadaActivaJSON = await [
                      {"DHM":1}, 
                      {"DHF":1},
                      {"PDM":1},
                      {"PDF":1},
                      {"SDM":1}
                   ];
                   
  for (var j = 0; j < jornadaActivaJSON.length; j++) { 
    let url = 'https://rfen.es/es/tournament/'+datosligas[j].url.slice(0,6); 
    
    await rp(url)
      .then(async function (html) {
        let $ = await cheerio.load(html);
        await $('.padd.half-padd-top.half-padd-bottom.relative.text-center').find('a').remove();
        let jornadaNum = await $('.padd.half-padd-top.half-padd-bottom.relative.text-center').text().trim().replace("Jornada ","");
        let jsonjor = await { [datosligas[j].nombre] : parseInt(jornadaNum)};
        await jornadaActivaJSON.splice(j,1,jsonjor);
        
        
        //await console.log(jornadaActivaJSON);
        return jornadaActivaJSON;
        
      })
      .catch(function (err) {
          console.log(err);
      });
     
  }
  return jornadaActivaJSON;
  
}