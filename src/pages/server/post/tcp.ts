import * as tcp from '@kuyoonjo/tauri-plugin-tcp';
import { Reactive } from 'vue';
import { Buffer } from 'buffer';
import mainGame from '../../../script/game';
import fs from '../../../script/fs';
import Message from './message';
import constant from '../../../script/constant';
import toast from '../../../script/toast';

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
	address : string;
	constructor () {
		this.cid = constant.str.title;
		this.address = '';
	}

	connect = async (address : string, name : string, pass : string, connect : Reactive<any>) : Promise<boolean> => {
		try {
			this.address = address;
			await tcp.connect(this.cid, address);
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
		} catch (e) {
			fs.write.log(e)
			return false;
		}
		return true;
	}

	listen = async (connect : Reactive<any>) : Promise<void> => {
		await tcp.listen(async (x) => {
			if (x.payload.id === this.cid && this.address !== '') {
				if (x.payload.event.disconnect == this.address) {
					connect.state = false;
					this.address = '';
				} else if (x.payload.event.message) {
					listen(new Uint8Array(x.payload.event.message.data));
					connect.state = true;
				}
			}
		});
		const listen = (buffer : Uint8Array<ArrayBuffer>) : void => {
			const data = new DataView(buffer.buffer);
			const len = data.getUint16(0, true);
			const proto = data.getUint8(2);
			switch (proto) {
				case 0x19:
					let str = '';
					for (let i = 0; i < ((len - 1) / 2) - 1; i++) {
						const pos = 5 + i * 2;
						if (pos >= buffer.byteLength)
							break;
						const char = String.fromCharCode(data.getUint16(pos, true));
						str += char;
					}
					toast.info(str)
				break;
			}
		};
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

	disconnect = async (connect : Reactive<any>) : Promise<void> => {
		try {
			await tcp.disconnect(this.cid);
		} catch {}
		connect.state = false;
		this.address = '';
	}
}

export default Tcp;