import { WendigoError } from '../../errors';
import WendigoModule from '../wendigo_module';

export default class BrowserLocalStorage extends WendigoModule {
    public async getItem(key: string): Promise<string | null> {
        try {
            return await this._browser.evaluate((k) => {
                return localStorage.getItem(k);
            }, key);
        } catch (err) {
            throw WendigoError.overrideFnName(err, "localStorage.getItem");
        }
    }

    public async setItem(key: string, value: string): Promise<void> {
        try {
            await this._browser.evaluate((k, v) => {
                return localStorage.setItem(k, v);
            }, key, value);
        } catch (err) {
            throw WendigoError.overrideFnName(err, "localStorage.setItem");
        }
    }

    public async removeItem(key: string): Promise<void> {
        try {
            await this._browser.evaluate((k) => {
                return localStorage.removeItem(k);
            }, key);
        } catch (err) {
            throw WendigoError.overrideFnName(err, "localStorage.removeItem");
        }
    }

    public async clear(): Promise<void> {
        try {
            await this._browser.evaluate(() => {
                return localStorage.clear();
            });
        } catch (err) {
            throw WendigoError.overrideFnName(err, "localStorage.clear");
        }
    }

    public async length(): Promise<number> {
        try {
            const result = await this._browser.evaluate(() => {
                return localStorage.length;
            });
            return result;
        } catch (err) {
            throw WendigoError.overrideFnName(err, "localStorage.length");
        }
    }
}
