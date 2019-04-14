import Browser from '../browser/browser';
import { OpenSettings } from '../types';

export default abstract class WendigoModule {
    protected _browser: Browser;

    constructor(browser: Browser) {
        this._browser = browser;
    }

    protected _beforeOpen(options: OpenSettings): Promise<void> {
        return Promise.resolve();
    }

    protected _beforeClose(): Promise<void> {
        return Promise.resolve();
    }

    protected _afterOpen(options: OpenSettings): Promise<void> {
        return Promise.resolve();
    }
}
