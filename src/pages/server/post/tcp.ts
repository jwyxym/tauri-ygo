import * as tcp from '@kuyoonjo/tauri-plugin-tcp';
import { Reactive } from 'vue';
import { Base64 } from 'js-base64';

import mainGame from '../../../script/game';
import fs from '../../../script/fs';
import Message from './message';
import constant from '../../../script/constant';
import toast from '../../../script/toast';
import STOC from './stoc';
import CTOS from './ctos';
import Deck from '../../deck/deck';

interface HostInfo {
	lflist : number;
	rule : number;
	mode : number;
	duel_rule : number;
	no_check_deck : boolean;
	no_shuffle_deck : boolean;
	start_lp : number;
	start_hand : number;
	draw_count : number;
	time_limit : number;
	watch : number;
};

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

	connect = async (address : string, name : string, pass : string) : Promise<boolean> => {
		try {
			this.address = address;
			await tcp.connect(this.cid, address);
			const message_address : CTOS_ExternalAddress = {
				padding : new Message(0, 32),
				name : new Message(address),
			};
			await this.send.on(CTOS.EXTERNAL_ADDRESS, message_address);
			await this.send.on(CTOS.PLAYER_INFO, new Message(name, 40));
			const message_join : CTOS_JoinGame = {
				version : new Message(mainGame.version, 16),
				padding : new Message(0, 16),
				id : new Message(0, 32),
				pass : new Message(pass, 40),
			};
			await this.send.on(CTOS.JOIN_GAME, message_join);
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
			let pos = 0
			while (pos < buffer.byteLength - 3) {
				if (data.getUint8(pos) === 0) {
					pos ++;
					continue;
				}
				const len = data.getUint16(pos, true);
				const proto = data.getUint8(pos + 2);
				const func = funcs.get(proto);
				console.log(len, proto.toString(16))
				if (func)
					func(buffer, data, len, connect, pos);
				pos += len + 2;
			}
		};

		const to_package = (buffer : Uint8Array<ArrayBuffer>, data : DataView, lens : Array<number | string>, pos : number) : Array<any> => {
			let result : Array<any> = [];
			pos += 3;
			for (let len of lens) {
				if (pos >= buffer.byteLength)
					break;
				if (typeof len === 'string') {
					result.push(to_str(buffer, data, Number(len), pos));
					pos += Number(len);
				} else if (len < 0) {
					pos -= len;
				} else
					switch (len / 8) {
						case 1:
							result.push(data.getUint8(pos));
							pos += len / 8;
							break;
						case 2:
							result.push(data.getUint16(pos, true));
							pos += len / 8;
							break;
						case 4:
							result.push(data.getUint32(pos, true));
							pos += len / 8;
							break;
						case 8:
							result.push(data.getBigUint64(pos, true));
							pos += len / 8;
							break;
						default:
							result.push(to_str(buffer, data, len, pos));
							pos += len;
							break;
					}
			}
			return result;
		}

		const to_str = (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, offset : number = 3) : string => {
			let str = '';
			for (let i = 0; i < ((len - 1) / 2) - 1; i++) {
				const pos = offset + i * 2;
				if (pos >= buffer.byteLength)
					break;
				const char_buffer = data.getUint16(pos, true);
				if (char_buffer > 31) {
					const char = String.fromCharCode(char_buffer);
					str += char;
				}
			}
			return str;
		}

		const funcs : Map<number, Function> = new Map([
			[STOC.ERROR_MSG,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [8, -3, 32], pos);
					const [msg, code] = pack;
					switch (msg) {
						case 2:
							const flag = code >> 28;
							const id = code & mainGame.max_card_id;
							switch (flag) {
								case 1:
									toast.error(mainGame.get.strings.system(1407, mainGame.get.card(id).name));
									break;
								case 2:
									toast.error(mainGame.get.strings.system(1413, mainGame.get.card(id).name));
									break;
								case 3:
									toast.error(mainGame.get.strings.system(1414, mainGame.get.card(id).name));
									break;
								case 4:
									toast.error(mainGame.get.strings.system(1415, [mainGame.get.card(id).name, id]));
									break;
								case 5:
									toast.error(mainGame.get.strings.system(1416, mainGame.get.card(id).name));
									break;
								case 6:
									toast.error(mainGame.get.strings.system(1417, id));
									break;
								case 7:
									toast.error(mainGame.get.strings.system(id > 0 ? 1418 : 1420, mainGame.get.card(id).name));
									break;
							}
							break;
					}
				}
			],
			[STOC.JOIN_GAME,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [32, ...new Array(5).fill(8), -3, 32, 8, 8, 16], pos);
					connect.home.lflist = pack[0];
					connect.home.rule = pack[1];
					connect.home.mode = pack[2];
					connect.home.duel_rule = pack[3];
					connect.home.no_check_deck = pack[4] === 0;
					connect.home.no_shuffle_deck = pack[5] === 0;
					connect.home.start_lp = pack[6];
					connect.home.start_hand = pack[7];
					connect.home.draw_count = pack[8];
					connect.home.time_limit = pack[9];
				}
			],
			[STOC.CHAT,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					let pack = to_package(buffer, data, [16, (len - 2).toString()], pos);
					const player = pack[0];
					let str = '';
					if (player < 4) {
						str += connect.player[player];
					} else if ((player < 11 || player > 19) && player !== 8) {
						str += mainGame.get.text().server.watcher
					}
					if (str.length > 0)
						str += ' : '
					str += pack[1];
					toast.info(str);
				}
			],
			[STOC.HS_PLAYER_ENTER,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [40, 8], pos);
					connect.player.push({ name : pack[0], ready : false });
				}
			],
			[STOC.HS_PLAYER_CHANGE,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [8], pos);
					const state = pack[0] & 0xf;
					const player = (pack[0] >> 4) & 0xf;
					switch (state) {
						case 8:
							connect.player.splice(player, 1);
							connect.home.watch ++;
							break;
						case 9:
							connect.player[player].ready = true;
							break;
						case 10:
							connect.player[player].ready = false;
							break;
						case 11:
							connect.player.splice(player, 1);
							break;
						default:
							console.log(state, player)
							break;
					}
				}
			],
			[STOC.HS_WATCH_CHANGE,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [16], pos);
					connect.home.watch = pack[0];
				}
			],
		])
	};

	send = {
		on : async (proto : number, message : object = {}) : Promise<void> => {
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
		},
		ready : async (deck : Deck) : Promise<void> => {
			const obj : { [key : number | string] : Message<number> } = {};
			obj[0] = new Message([...deck.main, ...deck.extra].length, 32);
			obj[1] = new Message([...deck.side].length, 32);
			for (const [v, i] of [...deck.main, ...deck.extra, ...deck.side].entries()) {
				obj[v + 2] = new Message(i, 32);
			}
			this.send.on(CTOS.UPDATE_DECK, obj);
			this.send.on(CTOS.HS_READY);
		},
		un_ready : async () : Promise<void> => {
			this.send.on(CTOS.HS_NOTREADY);
		},
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
export type { HostInfo };