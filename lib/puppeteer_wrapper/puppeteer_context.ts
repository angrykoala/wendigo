import { BrowserContext } from "./puppeteer_types";
import PuppeteerPage from "./puppeteer_page";

export default class PuppeteerContext {
    public context: BrowserContext;

    constructor(context: BrowserContext) {
        this.context = context;
    }

    public async getDefaultPage(): Promise<PuppeteerPage> {
        const pages = await this.pages();
        if (pages.length > 0) return pages[0];
        else return this.newPage();
    }

    public async pages(): Promise<Array<PuppeteerPage>> {
        const rawPages = await this.context.pages();
        return rawPages.map(p => new PuppeteerPage(p));
    }

    public async newPage(): Promise<PuppeteerPage> {
        const page = await this.context.newPage();
        return new PuppeteerPage(page);
    }

}
