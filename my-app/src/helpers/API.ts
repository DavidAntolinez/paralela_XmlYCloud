import axios from "axios";
import type { Almacen, HistorialTransferencia, Item, LoginResponse } from "../types";

const BASE_URL = "/api";

const api = axios.create({ baseURL: BASE_URL });

// ── Auth ──────────────────────────────────────────────────────────────────────

export const login = (username: string, password: string) =>
  api.post<LoginResponse>("/usuario/login", { username, password });

export const signUp = (username: string, password: string) =>
  api.post<{ mensaje: string }>("/usuario/signup", { username, password });

// ── Almacen ───────────────────────────────────────────────────────────────────

export const getAlmacenes = (token: string) =>
  api.post<Almacen[]>("/almacen/", { token });

export const putAlmacenes = (token: string, tamaño: string) =>
  api.put<{ mensaje: string; almacen: Almacen }>("/almacen/", { token, tamaño });

// ── Items ─────────────────────────────────────────────────────────────────────

export const getItems = (token: string, almacenId: string) =>
  api.post<Item[]>("/item/", { token, id: almacenId });

export const putItem = (
  token: string,
  almacenId: string,
  nombre: string,
  descripcion: string
) =>
  api.put<{ mensaje: string; item: Item }>("/item/", {
    token,
    id: almacenId,
    nombre,
    descripcion,
  });

// ── Informe XML ───────────────────────────────────────────────────────────────

export const getInforme = (token: string) =>
  api.post<string>("/informe/", { token }, { responseType: "text" });

export const descargarInforme = (token: string) =>
  api.post("/informe/descargar", { token }, { responseType: "blob" });

// ── Historial ───────────────────────────────────────────────────────────────

export const getHistorial = (token: string) =>
  api.post<HistorialTransferencia[]>("/historial/", { token });

export const newHistorial = (
  token: string,
  itemId: string,
  almacenOrigenId: string,
  almacenDestinoId: number
) =>
  api.put<{ mensaje: string; historial: HistorialTransferencia }>("/historial/", {
    token,
    itemId,
    almacenOrigenId,
    almacenDestinoId,
  });
