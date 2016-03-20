'use strict';

var onHelloWorld = function onHelloWorld() {
	var pjson = require('../package.json');
	return {
		hello: 'world',
		sqoVersion: pjson.version
	};
};

var onShowImage = function onShowImage() {
	return 204; // Not implemented (204: No content)
};

var onShowPaste = function onShowPaste() {
	return 204; // Not implemented (204: No content)
};

module.exports = {
	onHelloWorld: onHelloWorld,

	onShowImage: onShowImage,
	onShowPaste: onShowPaste
};