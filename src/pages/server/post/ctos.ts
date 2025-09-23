const CTOS = {
	RESPONSE: 0x1,				// byte array
	UPDATE_DECK: 0x2,			// CTOS_DeckData
	HAND_RESULT: 0x3,			// CTOS_HandResult
	TP_RESULT: 0x4,				// CTOS_TPResult
	PLAYER_INFO: 0x10,			// CTOS_PlayerInfo
	CREATE_GAME: 0x11,			// CTOS_CreateGame
	JOIN_GAME: 0x12,			// CTOS_JoinGame
	LEAVE_GAME: 0x13,			// no data
	SURRENDER: 0x14,			// no data
	TIME_CONFIRM: 0x15,			// no data
	CHAT: 0x16,					// uint16_t array
	EXTERNAL_ADDRESS: 0x17,		// CTOS_ExternalAddress
	HS_TODUELIST: 0x20,			// no data
	HS_TOOBSERVER: 0x21,		// no data
	HS_READY: 0x22,				// no data
	HS_NOTREADY: 0x23,			// no data
	HS_KICK: 0x24,				// CTOS_Kick
	HS_START: 0x25,				// no data
	REQUEST_FIELD: 0x30
};

export default CTOS;