import mainGame from '@/script/game';

class Voice {
	playing ?: HTMLAudioElement = undefined;
	audio : Map<string, HTMLAudioElement> = new Map();

	set_elements = (el : HTMLAudioElement | null, key : string) => el ? this.audio.set(key, el) : this.audio.delete(key);

	update = (key : string) : void => this.audio.forEach(i => i.volume = mainGame.get.system(key) as number);

	play = (key : string) : void => {
		if (this.playing) {
			this.playing.pause();
			this.playing.currentTime = 0;
		}
		this.playing = this.audio.get(key);
		this.playing?.play();
	};
}

const voice = new Voice();

export default voice;