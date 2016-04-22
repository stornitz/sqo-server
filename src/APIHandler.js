class APIHandler {
	constructor(db, config) {
		this.db = db;
		this.config = config;
	}

	onDeleteImage(send) {
		send(204); // Not implemented (204: No content)
	}

	onDeletePaste(send) {
		send(204); // Not implemented (204: No content)
	}

	onUpload(send) {
		send(204); // Not implemented (204: No content)
	}

	onGetHistory(send) {
		send(204); // Not implemented (204: No content)
	}
}
export default APIHandler;