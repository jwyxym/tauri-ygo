use std::fs::create_dir_all;
use walkdir::WalkDir;
pub fn walk(
	dirs: Vec<String>,
	mut callback: impl FnMut(String, String, String) -> ()
) -> Result<(), String> {
	for dir in dirs {
		create_dir_all(&dir).map_err(|e| e.to_string())?;
		for entry in WalkDir::new(dir) {
			match entry {
				Ok(e) => {
					let path = e.path();
					if path.is_file() {
						if let Some(stem) = path.file_stem().and_then(|n| n.to_str()) {
							if let Some(ext) = path.extension().and_then(|n| n.to_str()) {
								if let Some(path) = path.as_os_str().to_str() {
									callback(ext.to_string(), stem.to_string(), path.to_string());
								}
							}
						}
					}
				}
				Err(e) => {
					return Err(e.to_string());
				}
			}
		}
	}
	Ok(())
}
