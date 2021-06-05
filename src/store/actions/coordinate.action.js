import ACTION_TYPE from './type.action';

export const mouseCoordinates = (event) => async (dispatch) => {
	if (event.changedTouches && event.changedTouches.length) {
		event.x = event.changedTouches[0].pageX;
		event.y = event.changedTouches[0].pageY;
	}
	if (event.x === undefined) {
		event.x = event.pageX;
		event.y = event.pageY;
	}
	let mouseEvent = {
		x: event.x,
		y: event.y
	};
	dispatch({
		type: ACTION_TYPE.UPDATE_POSITION,
		payload: mouseEvent
	});
};

export const mouseMoveCoordinates = (event) => async (dispatch) => {
	if (event.changedTouches && event.changedTouches.length) {
		event.x = event.changedTouches[0].pageX;
		event.y = event.changedTouches[0].pageY;
	}
	if (event.x === undefined) {
		event.x = event.pageX;
		event.y = event.pageY;
	}

	let mouseMoveEvent = {
		x: event.x,
		y: event.y
	};
  console.log('mouseMoveEvent',mouseMoveEvent);
	dispatch({
		type: ACTION_TYPE.UPDATE_MOVE_POSITION,
		payload: mouseMoveEvent
	});
};

export const cameraCoordinates = (event) => async (dispatch) => {
  let ConvertedCamX = event.x * window.innerWidth;
  let ConvertedCamY = event.y * window.innerHeight;
	let cameraEvent = {
		x: ConvertedCamX,
		y: ConvertedCamY
	};
	dispatch({
		type: ACTION_TYPE.UPDATE_MOVE_POSITION,
		payload: cameraEvent
	});
};

export const setCurtainSize = (curtainSize) => async (dispatch) => {
	dispatch({
		type: ACTION_TYPE.SET_CURTAIN_SIZE,
		payload: curtainSize
	});
};
