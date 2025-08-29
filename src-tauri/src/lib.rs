use regex::Regex;
use std::{fs::File, io::Read};
use zip::ZipArchive;
use serde::Serialize;

#[derive(Serialize)]
#[serde(tag = "type", content = "content")]
enum FileContent {
    Binary(Vec<u8>),
    Text(String),
}

#[tauri::command]
fn read_zip(path: String) -> Result<Vec<(String, FileContent)>, String> {
	let mut entries: Vec<(String, FileContent)> = Vec::new();
	match File::open(path) {
		Ok(file) => {
			match ZipArchive::new(file) {
				Ok(mut archive) => {
					for i in 0..archive.len() {
						match archive.by_index(i) {
							Ok(mut file) => {
								let name = file.name().to_string();
								let pic_regex: Regex = Regex::new(r"^pics/[^/]+\.(jpg|png|jpeg)$").unwrap();
								let db_regex: Regex = Regex::new(r"^[^/]+\.(cdb)$").unwrap();
								let regex: Regex = Regex::new(r"^[^/]+\.(conf|ini)$").unwrap();
								if !file.is_dir() {
									if pic_regex.is_match(&name) || db_regex.is_match(&name) {
										let mut content: Vec<u8> = Vec::new();
										file.read_to_end(&mut content).map_err(|e| e.to_string())?;
										entries.push((name, FileContent::Binary(content)));
									} else if regex.is_match(&name) {
										let mut content: String = String::new();
										file.read_to_string(&mut content).map_err(|e| e.to_string())?;
										entries.push((name, FileContent::Text(content)));
									}
								}

							}
							Err(_) => {}
						}
					}
				}
				Err(_) => {}
			};
		}
		Err(_) => {}
	}

	Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_process::init())
		.plugin(tauri_plugin_os::init())
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_opener::init())
		.invoke_handler(tauri::generate_handler![read_zip])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
