const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

//__dirname : It will resolve to your project folder.

router.get('/',function(req,res) {res.sendFile(path.join(__dirname+'/index.html'));});

router.get('/mousehandling.js',function(req,res) {res.sendFile(path.join(__dirname+'/mousehandling.js'));});
router.get('/controlpanel.js',function(req,res) {res.sendFile(path.join(__dirname+'/controlpanel.js'));});
router.get('/synthexfrontpanel.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexfrontpanel.js'));});
router.get('/synthexknob.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexknob.js'));});
router.get('/synthexfader.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexfader.js'));});
router.get('/synthexbutton.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexbutton.js'));});
router.get('/synthexswitch.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexswitch.js'));});
router.get('/synthexjoystick.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexjoystick.js'));});
router.get('/pianokeyboard.js',function(req,res) {res.sendFile(path.join(__dirname+'/pianokeyboard.js'));});
router.get('/analogpanel.js',function(req,res) {res.sendFile(path.join(__dirname+'/analogpanel.js'));});
router.get('/digitalpanel.js',function(req,res) {res.sendFile(path.join(__dirname+'/digitalpanel.js'));});
router.get('/cpupanel.js',function(req,res) {res.sendFile(path.join(__dirname+'/cpupanel.js'));});
router.get('/cpu65c02.js',function(req,res) {res.sendFile(path.join(__dirname+'/cpu65c02.js'));});
router.get('/synthexmemory.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexmemory.js'));});
router.get('/synthexhardware.js',function(req,res) {res.sendFile(path.join(__dirname+'/synthexhardware.js'));});
router.get('/lcdisplay.js',function(req,res) {res.sendFile(path.join(__dirname+'/lcdisplay.js'));});
router.get('/button.js',function(req,res) {res.sendFile(path.join(__dirname+'/button.js'));});
router.get('/setup.js',function(req,res) {res.sendFile(path.join(__dirname+'/setup.js'));});


//add the router
app.use('/', router);
app.listen(process.env.port || 8080);


/*
var fs = require('fs');
var http = require('http');

http.createServer(function(request, response)
{
  response.writeHead(200, {'Content-Type': 'text/html'});

  var file = fs.createReadStream('index.html').pipe(response);

}).listen(8080);
*/


