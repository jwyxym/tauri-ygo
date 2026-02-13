use rusqlite::{Connection, Result, Error, Statement};
use std::{collections::BTreeMap};

pub struct Card {
	content: BTreeMap<i64, (Vec<i64>, Vec<String>)>
}

impl Card  {
	pub fn new () -> Self {
		Self {
			content: BTreeMap::new()
		}
	}
	pub fn init (&mut self, path: String) -> Result<(), Error> {
		let conn: Connection = Connection::open(path)?;
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

		iter.into_iter().for_each(|i| {
			if let Ok(i) = i {
				self.content.insert(i.0[0], i);
			}
		});
		
		Ok(())
	}

	pub fn to_array (&self) -> Vec<(Vec<i64>, Vec<String>)> {
		self.content.values().cloned().collect()
	}
}