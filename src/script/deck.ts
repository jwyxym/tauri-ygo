import YGOProDeck, { YGOProDeckLike } from 'ygopro-deck-encode';

class Deck extends YGOProDeck {
	name : string = '';
	constructor(init: Partial<YGOProDeckLike> = {}) {
		super(init);
	};

	pushName (name : string) {
		this.name = name;
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


	static fromYdkString(str: string) : Deck {
		const lines = str.split(/\r?\n/);
		const deck = new Deck();
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
		return deck;
	}
}

export default Deck;