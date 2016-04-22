const debug = require('debug')('sqo:database');

import * as sqlite3 from 'sqlite3';
import {existsSync} from 'fs';

const TYPE_IMAGE = 1;
const TYPE_PASTE = 2;
const DB_FILE = 'db.sqlite3';

export default class Database {
	constructor() {
		let exists = existsSync(DB_FILE);
		debug('database file %sfound', exists ? '' : 'not ');

		this.db = new sqlite3.Database(DB_FILE, (err) => {
			if(err) 
				console.error('Error loading db file: %s', err);

			debug('database loaded');
		});

		if(!exists)
			this._createTables();
	}

	_createTables() {
		debug('creating tables...');
		this.db.run(
			`CREATE TABLE IF NOT EXISTS files (
				\`id\` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				\`hash\` varchar(20) NOT NULL,
				\`type\` int(11) NOT NULL,
				\`filename\` varchar(25) NOT NULL,
				\`original_name\` varchar(40) NOT NULL,
				\`uploaddate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
				\`views\` int(11) NOT NULL DEFAULT '0'
			)`, [], (err) => {
				if(err) 
					console.error('Error creating database: %s', err);

				database('table files created');
			})
	}
}