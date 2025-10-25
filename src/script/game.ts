import { exit } from '@tauri-apps/plugin-process';
import { DirEntry } from '@tauri-apps/plugin-fs';
import { fetch } from '@tauri-apps/plugin-http';

import fs from './fs';
import * as CONSTANT from './constant';
import invoke from './invoke';
import Card, { Search } from './card';
import { I18N_KEYS } from './language/i18n';
import Zh_CN from './language/Zh-CN';
import TAURI_STR from './language/string';


import voice from '../pages/voice/voice';
import Deck from '../pages/deck/deck';

class Game {
	strings : Map<string, Map<number, string>> = new Map([
		[CONSTANT.KEYS.SYSTEM, new Map],
		[CONSTANT.KEYS.VICTORY, new Map],
		[CONSTANT.KEYS.COUNTER, new Map],
		[CONSTANT.KEYS.SETCODE, new Map],
		[CONSTANT.KEYS.OT, new Map],
		[CONSTANT.KEYS.ATTRIBUTE, new Map],
		[CONSTANT.KEYS.CATEGORY, new Map],
		[CONSTANT.KEYS.LINK, new Map],
		[CONSTANT.KEYS.RACE, new Map],
		[CONSTANT.KEYS.TYPE, new Map]
	]);
	icons : Map<string, Map<number, string>> = new Map([
		[CONSTANT.KEYS.OT, new Map],
		[CONSTANT.KEYS.ATTRIBUTE, new Map],
		[CONSTANT.KEYS.CATEGORY, new Map],
		[CONSTANT.KEYS.LINK, new Map],
		[CONSTANT.KEYS.RACE, new Map],
		[CONSTANT.KEYS.TYPE, new Map]
	]);
	lflist : Map<string, {hash : number, map : Map<number, number>}> = new Map;
	system : Map<string, string> = new Map;
	servers : Map<string, string> = new Map;
	cards : Map<number, Card> = new Map;
	textures : Map<string, string> = new Map;
	bgm : Map<string, string> = new Map;
	version = 0x1362;
	max_card_id = 0x0fffffff;
	i18n = CONSTANT.LANGUAGE.Zh_CN;
	interval = -1;
	interval_ct = 0;
	unknown : Card = new Card([...new Array(11).fill(0), ...new Array(19).fill('')]);
	back : Card = new Card([...new Array(11).fill(0), ...new Array(19).fill('')]);
	font = document.createElement('style');

	private lflist_now : string = '';

