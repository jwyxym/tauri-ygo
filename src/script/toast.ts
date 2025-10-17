import { useToast } from 'vue-toastification';

class Toast {
	init = useToast();
	chat = true;
	on = () : void => {
		this.chat = true;
	};
	off = () : void => {
		this.chat = false;
	};
	error = (str : string | number, chat : boolean = false) : void => {
		str = typeof str === 'string' ? str : str.toString();
		if (this.chat || !chat)
			this.init.error(str);
	};
	info = (str : string | number, chat : boolean = false) : void => {
		str = typeof str === 'string' ? str : str.toString();
		if (this.chat || !chat)
			this.init.info(str);
	};
}

export default new Toast();