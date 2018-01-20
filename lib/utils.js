"use strict";
const DOMParser = require('xmldom').DOMParser;
const parser = new DOMParser();

module.exports = {
    parseDom(serializedDom) {
        if(!serializedDom) return null;
        const doc = parser.parseFromString(serializedDom, "application/xml");
        return doc.childNodes[0];
    }

};
