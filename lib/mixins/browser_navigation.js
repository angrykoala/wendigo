"use strict";

module.exports = function BrowserNavigationMixin(s) {
    return class BrowserNavigation extends s {
        back() {
            this._failIfNotLoaded();
            return this.page.goBack().then(() => {
                return this._afterPageLoad();
            });
        }

        forward() {
            this._failIfNotLoaded();
            return this.page.goForward().then(() => {
                return this._afterPageLoad();
            });
        }

        refresh() {
            this._failIfNotLoaded();
            return this.page.reload().then(() => {
                return this._afterPageLoad();
            });
        }

        waitForPageLoad() {
            return this.page.waitForNavigation({
                waitUntil: "domcontentloaded"
            }).then(() => {
                return this.page.waitFor(() => {
                    return Boolean(window.WendigoUtils); // Waits until wendigo utils is ready
                });
            });
        }
    };
};
