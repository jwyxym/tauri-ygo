import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { platform } from '@tauri-apps/plugin-os';

class System {
	system : string
	constructor () {
		this.system = platform();
	};

	base_dir = () : number => {
		return this.system == 'android' ? fs.BaseDirectory.Public : fs.BaseDirectory.Resource;
	};

	resource_dir = () : number => {
		return fs.BaseDirectory.Resource;
	};

	base_path = async () : Promise<string> => {
		return this.system == 'android' ? await path.publicDir() : await path.resourceDir();
	};

	line_feed = () : string => {
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
		line_feed : /\r?\n/
	};

	str = {
		blob : 'blob:http',
		title : 'Tauri-YGO',
		replace : '{:?}',
		dirs : {
			textures : 'textures',
			expansions : 'expansions',
			script : 'script',
			deck : 'deck',
			cache : 'cache',
			assets : 'assets'
		},
		exdirs : {
			pics : 'pics'
		},
		files : {
			system : 'system.conf',
			conf : {
				info : 'cardinfo.conf',
				strings : 'strings.conf',
				lflist : 'lflist.conf',
				servers : 'servers.conf',
			},
			textures : {
				unknown : 'unknown',
				pic : ['cardI', 'cardII']
			},
			database : 'cards.cdb',
			pics : 'pics.zip'
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
		system_conf : {
			chk : {
				deck : {
					delete : 'delete',
					exit : 'exit'
				},
				button : 'button'
			},
			string : {
				expansion : 'load'
			}
		},
		ini : {
			name : 'ServerName',
			host : 'ServerHost',
			port : 'ServerPort',
		},
		language : {
			Zh_CN : 'Zh_CN'
		},
		url : {
			super_pre : 'https://cdn02.moecube.com:444/ygopro-super-pre/archive/ygopro-super-pre.ypk',
		},
		extends : {
			ypk : '.ypk',
			cdb : '.cdb'
		}
	}

	log = {
		error : 'error.log'
	};

	system = new System();
}
export default new Constant();