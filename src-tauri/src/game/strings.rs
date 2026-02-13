use serde::Serialize;
use std::collections::BTreeMap;
use regex::Regex;

#[derive(Serialize, Clone, Debug)]
pub struct Strings {
	system: BTreeMap<i64, String>,
	victory: BTreeMap<i64, String>,
	counter: BTreeMap<i64, String>
}

impl Strings {
	pub fn new () -> Self {
		let system: BTreeMap<i64, String> = BTreeMap::new();
		let victory: BTreeMap<i64, String> = BTreeMap::new();
		let counter: BTreeMap<i64, String> = BTreeMap::new();

		Self {
			system: system,
			victory: victory,
			counter: counter
		}
	}
	pub fn init (&mut self, text: String) -> () {

	}
}