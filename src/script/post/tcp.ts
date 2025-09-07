import * as tcp from "@kuyoonjo/tauri-plugin-tcp";
import { Buffer } from 'buffer';

interface CTOS_JoinGame {
	version : number;
	id : number;
	pass : string;
}

class Tcp {
	cid : string;
	constructor () {
		this.cid = Math.random().toString();
	}
	connect = async () => {
		console.log(this.package.host('jwyxym.top:50005').length)
		console.log(this.package.name('jwyxym.top:50005').length)
		await tcp.connect(this.cid, 'jwyxym.top:50005');
		await tcp.listen(async (x) => {
			console.log(x);
				await tcp.send(this.cid, new Uint8Array());
			if (x.payload.id === this.cid && x.payload.event.message) {
				let str = Buffer.from(x.payload.event.message.data).toString();
				console.log(str)
				// await tcp.send(this.cid, '')
			}
		});
		await this.send();
	}

	send = async () : Promise<void> => {
		await tcp.send(this.cid, this.add_proto(0x17, this.package.host('jwyxym.top:50005')));
		await tcp.send(this.cid, this.add_proto(0x11, this.package.name('今晚有宵夜吗')));
		await tcp.send(this.cid, this.add_proto(0x12, this.package.join({
			version : 0x1362,
			id : 0,
			pass : '1234'
		})));
	}

	disconnect = async () : Promise<void> => {
		await tcp.disconnect(this.cid);
	}

	package = {
		str : (str : string, len : number | undefined = undefined) : Uint8Array<ArrayBuffer> => {
			const array = this.str_to_array(str);
			const buffer = new ArrayBuffer(array.length * 2);
			const view = new DataView(buffer);
			for (let i = 0; i < (len || array.length); i++) {
				view.setUint16(i * 2, array[i] || 0, true);
			}
			return new Uint8Array(buffer);
		},
		host : (host : string) : Uint8Array<ArrayBuffer> => {
			const utf16 = new Uint16Array(host.length);
			for (let i = 0; i < host.length; i++) {
				utf16[i] = host.charCodeAt(i);
			}
			const buffer = new ArrayBuffer(4 + (utf16.length + 1) * 2);
			const view = new DataView(buffer);
			for (let i = 0; i < 4; i++) {
				view.setUint8(i, 0);
			}

			for (let i = 0; i < utf16.length; i++) {
				const value = utf16[i];
				const offset = 4 + i * 2;
				view.setUint16(offset, value, true);
			}
			view.setUint16(utf16.length, 0, true);
			return new Uint8Array(buffer);
		},
		name : (name : string) : Uint8Array<ArrayBuffer> => {
			return this.package.str(name, 20);
		},
		join : (obj : CTOS_JoinGame) : Uint8Array<ArrayBuffer> => {
			const array = this.str_to_array(obj.pass);
			const buffer = new ArrayBuffer(8 + array.length * 2);
			const view = new DataView(buffer);
			view.setUint16(0, obj.version, true);
			view.setUint16(2, 0, true);
			view.setUint32(4, obj.id, true);
			for (let i = 0; i < 20; i++) {
				view.setUint16(8 + i * 2, array[i] || 0, true);
			}
			return new Uint8Array(buffer);
		}
	}

	merge = (arrays : Array<Uint8Array<ArrayBuffer>>) : Uint8Array<ArrayBuffer> => {
		const len = arrays.reduce((acc, arr) => acc + arr.length, 0);
		let result = new Uint8Array(len);
		let offset = 0;
		for (let arr of arrays) {
			result.set(arr, offset);
			offset += arr.length;
		}
		return result;
	}

	str_to_array = (str : string): Array<number> => {
		const buf = new ArrayBuffer(str.length * 2);
		const view = new DataView(buf);

		for (let i = 0; i < str.length; i++) {
			view.setUint16(i * 2, str.charCodeAt(i), true);
		}

		const uint16 = new Uint16Array(buf);
		const result: Array<number> = [];

		for (let i = 0; i < 20; i++) {
			if (i < uint16.length)
				result.push(uint16[i]);
			else
				result.push(0);
		}

		return result;
	}

	add_proto = (proto : number, buffer : Uint8Array<ArrayBuffer> | undefined = undefined) : Uint8Array<ArrayBuffer> => {
		if (buffer === undefined) {
			const new_buffer = new ArrayBuffer(2 + 1);
			const view = new DataView(new_buffer);
			view.setUint16(0, 1, true);
			view.setUint8(2, proto & 0xFF);
			return new Uint8Array(new_buffer);
		} else {
			const len = buffer.byteLength;
			const new_buffer = new ArrayBuffer(2 + 1 + len);
			const view = new DataView(new_buffer);
			view.setUint16(0, 1 + len, true);
			view.setUint8(2, proto & 0xFF);
			new Uint8Array(new_buffer, 3, len).set(buffer);
			return new Uint8Array(new_buffer);
		}

	}

}

export default new Tcp();