import constant from './constant';
import mainGame from './game';
import fs from './fs'
import * as path from '@tauri-apps/api/path';

interface CardInfo {
	ot : string;
	level : string;
	atk : string;
	def : string;
	link : string;
	type : string;
	race : string;
	attribute : string;
	category : string;
	setcode : string;
}

interface Search {
	ot ?: number;
	alias ?: number;
	level ?: string;
	scale ?: string;
	atk ?: string;
	def ?: string;
	link ?: number;
	type ?: number;
	race ?: number;
	attribute ?: number;
	category ?: number;
	setcode ?: number;
	desc ?: string;
	forbidden ?: Array<number>;
	lflist ?: string;
}

class Card {
	ot : number;
	id : number;
	alias : number;
	level : number;
	scale : number;
	atk : number;
	def : number;
	type : number;
	race : number;
	attribute : number;
	category : number;
	setcode : Array<number>;
	name : string;
	desc : string;
	hint : Array<string>;
	pic : string;
  
	constructor (row : Array<string | number>) {
		this.pic = '';
		this.id = row[0] as number;
		this.ot = row[1] as number;
		this.alias = row[2] as number;
		this.setcode = row[3].toString(16).padStart(16, '0').match(/.{1,4}/g)!.map(str => parseInt(str));
		this.type = row[4] as number;
		this.atk = row[5] as number;
		this.def = row[6] as number;
		const level = row[7].toString(16).padStart(7, '0')
		this.level = parseInt(level.slice(-4)) | 0;
		this.scale = parseInt(level.slice(-6, -4)) | 0;
		this.race = row[8] as number;
		this.attribute = row[9] as number;
		this.category = row[10] as number;
		this.name = row[11] as string;
		this.desc = row[12] as string;
		this.hint = row.slice(13, 29) as Array<string>;
	};

	update_pic = (url : string) : void => {
		this.clear();
		this.pic = url;
	};

	find_pic = async () : Promise<void> => {
		const paths : Array<string> = [
			await path.join(constant.str.dirs.expansions, constant.str.exdirs.pics, `${this.id}.jpg`)
		]
		for (const file of paths) {
			if (await fs.exists(file)) {
				const i = await fs.read.picture(file);
				if (i !== undefined) {
					this.update_pic(i);
					return;
				}
			}
		}
		let url : string | undefined = mainGame.get.textures(constant.str.files.textures.unknown);
		if (url !== undefined)
			this.update_pic(url);
	};

	get_info = () : CardInfo => {
		const to_srting = (i : Array<string>) : string => {
			return i.filter(i => i !== '').join('|')
		}
		let ot : Array<string> = [];
		let link : Array<string> = [];
		let type : Array<string> = [];
		let race : Array<string> = [];
		let attribute : Array<string> = [];
		let category : Array<string> = [];
		for (const i of [
			{array : ot, key : constant.str.info_conf.ot, this : this.ot},
			{array : link, key : constant.str.info_conf.link, this : this.def},
			{array : type, key : constant.str.info_conf.type, this : this.type},
			{array : race, key : constant.str.info_conf.race, this : this.race},
			{array : attribute, key : constant.str.info_conf.attribute, this : this.attribute},
			{array : category, key : constant.str.info_conf.category, this : this.category}
		])
			for (const [k, v] of mainGame.strings.get(i.key) ?? new Map) {
				if ((i.this & k) == k)
					i.array.push(v);
			}
			
		const setcode = this.setcode.map(i => i > 0 ? mainGame.strings.get(constant.str.string_conf.setcode)?.get(i) ?? `0x${i.toString(16)}` : '');
		return {
			ot : to_srting(ot),
			level : `${this.is_link() ? 'link-' : (this.is_xyz() ? '☆' : '★')}${this.level}`,
			atk : this.atk >= 0 ? this.atk.toString() : '?',
			def : this.is_link() ? '-' : this.def >= 0 ? this.def.toString() : '?',
			link : this.is_link() ? to_srting(link) : '',
			type : to_srting(type),
			race : to_srting(race),
			attribute : to_srting(attribute),
			category : to_srting(category),
			setcode : to_srting(setcode),
		}
	};

	clear = () : void => {
		if (this.pic.startsWith(constant.str.blob))
			URL.revokeObjectURL(this.pic);
	};

	is_link = () : boolean => {
		return (this.type & 0x4000000) === 0x4000000;
	};

	is_pendulum = () : boolean => {
		return (this.type & 0x1000000) === 0x1000000;
	};

	is_xyz = () : boolean => {
		return (this.type & 0x800000) === 0x800000;
	};

	is_monster = () : boolean => {
		return (this.type & 0x1) === 0x1;
	};

	is_ex = () : boolean => {
		return (this.type & 0x4802040) > 0;
	};

	is_token = () : boolean => {
		return (this.type & 0x4000) === 0x4000;
	};

}

export default Card;
export type { Search, CardInfo };