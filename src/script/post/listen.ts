import { listen, UnlistenFn } from '@tauri-apps/api/event';

class Listen {
	download_start = async (f : Function) : Promise<UnlistenFn> => {
		const unlisten = await listen<string>('download-started', async (event) => {
			const para = parseInt(event.payload);
			console.log(para)
			await f(isNaN(para) ? 0 : para);
		});
		return unlisten;
	};

	download_progress = async (f : Function) : Promise<UnlistenFn> => {
		const unlisten = await listen<number>('download-progress', async (event) => {
			await f(event.payload);
		});
		return unlisten;
	};
}

export default new Listen();