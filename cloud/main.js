// Defined in cloud/main.js on Parse server side
Parse.Cloud.define('push_partido', function(request, response) {
  var params = request.params;
  var customData = params.customData;
  var channels = params.channels;
  var title = params.title;
  var alertmsg = params.alert;

  Parse.Push.send({
            channels: channels,
            data: {
                title: title,
                alert: alertmsg,
            }
       }, {
            success: function () {
                // Push was successful
                response.success("push sent");
                console.log("Success: push sent");
            },
            error: function (error) {
                // Push was unsucessful
                response.error("error with push: " + error);
                console.log("Error: " + error);
            },
            useMasterKey: true
       });
});
