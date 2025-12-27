import * as tcp from '@kuyoonjo/tauri-plugin-tcp';
import { Reactive } from 'vue';

import mainGame from '../../../script/game';
import fs from '../../../script/fs';
import * as CONSTANT from '../../../script/constant';
import invoke from '../../../script/post/invoke';
import Message from './message';
import { I18N_KEYS } from '../../../script/language/i18n';
import toast from '../../../script/toast';
import Deck from '../../deck/deck';
import { CTOS, STOC, LOCATION, MSG, ERROR, PLAYERCHANGE, HINT, QUERY, PHASE, COMMAND, EDESC, POS } from './network';
import Client_Card from '../scene/client_card';
import Plaid from '../scene/plaid';
import { Idle } from '../idle';

interface Player {
	name : string;
	ready ?: boolean;
};

interface Chat {
	msg : string;
	contentType : number;
};

interface Select_Card {
	card ?: Client_Card;
	code : number;
	tp : number;
	loc : number;
	seq : number;
	ct : number;
};

interface Idles_Card {
	card : Client_Card;
	code : number;
	seq ?: number;
};

type Chats = Array<Chat>;
type Plaids = Array<{ plaid : Plaid; card ?: number; pos ?: number; }>;
type Select_Cards = Array<Select_Card>;
type Update_Cards = Array<{ card : Client_Card, code : number; }>;
type Idles_Cards = Array<Idles_Card>;

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
	select_hint : number;
	last_select_hint : number;
	turn_player : number;

	constructor () {
		this.cid = 'xiaoye';
		this.address = '';
		this.select_hint = 0;
		this.last_select_hint = 0;
		this.turn_player = 0;
	}

	connect = async (address : string, name : string, pass : string, connect : Reactive<any>) : Promise<boolean> => {
		try {
			const get_srv = async () : Promise<string> => {
				const srv = await invoke.network.srv(address);
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

	to = {
		player : undefined as undefined | Function
	}

	listen = async (connect : Reactive<any>) : Promise<void> => {
		const messages = {
			array : [] as Array<Uint8Array<ArrayBuffer>>,
			on : false,
			process : async (chk : boolean = false) : Promise<void> => {
				if ((!chk && messages.on) || messages.array.length === 0) {
					messages.on = messages.array.length !== 0;
					return;
				}
				messages.on = true;
				const message = messages.array.shift();
				if (message)
					await listen(message);
				messages.process(true);
			}
		};
		await tcp.listen((x) => {
			if (x.payload.id === this.cid && this.address !== '') {
				if (x.payload.event.disconnect == this.address) {
					connect.state = 0;
					this.address = '';
				} else if (x.payload.event.message) {
					messages.array.push(new Uint8Array(x.payload.event.message.data))
					messages.process();
				}
			}
		});
		const listen = async (buffer : Uint8Array<ArrayBuffer>) : Promise<void> => {
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
				console.log('0x'+proto.toString(16))
				if (func)
					await func(buffer, data, len, connect, pos);
				pos += len + 2;
			}
		};

		const to_package = <T>(buffer : Uint8Array<ArrayBuffer>, data : DataView, lens : Array<number | string>, pos : number) : Array<T> => {
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

		const to_player = (player : number) : number => {
			player = player > 0 ? 1 : 0;
			return connect.is_first.chk ? player : 1 - player;
		}

		const to_card = (player : number, loc : number, seq : number, ct : number = -1) : Client_Card | undefined => {
			const is_xyz = (loc & LOCATION.OVERLAY) > 0;
			const get_cards : Function | undefined = connect.duel.cards.get(is_xyz ? LOCATION.OVERLAY : loc);
			if (get_cards) {
				const cards : Array<Client_Card> = is_xyz ? get_cards(player, seq) : get_cards(player);
				return is_xyz ? cards[ct >= 0 ? ct : cards.length - 1] : cards[seq >= 0 ? seq : cards.length - 1];
			}
			return undefined;
		};

		const update_card = async (buffer : Uint8Array<ArrayBuffer>, data : DataView, flag : number, card : Client_Card, p : number) : Promise<void> => {
			if (flag === 0)
				card.clear();
			else
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
				] as Array<[number, Function]>)
					if ((flag & i[0]) === i[0]) {
						const pack = to_package(buffer, data, [32], p);
						await i[1](pack[0]);
						p += 4;
					}
		};

		const idles = new Map([
			[COMMAND.ACTIVATE, connect.idle.activate.push],
			// [COMMAND.ATTACK, 'attack'],
			// [COMMAND.MSET, 'mset'],
			// [COMMAND.SSET, 'sset'],
			// [COMMAND.REPOS, 'pos_attack'],
			// [COMMAND.REPOS, 'pos_defence'],
			[COMMAND.SUMMON, connect.idle.summon.push],
			[COMMAND.PSUMMON, connect.idle.spsummon.push],
			[COMMAND.SPSUMMON, connect.idle.spsummon.push],
			[COMMAND.SCALE, connect.idle.activate.push]
		]) as Map<number, Function>;

		this.to.player = to_player;

		const funcs : Map<number, Function> = new Map([
			[STOC.GAME_MSG,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					if (connect.state === 0)
						return;
					const msg_funcs : Map<number, Function> = new Map([
						[MSG.RETRY, async () => {

						}],
						[MSG.HINT, async () => {
							const [type, player, content] = to_package<number>(buffer, data, [8, 8, 32], pos);
							switch (type) {
								case HINT.EVENT:
									break;
								case HINT.MESSAGE:
									hint(mainGame.get.desc(content));
									break;
								case HINT.SELECTMSG:
									this.select_hint = content;
									this.last_select_hint = content;
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
									hint(mainGame.get.desc(content as number));
									break;
							}
						}],
						[MSG.START, async () => {
							const pack = to_package<number>(buffer, data, [8, -1, 32, 32], pos);
							connect.is_first.chk =  (pack[0] & 0xf) === 0;
							connect.lp.ct = [pack[1], pack[2]];
						}],
						[MSG.WIN, async () => {
							const [player, type] = to_package<number>(buffer, data, [8, 8], pos);
							const key = player === 2 ? I18N_KEYS.DUEL_GAME : to_player(player) === 0 ? I18N_KEYS.DUEL_WIN : I18N_KEYS.DUEL_LOSE;
							const message = mainGame.get.strings.victory(type);
							connect.win(mainGame.get.text(key), message);
						}],
						[MSG.UPDATE_DATA, async () => {
							const pack = to_package<number>(buffer, data, [8, 8], pos);
							const tp = to_player(pack[0]);
							const location = pack[1];
							const cards = connect.duel.cards.get(location);
							if (cards === undefined)
								return;
							pos += 2;
							for (const card of (cards(tp) as Array<Client_Card>)){
								const [len] = to_package<number>(buffer, data, [32], pos);
								if(len === undefined || len <= 8)
									break;
								const [flag] : Array<number> = to_package(buffer, data, [32], pos + 4);
								await update_card(buffer, data, flag, card, pos + 8);
								pos += len;
							}
						}],
						[MSG.UPDATE_CARD, async () => {
							const pack = to_package<number>(buffer, data, [8, 8, 8, 32, 32], pos);
							const player = to_player(pack[0]);
							const loc = pack[1];
							const seq = pack[2];
							const flag = pack[3];
							const card = to_card(player, loc, seq)
							if (card)
								await update_card(buffer, data, flag, card, pos + 11);
						}],
						[MSG.SELECT_BATTLECMD, async () => {
						}],
						[MSG.SELECT_IDLECMD, async () => {
							let p = pos + 1;
							const arr = [COMMAND.SUMMON, COMMAND.SPSUMMON, COMMAND.REPOS, COMMAND.MSET, COMMAND.SSET, COMMAND.ACTIVATE];
							const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.ALL)!(2).filter((i : Client_Card) => i.activatable.flag > 0);
							for (const i of Object.values(connect.idle))
								(i as Idle).clear();
							const codes : Update_Cards = [];
							for (const i of arr) {
								const [ct] = to_package<number>(buffer, data, [8], p);
								p += 1;
								if (ct <= 0) continue;
								if (ct === undefined) break;
								const array = new Array(ct).fill(i === COMMAND.ACTIVATE ? [32, 8, 8, 8, 32] : [32, 8, 8, 8])
								const pack = to_package<number>(buffer, data, array.flat(), p);
								p += ((i === COMMAND.ACTIVATE ? 11 : 7) * ct);
								const step = i === COMMAND.ACTIVATE ? 5 : 4;
								for (let j = 0; j < step * ct; j += step) {
									if (j + step - 1 >= pack.length) break;
									let code = pack[j];
									const tp = to_player(pack[j + 1]);
									const loc = pack[j + 2];
									const seq = pack[j + 3];
									if (loc !== LOCATION.OVERLAY) {
										let card : Client_Card | undefined = to_card(tp, loc, seq);
										if (card) {
											const index = cards.indexOf(card);
											if (index > -1)
												cards.splice(index, 1);
											codes.push({ card : card, code : code });
											const card_show = to_card(tp, loc, (loc & (LOCATION.HAND | LOCATION.ONFIELD)) > 0 ? seq : -1);
											if (card_show) {
												if (i === COMMAND.ACTIVATE) {
													const desc = pack[j + 4];
													const flag = (code & 0x80000000) > 0 ? EDESC.OPERATION : EDESC.NONE;
													// code &= ((code & 0x80000000) > 0 ? 0x7fffffff : 0);
													card_show.activatable.on({desc : desc, flag : flag});
													if (idles.has(i))
														idles.get(i)!(card, desc);
													continue;
												}
												card_show.activatable.on(i);
												if (idles.has(i))
													idles.get(i)!(card);
											}
										}
									}
								}
							}
							const pack = to_package<number>(buffer, data, [8, 8, 8], p);
							cards.forEach(i => i.activatable.clear());
							await mainGame.load.pic(codes.map(i => i.code));
							for (const i of codes)
								await i.card.update.code(i.code);
						}],
						[MSG.SELECT_EFFECTYN, async () => {
						}],
						[MSG.SELECT_YESNO, async () => {
						}],
						[MSG.SELECT_OPTION, async () => {
							const [ct] = to_package<number>(buffer, data, [-1, 8], pos);
							const descs = to_package<number>(buffer, data, new Array(ct).fill(32), pos + 2);
							const i = await connect.select.option.on(descs, this.select_hint, true);
							if (i !== undefined)
								await this.send.response(i);
							this.select_hint = 0;
						}],
						[MSG.SELECT_CARD, async () => {
							const [cancelable, min, max, ct] = to_package<number>(buffer, data, [-1].concat(new Array(4).fill(8)), pos);
							const pack = to_package<number>(buffer, data, new Array(ct).fill([32, 8, 8, 8, 8]).flat(), pos + 5);
							const result : Select_Cards = [];
							const codes : Update_Cards = [];
							for (let j = 0; j < ct; j ++) {
								const i = j * 5;
								if (i + 4 >= pack.length) break;
								const obj : Select_Card = {
									code : pack[i],
									tp : to_player(pack[i + 1]),
									loc : pack[i + 2],
									seq : pack[i + 3],
									ct : pack[i + 4]
								};
								const card : Client_Card | undefined = to_card(obj.tp, obj.loc, obj.seq, obj.ct);
								if (card) {
									obj.card = card;
									codes.push({ card : card, code : obj.code });
								}
								result.push(obj);
							}
							await mainGame.load.pic(codes.map(i => i.code));
							for (const i of codes)
								await i.card.update.code(i.code);
							const title = !!this.select_hint ? mainGame.get.desc(this.select_hint)
								: mainGame.get.strings.system(560);
							const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.ALL)!(2).filter((i : Client_Card) => i.activatable.flag > 0);
							cards.forEach(i => i.activatable.clear());
							connect.select.cards.on(title, result, min, max, cancelable);
							this.select_hint = 0;
						}],
						[MSG.SELECT_UNSELECT_CARD, async () => {
							let pack = to_package<number>(buffer, data, [-1].concat(new Array(4).fill(8)), pos);
							const cancelable = !!(pack[0] + pack[1]);
							const min = pack[2];
							const max = pack[3];
							let [ct] = to_package<number>(buffer, data, [8], pos + 5);
							pack = to_package<number>(buffer, data, new Array(ct).fill([32, 8, 8, 8, 8]).flat(), pos + 6);
							const unselected : Select_Cards = [];
							const codes : Update_Cards = [];
							for (let j = 0; j < ct; j ++) {
								const i = j * 5;
								if (i + 4 >= pack.length) break;
								const obj : Select_Card = {
									code : pack[i],
									tp : to_player(pack[i + 1]),
									loc : pack[i + 2],
									seq : pack[i + 3],
									ct : pack[i + 4]
								};
								const card : Client_Card | undefined = to_card(obj.tp, obj.loc, obj.seq, obj.ct);
								if (card) {
									obj.card = card;
									codes.push({ card : card, code : obj.code });
								}
								unselected.push(obj);
							}
							const p = pos + 6 + ct * 8;
							[ct] = to_package<number>(buffer, data, [8], p);
							pack = to_package<number>(buffer, data, new Array(ct).fill([32, 8, 8, 8, 8]).flat(), p + 1);
							const selected : Select_Cards = [];
							for (let j = 0; j < ct; j ++) {
								const i = j * 5;
								if (i + 4 >= pack.length) break;
								const obj : Select_Card = {
									code : pack[i],
									tp : to_player(pack[i + 1]),
									loc : pack[i + 2],
									seq : pack[i + 3],
									ct : pack[i + 4]
								};
								const card : Client_Card | undefined = to_card(obj.tp, obj.loc, obj.seq, obj.ct);
								if (card) {
									obj.card = card;
									codes.push({ card : card, code : obj.code });
								}
								selected.push(obj);
							}
							await mainGame.load.pic(codes.map(i => i.code));
							for (const i of codes)
								await i.card.update.code(i.code);
							const title = !!this.select_hint ? mainGame.get.desc(this.select_hint)
								: mainGame.get.strings.system(560);
							const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.ALL)!(2).filter((i : Client_Card) => i.activatable.flag > 0);
							cards.forEach(i => i.activatable.clear());
							connect.select.group.on(title, unselected, selected, min, max, cancelable);
							this.select_hint = 0;
						}],
						[MSG.SELECT_CHAIN, async () => {
							let pack = to_package<number>(buffer, data, [-1, 8, 8, -4, -4], pos);
							const count = pack[0];
							const array = new Array(count).fill([8, 8, 32, 8, 8, 8, 8, 32]).flat();
							pack = to_package<number>(buffer, data, array, pos + 11);
							const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.ALL)!(2).filter((i : Client_Card) => i.activatable.flag > 0);
							for (const i of Object.values(connect.idle))
								(i as Idle).clear();
							const codes : Update_Cards = [];
							for (let j = 0; j < count; j ++) {
								const i = j * 8;
								if (i + 7 >= pack.length) break;
								const forced = pack[i + 1];
								const flag = pack[i] | (forced << 8);
								const code = pack[i + 2];
								const tp = to_player(pack[i + 3]);
								const loc = pack[i + 4];
								const seq = pack[i + 5];
								const ct = pack[i + 6];
								const desc = pack[i + 7];
								if (loc !== LOCATION.OVERLAY) {
									const card : Client_Card | undefined = to_card(tp, loc, seq, ct)
									if (card) {
										codes.push({ card : card, code : code });
										idles.get(COMMAND.ACTIVATE)!(card, desc);
										const index = cards.indexOf(card);
										if (index > -1)
											cards.splice(index, 1);
										card.activatable.on({desc : desc, flag : flag}, false);
									}
								}
							}
							cards.forEach(i => i.activatable.clear());
							await mainGame.load.pic(codes.map(i => i.code));
							for (const i of codes)
								await i.card.update.code(i.code);
							if (connect.idle.activate.length() === 0)
								this.send.response(-1);
						}],
						[MSG.SELECT_PLACE, async () => {
							const pack = to_package<number>(buffer, data, [8, 8, 32], pos);
							const tp = pack[0];
							const ct = Math.max(pack[1], 1);
							const place = tp === to_player(0) ? ~pack[2] : ((~pack[2] >> 16) | (~pack[2] << 16));
							const title = !!this.select_hint ? mainGame.get.strings.system(569, mainGame.get.name(this.select_hint))
								: mainGame.get.strings.system(560);
							this.select_hint = 0;
							const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.ALL)!(2).filter((i : Client_Card) => i.activatable.flag > 0);
							cards.forEach(i => i.activatable.clear());
							connect.select.plaids.on(title, connect.duel.plaid.get(place), place, ct);
						}],
						[MSG.SELECT_DISFIELD, async () => {
							const pack = to_package<number>(buffer, data, [8, 8, 32], pos);
							const tp = pack[0];
							const ct = Math.max(pack[1], 1);
							const place = tp === to_player(0) ? ~pack[2] : ((~pack[2] >> 16) | (~pack[2] << 16));
							const title = !!this.select_hint ? mainGame.get.desc(this.select_hint)
								: mainGame.get.strings.system(570);
							this.select_hint = 0;
							const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.ALL)!(2).filter((i : Client_Card) => i.activatable.flag > 0);
							cards.forEach(i => i.activatable.clear());
							connect.select.plaids.on(title, connect.duel.plaid.get(place), place, ct);
						}],
						[MSG.SELECT_POSITION, async () => {
							const pack = to_package<number>(buffer, data, [-1, 32, 8], pos);
							const code = pack[0];
							const position = pack[1];
							[POS.FACEUP_ATTACK, POS.FACEUP_DEFENSE, POS.FACEDOWN_ATTACK, POS.FACEDOWN_DEFENSE]
								.includes(position) ? await this.send.response(position)
									: connect.select.position.on(mainGame.get.strings.system(561), code, position);
						}],
						[MSG.NEW_TURN, async () => {
							const pack = to_package<number>(buffer, data, [8], pos);
							this.turn_player = to_player(pack[0]);
							await connect.phase.on(this.turn_player, PHASE.NONE);
							await mainGame.sleep(500);
						}],
						[MSG.NEW_PHASE, async () => {
							const [phase] = to_package<number>(buffer, data, [16], pos);
							await connect.phase.on(this.turn_player, phase);
							await mainGame.sleep(500);
						}],
						[MSG.MOVE, async () => {
							const pack = to_package<number>(buffer, data, [32].concat(new Array(8).fill(8), [32]), pos);
							const code = pack[0];
							const from = {
								player : to_player(pack[1]),
								loc : pack[2],
								seq : pack[3],
								ct : pack[4]
							};
							const to = {
								player : to_player(pack[5]),
								loc : pack[6],
								seq : pack[7],
								pos : pack[8]
							};
							const reason = pack[9];
							const is_xyz = (from.loc & LOCATION.OVERLAY) > 0;
							const is_onfield = (from.loc & LOCATION.ONFIELD) > 0;
							const card : Client_Card | undefined = to_card(from.player, from.loc, from.seq, from.ct);
							if (card)
								await card.update.code(code);
							from.loc === 0 ? await (async () => {
								connect.duel.add.card(to.player, to.loc, to.seq, code);
							})() : await (async () => {
								switch (to.loc) {
									case LOCATION.NONE:
										connect.duel.to.none(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											zone : to.seq,
											pos : to.pos
										}, to.player);
										break;
									case LOCATION.MZONE:
										connect.duel.to.mzone(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											zone : to.seq,
											pos : to.pos
										}, to.player);
										break;
									case LOCATION.SZONE:
										connect.duel.to.szone(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											zone : to.seq,
											pos : to.pos
										}, to.player);
										break;
									case LOCATION.GRAVE:
										connect.duel.to.grave(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											pos : to.pos
										}, to.seq, to.player);
										break;
									case LOCATION.REMOVED:
										connect.duel.to.grave(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											pos : to.pos
										}, to.seq, to.player);
										break;
									case LOCATION.DECK:
										connect.duel.to.deck(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											pos : to.pos
										}, to.seq, to.player);
										break;
									case LOCATION.EXTRA:
										connect.duel.to.extra(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											pos : to.pos
										}, to.seq, to.player);
										break;
									case LOCATION.OVERLAY:
										connect.duel.to.overlay(from.player, {
											location : is_xyz ? LOCATION.MZONE | (from.seq << 16) : is_onfield ? from.loc | (from.seq << 16) : from.loc,
											seq : is_xyz ? from.ct : is_onfield ? -1 : from.seq,
											zone : to.seq,
											pos : to.pos
										}, to.player);
										break;
								}
							})();
						}],
						[MSG.CHAINING, async () => {
							const pack = to_package<number>(buffer, data, [32].concat(new Array(7).fill(8), [32]), pos);
							const code = pack[0];
							const player = to_player(pack[1]);
							const loc = pack[2];
							const seq = pack[3];
							const ct = pack[4];
							const card : Client_Card | undefined = to_card(player, loc, seq, ct);
							if (card) {
								await card.update.code(code);
								card.show.activate();
							}
							const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.ALL)!(2).filter((i : Client_Card) => i.activatable.flag > 0);
							cards.forEach(i => i.activatable.clear());
							connect.chains.push({ player : player, code : code });
							await mainGame.sleep(300);
						}],
						[MSG.CHAINED, async () => {
							const [ct] = to_package<number>(buffer, data, [8], pos);
							// console.log(connect.chains[ct - 1]);
						}],
						[MSG.CHAIN_SOLVING, async () => {
							const [ct] = to_package<number>(buffer, data, [8], pos);
							connect.chains.splice(ct - 1, 1);
						}],
						[MSG.DRAW, async () => {
							const pack = to_package<number>(buffer, data, [8, 8], pos);
							const tp = to_player(pack[0]);
							const ct = pack[1];
							if (tp === 0) {
								const cards : Array<Client_Card> = connect.duel.cards.get(LOCATION.DECK)!(tp);
								const codes = to_package<number>(buffer, data, new Array(ct).fill(32), pos + 2);
								await mainGame.load.pic(codes);
								let i = 1;
								for (const code of codes) {
									const v = cards.length - i;
									if (v < 0)
										break;
									await cards[v].update.code(code);
									i ++;
								}
							}
							await connect.duel.draw(tp, ct);
						}]
					]);
					const cur_msg : number = to_package<number>(buffer, data, [8], pos)[0];
					pos += 1;
					console.log(cur_msg)
					if (connect.select.group.chk && cur_msg !== MSG.SELECT_UNSELECT_CARD)
						connect.select.group.clear();
					if (msg_funcs.has(cur_msg))
						await msg_funcs.get(cur_msg)!();
				}
			],
			[STOC.ERROR_MSG,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, [8, -3, 32], pos);
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
									str = mainGame.get.text(I18N_KEYS.UNKNOW);
									break;
							}
							connect.chk_deck(str);
							error(str);
							break;
					}
				}
			],
			[STOC.SELECT_HAND,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					connect.rps.chk = true;
				}
			],
			[STOC.SELECT_TP,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					if (connect.rps.chk)
						connect.rps.chk = false;
					connect.is_first.selecting = true;
				}
			],
			[STOC.HAND_RESULT,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, new Array(2).fill(8), pos);
					connect.rps.result = pack;
				}
			],
			[STOC.DECK_COUNT,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, new Array(6).fill(16), pos);
					connect.deck_count = pack;
					console.log(connect.deck_count)
				}
			],
			[STOC.JOIN_GAME,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, [32].concat(new Array(5).fill(8), [-3, 32, 8, 8, 16]), pos);
					connect.home.lflist = pack[0];
					connect.home.rule = pack[1];
					connect.home.mode = pack[2];
					connect.home.duel_rule = pack[3];
					connect.home.no_check_deck = pack[4] === 0;
					connect.home.no_shuffle_deck = pack[5] === 0;
					connect.home.start_lp = pack[6];
					connect.lp.ct = new Array(2).fill(pack[6]);
					connect.home.start_hand = pack[7];
					connect.home.draw_count = pack[8];
					connect.home.time_limit = pack[9];
					connect.state = 1;
				}
			],
			[STOC.TYPE_CHANGE,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, [8], pos);
					const self = pack[0] & 0xf;
					const is_host = ((pack[0] >> 4) & 0xf) != 0;
					connect.is_host = is_host;
					connect.self = self;
				}
			],
			[STOC.DUEL_START,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					connect.state = 2;
					connect.rps.chk = true;
				}
			],
			[STOC.TIME_LIMIT,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, [8, -1, 16], pos);
					connect.time.to(pack[0], pack[1]);
					if(to_player(pack[0]) === 0)
						this.send.on(CTOS.TIME_CONFIRM);
				}
			],
			[STOC.CHAT,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					let pack = to_package<number | string>(buffer, data, [16, (len - 2).toString()], pos);
					const player : number = pack[0] as number;
					let str = '';
					if (player < 4) {
						if (mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_HIDDEN_CHAT))
							return;
						str += connect.player[player].name;
					} else if ((player < 11 || player > 19) && player !== 8) {
						str += mainGame.get.text(I18N_KEYS.SERVER_WATCHER)
					}
					if (str.length > 0)
						str += ' : '
					str += pack[1] as string;
					if (connect.self !== player)
						toast.info(str, true);
					connect.chat.list.push({ msg : str, contentType : 1 } as Chat);
				}
			],
			[STOC.HS_PLAYER_ENTER,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, [40, 8], pos);
					connect.player[pack[1]] = {
						name : mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_HIDDEN_NAME) && connect.self !== pack[1] ?
							mainGame.get.text(I18N_KEYS.HIDDEN_NAME) : pack[0],
						ready : false
					};
				}
			],
			[STOC.HS_PLAYER_CHANGE,
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, [8], pos);
					const state = pack[0] & 0xf;
					const player = (pack[0] >> 4) & 0xf;
					switch (state) {
						case PLAYERCHANGE.OBSERVE:
							connect.player[player] = { name : '' };
							connect.home.watch ++;
							break;
						case PLAYERCHANGE.READY:
							connect.player[player].ready = true;
							if (connect.chk_deck)
								connect.chk_deck(true);
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
				async (buffer : Uint8Array<ArrayBuffer>, data : DataView, len : number, connect : Reactive<any>, pos : number) => {
					const pack = to_package<number>(buffer, data, [16], pos);
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
			obj[0] = new Message((deck.main.length + deck.extra.length), 32);
			obj[1] = new Message(deck.side.length, 32);
			let v = 2;
			for (const i of deck.main) {
    			obj[v] = new Message(i, 32);
				v ++;
			}
			for (const i of deck.extra) {
				obj[v] = new Message(i, 32);
				v ++;
			}
			for (const i of deck.side) {
				obj[v] = new Message(i, 32);
				v ++;
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
		response : async (res : number | object | Array<number | string>) : Promise<void> => {
			await this.send.on(CTOS.RESPONSE, typeof res === 'number' ? new Message(res, 32) : (() : object => {
				const obj : { [key : string | number] : Message<number | string> } = {};
				Array.isArray(res) ?
					(() => {
						for (const [i, v] of res.entries())
							obj[i] = typeof v === 'number' ? new Message(v, 8) : new Message(v);
					})()
					: (() => {
						for (const [i, v] of Object.entries(res))
							obj[i] = typeof v === 'number' ? new Message(v, 8) : new Message(v);
					})()
				return obj;
			})());
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
export type { HostInfo, Player, Select_Card, Chats, Plaids, Select_Cards, Idles_Cards, Idles_Card };