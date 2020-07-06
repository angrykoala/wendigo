import Log from "./log";
import { matchText } from "../../utils/utils";
import { stringifyLogText } from "../../puppeteer_wrapper/puppeteer_utils";

import WendigoModule from "../wendigo_module";
import Browser from "../../browser/browser";

export default class BrowserConsole extends WendigoModule {
  constructor(browser: Browser) {
    super(browser);

    this._page.on("Network.webSocketCreated" as any, ({ requestId, url }) => {
      console.log("Network.webSocketCreated", requestId, url);
    });

    this._page.on("Network.webSocketClosed" as any, ({ requestId, timestamp }) => {
      console.log("Network.webSocketClosed", requestId, timestamp);
    });

    this._page.on(
      "Network.webSocketFrameSent" as any,
      ({ requestId, timestamp, response }) => {
        console.log(
          "Network.webSocketFrameSent",
          requestId,
          timestamp,
          response.payloadData
        );
      }
    );

    this._page.on(
      "Network.webSocketFrameReceived" as any,
      ({ requestId, timestamp, response }) => {
        console.log(
          "Network.webSocketFrameReceived",
          requestId,
          timestamp,
          response.payloadData
        );
      }
    );
  }

  // public clear(): void {
  //     this._logs = [];
  // }
  //
  // protected async _beforeOpen(options: OpenSettings): Promise<void> {
  //     await super._beforeOpen(options);
  //     this.clear();
  // }
}
