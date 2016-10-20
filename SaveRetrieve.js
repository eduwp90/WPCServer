var request = require('./utiles');
var Xray = require('x-ray');
var Parse = require('parse/node');

Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq","KHbvuLSzmseM7U4QKcNP9bBsYXxbzDsiPVAJ5uhl");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'
// ACL to restrict write to user, and public read access
var custom_acl = new Parse.ACL(request().user);
// give write access to the current user
custom_acl.setPublicWriteAccess(true);
// give public read access
custom_acl.setPublicReadAccess(true);

var xray = new Xray().driver(request('Windows-1252'));


exports.savePartidoActivoESP = function(fhora, local, visitante, goll, golv, liga, url, goleadoresl, goleadoresv, id, JsonRFEN,  callback){
    console.log("GUARDANDO DATOS");
    var GameScore = Parse.Object.extend("Activos");
    
    
    var gameScore = new GameScore();
    //gameScore.setACL(custom_acl);
        
    gameScore.save({
    
    fhora: fhora,
    local: local,
    visitante: visitante,
    goll: goll,
    golv: golv,
    url: url,
    goleadoresl:goleadoresl,
    goleadoresv:goleadoresv,
    liga:liga,
    id:id,
    JSONrfen:JsonRFEN
    },{useMasterKey: true}, {
    success: function(gameScore) {
       console.log("The object was saved successfully.",fhora+" "+local+" "+goll+" - "+golv+" "+visitante);
    },
    error: function(gameScore, error) {
        console.log("The save failed.",error);
        // error is a Parse.Error with an error code and message.
    }
    });
    
    
       
}


