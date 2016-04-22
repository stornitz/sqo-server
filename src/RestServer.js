const debug = require('debug')('sqo:rest-server');

import checkArgs from './utils';
import * as restify from 'restify';

const IMG_REGEX = /^\/i([a-zA-Z0-9]+)(?:\.(?:[pP][nN]|[jJ][pP][eE]?)[gG])?$/;
const PASTE_REGEX = /^\/p([a-zA-Z0-9]+)/;
const UPLOAD_REGEX = '/api/up';
const HISTORY_REGEX = '/api/hist';

export default class RestServer {

	constructor() {
		this.server = restify.createServer(); 

		this.server.pre(restify.pre.userAgentConnection());
		this.server.use(restify.bodyParser());
	}

	register(displayHandler, apiHandler) {
		debug('registering rules');

		let rules = [
			// GET => /
			['get'  , '/'           , displayHandler.onHelloWorld] ,

			// GET => /i<hash>(.png|.jpe?g)
			['get'  , IMG_REGEX     , displayHandler.onShowImage] ,

			// GET => /p<hash> 
			['get'  , PASTE_REGEX   , displayHandler.onShowPaste] ,

			// [Auth] DELETE => /i<hash>(.png|.jpe?g) 
			['del'  , IMG_REGEX     , apiHandler.onDeleteImage] ,

			// [Auth] POST => /api/up 
			['post' , UPLOAD_REGEX  , apiHandler.onUpload] ,

			// [Auth] POST => /api/hist 
			['post' , HISTORY_REGEX , apiHandler.onGetHistory]
		];

		for(let i in rules) {
			this._registerRule(...rules[i]);
		}
	}

	_registerRule(method, path, callback, args = []) {
		debug('registering [%s] %s', method, callback.name);

		let ruleFunc = checkArgs(this._safe(callback), args);

		this.server[method](path, ruleFunc);
	};

	start(port, callback) {
		debug('starting server');

		callback = this._safe(callback);

		this.server.listen(port, () => {
			debug('server started');
			callback(this.server.url);
		});
	};

	_safe(func) {
		return typeof func == 'function' ? func : () => {};
	}
}