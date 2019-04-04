import * as utils from '../../utils/utils';
import Log from '../../models/log';

import WendigoModule from '../wendigo_module';
import { WendigoError } from '../../errors';

export default class BrowserCookies extends WendigoModule {
    public all(): Promise<{ [s: string]: string }> {
        return this._browser.page.cookies().then((cookies) => {
            return cookies.reduce((acc, cookie) => {
                acc[cookie.name] = cookie.value;
                return acc;
            }, {} as { [s: string]: string });
        });
    }

    public get(name: string): Promise<string | undefined> {
        return this.all().then((cookies) => {
            return cookies[name];
        });
    }

    public set(name: string, value: string): Promise<void> {
        return this._browser.page.setCookie({
            name: name,
            value: value
        });
    }

    public delete(name: string | Array<string>): Promise<void> {
        if (name === undefined || name === null) throw new WendigoError("cookies.delete", "Delete cookie name missing");
        if (!Array.isArray(name)) name = [name];
        const cookiesObjects = name.map((n) => {
            return { name: n };
        });
        return this._browser.page.deleteCookie(...cookiesObjects);
    }

    public clear(): Promise<void> {
        return this._browser.page.cookies().then((cookies) => {
            const cookiesList = cookies.map(c => c.name);
            if (cookiesList.length === 0) return Promise.resolve();
            return this.delete(cookiesList);
        });
    }
}
