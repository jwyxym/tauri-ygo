import { convertFileSrc } from '@tauri-apps/api/core';
import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';

import constant from './constant';
import toast from './toast';
import mainGame from './game';
import invoke from './invoke';

import Deck from '../pages/deck/deck';

interface File {
	name : string;
	url : string;
}

class Fs {
	dir : fs.ReadFileOptions;
	path : Promise<string>;
	base_dir : number;
	rename_dir : fs.RenameOptions;
	copy_dir : fs.CopyFileOptions;

	constructor () {
		const base_dir = constant.system.base_dir() 
		this.dir = { baseDir: base_dir };
		this.path = constant.system.base_path();
		this.rename_dir = {
			oldPathBaseDir : base_dir,
			newPathBaseDir : base_dir
		}
		this.copy_dir = {
			fromPathBaseDir: base_dir,
			toPathBaseDir: base_dir
		}
		this.base_dir = base_dir
	};

	exists = async (file : string) : Promise<boolean> => {
		try {
			return fs.exists(file, this.dir);
		} catch (error) {
			this.write.log(error);
		}
		return false;
	};

	init = async (chk : boolean = false, chk_download : boolean = false) : Promise<boolean> => {
		try {
			if (!await this.exists(constant.str.files.assets) || chk_download) {
				toast.info(mainGame.get.text().toast.download.start);
				if ((await this.write.from_url(constant.str.url.assets, constant.str.files.assets)).length === 0)
					return false;
				toast.info(mainGame.get.text().toast.download.complete);
			}
			const p = await this.path;
			await invoke.unzip(p, await path.join(p, constant.str.files.assets), chk);
			return true;
		} catch (error) {
			this.write.log(error);
		}
		return false;
	};

	copy = async (from : string, to : string, dir : fs.CopyFileOptions = this.copy_dir) : Promise<boolean> => {
		try {
			await fs.copyFile(from, to, dir)
			return true;
		} catch (error) {
			this.write.log(error);
		}
		return false;
	};

