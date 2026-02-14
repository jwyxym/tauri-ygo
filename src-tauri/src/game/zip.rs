use serde::Serialize;
use regex::Regex;
use anyhow::{Result, Error};
use zip::{ZipArchive, read::ZipFile};
use tokio::task::{JoinHandle, spawn_blocking};
use base64::{engine::general_purpose, Engine as _};
use std::{
	fs::File,
	io::Read,
	collections::BTreeMap
};

#[derive(Serialize, Clone, Debug)]
pub struct Zip {
	path: String,
	pics: BTreeMap<i64, String>,
	db: Vec<Vec<u8>>,
	ini: Vec<String>,
	lflist: Vec<String>,
	strings: Vec<String>
}

impl Zip {
	pub fn new (path: String, read_pic: Option<Vec<i64>>) -> JoinHandle<Result<Self, Error>> {
		spawn_blocking(move || {
			let mut pics: BTreeMap<i64, String> = BTreeMap::new();
			let mut db: Vec<Vec<u8>>= Vec::new();
			let mut ini: Vec<String>= Vec::new();
			let mut lflist: Vec<String>= Vec::new();
			let mut strings: Vec<String>= Vec::new();

			if let Some(read_pic) = &read_pic {
				let _ = Self::read(&path, |name, mut zip| {
					if let Some(_match) = Regex::new(r"^pics/(\d+)\.(jpg|png|jpeg)$")?
						.captures(&name)
						.and_then(|i| Some(i)?
						.get(1))
					{
						let mut content: Vec<u8> = Vec::new();
						if let Ok(code) = _match.as_str().parse::<i64>()
							&& read_pic.contains(&code)
							&& !pics.contains_key(&code)
							&& zip.read_to_end(&mut content).is_ok() {
							pics.insert(code, format!(
								"data:image/{};base64,{}",
								if content.starts_with(&[0xFF, 0xD8, 0xFF]) { "jpeg" } else { "png" },
								general_purpose::STANDARD.encode(&content)
							));
						}
					}
				
					Ok(())
				});
			} else {
				let _ = Self::read(&path, |name, mut zip| {
					if name.ends_with("ini") {
						let mut content: String = String::new();
						if zip.read_to_string(&mut content).is_ok() {
							ini.push(content);
						}
					} else if name.ends_with("strings.conf") {
						let mut content: String = String::new();
						if zip.read_to_string(&mut content).is_ok() {
							strings.push(content);
						}
					} else if name.ends_with("lflist.conf") {
						let mut content: String = String::new();
						if zip.read_to_string(&mut content).is_ok() {
							lflist.push(content);
						}
					} else if name.ends_with("cdb") {
						let mut content: Vec<u8> = Vec::new();
						if zip.read_to_end(&mut content).is_ok() {
							db.push(content);
						}
					}
				
					Ok(())
				});
			}
			Ok::<Self, Error>(Self {
				path: path,
				pics: pics,
				db: db,
				ini: ini,
				lflist: lflist,
				strings: strings
			})
		})
	}
	pub fn read (
		path: &str,
		mut callback: impl FnMut(String, ZipFile) -> Result<(), Error>
	) -> Result<(), Error> {
		let file: File = File::open(path)?;
		let mut archive: ZipArchive<File> = ZipArchive::new(file)?;
		for i in 0..archive.len() {
			let file: ZipFile<'_> = archive.by_index(i)?;
			if !file.is_dir() {
				let name: String = String::from(file.name());
				let _ = callback(name, file);
			}
		}
		Ok(())
	}
	pub fn path (&self) -> &str {
		&self.path
	}
}