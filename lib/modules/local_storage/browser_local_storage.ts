import WendigoModule from '../wendigo_module';
import OverrideError from '../../decorators/override_error';

export default class BrowserLocalStorage extends WendigoModule {

    @OverrideError("localStorage")
    public async getItem(key: string): Promise<string | null> {
        return await this._browser.evaluate((k) => {
            return localStorage.getItem(k);
        }, key);
    }

    @OverrideError("localStorage")
    public async setItem(key: string, value: string): Promise<void> {
        await this._browser.evaluate((k, v) => {
            return localStorage.setItem(k, v);
        }, key, value);
    }

    @OverrideError("localStorage")
    public async removeItem(key: string): Promise<void> {
        await this._browser.evaluate((k) => {
            return localStorage.removeItem(k);
        }, key);

    }

    @OverrideError("localStorage")
    public async clear(): Promise<void> {
        await this._browser.evaluate(() => {
            return localStorage.clear();
        });
    }

    @OverrideError("localStorage")
    public async length(): Promise<number> {
        const result = await this._browser.evaluate(() => {
            return localStorage.length;
        });
        return result;
    }
}
