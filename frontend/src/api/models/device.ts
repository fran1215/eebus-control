// src/types/device.ts

export interface GeneralInfo {
  spineDeviceAddress: string;
  deviceName: string;
  brand: string;
  vendor: string;
  serialNumber: string;
  model: string;
  type: string;
}

export interface SHIPInfo {
  shipId: string;
  instanceName: string;
  hostAddress: string;
  port: number;
}

export interface Device {
  generalInfo: GeneralInfo;
  shipInfo: SHIPInfo;
  ski: string;
}