    init = async (chk : boolean = true) : Promise<void> => {
		try {
			await fs.init_path();
			//新建所需要的文件夹
			for (const [k, i] of Object.entries(CONSTANT.DIRS)) {
				if (k !== 'PIC' && !await fs.exists(i))
					await fs.write.dir(i);
			}

			//初始化资源
			if (chk)
				await fs.init();

			//读取./textures文件夹
			for (const i of await fs.read.dir(CONSTANT.DIRS.TEXTURE, false)) {
				if (i.name.match(CONSTANT.REG.PICTURE)) {
					const url : string | undefined = await fs.read.file.as_url(await fs.join(CONSTANT.DIRS.TEXTURE, i.name));
					if (url)
						this.textures.set(i.name, url);
				}
			}

			//读取./font文件夹
			for (const i of await fs.read.dir(CONSTANT.DIRS.FONT, false)) {
				if (i.name.match(CONSTANT.REG.FONT)) {
					const url : string | undefined = await fs.read.file.as_url(await fs.join(CONSTANT.DIRS.FONT, i.name));
					if (url) {
						this.font.textContent += `
							@font-face {
								font-family: '${i.name.split('.')[0]}';
								src: url('${url}');
								font-weight: normal;
								font-style: normal;
							}
						`
					}
				}
			}
			document.head.appendChild(this.font);

			//读取./sound文件夹
			for (const i of await fs.read.dir(CONSTANT.DIRS.SOUND, false)) {
				if (i.name.match(CONSTANT.REG.BGM)) {
					const url : string | undefined = await fs.read.bgm([CONSTANT.DIRS.SOUND, i.name]);
					if (url)
						this.bgm.set(i.name, url);
				}
			}

			//读取system.conf文件
			if (await fs.exists(CONSTANT.FILES.SYSTEM_CONF)) {
				const text : string | undefined = await fs.read.text(CONSTANT.FILES.SYSTEM_CONF);
				if (text !== undefined) {
					const lines : Array<string> = text.split(CONSTANT.REG.LINE_FEED);
					for (const i of lines) {
						const line : string = i.trim();
						this.read.system_conf(line);
					}
				}
				if (!this.system.has(CONSTANT.KEYS.SETTING_CT_CARD))
					this.push.system(CONSTANT.KEYS.SETTING_CT_CARD, 3);
				if (!this.system.has(CONSTANT.KEYS.SETTING_CT_DECK_MAIN))
					this.push.system(CONSTANT.KEYS.SETTING_CT_DECK_MAIN, 60);
				if (!this.system.has(CONSTANT.KEYS.SETTING_CT_DECK_EX))
					this.push.system(CONSTANT.KEYS.SETTING_CT_DECK_EX, 15);
				if (!this.system.has(CONSTANT.KEYS.SETTING_CT_DECK_SIDE))
					this.push.system(CONSTANT.KEYS.SETTING_CT_DECK_SIDE, 15);
				if (!this.system.has(CONSTANT.KEYS.SETTING_SERVER_PLAYER_NAME))
					this.push.system(CONSTANT.KEYS.SETTING_SERVER_PLAYER_NAME, '今晚有宵夜吗');
			} else {
				this.push.system(CONSTANT.KEYS.SETTING_DOWMLOAD_TIME, new Date().toISOString());
				this.push.system(CONSTANT.KEYS.SETTING_CT_CARD, 3);
				this.push.system(CONSTANT.KEYS.SETTING_CT_DECK_MAIN, 60);
				this.push.system(CONSTANT.KEYS.SETTING_CT_DECK_EX, 15);
				this.push.system(CONSTANT.KEYS.SETTING_CT_DECK_SIDE, 15);
				this.push.system(CONSTANT.KEYS.SETTING_SERVER_PLAYER_NAME, '今晚有宵夜吗');
				await fs.write.system();
			}

			this.unknown.update_pic(this.textures.get(CONSTANT.FILES.TEXTURE_UNKNOW) ?? '');
			this.back.update_pic(this.textures.get(CONSTANT.FILES.TEXTURE_COVER) ?? '');
			
			await this.load.card();
			await this.load.expansion();
		} catch (error) {
			fs.write.log(error);
		}
	};

	reload = async () : Promise<boolean> => {
		try {
			this.clear();
			await this.load.card();
			await this.load.expansion();
			return true;
		} catch (error) {
			fs.write.log(error);
		}
		return false;
	};

