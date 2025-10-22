import * as CONSTANT from './constant';
import mainGame from './game';

const TYPE = {
	MONSTER : 0x1,
	SPELL : 0x2,
	TRAP : 0x4,
	NORMAL : 0x10,
	EFFECT : 0x20,
	FUSION : 0x40,
	RITUAL : 0x80,
	TRAPMONSTER : 0x100,
	SPIRIT : 0x200,
	UNION : 0x400,
	DUAL : 0x800,
	TUNER : 0x1000,
	SYNCHRO : 0x2000,
	TOKEN : 0x4000,
	QUICKPLAY : 0x10000,
	CONTINUOUS : 0x20000,
	EQUIP : 0x40000,
	FIELD : 0x80000,
	COUNTER : 0x100000,
	FLIP : 0x200000,
	TOON : 0x400000,
	XYZ : 0x800000,
	PENDULUM : 0x1000000,
	SPSUMMON : 0x2000000,
	LINK : 0x4000000
}

interface Info {
	icon : string;
	content : string | number;
}

interface CardInfo {
	ot : string;
	atk : string;
	def : string;
	type : string;
	race : string;
	attribute : string;
	category : string;
	setcode : string;
	info : Array<Info>;
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
	row : Array<string | number>
  
	constructor (row : Array<string | number>) {
		this.row = row;
		this.pic = '';
		this.id = row[0] as number;
		this.ot = row[1] as number;
		this.alias = row[2] as number;
		this.setcode = row[3].toString(16).padStart(16, '0').match(/.{1,4}/g)!.map(str => parseInt(str, 16));
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

	clone = () : Card => {
		return new Card(this.row);
	};

	update_pic = (url : string) : void => {
		this.clear();
		this.pic = url;
	};

	get_info = () : CardInfo => {
		const result = {
			ot :  mainGame.get.strings.ot(this.ot),
			atk : this.atk >= 0 ? this.atk.toString() : '?',
			def : this.is_link() ? '-' : this.def >= 0 ? this.def.toString() : '?',
			type : mainGame.get.strings.type(this.type),
			race : '',
			attribute : '',
			category : mainGame.get.strings.category(this.category),
			setcode : this.setcode.filter(i => i > 0).map(i => mainGame.get.strings.setcode(i)).join('|'),
			info : []
		} as CardInfo
		if (this.is_monster()) {
			const attr = mainGame.icons.get(CONSTANT.KEYS.ATTRIBUTE)!.get(this.attribute)
			if (attr)
				result.attribute = mainGame.get.textures(attr + '.png') as string | undefined ?? ''
			const race = mainGame.icons.get(CONSTANT.KEYS.RACE)!.get(this.race)
			if (race)
				result.race = mainGame.get.textures(race + '.png') as string | undefined ?? ''
			result.info.push({
				icon : mainGame.get.textures((() : string => {
					return this.is_link() ? constant.str.files.textures.card_info.link
						: this.is_xyz() ? constant.str.files.textures.card_info.rank
							: this.is_tuner() ? constant.str.files.textures.card_info.tuner
								: constant.str.files.textures.card_info.level
					;
				})()) as string | undefined ?? '',
				content : this.level
			});
			result.info.push({
				icon : mainGame.get.textures( constant.str.files.textures.atk) as string | undefined ?? '',
				content : this.atk >= 0 ? this.atk : '?'
			});
			if (!this.is_link())
				result.info.push({
					icon : mainGame.get.textures( constant.str.files.textures.def) as string | undefined ?? '',
					content : this.def >= 0 ? this.def : '?'
				});
			if (this.is_pendulum())
				result.info.push({
					icon : mainGame.get.textures( constant.str.files.textures.card_info.scale) as string | undefined ?? '',
					content : this.scale
				});
		} else if (this.is_spell()) {
			result.race = mainGame.get.textures(constant.str.files.textures.spell) as string | undefined ?? ''
		} else if (this.is_trap()) {
			result.race = mainGame.get.textures(constant.str.files.textures.trap) as string | undefined ?? ''
		}
		
		return result;
	};

	clear = () : void => {
		if (this.pic.startsWith('blob:http'))
			URL.revokeObjectURL(this.pic);
	};

	has_pic = () : boolean => {
		return this.pic !== '' && this.pic !== mainGame.get.textures(constant.str.files.textures.unknown);
	};

	is_link = () : boolean => {
		return (this.type & TYPE.LINK) === TYPE.LINK;
	};

	is_pendulum = () : boolean => {
		return (this.type & TYPE.PENDULUM) === TYPE.PENDULUM;
	};

	is_xyz = () : boolean => {
		return (this.type & TYPE.XYZ) === TYPE.XYZ;
	};

	is_monster = () : boolean => {
		return (this.type & TYPE.MONSTER) === TYPE.MONSTER;
	};

	is_spell = () : boolean => {
		return (this.type & TYPE.SPELL) === TYPE.SPELL;
	};

	is_trap = () : boolean => {
		return (this.type & TYPE.TRAP) === TYPE.TRAP;
	};

	is_ex = () : boolean => {
		return (this.type & (TYPE.FUSION | TYPE.SYNCHRO | TYPE.XYZ | TYPE.LINK)) > 0;
	};

	is_token = () : boolean => {
		return (this.type & TYPE.TOKEN) === TYPE.TOKEN;
	};

	is_tuner = () : boolean => {
		return (this.type & TYPE.TUNER) === TYPE.TUNER;
	};

}

export default Card;
export { TYPE };
export type { Search, CardInfo, Info };