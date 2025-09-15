import mainGame from './game';
import constant from './constant';

class Voice {
	update = (key : string) : void => {
		mainGame.audio.forEach(i => {
			if (i.classList.contains(key))
				i.volume = mainGame.get.system(key) as number;
		});
	};
	back = {
		play : () : void => {
			this.update(constant.str.system_conf.sound.back);
			mainGame.get.music(constant.str.bgm.back)?.play();
		},
		stop : () : void => {
			const audio = mainGame.get.music(constant.str.bgm.back);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		},
	};
	battle = {
		play : () : void => {
			this.update(constant.str.system_conf.sound.back);
			mainGame.get.music(constant.str.bgm.battle)?.play();
		},
		stop : () : void => {
			const audio = mainGame.get.music(constant.str.bgm.battle);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}
		},
	};
}

export default new Voice();