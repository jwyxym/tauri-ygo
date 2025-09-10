import YGOProDeck, { YGOProDeckLike } from 'ygopro-deck-encode';
import fs from './fs';
import constant from './constant';
import mainGame from './game';

class Deck extends YGOProDeck {
	import = false;
	constructor(init: Partial<YGOProDeckLike> = {}) {
		super(init);
	};

	push_name = (name : string) : void => {
		this.name = name;
	}

	is_imported = () : void => {
		this.import = true;
	}

	toYdkString () {
		return [
		'#created by tauri-ygo',
		'#main',
		...this.main.map((id) => id.toString()),
		'#extra',
		...this.extra.map((id) => id.toString()),
		'!side',
		...this.side.map((id) => id.toString()),
		].join('\n');
	};


	static fromYdkString (str: string) : Deck {
		const lines = str.split(constant.reg.line_feed);
		const deck = new Deck();
		try {
			let current = deck.main;
			for (const _line of lines) {
				const line = _line.trim();
				if (line === '#main') {
					current = deck.main;
				}
				if (line === '#extra') {
					current = deck.extra;
				}
				if (line === '!side') {
					current = deck.side;
				}
				if (line.match(/^\d+$/)) {
					current.push(parseInt(line, 10));
				}
			}
		} catch (e) {
			fs.write.log(mainGame.get.text().toast.error.ydk.from_code)
			return new Deck();
		}
		return deck;
	}

	static fromYGOMobileDeckURL (str: string) : Deck {
		try {
			const deck = YGOProDeck.fromYGOMobileDeckURL(str);
			return new Deck({
				main : deck.main,
				side : deck.side,
				extra : deck.extra,
				name : deck.name
			})
		} catch (e) {
			fs.write.log(mainGame.get.text().toast.error.ydk.from_url)
			return new Deck();
		}
	}
}

export default Deck;