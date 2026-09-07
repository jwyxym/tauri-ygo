use super::global;

use anyhow::{Error, Result, anyhow};
use rquickjs::{AsyncContext, AsyncRuntime, Promise, prelude::Ctx};
use std::{
	collections::BTreeMap,
	sync::{
		OnceLock,
		mpsc::{self, Sender},
	},
	thread::spawn,
};
use tokio::{runtime::Builder, task::LocalSet};

static EXTENDS: OnceLock<Sender<Command>> = OnceLock::new();

struct Extend {
	ctx: AsyncContext,
	_rt: AsyncRuntime,
}

pub enum Command {
	Load {
		name: String,
		script: String,
		reply: Sender<Result<(), String>>,
		map: BTreeMap<String, bool>
	},
	Call {
		name: String,
		args: String,
		reply: Sender<Result<String, String>>,
	},
	Unload {
		name: String,
		reply: Sender<Result<(), String>>,
	},
	UnloadAll {
		reply: Sender<Result<(), String>>,
	},
}

pub fn sender () -> &'static Sender<Command> {
	EXTENDS.get_or_init(|| {
		let (tx, rx) = mpsc::channel::<Command>();

		spawn(move || {
			let runtime = match Builder::new_current_thread().enable_all().build() {
				Ok(runtime) => runtime,
				Err(err) => {
					let message = format!("extend worker runtime init failed: {}", err);
					while let Ok(command) = rx.recv() {
						match command {
							Command::Load { reply, .. } => {
								let _ = reply.send(Err(message.clone()));
							}
							Command::Call { reply, .. } => {
								let _ = reply.send(Err(message.clone()));
							}
							Command::Unload { reply, .. } => {
								let _ = reply.send(Err(message.clone()));
							}
							Command::UnloadAll { reply } => {
								let _ = reply.send(Err(message.clone()));
							}
						}
					}
					return;
				}
			};
			let local = LocalSet::new();
			let mut extends: BTreeMap<String, Extend> = BTreeMap::new();

			while let Ok(command) = rx.recv() {
				match command {
					Command::Load {
						name,
						script,
						reply,
						map
					} => {
						let result: Result<(), String> = local
							.block_on(&runtime, load(&mut extends, name, &script, map))
							.map_err(|err| err.to_string());
						let _ = reply.send(result);
					}
					Command::Call { name, args, reply } => {
						let result: Result<String, String> = local
							.block_on(&runtime, call(&mut extends, &name, &args))
							.map_err(|err: Error| err.to_string());
						let _ = reply.send(result);
					}
					Command::Unload { name, reply } => {
						let result: Result<(), String> = local
							.block_on(&runtime, unload(&mut extends, &name))
							.map_err(|err| err.to_string());
						let _ = reply.send(result);
					}
					Command::UnloadAll { reply } => {
						extends.clear();
						let _ = reply.send(Ok(()));
					}
				}
			}
		});

		tx
	})
}

pub fn receive<T> (rx: mpsc::Receiver<Result<T, String>>) -> Result<T, Error> {
	rx.recv()
		.map_err(|err| anyhow!("extend worker disconnected: {}", err))?
		.map_err(Error::msg)
}

async fn load (
	extends: &mut BTreeMap<String, Extend>,
	name: String,
	script: &str,
	map: BTreeMap<String, bool>
) -> Result<(), Error> {
	let rt: AsyncRuntime = AsyncRuntime::new()?;
	let ctx: AsyncContext = AsyncContext::full(&rt).await?;

	ctx.async_with(async |ctx: Ctx<'_>| {
		global::init(ctx.clone(), map)?;
		ctx.eval::<(), _>(script)
	})
	.await?;

	extends.insert(name, Extend { ctx, _rt: rt });

	Ok(())
}

async fn call (
	extends: &mut BTreeMap<String, Extend>,
	name: &str,
	args: &str
) -> Result<String, Error> {
	let extend = extends
		.get_mut(name)
		.ok_or_else(|| anyhow!("extend not loaded: {}", name))?;

	let result: String = extend
		.ctx
		.async_with(async |ctx| {
			let globals = ctx.globals();

			globals.set("__ygopro3_args", args)?;

			let result: Promise<'_> = ctx.eval_promise(
				r#"
			(async () => JSON.stringify(
				await main.apply(
					undefined,
					JSON.parse(__ygopro3_args)
				)
			))()
		"#,
			)?;

			result.into_future().await
		})
		.await?;

	Ok(result)
}

async fn unload (extends: &mut BTreeMap<String, Extend>, name: &str) -> Result<(), Error> {
	extends
		.remove(name)
		.ok_or_else(|| anyhow!("extend not loaded: {}", name))?;

	Ok(())
}