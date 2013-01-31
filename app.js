// ***
// *** Required modules, Listed in the order of importance
// ***
var OpenTokLibrary = require('opentok');
var HTTPServer = require('http');
var StaticFileReader = require('fs');
var TemplatingEngine = require('ejs');

// ***
// *** OpenTok Constants for creating Session and Token values
// ***
var OTKEY = process.env.TB_KEY;
var OTSECRET = process.env.TB_SECRET;

// ***
// *** Setup when server first starts
// ***
var sessionForUrl = {};
var OpenTokObject = new OpenTokLibrary.OpenTokSDK(OTKEY, OTSECRET);
var viewTemplate = StaticFileReader.readFileSync('./view.ejs', 'utf8');

// ***
// *** Start Server
// ***
var server = HTTPServer.createServer(function(req, res){

  if(sessionForUrl[req.url]==undefined){ 
    OpenTokObject.createSession(function(sessionId){
      sessionForUrl[req.url] = sessionId;
      sendResponse( res, sessionId );
    });
  }else{
    sessionId = sessionForUrl[req.url];
    sendResponse( res, sessionId );
  }
  console.log( sessionForUrl );
});

server.listen(9393);

// Write response after all data (session Id, token) is ready
function sendResponse( responder, sessionId ){
  // All session_ids need a corresponding token
  var token = OpenTokObject.generateToken( {session_id: sessionId} );
  var data = {OpenTokKey:OTKEY, sessionId: sessionId, token:token};
  responder.writeHead(200);
  responder.end( TemplatingEngine.render(viewTemplate, data) );
}

