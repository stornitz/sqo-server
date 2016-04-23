const debug = require('debug')('sqo:api-handler');

import {TYPE_IMAGE, TYPE_PASTE} from './Database';
import * as path from 'path';
import * as fs from 'fs';
import mv from 'mv';
import * as util from 'util';
import {genHash} from './utils';

const imgMime = ['image/gif', 'image/jpeg', 'image/png', 'image/tiff']

class APIHandler {
	constructor(db, config) {
		this.db = db;
		this.config = config;
	}

	onDeleteImage(send, hash, username, token) {
		_delete(send, TYPE_IMAGE, hash, username, token);
	}

	onDeletePaste(send) {
		_delete(send, TYPE_PASTE, hash, username, token);
	}

	_delete(send, type, hash, username, token) {
		db.getUser(user, token, (user) => {
			if(!user)
				return send(401); // (401: Unauthorized)

			db.getFileWithUser(type, hash, user.id, (file) => {
				if(!file)
					return send(403); // (403: Forbidden)

				let filePath = path.join('.', this.config.upload_dir, file.filename);

				debug('deleting file (fs) %s', filePath);
				fs.unlink(filePath, (err) => {
					if(err)
						return send(500, 'Error deleting file. (fs)');

					debug('deleting file (db) %s', file.id);
					db.deleteFile(file.id, (err) => {
						if(err)
							return send(500, 'Error deleting file. (db)');

						send(200);
					})
				});

				
			})
		});
	}

	onUpload(send, username, token, files) {
		if(!('file' in files) || !('constructor' in files.file) || files.file.constructor.name != 'File')
			return send(400); // (400: Bad Request)

		const file = files.file;
		
		this.db.getUser(username, token, (user) => {
			if(!user)
				return send(403); // (403: Forbidden)

			let type = getType(file.type);
			this._saveFile(send, user, file, type);

			
			//let filePath = path.join('.', this.config.upload_dir, file.filename);
/*
			debug('saving user %s file', user.id);
			fs.writeFile('message.txt', 'Hello Node.js', (err) => {
				if (err) throw err;
				console.log('It\'s saved!');
			});*/
			send(200);
		});
	}

	_saveFile(send, user, file, type) {
		let hash = genHash();

		this.db.hashAvailable(type, hash, (available) => {
			if(!available)
				return this._saveFile(send, user, file, type);

			let newFilename = getFormattedFilename(file.name, type, hash);
			let newFilePath = path.join('.', this.config.upload_dir, user.name, newFilename);

			// mkdirp: created all the necessary directories
			mv(file.path, newFilePath, {mkdirp: true}, (err) => {
				if(err)
					return send(500, 'Error moving file.')

				this.db.addFile(user.id, type, hash, newFilename, file.name, (ok) => {
					if(!ok)
						return send(500, 'Error saving file (db).');

					send(201, {
						url: getUrl(user, hash, type)
					});
				})
			});
		})
	}

	onGetHistory(send, username, token) {
		db.getUser(user, token, (user) => {
			if(!user)
				return send(403); // (403: Forbidden)

			debug('getting user %s files', user.id)
			db.getUserFiles(user.id, (files) => {
				send(files == null ? {} : files);
			});
		});
	}
}
export default APIHandler;

function getType(mime) {
	debug('getting type of mime %s', mime);
	if(imgMime.indexOf(mime) > -1)
		return TYPE_IMAGE;

	return TYPE_PASTE;
}

function getFormattedFilename(originalFilename, type, hash) {
	debug('formatting file %s', originalFilename);

	var ext = getExt(originalFilename);

	if(type == TYPE_IMAGE) {
		return `img${hash}.${ext}`;
	} else if(type == TYPE_PASTE) {
		return `paste${hash}.${ext}`;
	}
}

function getExt(filename) {
	let split = filename.split('.');
	return split[split.length-1]; 
}

function getUrl(user, hash, type) {
	let prefix = '';
	switch(type) {
		case TYPE_IMAGE: prefix = 'i'; break;
		case TYPE_PASTE: prefix = 'p'; break;
	}

	return util.format(user.url, prefix + hash);
}