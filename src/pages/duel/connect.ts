import { reactive } from 'vue';

const connect = reactive({
	state : 0 as 0 | 1 | 2 | 3,
	on : async (para ?: { name : string; pass : string; address : string; }) => {
		switch (connect.state) {
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				break;
		}
		connect.state > 2 ? connect.state = 0 : connect.state ++;
	},
	clear : () => {
		connect.state = 0;
	}
});


export default connect;