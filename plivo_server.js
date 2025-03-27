var plivo = require('plivo');
var express = require('express');
var app = express();

app.all('/receive_call/', function(req, res) {
    var response = plivo.Response();
    var speak_body = "Hello , Nishit , AI agent speaking this side";
    response.addSpeak(speak_body);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(response.toXML());
})

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

