import * as fs from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { platform } from '@tauri-apps/plugin-os';

const SYSTEM = platform();

const BASE_DIR = SYSTEM == 'android' ? fs.BaseDirectory.Public : fs.BaseDirectory.Resource;
const BASE_PATH = SYSTEM == 'android' ? path.publicDir : path.resourceDir;
const LINE_FEED = SYSTEM == 'windows' ? '\r\n' : '\n';

const REG = {
	NAME : /[\\/]([^.]*)\./,
	FULL_NAME : /[\\/:*?"<>|]/,
	NUMBER_NAME : /[\\/](\d+)\./,
	DATABASE : /\.(cdb)$/i,
	PICTURE : /\.(jpg|png|jpeg)$/i,
	BGM : /\.(mp4|wav)$/i,
	CONF : /\.(conf)$/i,
	INI : /\.(ini)$/i,
	ZIP : /\.(ypk|zip)$/i,
	FONT : /\.(ttf)$/i,
	JSON : /\.(json)$/i,
	DECK : /\.(ydk)$/i,
	ATK : /^[0-9?\s]*$/,
	LV : /^[0-9 ]*$/,
	LINE_FEED : /\r?\n/
};

const DIRS = {
	TEXTURE : 'textures',
	EXPANSION : 'expansions',
	LUA : 'lua',
	DECK : 'deck',
	CACHE : 'cache',
	SOUND : 'sound',
	STRING : 'strings',
	INFO : 'info',
	DB : 'cdb',
	PIC : 'pics',
	FONT : 'font'
};

const LANGUAGE = {
	Zh_CN : 'zh-CN'
};

const FILES = {
	LFLIST_CONF : 'lflist.conf',
	SERVER_CONF : 'servers.conf',
	SYSTEM_CONF : 'system.conf',
	BACK_BGM : 'Night View.wav',
	BATTLE_BGM : 'City of Night.wav',
	SUPER_PRE : 'ygopro-super-pre.ypk',
	PIC_ZIP : 'pics.zip',
	ASSETS_ZIP : 'assets.zip',
	TEXTURE_UNKNOW : 'unknown.jpg',
	TEXTURE_COVER : 'cover.jpg',
	TEXTURE_SPELL : 'attr_spell.png',
	TEXTURE_TRAP : 'attr_trap.png',
	TEXTURE_ATK : 'atk.png',
	TEXTURE_DEF : 'def.png',
	TEXTURE_RPS : ['s.png', 'r.png', 'p.png'],
	TEXTURE_TYPE_TUNER : 'type_tuner.png',
	TEXTURE_TYPE_LV : 'type_level.png',
	TEXTURE_TYPE_RANK : 'type_rank.png',
	TEXTURE_TYPE_LINK : 'type_link.png',
	TEXTURE_TYPE_SCALE : 'type_scale.png',
	TEXTURE_TYPE_OVERLAY : 'type_overlay.png',
	TEXTURE_BACK : ['backI.jpg', 'backII.jpg'],
	TEXTURE_DECK : ['deck.png', 'deck_ex.png'],
	TEXTURE_MENU : [
		'menu_I.jpg',
		'menu_II.jpg',
		'menu_III.jpg',
		'menu_IV.jpg',
		'menu_V.jpg'
	],
	STRING_CONF : new Map([
		['', 'strings.conf'],
		[LANGUAGE.Zh_CN, 'strings-zh-CN.conf']
	]) as Map<string, string>,
	INFO_CONF : new Map([
		['', 'info.conf'],
		[LANGUAGE.Zh_CN, 'cardinfo-zh-CN.conf']
	]) as Map<string, string>,
	DB : new Map([
		[LANGUAGE.Zh_CN, 'cards-zh-CN.cdb']
	]) as Map<string, string>,
};

const URL = {
	SUPER_PRE : 'https://cdn02.moecube.com:444/ygopro-super-pre/archive/ygopro-super-pre.ypk',
	SUPER_PRE_VERSION : 'https://cdn02.moecube.com:444/ygopro-super-pre/data/version.txt',
	ASSETS : SYSTEM === 'android' ?
		'https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/releases/release-latest/attach_files/assets_android.zip/download' :
		'https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/releases/release-latest/attach_files/assets.zip/download',
	VERSION : 'https://web-api.gitcode.com/api/v2/projects/jwyxym%2Ftauri-ygo/releases?repoId=jwyxym%252Ftauri-ygo',
	VERSION_HEAD : [['Referer', 'https://gitcode.com/']] as Array<[string, string]>
}

const KEYS = {
	SYSTEM : '!system',
	VICTORY : '!victory',
	COUNTER : '!counter',
	SETCODE : '!setname',
	OT : '!ot',
	ATTRIBUTE : '!attribute',
	LINK : '!link',
	CATEGORY : '!category',
	RACE : '!race',
	TYPE : '!type',
	SERVER_NAME : 'ServerName',
	SERVER_HOST : 'ServerHost',
	SERVER_PORT : 'ServerPort',
	SETTING_CHK_DELETE_YPK : 'DELETE_YPK',
	SETTING_CHK_DELETE_DECK : 'DELETE_DECK',
	SETTING_CHK_EXIT_DECK : 'EXIT_DECK',
	SETTING_CHK_SWAP_BUTTON : 'SWAP_BUTTON',
	SETTING_VOICE_BACK_BGM : 'BACK_BGM',
	SETTING_LOADING_EXPANSION : 'LOADING_EXPANSION',
	SETTING_SERVER_ADDRESS : 'SERVER_ADDRESS',
	SETTING_SERVER_PLAYER_NAME : 'SERVER_PLAYER_NAME',
	SETTING_SERVER_PASS : 'SERVER_PASS',
	SETTING_DOWMLOAD_TIME : 'DOWMLOAD_TIME',
	SETTING_CT_DECK_MAIN : 'CT_DECK_MAIN',
	SETTING_CT_DECK_EX : 'CT_DECK_EX',
	SETTING_CT_DECK_SIDE : 'CT_DECK_SIDE',
	SETTING_CT_CARD : 'CT_CARD',
};

export { REG, DIRS, FILES, LANGUAGE, URL, KEYS, BASE_DIR, BASE_PATH, LINE_FEED, SYSTEM };