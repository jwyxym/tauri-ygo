import * as tcp from "@kuyoonjo/tauri-plugin-tcp";
import { Buffer } from 'buffer';
import mainGame from '../../../script/game';
import Message from './message';
import constant from '../../../script/constant';

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
		this.cid = constant.str.title;
	}
	connect = async (address : string, name : string, pass : string) => {
		await tcp.connect(this.cid, address);
		await tcp.listen(async (x) => {
			if (x.payload.id === this.cid && x.payload.event.message)
				this.listen(x.payload.event.message.data);
		});
		const message_address : CTOS_ExternalAddress = {
			padding : new Message(0, 32),
			name : new Message(address),
		};
		await this.send(0x17, message_address);
		await this.send(0x10, new Message(name, 40));
		const message_join : CTOS_JoinGame = {
			version : new Message(mainGame.version, 16),
			padding : new Message(0, 16),
			id : new Message(0, 32),
			pass : new Message(pass, 40),
		};
		await this.send(0x12, message_join);
	}

	listen = (data : Array<number>) : void => {
		
	};

	send = async (proto : number, message : object) : Promise<void> => {
		const to_buffer = (proto : number, obj : object) : Uint8Array<ArrayBuffer> => {
			const message = Object.entries(obj);
			const len = message.reduce((v, [_, i]) => v + i.length(), 0);
			const buffer = new ArrayBuffer(len + 3);
			const data = new DataView(buffer);
			data.setUint16(0, 1 + len, true);
			data.setUint8(2, proto & 0xFF);
			let pos = 3;
			for (const [_, v] of message) {
				pos += v.write(buffer, data, pos);
			}
			const result = new Uint8Array(buffer);
			return result;
		}
		const buffer = to_buffer(proto, message instanceof Message ? { item : message } : message);
		await tcp.send(this.cid, buffer);
	}

	disconnect = async () : Promise<void> => {
		await tcp.disconnect(this.cid);
	}
}

export default new Tcp();