use regex::Regex;
use std::{fs::File, io::Read};
use zip::ZipArchive;

#[tauri::command]
fn read_zip_in_tauri(path: String) -> Result<Vec<(String, Vec<u8>)>, String> {
    let mut entries: Vec<(String, Vec<u8>)> = Vec::new();
    match File::open(path) {
        Ok(file) => {
            match ZipArchive::new(file) {
                Ok(mut archive) => {
                    for i in 0..archive.len() {
                        match archive.by_index(i) {
                            Ok(mut file) => {
                                let name = file.name().to_string();

                                let pic_regex =
                                    Regex::new(r"^pics/[^/]+\.(jpg|png|jpeg)$").unwrap();
                                let regex = Regex::new(r"^[^/]+\.(conf|ini|cdb)$").unwrap();
                                if file.is_dir()
                                    || (!pic_regex.is_match(&name) && !regex.is_match(&name))
                                {
                                    continue;
                                }

                                let mut content: Vec<u8> = Vec::new();
                                file.read_to_end(&mut content).map_err(|e| e.to_string())?;

                                entries.push((name, content));
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
        .invoke_handler(tauri::generate_handler![read_zip_in_tauri])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
