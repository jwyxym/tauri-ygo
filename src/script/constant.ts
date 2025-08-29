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
		get_number_name : /\/(\d+)\./,
		get_name : /\/([^.]*)\./,
		database : /\.(cdb)$/i,
		picture : /\.(jpg|png|jpeg)$/i,
		conf : /\.(conf)$/i,
		ini : /\.(ini)$/i,
		zip : /\.(ypk|zip)$/i,
		json : /\.(json)$/i
	};

	str = {
		blob : 'blob:http',
		title : 'Tauri-YGO',
		menu : [
			'人机模式',
			'联机模式',
			'编辑卡组',
			'系统设置',
			'退出游戏'
		],
		dirs : {
			textures : 'textures',
			expansions : 'expansions',
			script : 'script',
			pics : 'pics',
			deck : 'deck',
			language : 'language'
		},
		files : {
			conf : {
				strings : 'strings.conf',
				lflist : 'lflist.conf',
				system : 'system.conf',
				servers : 'servers.conf'
			},
			textures : {
				unknown : 'unknow.jpg'
			},
			database : 'cards.cdb'
		},
		string_conf : {
			system : '!system',
			victory : '!victory',
			counter : '!counter',
			setcode : '!setname',
		},
		ini : {
			name : 'ServerName',
			host : 'ServerHost',
			port : 'ServerPort',
		},
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