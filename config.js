"use strict";
const path = require('path');

module.exports = {
    injectionScripts: {
        path: path.join(__dirname, "injection_scripts"),
        files: [
            "selector_query.js",
            "wendigo_utils.js",
            "selector_finder.js"
        ]
    }
};
