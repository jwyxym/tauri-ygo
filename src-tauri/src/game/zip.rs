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
			db: vec![],
			ini: vec![],
			lflist: vec![],
			strings: vec![]
		}
	}
	pub fn open (path: String) -> JoinHandle<Result<Self, Error>> {
		spawn_blocking(move || {
			let mut pics: BTreeMap<i64, String> = BTreeMap::new();
			let mut db: Vec<Vec<u8>>= vec![];
			let mut ini: Vec<String>= vec![];
			let mut lflist: Vec<String>= vec![];
			let mut strings: Vec<String>= vec![];

			let db_regex: Regex = Regex::new(r"^[^/]+\.(cdb)$")?;
			let conf_regex: Regex = Regex::new(r"^[^/]+\.(conf|ini)$")?;
			let _ = Self::read(path, |name, mut zip| {
				if let Some(_match) = Regex::new(r"^pics/(\d+)\.(jpg|png|jpeg)$")?
					.captures(&name)
					.and_then(|i| Some(i)?
					.get(1))
				{
						let mut content: Vec<u8> = Vec::new();
						if let Ok(code) = _match.as_str().parse::<i64>()
							&& zip.read_to_end(&mut content).is_ok() {
							let content = general_purpose::STANDARD.encode(&content);
							pics.insert(code, content);
						}
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