const debug = require('debug')('sqo:display-handler');

import {TYPE_IMAGE, TYPE_PASTE} from './Database';
import * as path from 'path';
import {readFile} from 'fs';

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
		this.db.get(TYPE_IMAGE, hash, this._display(send, 'Image'));
	}

	// TODO Support Twitter
	onShowPaste(send, hash) {
		this.db.get(TYPE_PASTE, hash, this._display(send, 'Paste'));
	}

	_display(send, prefix) {
		return (row) => {
			if(row == null)
				return send(404, prefix + ' not found.');

			debug('displaying file %s', row.id);

			let filePath = path.join('.', this.config.upload_dir, row.filename);

			readFile(filePath, (err, file) => {
				if(err) 
					return send(500, 'File not found.');

				send(200, file);
				this.db.incrementViews(row.id);
			})
		}
	}
}
export default DisplayHandler;