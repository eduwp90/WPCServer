//const utiles = require('./utiles');
const Parse = require('parse/node');
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


var url = 'https://rfen.es/es/tournament/'+ligas[0]+(jornadas[0]+1);



request(url, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    const $ = cheerio.load(html);
    
    //preparar liga JSON
    var datosJSON = { "jornada":"", "partidos":[]};
    
    //Scrape jornada numero
    var jornadasText = $('.clearfix').find('h2').first().text();
    jornadasText = jornadasText.slice(8, 10).replace(" ", "");
    datosJSON.jornada = jornadasText;
    
    $('.rowlink tr').each((i, tr) => {
      
      //preparar partido JSON
      let partidoJSON = { "fhora":"", "local":"", "visitante":"", "goll":"", "golv":"", "url":"", "JsonRFEN":[]};
      
      //Capturar datos
      let equiposText = $(tr).find('.colstyle-equipo').find('.ellipsis');
      let fechaText = $(tr).find('.colstyle-fecha').text().replace(/\s\s+/g, '').slice(5, 21);
      let resultadosText = $(tr).find('.partial-result.strong');
      let urlPartido = $(tr).find('.colstyle-equipo a').attr('href');
      
      //Añadir a json object
      partidoJSON.local = equiposText.first().text();
      partidoJSON.visitante = equiposText.last().text();
      partidoJSON.url = urlPartido.trim();
      
      //Variar segun el partido este en marcha o no
      if (resultadosText.first().text().length > 0){
        partidoJSON.fhora = "Finalizado";
        partidoJSON.goll = resultadosText.first().text();
        partidoJSON.golv = resultadosText.last().text();
        scrapeDatosPartido(urlPartido.trim());
        
      }else{
        partidoJSON.fhora = fechaText;
        partidoJSON.goll = 0;
        partidoJSON.golv = 0;
      }
      
      //Añadir datos de partido a datosJSON
      datosJSON.partidos.push(partidoJSON);
      
    });

    //console.log(datosJSON);
    
  }
  else
  {
    console.log(error);
  }
});

function scrapeDatosPartido(url) {
  //Preparar JSON de retorno
  let datosPartidoJSON = { "fhora":"", "local":"", "visitante":"", "goll":"", "golv":"", "url":url, "localJug":[], "visitanteJug":[]};
  
  //Request de partido
  request(url, (error, response, html) => {
  if (!error && response.statusCode == 200) {
    let $ = cheerio.load(html);
    
    let equipos = $('h1').text().split(" — ");
    datosPartidoJSON.local = equipos[0];
    datosPartidoJSON.visitante = equipos[1];
    
    
    let localg = $('#match-summary div span').eq(2).text();
    let visitanteg = $('#match-summary div span').eq(5).text();
    datosPartidoJSON.goll = localg;
    datosPartidoJSON.golv = visitanteg;
    
    
    
    console.log(datosPartidoJSON);
    
    
    
    //Preparar JSON de jugador
    let jugadoresPartidoJSON = { "nombre":"", "GT":"", "IGD":"", "SUP":"", "GPEN":"", "EXP":"", "PEN":""};
   
    
  }
  else
  {
    console.log(error);
  }
});

  
  
    return datosPartidoJSON;
}
