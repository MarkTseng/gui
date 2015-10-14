// FREENAS MIDDLEWARE SIMULATOR
// ============================

"use strict";

require( "babel/register" );

var _ = require( "lodash" );
var chalk = require( "chalk" );
var WebSocketServer = require( "ws" ).Server;

var middleware = new WebSocketServer({ port: 4444, path: "/simulator" });
var virtualSystem = require( "./templates/generator.js" )();

var EntitySubscriber = require( "./entitySubscriber" );
var VolumesRPC = require( "./RPC/volumes/volumes" );
var DiscoveryRPC = require( "./RPC/discovery/discovery" );
var DisksRPC = require( "./RPC/disks/disks" );
var GroupsRPC = require( "./RPC/groups/groups" );
var NetworkRPC = require( "./RPC/network/network" );
var ShellRPC = require( "./RPC/shell/shell" );
var SystemRPC = require( "./RPC/system/system" );
var TaskRPC = require( "./RPC/task/task" );
var UsersRPC = require( "./RPC/users/users" );
var SimulateRPC = require( "./RPC/simulate/simulate" );
var StatdRPC = require( "./RPC/statd/statd" );

var rpcClasses =
  { volumes: new VolumesRPC()
  , discovery: new DiscoveryRPC()
  , disks: new DisksRPC()
  , groups: new GroupsRPC()
  , network: new NetworkRPC()
  , shell: new ShellRPC()
  , system: new SystemRPC()
  , task: new TaskRPC( virtualSystem )
  , users: new UsersRPC()
  , simulate: new SimulateRPC()
  , statd: new StatdRPC( virtualSystem )
  };

rpcClasses[ "task" ].designateRPCClasses( rpcClasses );

var entitySubscriber = new EntitySubscriber( rpcClasses );

var authTokens = {};

function sendEvent ( message ) {
  if ( this.readyState === 1 ) {
    this.send( pack( "events", "event", message ) );
  } else {
    // Don't bother warning on this case until we want to debug it again.
    // console.log( "Tried to send event when the socket was not open." );
  }
}

function handleCall ( data ) {

  var response;
  var namespace;
  var secondNamespace;

  // This only splits off the top-level namespace. Some namespaces, such as
  // system, have nested namespaces such as system.info. These are handled in
  // classes for the top-level namespaces.
  var call = data[ "args" ][ "method" ].split( "." );
  namespace = call.shift();

  // Check for a second namespace. There are no extant triply-layered
  // namespaces.
  if ( call.length !== 1 ) {
    secondNamespace = call.shift();
  }

  // The rest of the original string goes back into a string to used to
  // reference the appropriate function.
  var method = call[0];

  // Don't try to call a function if there's no class to call it on.
  if ( rpcClasses[ namespace ] ) {

    if ( secondNamespace ) {
      // Call the method in the sub-namespace of the main namespace, get the
      // response for packing.
      response =
        rpcClasses[ namespace ][ secondNamespace ][ method ]( virtualSystem
                                                            , data[ "args" ][ "args" ] );
    } else {
      // Call the method in the namespace, get the response for packing.
      response = rpcClasses[ namespace ][ method ]( virtualSystem
                                                  , data[ "args" ][ "args" ] );
    }
  }

  if ( !response ) {
    // TODO: proper error responses.
    response = [ "This call failed or is not yet implemented." ];

    this.send( pack( "rpc", "error", response, data.id ) );
  } else {
    this.send( pack( "rpc", "response", response, data.id ) );
  }

}

function handleRPC ( data, flags ) {
  var args;
  switch ( data.name ) {
    case "auth_token":
      if ( authTokens[ data["auth_token"] ] ) {
        var token = generateToken();
        authTokens[ token ] = authTokens[ data["auth_token"] ];
        args = [ token, 600, authTokens[ data["auth_token"] ] ];
        delete authTokens[ data["auth_token"] ];
        this.send( pack( "rpc", "response", args, data.id ) );
      } else {
        // FIXME
        return false;
      }
      break;

    case "auth":
      var token = generateToken();
      authTokens[ token ] = data.args["username"];
      args = [ token, 600, data.args["username"] ];
      this.send( pack( "rpc", "response", args, data.id ) );
      break;

    case "call":
      handleCall.call( this, data );
      break;
  }
  return true;
}

