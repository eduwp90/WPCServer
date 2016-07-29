var Parse = require('parse/node');
Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'


exports.savePartidoActivoESP = function(fhora, local, visitante, goll, golv, liga, url, goleadoresl, goleadoresv, callback){
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
