import BrowserClick from './browser_click';

import { QueryError } from '../../models/errors';
import { WendigoSelector, GeoLocationCoords } from '../../types';
import FailIfNotLoaded from '../../decorators/fail_if_not_loaded';
import { PDFOptions } from '../../puppeteer_wrapper/puppeteer_types';

export default abstract class BrowserInfo extends BrowserClick {

    @FailIfNotLoaded
    public async text(selector: WendigoSelector): Promise<Array<string>> {
        return await this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            const result = [];
            for (const e of elements) {
                result.push(e.textContent);
            }
            return result;
        }, selector);
    }

    @FailIfNotLoaded
    public title(): Promise<string> {
        return this._page.title();
    }

    @FailIfNotLoaded
    public html(): string {
        return this._originalHtml || "";
    }

    @FailIfNotLoaded
    public tag(selector: WendigoSelector): Promise<string | null> {
        return this.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            if (!element) return null;
            else return element.tagName.toLowerCase();
        }, selector);
    }

    @FailIfNotLoaded
    public innerHtml(selector: WendigoSelector): Promise<Array<string>> {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            return elements.map(e => e.innerHTML);
        }, selector);
    }

    @FailIfNotLoaded
    public elementHtml(selector: WendigoSelector): Promise<Array<string>> {
        return this.evaluate((q) => {
            const elements = WendigoUtils.queryAll(q);
            return elements.map(e => e.outerHTML);
        }, selector);
    }

    @FailIfNotLoaded
    public async options(selector: WendigoSelector): Promise<Array<string>> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLSelectElement;
                if (!element) return Promise.reject();
                const options = element.options || [];
                const result = [];
                for (let i = 0; i < options.length; i++) {
                    result.push(options[i].value);
                }
                return result;
            }, selector);
        } catch (err) {
            throw new QueryError("options", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async selectedOptions(selector: WendigoSelector): Promise<Array<string>> {
        try {
            const result = await this.evaluate((q) => {
                const elements = WendigoUtils.queryElement(q) as HTMLSelectElement;
                return Array.from(elements.options).filter((option) => {
                    return option.selected;
                }).map((option) => {
                    return option.value || option.text;
                });
            }, selector);
            return result;
        } catch (err) {
            throw new QueryError("selectedOptions", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async class(selector: WendigoSelector): Promise<Array<string>> {
        try {
            const result = await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) throw new Error();
                else return Array.from(element.classList);
            }, selector);
            return result as Array<string>;
        } catch (err) {
            throw new QueryError("class", `Selector "${selector}" doesn't match any elements.`);

        }
    }

    @FailIfNotLoaded
    public async value(selector: WendigoSelector): Promise<string | null> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLInputElement;
                if (!element) return Promise.reject();
                else if (element.value === undefined) return null;
                else return element.value;
            }, selector);
        } catch (err) {
            throw new QueryError("value", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async attribute(selector: WendigoSelector, attributeName: string): Promise<string | null> {
        try {
            return await this.evaluate((q, attr) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return element.getAttribute(attr);
            }, selector, attributeName);
        } catch (err) {
            throw new QueryError("attribute", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async styles(selector: WendigoSelector): Promise<{ [s: string]: string }> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                return WendigoUtils.getStyles(element);
            }, selector);
        } catch (err) {
            throw new QueryError("styles", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async style(selector: WendigoSelector, styleName: string): Promise<string> {
        try {
            return await this.styles(selector).then((styles) => {
                return styles[styleName];
            });
        } catch (err) {
            throw new QueryError("style", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async checked(selector: WendigoSelector): Promise<boolean | undefined> {
        try {
            return await this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q) as HTMLInputElement;
                if (!element) return Promise.reject();
                return element.checked;
            }, selector);
        } catch (err) {
            throw new QueryError("checked", `Element "${selector}" not found.`);
        }
    }

    @FailIfNotLoaded
    public async geolocation(): Promise<GeoLocationCoords> {
        const location = await this.evaluate(() => {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition((res) => {
                    resolve({ // NOTE: due to how getCurrentPosition works, all items must be taken one by one
                        accuracy: res.coords.accuracy,
                        altitude: res.coords.altitude,
                        altitudeAccuracy: res.coords.altitudeAccuracy,
                        heading: res.coords.heading,
                        latitude: res.coords.latitude,
                        longitude: res.coords.longitude,
                        speed: res.coords.speed,
                    });
                });
            });
        });
        return location;
    }

    @FailIfNotLoaded
    public async pdf(options?: PDFOptions | string): Promise<Buffer> {
        if (typeof options === 'string') {
            options = {
                path: options
            };
        }
        return this._page.pdf(options);
    }
}
