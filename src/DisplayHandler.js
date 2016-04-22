export function onHelloWorld() {
	var pjson = require('../package.json');
	return {
		hello: 'world',
		sqoVersion: pjson.version
	};
};

export function onShowImage() {
	return 204; // Not implemented (204: No content)
};

export function onShowPaste() {
	return 204; // Not implemented (204: No content)
};