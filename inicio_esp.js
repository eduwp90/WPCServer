//const utiles = require('./utiles');
const Parse = require('parse/node');
const rp = require('request-promise');
const request = require('request');
const cheerio = require('cheerio');
const Save = require('./SaveRetrieve.js');
const moment = require('moment-timezone');
const storage = require('node-persist');

Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq","KHbvuLSzmseM7U4QKcNP9bBsYXxbzDsiPVAJ5uhl");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'

//ARRAY CON LAS WEB DE LAS LIGAS RFEN
const ligas = ["693506/calendar/1783704/", "693435/calendar/1782173/", "698931/calendar/1789530/", "696708/calendar/1785001/", "703924/calendar/1804510/"];
const jornadas = [9636059, 9622408, 9674865, 9636114, 9730530];


var url = 'https://rfen.es/es/tournament/'+ligas[0]+(jornadas[0]+10);





  
rp(url)
.then(async (html) => {
  
  const $ = cheerio.load(html);
  
  //preparar liga JSON
  var datosJSON = { "jornada":"", "partidos":[]};
  
  //Scrape jornada numero
  var jornadasText = $('.clearfix').find('h2').first().text();
  jornadasText = jornadasText.slice(8, 10).replace(" ", "");
  datosJSON.jornada = jornadasText;
  let urls = [];
  
  $('.rowlink tr').each((i, tr) => {
    
    let urlPartido = $(tr).find('.colstyle-equipo a').attr('href');
    //Añadir datos de url
    urls.push(urlPartido);
    
  });
  
  await Promise.all(urls.map(async num => {
    let partidoJSON = await scrapeDatosPartido(jornadasText,num);
    datosJSON.partidos.push(partidoJSON);
    Save.savePartidoActivoESP(partidoJSON, ligas[0], jornadasText);
  }))
  
  console.log(datosJSON);
  
  
})

.catch(function (err) {
    console.log(err);
});
    
  
      
      
    


function scrapeDatosPartido(jornada,url) {
  
  //Preparar JSON de retorno
  let datosPartidoJSON = { "id":"", "jornada":jornada, "fhora":"", "local":"", "visitante":"", "goll":"", "golv":"", "url":url, "localJug":[], "visitanteJug":[]};
  
  return rp(url)
    .then(function (html) {
      let $ = cheerio.load(html);
      
      let id = $('h1').text();
      let equipos = id.split(" — ");
      datosPartidoJSON.local = equipos[0];
      datosPartidoJSON.visitante = equipos[1];
      datosPartidoJSON.id = id;
      
      let localg = $('#match-summary div span').eq(2).text();
      let visitanteg = $('#match-summary div span').eq(6).text();
      
      if (localg.length > 0){
        
        datosPartidoJSON.goll = localg;
        datosPartidoJSON.golv = visitanteg;
        datosPartidoJSON.fhora = "Finalizado";
        
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
        let hora = $('.auto-row').find('.col').eq(0).text().replace(/\s\s+/g, '').trim().slice(4, 9);
        let fecha = $('.auto-row').find('.col').eq(1).text().replace(/\s\s+/g, '').trim().slice(10, 20);
        datosPartidoJSON.fhora = fecha +" " +hora; 
        datosPartidoJSON.goll = 0;
        datosPartidoJSON.golv = 0;
      }
      
      
      
      
      //console.log(datosPartidoJSON);
      return datosPartidoJSON;
      
    })
    .catch(function (err) {
        console.log(err);
    });
  

}

