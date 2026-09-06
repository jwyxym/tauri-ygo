use serde::Serialize;
use std::sync::OnceLock;
use tauri::{AppHandle, Emitter};

static APP: OnceLock<AppHandle> = OnceLock::new();

pub enum Event {
	Start,
	Progress,
	End,
	Debug
}

pub fn init (app: &AppHandle) {
	APP.set(app.clone()).ok();
}

pub fn app () -> Option<&'static AppHandle> {
	APP.get()
}

pub fn emit<S: Serialize + Clone> (event: Event, payload: S) {
	if let Some(app) = APP.get() {
		emit_with_app(app, event, payload);
	}
}

pub fn emit_with_app<S: Serialize + Clone> (app: &AppHandle, event: Event, payload: S) {
	let event: &str = match event {
		Event::Start => "started",
		Event::Progress => "progress",
		Event::End => "end",
		Event::Debug => "debug"
	};
	if let Err(error) = app.emit(event, payload) {
		eprintln!("failed to emit {event}: {error}");
	}
}