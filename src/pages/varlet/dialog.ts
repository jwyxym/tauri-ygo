import { Dialog, DialogOptions } from '@varlet/ui'
import mainGame from '../../script/game';
import * as CONSTANT from '../../script/constant';
import { I18N_KEYS } from '../../script/language/i18n';

const dialog = async (option : DialogOptions, need_confirm : boolean | number | Array<string> | string = true) : Promise<void> => {
	const chk = mainGame.get.system(CONSTANT.KEYS.SETTING_CHK_SWAP_BUTTON);
	option.dialogClass = 'dialog';
	option.cancelButtonTextColor = 'white';
	option.confirmButtonTextColor = 'white';
	const cancel_text = option.cancelButtonText ?? mainGame.get.text(I18N_KEYS.DIALOG_CONFIRM);
	const confirm_text = option.confirmButtonText ?? mainGame.get.text(I18N_KEYS.DIALOG_CANCLE);
	option.cancelButtonText = chk ? cancel_text : confirm_text;
	option.confirmButtonText = chk ? confirm_text : cancel_text;
	const confirm = option.onConfirm;
	const cancel = option.onCancel;
	option.onConfirm = chk ? cancel : confirm;
	option.onCancel = chk ? confirm : cancel;
	const quit = async () : Promise<void> => {
		if (confirm !== undefined)
			await confirm();
	};
	need_confirm ? await Dialog(option) : await quit();
}

export default dialog;