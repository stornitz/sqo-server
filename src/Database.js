const debug = require('debug')('sqo:database');

import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import {safe} from './utils';


export const TYPE_IMAGE = 1;
export const TYPE_PASTE = 2;

class Database {

	constructor(dbFile) {
		let exists = fs.existsSync(dbFile);
		debug('database file %sfound', exists ? '' : 'not ');

		this.db = new sqlite3.Database(dbFile, (err) => {
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
				\`user_id\` int(11) NOT NULL,
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
					throw Error('Error creating table files: ' + err);

				debug('table files created');
			});

		this.db.run(
			`CREATE TABLE users (
				\`id\` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				\`name\` varchar(25) NOT NULL UNIQUE,
				\`url\` varchar(50),
				\`twitter\` varchar(40),
				\`redirect_url\` varchar(80),
				\`token\` varchar(24) NOT NULL
			)`, [], (err) => {
				if(err) 
					throw Error('Error creating table users: ' + err);

				debug('table users created');
			});
	}

	addFile(userId, type, hash, filename, originalName, callback) {
		debug('adding file %s (type %s) with hash %s', originalName, type, hash);

		callback = safe(callback);

		this.db.run(
			`INSERT INTO files (user_id, hash, type, filename, original_name, upload_date)
			VALUES ($userId, $hash, $type, $filename, $original_name, $upload_date)
			`, {
				$userId: userId,
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

	getFile(type, hash, callback) {
		debug('getting hash %s with type %s', hash, type);

		callback = safe(callback);

		this.db.get(`SELECT files.id, files.filename, users.name AS username FROM files LEFT JOIN users ON files.user_id = users.id WHERE hash = $hash AND type = $type`,
			{
				$hash: hash,
				$type: type
			}, (err, row) => {
				if(err)
					debug('error getting hash %s type %s: %s', hash, type, err);

				callback(row);
			})
	}

	getFileWithUser(type, hash, userId, callback) {
		debug('getting hash %s with type %s, user %s', hash, type, userId);

		callback = safe(callback);

		this.db.get(`SELECT * FROM files WHERE hash = $hash AND type = $type AND user_id = $userId`,
			{
				$hash: hash,
				$type: type,
				$userId: userId
			}, (err, row) => {
				if(err)
					debug('error getting hash %s type %s, user %s: %s', hash, type, userId, err);

				callback(row);
			})
	}

	getUserFiles(userId, callback) {
		debug('getting user %s files', userId);

		callback = safe(callback);

		this.db.all(`SELECT * FROM files WHERE user_id = $userId`,
			{
				$userId: userId
			}, (err, rows) => {
				if(err)
					debug('getting user %s files : %s', userId, err);

				callback(rows);
			})
	}

	getUser(username, token, callback) {
		debug('getting user %s', username);

		callback = safe(callback);

		this.db.get(`SELECT * FROM users WHERE name = $username AND token = $token`,
			{
				$username: username,
				$token: token
			}, (err, row) => {
				if(err)
					debug('getting user %s : %s', username, err);

				callback(row);
			})
	}

	hashAvailable(type, hash, callback) {
		debug('checking hash %s (type %s)', hash, type);

		callback = safe(callback);

		this.db.get(`SELECT id FROM files WHERE type = $type AND hash = $hash`,
			{
				$type: type,
				$hash: hash
			}, (err, row) => {
				if(err)
					debug('error checking hash %s (type %s) : %s', hash, type, err);

				callback(row == null);
			})
	}

	deleteFile(fileId, callback) {
		debug('deleting file %s', fileId);

		callback = safe(callback);

		this.db.run(`DELETE FROM files WHERE id = $fileId`,
			{
				$fileId: fileId
			}, (err) => {
				if(err)
					debug('error deleting file %s : %s', fileId, err);

				callback(err);
			});
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

	addUser(username, token, callback) {
		debug('adding user %s', username);

		callback = safe(callback);

		this.db.run(`INSERT INTO users (name, token) VALUES ($username, $token)`, {
				$username: username,
				$token: token
			}, (err) => {
				if(err)
					debug('error adding user %s: %s', username, err);

				callback(err);
			})
	}
}
export default Database;