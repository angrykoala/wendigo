"use strict";

const mix = require('./mix');
const BrowserCore = require('./browser_core');

const mixins = [
    require("./mixins/browser_base_mixin"),
    require("./mixins/browser_mixin")
];


module.exports = class BrowserFactory {
    static createBrowser(page, settings) {
        return new this.Browser(page, settings);
    }

    static get Browser() {
        if(!this._browser) {
            this._browser = this._createBrowserClass();
        }
        return this._browser;
    }

    static _createBrowserClass() {
        return class Browser extends mix(BrowserCore).with(...mixins) {

        };
    }
};
