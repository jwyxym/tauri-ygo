import { exit } from '@tauri-apps/plugin-process';
import { DirEntry } from '@tauri-apps/plugin-fs';

import fs from './fs';
import constant from './constant';
import Deck from './deck';
import Card from './card';
import textLike from './language/interface';
import Zh_CN from './language/Zh-CN';

class Game {
	strings : Map<string, Map<string, string>> = new Map([
		[constant.str.string_conf.system, new Map],
		[constant.str.string_conf.victory, new Map],
		[constant.str.string_conf.counter, new Map],
		[constant.str.string_conf.setcode, new Map]
	]);
	lflist : Map<string, Map<number, number>> = new Map;
	system : Map<string, string> = new Map;
	servers : Map<string, string> = new Map;
	cards : Map<number, Card> = new Map;
	textures : Map<string, string> = new Map;
	select = 'Zh_CN';

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
			for (const [_, i] of Object.entries(constant.str.files.conf)) {
				const text : string | undefined = await fs.read.text(i);
				if (text === undefined) continue;
				const lines : Array<string> = text.split(/\r?\n/);
				for (const [v, i] of lines.entries()) {
					const line : string = i.trim();
					switch (i) {
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
					}
				}
			}
			//读取目录下的cards.cdb
			if (await fs.exists(constant.str.files.database)) {
				const database : Array<Array<string | number>> | undefined = await fs.read.database(constant.str.files.database);
				if (database !== undefined)
					await this.read.database(database);
			}
			//读取expnasions文件夹
			const expnasionFiles : Array<DirEntry> = await fs.read.dir(constant.str.dirs.expansions) ?? [];
			//读取cdb
			for (const i of expnasionFiles.filter(i => i.name.match(constant.reg.database))) {
				const database : Array<Array<string | number>> | undefined = await fs.read.database(i.name);
				if (database !== undefined)
					await this.read.database(database);
			}
			//读取conf
			for (const i of expnasionFiles.filter(i => i.name.match(constant.reg.conf))) {
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
				}
			}
			//读取ini
			for (const i of expnasionFiles.filter(i => i.name.match(constant.reg.ini))) {
				const string : string | undefined = await fs.read.text(i.name);
				if (string !== undefined)
					this.read.ini(string);
			}
			//读取ypk\zip
			for (const i of expnasionFiles.filter(i => i.name.match(constant.reg.zip))) {
				const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(i.name);
				for (const [_, v] of ypk.get(constant.reg.database) ?? new Map()) {
					const db = await fs.read.databaseInMemory(v as Uint8Array<ArrayBuffer>);
					if (db !== undefined)
						this.read.database(db);
				}
				// for (const [i, v] of ypk.get(constant.reg.picture) ?? new Map()) {
				// 	if (i.match(constant.reg.picture)) {
				// 		const name = i.match(constant.reg.get_number_name) ?? [];
				// 		if (name.length >= 2)
				// 			pics.set(parseInt(name[1]), v as Blob);
				// 	}
				// }
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
					}
				}
				for (const [_, v] of ypk.get(constant.reg.ini) ?? new Map()) {
					this.read.ini(v);
				}
			}
		} catch (error) {
			fs.write.log(error);
		}
	};

	get_text = () : textLike => {
		switch (this.select) {
			case constant.str.language.Zh_CN:
				return Zh_CN;
		}
		return Zh_CN;
	};

	load_deck = async () : Promise<Array<Deck>> => {
		let decks : Array<Deck> = [];
		for (const i of await fs.read.dir(constant.str.dirs.deck) ?? []) {
			if (i.name.match(constant.reg.deck)) {
				const ydk : Deck | undefined = await fs.read.ydk(i.name);
				const name = i.name.match(constant.reg.get_name) ?? [];
				if (name.length >= 2 && ydk !== undefined) {
					ydk.push_name(name[1])
					decks.push(ydk);
				}
			}
		}
		return decks;
	};

	load_pic = async (deck : Array<number>) : Promise<void> => {
		const filter = (i : number, v : number, a : Array<number>) => {
			const card = this.cards.get(i);
			return a.indexOf(i) === v && card != undefined && card.pic === ''
		}
		if (deck.filter(filter).length === 0) return;
		const expnasionFiles : Array<DirEntry> = await fs.read.dir(constant.str.dirs.expansions) ?? [];
		for (const i of expnasionFiles.filter(i => i.name.match(constant.reg.zip))) {
			const pics = deck.filter(filter);
			const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(i.name, pics.map(num => num.toString()));
			for (const code of pics) {
				const blob = ypk.get(constant.reg.picture)!.get(code.toString());
				if (blob != undefined)
					this.cards.get(code)!.update_pic(URL.createObjectURL(blob as Blob));
			}	
		}
		const pics = deck.filter(filter);
		for (const code of pics) {
			await this.cards.get(code)!.find_pic();
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
				switch (key_value[0]) {
					case constant.str.string_conf.system:
						this.strings.get(
							constant.str.string_conf.system
						)!.set(
							key_value[1],
							key_value[2]
						);
						break;
					case constant.str.string_conf.victory:
						this.strings.get(
							constant.str.string_conf.victory
						)!.set(
							key_value[1],
							key_value[2]
						);
						break;
					case constant.str.string_conf.counter:
						this.strings.get(
							constant.str.string_conf.counter
						)!.set(
							key_value[1],
							key_value[2]
						);
						break;
					case constant.str.string_conf.setcode:
						this.strings.get(
							constant.str.string_conf.setcode
						)!.set(
							key_value[1],
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
				this.system.set(key_value[0].trim(), key_value[1].trim())
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
		}
	};

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

	isAnroid = () : boolean => {
		return constant.system.system == 'android';
	};
};

const mainGame = new Game();
export default mainGame;