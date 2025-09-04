interface textLike {
	menu : Array<string>;
	deck : {
		new : string;
		from_url : string;
		from_code : string;
		name : string;
		info : string;
		exit : string;
		remove : string;
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
			forbidden : string;
			lflist : string;
		};
		lflist : {
			forbidden : string;
			limit : string;
			semi_limit : string;
			unlimit : string;
		}
		delete : {
			title : string;
			message : string;
		};
		rule : {
			name : {
				exist : string;
				unlawful : string;
				length : string;
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
		deck_list : {
			copy : string;
			delete : string;
		}
		error : {
			search : string;
			ydk : {
				from_url : string;
				from_code : string;
			}
		}
		deck : {
			save : string;
		}
	};
}

export default textLike;