mod strings;
mod system;
mod server;
mod card;
mod pic;
mod zip;
use strings::Strings;
use system::System;
use server::Server;
use card::Card;
use pic::Pic;
use zip::Zip;

use tauri_plugin_os::{OsType, type_};
use urlencoding::encode;
use std::fs::read_to_string;
use serde::{Serialize, Deserialize};
use anyhow::{Result, Error};
use walkdir::WalkDir;

#[derive(Serialize, Clone, Debug)]
pub struct Game {
	strings: Vec<(String, Strings)>,
	cards: Vec<(String, (Vec<i64>, Vec<String>))>,
	pics: Vec<(i64, String)>,
	system: (Vec<(String, String)>, Vec<(String, f64)>, Vec<(String, Vec<String>)>),
	textures: Vec<(String, String)>,
	sound: Vec<(String, String)>,
	font: Vec<(String, String)>,
}

impl Game  {
	fn file_url (path : String) -> String {
		let path: String = encode(&path).into_owned();
		match type_() {
			OsType::Windows | OsType::Android => format!("http://asset.localhost/{}", path),
			_ => format!("asset://localhost/{}", path),
		}
	}

	pub async fn init () -> Result<(), Error> {
		let start = std::time::Instant::now();
		let mut tasks = Vec::new();
		for entry in WalkDir::new(r"E:\github\Rust\tauri-ygo\src-tauri\target\debug\expansions") {
			if let Ok(e) = entry {
				let path = e.path();
				if path.is_file() {
					if let Some(stem) = path.file_stem().and_then(|n| n.to_str()) {
						if let Some(ext) = path.extension().and_then(|n| n.to_str()) {
							if let Some(path) = path.as_os_str().to_str() {
								println!("{} {} {}", ext.to_string(), stem.to_string(), path.to_string());
								tasks.push(Zip::open(path.to_string(), None));
							}
						}
					}
				}
			}
		}
		for task in tasks {
			let zip = task.await??;
			// println!("{:?}", zip);
		}
		let duration = start.elapsed();
		println!("耗时: {:?}", duration);
		// let mut strings: Strings = Strings::new();
		// //这里得写一个绝对路径用于调试
		// let text: String = read_to_string("E://strings.conf")?;
		// strings.init(text);
		// println!("{:?}", strings);
		Ok(())
	}
}