	read = {
		database : async (file : string) : Promise<Array<Array<string | number>> | undefined> => {
			try {
				const entries = await invoke.read_db(await path.join(await constant.system.base_path(), file));
				if (entries.error === undefined)
					return entries.content!.map(i => [...i[0], ...i[1]]);
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		database_in_memory : async (file : Uint8Array<ArrayBuffer>) : Promise<Array<Array<string | number>> | undefined> => {
			let p = '';
			let result : Array<Array<string | number>> | undefined = undefined;
			try {
				p = await path.join(constant.str.dirs.cache, `${Math.random().toString().slice(2)}${constant.str.extends.cdb}`)
				if (await(this.write.file(p, file)))
					result = await this.read.database(p);
			} catch (error) {
				this.write.log(error);
			} finally {
				if (p.length > 0)
					await(this.delete.file(p));
			}
			return result;
		},
		pics : async (codes : Array<number> = []) : Promise<Map<number, Blob>> => {
			const p = await this.path;
			const folds = [
				await path.join(p, constant.str.dirs.expansions, constant.str.exdirs.pics)
			];
			if (!mainGame.is_android())
				folds.splice(0, 0, await path.join(p, constant.str.exdirs.pics));
			const entries = await invoke.read_pics(folds, codes);
			
			const result : Map<number, Blob> = new Map();
			if (entries.error === undefined)
				for (const [name, content] of entries.content!) {
					result.set(name, new Blob([new Uint8Array(content.content)], { type : 'image/jpeg' }));
				}
			return result;
		},
		zip : async (file : string, file_type : Array<string | number> = []) : Promise<Map<RegExp, Map<string, Blob | Uint8Array | string>>> => {
			let map = new Map([
				[constant.reg.database, new Map],
				[constant.reg.picture, new Map],
				[constant.reg.conf, new Map],
				[constant.reg.ini, new Map]
			]);
			try {
				const entries = await invoke.read_zip(await path.join(await constant.system.base_path(), file), file_type.map(i => `${i}`));
				if (entries.error === undefined)
					for (const [name, content] of entries.content!) {
						if (name.match(constant.reg.picture)) {
							const blob = new Blob([new Uint8Array(content.content as Uint8Array)], { type : name.endsWith('png') ? 'image/png' : 'image/jpeg' })
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
		text : async (file : string) : Promise<string | undefined> => {
			try {
				return await fs.readTextFile(file, this.dir);
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		ydk : async () : Promise<Array<Deck>> => {
			try {
				const decks : Array<Deck> = [];
				const reader = await invoke.read_texts(await path.join(await this.path, constant.str.dirs.deck), 'ydk');
				if (reader.error === undefined) {
					reader.content!.forEach(i => {
						const ydk = Deck.fromYdkString(i[1].content);
						ydk.main = ydk.main.filter(i => mainGame.cards.has(i));
						ydk.extra = ydk.extra.filter(i => mainGame.cards.has(i));
						ydk.side = ydk.side.filter(i => mainGame.cards.has(i));
						ydk.push_name(i[0]);
						decks.push(ydk);
					});
				}
				return decks;
			} catch (error) {
				this.write.log(error);
			}
			return [];
		},
		files : async (dir : string, type : Array<string> | string) : Promise<Array<File>> => {
			try {
				const p = await this.path;
				const entries = await invoke.read_files(await path.join(p, dir), type);

				const result : Array<File> = [];
				if (entries.error === undefined)
					for (const [name, content] of entries.content!) {
						result.push({
							name : name,
							url : URL.createObjectURL(new Blob([new Uint8Array(content.content)], { type : 'image/jpeg' }))
						});
					}
				return result;
			} catch (error) {
				this.write.log(error);
			}
			return [];
		},
		file : async (name : string) : Promise<File | undefined> => {
			try {
				return {
					name : name,
					url : convertFileSrc(await path.join(await this.path, name))
				}
			} catch (error) {
				this.write.log(error);
			}
			return undefined;
		},
		dir : async (dir : string, full_path : boolean = true, extension : boolean = true, this_dir : fs.ReadFileOptions = this.dir) : Promise<Array<fs.DirEntry>> => {
			try {
				let result : Array<fs.DirEntry> = await fs.readDir(dir, this_dir);
				if (full_path)
					for (const i of result) {
						i.name = await path.join(dir, i.name);
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
			return [];
		}

	};

	write = {
		log : async (text : string)  : Promise<boolean> => {
			try {
				console.error(text);
				toast.error(text);
				const log = `[${new Date().toLocaleString()}] ${text}${constant.system.line_feed()}`
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
		system : async () : Promise<boolean> => {
			try {
				let system = '';
				for (const [k, i] of mainGame.system) {
					system += `${k} = ${i}${constant.system.line_feed()}`
				}
				await fs.writeTextFile(constant.str.files.system, system, this.dir);
				return true;
			} catch (error) {
				this.write.log(error);
			}
			return false;
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
		text : async (file : string, text : string) : Promise<boolean> => {
			try {
				await fs.writeTextFile(file, text, this.dir);
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
		from_url : async (url : string,  file : string) : Promise<string> => {
			try {
				const download = await invoke.download(url, await this.path, file);
				if (typeof download === 'string')
					return download;
			} catch (error) {
				this.write.log(error.message ?? error);
			}
			return '';
		},
		ypk : async (url : string, file : string = '') : Promise<Array<string>> => {
			try {
				if (file.length > 0 && !file.endsWith(constant.str.extends.ypk))
					file += constant.str.extends.ypk;
				const download = await invoke.download(url, await path.join(await this.path, constant.str.dirs.expansions), file, constant.str.extends.ypk);
				if (typeof download === 'string') {
					const p = await path.join(constant.str.dirs.expansions, download);
					return [p, download];
				}
			} catch (error) {
				this.write.log(error.message ?? error);
			}
			return [];
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
				return this.delete.file(await path.join(constant.str.dirs.deck, `${file}${file.endsWith('.ydk') ? '' : '.ydk'}`));
			} catch (error) {
				this.write.log(error);
			}
			return false;
		},
		ypk : async (file : string) : Promise<boolean> => {
			try {
				return await this.delete.file(await path.join(constant.str.dirs.expansions, `${file}${file.endsWith('.ypk') ? '' : '.ypk'}`));
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