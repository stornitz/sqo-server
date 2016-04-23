const debug = require('debug')('sqo:rest-server');

import checkArgs, {safe} from './utils';
import * as restify from 'restify';

const IMG_REGEX = /^\/i([a-zA-Z0-9]+)(?:\.(?:[pP][nN]|[jJ][pP][eE]?)[gG])?$/;
const PASTE_REGEX = /^\/p([a-zA-Z0-9]+)/;

class RestServer {

	constructor() {
		this.server = restify.createServer(); 

		this.server.pre(restify.pre.userAgentConnection());
		this.server.use(restify.bodyParser({
			mapParams: true,
			//mapFiles: true,
			keepExtensions: true
		}));
	}

	register(displayHandler, apiHandler) {
		debug('registering rules');

		let rules = [
			// GET => /
			['get'  , '/about'    , displayHandler , displayHandler.onAbout]    ,

			// GET => /i<hash>(.png|.jpe?g)
			['get'  , IMG_REGEX   , displayHandler , displayHandler.onShowImage , [0]] ,

			// GET => /p<hash> 
			['get'  , PASTE_REGEX , displayHandler , displayHandler.onShowPaste , [0]] ,

			// [Auth] DELETE => /i<hash>(.png|.jpe?g) 
			['del'  , IMG_REGEX   , apiHandler     , apiHandler.onDeleteImage   , [0, 'username' , 'token']] ,

			// [Auth] DELETE => /p<hash>
			['del'  , PASTE_REGEX , apiHandler     , apiHandler.onDeletePaste   , [0, 'username' , 'token']] ,

			// [Auth] POST => /api/up 
			['post' , '/api/up'   , apiHandler     , apiHandler.onUpload        , ['username', 'token']] ,

			// [Auth] POST => /api/hist 
			['post' , '/api/hist' , apiHandler     , apiHandler.onGetHistory    , ['username' , 'token']]
		];

		for(let i in rules) {
			this._registerRule(...rules[i]);
		}
	}

	_registerRule(method, path, entity, callback, args = []) {
		callback = safe(callback);

		debug('registering [%s] %s', method, callback.name);

		let ruleFunc = checkArgs(entity, callback, args);

		this.server[method](path, ruleFunc);
	};

	start(port, callback) {
		debug('starting server');

		callback = safe(callback);

		this.server.listen(port, () => {
			debug('server started');
			callback(this.server.url);
		});
	};
}
export default RestServer;