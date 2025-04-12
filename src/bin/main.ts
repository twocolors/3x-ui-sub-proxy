#!/usr/bin/env node
'use strict';

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import express from 'express';
import { Server } from 'http';
import type { Config, ThreexuiResponse } from '../lib/types.js';
import ThreexuiSubscriptionProxy from '../lib/index.js';

class AppServer {
  private app: express.Express;
  private server: Server;
  private config: Config = {} as Config;

  constructor() {
    this.hellow();
    this.loadConfig();

    this.app = express();
    this.app.disable('x-powered-by');
    this.routes();

    const port = this.config.port || process.env.PORT || 8080;
    this.server = this.app.listen(port, () => {
      console.log(`🚀 3x-ui subscription proxy running on port: ${port}`);
    });

    process.once('SIGINT', () => this.stop());
    process.once('SIGTERM', () => this.stop());
  }

  static run() {
    new AppServer();
  }

  private hellow() {
    console.log('# 3x-ui-sub-proxy');
    console.log('-----------------');
  }

  private usege() {
    console.log('Usage: 3x-ui-sub-proxy <config-file>');
    process.exit(1);
  }

  private loadConfig() {
    const argv: string[] = process.argv.slice(2);

    if (argv.length < 1) {
      this.usege();
    }

    const path: string = resolve(process.cwd(), argv[0]);
    if (!existsSync(path)) {
      this.usege();
    }

    try {
      this.config = JSON.parse(readFileSync(path, 'utf8')) as Config;
    } catch (error) {
      console.log('Unable to parse configuration file:');
      console.log(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private routes() {
    this.app.get('/ping', (_, res) => {
      res.send('pong');
    });

    this.app.all('/:sub', (req, res) => {
      const config = this.config;
      const sub = req.params.sub;

      new ThreexuiSubscriptionProxy(config)
        .request(sub)
        .then((threexui: ThreexuiResponse) => {
          res.set(threexui.headers).status(threexui.status);
          if (threexui.json) res.json(threexui.json);
          if (threexui.body) res.send(threexui.body);
        });
    });

    this.app.use((_, res) => {
      res
        .set({ 'Cache-Control': 'no-store' })
        .status(404)
        .json({ detail: 'Not Found' });
    });
  }

  async stop() {
    await new Promise((resolve) => this.server.close(resolve));
    process.exit();
  }
}

AppServer.run();
