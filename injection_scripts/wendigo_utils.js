/* global WendigoQuery */
"use strict";

if (!window.WendigoUtils) {
    window.WendigoUtils = {
        isVisible(element) {
            if (!element) return false;
            if (element === document) return true; // Top element, always visible
            const style = window.getComputedStyle(element);
            if (style.display === 'none') return false;
            if (style.visibility === 'hidden') return false;
            return this.isVisible(element.parentNode);
        },
        queryElement(selector) {
            return WendigoQuery.query(selector);
        },
        queryAll(selector) {
            return WendigoQuery.queryAll(selector);
        },
        xPathQuery(xPath) {
            return WendigoQuery.queryXPathAll(xPath);
        },
        getStyles(element) {
            const rawStyles = getComputedStyle(element);
            const result = {};
            for (let i = 0; i < rawStyles.length; i++) {
                const name = rawStyles[i];
                result[name] = rawStyles.getPropertyValue(name);
            }
            return result;
        }
    };
}
