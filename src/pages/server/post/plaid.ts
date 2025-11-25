import * as CSS from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import mainGame from '../../../script/game';
import { I18N_KEYS } from '../../../script/language/i18n';
import { LOCATION } from './network';

class Plaid {
	three : CSS.CSS3DObject;
	name : string;
	loc : number;
	seq : [number, number];
	player : number;

	constructor (size : {
		width : number; height : number;
	}, x : number, y : number) {
		const dom = document.createElement('div');
		const child = document.createElement('div');
		Object.assign(child.style, {
			width : `${size.height}px`,
			height : `${size.height}px`,
			border : '2px solid #9ed3ff',
			transition : 'all 0.2s ease'
		});
		dom.appendChild(child);
		this.three = new CSS.CSS3DObject(dom);
		this.loc = Math.abs(x) === 3 ? 0
			: (() : number => {
				let loc : string = '1';
				if (y > 0) {
					loc += '0'.repeat(- x + 2);
					return parseInt(loc, 2) << ((y + 1) * 8);
				} else if (y === 0) {
					return x === -1 ? (() : number => {
						return 0x20 | (0x40 << 8);
					})()
					: (() : number => {
						return 0x40 | (0x20 << 8);
					})()
				} else {
					loc += '0'.repeat(x + 2);
					return parseInt(loc, 2) << ((y + 2) * 8);
				}
			})();
		this.seq = Math.abs(x) === 3 ? [0, 0]
			: (() : [number, number] => {
				switch (y) {
					case 2:
						return [LOCATION.MZONE | ((- x + 2) << 16), 1];
					case 1:
						return [LOCATION.SZONE | ((- x + 2) << 16), 1];
					case -1:
						return [LOCATION.SZONE | ((x + 2) << 16), 0];
					case -2:
						return [LOCATION.MZONE | ((x + 2) << 16), 0];
					default:
						return [LOCATION.MZONE | ((x > 0 ? 6 : 5) << 16), 2];
				}
			})();
		this.name = (() : string => {
			if ((x === -3 && y === 2) || (x === 3 && y === -2))
				return mainGame.get.text(I18N_KEYS.DRAW_LOCATION_DECK)
			else if ((x === -3 && y === 1) || (x === 3 && y === -1))
				return mainGame.get.text(I18N_KEYS.DRAW_LOCATION_GRAVE)
			else if ((x === -3 && y === 0) || (x === 3 && y === 0))
				return mainGame.get.text(I18N_KEYS.DRAW_LOCATION_REMOVED)
			else if ((x === -3 && y === -1) || (x === 3 && y === 1))
				return mainGame.get.text(I18N_KEYS.DRAW_LOCATION_FIELD)
			else if ((x === -3 && y === -2) || (x === 3 && y === 2))
				return mainGame.get.text(I18N_KEYS.DRAW_LOCATION_EX_DECK)
			else if (y === -2)
				return `${mainGame.get.text(I18N_KEYS.DRAW_LOCATION_SZONE)}[${x + 2}]`
			else if (y === 2)
				return `${mainGame.get.text(I18N_KEYS.DRAW_LOCATION_SZONE)}[${- x + 2}]`
			else if (y === -1)
				return `${mainGame.get.text(I18N_KEYS.DRAW_LOCATION_MZONE)}[${x + 2}]`
			else if (y === 1)
				return `${mainGame.get.text(I18N_KEYS.DRAW_LOCATION_MZONE)}[${-x + 2}]`
			else if (y === 0)
				return `${mainGame.get.text(I18N_KEYS.DRAW_LOCATION_EX_MZONE)}[${x > 0 ? 1 : 0}]`
			return '';
		})();
		this.player = (y > 0 || (y === 0 && x === -3)) ? 1 : 0;
	};

	select = {
		on : () : void => {
			this.three.element.style.border = '2px solid yellow';
		},
		off : () : void => {
			this.three.element.style.border = '2px solid #9ed3ff';
		}
	}
}

export default Plaid;