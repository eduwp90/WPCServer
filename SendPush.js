var Parse = require('parse/node');
var query = new Parse.Query(Parse.Installation);

query.equalTo('channels', 'Test');

Parse.Push.send({
  where: query,
  data: {
    title: "Mets Score!",
    alert: 'Test'
    
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