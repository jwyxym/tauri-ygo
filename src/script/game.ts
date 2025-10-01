import { exit } from '@tauri-apps/plugin-process';
import { DirEntry } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

import fs from './fs';
import constant from './constant';
import invoke from './invoke';
import Card, { Search } from './card';
import textLike from './language/interface';
import Zh_CN from './language/Zh-CN';

import voice from '../pages/voice/voice';
import Deck from '../pages/deck/deck';

class Game {
	strings : Map<string, Map<number, string>> = new Map([
		[constant.str.string_conf.system, new Map],
		[constant.str.string_conf.victory, new Map],
		[constant.str.string_conf.counter, new Map],
		[constant.str.string_conf.setcode, new Map],
		[constant.str.info_conf.ot, new Map],
		[constant.str.info_conf.attribute, new Map],
		[constant.str.info_conf.category, new Map],
		[constant.str.info_conf.link, new Map],
		[constant.str.info_conf.race, new Map],
		[constant.str.info_conf.type, new Map]
	]);
	lflist : Map<string, {hash : number, map : Map<number, number>}> = new Map;
	system : Map<string, string> = new Map;
	servers : Map<string, string> = new Map;
	cards : Map<number, Card> = new Map;
	textures : Map<string, string> = new Map;
	bgm : Map<string, Map<string, string>> = new Map([
		[constant.str.system_conf.sound.back, new Map],
		[constant.str.system_conf.sound.button, new Map]
	]);
	version = 0x1362;
	max_card_id = 0x0fffffff;
	select = 'Zh_CN';
	interval = -1;
	interval_ct = 0;
	unknown : Card = new Card([...new Array(11).fill(0), ...new Array(19).fill('')]);

	private lflist_now : string = '';

    init = async (chk : boolean = true) : Promise<void> => {
		try {
			//新建所需要的文件夹
			for (const [_, i] of Object.entries(constant.str.dirs)) {
				if (!await fs.exists(i))
					await fs.write.dir(i);
			}

			//初始化资源
			if (chk)
				await fs.init();

			//读取./textures文件夹
			for (const i of await fs.read.dir(constant.str.dirs.textures, false)) {
				if (i.name.match(constant.reg.picture)) {
					const url : string | undefined = await fs.read.picture(await join(constant.str.dirs.textures, i.name));
					if (url)
						this.textures.set(i.name, url);
				}
			}

			//读取system.conf文件夹
			const text : string | undefined = await fs.read.text(constant.str.files.system);
			if (text !== undefined) {
				const lines : Array<string> = text.split(constant.reg.line_feed);
				for (const i of lines) {
					const line : string = i.trim();
					this.read.system_conf(line);
				}
			}

			//读取./sound文件夹
			for (const i of await fs.read.dir(constant.str.dirs.sound, false)) {
				if (i.name.match(constant.reg.bgm)) {
					const url : string | undefined = await fs.read.bgm(await join(constant.str.dirs.sound, i.name));
					if (url)
						this.bgm.get(constant.str.system_conf.sound.back)!.set(i.name, url);
				}
			}

			this.unknown.update_pic(this.textures.get(constant.str.files.textures.unknown) ?? '');
			await fs.write.system();
			await this.load.card();
			await this.load.expansion();
			const deck = Array.from(this.cards.keys()).filter(_ => Math.random() > 0.5);
			await this.load.pic(deck.splice(0, deck.length > 100 ? 100 : deck.length));
		} catch (error) {
			fs.write.log(error);
		}
	};

	reload = async () : Promise<void> => {
		try {
			this.clear();
			await this.load.card();
			await this.load.expansion();
		} catch (error) {
			fs.write.log(error);
		}
	};

