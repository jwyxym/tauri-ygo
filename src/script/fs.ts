import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import axios from "axios";
import { useToast } from 'vue-toastification'

import constant from "./constant";
import deck from "./deck";

type ypkLike = Map<RegExp, Map<string, Blob | Uint8Array>>;

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
		database : async (file : string) : Promise<Uint8Array<ArrayBuffer> | undefined> => {
			try {
				return await fs.readFile(await file, this.dir);
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		zip : async (file : string) : Promise<ypkLike> => {
			let map = new Map([
				[constant.reg.database, new Map],
				[constant.reg.picture, new Map],
				[constant.reg.conf, new Map],
				[constant.reg.ini, new Map]
			]);
			try {
				const p = await path.join(await constant.system.basePath(), file);
				const entries = await invoke<Array<[string, number[]]>>("read_zip_in_tauri", {
					path : p,
				});
				for (const [name, byte] of entries) {
					if (name.match(constant.reg.picture)) {
						const blob = new Blob([new Uint8Array(byte)], { type: name.endsWith('png') ? 'image/png' : 'image/jpeg' })
						let filename = name.replace(/\\/g, '/').split('/').filter(part => part.trim() !== '').pop() || '';
						if (!filename.startsWith('.')) {
							const dotIndex = filename.lastIndexOf('.');
  							filename = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
						}
						map.get(constant.reg.picture)!.set(filename, blob);
					} else if (name.match(constant.reg.conf)) {
						const blob = new Blob([new Uint8Array(byte)], { type: 'text/plain' })
						map.get(constant.reg.conf)!.set(name, blob);
					} else if (name.match(constant.reg.ini)) {
						const blob = new Blob([new Uint8Array(byte)], { type: 'text/plain' })
						map.get(constant.reg.ini)!.set(name, blob);
					} else if (name.match(constant.reg.database)) {
						map.get(constant.reg.database)!.set(name, byte);
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
		ydk : async (file : string) : Promise<deck | undefined> => {
			try {
				return deck.fromYdkString(await fs.readTextFile(file, this.dir));
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		}

	};

	write = {
		log : async (text : string)  : Promise<boolean> => {
			try {
				useToast().error(text);
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
				useToast().error(error);
				return false;
			}
		},
		ydk : async (file : string, ydk : deck) : Promise<boolean> => {
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
				this.write.log(error);
			}
			return false;
		},
	};
}

export default new Fs();
export type { ypkLike };