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

export const ConnectionState = {
  None: 0,
  Queued: 1,
  Initiated: 2,
  ReceivedPairingRequest: 3,
  InProgress: 4,
  Trusted: 5,
  Pin: 6,
  Completed: 7,
  RemoteDeniedTrust: 8,
  Error: 9,
} as const;

export type ConnectionStateValue = (typeof ConnectionState)[keyof typeof ConnectionState];

export interface Device {
  generalInfo: GeneralInfo;
  shipInfo: SHIPInfo;
  ski: string;
  connectionState?: ConnectionStateValue;
  simulated?: boolean;
}
