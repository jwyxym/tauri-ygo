use regex::Regex;
use rusqlite::{Connection, Result};
use serde::Serialize;
use std::{fs::File, io::Read};
use zip::ZipArchive;

#[derive(Serialize)]
#[serde(tag = "type", content = "content")]
enum FileContent {
    Binary(Vec<u8>),
    Text(String),
}

#[tauri::command]
fn read_zip(path: String, file_type: Vec<String>) -> Result<Vec<(String, FileContent)>, String> {
    let file: File = File::open(&path).map_err(|e| format!("无法打开文件 '{}': {}", path, e))?;
    let mut archive: ZipArchive<File> = ZipArchive::new(file)
        .map_err(|e: zip::result::ZipError| format!("无效的 ZIP 文件 '{}': {}", path, e))?;

    let mut entries: Vec<(String, FileContent)> = Vec::new();

    let pic_regex: Regex = Regex::new(r"^pics/(\d+)\.(jpg|png|jpeg)$")
        .map_err(|e: regex::Error| format!("正则表达式编译失败: {}", e))?;
    let db_regex: Regex =
        Regex::new(r"^[^/]+\.(cdb)$").map_err(|e| format!("正则表达式编译失败: {}", e))?;
    let conf_regex: Regex =
        Regex::new(r"^[^/]+\.(conf|ini)$").map_err(|e| format!("正则表达式编译失败: {}", e))?;
    for i in 0..archive.len() {
        let mut file: zip::read::ZipFile<'_> = archive
            .by_index(i)
            .map_err(|e: zip::result::ZipError| format!("无法读取 ZIP 内文件索引 {}: {}", i, e))?;
        let name: String = file.name().to_string();

        if file.is_dir() {
            continue;
        }

        match file_type.len() {
            0 => {
                if db_regex.is_match(&name) {
                    let mut content: Vec<u8> = Vec::new();
                    file.read_to_end(&mut content)
                        .map_err(|e| format!("无法读取二进制文件 '{}': {}", name, e))?;
                    entries.push((name, FileContent::Binary(content)));
                } else if conf_regex.is_match(&name) {
                    let mut content: String = String::new();
                    file.read_to_string(&mut content)
                        .map_err(|e: std::io::Error| {
                            format!("无法读取文本文件 '{}': {}", name, e)
                        })?;
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
                                .map_err(|e| format!("无法读取二进制文件 '{}': {}", name, e))?;
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
fn read_db(path: String) -> Result<Vec<(Vec<i64>, Vec<String>)>, String> {
    let conn: Connection = Connection::open(&path)
        .map_err(|e: rusqlite::Error| format!("无法读取数据库 '{}': {}", &path, e))?;

    let mut stmt: rusqlite::Statement<'_> = conn
        .prepare("SELECT * FROM datas, texts WHERE datas.id = texts.id")
        .map_err(|e: rusqlite::Error| format!("准备查询失败: {}", e))?;

    let rows_iter = stmt
        .query_map([], |row| {
            let int_values: Vec<i64> = (0..11)
                .map(|i| row.get::<_, i64>(i))
                .collect::<Result<Vec<i64>, _>>()?;

            let string_values: Vec<String> = (12..30)
                .map(|i| row.get::<_, String>(i))
                .collect::<Result<Vec<String>, _>>()?;

            Ok((int_values, string_values))
        })
        .map_err(|e| format!("查询数据库失败: {}", e))?;

    let mut result: Vec<(Vec<i64>, Vec<String>)> = Vec::new();

    for row_result in rows_iter {
        let row_data: (Vec<i64>, Vec<String>) =
            row_result.map_err(|e| format!("读取行失败: {}", e))?;
        result.push(row_data);
    }

    Ok(result)
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
        .invoke_handler(tauri::generate_handler![read_zip, read_db])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
