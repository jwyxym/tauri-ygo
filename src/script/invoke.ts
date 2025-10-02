import { invoke } from '@tauri-apps/api/core';
import fs from './fs';

interface Srv {
	priority : number;
	weight : number;
	port : number;
	target : string;
};

interface Result<T> {
	content ?: T;
	error ?: string;
};

type DataBase = Array<[Array<number>, Array<string>]>;
type File<T> = Array<[T, { content : string | Uint8Array }]>;
type StringFile<T> = Array<[T, { content : string }]>;
type BufferFile<T> = Array<[T, { content : Uint8Array }]>;

class Invoke {
	version = async (url : string, headers : Array<[string, string]> = []) : Promise<Result<string>> => {
		const result : Result<string> = {};
		try {
			result.content = await invoke<string>('version', {
				url : url, headers : headers
			});
		} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};

	get_srv = async (url : string) : Promise<Result<Srv>> => {
		const result : Result<Srv> = {};
		try {
			const res = await invoke<Srv>('get_srv', {
				url : `_ygopro._tcp.${url}`
			});
			if (res.target.endsWith('.'))
				res.target = res.target.slice(0, -1);
			result.content = res;
		} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};

	unzip = async (path : string, file : string, chk : boolean) : Promise<Result<void>> => {
		const result : Result<void> = {};
		try {
			await invoke<void>('unzip', {
				path : path, file : file, chk : chk
			});
	 	} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};

	read_db = async (path : string) : Promise<Result<DataBase>> => {
		const result : Result<DataBase> = {};
		try {
			result.content = await invoke<DataBase>('read_db', {
				path : path,
			});
		} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};

	read_texts = async (dirs : string | Array<string>, file_type : string) : Promise<Result<StringFile<string>>> => {
		const result : Result<StringFile<string>> = {};
		try {
			result.content = await invoke<StringFile<string>>('read_texts', {
				dirs : typeof dirs === 'string' ? [dirs] : dirs , fileType : file_type
			});
		} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};
	
	read_pics = async (dirs : Array<string>, codes : Array<number>) : Promise<Result<BufferFile<number>>> => {
		const result : Result<BufferFile<number>> = {};
		try {
			result.content = await invoke<BufferFile<number>>('read_pics', {
				dirs : dirs, codes: codes
			});
		} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};

	read_zip = async (path : string, file_type : Array<string>) : Promise<Result<File<string>>> => {
		const result : Result<File<string>> = {};
		try {
			result.content = await invoke<File<string>>('read_zip', {
				path : path, fileType: file_type
			});
		} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};

	download = async (url : string, path : string, name : string, ex_name : string = '') : Promise<Result<string>> => {
		const result : Result<string> = {};
		try {
			result.content = await invoke<string>('download', {
				url : url,
				path : path,
				name : name,
				exName : ex_name
			});
		} catch (error) {
			fs.write.log(error);
			result.error = error;
		}
		return result;
	};
};

export default new Invoke();
export type { Result, DataBase, File, StringFile, BufferFile, Srv };