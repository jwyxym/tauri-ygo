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

export default Idle;