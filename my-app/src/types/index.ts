export interface Usuario {
  username: string;
  password: string;
}

export interface Almacen {
  id: number;
  capacidad_total: number;
  items_almacenados: number;
  usuario_id: number;
}

export interface Item {
  id: number;
  nombre: string;
  descripcion: string;
  almacen_id: number;
}

export interface HistorialTransferencia {
  id: number;
  item_id: number;
  almacen_origen_id: number;
  almacen_destino_id: number;
  fecha: string;
  usuario_id: number;
}

export interface LoginResponse {
  token: string;
}

export interface ApiError {
  error: string;
}
