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
			strings : 'strings',
			info : 'info',
			database : 'cdb'
		},
		exdirs : {
			pics : 'pics',
		},
		files : {
			conf : {
				info : 'cardinfo.conf',
				strings : 'strings.conf',
				lflist : 'lflist.conf',
				servers : 'servers.conf',
			},
			textures : {
				unknown : 'unknown.jpg',
				cover : 'cover.jpg',
				pic : ['cardI.jpg', 'cardII.jpg'],
				rps : ['s.png', 'r.png', 'p.png'],
				back : ['backI.jpg', 'backII.jpg']
			},
			sound : {
				back : 'Night View.wav',
				battle : 'City of Night.wav'
			},
			system : 'system.conf',
			pics : 'pics.zip',
			assets : 'assets.zip',
			strings : new Map([]) as Map<string, string>,
			info : new Map([]) as Map<string, string>,
			database : new Map([]) as Map<string, string>,
		},
		strings_conf : {
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
				download_time : 'download_time'
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
			Zh_CN : 'zh-CN'
		},
		url : {
			super_pre : 'https://cdn02.moecube.com:444/ygopro-super-pre/archive/ygopro-super-pre.ypk',
			assets : 'https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/releases/release-latest/attach_files/assets.zip/download',
			version : 'https://web-api.gitcode.com/api/v2/projects/jwyxym%2Ftauri-ygo/releases?repoId=jwyxym%252Ftauri-ygo',
			headers : {
				version : [['Referer', 'https://gitcode.com/']] as Array<[string, string]>
			}
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

	constructor () {
		this.str.files.strings.set(this.str.language.Zh_CN, 'strings-zh-CN.conf');
		this.str.files.info.set(this.str.language.Zh_CN, 'cardinfo-zh-CN.conf');
		this.str.files.database.set(this.str.language.Zh_CN, 'cards-zh-CN.cdb');
	};
}
export default new Constant();