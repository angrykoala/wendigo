"use strict";

const {WendigoError} = require('../../errors');

module.exports = class BrowserCookies {
    constructor(browser) {
        this._browser = browser;
    }

    all() {
        return this._browser.page.cookies().then((cookies) => {
            return cookies.reduce((acc, cookie) => {
                acc[cookie.name] = cookie.value;
                return acc;
            }, {});
        });
    }

    get(name) {
        return this.all().then((cookies) => {
            return cookies[name];
        });
    }

    set(name, value) {
        return this._browser.page.setCookie({
            name: name,
            value: value
        });
    }

    delete(name) {
        if (name === undefined || name === null) throw new WendigoError("cookies.delete", "Delete cookie name missing");
        if (!Array.isArray(name)) name = [name];
        const cookiesObjects = name.map((n) => {
            return {name: n};
        });
        return this._browser.page.deleteCookie(...cookiesObjects);
    }

    clear() {
        return this._browser.page.cookies().then((cookies) => {
            const cookiesList = cookies.map(c => c.name);
            if (cookiesList.length === 0) return Promise.resolve();
            return this.delete(cookiesList);
        });
    }
};
