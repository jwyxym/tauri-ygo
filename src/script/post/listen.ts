import { listen, UnlistenFn } from '@tauri-apps/api/event';

class Listen {
	download = {
		start : async (f : Function) : Promise<UnlistenFn> => {
			const unlisten = await listen<string>('download-started', async (event) => {
				const para = parseInt(event.payload);
				await f(isNaN(para) ? 0 : para);
			});
			return unlisten;
		},
		progress : async (f : Function) : Promise<UnlistenFn> => {
			const unlisten = await listen<number>('download-progress', async (event) => {
				await f(event.payload);
			});
			return unlisten;
		}
	};

	unzip = {
		start : async (f : Function) : Promise<UnlistenFn> => {
			const unlisten = await listen<string>('unzip-started', async (event) => {
				await f(event.payload);
			});
			return unlisten;
		},
		progress : async (f : Function) : Promise<UnlistenFn> => {
			const unlisten = await listen<number>('unzip-progress', async (event) => {
				await f(event.payload);
			});
			return unlisten;
		}
	};
}

export default new Listen();