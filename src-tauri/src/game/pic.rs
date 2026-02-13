use std::collections::BTreeMap;
pub struct Pic {
	content: BTreeMap<i64, String>
}
impl Pic {
	pub fn new () -> Self {
		Self {
			content: BTreeMap::new()
		}
	}

	pub fn to_array (&self) -> Vec<(i64, String)> {
		self.content.clone().into_iter().collect()
	}
}