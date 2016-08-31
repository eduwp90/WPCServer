var request = require('./utiles');
var Xray = require('x-ray');
var Parse = require('parse/node');

Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'
var xray = new Xray().driver(request('Windows-1252'));


exports.savePartidoActivoESP = function(fhora, local, visitante, goll, golv, liga, url, goleadoresl, goleadoresv, callback){
    console.log("GUARDANDO DATOS");
    var GameScore = Parse.Object.extend("Activos");
    
    var gameScore = new GameScore();
        
    gameScore.save({
    fhora: fhora,
    local: local,
    visitante: visitante,
    goll: goll,
    golv: golv,
    url: url,
    goleadoresl:goleadoresl,
    goleadoresv:goleadoresv,
    liga:liga
    }, {
    success: function(gameScore) {
       console.log("The object was saved successfully.",fhora+" "+local+" "+goll+" - "+golv+" "+visitante);
    },
    error: function(gameScore, error) {
        console.log("The save failed.",error);
        // error is a Parse.Error with an error code and message.
    }
    });
    
    
       
}


xray('http://rfen.es/publicacion/waterpolo/asp/ficha.asp?cod=15651', {
  equipos: ['td.contenido2[width="40%"]'],
  resultado: ['td.contenido2[valign="TOP"]'],
  jugadores: ['td.titulo2[align="left"]'],
  datos: ['td.titulo2[align="center"]:not([width="3%"])']
  
})(function(err, obj) {
  console.log(JSON.stringify(obj,null,2));
})
