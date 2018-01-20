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
    }
};
