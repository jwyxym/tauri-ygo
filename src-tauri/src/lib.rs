mod sql;
mod file;

use regex::Regex;
use serde::Serialize;
use std::{
	fs::{
		create_dir_all,
		exists,
		File
	},
	io::{
		copy,
		Read,
		Write
	},
	path::{
		Path,
		PathBuf
	}
};
use zip::ZipArchive;
use content_disposition::parse_content_disposition;
use rand::Rng;
use ureq::{
	http::Response,
	RequestBuilder,
	typestate::WithoutBody,
	Body,
	get
};
use serde_json::{
	Value,
	from_str
};

use trust_dns_resolver::{
	Resolver,
	config::*
};

#[derive(Serialize, Clone)]
struct Srv {
	priority: u16,
	weight: u16,
	port: u16,
	target: String
}

#[derive(Serialize)]
#[serde(tag = "type", content = "content")]
enum FileContent {
	Binary(Vec<u8>),
	Text(String),
}

#[tauri::command]
async fn unzip(path: String, file: String, chk: bool) -> Result<(), String> {
	let file = File::open(file).map_err(|e| e.to_string())?;
	let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

	for i in 0..archive.len() {
		let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
		let file_name = file.name().to_string();
		let out_path = Path::new(&path).join(Path::new(&file_name));

		if file.is_dir() {
			create_dir_all(&out_path).map_err(|e| e.to_string())?;
		} else if !exists(&out_path).map_err(|e| e.to_string())? || chk {
			if let Some(parent) = out_path.parent() {
				create_dir_all(parent).map_err(|e| e.to_string())?;
			}
			let mut outfile = File::create(&out_path).map_err(|e| e.to_string())?;
			copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
		}
	}

	Ok(())
}

#[tauri::command]
async fn read_texts(dirs: Vec<String>, file_type: String) -> Result<Vec<(String, FileContent)>, String> {
	let mut entries: Vec<(String, FileContent)> = Vec::new();
	let _ = file::walk(dirs, |ext, stem, path|{
		if ext == file_type {
			match File::open(path) {
				Ok(mut file) => {
					let mut content: String = String::new();
					match file.read_to_string(&mut content) {
						Ok(_) => {
							entries.push((stem, FileContent::Text(content)));
						},
						Err(_) => ()
					}
				},
				Err(_) => ()
			};
		}
	});
	Ok(entries)
}

#[tauri::command]
async fn read_pics(dirs: Vec<String>, codes: Vec<i64>) -> Result<Vec<(i64, FileContent)>, String> {
	let mut entries: Vec<(i64, FileContent)> = Vec::new();
	for path in dirs {
		for code in &codes {
			let full_name: String = format!("{}.jpg", code);
			let file_path: PathBuf = Path::new(&path).join(full_name);
			if !exists(&file_path).map_err(|e| e.to_string())?
				|| entries.iter().any(|(x, _)| x == code) {
				continue;
			}
			match File::open(&file_path) {
				Ok(mut file) => {
					let mut content: Vec<u8> = Vec::new();
					file.read_to_end(&mut content)
						.map_err(|e| e.to_string())?;
					entries.push((*code, FileContent::Binary(content)));
				}
				Err(_) => ()
			}
		}
	}
	Ok(entries)
}

