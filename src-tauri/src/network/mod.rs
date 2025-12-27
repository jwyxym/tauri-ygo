mod types;
pub use types::{Srv, Resp};

use ureq::{
	get,
	http::{Response},
	typestate::WithoutBody,
	Body,
	BodyReader,
	RequestBuilder
};
use std::{
	path::{Path, PathBuf},
	io::{Read, Write},
	sync::{mpsc::channel},
	time::{Instant, Duration},
	fs::File,
	thread
};
use rand::{Rng, prelude::ThreadRng};
use anyhow::{Error, Result, anyhow};
use trust_dns_resolver::{config::*, Resolver};
use tauri::{AppHandle, Emitter};
use serde_json::{from_str, Value};
use content_disposition::parse_content_disposition;


pub async fn srv(url: String) -> Result<Srv, Error> {
	let mut result: Vec<Srv> = Vec::new();
	let resolver: Resolver = Resolver::new(ResolverConfig::default(), ResolverOpts::default())?;

	match resolver.srv_lookup(&url) {
		Ok(response) => {
			for ip in response.iter() {
				result.push(Srv::new(
					ip.priority(),
					ip.weight(),
					ip.port(),
					ip.target().to_string()
				));
			}
			result.sort_by_key(|srv| srv.priority());
			if let Some(srv) = result.get(0) {
				Ok(srv.clone())
			} else {
				Err(anyhow!(""))
			}
		}
		Err(_) => {
			Ok(Srv::new(0, 0, 7911, url))
		}
	}
}

pub async fn version(url: String, headers: Vec<(String, String)>) -> Result<String, Error> {
	let mut req: RequestBuilder<WithoutBody> = get(&url);
	for (key, value) in headers {
		req = req.header(key, value);
	}
	let response: Response<Body> = req.call()?;
	if response.status().is_success() {
		let mut body: Body = response.into_body();
		let mut reader: BodyReader<'_> = body.as_reader();
		let mut content: String = String::from("");
		reader.read_to_string(&mut content)?;
		let json_data: Value = from_str(&content)?;
		if let Some(contents) = json_data.get("content") {
			if let Value::Array(arr) = contents {
				if let Some(content) = arr.get(0) {
					if let Some(created_at) = content.get("created_at") {
						if let Value::String(created_time) = created_at {
							return  Ok(String::from(created_time));
						}
					}
				}
			}
		}
		Err(anyhow!(""))
	} else {
		Err(anyhow!("{}", response.status()))
	}
}

pub async fn time(urls: Vec<String>) -> Result<Vec<Resp>, Error> {
	let mut entries: Vec<Resp> = Vec::new();
	for url in urls {
		let (tx, rx) = channel::<Resp>();
		thread::spawn(move || {
			let start: Instant = Instant::now();
			if let Ok(response) = get(&url).call() {
				if response.status().is_success() {
					let _ = tx.send(Resp::new(
						url.clone(),
						response.status().as_u16(),
						start.elapsed().as_millis()
					));
				}
			}
		});
		if let Ok(rep) = rx.recv_timeout(Duration::from_secs(3)) {
			entries.push(rep);
		}
	}

	entries.sort_by_key(|i| i.time());
	Ok(entries)
}

pub async fn download(
	app: AppHandle,
	url: String,
	path: String,
	mut name: String,
	ex_name: String,
) -> Result<String, Error> {
	let response: Response<Body> = get(&url).call()?;
	if response.status().is_success() {
		if name.len() == 0 {
			if let Some(content_disp) = response.headers().get("Content-Disposition") {
				if let Ok(cd_str) = content_disp.to_str() {
					if let Some(f) = parse_content_disposition(cd_str).filename() {
						if let Some(typ) = f.1 {
							name = format!("{}.{}", f.0, typ).to_string();
						}
					}
				}
			}
		}
		if let Some(content_length) = response.headers().get("content-length") {
       		if let Ok(size) = content_length.to_str() {
				app.emit("download-started", size)?;
			}
		} else {
			app.emit("download-started", "0")?;
		}
		if name.len() == 0 {
			let mut rng: ThreadRng = rand::rng();
			let random_number: i32 = rng.random_range(10_000_000..=100_000_000);
			name = random_number.to_string();
		}
		if ex_name.len() != 0 && !name.ends_with(&ex_name) {
			name += &ex_name;
		}
		let path: PathBuf = Path::new(&path).join(&name);
		let mut body: Body = response.into_body();
		let mut reader: ureq::BodyReader<'_> = body.as_reader();

		let mut file: File = File::create(&path)?;
		let mut buffer: Vec<u8> = vec![0u8; 8192];
		loop {
			let bytes: usize = reader.read(&mut buffer)?;
			if bytes == 0 {
				break;
			}
			app.emit("download-progress", 8192)?;
			file.write_all(&buffer[..bytes])?;
		}
		Ok(name)
	} else {
		Err(anyhow!("{}", response.status()))
	}
}