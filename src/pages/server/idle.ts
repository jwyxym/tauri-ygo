import Client_Card from './scene/client_card';

class Idle {
	array : Array<Client_Card>;

	constructor () {
		this.array = [];
	};

	push = (card : Client_Card) : void => {
		this.array.push(card);
	};

	clear = () : void => {
		this.array.length = 0;
	};

	index = (card : Client_Card) : number => {
		console.log(this.array)
		return this.array.indexOf(card);
	};

	filter = (card : Array<Client_Card>) : Array<Client_Card> => {
		return this.array.filter(i => card.includes(i));
	};
}

class EffectIdle {
	array : Array<{
		card : Client_Card;
		desc : number;
	}>;

	constructor () {
		this.array = [];
	};

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

	filter = (card : Client_Card | Array<Client_Card>, key : string = '') : Array<{
		card : Client_Card;
		desc : number;
	}> => {
		return this.array.filter(i => Array.isArray(card) ? card.includes(i.card)
			&& (key === '' || (key === 'activate' && i.desc !== 1160) || (key === 'scale' && i.desc === 1160))
				: (i.card === card && i.desc !== 1160)
		);
	};
};

export { Idle, EffectIdle };