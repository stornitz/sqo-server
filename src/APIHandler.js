const debug = require('debug')('sqo:api-handler');

import {TYPE_IMAGE, TYPE_PASTE} from './Database';
import * as path from 'path';
import * as fs from 'fs';

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

	onUpload(send) {
		send(204); // Not implemented (204: No content)
	}

	onGetHistory(send) {
		send(204); // Not implemented (204: No content)
	}
}
export default APIHandler;