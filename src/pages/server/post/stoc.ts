const STOC = {
	GAME_MSG: 0x1,				// byte array
	ERROR_MSG: 0x2,				// STOC_ErrorMsg
	SELECT_HAND: 0x3,			// no data
	SELECT_TP: 0x4,				// no data
	HAND_RESULT: 0x5,			// STOC_HandResult
	TP_RESULT: 0x6,				// reserved
	CHANGE_SIDE: 0x7,			// no data
	WAITING_SIDE: 0x8,			// no data
	DECK_COUNT: 0x9,			// int16_t[6]
	CREATE_GAME: 0x11,			// reserved
	JOIN_GAME: 0x12,			// STOC_JoinGame
	TYPE_CHANGE: 0x13,			// STOC_TypeChange
	LEAVE_GAME: 0x14,			// reserved
	DUEL_START: 0x15,			// no data
	DUEL_END: 0x16,				// no data
	REPLAY: 0x17,				// ExtendedReplayHeader + byte array
	TIME_LIMIT: 0x18,			// STOC_TimeLimit
	CHAT: 0x19,					// uint16_t + uint16_t array
	HS_PLAYER_ENTER: 0x20,		// STOC_HS_PlayerEnter
	HS_PLAYER_CHANGE: 0x21,		// STOC_HS_PlayerChange
	HS_WATCH_CHANGE: 0x22,		// STOC_HS_WatchChange
	TEAMMATE_SURRENDER: 0x23,	// no data
	FIELD_FINISH: 0x30,
	SRVPRO_ROOMLIST: 0x31
};

export default STOC;