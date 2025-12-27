use serde::Serialize;

#[derive(Serialize)]
#[serde(tag = "type", content = "content")]
pub enum FileContent {
	Binary(Vec<u8>),
	Text(String),
}

#[derive(Serialize, Clone)]
pub struct Pic {
	code: i64,
	path: String,
}

impl Pic {
	pub fn new (code: i64, path: &str) -> Pic  {
		Pic {
			code: code,
			path: String::from(path)
		}
	}
}