	get = {
		text : (key : number, replace : string | number | Array<string> | Array<number> | Array<string | number> = []) : string => {
			switch (this.i18n) {
				case CONSTANT.LANGUAGE.Zh_CN:
					return new TAURI_STR(Zh_CN[key]).toString(replace);
			}
			return new TAURI_STR(Zh_CN[key]).toString();
		},
		system : (key : string) : Array<string> | string | number | boolean | undefined => {
			const value = this.system.get(key);
			const number = Number(value)
			const obj_key = Object.entries(CONSTANT.KEYS).find(([_, v]) => v === key);
			if (obj_key === undefined)
				return undefined;
			if (key === CONSTANT.KEYS.SETTING_LOADING_EXPANSION) {
				return (value ?? '').split('&&').filter(i => i !== '');
			} else if (key === CONSTANT.KEYS.SETTING_VOICE_BACK_BGM || obj_key[0].startsWith('SETTING_CT_')) {
				return isNaN(number) ? 0 : number;
			} else if (obj_key[0].startsWith('SETTING_CHK_')) {
				return !!number;
			} else {
				return value ?? '';
			}
		},
		textures : (key : string | Array<string>) : Array<string | undefined> | string | undefined => {
			return typeof key === 'object' ? (key as Array<string>).map(i => this.textures.get(i)) : this.textures.get(key);
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
			const load_expansion : Array<string> = this.get.system(CONSTANT.KEYS.SETTING_LOADING_EXPANSION) as Array<string> ?? [];
			const expansion_files : Array<DirEntry> = await fs.read.dir(CONSTANT.DIRS.EXPANSION, false);
			const expansion_ypk : Array<DirEntry> = expansion_files.filter(i => i.isFile && i.name.match(CONSTANT.REG.ZIP));
			const load : Array<string> = load_expansion.filter(i => { return expansion_ypk.findIndex(j => j.name === i) > -1; });
			this.system.set(CONSTANT.KEYS.SETTING_LOADING_EXPANSION, load.join('&&'));
			for (let i = 0; i < load.length; i++) {
				load[i] = await fs.join(CONSTANT.DIRS.EXPANSION, load[i]);
			}
			return {
				loading : load,
				ypk : expansion_ypk,
				files : await fs.read.dir(CONSTANT.DIRS.EXPANSION)
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
				const name = Array.from(this.lflist).find(i => i[1].hash === key) ?? [this.get.text(I18N_KEYS.UNKNOW).toString()];
				return name[0];
			}
		},
		pics : () : Array<string> => {
			return Array.from(this.cards.values()).filter(i => i.has_pic()).map(i => i.pic);
		},
		strings : {
			system : (key : number, replace : Array<string | number> | string | number = []) : string => {
				let value = this.strings.get(CONSTANT.KEYS.SYSTEM)!.get(key) ?? this.get.text(I18N_KEYS.UNKNOW).toString();
				replace = typeof replace === 'object' ? replace : [replace];
				for (const str of replace) {
					value = value.replace(typeof str === 'string' ? '%ls' : '%d', `${str}`);
				}
				return value;
			},
			race : (data : number) : string => {
				return [...this.strings.get(CONSTANT.KEYS.RACE)!]
					.filter(i => (i[0] & data) === i[0])
					.map(i => i[1])
					.join('|');
			},
			attribute : (data : number) : string => {
				return [...this.strings.get(CONSTANT.KEYS.ATTRIBUTE)!]
					.filter(i => (i[0] & data) === i[0])
					.map(i => i[1])
					.join('|');
			},
			ot : (data : number) : string => {
				return [...this.strings.get(CONSTANT.KEYS.OT)!]
					.filter(i => (i[0] & data) === i[0])
					.map(i => i[1])
					.join('|');
			},
			type : (data : number) : string => {
				return [...this.strings.get(CONSTANT.KEYS.TYPE)!]
					.filter(i => (i[0] & data) === i[0])
					.map(i => i[1])
					.join('|');
			},
			category : (data : number) : string => {
				return [...this.strings.get(CONSTANT.KEYS.CATEGORY)!]
					.filter(i => (i[0] & data) === i[0])
					.map(i => i[1])
					.join('|');
			},
			link : (data : number) : string => {
				return [...this.strings.get(CONSTANT.KEYS.LINK)!]
					.filter(i => (i[0] & data) === i[0])
					.map(i => i[1])
					.join('|');
			},
			setcode : (i : number) : string => {
				return this.strings.get(CONSTANT.KEYS.SETCODE)?.get(i) ?? `0x${i.toString(16)}`;
			}
		},
		desc : (data : number) : string => {
			if (data < (128 << 4))
				return this.get.strings.system(data);
			const code = (data >> 4) & 0x0fffffff;
			const offset = data & 0xf;
			const card =  mainGame.get.card(code);
			return card === this.unknown ? this.get.text(I18N_KEYS.UNKNOW).toString() : card.desc[offset];
		},
		name : (id : number) : string => {
			const card = mainGame.get.card(id);
			return card === this.unknown ? this.get.text(I18N_KEYS.UNKNOW).toString() : card.name;
		}
	}

