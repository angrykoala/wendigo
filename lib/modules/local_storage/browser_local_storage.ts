import { WendigoError } from '../../errors';
import WendigoModule from '../wendigo_module';
import { OpenSettings } from '../../types';

export default class BrowserLocalStorage extends WendigoModule {
    public async getItem(key: string): Promise<string | null> {
        try {
            return await this._browser.evaluate((k) => {
                return localStorage.getItem(k);
            }, key);
        } catch (err) {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.getItem"));
        }
    }

    public setItem(key: string, value: string): Promise<void> {
        return this._browser.evaluate((k, v) => {
            return localStorage.setItem(k, v);
        }, key, value).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.setItem"));
        });
    }

    public removeItem(key: string): Promise<void> {
        return this._browser.evaluate((k) => {
            return localStorage.removeItem(k);
        }, key).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.removeItem"));
        });
    }

    public clear(): Promise<void> {
        return this._browser.evaluate(() => {
            return localStorage.clear();
        }).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.clear"));
        });
    }

    public length(): Promise<number> {
        return this._browser.evaluate(() => {
            return localStorage.length;
        }).catch((err) => {
            return Promise.reject(WendigoError.overrideFnName(err, "localStorage.length"));
        });
    }
}