#[tauri::command]
async fn read_zip(path: String, file_type: Vec<String>) -> Result<Vec<(String, FileContent)>, String> {
	let file: File = File::open(&path).map_err(|e| e.to_string())?;
	let mut archive: ZipArchive<File> = ZipArchive::new(file)
		.map_err(|e| e.to_string())?;

	let mut entries: Vec<(String, FileContent)> = Vec::new();

	let pic_regex: Regex = Regex::new(r"^pics/(\d+)\.(jpg|png|jpeg)$")
		.map_err(|e| e.to_string())?;
	let db_regex: Regex =
		Regex::new(r"^[^/]+\.(cdb)$").map_err(|e| e.to_string())?;
	let conf_regex: Regex =
		Regex::new(r"^[^/]+\.(conf|ini)$").map_err(|e| e.to_string())?;
	for i in 0..archive.len() {
		let mut file: zip::read::ZipFile<'_> = archive
			.by_index(i)
			.map_err(|e| e.to_string())?;
		let name: String = file.name().to_string();

		if file.is_dir() {
			continue;
		}

		match file_type.len() {
			0 => {
				if db_regex.is_match(&name) {
					let mut content: Vec<u8> = Vec::new();
					file.read_to_end(&mut content)
						.map_err(|e| e.to_string())?;
					entries.push((name, FileContent::Binary(content)));
				} else if conf_regex.is_match(&name) {
					let mut content: String = String::new();
					file.read_to_string(&mut content)
						.map_err(|e| e.to_string())?;
					entries.push((name, FileContent::Text(content)));
				}
			}
			_ => {
				if let Some(caps) = pic_regex.captures(&name) {
					if let Some(file_match) = caps.get(1) {
						let file_name: String = file_match.as_str().to_string();
						if file_type.contains(&file_name)
							&& !entries.iter().any(|(x, _)| x.to_string() == file_name)
						{
							let mut content: Vec<u8> = Vec::new();
							file.read_to_end(&mut content)
								.map_err(|e| e.to_string())?;
							entries.push((name, FileContent::Binary(content)));
						}
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

#[tauri::command]
async fn read_dbs(dirs: Vec<String>) -> Result<Vec<Vec<(Vec<i64>, Vec<String>)>>, String> {
	let mut entries: Vec<Vec<(Vec<i64>, Vec<String>)>> = Vec::new();
	let _ = file::walk(dirs, |ext, _stem, path|{
		if ext == String::from("cdb") {
			match sql::read(path) {
				Ok(db) => {
					entries.push(db);
				},
				Err(_) => ()
			}
		}
	});
	Ok(entries)
}

#[tauri::command]
async fn read_db(path: String) -> Result<Vec<(Vec<i64>, Vec<String>)>, String> {
	Ok(sql::read(path)?)
}

#[tauri::command]
fn get_srv(url: String) -> Result<Srv, String> {
	let mut result: Vec<Srv> = Vec::new();
	let resolver: Resolver = Resolver::new(ResolverConfig::default(), ResolverOpts::default()).map_err(|e| e.to_string())?;

	match resolver.srv_lookup(&url) {
		Ok(response) => {
			for ip in response.iter() {
				result.push(Srv{
					priority: ip.priority(),
					weight: ip.weight(),
					port: ip.port(),
					target: ip.target().to_string()
				});
			}
			result.sort_by_key(|srv| srv.priority);
			if let Some(srv) = result.get(0) {
				return Ok(srv.clone());
			}
		}
		Err(_) => {
			return Ok(Srv{
				priority: 0,
				weight: 0,
				port: 7911,
				target: url
			});
		}
	}
	Err("No Data".to_string())
}

#[tauri::command]
async fn version(url: String, headers: Vec<(String, String)>) -> Result<String, String> {
	let mut req: RequestBuilder<WithoutBody> = get(&url);
	for (key, value) in headers {
        req = req.header(key, value);
    }
	let response: Response<Body> = req.call().map_err(|e| e.to_string())?;
	if response.status().is_success() {
		let mut body = response.into_body();
		let mut reader = body.as_reader();
		let mut content: String = "".to_string();
		reader.read_to_string(&mut content).map_err(|e| e.to_string())?;
		let json_data: Value = from_str(&content).map_err(|e| e.to_string())?;
		if let Some(contents) = json_data.get("content") {
			if let Value::Array(arr) = contents {
				if let Some(content) = arr.get(0) {
					if let Some(created_at) = content.get("created_at") {
						if let Value::String(created_time) = created_at {
							return Ok(created_time.to_string());
						}
					}
				}
			}
		}
	} else {
		return Err(format!("{}", response.status()));
	}
	Err("No Data".to_string())
}

#[tauri::command]
async fn download(url: String, path: String, name: String, ex_name: String) -> Result<String, String> {
	let response: Response<Body> = get(&url).call().map_err(|e| e.to_string())?;
	let mut file_name: String = name;
	if response.status().is_success() {
		if file_name.len() == 0 {
			if let Some(content_disp) = response.headers().get("Content-Disposition") {
				if let Ok(cd_str) = content_disp.to_str() {
					if let Some(f) = parse_content_disposition(cd_str).filename() {
						if let Some(typ) = f.1 {
							file_name = format!("{}.{}", f.0, typ).to_string();
						}
					}
				}
			}
		}
		if file_name.len() == 0 {
			let mut rng = rand::rng();
			let random_number = rng.random_range(10_000_000..=100_000_000);
			file_name = random_number.to_string();
		}
		if ex_name.len() == 0 && !file_name.ends_with(&ex_name) {
			file_name += &ex_name;
		}
		let file_path: PathBuf = Path::new(&path).join(&file_name);
		let mut body = response.into_body();
		let mut reader = body.as_reader();
		let mut bytes = Vec::new();
		reader.read_to_end(&mut bytes).map_err(|e| e.to_string())?;
		let mut file: File = File::create(&file_path).map_err(|e| e.to_string())?;
		file.write_all(&bytes).map_err(|e| e.to_string())?;
		Ok(file_name)
	} else {
		Err(format!("{}", response.status()))
	}
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_tcp::init())
		.plugin(tauri_plugin_clipboard_manager::init())
		.plugin(tauri_plugin_process::init())
		.plugin(tauri_plugin_os::init())
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_opener::init())
		.invoke_handler(tauri::generate_handler![
			unzip,
			read_zip,
			read_texts,
			read_pics,
			read_db,
			read_dbs,
			get_srv,
			version,
			download])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
