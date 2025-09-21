import { Dialog, DialogOptions, DialogActions } from '@varlet/ui'
import mainGame from '../../script/game';
import constant from '../../script/constant';

const dialog = async (option : DialogOptions, need_confirm : boolean | number | Array<string> | string = true) : Promise<void> => {
	const chk = mainGame.get.system(constant.str.system_conf.chk.button);
	option.dialogClass = 'dialog';
	option.cancelButtonTextColor = 'white';
	option.confirmButtonTextColor = 'white';
	option.cancelButtonText = chk ? mainGame.get.text().dialog.cancel : mainGame.get.text().dialog.confirm;
	option.confirmButtonText = chk ? mainGame.get.text().dialog.confirm : mainGame.get.text().dialog.cancel;
	const confirm = option.onConfirm;
	const cancel = option.onCancel;
	option.onConfirm = chk ? confirm : cancel;
	option.onCancel = chk ? cancel : confirm;
	const quit = async () : Promise<void> => {
		console.log(option.onConfirm)
		if (confirm !== undefined)
			await confirm();
	};
	need_confirm ? await Dialog(option) : await quit();
}

export default dialog;