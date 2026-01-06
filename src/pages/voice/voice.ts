import mainGame from '@/script/game';
import * as CONSTANT from '@/script/constant';

class Voice {
	audio : Array<HTMLAudioElement> = [];

	update = (key : string) : void => {
		this.audio.forEach(i => {
			i.volume = mainGame.get.system(key) as number;
		});
	};

	back = {
		play : () : void => {
			this.update(CONSTANT.KEYS.SETTING_VOICE_BACK_BGM);
			this.get.music(CONSTANT.FILES.BACK_BGM)?.play();
		},
		stop : () : void => {
			const audio = this.get.music(CONSTANT.FILES.BACK_BGM);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		},
	};

	battle = {
		play : () : void => {
			this.update(CONSTANT.KEYS.SETTING_VOICE_BACK_BGM);
			this.get.music(CONSTANT.FILES.BATTLE_BGM)?.play();
		},
		stop : () : void => {
			const audio = this.get.music(CONSTANT.FILES.BATTLE_BGM);
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