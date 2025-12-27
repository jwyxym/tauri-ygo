use rusqlite::{Connection, Result, Error, Statement};

pub fn read(path: String) -> Result<Vec<(Vec<i64>, Vec<String>)>, Error> {
	let conn: Connection = Connection::open(&path)?;

	let mut stmt: Statement<'_> = conn.prepare("SELECT * FROM datas, texts WHERE datas.id = texts.id")?;

	let iter = stmt
		.query_map([], |row| {
			let int: Vec<i64> = (0..12)
				.map(|i| row.get::<_, i64>(i))
				.collect::<Result<Vec<i64>, _>>()?;

			let string: Vec<String> = (12..30)
				.map(|i| row.get::<_, String>(i))
				.collect::<Result<Vec<String>, _>>()?;

			Ok((int, string))
		})?;

	let mut result: Vec<(Vec<i64>, Vec<String>)> = Vec::new();

	for i in iter {
		if let Ok(data) = i {
			result.push(data);
		}
	}

	Ok(result)
}
