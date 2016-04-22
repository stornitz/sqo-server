const debug = require('debug')('sqo:main');

import RestServer from './RestServer';
import Database from './Database';
import * as DisplayHandler from './DisplayHandler';
import * as APIHandler from './APIHandler';

var server;

server = new RestServer();
server.register(DisplayHandler, APIHandler);

server.start(8080, (serverUrl) => {
	console.log('Server started at %s', serverUrl);
});

new Database();