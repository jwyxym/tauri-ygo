interface textLike {
	menu : Array<string>;
	deck : {
		new : string;
		fromurl : string;
		fromcode : string;
		name : string;
		info : string;
		search : {
			name : string;
			link : string;
			type : string;
			category : string;
			race : string;
			ot : string;
			attribute : string;
			atk : string;
			def : string;
			level : string;
			scale : string;
		};
		delete : {
			title : string;
			message : string;
		};
		rule : {
			name : {
				exist : string;
				unlawful : string;
			};
			atk : {
				unlawful : string;
			};
			level : {
				unlawful : string;
			};
		};
	};
	toast : {
		copy : string;
		delete : string;
		error : {
			search : string;
		}
	};
}

export default textLike;