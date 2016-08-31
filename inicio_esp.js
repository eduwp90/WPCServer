var request = require('./utiles');
var Xray = require('x-ray');
var CronJob = require('cron').CronJob;
var Parse = require('parse/node');
var Save = require('./SaveRetrieve.js');
Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq","KHbvuLSzmseM7U4QKcNP9bBsYXxbzDsiPVAJ5uhl");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'




var xray = new Xray().driver(request('Windows-1252'));
var storage = require('node-persist');

//ARRAY CON LAS WEB DE LAS LIGAS RFEN
var ligas = [369, 370, 371, 372, 373];

storage.initSync();
console.log(storage.getItem('jornada_guardada'));

if(storage.getItemSync('jornada_guardada')==undefined){
    var jornada_guardada = {
    369: 'inicio',
    370: 'inicio',
    371: 'inicio',
    372: 'inicio',
    373: 'inicio'
};
}else{
    var jornada_guardada = storage.getItemSync('jornada_guardada');
}


//PROGRAMAR CHEQUEO JORNADA CADA 6H ('0 0 0-23/6 * * *')

var job = new CronJob({
  cronTime: '0 0 0-23/6 * * *',
  onTick: function() {
      console.log("Chequeo de ligas comenzando en ", new Date());
      
        
  },
  start: true,
  timeZone: 'Europe/Madrid'
});


//recuperar datos de todas las ligas españolas
for (var i = 0; i < ligas.length; i++) { 

        var liga=ligas[i];
 
        xray('http://rfen.es/publicacion/waterpolo/asp/resultados.asp?c='+liga,{
          jornada: 'h3',
          partidos: xray('body', [{
            hora:['td.titulo2[width="10%"]'],
            local: ['td.contenido2[align="right"]'],
            visitante: ['td.contenido2[align="left"]'],
            resultado: ['td.titulo2[width="5%"]'],
            link: ['td.titulo2[width="5%"] a @ href'],
            liga: 'select.combo[name="jornadas"] option:nth-child(2) @ value',
            
            
          }]) 
          
        })(function(err, result) {
            if (!err){
                console.log(JSON.stringify(result,null,2));
                 var goleadoresvacio = {};
                
                 
                 //CONSEGUIR ID DE LIGA
                var ligaact=result.partidos[0].liga;
                ligaact= ligaact.slice(ligaact.length-7,ligaact.length-4);
                console.log(ligaact);
                
                //PROCESAR DATOS (si la jornada ha cambiado):
                if(result.jornada!=jornada_guardada[ligaact]){
                    //ELIMINAR ENTRADAS ANTIGUAS DB
                    var GameScore = Parse.Object.extend("Activos");
                    var queryObject = new Parse.Query(GameScore);
                    queryObject.equalTo("liga", ligaact);
    
                    queryObject.find({
                    success: function (results) {
                        
                            
                            Parse.Object.destroyAll(results,{
                            success: function(myObject) {
                                console.log("deleted all objects de liga ",ligaact);
                                
                                //DATOS DE PARTIDOS
                                    for (var j = 0; j < result.partidos[0].hora.length; j++) { 
                                     
                                     var hora= result.partidos[0].hora[j];
                                     var local= result.partidos[0].local[j].trim();
                                     var visitante= result.partidos[0].visitante[j].trim();
                                     var resultadol= parseInt(result.partidos[0].resultado[(j*2)]);
                                     var resultadov= parseInt(result.partidos[0].resultado[(j*2)+1]);
                                     var url= result.partidos[0].link[j*2];
                                     console.log("partido "+j, hora+" "+local+" "+resultadol+" - "+resultadov+" "+visitante);
                                     
                                     //GUARDAR PARTIDO EN DB MONGO
                                     Save.savePartidoActivoESP(hora,local,visitante,resultadol,resultadov,ligaact,url,goleadoresvacio,goleadoresvacio);
                                         
                                    }
                                
                                //GUARDAR DATOS DE JORNADA EN SERVIDOR
                                jornada_guardada[ligaact] = result.jornada;
                                console.log("JG",jornada_guardada);
                                storage.removeItemSync('jornada_guardada');
                                storage.setItemSync('jornada_guardada',jornada_guardada);
                                    
                                ////////
                                
                                
                                },
                            error: function(myObject, error) {
                                // The delete failed.
                                // error is a Parse.Error with an error code and description.
                            }
                        
                            });
                        
                        
                        
                    },
                    error: function (error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                    });
                
                    
                }
                
                
            }else{
                console.log(err);
            };
          
        });
        
        
}



Parse.Push.send({
  channels: [ "Test" ],
  data: {
    alert: 'Test',
    
  }
}, {
  useMasterKey: true,
  success: function() {
    console.log("---------------push-----------------","OK");
  },
  error: function(error) {
    console.log("----------------push----------------",error);
  }
});