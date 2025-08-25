import constant from "./constant";

interface cardLike {
	ot ?: number;
	id ?: number;
	alias ?: number;
	level ?: number;
	scale ?: number;
	atk ?: number;
	def ?: number;
	type ?: number;
	race ?: number;
	attribute ?: number;
	category ?: number;
	setcode ?: Array<string>;
	name ?: string;
	desc ?: string;
	hint ?: Array<string>;
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
	setcode : Array<string>;
	name : string;
	desc : string;
	hint : Array<string>;
	pic : string;
  
	constructor(row : Array<string|number>) {
		this.id = row[0] as number;
		this.ot = row[1] as number;
		this.alias = row[2] as number;
		this.setcode = row[3].toString(16).padStart(16, '0').match(/.{1,4}/g) as Array<string>;
		this.type = row[4] as number;
		this.atk = row[5] as number;
		this.def = row[6] as number;
		this.level = parseInt(row[7].toString(16).slice(-4)) | 0;
		this.scale = parseInt(row[7].toString(16).slice(-4, -6)) | 0;
		this.race = row[8] as number;
		this.attribute = row[9] as number;
		this.category = row[10] as number;
		this.name = row[12] as string;
		this.desc = row[13] as string;
		this.hint = row.slice(14, 30) as Array<string>;
		this.pic = '';
	}

	updatePic = (url : string) : void => {
		if (this.pic.startsWith(constant.str.blob)) {
			URL.revokeObjectURL(this.pic)
		}
		this.pic = url;
	}
}

export default Card;
export type { cardLike };