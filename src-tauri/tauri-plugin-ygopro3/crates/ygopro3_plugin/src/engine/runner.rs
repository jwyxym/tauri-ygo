use super::global;

use anyhow::{Error, Result, anyhow};
use rquickjs::{AsyncContext, AsyncRuntime, Exception, Error as JsError, Promise, Value, prelude::Ctx};
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

fn js_value_message<'js> (ctx: &Ctx<'js>, value: Value<'js>) -> String {
	if let Ok(exception) = Exception::from_value(value.clone()) {
		if let Some(stack) = exception.stack() {
			return stack;
		}
		if let Some(message) = exception.message() {
			return message;
		}
	}

	if let Some(value) = value.as_string() {
		if let Ok(value) = value.to_string() {
			return value;
		}
	}

	ctx.json_stringify(value.clone())
		.ok()
		.flatten()
		.and_then(|value| value.to_string().ok())
		.unwrap_or_else(|| format!("<{}>", value.type_name()))
}

fn js_error (ctx: &Ctx<'_>, stage: &str, err: JsError) -> Error {
	if err.is_exception() {
		anyhow!("{}: {}", stage, js_value_message(ctx, ctx.catch()))
	} else {
		anyhow!("{}: {}", stage, err)
	}
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
		global::init(ctx.clone(), map)
			.map_err(|err| js_error(&ctx, "plugin global init failed", err))?;
		ctx.eval::<(), _>(script)
			.map_err(|err| js_error(&ctx, "plugin script eval failed", err))
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

			let result: Promise<'_> = ctx.eval(
				r#"
					(async () => {
						if (typeof main !== "function") {
							throw new TypeError("plugin entry `main` is not a function");
						}
						const value = await main.apply(
							undefined,
							JSON.parse(__ygopro3_args)
						);
						return JSON.stringify(value ?? null);
					})()
				"#,
			)
			.map_err(|err| js_error(&ctx, "plugin call eval failed", err))?;

			result
				.into_future()
				.await
				.map_err(|err| js_error(&ctx, "plugin call failed", err))
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
