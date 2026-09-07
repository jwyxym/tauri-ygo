use rquickjs::{Error, Function, Object, function::Async, prelude::Ctx};
use std::{io::Read, collections::BTreeMap};
use ureq::{Body, BodyReader, delete, get, head, http::Response, options, patch, post, put};
use tokio::task::spawn_blocking;

macro_rules! set_sync {
	($ctx:expr, $obj:expr, $name:literal, $func:expr) => {{
		let f = Function::new($ctx.clone(), $func)?;
		$obj.set($name, f)?;
	}};
}

macro_rules! set_async {
	($ctx:expr, $obj:expr, $name:literal, $func:expr) => {{
		let f = Function::new($ctx.clone(), Async($func))?;
		$obj.set($name, f)?;
	}};
}

macro_rules! set_request {
	($ctx:expr, $obj:expr, $name:literal, $method:ident) => {
		set_async!($ctx, $obj, $name, |url: String| async move {
			blocking(move || {
				let response: Response<Body> =
					$method(url).call().map_err(|err| err.to_string())?;
				read_response(response)
			})
			.await
		});
	};
}

macro_rules! set_body_request {
	($ctx:expr, $obj:expr, $name:literal, $method:ident) => {
		set_async!($ctx, $obj, $name, |url: String, body: String| async move {
			blocking(move || {
				let response: Response<Body> =
					$method(url).send(body).map_err(|err| err.to_string())?;
				read_response(response)
			})
			.await
		});
	};
}

macro_rules! if_plugin_allowed {
	($map:expr, $permission:literal, $body:block) => {
		if $map.get($permission).copied().unwrap_or(false) {
			$body
		}
	};
}

fn js_error (message: impl ToString) -> Error {
	Error::new_from_js_message("Rust", "Error", message.to_string())
}

async fn blocking<F, T> (f: F) -> Result<T, Error>
where
	F: FnOnce() -> Result<T, String> + Send + 'static,
	T: Send + 'static,
{
	spawn_blocking(f)
		.await
		.map_err(js_error)?
		.map_err(js_error)
}

fn read_response (response: Response<Body>) -> Result<String, String> {
	if response.status().is_success() {
		let mut body: Body = response.into_body();
		let mut reader: BodyReader<'_> = body.as_reader();
		let mut content: String = String::new();
		reader
			.read_to_string(&mut content)
			.map_err(|err| err.to_string())?;
		Ok(content)
	} else {
		Err(response.status().as_str().to_string())
	}
}
	
pub fn init (ctx: Ctx<'_>, map: BTreeMap<String, bool>) -> Result<(), Error> {
	let globals: Object<'_> = ctx.globals();
	let ygopro3: Object<'_> = Object::new(ctx.clone())?;

	set_async!(ctx, ygopro3, "log", |msg: String| async move {
		blocking(move || {
			ygopro3_log::log::write(format!("YGOPro3 Extend: {}", msg))
				.map_err(|err| err.to_string())
		})
		.await
	});

	if_plugin_allowed!(map, "PLUGIN_GET", {
		set_request!(ctx, ygopro3, "get", get);
	});
	if_plugin_allowed!(map, "PLUGIN_POST", {
		set_body_request!(ctx, ygopro3, "post", post);
	});
	if_plugin_allowed!(map, "PLUGIN_PUT", {
		set_body_request!(ctx, ygopro3, "put", put);
	});
	if_plugin_allowed!(map, "PLUGIN_PATCH", {
		set_body_request!(ctx, ygopro3, "patch", patch);
	});
	if_plugin_allowed!(map, "PLUGIN_DELETE", {
		set_request!(ctx, ygopro3, "delete", delete);
	});
	if_plugin_allowed!(map, "PLUGIN_HEAD", {
		set_request!(ctx, ygopro3, "head", head);
	});
	if_plugin_allowed!(map, "PLUGIN_OPTIONS", {
		set_request!(ctx, ygopro3, "options", options);
	});

	globals.set("YGOPro3", ygopro3)?;
	Ok(())
}
