import ACTION_TYPES from '../actions/type.action';

const initialState = {
	eventCoordinates : {x:window.innerWidth/2,y:window.innerWidth/2},
	moveCoordinates : {x:0,y:0},
	curtainSize : 1.5
};

const reducer = (state = initialState, action) => {
	const { type, payload } = action;

	switch (type) {
		case ACTION_TYPES.UPDATE_POSITION:
			return {
				...state,
				eventCoordinates: payload
			};
		case ACTION_TYPES.UPDATE_MOVE_POSITION:
			return {
				...state,
				moveCoordinates: payload
			};
		case ACTION_TYPES.SET_CURTAIN_SIZE:
			return {
				...state,
				curtainSize: payload
			};

		default:
			return state;
	}
};

export default reducer;
