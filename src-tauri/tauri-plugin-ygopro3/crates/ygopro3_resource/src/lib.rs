use ygopro3_fs::File;

use serde::{Deserialize, Serialize};
use basic_toml::{from_str, to_string};
use std::{path::{Path, PathBuf}, collections::HashSet};
use indexmap::{IndexMap, map::Entry};
use anyhow::{Error, Result};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Resource {
	ot: IndexMap<String, String>,
	attribute: IndexMap<String, String>,
	category: IndexMap<String, String>,
	race: IndexMap<String, String>,
	types: IndexMap<String, String>,
	info: IndexMap<String, String>,
	counter: IndexMap<String, String>,
	other: IndexMap<String, String>,
	sound: IndexMap<String, String>,
	avatar: IndexMap<String, Vec<String>>,
	link: IndexMap<String, (String, String)>,
	btn: IndexMap<String, (String, String)>,
	recognizer: IndexMap<String, String>
}

pub type Textures = (
	Vec<(u32, String)>,
	Vec<(u32, String)>,
	Vec<(u32, String)>,
	Vec<(u32, String)>,
	Vec<(u32, String)>,
	Vec<(u32, String)>,
	Vec<(u32, (String, String))>,
	Vec<(String, String)>,
	Vec<(String, String)>,
	Vec<(String, (String, String))>,
	Vec<String>
);

