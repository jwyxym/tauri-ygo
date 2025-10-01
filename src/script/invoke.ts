import { invoke } from '@tauri-apps/api/core';
import fs from './fs';

interface Srv {
	priority : number;
	weight : number;
	port : number;
	target : string;
};

type Srvs = Array<Srv>;

class Invoke {
	version = async (url : string, headers : Array<[string, string]> = []) : Promise<string | boolean> => {
		try {
			const res = await invoke<string>('version', {
				url : url, headers : headers
			});
			return res;
		} catch (error) {
			fs.write.log(error);
			return false;
		}
	};

	get_srv = async (url : string) : Promise<Srv | boolean> => {
		try {
			const res = await invoke<Srvs>('get_srv', {
				url : url
			});
			return res[0];
		} catch (error) {
			fs.write.log(error);
			return false;
		}
	};
};

export default new Invoke();
export type { Srv };