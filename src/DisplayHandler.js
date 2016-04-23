const debug = require('debug')('sqo:display-handler');

import {TYPE_IMAGE, TYPE_PASTE} from './Database';
import * as path from 'path';
import * as fs from 'fs';

class DisplayHandler {
	constructor(db, config) {
		this.db = db;
		this.config = config;
	}

	onAbout(send) {
		var pjson = require('../package.json');
		send({
			hello: 'world',
			sqoVersion: pjson.version,
			repository: pjson.repository.url
		});
	}

	// TODO Support Twitter
	onShowImage(send, hash) {
		this._display(TYPE_IMAGE, hash, send, 'Image');
	}

	// TODO Support Twitter
	onShowPaste(send, hash) {
		this._display(TYPE_PASTE, hash, send, 'Image');
	}

	_display(type, hash, send, prefix) {
		this.db.getFile(type, hash, (file) => {
			if(file == null)
				return send(404, prefix + ' not found.');

			debug('displaying file %s', file.id);

			let filePath = path.join('.', this.config.upload_dir, file.username, file.filename);

			fs.readFile(filePath, (err, fileData) => {
				if(err) 
					return send(500, 'File not found.');

				send(200, fileData);
				this.db.incrementViews(file.id);
			})
		});
	}
}
export default DisplayHandler;