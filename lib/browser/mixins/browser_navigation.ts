import BrowserEvents from './browser_events';

export default abstract class BrowserNavigation extends BrowserEvents {
    public async back(): Promise<void> {
        this._failIfNotLoaded("back");
        await this.page.goBack();
        await this._afterPageLoad();
    }

    public async forward(): Promise<void> {
        this._failIfNotLoaded("forward");
        await this.page.goForward();
        await this._afterPageLoad();
    }

    public async refresh(): Promise<void> {
        this._failIfNotLoaded("refresh");
        await this.page.reload();
        await this._afterPageLoad();

    }

    public async waitForPageLoad(): Promise<void> {
        await this.page.waitForNavigation({
            waitUntil: "domcontentloaded"
        });
        await this.page.waitFor(() => {
            const w = window as any;
            return Boolean(w.WendigoUtils && w.WendigoQuery && w.WendigoPathFinder); // Waits until Wendigo is ready
        });
    }
}
