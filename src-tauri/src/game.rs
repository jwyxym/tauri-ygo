mod strings;
mod system;
mod server;
mod card;
use strings::Strings;
use system::System;
use server::Server;
use card::Card;

use urlencoding::encode;
use std::fs::read_to_string;
use serde::{Serialize, Deserialize};
use tauri_plugin_os::{OsType, type_};

use anyhow::{Result, Error};

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
		Ok(())
	}
}