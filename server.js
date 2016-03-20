'use strict';

/**
 * ==== LOAD ====
 */
var restify = require('restify');

var config = require('./config');
var RestServer = require('./Class/RestServer');

var Utils = require('./Class/Utils');
var DisplayHandler = require('./Class/DisplayHandler');
var APIHandler = require('./Class/APIHandler');

/**
 * ==== CONFIGURE ====
 */
var restServer = new RestServer(restify);
restServer.register(Utils, DisplayHandler, APIHandler);

function startServer() {
	restServer.start(config.port, serverStarted);
}

function serverStarted(server) {
	console.log('Server started at %s', server.url);
}

/**
 * ==== START ====
 */
startServer();