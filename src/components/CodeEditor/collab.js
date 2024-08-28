import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { StateEffect, ChangeSet } from "@codemirror/state";
import { Update, receiveUpdates, sendableUpdates, collab, getSyncedVersion } from "@codemirror/collab";
import { Socket } from "socket.io-client";

function pushUpdates(socket, version, fullUpdates) {
	const updates = fullUpdates.map(u => ({
		clientID: u.clientID,
		changes: u.changes.toJSON(),
		effects: u.effects
	}));

	return new Promise(resolve => {
		socket.emit('pushUpdates', version, JSON.stringify(updates));
		socket.once('pushUpdateResponse', resolve);
	});
}

function pullUpdates(socket, version) {
	return new Promise(resolve => {
		socket.emit('pullUpdates', version);
		socket.once('pullUpdateResponse', updates => {
			resolve(JSON.parse(updates));
		});
	}).then(updates => updates.map(u => ({
		changes: ChangeSet.fromJSON(u.changes),
		clientID: u.clientID,
		effects: u.effects
	})));
}

export function getDocument(socket) {
	return new Promise(resolve => {
		socket.emit('getDocument');
		socket.once('getDocumentResponse', (version, doc) => {
			resolve({
				version,
				doc: Text.of(doc.split("\n"))
			});
		});
	});
}

export const peerExtension = (socket, startVersion, id) => {
	const plugin = ViewPlugin.fromClass(class {
		pushing = false;
		done = false;

		constructor(view) { this.pull(); }

		update(update) {
			if (update.docChanged || update.transactions.length) this.push();
		}

		async push() {
			const updates = sendableUpdates(this.view.state);
			if (this.pushing || !updates.length) return;
			this.pushing = true;
			const version = getSyncedVersion(this.view.state);
			const success = await pushUpdates(socket, version, updates);
			this.pushing = false;
			if (sendableUpdates(this.view.state).length)
				setTimeout(() => this.push(), 100);
		}

		async pull() {
			while (!this.done) {
				const version = getSyncedVersion(this.view.state);
				const updates = await pullUpdates(socket, version);
				this.view.dispatch(receiveUpdates(this.view.state, updates));
			}
		}

		destroy() { this.done = true; }
	});

	return [
		collab({
			startVersion,
			clientID: id,
		}),
		plugin
	];
}
