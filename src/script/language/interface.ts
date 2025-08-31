interface textLike {
	menu : Array<string>;
	deck : {
		new : string;
		fromurl : string;
		fromcode : string;
		name : string;
		name_rule : {
			exist : string;
			unlawful : string;
		}
	};
	toast : {
		copy : string;
		delete : string;
	};
}

export default textLike;