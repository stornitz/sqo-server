'use strict';

function checkArgs(func, argsKeysList) {
	return function(req, res, next) {
		if(!argsExists(req.params, argsKeysList)) {
			res.send(400); // 400: Bad Request
		} else {
			var argsLists = [];
			for(var i in argsKeysList) {
				var key = argsKeysList[i];
				argsLists.push(req.params[key]);
			}

			var result = func.apply(null, argsLists);
			res.send(result);
		}

		next();
		return;
	};
}

function argsExists(array, argsKeysList) {
	var i = 0;
	var length = argsKeysList.length;
	var key;

	var exist = true;

	while (exist && i < length) {
		key = argsKeysList[i];
		exist = array[key] !== undefined && array[key] !== null;
		i++;
	}

	return exist;
}

module.exports = {
	checkArgs: checkArgs
};