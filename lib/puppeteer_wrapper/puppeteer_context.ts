import { BrowserContext, Page, BrowserContextEventObj } from "./puppeteer_types";
import PuppeteerPage from "./puppeteer_page";

export default class PuppeteerContext {
    public context: BrowserContext;

    constructor(context: BrowserContext) {
        this.context = context;
    }

    public async getDefaultPage(): Promise<PuppeteerPage> {
        const pages = await this.pages();
        if (pages.length > 0) return new PuppeteerPage(pages[0]);
        else return this.newPage();
    }

    public async pages(): Promise<Array<Page>> {
        return await this.context.pages();
    }

    public async getPage(index: number): Promise<PuppeteerPage | void> {
        const pages = await this.pages();
        const rawPage = pages[index];
        if (!rawPage) return undefined;
        return new PuppeteerPage(rawPage);
    }

    public async newPage(): Promise<PuppeteerPage> {
        const page = await this.context.newPage();
        return new PuppeteerPage(page);
    }

    public on<K extends keyof BrowserContextEventObj>(eventName: K, cb: (msg: BrowserContextEventObj[K]) => Promise<void>): void {
        this.context.on(eventName, cb);
    }

    public off<K extends keyof BrowserContextEventObj>(eventName: K, cb: (msg: BrowserContextEventObj[K]) => Promise<void>): void {
        this.context.off(eventName, cb);
    }
}