impl Resource {
	pub fn new (text: String) -> Self {
		from_str::<Self>(&text).unwrap_or(Self::default())
	}
	pub fn default () -> Self {
		Self {
			ot: IndexMap::new(),
			attribute: IndexMap::new(),
			link: IndexMap::new(),
			category: IndexMap::new(),
			race: IndexMap::new(),
			types: IndexMap::new(),
			sound: IndexMap::new(),
			btn: IndexMap::new(),
			info: IndexMap::new(),
			counter: IndexMap::new(),
			avatar: IndexMap::new(),
			other: IndexMap::new(),
			recognizer: IndexMap::new(),
		}
	}
	pub fn merge (&mut self, text: &str) -> bool {
		let resource: Self = Self::new(String::from(text));
		let mut result: bool = false;
		fn merge (target: &mut IndexMap<String, String>, source: IndexMap<String, String>) -> bool {
			let mut result: bool = false;
			for (key, value) in source {
				match target.entry(key) {
					Entry::Occupied(_) => (),
					Entry::Vacant(entry) => {
						entry.insert(value);
						result = true;
					}
				};
			}
			result
		}
		fn merge_string_vec (target: &mut IndexMap<String, Vec<String>>, source: IndexMap<String, Vec<String>>) -> bool {
			let mut result: bool = false;
			for (key, value) in source {
				match target.entry(key) {
					Entry::Occupied(mut entry) => {
						let vec: &Vec<String> = entry.get();
						let a: HashSet<String> = vec
							.into_iter()
							.map(|i: &String| i.clone())
							.collect();
						let b: HashSet<String> = value
							.into_iter()
							.collect();

						let value: Vec<String> = a
							.union(&b)
							.map(|i: &String| i.clone())
							.collect();
						if value.len() != vec.len() {
							*entry.get_mut() = value;
							result = true;
						}
					},
					Entry::Vacant(entry) => {
						entry.insert(value);
						result = true;
					}
				};
			}
			result
		}
		fn merge_string_tuple (target: &mut IndexMap<String, (String, String)>, source: IndexMap<String, (String, String)>) -> bool {
			let mut result: bool = false;
			for (key, value) in source {
				match target.entry(key) {
					Entry::Occupied(_) => (),
					Entry::Vacant(entry) => {
						entry.insert(value);
						result = true;
					}
				};
			}
			result
		}

		result |= merge(&mut self.ot, resource.ot);
		result |= merge(&mut self.attribute, resource.attribute);
		result |= merge(&mut self.category, resource.category);
		result |= merge(&mut self.race, resource.race);
		result |= merge(&mut self.types, resource.types);
		result |= merge(&mut self.info, resource.info);
		result |= merge(&mut self.counter, resource.counter);
		result |= merge(&mut self.other, resource.other);
		result |= merge(&mut self.sound, resource.sound);
		result |= merge(&mut self.recognizer, resource.recognizer);
		result |= merge_string_vec(&mut self.avatar, resource.avatar);
		result |= merge_string_tuple(&mut self.btn, resource.btn);
		result |= merge_string_tuple(&mut self.link, resource.link);
		result
	}
	pub fn to_array (&self, path: &Path) -> Textures {
		let mut resource: Resource = self.clone();
		resource.to_url(path);
		(
			resource.ot.clone().into_iter()
				.filter_map(|i|
					if let Ok(code) = u32::from_str_radix(&i.0.trim_start_matches("0x"),
						if i.0.starts_with("0x") { 16 } else { 10 }
					) {
						Some((code, i.1))
					} else {
						None
					})
				.collect(),
			resource.attribute.clone().into_iter()
				.filter_map(|i|
					if let Ok(code) = u32::from_str_radix(&i.0.trim_start_matches("0x"),
						if i.0.starts_with("0x") { 16 } else { 10 }
					) {
						Some((code, i.1))
					} else {
						None
					})
				.collect(),
			resource.category.clone().into_iter()
				.filter_map(|i|
					if let Ok(code) = u32::from_str_radix(&i.0.trim_start_matches("0x"),
						if i.0.starts_with("0x") { 16 } else { 10 }
					) {
						Some((code, i.1))
					} else {
						None
					})
				.collect(),
			resource.race.clone().into_iter()
				.filter_map(|i|
					if let Ok(code) = u32::from_str_radix(&i.0.trim_start_matches("0x"),
						if i.0.starts_with("0x") { 16 } else { 10 }
					) {
						Some((code, i.1))
					} else {
						None
					})
				.collect(),
			resource.types.clone().into_iter()
				.filter_map(|i|
					if let Ok(code) = u32::from_str_radix(&i.0.trim_start_matches("0x"),
						if i.0.starts_with("0x") { 16 } else { 10 }
					) {
						Some((code, i.1))
					} else {
						None
					})
				.collect(),
			resource.counter.clone().into_iter()
				.filter_map(|i|
					if let Ok(code) = u32::from_str_radix(&i.0.trim_start_matches("0x"),
						if i.0.starts_with("0x") { 16 } else { 10 }
					) {
						Some((code, i.1))
					} else {
						None
					})
				.collect(),
			resource.link.clone().into_iter()
				.filter_map(|i|
					if let Ok(code) = u32::from_str_radix(&i.0.trim_start_matches("0x"),
						if i.0.starts_with("0x") { 16 } else { 10 }
					) {
						Some((code, i.1))
					} else {
						None
					})
				.collect(),
			resource.info.clone().into_iter().collect(),
			resource.other.clone().into_iter().collect(),
			resource.btn.clone().into_iter().collect(),
			resource.avatar.get("AVATAR").unwrap_or(&Vec::new()).to_vec()
		)
	}
	pub fn sound (&self) -> Vec<(String, String)> {
		self.sound.clone().into_iter().collect()
	}
	pub fn recognizer (&self) -> &IndexMap<String, String> {
		&self.recognizer
	}
	pub fn to_string (&self) -> Result<String, Error> {
		Ok(to_string(&self)?)
	}
	pub fn set (&mut self, key: String, value: String) -> bool {
		match self.other.entry(key) {
			Entry::Occupied(mut entry) => {
				if entry.get() == &value {
					false
				} else {
					*entry.get_mut() = value;
					true
				}
			},
			Entry::Vacant(entry) => {
				entry.insert(value);
				true
			}
		}
	}
	fn to_url (&mut self, path: &Path) {
		[
			&mut self.ot,
			&mut self.attribute,
			&mut self.category,
			&mut self.race,
			&mut self.types,
			&mut self.info,
			&mut self.counter,
			&mut self.other
		]
			.into_iter().for_each(|i| {
				i.retain(|_, value| {
					let p: PathBuf = path.join(&value);
					if let Some(p) = File::new(&p) {
						*value = p.url();
						true
					} else {
						false
					}
				});
			});
		if let Some(avatar) = self.avatar.get_mut("AVATAR") {
			avatar.retain_mut(|i| {
				let p: PathBuf = path.join(i.clone());
				if let Some(p) = File::new(&p) {
					*i = p.url();
					true
				} else {
					false
				}
			});
		}

		[&mut self.link, &mut self.btn]
			.into_iter().for_each(|i| {
				i.retain(|_, (value_i, value_ii)| {
					let p: PathBuf = path.join(&value_i);
					if let Some(p) = File::new(&p) {
						*value_i = p.url();
					} else {
						return false;
					}
					let p: PathBuf = path.join(&value_ii);
					if let Some(p) = File::new(&p) {
						*value_ii = p.url();
						true
					} else {
						false
					}
				});
			});
	}
}
