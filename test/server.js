
var fs = require('fs');
var http = require('http');
var express = require('express');

var app = express();
var server = http.createServer(app);

var mods = fs.readdirSync(__dirname+'/mods');
console.log(mods);
app.get('/mods.js', function(req, res){
  res.setHeader('content-type', 'text/javascript');
  res.send('window.mods = '+JSON.stringify(mods));
});

app.use(express.static(__dirname));
app.use(express.static(__dirname+'/../'));

server.listen(8080, 'localhost', function(){
  console.log('server running http://localhost:8080')
});
