import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/authSlice.js";
import canchas from "./slices/canchasSlice.js";
import reservas from "./slices/reservasSlice.js";

export default configureStore({
  reducer: { auth, canchas, reservas }
});
