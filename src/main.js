const debug = require('debug')('sqo:main');

import getConfig from './ConfigManager';
import RestServer from './RestServer';
import Database, {TYPE_PASTE} from './Database';
import DisplayHandler from './DisplayHandler';
import APIHandler from './APIHandler';
import 'source-map-support/register'

const db = new Database();

const config = getConfig();

const displayHandler = new DisplayHandler(db, config);
const apiHandler = new APIHandler(db, config);

const server = new RestServer();
server.register(displayHandler, apiHandler);

server.start(config.port, (serverUrl) => {
	console.log('Server started at %s', serverUrl);
});