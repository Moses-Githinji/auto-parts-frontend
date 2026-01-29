export interface VehicleMake {
  id: string;
  name: string;
  createdAt: string;
}

export interface VehicleMakeResponse {
  makes: VehicleMake[];
}

export interface VehicleModel {
  id: string;
  makeId: string;
  name: string;
  category?: string;
  createdAt: string;
}

export interface VehicleModelResponse {
  models: VehicleModel[];
}

export interface VehicleYear {
  id: string;
  year: number;
  createdAt: string;
}

export interface VehicleYearResponse {
  years: VehicleYear[];
}

export interface VehicleSearchRequest {
  make: string;
  model: string;
  year?: number;
}

export interface VehicleSearchResponse {
  products: import("./product").Product[];
}
