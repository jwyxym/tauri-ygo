import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import axios from 'axios';
import { useToast } from 'vue-toastification'

import constant from './constant';
import Deck from './deck';
import sql from './sql';

class Fs {
	dir : fs.ReadFileOptions;
	path : Promise<string>;

	constructor () {
		this.dir = constant.system.baseDir();
		this.path = constant.system.basePath();
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
				return await sql.find(file);
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		zip : async (file : string) : Promise<Map<RegExp, Map<string, Blob | Uint8Array | string>>> => {
			let map = new Map([
				[constant.reg.database, new Map],
				[constant.reg.picture, new Map],
				[constant.reg.conf, new Map],
				[constant.reg.ini, new Map]
			]);
			try {
				const p = await path.join(await constant.system.basePath(), file);
				const entries = await invoke<Array<[string, { content : string | Uint8Array}]>>('read_zip', {
					path : p,
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
				return Deck.fromYdkString(await fs.readTextFile(file, this.dir));
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		dir : async (dir : string) : Promise<Array<fs.DirEntry> | undefined> => {
			try {
				let result : Array<fs.DirEntry> = await fs.readDir(dir, this.dir);
				for (const i of result) {
					i.name = await path.join(dir, i.name)
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
				console.error(text)
				useToast().error(text.toString());
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
				useToast().error(error.toString());
				return false;
			}
		},
		ydk : async (file : string, ydk : Deck) : Promise<boolean> => {
			try {
				await fs.writeTextFile(file, ydk.toYdkString(), this.dir);
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
}

export default new Fs();