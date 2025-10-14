import * as tcp from '@kuyoonjo/tauri-plugin-tcp';
import { Reactive } from 'vue';

import mainGame from '../../../script/game';
import fs from '../../../script/fs';
import invoke from '../../../script/invoke';
import Message from './message';
import constant from '../../../script/constant';
import toast from '../../../script/toast';
import Deck from '../../deck/deck';
import { CTOS, STOC, LOCATION, MSG, ERROR, PLAYERCHANGE, HINT, QUERY, PHASE } from './network';
import Client_Card from './client_card';

interface Player {
	name : string;
	ready ?: boolean;
};

interface Chat {
	msg : string;
	contentType : number;
};

type Chats = Array<Chat>;

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

	connect = async (address : string, name : string, pass : string, connect : Reactive<any>) : Promise<boolean> => {
		try {
			const get_srv = async () : Promise<string> => {
				const srv = await invoke.get_srv(address);
				if (srv.error === undefined)
					return `${srv.content!.target}:${srv.content!.port}`;
				return address;
			}
			connect.state = -1;
			this.address = address.includes(':') ? address : await get_srv();
			await tcp.connect(this.cid, this.address);
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
					connect.state = 0;
					this.address = '';
				} else if (x.payload.event.message) {
					listen(new Uint8Array(x.payload.event.message.data));
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
				// console.log(len, proto.toString(16))
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

		const error = (str : string) => {
			toast.error(str, true);
			connect.chat.list.push({ msg : str, contentType : 1 } as Chat);
		};

		const hint = (str : string) => {
			toast.info(str, true);
			connect.chat.list.push({ msg : str, contentType : 1 } as Chat);
		};

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

		const to_palyer = (player : number) : number => {
			player = player > 0 ? 1 : 0;
			return connect.is_first.chk ? player : 1 - player;
		}

		const funcs : Map<number, Function> = new Map([
			[STOC.GAME_MSG,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					if (connect.state === 0)
						return;
					const msg_funcs : Map<number, Function> = new Map([
						[MSG.RETRY, () => {

						}],
						[MSG.HINT, () => {
							const [type, player, content] = to_package(buffer, data, [8, 8, 32], pos);
							switch (type) {
								case HINT.EVENT:
									break;
								case HINT.MESSAGE:
									hint(mainGame.get.desc(content));
									break;
								case HINT.SELECTMSG:
									break;
								case HINT.OPSELECTED:
									hint(mainGame.get.strings.system(1510, mainGame.get.desc(content)));
									break;
								case HINT.EFFECT:
									break;
								case HINT.RACE:
									hint(mainGame.get.strings.system(1511, mainGame.get.strings.race(content)));
									break;
								case HINT.ATTRIB:
									hint(mainGame.get.strings.system(1511, mainGame.get.strings.attribute(content)));
									break;
								case HINT.CODE:
									hint(mainGame.get.strings.system(1511, mainGame.get.name(content)));
									break;
								case HINT.NUMBER:
									hint(mainGame.get.strings.system(1512, content));
									break;
								case HINT.CARD:
									break;
								case HINT.ZONE:
									break;
								case HINT.DIALOG:
									hint(mainGame.get.desc(content));
									break;

							}
						}],
						[MSG.WIN, () => {

						}],
						[MSG.UPDATE_DATA, () => {
							const pack = to_package(buffer, data, [8, 8], pos);
							const tp = to_palyer(pack[0]);
							const location = pack[1];
							const cards = connect.duel.cards.get(location);
							if (cards === undefined)
								return;
							pos += 2;
							for (const card of (cards(tp) as Array<Client_Card>)){
								const [len] = to_package(buffer, data, [32], pos);
								let p = pos + 4;
								if(len !== undefined && len > 8) {
									const [flag] : Array<number> = to_package(buffer, data, [32], p);
									p += 4;
									if (flag === 0) {
										card.clear();
									} else {
										for (const i of [
											[QUERY.CODE, card.update.code],
											[QUERY.POSITION, () => {}],
											[QUERY.ALIAS, card.update.alias],
											[QUERY.TYPE, card.update.type],
											[QUERY.LEVEL, card.update.level],
											[QUERY.RANK, card.update.rank],
											[QUERY.ATTRIBUTE, card.update.attribute],
											[QUERY.RACE, card.update.race],
											[QUERY.ATTACK, card.update.atk],
											[QUERY.DEFENSE, card.update.def],
											[QUERY.BASE_ATTACK, () => {}],
											[QUERY.BASE_DEFENSE, () => {}],
											[QUERY.REASON, () => {}],
											[QUERY.REASON_CARD, () => {}],
											[QUERY.EQUIP_CARD, () => {}],
										] as Array<[number, Function]>) {
											if ((flag & i[0]) === i[0]) {
												const pack = to_package(buffer, data, [32], p);
												i[1](pack[0]);
												p += 4;
											}
										}
									}
									pos += len;
								} else {
									break;
								}
							}
						}],
						[MSG.NEW_TURN, () => {
							const pack = to_package(buffer, data, [8], pos);
							const tp = to_palyer(pack[0] & 0x1);

						}],
						[MSG.NEW_PHASE, () => {
							const [phase] = to_package(buffer, data, [16], pos);

						}],
						[MSG.DRAW, () => {
							const pack = to_package(buffer, data, [8, 8], pos);
							const tp = to_palyer(pack[0]);
							const ct = pack[1];
							if (tp === 0) {
								const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.DECK)!(tp);
								const codes = to_package(buffer, data, new Array(ct).fill(32), pos + 2);
								let i = 1;
								for (const code of codes) {
									const v = cards.length - i;
									if (v < 0)
										break;
									cards[v].update.code(code);
									i ++;
								}
							}
							connect.duel.draw(tp, ct);
						}],
					]);
					const cur_msg : number = to_package(buffer, data, [8], pos)[0];
					pos += 1;
					console.log(cur_msg)
					if (msg_funcs.has(cur_msg))
						msg_funcs.get(cur_msg)!();
				}
			],
			[STOC.ERROR_MSG,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [8, -3, 32], pos);
					const [msg, code] = pack;
					switch (msg) {
						case ERROR.DECKERROR:
							const flag = code >> 28;
							const id = code & mainGame.max_card_id;
							let str;
							switch (flag) {
								case ERROR.LFLIST:
									str = mainGame.get.strings.system(1407, mainGame.get.name(id));
									break;
								case ERROR.OCGONLY:
									str = mainGame.get.strings.system(1413, mainGame.get.name(id));
									break;
								case ERROR.TCGONLY:
									str = mainGame.get.strings.system(1414, mainGame.get.name(id));
									break;
								case ERROR.UNKNOWNCARD:
									str = mainGame.get.strings.system(1415, [mainGame.get.name(id), id]);
									break;
								case ERROR.CARDCOUNT:
									str = mainGame.get.strings.system(1416,mainGame.get.name(id));
									break;
								case ERROR.MAINCOUNT:
									str = mainGame.get.strings.system(1417, id);
									break;
								case ERROR.EXTRACOUNT:
									str = mainGame.get.strings.system(id > 0 ? 1418 : 1420, mainGame.get.name(id));
									break;
								case ERROR.SIDECOUNT:
									str = mainGame.get.strings.system(1419, id);
									break;
								default:
									str = mainGame.get.text().unknow;
									break;
							}
							connect.chk_deck = str;
							error(str);
							break;
					}
				}
			],
			[STOC.SELECT_TP,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					if (connect.rps.chk)
						connect.rps.chk = false;
					connect.is_first.selecting = true;
				}
			],
			[STOC.HAND_RESULT,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, new Array(2).fill(8), pos);
					connect.rps.result = pack;
				}
			],
			[STOC.DECK_COUNT,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, new Array(6).fill(16), pos);
					connect.deck_count = pack;
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
					connect.state = 1;
				}
			],
			[STOC.TYPE_CHANGE,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [8], pos);
					const self = pack[0] & 0xf;
					const is_host = ((pack[0] >> 4) & 0xf) != 0;
					connect.is_host = is_host;
					connect.self = self;
				}
			],
			[STOC.DUEL_START,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					connect.state = 2;
					connect.rps.chk = true;
				}
			],
			[STOC.CHAT,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					let pack = to_package(buffer, data, [16, (len - 2).toString()], pos);
					const player = pack[0];
					let str = '';
					if (player < 4) {
						str += connect.player[player].name;
					} else if ((player < 11 || player > 19) && player !== 8) {
						str += mainGame.get.text().server.watcher
					}
					if (str.length > 0)
						str += ' : '
					str += pack[1];
					if (connect.self !== player)
						toast.info(str, true);
					connect.chat.list.push({ msg : str, contentType : 1 } as Chat);
				}
			],
			[STOC.HS_PLAYER_ENTER,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [40, 8], pos);
					connect.player[pack[1]] = { name : pack[0], ready : false };
				}
			],
			[STOC.HS_PLAYER_CHANGE,
				(buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package(buffer, data, [8], pos);
					const state = pack[0] & 0xf;
					const player = (pack[0] >> 4) & 0xf;
					switch (state) {
						case PLAYERCHANGE.OBSERVE:
							connect.player[player] = { name : '' };
							connect.home.watch ++;
							break;
						case PLAYERCHANGE.READY:
							connect.player[player].ready = true;
							connect.chk_deck = true;
							break;
						case PLAYERCHANGE.NOTREADY:
							connect.player[player].ready = false;
							break;
						case PLAYERCHANGE.LEAVE:
							connect.player[player] = { name : '' };
							break;
						default:
							if (state < 4) {
								connect.player[state] = connect.player[player];
								connect.player[player] = { name : '' };
							}
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
			await this.send.on(CTOS.UPDATE_DECK, obj);
			await this.send.on(CTOS.HS_READY);
		},
		un_ready : async () : Promise<void> => {
			await this.send.on(CTOS.HS_NOTREADY);
		},
		kick : async (v : number) : Promise<void> => {
			await this.send.on(CTOS.HS_KICK, new Message(v, 8));
		},
		to_duelist : async () : Promise<void> => {
			await this.send.on(CTOS.HS_TODUELIST);
		},
		to_watcher : async () : Promise<void> => {
			await this.send.on(CTOS.HS_TOOBSERVER);
		},
		start : async () : Promise<void> => {
			await this.send.on(CTOS.HS_START);
		},
		rps : async (v : number) : Promise<void> => {
			await this.send.on(CTOS.HAND_RESULT, new Message(v + 1, 8));
		},
		select_tp : async (tp : number) : Promise<void> => {
			await this.send.on(CTOS.TP_RESULT, new Message(tp, 8));
		},
		chat : async (chat : string) : Promise<void> => {
			await this.send.on(CTOS.CHAT, new Message(chat));
		},
		surrender : async () : Promise<void> => {
			await this.send.on(CTOS.SURRENDER);
		},
	}

	disconnect = async (connect : Reactive<any>) : Promise<void> => {
		try {
			await tcp.disconnect(this.cid);
		} catch {}
		connect.state = 0;
		this.address = '';
	}
}

export default Tcp;
export type { HostInfo, Player, Chats };