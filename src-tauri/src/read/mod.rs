mod types;
mod file;
mod sql;
pub use types::{FileContent, Pic};

use std::{
	fs::{File, exists, metadata, Metadata},
	io::{Read},
	path::{Path, PathBuf},
	time::{SystemTime, UNIX_EPOCH, Duration}
};
use anyhow::{Error, Result};
use chrono::{DateTime, Utc};
use regex::Regex;
use zip::ZipArchive;

pub async fn texts(
	dirs: Vec<String>,
	file_type: Vec<String>
) -> Result<Vec<(String, FileContent)>, Error> {
	let mut entries: Vec<(String, FileContent)> = Vec::new();
	file::walk(dirs, |ext, stem, path| {
		if file_type.contains(&String::from(ext)) {
			if let Ok(mut file) = File::open(path) {
				let mut content: String = String::new();
				if let Ok(_) = file.read_to_string(&mut content) {
					entries.push((String::from(stem), FileContent::Text(content)));
				}
			};
		}
	});
	Ok(entries)
}

pub async fn files(
	dirs: Vec<String>,
	file_type: Vec<String>
) -> Result<Vec<(String, FileContent)>, Error> {
	let mut entries: Vec<(String, FileContent)> = Vec::new();
	file::walk(dirs, |ext, stem, path| {
		if file_type.contains(&String::from(ext)) {
			if let Ok(mut file) = File::open(path) {
				let mut content: Vec<u8> = Vec::new();
				if let Ok(_) = file.read_to_end(&mut content) {
					entries.push((String::from(stem), FileContent::Binary(content)));
				}
			};
		}
	});
	Ok(entries)
}

#[tauri::command]
pub async fn pics(dirs: Vec<String>, codes: Vec<i64>) -> Result<(Vec<Pic>, Vec<i64>), Error> {
	let mut entries: Vec<Pic> = Vec::new();
	let mut unknows: Vec<i64> = Vec::new();
	for code in &codes {
		let mut path_chk = false;
		for path in &dirs {
			let full_name: String = format!("{}.jpg", code);
			let file_path: PathBuf = Path::new(&path).join(full_name);
			if exists(&file_path).is_ok() {
				if let Some(p) = file_path.to_str() {
					entries.push(Pic::new(*code, p));
					path_chk = true;
					break;
				}
			}
		}
		if !path_chk {
			unknows.push(*code);
		}
	}
	Ok((entries, unknows))
}

pub async fn zip(
	path: String,
	file_type: Vec<String>
) -> Result<Vec<(String, FileContent)>, Error> {
	let file: File = File::open(&path)?;
	let mut archive: ZipArchive<File> = ZipArchive::new(file)?;

	let mut entries: Vec<(String, FileContent)> = Vec::new();

	let pic_regex: Regex =
		Regex::new(r"^pics/(\d+)\.(jpg|png|jpeg)$")?;
	let db_regex: Regex = Regex::new(r"^[^/]+\.(cdb)$")?;
	let conf_regex: Regex = Regex::new(r"^[^/]+\.(conf|ini)$")?;
	for i in 0..archive.len() {
		let mut file: zip::read::ZipFile<'_> = archive.by_index(i)?;
		let name: String = String::from(file.name());

		if file.is_dir() {
			continue;
		}

		if file_type.len() == 0 {
			if db_regex.is_match(&name) {
				let mut content: Vec<u8> = Vec::new();
				if file.read_to_end(&mut content).is_ok() {
					entries.push((name, FileContent::Binary(content)));
				}
			} else if conf_regex.is_match(&name) {
				let mut content: String = String::new();
				if file.read_to_string(&mut content).is_ok() {
					entries.push((name, FileContent::Text(content)));
				}
			}
		} else if let Some(caps) = pic_regex.captures(&name) {
			if let Some(file_match) = caps.get(1) {
				let file_name: String = String::from(file_match.as_str());
				if file_type.contains(&file_name)
					&& !entries.iter().any(|(x, _)| *x == file_name)
				{
					let mut content: Vec<u8> = Vec::new();
					if file.read_to_end(&mut content).is_ok() {
						entries.push((name, FileContent::Binary(content)));
					}
				}
			}
		}

		if file_type.len() == entries.len() {
			break;
		}
	}
	Ok(entries)
}

pub async fn databases(dirs: Vec<String>) -> Result<Vec<Vec<(Vec<i64>, Vec<String>)>>, Error> {
	let mut entries: Vec<Vec<(Vec<i64>, Vec<String>)>> = Vec::new();
	file::walk(dirs, |ext, _stem, path| {
		if ext == String::from("cdb") {
			if let Ok(db) = sql::read(path) {
				entries.push(db);
			}
		}
	});
	Ok(entries)
}

pub async fn database(path: String) -> Result<Vec<(Vec<i64>, Vec<String>)>, Error> {
	Ok(sql::read(path)?)
}

pub async fn time(time : String) -> Result<String, Error> {
	let metadata: Metadata = metadata(time)?;
	let time: SystemTime = metadata.modified()?;
	let duration: Duration = time.duration_since(UNIX_EPOCH)?;
	let time: DateTime<Utc> = DateTime::<Utc>::from(UNIX_EPOCH + duration);
	Ok(time.to_string())
}