import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { platform } from '@tauri-apps/plugin-os';
import { server } from 'typescript';

class System {
	system : string
	constructor () {
		this.system = platform();
	};

	base_dir = () : number => {
		return this.system == 'android' ? fs.BaseDirectory.Public : fs.BaseDirectory.Resource;
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
		bgm : /\.(mp4|wav)$/i,
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
		replace : {
			tauri : '{:?}',
			strings : ['%ls', '%d']
		},
		dirs : {
			textures : 'textures',
			expansions : 'expansions',
			script : 'script',
			deck : 'deck',
			cache : 'cache',
			sound : 'sound',
		},
		exdirs : {
			pics : 'pics',
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
				unknown : 'unknown.jpg',
				back : 'back.jpg',
				pic : ['cardI.jpg', 'cardII.jpg']
			},
			sound : {
				back : 'Night View.wav',
				battle : 'City of Night.wav'
			},
			database : 'cards.cdb',
			pics : 'pics.zip',
			assets : 'assets.zip'
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
				ypk_delete : 'delete_ypk',
				deck_delete : 'delete',
				deck_exit : 'exit',
				button : 'button'
			},
			string : {
				expansion : 'load',
				server_address : 'server_address',
				server_name : 'server_name',
				server_pass : 'server_pass',
			},
			sound : {
				back : 'back_sound',
				button : 'button_sound'
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
			assets : 'https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/releases/release-latest/attach_files/assets.zip/download'
		},
		extends : {
			ypk : '.ypk',
			cdb : '.cdb',
			jpg : '.jpg',
			wav : '.wav'
		}
	}

	log = {
		error : 'error.log'
	};

	system = new System();
}
export default new Constant();