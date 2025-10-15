import Card, { TYPE } from '../../../script/card';
import mainGame from '../../../script/game';
import { POS } from './network';
import * as CSS from 'three/examples/jsm/renderers/CSS3DRenderer.js'

class Client_Card {
	three : CSS.CSS3DObject;
	code : number;
	alias : number;
	card ?: Card;
	pic ?: string;
	pos ?: number;
	type ?: number;
	level ?: number;
	rank ?: number;
	link ?: number;
	attribute ?: number;
	race ?: number;
	atk ?: number;
	def ?: number;
	scale : Array<number>;

	constructor(three : CSS.CSS3DObject) {
		this.code = 0;
		this.alias = 0;
		this.three = three;
		this.pos = POS.NONE;
		this.scale = [];
	};

	update = {
		code : async (code : number) : Promise<void> => {
			if (code === 0) {
				this.clear();
				return;
			}
			const card : Card = mainGame.get.card(code);
			if (card.pic === '')
				await mainGame.load.pic([code]);
			this.card = card;
			this.code = code;
			this.alias = card.alias;
			this.pic = card.pic;
			this.type = card.type;
			this.level = (card.is_xyz() || card.is_link()) ? 0 : card.level;
			this.rank = card.is_xyz() ? card.level : 0;
			this.link = card.is_link() ? card.level : 0;
			this.attribute = card.attribute;
			this.atk = card.atk;
			this.def = card.def;
		},
		alias : (code : number) : void => {
			this.alias = code;
		},
		type : (type : number) : void => {
			this.type = type;
		},
		level : (level : number) : void => {
			this.level = level;
		},
		rank : (rank : number) : void => {
			this.rank = rank;
		},
		attribute : (attribute : number) : void => {
			this.attribute = attribute;
		},
		race : (race : number) : void => {
			this.race = race;
		},
		link : (link : number) : void => {
			this.link = link;
		},
		atk : (atk : number) : void => {
			this.atk = atk;
		},
		def : (def : number) : void => {
			this.def = def;
		},
		scale : (scale : number, seq : number) : void => {
			this.scale[seq] = scale;
		}
	};
	clear = () : void => {
		this.card = undefined;
		this.pic = undefined;
		this.code = 0;
		this.alias = 0;
		this.type = 0;
		this.level = 0;
		this.rank = 0;
		this.link = 0;
		this.attribute = 0;
		this.atk = 0;
		this.def = 0;
		this.scale = [];
	};
	is_xyz = () : boolean => {
		return this.rank !== undefined && this.rank > 0;
	};
	is_link = () : boolean => {
		return this.link !== undefined && this.link > 0;
	};
	is_tuner = () : boolean => {
		return this.type !== undefined && ((this.type & TYPE.TUNER) === TYPE.TUNER);
	}
}

export default Client_Card;