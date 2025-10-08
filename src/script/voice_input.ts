import toast from "./toast";

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

	result = (f : (arg0 : string) => void) => {
		if (this.input)
			this.input.onresult = (event: SpeechRecognitionEvent) => {
				f(event.results[event.results.length - 1][0].transcript);
			};
	};

	start = () => {
		if (this.input) {
			// this.input.lang = 'zh-CN'
			this.input.start();
		}
	};

	stop = () => {
		if (this.input)
			this.input.stop();
	};
}

export default new Voice_Input();