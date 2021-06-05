import { createStore, applyMiddleware, compose } from "redux";
import combinedReducer from "./reducers";
import thunk from "redux-thunk";



const middleWare = [thunk];

const store =
  process.env.NODE_ENV === "development"
    ? createStore(
        combinedReducer,
        compose(
          applyMiddleware(...middleWare)
        )
      )
    : createStore(combinedReducer, compose(applyMiddleware(...middleWare)));


export default store;
