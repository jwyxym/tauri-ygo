import constant from './constant';
import mainGame from './game';

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

	get_info = () : CardInfo => {
		return {
			ot :  mainGame.get.strings.ot(this.ot),
			level : `${this.is_link() ? 'link-' : (this.is_xyz() ? '☆' : '★')}${this.level}`,
			atk : this.atk >= 0 ? this.atk.toString() : '?',
			def : this.is_link() ? '-' : this.def >= 0 ? this.def.toString() : '?',
			link : this.is_link() ? mainGame.get.strings.link(this.def) : '',
			type : mainGame.get.strings.type(this.type),
			race : mainGame.get.strings.race(this.race),
			attribute : mainGame.get.strings.attribute(this.attribute),
			category : mainGame.get.strings.category(this.category),
			setcode : this.setcode.filter(i => i > 0).map(i => mainGame.strings.get(constant.str.strings_conf.setcode)?.get(i) ?? `0x${i.toString(16)}`).join('|'),
		}
	};

	clear = () : void => {
		if (this.pic.startsWith(constant.str.blob))
			URL.revokeObjectURL(this.pic);
	};

	has_pic = () : boolean => {
		return this.pic !== '' && this.pic !== mainGame.get.textures(constant.str.files.textures.unknown);
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