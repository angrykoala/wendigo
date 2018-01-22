"use strict";

window.GhoulUtils = {
    _serializer: new XMLSerializer(),
    serializeDom: function(domElement) {
        if(!domElement) return null;
        return this._serializer.serializeToString(domElement);
    },
    serializeNodeList: function(elements) {
        var result = [];  // eslint-disable-line
        for (var i = 0; i < elements.length; i++) { // eslint-disable-line
            result.push(this.serializeDom(elements[i]));
        }
        return result;
    },
    isVisible: function(element) {
        if(!element) return false;
        var style = window.getComputedStyle(element, ""); // eslint-disable-line
        if (style.display === 'none') return false;
        if (style.visibility === 'hidden') return false;
        else return true;
    },
    click: function(element) {
        var event = document.createEvent('MouseEvents'); // eslint-disable-line
        event.initMouseEvent('click', true, true, window, 1, 0, 0);
        element.dispatchEvent(event);
    },
    xPathQuery: function(xPath) {
        var xPathResult = document.evaluate(xPath, document, null, XPathResult.ANY_TYPE, null);// eslint-disable-line
        var result = [];// eslint-disable-line
        var r=xPathResult.iterateNext(); // eslint-disable-line
        while(r !== null) {
            result.push(r);
            r = xPathResult.iterateNext();
        }
        return result;
    }
};
