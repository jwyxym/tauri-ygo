import mainGame from '../../script/game';
import constant from '../../script/constant';

class Voice {
	audio : Array<HTMLAudioElement> = [];

	update = (key : string) : void => {
		this.audio.forEach(i => {
			if (i.classList.contains(key))
				i.volume = mainGame.get.system(key) as number;
		});
	};

	back = {
		play : () : void => {
			this.update(constant.str.system_conf.sound.back);
			this.get.music(constant.str.files.sound.back)?.play();
		},
		stop : () : void => {
			const audio = this.get.music(constant.str.files.sound.back);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		},
	};

	battle = {
		play : () : void => {
			this.update(constant.str.system_conf.sound.back);
			this.get.music(constant.str.files.sound.battle)?.play();
		},
		stop : () : void => {
			const audio = this.get.music(constant.str.files.sound.battle);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		},
	};

	get = {
		music : (key : string) : HTMLAudioElement | undefined => {
			return this.audio.find(i => i.id === key);
		}
	};

	push = {
		music : (audio : Array<HTMLAudioElement>) : void => {
			this.audio = audio;
		}
	}
}

export default new Voice();