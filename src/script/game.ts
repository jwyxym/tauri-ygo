import { exit } from '@tauri-apps/plugin-process';
import { DirEntry } from '@tauri-apps/plugin-fs';

import fs from './fs';
import constant from './constant';
import Deck from './deck';
import Card, { Search } from './card';
import textLike from './language/interface';
import Zh_CN from './language/Zh-CN';

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
	lflist : Map<string, Map<number, number>> = new Map;
	system : Map<string, boolean> = new Map;
	servers : Map<string, string> = new Map;
	cards : Map<number, Card> = new Map;
	textures : Map<string, string> = new Map;
	select = 'Zh_CN';
	interval = -1;
	interval_ct = 0;

	private lflist_now : string = '';

    init = async () : Promise<void> => {
		try {
			//新建所需要的文件夹
			for (const [_, i] of Object.entries(constant.str.dirs)) {
				if (!await fs.exists(i))
					await fs.write.dir(i);
			}
			//读取./textures文件夹
			for (const i of await fs.read.dir(constant.str.dirs.textures) ?? []) {
				if (i.name.match(constant.reg.picture)) {
					const url : string | undefined = await fs.read.picture(i.name);
					const name = i.name.match(constant.reg.get_name) ?? [];
					if (name.length >= 2 && url !== undefined)
						this.textures.set(name[1], url);
				}
			}
			//读取目录下的所有conf
			for (const [_, conf] of Object.entries(constant.str.files.conf)) {
				const text : string | undefined = await fs.read.text(conf);
				if (text === undefined) continue;
				const lines : Array<string> = text.split(/\r?\n/);
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
						case constant.str.files.conf.system:
							this.read.system_conf(line);
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
					await this.read.database(database);
			}
			// 读取expnasions文件夹
			const expnasion_files : Array<DirEntry> = await fs.read.dir(constant.str.dirs.expansions) ?? [];
			//读取cdb
			for (const i of expnasion_files.filter(i => i.name.match(constant.reg.database))) {
				const database : Array<Array<string | number>> | undefined = await fs.read.database(i.name);
				if (database !== undefined)
					await this.read.database(database);
			}
			//读取conf
			for (const i of expnasion_files.filter(i => i.name.match(constant.reg.conf))) {
				if (i.name.endsWith(constant.str.files.conf.strings)) {
					const text : string | undefined = await fs.read.text(i.name);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(/\r?\n/);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.string_conf(line);
					}
				} else if (i.name.endsWith(constant.str.files.conf.servers)) {
					const text : string | undefined = await fs.read.text(i.name);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(/\r?\n/);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.servers_conf(line);
					}
				} else if (i.name.endsWith(constant.str.files.conf.lflist)) {
					const text : string | undefined = await fs.read.text(i.name);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(/\r?\n/);
					for (const [v, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.lflist_conf(line);
						if (v === (lines.length - 1))
							this.lflist_now = '';
					}
				} else if (i.name.endsWith(constant.str.files.conf.info)) {
					const text : string | undefined = await fs.read.text(i.name);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(/\r?\n/);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.info_conf(line);
					}
				}
			}
			//读取ini
			for (const i of expnasion_files.filter(i => i.name.match(constant.reg.ini))) {
				const string : string | undefined = await fs.read.text(i.name);
				if (string !== undefined)
					this.read.ini(string);
			}
			//读取ypk\zip
			for (const i of expnasion_files.filter(i => i.name.match(constant.reg.zip))) {
				const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(i.name);
				for (const [_, v] of ypk.get(constant.reg.database) ?? new Map()) {
					const db = await fs.read.databaseInMemory(v as Uint8Array<ArrayBuffer>);
					if (db !== undefined)
						this.read.database(db);
				}
				for (const [i, v] of ypk.get(constant.reg.conf) ?? new Map()) {
					if (i.endsWith(constant.str.files.conf.strings)) {
						const lines : Array<string> = v.split(/\r?\n/);
						for (const [_, i] of lines.entries()) {
							const line : string = i.trim();
							this.read.string_conf(line);
						}
					} else if (i.endsWith(constant.str.files.conf.servers)) {
						const lines : Array<string> = v.split(/\r?\n/);
						for (const [_, i] of lines.entries()) {
							const line : string = i.trim();
							this.read.servers_conf(line);
						}
					} else if (i.endsWith(constant.str.files.conf.lflist)) {
						const lines : Array<string> = v.split(/\r?\n/);
						for (const [v, i] of lines.entries()) {
							const line : string = i.trim();
							this.read.lflist_conf(line);
							if (v === (lines.length - 1))
								this.lflist_now = '';
						}
					} else if (i.endsWith(constant.str.files.conf.servers)) {
						const lines : Array<string> = v.split(/\r?\n/);
						for (const [_, i] of lines.entries()) {
							const line : string = i.trim();
							this.read.info_conf(line);
						}
					}
				}
				for (const [_, v] of ypk.get(constant.reg.ini) ?? new Map()) {
					this.read.ini(v);
				}
				this.load.interval();
			}
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
		}
	}

	load = {
		deck : async () : Promise<Array<Deck>> => {
			let decks : Array<Deck> = [];
			for (const i of await fs.read.dir(constant.str.dirs.deck) ?? []) {
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
		pic : async (deck : Array<number>) : Promise<void> => {
			const filter = (i : number, v : number, a : Array<number>) => {
				const card = this.cards.get(i);
				return a.indexOf(i) === v && card != undefined && card.pic === ''
			}
			deck = deck.filter(filter);
			if (deck.length === 0) return;
			const expnasion_files : Array<DirEntry> = await fs.read.dir(constant.str.dirs.expansions) ?? [];
			for (const i of expnasion_files.filter(i => i.name.match(constant.reg.zip))) {
				const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(i.name, deck.map(num => num.toString()));
				for (const code of deck) {
					const blob = ypk.get(constant.reg.picture)!.get(code.toString());
					if (blob != undefined)
						this.cards.get(code)!.update_pic(URL.createObjectURL(blob as Blob));
				}
				deck = deck.filter(filter);
			}
			const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(constant.str.files.pics, deck.map(num => num.toString()));
			for (const code of deck) {
				const blob = ypk.get(constant.reg.picture)!.get(code.toString());
				if (blob != undefined)
					this.cards.get(code)!.update_pic(URL.createObjectURL(blob as Blob));
			}
			deck = deck.filter(filter);
			for (const code of deck) {
				await this.cards.get(code)!.find_pic();
			}
		},
		interval : () : void => {
			this.clear.interval();
			this.interval = setInterval(async () => {
				const deck = Array.from(this.cards.keys());
				if (deck.length > this.interval_ct) {
					await this.load.pic(deck.slice(this.interval_ct, this.interval_ct + 1000))
					this.interval_ct += 1000;
				}
				else
					this.clear.interval();
			}, 5000);
		}

	}

	clear = {
		interval : () : void => {
			if (this.interval != -1) {
				clearInterval(this.interval);
				this.interval = -1;
				this.interval_ct = 0;
			}
		}
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
				this.lflist.set(line.slice(1), new Map());
				this.lflist_now = line.slice(1);
			} else if (this.lflist_now !== '') {
				const key_value = line.split(' ');
				if (key_value.length >= 2)
					this.lflist.get(
						this.lflist_now
					)!.set(
						parseInt(key_value[0]),
						parseInt(key_value[1])
					);
			}
		},
		system_conf : (line : string) : void => {
			if (line.startsWith('#'))
				return;
			const key_value = line.split('=');
			if (key_value.length == 2)
				this.system.set(key_value[0].trim(), !!parseInt(key_value[1].trim()))
		},
		database : async (db : Array<Array<string | number>>) : Promise<void> => {
			for (const i of db)
				this.cards.set(i[0] as number, new Card(i));
		},
		ini : (string : string) : void => {
			const lines = string.split(/\r?\n/);
			let name : string = '';
			let host : string = '';
			let port : string = '';
			for (const l in lines) {
				const line = l.trim();
				if (line.startsWith(constant.str.ini.name)) {
					const i = line.split('=');
					if (i.length == 2)
						name = i[1];
				} else if (line.startsWith(constant.str.ini.host)) {
					const i = line.split('=');
					if (i.length == 2)
						host = i[1];
				} else if (line.startsWith(constant.str.ini.port)) {
					const i = line.split('=');
					if (i.length == 2)
						port = i[1];
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
			const lflist = search.lflist !== undefined && this.lflist.has(search.lflist) ? this.lflist.get(search.lflist)! : new Map;
			const forbidden = search.forbidden ?? [];
			const filter = (card : Card) : boolean => {
				if (forbidden.length > 0) {
					const ct = lflist.get(card.id);
					if (ct === undefined ? !forbidden.includes(3) : !forbidden.includes(ct))
						return false;
				}
				if ((search.desc ?? '').length > 0) {
					for (const i of desc) {
						const id = Number(i);
						if (
							(i !== '' && !card.name.includes(i) && !card.desc.includes(i))
								&& (isNaN(id) ? true : card.id !== id && card.alias !== id)
						)
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

	chk = async () : Promise<boolean> => {
		for (const [_, i] of Object.entries(constant.str.files.conf)) {
			if (!await fs.exists(i))
				return false;
		}
		return true;
    };

	exit = async () : Promise<void> => {
		return await exit(1);
	};

	is_android = () : boolean => {
		return constant.system.system == 'android';
	};
};

const mainGame = new Game();
export default mainGame;