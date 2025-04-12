export type TrafficParam = 'sum' | 'max' | 'min' | number;

export interface Config {
  port?: number;
  rules?: ConfigRules;
  threexui: [ThreexuiConfig];
  upload?: TrafficParam;
  download?: TrafficParam;
  total?: TrafficParam;
  expire?: TrafficParam;
  headers?: Record<string, string>;
}

export interface ConfigRules {
  minLength?: number;
  maxLength?: number;
  regex?: string;
}

export interface ThreexuiConfig {
  uri: string;
  timeout?: number;
}

export interface ThreexuiItem {
  uri: string;
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface ThreexuiResponse {
  status: number;
  headers: object;
  body?: string;
  json?: object;
}

export interface SubscriptionUserInfo {
  upload: number;
  download: number;
  total: number;
  expire: number;
}

export interface CreateSubscriptionsOptions {
  upload?: TrafficParam;
  download?: TrafficParam;
  total?: TrafficParam;
  expire?: TrafficParam;
  headers?: Record<string, string>;
}
