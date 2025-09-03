import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { platform } from '@tauri-apps/plugin-os';

class System {
	system : string
	constructor () {
		this.system = platform();
	};

	baseDir = () : number => {
		return this.system == 'android' ? fs.BaseDirectory.Public : fs.BaseDirectory.Resource;
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
		get_number_name : /[\\/](\d+)\./,
		get_name : /[\\/]([^.]*)\./,
		database : /\.(cdb)$/i,
		picture : /\.(jpg|png|jpeg)$/i,
		conf : /\.(conf)$/i,
		ini : /\.(ini)$/i,
		zip : /\.(ypk|zip)$/i,
		json : /\.(json)$/i,
		deck : /\.(ydk)$/i,
		name : /[\\/:*?"<>|]/,
		atk : /^[0-9?\s]*$/,
		level : /^[0-9 ]*$/,
	};

	str = {
		blob : 'blob:http',
		title : 'Tauri-YGO',
		dirs : {
			textures : 'textures',
			expansions : 'expansions',
			script : 'script',
			pics : 'pics',
			deck : 'deck',
			cache : 'cache'
		},
		files : {
			conf : {
				strings : 'strings.conf',
				lflist : 'lflist.conf',
				system : 'system.conf',
				servers : 'servers.conf',
				info : 'cardinfo.conf'
			},
			textures : {
				unknown : 'unknown'
			},
			database : 'cards.cdb'
		},
		string_conf : {
			system : '!system',
			victory : '!victory',
			counter : '!counter',
			setcode : '!setname',
		},
		info_conf : {
			ot : '!ot',
			attribute : '!attribute',
			link : '!link',
			category : '!category',
			race : '!race',
			type : '!type'
		},
		ini : {
			name : 'ServerName',
			host : 'ServerHost',
			port : 'ServerPort',
		},
		language : {
			Zh_CN : 'Zh_CN'
		}
	}

	log = {
		error : 'error.log'
	};

	system = new System();
}
export default new Constant();