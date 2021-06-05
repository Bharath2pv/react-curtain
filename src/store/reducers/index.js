import { combineReducers } from "redux";
import coordinateReducer from "./coordinate.reducer";


const combinedReducer = combineReducers({
  coordinateReducer: coordinateReducer
});
export default combinedReducer;
