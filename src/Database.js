const debug = require('debug')('sqo:database');

import * as sqlite3 from 'sqlite3';
import {existsSync} from 'fs';
import {safe} from './utils';


export const TYPE_IMAGE = 1;
export const TYPE_PASTE = 2;
const DB_FILE = 'db.sqlite3';

class Database {

	constructor() {
		let exists = existsSync(DB_FILE);
		debug('database file %sfound', exists ? '' : 'not ');

		this.db = new sqlite3.Database(DB_FILE, (err) => {
			if(err) 
				throw Error('Error loading db file: %s', err);

			debug('database loaded');
		});

		if(!exists)
			this._createTables();
	}

	_createTables() {
		debug('creating tables...');
		this.db.run(
			`CREATE TABLE files (
				\`id\` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				\`hash\` varchar(20) NOT NULL,
				\`type\` int(11) NOT NULL,
				\`filename\` varchar(25) NOT NULL,
				\`original_name\` varchar(40) NOT NULL,
				\`upload_date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
				\`views\` int(11) NOT NULL DEFAULT '0',
				CONSTRAINT uniqfile 
					UNIQUE(\`hash\`, \`type\`) ON CONFLICT FAIL
			)`, [], (err) => {
				if(err) 
					throw Error('Error creating database: %s', err);

				debug('table files created');
			})
	}

	addFile(type, hash, filename, originalName, callback) {
		debug('adding file %s (type %s) with hash %s', originalName, type, hash);

		callback = safe(callback);

		this.db.run(
			`INSERT INTO files (hash, type, filename, original_name, upload_date)
			VALUES ($hash, $type, $filename, $original_name, $upload_date)
			`, {
				$hash: hash,
				$type: type,
				$filename: filename,
				$original_name: originalName,
				$upload_date: (new Date()),
			}, (err) => {
				if(err)
					debug('error adding file %s (type %s) with hash %s : %s', originalName, type, hash, err);

				callback(err == null);
			})
	}

	get(type, hash, callback) {
		debug('getting hash %s with type %s', hash, type);

		callback = safe(callback);

		this.db.get(`SELECT * FROM files WHERE hash = $hash AND type = $type`,
			{
				$hash: hash,
				$type: type
			}, (err, row) => {
				if(err)
					debug('error getting hash %s type %s: %s', hash, type, err);

				callback(row);
			})
	}

	incrementViews(id) {
		debug('increasing nb view of file %s', id);

		this.db.run(`UPDATE files SET views = views + 1 WHERE id = $id`, {
			$id: id
		}, (err) => {
			if(err)
				debug('error updating nb view of file %s : %s', id, err);
		})
	}
}
export default Database;