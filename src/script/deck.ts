import YGOProDeck, { YGOProDeckLike } from 'ygopro-deck-encode';

class Deck extends YGOProDeck {
	constructor(init: Partial<YGOProDeckLike> = {}) {
		super(init);
	};

	toYdkString() {
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
}

export default Deck;