import Client_Card from './post/client_card';

class Idle {
	array : Array<Client_Card>;

	constructor () {
		this.array = [];
	}

	push = (card : Client_Card) : void => {
		this.array.push(card);
	};

	clear = () : void => {
		this.array.length = 0;
	};

	index = (card : Client_Card) : number => {
		return this.array.indexOf(card);
	};
}

class EffectIdle {
	array : Array<{
		card : Client_Card;
		desc : number;
	}>;

	constructor () {
		this.array = [];
	}

	push = (card : Client_Card, desc : number) : void => {
		this.array.push({
			card : card,
			desc : desc
		});
	};

	clear = () : void => {
		this.array.length = 0;
	};

	index = (card : Client_Card, desc : number) : number => {
		return this.array.findIndex(i => i.card === card && i.desc === desc);
	};

	length = () : number => {
		return this.array.length;
	};

	filter = (card : Client_Card) : Array<{
		card : Client_Card;
		desc : number;
	}> => {
		return this.array.filter(i => i.card === card && i.desc !== 1160);
	};
};

export { Idle, EffectIdle };