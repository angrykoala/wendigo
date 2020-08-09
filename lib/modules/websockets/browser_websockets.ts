// import Log from "./log";
// import { matchText } from "../../utils/utils";
// import { stringifyLogText } from "../../puppeteer_wrapper/puppeteer_utils";

import WendigoModule from "../wendigo_module";
import Browser from "../../browser/browser";

export default class BrowserWebsockets extends WendigoModule {
    constructor(browser: Browser) {
        super(browser);
        this.setupEvents();
    }

    private async setupEvents(): Promise<void> {
        const cdpSession = await this._page.createCDPSession();

        cdpSession.on("Network.webSocketCreated" as any, ({ requestId, url }) => {
            console.log("Network.webSocketCreated", requestId, url);
        });

        cdpSession.on("Network.webSocketClosed" as any, ({ requestId, timestamp }) => {
            console.log("Network.webSocketClosed", requestId, timestamp);
        });

        cdpSession.on(
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

        cdpSession.on(
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