function generateToken () {
  Array( 32 ).join(
    ( Math.random().toString( 36 ) + "00000000000000000" ).slice( 2, 18 )
  ).slice( 0, 32 );
}

function handleOpen () {
  // TODO
}

function handleClose ( code, message ) {
  var explanation = "";

  entitySubscriber.removeEventListener( sendEvent.bind( this ) );
  rpcClasses[ "task" ].removeTaskBroadcastListener( sendEvent.bind( this ) );

  switch ( code ) {
    case 1000:
      explanation = "Normal closure; the connection successfully completed "
                  + "whatever purpose for which it was created.";
      break;

    case 1001:
      explanation = "The endpoint is going away, either because of a server "
                  + "failure or because the browser is navigating away from "
                  + "the page that opened the connection.";
      break;

    case 1002:
      explanation = "The endpoint is terminating the connection due to a "
                  + "protocol error.";
      break;

    case 1003:
      explanation = "The connection is being terminated because the endpoint "
                  + "received data of a type it cannot accept (for example, "
                  + "a text-only endpoint received binary data).";
      break;

    case 1005:
      explanation = "Reserved.  Indicates that no status code was provided "
                  + "even though one was expected.";
      break;

    case 1006:
      explanation = "Reserved. Used to indicate that a connection was closed "
                  + "abnormally (that is, with no close frame being sent) "
                  + "when a status code is expected.";
      break;

    case 1007:
      explanation = "The endpoint is terminating the connection because a "
                  + "message was received that contained inconsistent data "
                  + "(e.g., non-UTF-8 data within a text message).";
      break;

    case 1008:
      explanation = "The endpoint is terminating the connection because it "
                  + "received a message that violates its policy. This is "
                  + "a generic status code, used when codes 1003 and 1009 are "
                  + "not suitable.";
      break;

    case 1009:
      explanation = "The endpoint is terminating the connection because a "
                  + "data frame was received that is too large.";
      break;

    case 1010:
      explanation = "The client is terminating the connection because it "
                  + "expected the server to negotiate one or more extension, "
                  + "but the server didn't.";
      break;

    case 1011:
      explanation = "The server is terminating the connection because it "
                  + "encountered an unexpected condition that prevented it "
                  + "from fulfilling the request.";
      break;
  }

  console.log( "WebSocket connection closed: " + chalk.cyan( "Code " + code ) );
  if ( explanation ) {
    console.log( explanation );
  }
  if ( message ) {
    console.log( message );
  }
}

function handleError ( error ) {
  console.log( "WebSocket error" );
  console.error( error );
}

function handleMessage ( message, flags ) {
  var data;

  try {
    data = JSON.parse( message );
  } catch ( error ) {
    console.error( "Could not parse JSON from message:", message );
    return false;
  }

  switch ( data.namespace ) {
    case "rpc":
      handleRPC.call( this, data, flags );
      break;
  }
}

function pack ( namespace, name, args, id ) {
  return JSON.stringify(
    { namespace : namespace
    , name      : name
    , id        : id
    , args      : args
    , timestamp : Math.floor( ( new Date ).getTime() / 1000 )
    }
  );
}

middleware.on( "connection", function ( socket ) {
  socket.on( "open", handleOpen.bind( socket ) );
  socket.on( "close", handleClose.bind( socket ) );
  socket.on( "error", handleError.bind( socket ) );
  socket.on( "message", handleMessage.bind( socket ) );
  entitySubscriber.addEventListener( sendEvent.bind( socket ) );
  rpcClasses[ "task" ].addTaskBroadcastListener( sendEvent.bind( socket ) );
});