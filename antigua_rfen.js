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
                                     var id= local+" - "+visitante+" - "+ligaact;
                                     console.log("partido "+id);
                                     
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
function programarRefreshPartido(idpartido, idliga, urlpartido, date){
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

function refreshpartido(idpartido, idliga, urlpartido, endCallBack){
    
  xray('http://rfen.es/publicacion/waterpolo/asp/ficha.asp?cod=15651', {
  equipos: ['td.contenido2[width="40%"]'],
  resultado: ['td.contenido2[valign="TOP"]'],
  jugadores: ['td.titulo2[align="left"]'],
  datos: ['td.titulo2[align="center"]:not([width="3%"])']
  
})(function(err, obj) {
  console.log(err);
  
  //TRATAR DATOS Y DEJARLOS COPMO JSON ARRAY ORDENADO Y ENTENDIBLE
  var localtext = obj.equipos[0].replace(/(\r\n|\n|\r)/gm,"").trim();
  var visitantetext = obj.equipos[1].replace(/(\r\n|\n|\r)/gm,"").trim();
  
  var resultlocal = obj.resultado[0].replace(/(\r\n|\n|\r)/gm,"").trim();
  var resultvisitante = obj.resultado[1].replace(/(\r\n|\n|\r)/gm,"").trim();
  var j;
  var estadisticas= [];
  var objv = {};
  objv[localtext]=[];
  estadisticas.push(objv);
  for (var i = 0; i < 14; i++){
    var jugadorstring;
     if (obj.datos[i*7] === "Totales") { jugadorstring="TOTALES" }else{
       jugadorstring= obj.jugadores[i].replace(/\s+/g, " ").trim()
     }
    var jugadoract = {};
    jugadoract[jugadorstring]=
      {"GT": obj.datos[(i*7)+1],
      "IGD": obj.datos[(i*7)+2],
      "SUP": obj.datos[(i*7)+3],
      "GPEN": obj.datos[(i*7)+4],
      "EXP": obj.datos[(i*7)+5],
      "PEN": obj.datos[(i*7)+6]
      };
   
    estadisticas[0][localtext].push(jugadoract);
    j=i;
    if (obj.datos[i*7] === "Totales") { break; }
  }
  var objv1 = {};
  objv1[visitantetext]=[];
  estadisticas.push(objv1);
   
  j=j+1;
  for (var ii = 0; ii < 14; ii++){
    var jugadorstring1;
    var totales=obj.datos[(ii*7)+(j*7)];
     if (obj.datos[(ii*7)+(j*7)] === "Totales") { jugadorstring1="TOTALES" }else{
       jugadorstring1= obj.jugadores[ii+j-1].replace(/\s+/g, " ").trim();
     }
    var jugadoract1 = {};
    jugadoract1[jugadorstring1]=
      {"GT": obj.datos[(ii*7)+(j*7)+1],
      "IGD": obj.datos[(ii*7)+(j*7)+2],
      "SUP": obj.datos[(ii*7)+(j*7)+3],
      "GPEN": obj.datos[(ii*7)+(j*7)+4],
      "EXP": obj.datos[(ii*7)+(j*7)+5],
      "PEN": obj.datos[(ii*7)+(j*7)+6]
      };
   
    estadisticas[1][visitantetext].push(jugadoract1);
    
    
    if (obj.datos[(ii*7)+(j*7)] === "Totales") { break; }
  }
  console.log(JSON.stringify(estadisticas,null,2));
  
  
});

}