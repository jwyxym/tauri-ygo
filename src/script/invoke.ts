import { invoke } from '@tauri-apps/api/core';
import fs from './fs';

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
};

export default new Invoke();