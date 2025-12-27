use std::fs::create_dir_all;
use walkdir::WalkDir;

pub fn walk(
	dirs: Vec<String>,
	mut callback: impl FnMut(String, String, String) -> ()
) -> () {
	for dir in dirs {
		let _ = create_dir_all(&dir);
		for entry in WalkDir::new(dir) {
			if let Ok(e) = entry {
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
		}
	}
}
