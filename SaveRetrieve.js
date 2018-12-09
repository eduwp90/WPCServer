var request = require('./utiles');
var Parse = require('parse/node');
const moment = require("moment");
const tz = require('moment-timezone');

Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse';



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
       
};

exports.actualizarJActivasESP = function(jornada){
    var GameScore = Parse.Object.extend("config");
    var query = new Parse.Query(GameScore);
    query.first()
        .then( async (object) => {
            // The object was retrieved successfully.
            await object.set("jornadas_activasJSON", jornada);
            object.save();
            //console.log('ACT.JORNADAS ACTIVAS! Done');
        }, (error) => {
            // The object was not retrieved successfully.
            console.log("Error: " + error.code + " " + error.message);
        });
       
};

exports.actualizarFechaPartidoESP = function(id,liga,fhora){
    
    var GameScore = Parse.Object.extend("T1819");
    var query = new Parse.Query(GameScore);
    query.equalTo("liga", liga);
    query.equalTo("id1", id);
    query.first()
        .then( async (object) => {
            // The object was retrieved successfully.
            if(object != null){
                //console.log(object+ " "+ id);
                if(object.get('fhora').getTime()==fhora.getTime()){
                    //console.log('La fhora del partido '+id+ ' ya era la correcta');
                }
                else{
                   await object.set("fhora", fhora);
                    object.save();
                    console.log('La fhora del partido '+id+ ' se ha actualizado'); 
                }
            }else{
                console.log("ACTRUALIZAR FHORA:fallo al recuperar partido de parse "+ id);
            }
            
        }, (error) => {
            // The object was not retrieved successfully.
            console.log("Error: " + error.code + " " + error.message);
        });
       
};


exports.recuperarPartidosActivosESP = async function(){
    
    let datos = [];
    moment().utcOffset(60);
    var ahora = moment().toDate();
    //console.log(ahora);
    var en7dias = moment().add(7, 'days').toDate();
    //console.log(en7dias);
    
    const GameScore = Parse.Object.extend("T1819");
    const query = new Parse.Query(GameScore);
    query.greaterThanOrEqualTo("fhora", ahora);
    query.lessThanOrEqualTo("fhora", en7dias);
    const object = await query.find();
    // Do something with the returned Parse.Object values
    if(object != null){
        console.log("RETRIEVE PROXIMOS PARTIDOS: recuperados "+object.length+" partidos");
        
        for (var i = 0; i < object.length; i++) {
            let datospartido = {"id":"", "url":"", "liga":"", "fecha":new Date(), "jornada":1};
            //console.log(object[i].get('id1'));
            //console.log(object[i].get('fhora'));
            //Do something
            datospartido.id = object[i].get('id1');
            datospartido.url = object[i].get('url');
            datospartido.liga = object[i].get('liga');
            datospartido.fecha = object[i].get('fhora');
            datospartido.jornada = object[i].get('jornada');
            await datos.push(datospartido);
            
        }
        //await console.log(datos);
        
    }else{
        console.log("RETRIEVE PROXIMOS PARTIDOS: fallo al recuperar partidos");
    }
    return datos;
    
};

exports.actualizarPartidoESP = function(partidoJSONstring){
    
    let datos = JSON.parse(partidoJSONstring);
    var GameScore = Parse.Object.extend("T1819");
    var query = new Parse.Query(GameScore);
    query.equalTo("liga", datos.liga);
    query.equalTo("id1", datos.id);
    query.first()
        .then( async (object) => {
            // The object was retrieved successfully.
            if(object != null){
                //console.log(object+ " "+ id);
                await object.set("goll", parseInt(datos.goll));
                await object.set("golv", parseInt(datos.golv));
                await object.set("goleadoresl", datos.localJug);
                await object.set("goleadoresv", datos.visitanteJug);
                await object.set("periodo", datos.periodo);
                object.save();
                console.log('Los datos del partido '+datos.id+ ' se han actualizado'); 
                
            }else{
                console.log("ACTRUALIZAR PARTIDO:fallo al recuperar partido de parse "+ datos.id);
            }
            
        }, (error) => {
            // The object was not retrieved successfully.
            console.log("Error: " + error.code + " " + error.message);
        });
       
};
