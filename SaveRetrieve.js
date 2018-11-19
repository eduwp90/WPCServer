var request = require('./utiles');
var Parse = require('parse/node');
const moment = require("moment");

Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'





exports.savePartidoActivoESP = function(partidoJSON, liga, jornada){
    console.log("GUARDANDO DATOS", partidoJSON.fhora);
    var GameScore = Parse.Object.extend("T1819");
    var gameScore = new GameScore();

    gameScore.save({
        liga: liga,
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
        id1: partidoJSON.id,
        periodo: partidoJSON.periodo,
        timeline: [{}]
    })
    .then((gameScore) => {
        console.log("The object was saved successfully.",gameScore);
    }, (error) => {
      // The save failed.
        console.log("The save failed.",error);
    });
        
    
       
}




