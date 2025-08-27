import { useToast } from 'vue-toastification'

import fs from './fs'
import constant from './constant';

class Game {
    init = async () : Promise<void> => {
		useToast().info('正在初始化文件夹');
		for (const i of constant.str.dirs) {
			if (!await fs.exists(i))
				await fs.write.dir(i);
		}
		for (const [path, url] of constant.str.files) {
			const i = await path;
			if (!await fs.exists(i))
				await fs.write.fromUrl(i, url);
		}
    }
}

const mainGame = new Game();
export default mainGame;