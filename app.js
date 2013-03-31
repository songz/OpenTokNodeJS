// ***
// *** Required modules, Listed in the order of importance
// ***
var OpenTokLibrary = require('opentok');
var express = require('express');

// ***
// *** OpenTok Constants for creating Session and Token values
// ***
var OTKEY = process.env.TB_KEY;
var OTSECRET = process.env.TB_SECRET;

// ***
// *** Setup when server first starts
// ***
var urlSessions = {};
var OpenTokObject = new OpenTokLibrary.OpenTokSDK(OTKEY, OTSECRET);

// ***
// *** Setup Express to handle static files in public folder
// *** Express is also great for handling url routing
// ***
var app = express();
app.use(express.static(__dirname + '/public'));
app.set( 'views', __dirname + "/views");
app.set( 'view engine', 'ejs' );

// ***
// *** When user goes to root directory, redirect them to a room (timestamp)
// ***
app.get("/", function( req, res ){
  res.writeHead(302, { 'Location': Date.now() });
  res.end();
});

// ***
// *** When user goes to root directory, redirect them to a room (timestamp)
// *** If sessionId does not exist for url, create one
// ***
app.get("/:room", function(req, res){
  if(urlSessions[ req.params.room ] == undefined){
    OpenTokObject.createSession(function(sessionId){
      urlSessions[ req.params.room ] = sessionId;
      sendResponse( sessionId, res );
    });
  }else{
    sessionId = urlSessions[req.params.room];
    sendResponse( sessionId, res );
  }
});

// ***
// *** start server, listen to port (predefined or 9393)
// ***
var port = process.env.PORT || 9393;
app.listen(port);

// ***
// *** All sessionIds need a corresponding token
// *** generateToken and then sendResponse based on ejs template
// ***
function sendResponse( sessionId, responder ){
  var token = OpenTokObject.generateToken( {session_id: sessionId} );
  var data = {OpenTokKey:OTKEY, sessionId: sessionId, token:token};
  responder.render( 'index', data );
}

