use serde::Serialize;
use std::collections::BTreeMap;
use regex::Regex;

#[derive(Serialize, Clone, Debug)]
pub struct Server {
	address: String,
	name: String
}

impl Server {
	pub fn new (text: String) -> Vec<Server> {
		let mut content: Vec<Server> = vec![];

		content
	}
}