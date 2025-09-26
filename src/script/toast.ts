import { useToast } from 'vue-toastification';

class Toast {
	init = useToast();
	error = (str : string | number) : void => {
		this.init.error(str);
	}
	info = (str : string | number) : void => {
		this.init.info(str);
	}
}

export default new Toast();