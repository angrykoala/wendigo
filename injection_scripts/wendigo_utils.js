"use strict";

window.WendigoUtils = {
    isVisible(element) {
        if(!element) return false;
        let style = window.getComputedStyle(element, "");
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        else return true;
    },
    queryElement(selector) {
        if(typeof selector === 'string') {
            return document.querySelector(selector);
        } else return selector;
    },
    xPathQuery: function(xPath) {
        let xPathResult = document.evaluate(xPath, document, null, XPathResult.ANY_TYPE, null);
        let result = [];
        let r = xPathResult.iterateNext();
        while(r !== null) {
            result.push(r);
            r = xPathResult.iterateNext();
        }
        return result;
    }
};
