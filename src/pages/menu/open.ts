import * as Opener from '@tauri-apps/plugin-opener';
import fs from '@/script/fs'

class Open {
	url = async (url : string) => {
		try {
			await Opener.openUrl(url);
			return true;
		} catch (e) {
			fs.write.log(e);
		}
		return false;
	}
}

export default new Open();