import { configureStore } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage'
import { persistReducer,persistStore } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import tokenReducer from './slices/user/userToken'
import { clientSlice } from "./slices/user/userSlice";
import { vendorSlice } from "./slices/vendor/vendorSlice";
import vendorTokenReducer from './slices/vendor/vendorTokenSlice'



const persistConfig={
    key:"root",
    storage,
    blacklist:['token','vendorToken']
}

const rootReducer = combineReducers({
    token:tokenReducer,
    clientSlice:clientSlice.reducer,
    vendorToken:vendorTokenReducer,
    vendorSlice:vendorSlice.reducer,
})
const persistedReducer = persistReducer(persistConfig,rootReducer)

export const store = configureStore({
    reducer:persistedReducer,
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck:{
                ignoredActions:['persist/PERSIST','persist/REHYDRATE']
            }
        })
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>






