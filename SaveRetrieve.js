var request = require('./utiles');
var Xray = require('x-ray');
var Parse = require('parse/node');
const moment = require("moment");

Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'


var xray = new Xray().driver(request('Windows-1252'));


exports.savePartidoActivoESP = function(partidoJSON, liga, jornada,  callback){
    console.log("GUARDANDO DATOS");
    var GS = Parse.Object.extend(liga);
    
    
    var gameScore = new GS();
    
        
    gameScore.save({
        
    jornada: parseInt(jornada),
    fhora: moment(partidoJSON.fhora, 'DD/MM/YYYY HH:mm').toDate() ,
    local: partidoJSON.local,
    visitante: partidoJSON.visitante,
    goll: parseInt(partidoJSON.goll),
    golv: parseInt(partidoJSON.golv),
    url: partidoJSON.url,
    goleadoresl: partidoJSON.localJug,
    goleadoresv: partidoJSON.visitanteJug,
    liga: liga,
    id: partidoJSON.id,
    
    }, {
    success: function(gameScore) {
       console.log("The object was saved successfully.",gameScore);
    },
    error: function(gameScore, error) {
        console.log("The save failed.",error);
        // error is a Parse.Error with an error code and message.
    }
    });
    
    
       
}


