use std::{
	fs::{File, exists, create_dir_all},
	path::{Path, PathBuf},
	io::copy
};
use anyhow::{Error, Result};
use zip::ZipArchive;
use tauri::{AppHandle, Emitter};

pub async fn unzip(app: AppHandle, path: String, file: String, chk: bool) -> Result<(), Error> {
	let file: File = File::open(file)?;
	let mut archive: ZipArchive<File> = ZipArchive::new(file)?;

	let len: usize = archive.len();
	app.emit("unzip-started", len)?;
	for i in 0..len {
		app.emit("unzip-progress", i)?;
		if let Ok(mut file) = archive.by_index(i) {
			let file_name: String = file.name().to_string();
			let path: PathBuf = Path::new(&path).join(Path::new(&file_name));

			if file.is_dir() {
				let _ = create_dir_all(&path);
			} else if let Ok(exist) = exists(&path) {
				if !exist || chk {
					if let Some(parent) = path.parent() {
						let _ = create_dir_all(parent);
					}
					if let Ok(mut outfile) = File::create(&path) {
						let _ = copy(&mut file, &mut outfile);
					}
				}
			}
		}
	}

	Ok(())
}