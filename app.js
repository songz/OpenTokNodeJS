// Required modules, Listed in the order of importance
var OTSDK = require('opentok'); // OpenTok API for live video streaming
var http = require('http');     // Listen to HTTP Requests
var fs = require('fs');         // Read files
var ejs = require('ejs');       // Templating Engine

// OpenTok Constants for creating Session and Token values
var OTKEY = process.env.TB_KEY;
var OTSECRET = process.env.TB_SECRET;

// Setup when server first starts
var urlSessions = {}; // mapping url to OpenTok Sessions
// Initialize OpenTok Object
var OpenTok = new OTSDK.OpenTokSDK(OTKEY, OTSECRET);
// read view Template into a string
var htmlString = fs.readFileSync('./view.ejs', 'utf8'); 

// Write response after all data (session Id, token) is ready
function sendResponse(str, responder, data){
  responder.writeHead(200);
  responder.end( ejs.render(str, data) );
}

// Start Server
var server = http.createServer(function(req, res){
  if(urlSessions[req.url]==undefined){ // No OpenTok sessionId for url
    var clientIP = req.connection.remoteAddress;
    OpenTok.createSession(clientIP, function(sessionId){
      // sessionId received. Generate token and write response
      var token = OpenTok.generateToken( {session_id: sessionId} );
      var data = {OpenTokKey:OTKEY, sessionId: sessionId, token:token};
      sendResponse( htmlString, res, data );
      urlSessions[req.url] = sessionId;
    });
  }else{
    // sessionId exists, use it to generate token and write response
    sessionId = urlSessions[req.url];
    var token = OpenTok.generateToken( {session_id: sessionId} );
    var data = {OpenTokKey:OTKEY, sessionId: sessionId, token:token};
    sendResponse( htmlString, res, data );
  }

  console.log( urlSessions );
});

server.listen(9393);
