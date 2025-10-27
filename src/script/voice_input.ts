import toast from "./toast";
import fs from "./fs";

declare global {
	interface SpeechRecognition extends EventTarget {
		lang : string;
		continuous : boolean;
		interimResults : boolean;
		start() : void;
		stop() : void;
		onstart : (() => void) | null;
		onresult : ((event: SpeechRecognitionEvent) => void) | null;
		onerror : ((event: SpeechRecognitionErrorEvent) => void) | null;
		onend : (() => void) | null;
	}

	interface SpeechRecognitionEvent extends Event {
		results : SpeechRecognitionResultList;
		resultIndex : number;
	}

	interface SpeechRecognitionResultList {
		readonly length : number;
		item(index : number) : SpeechRecognitionResult;
	}

	interface SpeechRecognitionResult {
		readonly length : number;
		item(index : number) : SpeechRecognitionAlternative;
	}

	interface SpeechRecognitionAlternative {
		readonly transcript : string;
		readonly confidence : number;
	}

	interface SpeechRecognitionErrorEvent extends Event {
		error : string;
		message : string;
	}

	interface Window {
		SpeechRecognition : {
			prototype : SpeechRecognition;
			new () : SpeechRecognition;
		} | undefined;
		webkitSpeechRecognition : {
			prototype : SpeechRecognition;
			new () : SpeechRecognition;
		} | undefined;
	}
}

class Voice_Input {
	input : SpeechRecognition | undefined = undefined;
	on : boolean = false;

	constructor() {
		const voice_input = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (voice_input) {
			this.input = new voice_input();
			this.input.continuous = true;
			this.input.onerror = (event: SpeechRecognitionErrorEvent) => {
				toast.error(event.error);
			}
		}
	};

	chk = () : boolean => {
		return this.input !== undefined;
	}

	result = (f : (arg : string) => void) => {
		if (this.input)
			this.input.onresult = (event: SpeechRecognitionEvent) => {
				f(event.results[event.results.length - 1][0].transcript);
			};
	};

	start = () => {
		if (this.input) {
			try {
				// this.input.lang = 'zh-CN'
				this.input.start();
				this.on = true;
			} catch (e) {
				fs.write.log(e);
			}
		}
	};

	stop = () => {
		if (this.input) {
			try {
				this.input.stop();
				this.on = false;
			} catch (e) {
				fs.write.log(e);
			}
		}
	};
}

export default new Voice_Input();