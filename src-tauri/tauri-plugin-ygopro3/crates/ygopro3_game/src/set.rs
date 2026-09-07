use super::*;

pub async fn system (key: String, ct: i8, value: String, w: bool) -> Result<(), Error> {
	let game: &RwLock<Game> = GAME.get().ok_or(anyhow!(""))?;
	let mut game: RwLockWriteGuard<'_, Game> = game.write();
	game.system.set(key, ct, value)?;
	let path: &PathBuf = PATH.get().ok_or(anyhow!("get path error"))?;
	if w {
		write(path
			.join("config")
			.join("system.toml"), 
			game.system.to_string()
		)?;
	}
	Ok(())
}

#[cfg(target_os = "android")]
pub async fn textures (key: String, value: String, content: &[u8]) -> Result<(), Error> {
	let path: &PathBuf = PATH.get().ok_or(anyhow!("get path error"))?;
	let resource_path: PathBuf = path.join("config").join("resource.toml");
	let pic_path: PathBuf = path.join("textures").join(&value);
	let game: &RwLock<Game> = GAME.get().ok_or(anyhow!(""))?;
	let text: Option<String> = {
		let mut game: RwLockWriteGuard<'_, Game> = game.write();
		if game.resource.set(key, value) {
			Some(game.resource.to_string()?)
		} else {
			None
		}
	};
	if let Some(text) = text {
		try_join!(
			tokio::fs::write(resource_path, text),
			tokio::fs::write(pic_path, content)
		)?;
	} else {
		tokio::fs::write(pic_path, content).await?;
	}
	Ok(())
}

#[cfg(not(target_os = "android"))]
pub async fn textures (key: String, value: String) -> Result<(), Error> {
	let game: &RwLock<Game> = GAME.get().ok_or(anyhow!(""))?;
	let mut game: RwLockWriteGuard<'_, Game> = game.write();
	let path: &PathBuf = PATH.get().ok_or(anyhow!("get path error"))?;
	let chk: bool = game.resource.set(key, value);
	if chk {
		let path: PathBuf = path.join("config").join("resource.toml");
		let text: String = game.resource.to_string()?;
		write(path, text)?;
	}
	Ok(())
}
