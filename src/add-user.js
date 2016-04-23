const debug = require('debug')('sqo:config-manager');

import getConfig from './ConfigManager';
import Database from './Database';
import {randomBytes} from 'crypto';

const config = getConfig();

const db = new Database(config.db_file);

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const idRegex = /^[a-z0-9-_]+$/;

function askId() {
	debug('asking question...');
	rl.question('Please enter the username (ex: blackcat): ', (answer) => {
		if(!answer.match(idRegex)) {
			console.log('Error: usernames can only contains:')
			console.log('  * lowercase letter : a-z');
			console.log('  * digit            : 0-9');
			console.log('  * dash             : -');
			console.log('  * underscore       : _');
			console.log();
			askId();
		} else {
			addUser(answer);
			rl.close();
		}
	});
}

function addUser(username) {
	debug('adding user');
	console.log('Generating user auth token...');
	const token = getToken();
	debug('adding user in the database');
	db.addUser(username, token, (err) => {
		if(err) {
			console.log('Error adding user in the database: %s', err);
			return;
		}

		console.log()
		console.log('################################################################');
		console.log('## Authentication informations: ');
		console.log('##  Login     : %s', username);
		console.log('##  AuthToken : %s ', token);
		console.log('################################################################');
		console.log('Use the information above to login in your SQO-Client.');
		console.log();
		console.log('"%s" added in the database.', username);
	});
}

function getToken() {
	return randomBytes(24).toString('hex');
}

// Let's go !
askId();