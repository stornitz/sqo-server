'use strict';

const IMG_REGEX = /^\/i([a-zA-Z0-9]+)(?:\.(?:[pP][nN]|[jJ][pP][eE]?)[gG])?$/;
const PASTE_REGEX = /^\/p([a-zA-Z0-9]+)/;
const UPLOAD_REGEX = '/api/up';
const HISTORY_REGEX = '/api/hist';

function RestServer(restify) {
	this.server = restify.createServer();

	this.server.pre(restify.pre.userAgentConnection());
	this.server.use(restify.bodyParser());
}

module.exports = RestServer;

/**
 * rule[0]: HTTP request type
 * rule[1]: Path Regex
 * rule[2]: Callback function
 * rule[3]: Params to check their existence
 * @return {[type]}
 */
var registerRule = function registerRule(server, Utils, rule) {
	var ruleFunc = Utils.checkArgs(rule[2], rule[3]);

	server[rule[0]](rule[1], ruleFunc);
};

RestServer.prototype.register = 
	function register(Utils, displayHandler, apiHandler) {

	var rules = [
		// GET => /
		['get'  , '/'           , displayHandler.onHelloWorld , []] ,

		// GET => /i<hash>(.png|.jpe?g)
		['get'  , IMG_REGEX     , displayHandler.onShowImage  , []] ,

		// GET => /p<hash> 
		['get'  , PASTE_REGEX   , displayHandler.onShowPaste  , []] ,

		// [Auth] DELETE => /i<hash>(.png|.jpe?g) 
		['del'  , IMG_REGEX     , apiHandler.onDeleteImage    , []] ,

		// [Auth] POST => /api/up 
		['post' , UPLOAD_REGEX  , apiHandler.onUpload         , []] ,

		// [Auth] POST => /api/hist 
		['post' , HISTORY_REGEX , apiHandler.onGetHistory     , []]
	];

	for(var i in rules) {
		registerRule(this.server, Utils, rules[i]);
	}
};

RestServer.prototype.start = function start(port, callback) {
	var server = this.server;
	server.listen(port, function onStart() {
		callback(server);
	});
};