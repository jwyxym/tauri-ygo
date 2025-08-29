import { exit } from '@tauri-apps/plugin-process';
import { useToast } from 'vue-toastification'
import * as path from '@tauri-apps/api/path';
import { DirEntry } from '@tauri-apps/plugin-fs';

import fs from './fs'
import constant from './constant';
import Card from './card';
import sql from './sql';

class Game {
	text : Map<string, object> = new Map;
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

	private lflist_now : string = '';

    init = async () : Promise<void> => {
		try {
			//新建所需要的文件夹
			for (const [_, i] of Object.entries(constant.str.dirs)) {
				if (!await fs.exists(i))
					await fs.write.dir(i);
			}
			//读取./language文件夹
			for (const i of await fs.read.dir(constant.str.dirs.language) ?? []) {
				if (i.name.match(constant.reg.json)) {
					const text : string | undefined = await fs.read.text(i.name);
					this.text.set(i.name, JSON.parse(text ?? "{}"));
				}
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
				const database : Uint8Array<ArrayBuffer> | undefined = await fs.read.database(constant.str.files.database);
				if (database !== undefined)
					await this.read.database(database);
			}
			//读取pics文件夹
			const pics : Map<number, string | Blob> = new Map();
			for (const i of await fs.read.dir(constant.str.dirs.pics) ?? []) {
				if (i.name.match(constant.reg.picture)) {
					const name = i.name.match(constant.reg.get_number_name) ?? [];
					if (name.length >= 2)
						pics.set(parseInt(name[1]), i.name);
				}
			}
			//读取expnasions文件夹
			const expnasionFiles : Array<DirEntry> = await fs.read.dir(constant.str.dirs.expansions) ?? [];
			//读取ypk\zip
			for (const i of expnasionFiles.filter(i => i.name.match(constant.reg.zip))) {
				const ypk : Map<RegExp, Map<string, Blob | Uint8Array | string>> = await fs.read.zip(i.name);
				for (const [_, v] of ypk.get(constant.reg.database) ?? new Map())
					this.read.database(v as Uint8Array<ArrayBuffer>)
				for (const [i, v] of ypk.get(constant.reg.picture) ?? new Map()) {
					if (i.match(constant.reg.picture)) {
						const name = i.match(constant.reg.get_number_name) ?? [];
						if (name.length >= 2)
							pics.set(parseInt(name[1]), v as Blob);
					}
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
					}
				}
			}
			//读取cdb
			for (const i of expnasionFiles.filter(i => i.name.match(constant.reg.database))) {
				const database : Uint8Array<ArrayBuffer> | undefined = await fs.read.database(i.name);
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
			//读取pics
			const expansionPics = await path.join(constant.str.dirs.expansions, 'pics');
			if (await fs.exists(expansionPics)) {
				for (const i of await fs.read.dir(expansionPics) ?? []) {
					if (i.name.match(constant.reg.picture)) {
						const name = i.name.match(constant.reg.get_number_name) ?? [];
						if (name.length >= 2)
							pics.set(parseInt(name[1]), i.name);
					}
				}
			}

			for (const [code, card] of this.cards) {
				if (pics.has(code)) {
					if (typeof pics.get(code) === 'string')
						card.updatePic(pics.get(code) as string);
					else
						card.updatePic(URL.createObjectURL(pics.get(code) as Blob));
				} else {
					card.updatePic(this.textures.get(constant.str.files.textures.unknown) ?? '');
				}
			}
		console.log(new Date().toLocaleString())
			

		} catch (error) {
			fs.write.log(error);
		}
	};

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
		database : async (db : Uint8Array<ArrayBuffer>) : Promise<void> => {
			for (const i of await sql.find(db))
				this.cards.set(parseInt(i[0]), new Card(i));
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