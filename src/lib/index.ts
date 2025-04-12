'use strict';

import type {
  Config,
  ThreexuiResponse,
  ThreexuiItem,
  CreateSubscriptionsOptions,
  TrafficParam,
  SubscriptionUserInfo,
} from './types.js';
import ky from 'ky';

export default class ThreexuiSubscriptionProxy {
  private config: Config = {} as Config;

  constructor(config: Config) {
    this.config = config;
  }

  private validate(value: string): boolean {
    const rules = this.config.rules;

    if (rules?.minLength && String(value).length < rules?.minLength) {
      return false;
    }

    if (rules?.maxLength && String(value).length > rules.maxLength) {
      return false;
    }

    if (rules?.regex && !new RegExp(rules.regex).test(value)) {
      return false;
    }

    return true;
  }

  private notFound(): ThreexuiResponse {
    return {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
      json: { detail: 'Not Found' },
    };
  }

  async _fetch(uri: string, timeout: number = 1500): Promise<ThreexuiItem> {
    try {
      const response = await ky(uri, {
        timeout: timeout,
        throwHttpErrors: false,
        retry: 0,
      });

      const body = await response.text();
      const headers = Object.fromEntries(response.headers.entries());

      return {
        uri: uri,
        status: response.status,
        headers,
        body,
      };
    } catch (error) {
      return {
        uri: uri,
        status: 500,
        headers: {},
        body: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async getSubscriptions(sub: string): Promise<ThreexuiItem[]> {
    return await Promise.all(
      this.config.threexui.map((elm) => {
        const uri = elm.uri!.endsWith('/') ? elm.uri : `${elm.uri}/`;
        return this._fetch(`${uri}${sub}`, elm.timeout);
      }),
    );
  }

  private createSubscriptions(
    data: ThreexuiItem[],
    options: CreateSubscriptionsOptions = {},
  ): ThreexuiResponse {
    const {
      upload = 'sum',
      download = 'sum',
      total = 'sum',
      expire = 'max',
      headers: customHeaders = {},
    } = options;

    const items = data.filter((i) => {
      if (i.status !== 200) {
        console.error(`status=${i.status}, url=${i.uri}, body=${i.body}`);
        return false;
      }
      return true;
    });
    if (items.length === 0) return this.notFound();

    const userInfo: SubscriptionUserInfo[] = items
      .map((item) => item.headers?.['subscription-userinfo'])
      .filter(Boolean)
      .map((info) => {
        const result: SubscriptionUserInfo = {
          upload: 0,
          download: 0,
          total: 0,
          expire: 0,
        };
        info!.split(';').forEach((part) => {
          const [key, value] = part.trim().split('=');
          if (key && value !== undefined) {
            const numValue = Number(value.trim());
            result[key.trim() as keyof SubscriptionUserInfo] = isNaN(numValue)
              ? 0
              : numValue;
          }
        });
        return result;
      });

    const getParamValue = (
      paramName: keyof SubscriptionUserInfo,
      paramConfig: TrafficParam,
    ): number => {
      if (typeof paramConfig === 'number') return paramConfig;
      if (userInfo.length === 0) return 0;

      const values = userInfo.map((info) => info[paramName]);
      switch (paramConfig) {
        case 'sum':
          return values.reduce((a, b) => a + b, 0);
        case 'max':
          return Math.max(...values);
        case 'min':
          return Math.min(...values);
        default:
          return values[0];
      }
    };

    const subscriptionUserinfo = `upload=${getParamValue('upload', upload)}; download=${getParamValue('download', download)}; total=${getParamValue('total', total)}; expire=${getParamValue('expire', expire)}`;

    const body = items
      .flatMap((item) => item.body.split('\n'))
      .filter((line) => line.trim() !== '');

    const allowedHeaders = [
      // 'profile-web-page-url',
      'support-url',
      'profile-title',
      'profile-update-interval',
      'subscription-userinfo',
      'content-type',
    ];

    const headers: Record<string, string> = {
      'content-type': 'text/plain; charset=utf-8',
      ...customHeaders,
      'subscription-userinfo': subscriptionUserinfo,
    };

    Object.keys(headers).forEach((key) => {
      if (!allowedHeaders.includes(key)) {
        delete headers[key];
      }
    });

    return {
      status: 200,
      headers: headers,
      body: body.join('\n'),
    };
  }

  public async request(sub: string): Promise<ThreexuiResponse> {
    if (!this.validate(sub)) {
      return this.notFound();
    }

    const subs = await this.getSubscriptions(sub);
    return this.createSubscriptions(subs, this.config);
  }
}
