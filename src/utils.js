const debug = require('debug')('sqo:utils');

export default function checkArgs(func, argsKeysList) {
	return function(req, res, next) {
		debug('function %s called', func.name);

		if(!argsExists(req.params, argsKeysList)) {
			res.send(400); // 400: Bad Request
		} else {

			let argsLists = argsKeysList.map(key => req.params[key]);

			let result = func.apply(null, argsLists);
			res.send(result);
		}

		next();
	}
}

function argsExists(array, argsKeysList) {
	let i = 0;
	let length = argsKeysList.length;
	let key;

	let exist = true;

	while (exist && i < length) {
		key = argsKeysList[i];
		exist = array[key] !== undefined && array[key] !== null;
		i++;
	}

	return exist;
}