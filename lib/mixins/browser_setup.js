"use strict";

const path = require('path');
const ErrorFactory = require('../errors/error_factory');
const config = require('../../config');

const injectionScriptsPath = config.injectionScripts.path;
const injectionScripts = config.injectionScripts.files;

function pageLog(log) {
    console[log._type](log._text); // eslint-disable-line
}

module.exports = function BrowserSetupMixin(s) {
    return class BrowserSetup extends s {
        constructor(page, settings) {
            super(page, settings);
            this._loaded = false;
            if(settings.log) {
                this.page.on("console", pageLog);
            }
        }

        open(url) {
            return this.page.goto(url).then(() => {
                return this._afterPageLoad();
            }).catch(() => {
                return Promise.reject(ErrorFactory.generateFatalError(`Failed to open ${url}.`));
            });
        }

        close() {
            if(this._loaded === false) return Promise.resolve();
            this._loaded = false;
            this._originalHtml = undefined;
            return this.page.close().catch(() => {
                return Promise.reject(ErrorFactory.generateFatalError(`Failed to close browser.`));
            });
        }

        _failIfNotLoaded() {
            if(!this._loaded) {
                throw ErrorFactory.generateFatalError(`Cannot perform action before opening a page.`);
            }
        }

        _afterPageLoad() {
            return this.page.content().then((content) => {
                this._originalHtml = content;
                return this._addJsScripts().then(() => {
                    this._loaded = true;
                });
            });
        }

        _addJsScripts() {
            const promises = injectionScripts.map((s) => {
                return this.page.addScriptTag({path: path.join(injectionScriptsPath, s)});
            });
            return Promise.all(promises);
        }
    };
};
