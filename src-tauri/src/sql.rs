use rusqlite::{Connection, Result};

pub fn read(path: String) -> Result<Vec<(Vec<i64>, Vec<String>)>, String> {
	let conn: Connection = Connection::open(&path).map_err(|e| e.to_string())?;

	let mut stmt: rusqlite::Statement<'_> = conn
		.prepare("SELECT * FROM datas, texts WHERE datas.id = texts.id")
		.map_err(|e| e.to_string())?;

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
		.map_err(|e| e.to_string())?;

	let mut result: Vec<(Vec<i64>, Vec<String>)> = Vec::new();

	for row_result in rows_iter {
		let row_data: (Vec<i64>, Vec<String>) = row_result.map_err(|e| e.to_string())?;
		result.push(row_data);
	}

	Ok(result)
}
