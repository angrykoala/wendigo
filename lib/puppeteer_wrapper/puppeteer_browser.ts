import { BrowserContext, Page } from "./puppeteer_types";

export default class PuppeteerBrowser {
    public context: BrowserContext;

    constructor(context: BrowserContext) {
        this.context = context;
    }

    public pages(): Promise<Array<Page>> {
        return this.context.pages();
    }

}
