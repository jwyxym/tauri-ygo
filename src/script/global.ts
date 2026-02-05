import { reactive } from 'vue';

const resize = () => {
	const height = window.innerHeight;
	const width = window.innerWidth;
	GLOBAL.SCALE = (width > height * (GLOBAL.HEIGHT / GLOBAL.WIDTH) ? height / GLOBAL.HEIGHT
		: width / GLOBAL.WIDTH);
	GLOBAL.LEFT = (width - GLOBAL.WIDTH * GLOBAL.SCALE) / 2;
	GLOBAL.TOP = (height - GLOBAL.HEIGHT * GLOBAL.SCALE) / 2;
};

const GLOBAL = reactive({
	HEIGHT : 900,
	WIDTH : 1600,
	LEFT : 0,
	TOP : 0,
	SCALE : 1
});

window.addEventListener('resize', resize);
resize();

export default GLOBAL;