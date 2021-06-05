import React,{useEffect} from 'react';
import GetMesh from './mesh';
import {mouseCoordinates,mouseMoveCoordinates,cameraCoordinates} from '../store/actions/coordinate.action'
import { useDispatch, useSelector } from 'react-redux';

export default function Curtain() {
  const dispatch = useDispatch();
  useEffect(() => {
		initListeners();
   // dispatch(cameraCoordinates(cameraEvent));
	}, []);

  const initListeners = () => {
		if ('ontouchstart' in window) {
			document.body.addEventListener('touchstart', updateMouse, false);
			document.body.addEventListener('touchmove', move, false);
		} else {
			document.body.addEventListener('mouseenter', updateMouse, false);
			document.body.addEventListener('mousemove', move, false);
		}
	};

  const updateMouse = (e) => {
		dispatch(mouseCoordinates(e))
	};

  const move = (e) => {
		dispatch(mouseMoveCoordinates(e))
	};

  

  return (
    <div>
      <GetMesh/>
    </div>
  )
}
