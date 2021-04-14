/// BEGIN OF CHANGE
const charset = require('superagent-charset');
const request = require('superagent')
var superagent = charset(request);
/// END OF CHANGE


exports.FirstUpper = function(str) 
{
     return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

//ARRAY CON LAS WEB DE LAS LIGAS RFEN
exports.datosligas = [
                      {"url":"996044/calendar/2705413/", "urljornada":14354149, "nombre":"DHM-A", "numjornadas": 10, "ligatipo":"liga"},
	                  {"url":"996044/calendar/2744804/", "urljornada":14354189, "nombre":"DHM-B", "numjornadas": 10, "ligatipo":"liga"},
	                  {"url":"996044/calendar/2866482/", "urljornada":15011545, "nombre":"DHM-C", "numjornadas": 6, "ligatipo":"liga"},
	                  {"url":"996044/calendar/2866483/", "urljornada":15011577, "nombre":"DHM-D", "numjornadas": 6, "ligatipo":"liga"},
                      {"url":"996048/calendar/2747370/", "urljornada":14366856, "nombre":"DHF-A", "numjornadas": 10, "ligatipo":"liga"},
	                  {"url":"996048/calendar/2747380/", "urljornada":14366939, "nombre":"DHF-B", "numjornadas": 10, "ligatipo":"liga"},
	                  {"url":"996048/calendar/2873651/", "urljornada":15045839, "nombre":"DHF-C", "numjornadas": 6, "ligatipo":"liga"},
	                  {"url":"996048/calendar/2873669/", "urljornada":15045915, "nombre":"DHF-D", "numjornadas": 6, "ligatipo":"liga"},
                      {"url":"996049/calendar/2747391/", "urljornada":14367030, "nombre":"PDM-A", "numjornadas": 14, "ligatipo":"liga"},
                      {"url":"696708/calendar/1785001/", "urljornada":9636114, "nombre":"PDF", "numjornadas": 18, "ligatipo":"liga"},
                      {"url":"703924/calendar/1804510/", "urljornada":9730530, "nombre":"SDM", "numjornadas": 22, "ligatipo":"liga"}
                   ];