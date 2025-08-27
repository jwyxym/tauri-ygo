import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { platform } from '@tauri-apps/plugin-os';

class System {
	system : string
	constructor () {
		this.system = platform();
	};

	baseDir = () : fs.ReadFileOptions => {
		return { baseDir: this.system == 'android' ? fs.BaseDirectory.Public : fs.BaseDirectory.Resource };
	};

	basePath = async () : Promise<string> => {
		return this.system == 'android' ? await path.publicDir() : await path.resourceDir();
	};

	lineFeed = () : string => {
		const map = new Map<string, string>([
			['linux', '\n'],
			['macos', '\n'],
			['ios', '\n'],
			['freebsd', '\n'],
			['dragonfly', '\n'],
			['netbsd', '\n'],
			['openbsd', '\n'],
			['solaris', '\n'],
			['android', '\n'],
			['windows', '\r\n']
		]);
		const lf = map.get(this.system);
		return lf ?? '\n';
	};
}

class Constant {
	reg = {
		database : /\.(cdb)$/i,
		picture : /\.(jpg|png|jpeg)$/i,
		conf : /\.(conf)$/i,
		ini : /\.(ini)$/i,
		zip : /\.(ypk|zip)$/i,
	};

	str = {
		blob : 'blob:http',
		title : 'Tauri-YGO',
		version : 'v0.0.1',
		menu : [
			'人机模式',
			'联机模式',
			'编辑卡组',
			'系统设置',
			'退出游戏'
		],
		dirs : [
			'textures',
			'expansions',
			'script',
			'pics',
			'deck'
		],
		files : new Map([
			[path.join('textures', 'cardI.jpg'), 'https://jwyxym.top:50028/pics/xiao/66666666.jpg'],
			[path.join('textures', 'cardII.jpg'), 'https://jwyxym.top:50028/pics/xiao/66666666.jpg'],
		]),
		dialog : {
			button : '#e0e0e0',
			hint : {
				download : '是否下载资源包（此过程会消耗流量）'
			}
		}
	}

	log = {
		error : 'error.log'
	};

	system = new System();
}
export default new Constant();