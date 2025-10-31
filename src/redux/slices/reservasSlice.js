import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const misReservasThunk = createAsyncThunk("reservas/mias", async ()=>{
  const { data } = await api.get("/reservas/mias");
  return data;
});

export const crearReservaThunk = createAsyncThunk("reservas/crear", async (payload)=>{
  const { data } = await api.post("/reservas", payload);
  return data;
});

export const cancelarReservaThunk = createAsyncThunk("reservas/cancelar", async (reservaId)=>{
  const { data } = await api.patch(`/reservas/${reservaId}/estado`, { estado: "cancelada" });
  return data;
});

const slice = createSlice({
  name:"reservas",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: b=>{
    // Mis Reservas
    b.addCase(misReservasThunk.pending, (s) => { 
      s.loading = true; 
      s.error = null; 
    });
    b.addCase(misReservasThunk.fulfilled, (s, {payload}) => { 
      s.loading = false; 
      s.list = payload; 
      s.error = null;
    });
    b.addCase(misReservasThunk.rejected, (s, {error}) => { 
      s.loading = false; 
      s.error = error.message;
    });
    
    // Crear Reserva
    b.addCase(crearReservaThunk.fulfilled, (s, {payload}) => { 
      s.list.push(payload); 
    });
    
    // Cancelar Reserva
    b.addCase(cancelarReservaThunk.fulfilled, (s, {payload}) => { 
      const index = s.list.findIndex(r => r._id === payload._id);
      if (index !== -1) s.list[index] = payload;
    });
  }
});

export default slice.reducer;
