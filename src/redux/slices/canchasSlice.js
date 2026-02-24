import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// Acepta un query string (e.g. "q=x&lat=...&lng=..."),
// asegurando que todos los filtros se envíen correctamente al backend
export const fetchCanchas = createAsyncThunk("canchas/list", async (query = "") => {
  const url = query ? `/canchas?${query}` : "/canchas";
  const { data } = await api.get(url);
  return data;
});
export const createCancha = createAsyncThunk("canchas/create", async (payload) => {
  const { data } = await api.post("/canchas", payload);
  return data;
});

export const updateCancha = createAsyncThunk("canchas/update", async ({ id, data: payload }) => {
  const { data } = await api.put(`/canchas/${id}`, payload);
  return data;
});

export const deleteCancha = createAsyncThunk("canchas/delete", async (id) => {
  await api.delete(`/canchas/${id}`);
  return id;
});
export const uploadFiles = async (files) => {
  const form = new FormData();
  [...files].forEach(f => form.append("files", f));
  const { data } = await api.post("/upload", form, { headers: { "Content-Type":"multipart/form-data" } });
  return data.files;
};

const slice = createSlice({
  name: "canchas",
  initialState: { list: [], loading:false },
  reducers: {},
  extraReducers: b=>{
    b.addCase(fetchCanchas.pending, s=>{s.loading=true;})
     .addCase(fetchCanchas.fulfilled, (s,{payload})=>{ s.loading=false; s.list=payload; })
     .addCase(fetchCanchas.rejected, s=>{s.loading=false;})
     .addCase(updateCancha.fulfilled, (s,{payload})=>{
       const index = s.list.findIndex(c => c._id === payload._id);
       if (index !== -1) s.list[index] = payload;
     })
     .addCase(deleteCancha.fulfilled, (s,{payload})=>{
       s.list = s.list.filter(c => c._id !== payload);
     });
  }
});

export default slice.reducer;
