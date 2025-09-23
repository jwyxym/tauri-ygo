interface TEXT_Like {
	unknow : string;
	menu : Array<string>;
	start : {
		title : string;
		message : string;
	};
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
	};
	server : {
		address : string;
		name : string;
		password : string;
		no_check_deck : string;
		no_shuffle_deck : string;
		watcher : string;
		deck : string;
		rule : Array<string>;
		mode : Array<string>;
		home : {
			lflist : string;
			rule : string;
			mode : string;
			start_lp : string;
			start_hand : string;
			draw_count : string;
			time_limit : string;
			watch : string;
		}
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
	setting : {
		setting_items : Map<string, string>,
		delete : string;
		ex_cards : string;
		system_setting : string;
		reload : string;
		resert : string;
		download : {
			url : string;
			super_pre : string;
			ex : string;
			name : string;
		};
	};
	toast : {
		save : string;
		delete : string;
		copy : string;
		error : {
			ydk : {
				from_url : string;
				from_code : string;
			};
			setting : {
				download : string;
			};
		};
		download : {
			start : string;
			complete : string;
		};
	};
}

export default TEXT_Like;