	get = {
		text : () : textLike => {
			switch (this.select) {
				case constant.str.language.Zh_CN:
					return Zh_CN;
			}
			return Zh_CN;
		},
		system : (key : string) : Array<string> | string | number | boolean | undefined => {
			const value = this.system.get(key);
			const number = Number(value)
			if (key === constant.str.system_conf.string.expansion) {
				return (value ?? '').split('&&').filter(i => i !== '');
			} else if (Object.entries(constant.str.system_conf.string).findIndex(i => i[1] === key) > -1) {
				return value ?? '';
			} else if (Object.entries(constant.str.system_conf.sound).findIndex(i => i[1] === key) > -1) {
				return isNaN(number) ? 0 : number;
			} else {
				return !!number;
			}
		},
		textures : (key : string) : string | undefined => {
			return this.textures.get(key);
		},
		card : (key : string | number) : Card => {
			key = typeof key == 'string' ? parseInt(key) : key;
			return this.cards.get(key) ?? this.unknown;
		},
		expansions : async () : Promise<{
			loading : Array<string>;
			ypk :  Array<DirEntry>;
			files : Array<DirEntry>;
		}> => {
			const load_expansion : Array<string> = this.get.system(constant.str.system_conf.string.expansion) as Array<string> ?? [];
			const expansion_files : Array<DirEntry> = await fs.read.dir(constant.str.dirs.expansions, false);
			const expansion_ypk : Array<DirEntry> = expansion_files.filter(i => i.isFile && i.name.match(constant.reg.zip));
			const load : Array<string> = load_expansion.filter(i => { return expansion_ypk.findIndex(j => j.name === i) > -1; });
			this.system.set(constant.str.system_conf.string.expansion, load.join('&&'));
			for (let i = 0; i < load.length; i++) {
				load[i] = await join(constant.str.dirs.expansions, load[i]);
			}
			return {
				loading : load,
				ypk : expansion_ypk,
				files : await fs.read.dir(constant.str.dirs.expansions)
			};
		},
		lflist : (key : string | number, card : string | number | undefined = undefined) : string | number => {
			if (typeof key === 'string' && card) {
				const lflist = this.lflist.get(key);
				if (lflist) {
					card = typeof card == 'string' ? parseInt(card) : card;
					return lflist.map.get(card) ?? 3;
				}
				return 3;
			} else {
				const name = Array.from(this.lflist).find(i => i[1].hash === key) ?? [this.get.text().unknow];
				return name[0];
			}
		},
		pics : () : Array<string> => {
			return Array.from(this.cards.values()).filter(i => i.has_pic()).map(i => i.pic);
		},
		strings : {
			system : (key : number, replace : Array<string | number> | string | number = []) : string => {
				let value = this.strings.get(constant.str.string_conf.system)!.get(key) ?? this.get.text().unknow;
				replace = typeof replace === 'object' ? replace : [replace];
				for (const str of replace) {
					value = value.replace(constant.str.replace.strings[typeof str === 'string' ? 0 : 1], `${str}`);
				}
				return value;
			}
		}
	}

