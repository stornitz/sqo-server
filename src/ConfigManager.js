const debug = require('debug')('sqo:config-manager');

import {readFileSync} from 'fs';

const CONFIG_FILE = './config.json';

export default function getConfig() {
	debug('loading config')
	let data = readFileSync(CONFIG_FILE);

	let config;
	try {
		config = JSON.parse(data);
	} catch (err) {
		debug('Error parsing %s : %s', CONFIG_FILE, err);
		config = {};
	}

	config.port = _default(config.port, 8080);
	config.upload_dir = _default(config.upload_dir, 'uploads');

	return config;
}

function _default(value, defaultValue) {
	return value == null ? defaultValue : value;
}