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
	pics: BTreeMap<i64, String>,
	db: Vec<Vec<u8>>,
	ini: Vec<String>,
	lflist: Vec<String>,
	strings: Vec<String>
}

impl Zip {
	pub fn new () -> Self {
		Self {
			pics: BTreeMap::new(),
			db: Vec::new(),
			ini: Vec::new(),
			lflist: Vec::new(),
			strings: Vec::new()
		}
	}
	pub fn open (path: String, read_pic: Option<Vec<i64>>) -> JoinHandle<Result<Self, Error>> {
		spawn_blocking(move || {
			let mut pics: BTreeMap<i64, String> = BTreeMap::new();
			let mut db: Vec<Vec<u8>>= Vec::new();
			let mut ini: Vec<String>= Vec::new();
			let mut lflist: Vec<String>= Vec::new();
			let mut strings: Vec<String>= Vec::new();

			let db_regex: Regex = Regex::new(r"^[^/]+\.(cdb)$")?;
			let conf_regex: Regex = Regex::new(r"^[^/]+\.(conf|ini)$")?;
			let _ = Self::read(path, |name, mut zip| {
				if let Some(read_pic) = &read_pic {
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
				} else {

				}
				
				Ok(())
			});
			Ok::<Self, Error>(Self {
				pics: pics,
				db: db,
				ini: ini,
				lflist: lflist,
				strings: strings
			})
		})
	}
	pub fn read (
		path: String,
		mut callback: impl FnMut(String, ZipFile) -> Result<(), Error>
	) -> Result<(), Error> {
		let file: File = File::open(&path)?;
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
}