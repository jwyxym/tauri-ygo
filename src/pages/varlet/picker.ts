import { Picker as p } from '@varlet/ui';
const Picker = async (
	columns : Array<Array<{ text : number | string; }>>,
	title : string,
	no_cancle : boolean = false
) : Promise<Array<number> | undefined> => {
	let result: Array<number> | undefined;
	while (true) {
		await p({ 
			columns : columns,
			title : title,
			onConfirm : (_, i) => {
				result = i;
			},
			onCancel : () => {
				result = undefined;
			},
		});
		if (!no_cancle || result !== undefined)
			return result;
	}
};

export default Picker;