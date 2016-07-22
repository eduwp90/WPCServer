var request = require('./utiles');
var Xray = require('x-ray');
var later = require('later');



var xray = new Xray().driver(request('Windows-1252'));
var storage = require('node-persist');

//ARRAY CON LAS WEB DE LAS LIGAS RFEN
var ligas = [369, 370, 371, 372, 373];

storage.initSync();
console.log(storage.getItem('jornada_guardada'));

if(storage.getItem('jornada_guardada')==undefined){
    var jornada_guardada = {
    369: 'inicio',
    370: 'inicio',
    371: 'inicio',
    372: 'inicio',
    373: 'inicio'
};
}else{
    var jornada_guardada = {};
}
//recuperar datos de todas las ligas españolas
for (i = 0; i < ligas.length; i++) { 

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
        
        //PROCESAR DATOS:
        //CONSEGUIR ID DE LIGA
        var ligaact=result.partidos[0].liga;
        ligaact= ligaact.slice(ligaact.length-7,ligaact.length-4);
        console.log(ligaact);
        //DATOS DE PARTIDOS
            for (j = 0; j < result.partidos[0].hora.length; j++) { 
             
             var hora= result.partidos[0].hora[j];
             var local= result.partidos[0].local[j].trim();
             var visitante= result.partidos[0].visitante[j].trim();
             var resultado= result.partidos[0].resultado[(j*2)]+" - "+result.partidos[0].resultado[(j*2)+1];
             console.log("partido "+j, hora+" "+local+" "+resultado+" "+visitante);
             }
        
        //GUARDAR DATOS DE JORNADA EN SERVIDOR
        jornada_guardada[ligaact] = result.jornada;
        console.log("JG",jornada_guardada);
        storage.removeItemSync('jornada_guardada');
        storage.setItemSync('jornada_guardada',jornada_guardada);
        
        ////////
        
        
        
    }else{
        console.log(err);
    };
  
});


}


