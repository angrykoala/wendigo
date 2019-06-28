import BrowserEvents from './browser_events';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';

export default abstract class BrowserNavigation extends BrowserEvents {

    @FailIfNotLoaded
    public async back(): Promise<void> {
        await this._page.goBack();
        await this._afterPageLoad();
    }

    @FailIfNotLoaded
    public async forward(): Promise<void> {
        await this._page.goForward();
        await this._afterPageLoad();
    }

    @FailIfNotLoaded
    public async refresh(): Promise<void> {
        await this._page.reload();
        await this._afterPageLoad();
    }

    public async waitForPageLoad(): Promise<void> {
        await this._page.waitForNavigation({
            waitUntil: "domcontentloaded"
        });
        await this._page.waitFor(() => {
            const w = window as any;
            return Boolean(w.WendigoUtils && w.WendigoQuery && w.WendigoPathFinder); // Waits until Wendigo is ready
        });
    }
}
