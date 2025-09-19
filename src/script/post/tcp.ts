import * as tcp from "@kuyoonjo/tauri-plugin-tcp";
import { Buffer } from 'buffer';
import mainGame from '../game';
import Message from './message';

interface CTOS_ExternalAddress {
	padding : Message<number>;
	name : Message<string>;
}

interface CTOS_JoinGame {
	version : Message<number>;
	padding : Message<number>;
	id : Message<number>;
	pass : Message<string>;
}

class Tcp {
	cid : string;
	constructor () {
		this.cid = "jwyxym";
	}
	connect = async () => {
		await tcp.connect(this.cid, 'jwyxym.top:50005');
		await tcp.listen(async (x) => {
			if (x.payload.id === this.cid && x.payload.event.message) {
				const text = x.payload.event.message.data.map(n => String.fromCodePoint(n)).join('');
				// console.log(x.payload.event.message.data);
				// console.log(text);
				let str = Buffer.from(x.payload.event.message.data).toString();
				console.log(str);
			}
		});
		const message_address : CTOS_ExternalAddress = {
			padding : new Message(0, 32),
			name : new Message('jwyxym.top:50005'),
		};
		await this.send(0x17, message_address);
		await this.send(0x10, new Message('今晚有宵夜吗', 40));
		const message_join : CTOS_JoinGame = {
			version : new Message(mainGame.version, 16),
			padding : new Message(0, 16),
			id : new Message(0, 32),
			pass : new Message('1234', 40),
		};
		await this.send(0x12, message_join);

		// await tcp.send(this.cid, this.add_proto(0x12, this.package.join({
		// 	version : mainGame.version,
		// 	id : 0,
		// 	pass : '1234'
		// })));
	}

	send = async (proto : number, message : object) : Promise<void> => {
		const buffer = this.to_buffer(proto, message instanceof Message ? { item : message } : message);
		await tcp.send(this.cid, buffer);
	}

	disconnect = async () : Promise<void> => {
		await tcp.disconnect(this.cid);
	}

	to_buffer = (proto : number, obj : object) : Uint8Array<ArrayBuffer> => {
		const message = Object.entries(obj);
		const len = message.reduce((v, [_, i]) => v + i.length(), 0);
		const buffer = new ArrayBuffer(len + 3);
        const data = new DataView(buffer);
		data.setUint16(0, 1 + len, true);
		data.setUint8(2, proto & 0xFF);
		let pos = 0;
		for (const [_, v] of message) {
			pos += v.write(buffer, data, pos);
		}
		const result = new Uint8Array(buffer);
		return result;
	}

	add_proto = (proto : number, buffer : Uint8Array<ArrayBuffer> | undefined = undefined) : Uint8Array<ArrayBuffer> => {
		const len = buffer === undefined ? 0 : buffer.byteLength;
		const new_buffer = new ArrayBuffer(2 + 1 + len);
		const view = new DataView(new_buffer);
		view.setUint16(0, 1 + len, true);
		view.setUint8(2, proto & 0xFF);
		if (buffer !== undefined)
			new Uint8Array(new_buffer, 3, len).set(buffer);
		return new Uint8Array(new_buffer);
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
		join : (obj : any) : Uint8Array<ArrayBuffer> => {
			const array = this.str_to_array(obj.pass);
			const buffer = new ArrayBuffer(8 + array.length * 2);
			const view = new DataView(buffer);
			view.setUint16(0, obj.version, true);
			view.setUint16(2, 0, true);
			view.setUint32(4, obj.id, true);
			for (let i = 0; i < 20; i++)
				view.setUint16(8 + i * 2, array[i] || 0, true);
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

}

export default new Tcp();