	load = {
		ypk : async (path : string) : Promise<void> => {
			const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(path);
			for (const [_, v] of ypk.get(constant.reg.database) ?? new Map()) {
				const db = await fs.read.database_in_memory(v as Uint8Array<ArrayBuffer>);
				if (db !== undefined)
					this.read.database(db);
			}
			for (const [i, v] of ypk.get(constant.reg.conf) ?? new Map()) {
				if (i.endsWith(constant.str.files.conf.strings)) {
					const lines : Array<string> = v.split(constant.reg.line_feed);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.string_conf(line);
					}
				} else if (i.endsWith(constant.str.files.conf.servers)) {
					const lines : Array<string> = v.split(constant.reg.line_feed);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.servers_conf(line);
					}
				} else if (i.endsWith(constant.str.files.conf.lflist)) {
					const lines : Array<string> = v.split(constant.reg.line_feed);
					for (const [v, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.lflist_conf(line);
						if (v === (lines.length - 1))
							this.lflist_now = '';
					}
				} else if (i.endsWith(constant.str.files.conf.servers)) {
					const lines : Array<string> = v.split(constant.reg.line_feed);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.info_conf(line);
					}
				}
			}
			for (const [_, v] of ypk.get(constant.reg.ini) ?? new Map()) {
				this.read.ini(v);
			}
		},
		deck : async () : Promise<Array<Deck>> => {
			let decks : Array<Deck> = [];
			for (const i of await fs.read.dir(constant.str.dirs.deck)) {
				if (i.name.match(constant.reg.deck)) {
					const ydk : Deck | undefined = await fs.read.ydk(i.name);
					const name = i.name.match(constant.reg.get_name) ?? [];
					if (name.length >= 2 && ydk !== undefined) {
						ydk.push_name(name[1]);
						decks.push(ydk);
					}
				}
			}
			return decks;
		},
		pic : async (deck : Array<number> | Deck) : Promise<void> => {
			deck = deck instanceof Deck ? [...deck.main, ...deck.side, ...deck.extra] : deck;
			const filter = (i : number, v : number, a : Array<number>) => {
				const card = this.cards.get(i);
				return a.indexOf(i) === v && card != undefined && card.pic === '';
			}
			deck = deck.filter(filter);
			if (deck.length === 0) return;
			const load = (await this.get.expansions()).loading;
			for (const i of load.filter(i => i.match(constant.reg.zip))) {
				const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(i, deck.map(num => num.toString()));
				for (const code of deck) {
					const blob = ypk.get(constant.reg.picture)!.get(code.toString());
					if (blob != undefined)
						this.cards.get(code)!.update_pic(URL.createObjectURL(blob as Blob));
				}
				deck = deck.filter(filter);
			}
			deck = deck.filter(filter);
			const pics : Map<number, Blob> = await fs.read.pics(deck);
			for (const code of deck) {
				const blob = pics.get(code);
				if (blob != undefined)
					this.cards.get(code)!.update_pic(URL.createObjectURL(blob));
			}
			deck = deck.filter(filter);
			for (const code of deck) {
				this.cards.get(code)!.update_pic(this.get.textures(constant.str.files.textures.unknown) ?? '');
			}

		},
		card : async () : Promise<void> => {
			//读取目录下的所有conf
			for (const [_, conf] of Object.entries(constant.str.files.conf)) {
				if (!fs.exists(conf)) continue;
				const text : string | undefined = await fs.read.text(conf);
				if (text === undefined) continue;
				const lines : Array<string> = text.split(constant.reg.line_feed);
				for (const [v, i] of lines.entries()) {
					const line : string = i.trim();
					switch (conf) {
						case constant.str.files.conf.servers:
							this.read.servers_conf(line);
							break;
						case constant.str.files.conf.strings:
							this.read.string_conf(line);
							break;
						case constant.str.files.conf.lflist:
							this.read.lflist_conf(line);
							if (v === (lines.length - 1))
								this.lflist_now = '';
							break;
						case constant.str.files.conf.info:
							this.read.info_conf(line);
							break;
					}
				}
			}
			//读取目录下的cards.cdb
			if (await fs.exists(constant.str.files.database)) {
				const database : Array<Array<string | number>> | undefined = await fs.read.database(constant.str.files.database);
				if (database !== undefined)
					this.read.database(database);
			}
		},
		expansion : async () : Promise<void> => {
			// 读取expnasions文件夹
			const expansion = await this.get.expansions();
			const files = expansion.files.map(i => i.name);
			const load = expansion.loading;
			//读取cdb
			for (const i of files.filter(i => i.match(constant.reg.database))) {
				const database : Array<Array<string | number>> | undefined = await fs.read.database(i);
				if (database !== undefined)
					this.read.database(database);
			}
			//读取conf
			for (const i of files.filter(i => i.match(constant.reg.conf))) {
				if (i.endsWith(constant.str.files.conf.strings)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(constant.reg.line_feed);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.string_conf(line);
					}
				} else if (i.endsWith(constant.str.files.conf.servers)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(constant.reg.line_feed);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.servers_conf(line);
					}
				} else if (i.endsWith(constant.str.files.conf.lflist)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(constant.reg.line_feed);
					for (const [v, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.lflist_conf(line);
						if (v === (lines.length - 1))
							this.lflist_now = '';
					}
				} else if (i.endsWith(constant.str.files.conf.info)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(constant.reg.line_feed);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.info_conf(line);
					}
				}
			}
			//读取ini
			for (const i of files.filter(i => i.match(constant.reg.ini))) {
				const string : string | undefined = await fs.read.text(i);
				if (string !== undefined)
					this.read.ini(string);
			}
			//读取ypk\zip
			for (const i of load.filter(i => i.match(constant.reg.zip))) {
				this.load.ypk(i);
			}
		}
	}

	clear = () : void => {
		this.cards.forEach(i => {
			i.clear();
		});
		this.cards = new Map();
		this.lflist = new Map();
		this.servers = new Map();
		this.strings = new Map([
			[constant.str.string_conf.system, new Map],
			[constant.str.string_conf.victory, new Map],
			[constant.str.string_conf.counter, new Map],
			[constant.str.string_conf.setcode, new Map],
			[constant.str.info_conf.ot, new Map],
			[constant.str.info_conf.attribute, new Map],
			[constant.str.info_conf.category, new Map],
			[constant.str.info_conf.link, new Map],
			[constant.str.info_conf.race, new Map],
			[constant.str.info_conf.type, new Map]
		]);
	}

	read = {
		servers_conf : (line : string) : void => {
			const key_value : Array<string> = line.split('|');
			if (key_value.length == 2)
				this.servers.set(key_value[0], key_value[1])
		},
		string_conf : (line : string) : void => {
			if (line.startsWith('#'))
				return;
			const key_value = line.split(' ');
			if (key_value.length == 3) {
				const key = parseInt(key_value[1]);
				if (isNaN(key)) return;
				switch (key_value[0]) {
					case constant.str.string_conf.system:
						this.strings.get(
							constant.str.string_conf.system
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.string_conf.victory:
						this.strings.get(
							constant.str.string_conf.victory
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.string_conf.counter:
						this.strings.get(
							constant.str.string_conf.counter
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.string_conf.setcode:
						this.strings.get(
							constant.str.string_conf.setcode
						)!.set(
							key,
							key_value[2]
						);
						break;
				}
			}
		},
		lflist_conf : (line : string) : void => {
			if (line.startsWith('#'))
				return;
			if (line.startsWith('!')) {
				this.lflist.set(line.slice(1), {hash : 0x7dfcee6a, map : new Map()});
				this.lflist_now = line.slice(1);
			} else if (this.lflist_now !== '') {
				const key_value = line.split(' ');
				if (key_value.length >= 2) {
					const code = parseInt(key_value[0]);
					const count = parseInt(key_value[1]);
					const lflist = this.lflist.get(this.lflist_now)!;
					lflist.map.set(code, count);
					lflist.hash ^= ((code << 18) | (code >> 14)) ^ ((code << (27 + count)) | (code >> (5 - count)));
				}
			}
		},
		system_conf : (line : string) : void => {
			if (line.startsWith('#') || line.length === 0)
				return;
			const key_value = line.split('=', 2);
			if (key_value.length == 2) {
				this.system.set(key_value[0].trim(), key_value[1].trim());
			}
		},
		database : (db : Array<Array<string | number>>) : void => {
			for (const i of db) {
				const code : number = i[0] as number;
				if (this.cards.has(code))
					this.cards.get(code)!.clear()
				this.cards.set(code, new Card(i));
			}
		},
		ini : (string : string) : void => {
			const lines = string.split(constant.reg.line_feed);
			let name : string = '';
			let host : string = '';
			let port : string = '';
			for (const l of lines) {
				const line = l.trim();
				if (line.startsWith(constant.str.ini.name)) {
					const i = line.split('=');
					if (i.length == 2)
						name = i[1].trim();
				} else if (line.startsWith(constant.str.ini.host)) {
					const i = line.split('=');
					if (i.length == 2)
						host = i[1].trim();
				} else if (line.startsWith(constant.str.ini.port)) {
					const i = line.split('=');
					if (i.length == 2)
						port = i[1].trim();
				}
			}
			if (name.length > 0 && host.length > 0)
				this.servers.set(name, `${host}${port.length > 0 ? `:${port}` : ''}`);
		},
		info_conf : (line : string) : void => {
			if (line.startsWith('#'))
				return;
			const key_value = line.split(' ');
			if (key_value.length == 3) {
				const key = parseInt(key_value[1]);
				if (isNaN(key)) return;
				switch (key_value[0]) {
					case constant.str.info_conf.ot:
						this.strings.get(
							constant.str.info_conf.ot
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.info_conf.attribute:
						this.strings.get(
							constant.str.info_conf.attribute
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.info_conf.link:
						this.strings.get(
							constant.str.info_conf.link
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.info_conf.category:
						this.strings.get(
							constant.str.info_conf.category
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.info_conf.race:
						this.strings.get(
							constant.str.info_conf.race
						)!.set(
							key,
							key_value[2]
						);
						break;
					case constant.str.info_conf.type:
						this.strings.get(
							constant.str.info_conf.type
						)!.set(
							key,
							key_value[2]
						);
						break;
				}
			}
		}
	};

	search = {
		cards : (search : Search) : Array<Card> => {
			let result : Array<Card> = [];

			const ot = search.ot === undefined ? 0 : search.ot;
			const type  = search.type === undefined ? 0 : search.type;
			const attribute  = search.attribute === undefined ? 0 : search.attribute;
			const race  = search.race === undefined ? 0 : search.race;
			const category  = search.category === undefined ? 0 : search.category;
			const desc = search.desc?.split(' ') ?? [];
			const level = search.level?.split(' ') ?? [];
			const scale = search.scale?.split(' ') ?? [];
			const atk = search.atk?.split(' ') ?? [];
			const def = search.def?.split(' ') ?? [];
			const link = search.link === undefined ? 0 : search.link;
			const lflist = search.lflist !== undefined && this.lflist.has(search.lflist) ? this.lflist.get(search.lflist)!.map : new Map;
			const forbidden = search.forbidden ?? [];
			const filter = (card : Card) : boolean => {
				if (forbidden.length > 0) {
					const ct = lflist.get(card.id) as number;
					if (ct === undefined ? !forbidden.includes(3) : !forbidden.includes(ct))
						return false;
				}
				if ((search.desc ?? '').length > 0) {
					for (const i of desc) {
						const id = Number(i);
						if (
							(i !== '' && !card.name.includes(i) && !card.desc.includes(i))
								&& (isNaN(id) ? true : card.id !== id && card.alias !== id && desc.length == 1)
						)
							return false;
					}
					if (desc.length == 2 && desc.every(i => {
						const id = Number(i);
						return !isNaN(id);
					})) {
						const id = desc.map(i => Number(i)).sort((a, b) => { return a - b; });
						console.log(card.id, card.alias)
						if ((card.id < id[0] || card.id > id[1]) && (card.alias < id[0] || card.alias > id[1]))
							return false;
					}
				}

				if ((ot > 0 && card.ot !== ot)
					|| (type > 0 && (card.type & type) !== type)
					|| (attribute > 0 && (card.attribute & attribute) !== attribute)
					|| (race > 0 && (card.race & race) !== race)
					|| (category > 0 && (card.category & category) !== category)
				)
					return false;

				if ((search.level ?? '').length > 0 && !level.includes(card.level.toString()))
					return false;

				if ((search.scale ?? '').length > 0 && (!card.is_pendulum() || !scale.includes(card.scale.toString())))
					return false;

				if ((search.atk ?? '').length > 0 && (card.atk < 0 ? !atk.includes('?') : !atk.includes(card.atk.toString())))
					return false;

				if (card.is_link()) {
					if ((search.def ?? '').length > 0 || (card.def & link) !== link)
						return false;
				} else {
					if (link > 0)
						return false;
					if ((search.def ?? '').length > 0 && (card.def < 0 ? !def.includes('?') : !def.includes(card.def.toString())))
						return false;
				}

				return true;
			};
			for (const [_, card] of this.cards) {
				if (filter(card))
					result.push(card);
			}
			return result;
		}
	}

	push = {
		system : (key : string, n : string | number | boolean) : void => {
			const to_string = (str : string) : string => {
				const value = this.system.get(key) ?? '';
				return `${value}${value.length > 0 ? '&&' : ''}${str}`
			}
			if (key === constant.str.system_conf.string.expansion) {
				this.system.set(key, to_string(n as string));
			} else if (Object.entries(constant.str.system_conf.string).findIndex(i => i[1] === key) > -1) {
				this.system.set(key, n as string);
			} else if (Object.entries(constant.str.system_conf.sound).findIndex(i => i[1] === key) > -1) {
				this.system.set(key, n.toString());
				voice.update(key);
			} else {
				this.system.set(key, n ? '1' : '0');
			}
		}
	};

	remove = {
		system : (key : string, n : string) : void => {
			const get = this.get.system(key);
			if (typeof get === 'object') {
				const ct = get.indexOf(n)
				if (ct > -1) {
					const to_string = () : string => {
						return get.filter(i => i !== n ).join('&&');
					}
					this.system.set(key, to_string());
				}
			}
		}
	};

	chk = {
		file : async () : Promise<boolean> => {
			return await fs.exists(constant.str.files.assets);
		},
		version :  async () : Promise<boolean> => {
			const time = await invoke.version(constant.str.url.version, constant.str.url.headers.version);
			const local = this.get.system(constant.str.system_conf.string.download_time);
			if (typeof time === 'string' && typeof local === 'string') {
				return new Date(time) <= new Date(local);
			} else if (local === undefined)
				return true;
			return false;
		},
	}

	exit = async () : Promise<void> => {
		return await exit(1);
	};

	is_android = () : boolean => {
		return constant.system.system == 'android';
	};
};

const mainGame = new Game();
export default mainGame;