import Browser from '../browser/browser';

export default abstract class WendigoModule {
    protected _browser: Browser;

    constructor(browser: Browser) {
        this._browser = browser;
    }
}
