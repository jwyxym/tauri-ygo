use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct Srv {
	priority: u16,
	weight: u16,
	port: u16,
	target: String,
}

impl Srv {
	pub fn new (priority: u16, weight: u16, port: u16, url: String) -> Srv  {
		Srv {
			priority: priority,
			weight: weight,
			port: port,
			target: url
		}
	}

	pub fn priority (&self) -> u16 {
		self.priority
	}
}

#[derive(Serialize, Clone)]
pub struct Resp {
	url: String,
	state: u16,
	time: u128,
}

impl Resp {
	pub fn new (url: String, state: u16, time: u128) -> Resp  {
		Resp {
			url: url,
			state: state,
			time: time,
		}
	}

	pub fn time (&self) -> u128 {
		self.time
	}
}