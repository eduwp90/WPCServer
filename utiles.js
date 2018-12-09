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