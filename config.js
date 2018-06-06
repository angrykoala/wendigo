"use strict";
const path = require('path');

module.exports = {
    injectionScripts: {
        path: path.join(__dirname, "injection_scripts"),
        files: {
            WendigoQuery: "selector_query.js",
            WendigoUtils: "wendigo_utils.js"
        }
    }
};