	load = {
		ypk : async (path : string) : Promise<void> => {
			const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(path);
			for (const [_, v] of ypk.get(CONSTANT.REG.DATABASE) ?? new Map()) {
				const db = await fs.read.database_in_memory(v as Uint8Array<ArrayBuffer>);
				if (db !== undefined)
					this.read.database(db);
			}
			for (const [i, v] of ypk.get(CONSTANT.REG.CONF) ?? new Map()) {
				if (i.endsWith(CONSTANT.FILES.STRING_CONF.get('')!)) {
					const lines : Array<string> = v.split(CONSTANT.REG.LINE_FEED);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.strings_conf(line);
					}
				} else if (i.endsWith(CONSTANT.FILES.SERVER_CONF)) {
					const lines : Array<string> = v.split(CONSTANT.REG.LINE_FEED);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.servers_conf(line);
					}
				} else if (i.endsWith(CONSTANT.FILES.LFLIST_CONF)) {
					const lines : Array<string> = v.split(CONSTANT.REG.LINE_FEED);
					for (const [v, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.lflist_conf(line);
						if (v === (lines.length - 1))
							this.lflist_now = '';
					}
				} else if (i.endsWith(CONSTANT.FILES.INFO_CONF.get('')!)) {
					const lines : Array<string> = v.split(CONSTANT.REG.LINE_FEED);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.info_conf(line);
					}
				}
			}
			for (const [_, v] of ypk.get(CONSTANT.REG.INI) ?? new Map()) {
				this.read.ini(v);
			}
		},
		deck : async () : Promise<Array<Deck>> => {
			return await fs.read.ydk();
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
			for (const i of load.filter(i => i.match(CONSTANT.REG.ZIP))) {
				const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(i, deck);
				for (const code of deck) {
					const blob = ypk.get(CONSTANT.REG.PICTURE)!.get(code.toString());
					if (blob != undefined)
						this.cards.get(code)!.update_pic(URL.createObjectURL(blob as Blob));
				}
				deck = deck.filter(filter);
			}
			if (this.is_android()) {
				deck = deck.filter(filter);
				const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(CONSTANT.FILES.PIC_ZIP, deck);
				for (const code of deck) {
					const blob = ypk.get(CONSTANT.REG.PICTURE)!.get(code.toString());
					if (blob != undefined)
						this.cards.get(code)!.update_pic(URL.createObjectURL(blob as Blob));
				}
			}
			deck = deck.filter(filter);
			if (deck.length === 0) return;
			const [pics, unknow] = await fs.read.pics(deck);
			for (const i of pics) {
				this.cards.get(i.code)!.update_pic(i.url!);
			}
			for (const code of unknow) {
				this.cards.get(code)!.update_pic(this.get.textures(CONSTANT.FILES.TEXTURE_UNKNOW) as string | undefined ?? '');
			}
		},
		card : async () : Promise<void> => {
			//读取servers.conf
			if (await fs.exists(CONSTANT.FILES.SERVER_CONF)) {
				const servers : string | undefined = await fs.read.text(CONSTANT.FILES.SERVER_CONF);
				if (servers !== undefined) {
					const lines : Array<string> = servers.split(CONSTANT.REG.LINE_FEED);
					for (const i of lines) {
						const line : string = i.trim();
						this.read.servers_conf(line);
					}
				}
			}
			//读取lflist.conf
			if (await fs.exists(CONSTANT.FILES.LFLIST_CONF)) {
				const lflist : string | undefined = await fs.read.text(CONSTANT.FILES.LFLIST_CONF);
				if (lflist !== undefined) {
					const lines : Array<string> = lflist.split(CONSTANT.REG.LINE_FEED);
					for (const i of lines) {
						const line : string = i.trim();
						this.read.lflist_conf(line);
					}
				}
			}
			//读取strings.conf
			const strings : string | undefined = await fs.read.text([CONSTANT.DIRS.STRING, CONSTANT.FILES.STRING_CONF.get(this.i18n)!]);
			if (strings !== undefined) {
				const lines : Array<string> = strings.split(CONSTANT.REG.LINE_FEED);
				for (const i of lines) {
					const line : string = i.trim();
					this.read.strings_conf(line);
				}
			}

			//读取cardinfo.conf
			const info : string | undefined = await fs.read.text([CONSTANT.DIRS.INFO, CONSTANT.FILES.INFO_CONF.get(this.i18n)!]);
			if (info !== undefined) {
				const lines : Array<string> = info.split(CONSTANT.REG.LINE_FEED);
				for (const i of lines) {
					const line : string = i.trim();
					this.read.info_conf(line);
				}
			}
			//读取cards.cdb
			const database : Array<Array<string | number>> | undefined = await fs.read.database([CONSTANT.DIRS.DB, CONSTANT.FILES.DB.get(this.i18n)!]);
			if (database !== undefined)
				this.read.database(database);
		},
		expansion : async () : Promise<void> => {
			// 读取expnasions文件夹
			const expansion = await this.get.expansions();
			const files = expansion.files.map(i => i.name);
			const load = expansion.loading;
			//读取cdb
			for (const i of files.filter(i => i.match(CONSTANT.REG.DATABASE))) {
				const database : Array<Array<string | number>> | undefined = await fs.read.database(i);
				if (database !== undefined)
					this.read.database(database);
			}
			//读取conf
			for (const i of files.filter(i => i.match(CONSTANT.REG.CONF))) {
				if (i.endsWith(CONSTANT.FILES.STRING_CONF.get('')!)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(CONSTANT.REG.LINE_FEED);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.strings_conf(line);
					}
				} else if (i.endsWith(CONSTANT.FILES.SERVER_CONF)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(CONSTANT.REG.LINE_FEED);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.servers_conf(line);
					}
				} else if (i.endsWith(CONSTANT.FILES.LFLIST_CONF)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(CONSTANT.REG.LINE_FEED);
					for (const [v, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.lflist_conf(line);
						if (v === (lines.length - 1))
							this.lflist_now = '';
					}
				} else if (i.endsWith(CONSTANT.FILES.INFO_CONF.get('')!)) {
					const text : string | undefined = await fs.read.text(i);
					if (text === undefined) continue;
					const lines : Array<string> = text.split(CONSTANT.REG.LINE_FEED);
					for (const [_, i] of lines.entries()) {
						const line : string = i.trim();
						this.read.info_conf(line);
					}
				}
			}
			//读取ini
			for (const i of files.filter(i => i.match(CONSTANT.REG.INI))) {
				const string : string | undefined = await fs.read.text(i);
				if (string !== undefined)
					this.read.ini(string);
			}
			//读取ypk\zip
			for (const i of load.filter(i => i.match(CONSTANT.REG.ZIP))) {
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
			[CONSTANT.KEYS.SYSTEM, new Map],
			[CONSTANT.KEYS.VICTORY, new Map],
			[CONSTANT.KEYS.COUNTER, new Map],
			[CONSTANT.KEYS.SETCODE, new Map],
			[CONSTANT.KEYS.OT, new Map],
			[CONSTANT.KEYS.ATTRIBUTE, new Map],
			[CONSTANT.KEYS.CATEGORY, new Map],
			[CONSTANT.KEYS.LINK, new Map],
			[CONSTANT.KEYS.RACE, new Map],
			[CONSTANT.KEYS.TYPE, new Map]
		]);
		this.icons = new Map([
			[CONSTANT.KEYS.OT, new Map],
			[CONSTANT.KEYS.ATTRIBUTE, new Map],
			[CONSTANT.KEYS.CATEGORY, new Map],
			[CONSTANT.KEYS.LINK, new Map],
			[CONSTANT.KEYS.RACE, new Map],
			[CONSTANT.KEYS.TYPE, new Map]
		]);
	}

	read = {
		servers_conf : (line : string) : void => {
			const key_value : Array<string> = line.split('|');
			if (key_value.length == 2)
				this.servers.set(key_value[0], key_value[1])
		},
		strings_conf : (line : string) : void => {
			if (line.startsWith('#'))
				return;
			const key_value = line.split(' ');
			if (key_value.length == 3) {
				const key = parseInt(key_value[1]);
				if (isNaN(key)) return;
				switch (key_value[0]) {
					case CONSTANT.KEYS.SYSTEM:
						this.strings.get(
							CONSTANT.KEYS.SYSTEM
						)!.set(
							key,
							key_value[2]
						);
						break;
					case CONSTANT.KEYS.VICTORY:
						this.strings.get(
							CONSTANT.KEYS.VICTORY
						)!.set(
							key,
							key_value[2]
						);
						break;
					case CONSTANT.KEYS.COUNTER:
						this.strings.get(
							CONSTANT.KEYS.COUNTER
						)!.set(
							key,
							key_value[2]
						);
						break;
					case CONSTANT.KEYS.SETCODE:
						this.strings.get(
							CONSTANT.KEYS.SETCODE
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
				const card = new Card(i);
				this.cards.set(code, card);
			}
		},
		ini : (string : string) : void => {
			const lines = string.split(CONSTANT.REG.LINE_FEED);
			let name : string = '';
			let host : string = '';
			let port : string = '';
			for (const l of lines) {
				const line = l.trim();
				if (line.startsWith(CONSTANT.KEYS.SERVER_NAME)) {
					const i = line.split('=');
					if (i.length == 2)
						name = i[1].trim();
				} else if (line.startsWith(CONSTANT.KEYS.SERVER_HOST)) {
					const i = line.split('=');
					if (i.length == 2)
						host = i[1].trim();
				} else if (line.startsWith(CONSTANT.KEYS.SERVER_PORT)) {
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
			if (key_value.length >= 3) {
				const key = parseInt(key_value[1]);
				if (isNaN(key)) return;
				switch (key_value[0]) {
					case CONSTANT.KEYS.OT:
						this.strings.get(
							CONSTANT.KEYS.OT
						)!.set(
							key,
							key_value[2]
						);
						if (key_value[3]) {
							this.icons.get(
								CONSTANT.KEYS.OT
							)!.set(
								key,
								key_value[3]
							);
						}
						break;
					case CONSTANT.KEYS.ATTRIBUTE:
						this.strings.get(
							CONSTANT.KEYS.ATTRIBUTE
						)!.set(
							key,
							key_value[2]
						);
						if (key_value[3]) {
							this.icons.get(
								CONSTANT.KEYS.ATTRIBUTE
							)!.set(
								key,
								key_value[3]
							);
						}
						break;
					case CONSTANT.KEYS.LINK:
						this.strings.get(
							CONSTANT.KEYS.LINK
						)!.set(
							key,
							key_value[2]
						);
						if (key_value[3]) {
							this.icons.get(
								CONSTANT.KEYS.LINK
							)!.set(
								key,
								key_value[3]
							);
						}
						break;
					case CONSTANT.KEYS.CATEGORY:
						this.strings.get(
							CONSTANT.KEYS.CATEGORY
						)!.set(
							key,
							key_value[2]
						);
						break;
					case CONSTANT.KEYS.RACE:
						this.strings.get(
							CONSTANT.KEYS.RACE
						)!.set(
							key,
							key_value[2]
						);
						if (key_value[3]) {
							this.icons.get(
								CONSTANT.KEYS.RACE
							)!.set(
								key,
								key_value[3]
							);
						}
						break;
					case CONSTANT.KEYS.TYPE:
						this.strings.get(
							CONSTANT.KEYS.TYPE
						)!.set(
							key,
							key_value[2]
						);
						if (key_value[3]) {
							this.icons.get(
								CONSTANT.KEYS.TYPE
							)!.set(
								key,
								key_value[3]
							);
						}
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
			const obj_key = Object.entries(CONSTANT.KEYS).find(([_, v]) => v === key);
			if (obj_key === undefined)
				return undefined;
			if (key === CONSTANT.KEYS.SETTING_LOADING_EXPANSION) {
				this.system.set(key, to_string(n as string));
			} else if (key === CONSTANT.KEYS.SETTING_VOICE_BACK_BGM || key.startsWith('SETTING_CT_')) {
				this.system.set(key, `${n ?? 0}`);
				voice.update(key);
			} else if (obj_key[0].startsWith('SETTING_CHK_')) {
				this.system.set(key, n ? '1' : '0');
			} else {
				this.system.set(key, n as string);
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
			return await fs.exists(CONSTANT.FILES.ASSETS_ZIP);
		},
		version : {
			game : async () : Promise<boolean> => {
				const time = await invoke.game_version(CONSTANT.URL.VERSION, CONSTANT.URL.VERSION_HEAD);
				const local = this.get.system(CONSTANT.KEYS.SETTING_DOWMLOAD_TIME);
				if (time.error === undefined && typeof local === 'string') {
					return new Date(time.content!) <= new Date(local);
				} else if (local === undefined)
					return true;
				return false;
			},
			superpre : async () : Promise<boolean> => {
				const time = await fetch(CONSTANT.URL.SUPER_PRE_VERSION, {
					method: 'GET',
				});
				if (time.ok) {
					const date = new Date(Number((await time.text()).trim()) * 1000);
					const p = await fs.join(CONSTANT.DIRS.EXPANSION, CONSTANT.FILES.SUPER_PRE)
					if (await fs.exists(p)) {
						const local = await fs.read.time(p);
						if (local)
							return new Date(local) >= date;
					}
					return true;
				}
				return false;
			},
		}
	}

	exit = async () : Promise<void> => {
		return await exit(1);
	};

	is_android = () : boolean => {
		return CONSTANT.SYSTEM === 'android';
	};

	is_windows = () : boolean => {
		return CONSTANT.SYSTEM === 'windows';
	};

	sleep = async (time : number) : Promise<void> => {
		return new Promise(resolve => setTimeout(resolve, time));
	}
};

const mainGame = new Game();
export default mainGame;