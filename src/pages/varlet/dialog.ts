import { Dialog, DialogOptions } from '@varlet/ui'
import mainGame from '../../script/game';
import constant from '../../script/constant';

const dialog = (option : DialogOptions, need_confirm : boolean | Array<string> = true) : void => {
	const chk = mainGame.get.system(constant.str.system_conf.chk.button);
	if (option.onConfirm === undefined) option.onConfirm = () => {};
	need_confirm ? Dialog({
		title : option.title,
		message : option.message,
		dialogClass : 'dialog',
		cancelButtonTextColor : 'white',
		confirmButtonTextColor : 'white',
		cancelButtonText : chk ? mainGame.get.text().dialog.cancel : mainGame.get.text().dialog.confirm,
		confirmButtonText : chk ? mainGame.get.text().dialog.confirm : mainGame.get.text().dialog.cancel,
		onConfirm : chk ? option.onConfirm : option.onCancel,
		onCancel : chk ? option.onCancel : option.onConfirm
	}) : option.onConfirm();
}

export default dialog;