import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import axios from 'axios';

import constant from './constant';
import Deck from './deck';
import toast from './toast';
import mainGame from './game';

class Fs {
	dir : fs.ReadFileOptions;
	path : Promise<string>;
	rename_dir : fs.RenameOptions;

	constructor () {
		const base_dir = constant.system.baseDir() 
		this.dir = { baseDir: base_dir };
		this.path = constant.system.basePath();
		this.rename_dir = {
			oldPathBaseDir : base_dir,
			newPathBaseDir : base_dir
		}
	};

	exists = async (file : string) : Promise<boolean> => {
		try {
			return fs.exists(file, this.dir);
		} catch (error) {
			this.write.log(error);
		}
		return false;
	};

	read = {
		database : async (file : string) : Promise<Array<Array<string | number>> | undefined> => {
			try {
				const p = await path.join(await constant.system.basePath(), file);
				const entries = await invoke<Array<[Array<number>, Array<string>]>>('read_db', {
					path : p,
				});
				return entries.map(i => [...i[0], ...i[1]]);
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		databaseInMemory : async (file : Uint8Array<ArrayBuffer>) : Promise<Array<Array<string | number>> | undefined> => {
			try {
				const p = await path.join(constant.str.dirs.cache, constant.str.files.database)
				if (await(this.write.file(p, file))) {
					const result : Array<Array<string | number>> | undefined = await this.read.database(p);
					await(this.delete.file(p));
					return result;
				}
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		zip : async (file : string, file_type : Array<string> = []) : Promise<Map<RegExp, Map<string, Blob | Uint8Array | string>>> => {
			let map = new Map([
				[constant.reg.database, new Map],
				[constant.reg.picture, new Map],
				[constant.reg.conf, new Map],
				[constant.reg.ini, new Map]
			]);
			try {
				const p = await path.join(await constant.system.basePath(), file);
				const entries = await invoke<Array<[string, { content : string | Uint8Array}]>>('read_zip', {
					path : p, fileType: file_type
				});
				for (const [name, content] of entries) {
					if (name.match(constant.reg.picture)) {
						const blob = new Blob([new Uint8Array(content.content as Uint8Array)], { type: name.endsWith('png') ? 'image/png' : 'image/jpeg' })
						let filename = name.replace(/\\/g, '/').split('/').filter(part => part.trim() !== '').pop() || '';
						if (!filename.startsWith('.')) {
							const dotIndex = filename.lastIndexOf('.');
  							filename = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
						}
						map.get(constant.reg.picture)!.set(filename, blob);
					} else if (name.match(constant.reg.conf)) {
						map.get(constant.reg.conf)!.set(name, content.content as string);
					} else if (name.match(constant.reg.ini)) {
						map.get(constant.reg.ini)!.set(name, content.content as string);
					} else if (name.match(constant.reg.database)) {
						map.get(constant.reg.database)!.set(name, content.content as Uint8Array);
					}
				}
			} catch (error) {
				this.write.log(error);
			}
			return map;
		},
		picture : async (file : string) : Promise<string | undefined> => {
			try {
				return convertFileSrc(await path.join(await this.path, file));
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		text : async (file : string) : Promise<string | undefined> => {
			try {
				return await fs.readTextFile(file, this.dir);
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		ydk : async (file : string) : Promise<Deck | undefined> => {
			try {
				const deck = Deck.fromYdkString(await fs.readTextFile(file, this.dir));
				deck.main = deck.main.filter(i => mainGame.cards.has(i));
				deck.extra = deck.extra.filter(i => mainGame.cards.has(i));
				deck.side = deck.side.filter(i => mainGame.cards.has(i));
				return deck;
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		dir : async (dir : string, full_path : boolean = true, extension : boolean = true) : Promise<Array<fs.DirEntry> | undefined> => {
			try {
				let result : Array<fs.DirEntry> = await fs.readDir(dir, this.dir);
				if (full_path)
					for (const i of result) {
						i.name = await path.join(dir, i.name)
					}
				if (!extension)
					for (const i of result) {
						const name = i.name;
						i.name = name.split('.')[0];
					}
				return result;
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		}

	};

	write = {
		log : async (text : string)  : Promise<boolean> => {
			try {
				const get_reason = (error : string) : string => {
					const start = error.indexOf('error: ') + 'error: '.length;
					const end = error.indexOf(' (', start);
					
					if (start >= 0 && end > start) {
						return error.substring(start, end);
					}
					return error;
				}
				console.error(text)
				toast.error(get_reason(text));
				const log = `[${new Date().toLocaleString()}] ${text}${constant.system.lineFeed()}`
				if (await fs.exists(constant.log.error, this.dir)) {
					const file = await fs.open(constant.log.error, { append: true, baseDir : this.dir.baseDir });
					await file.write(new TextEncoder().encode(log));
					await file.close();
				} else {
					const file = await fs.create(constant.log.error, this.dir)
					await file.write(new TextEncoder().encode(log));
					await file.close();
				}
				return true;
			} catch (error) {
				toast.error(error.toString());
				return false;
			}
		},
		ydk : async (file : string, ydk : Deck) : Promise<boolean> => {
			try {
				await fs.writeTextFile(await path.join(constant.str.dirs.deck, `${file}.ydk`), ydk.toYdkString(), this.dir);
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
		file : async (file : string, data : Uint8Array<ArrayBufferLike>) : Promise<boolean> => {
			try {
				const f = await fs.create(file, this.dir);
				await f.write(data);
				await f.close();
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
		dir : async (dir : string) : Promise<boolean> => {
			try {
				 await fs.mkdir(dir, this.dir)
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
		fromUrl : async (file : string, url : string) : Promise<boolean> => {
			try {
				const response = await axios.get(url, {
					responseType: 'blob'
				});
				return await this.write.file(file, new Uint8Array(await response.data.arrayBuffer()));
			} catch (error) {
				this.write.log(error.message ?? error);
			}
			return false;
		},
	};
	delete = {
		file : async (file : string) : Promise<boolean> => {
			try {
				await fs.remove(file, this.dir);
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
		ydk : async (file : string) : Promise<boolean> => {
			try {
				await this.delete.file(await path.join(constant.str.dirs.deck, `${file}.ydk`));
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
	};
	rename = {
		file : async (old_path : string, new_path : string) : Promise<boolean> => {
			try {
				await fs.rename(old_path, new_path, this.rename_dir);
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
		ydk : async (old_path : string, new_path : string) : Promise<boolean> => {
			try {
				await this.rename.file(
					await path.join(constant.str.dirs.deck, `${old_path}.ydk`),
					await path.join(constant.str.dirs.deck, `${new_path}.ydk`)
				);
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
	};
}

export default new Fs();