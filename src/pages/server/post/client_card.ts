import Card from '../../../script/card';
import mainGame from '../../../script/game';
import { POS } from './network';
import * as CSS from 'three/examples/jsm/renderers/CSS3DRenderer.js'

class Client_Card {
	three : CSS.CSS3DObject;
	pic ?: string;
	pos ?: number;
	code ?: number;
	type ?: number;
	level ?: number;
	rank ?: number;
	link ?: number;
	attribute ?: number;
	race ?: number;
	constructor(three : CSS.CSS3DObject) {
		this.three = three;
		this.pos = POS.NONE;
	};

	update = {
		code : (code : number) : void => {
			const card : Card = mainGame.get.card(code);
			this.code = code;
			this.pic = card.pic;
			this.type = card.type;
			this.level = card.is_xyz() || card.is_link() ? 0 : card.level;
			this.rank = card.is_xyz() ? card.level : 0;
			this.link = card.is_link() ? card.level : 0;
			this.attribute = card.attribute;
		}
	}
}

export default Client_Card;