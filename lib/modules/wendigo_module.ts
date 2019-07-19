import Browser from '../browser/browser';
import { OpenSettings } from '../types';
import PuppeteerPage from '../puppeteer_wrapper/puppeteer_page';

export default abstract class WendigoModule {
    protected _browser: Browser;
    protected _page: PuppeteerPage;

    constructor(browser: Browser) {
        this._browser = browser;
        this._page = new PuppeteerPage(browser.page);
    }

    protected _beforeOpen(_options: OpenSettings): Promise<void> {
        return Promise.resolve();
    }

    protected _beforeClose(): Promise<void> {
        return Promise.resolve();
    }

    protected _afterOpen(_options: OpenSettings): Promise<void> {
        return Promise.resolve();
    }
}
