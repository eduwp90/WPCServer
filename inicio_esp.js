var request = require('./utiles');
var Xray = require('x-ray');
var CronJob = require('cron').CronJob;
var CronJobManager = require('cron-job-manager')
var Parse = require('parse/node');
var Save = require('./SaveRetrieve.js');
var moment = require('moment-timezone');
Parse.initialize("Jbp3tpUJvfm54iaYts9Q8bcmXR7EUMt3WUmgsQCD","onQyTfEwQdMcELPrkbf5F0aG6ltfgMsAD3KhtGMq","KHbvuLSzmseM7U4QKcNP9bBsYXxbzDsiPVAJ5uhl");
Parse.serverURL = 'https://wpcenter.herokuapp.com/parse'




var xray = new Xray().driver(request('Windows-1252'));
var storage = require('node-persist');

//ARRAY CON LAS WEB DE LAS LIGAS RFEN
var ligas = [396, 397, 398, 399, 400];

storage.initSync();
storage.clearSync();
console.log(storage.getItem('jornada_guardada'));

if(storage.getItemSync('jornada_guardada')==undefined){
    var jornada_guardada = {
    396: 'inicio',
    397: 'inicio',
    398: 'inicio',
    399: 'inicio',
    400: 'inicio'
};
}else{
    var jornada_guardada = storage.getItemSync('jornada_guardada');
}


//PROGRAMAR CHEQUEO JORNADA CADA 6H ('0 0 0-23/6 * * *')
var manager = new CronJobManager('check jornada activa', 
  '0 0 0-23/6 * * *', 
  function() {console.log("Chequeo de ligas comenzando en ", new Date())},
  {
    start: true, 
    timeZone:'Europe/Madrid'
  }
  );



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
                                     if(result.partidos[0].resultado[(j*2)]===""){
                                        var resultadol= 0;
                                        var resultadov= 0;
                                     }else{
                                        var resultadol= parseInt(result.partidos[0].resultado[(j*2)]);
                                        var resultadov= parseInt(result.partidos[0].resultado[(j*2)+1]); 
                                     }
                                     
                                     var url= result.partidos[0].link[j*2];
                                     var id= local.substr(0,6)+"-"+visitante.substr(0,6)+"-"+ligaact;
                                     console.log("partido "+j, hora+" "+local+" "+resultadol+" - "+resultadov+" "+visitante);
                                     
                                     //GUARDAR PARTIDO EN DB MONGO
                                     Save.savePartidoActivoESP(hora,local,visitante,resultadol,resultadov,ligaact,url,goleadoresvacio,goleadoresvacio,id,goleadoresvacio);
                                         
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

programarRefreshPartido("","","");
function programarRefreshPartido(idpartido, idliga, date){
    //MANIPULAR date PARA CREAR OBJETO DATE
    date= "11/09/2016 15:52"; //TEST
    var date1 = moment.tz(date,["DD-MM-YYYY HH:mm", "DD-MM-YYYY"], 'Europe/Madrid' );
    console.log("DATE ", date1.toDate())
    
    //CRONJOB CON FECHAY HORA DE FINAL DEL PARTIDO MAS XMIN--CRONJOB
    var job = new CronJob(date1.toDate(),  function () {
          console.log("-----------COMENZANDO A LA DATE PROGRAMADA-------------- ", date1.toDate())
        },
        true, /* Start the job right now */
        'Europe/Madrid' /* Time zone of this job. */
    );
   
    //WHILE !FINALIZADO REPETIR CADA MINUTO HASTA FINALIZADO--MANAGER
    
    //GUARDAR Y DAR NOTIFICACION
}
