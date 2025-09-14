interface textLike {
	menu : Array<string>;
	dialog : {
		confirm : string;
		cancel : string;
	};
	deck : {
		main : string;
		extra : string;
		side : string;
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
			search : string;
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
			deck : {
				deck_count : string;
				card_count : string;
			};
		};
	};
	setting : {
		setting_items : Map<string, string>,
		ex_cards : string;
		system_setting : string;
		reload : string;
		download : {
			url : string;
			super_pre : string;
			ex : string;
		};
	};
	toast : {
		deck_list : {
			copy : string;
			delete : string;
		};
		error : {
			ydk : {
				from_url : string;
				from_code : string;
			};
			setting : {
				download : string;
			};
		};
		deck : {
			save : string;
		};
		download : {
			start : string;
			complete : string;
		};
	};
}

export default textLike;