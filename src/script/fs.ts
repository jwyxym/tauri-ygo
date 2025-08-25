import { convertFileSrc } from "@tauri-apps/api/core";
import * as fs from '@tauri-apps/plugin-fs';
import * as zip  from '@zip.js/zip.js';
import constant from "./constant";

class Fs {
	dir : fs.ReadFileOptions;

	constructor () {
		this.dir = constant.system.baseDir();
	};

	read = {
		database : async (path : string) : Promise<Uint8Array<ArrayBuffer> | undefined> => {
			try {
				return await fs.readFile(await path, this.dir);
			} catch (error) {
				this.write.log(error.message)
			}
			return undefined;
		},
		zip : async (path : string) : Promise<Map<RegExp, Array<string | Blob>>> => {
			let zipReader : zip.ZipReader<Uint8Array> | undefined = undefined;
			let map = new Map([
				[constant.type.database, [] as  Array<string | Blob>],
				[constant.type.picture, [] as  Array<string | Blob>],
				[constant.type.conf, [] as  Array<string | Blob>],
				[constant.type.ini, [] as  Array<string | Blob>]
			]);
			try {
				const file = await fs.readFile(await path, this.dir);
				zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(file));
				const entries = await zipReader.getEntries();
				const textWriter = new zip.TextWriter();
				const uint8ArrayWriter = new zip.Uint8ArrayWriter();
				const getMimeType = (filename: string) => {
					return filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
				}
				for (const entry of entries) {
					if (!entry.getData) continue;
					if (entry.filename.match(constant.type.conf)) {
						const content = await entry.getData(textWriter)
						map.get(constant.type.conf)!.push(content)
					} else if (entry.filename.match(constant.type.ini)) {
						const content = await entry.getData(textWriter)
						map.get(constant.type.ini)!.push(content)
					} else if (entry.filename.match(constant.type.picture)) {
						const blob = await entry.getData(new zip.BlobWriter(getMimeType(entry.filename)));
						map.get(constant.type.picture)!.push(blob)
					}
				}
			} catch (error) {
				this.write.log(error.message)
			} finally {
				if (zipReader !== undefined)
					zipReader.close();
			}
			return map;
		},
		picture : async (path : string) : Promise<string | undefined> => {
			try {
				return convertFileSrc(path);
			} catch (error) {
				this.write.log(error.message)
			}
			return undefined;
		},
		text : async (path : string) : Promise<string | undefined> => {
			try {
				return await fs.readTextFile(path, this.dir);
			} catch (error) {
				this.write.log(error.message)
			}
			return undefined;
		}

	};

	write = {
		log : async (log : string)  : Promise<boolean> => {
			try {
				const file = await fs.open(constant.log.error, { append: true, baseDir : this.dir.baseDir });
				await file.write(new TextEncoder().encode(`[${new Date().toLocaleString()}] ${log}${constant.system.lineFeed()}`));
				await file.close();
				return true;
			} catch (e) {
				return false;
			}
		}
	};
}

export default new Fs();