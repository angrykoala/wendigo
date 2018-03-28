"use strict";


module.exports = class FactoryCore {

    static addComponents(core, components) {
        for(const name in components) {
            this.addModule(core, name, components[name]);
        }

    }

    static addModule(core, name, Component) {
        const instance = new Component(core);
        this.attachModule(core, name, instance);
    }

    static attachModule(core, name, instance) {
        const privateName = `_${name}`;
        core[privateName] = instance;
        Object.defineProperty(core, name, {
            get: function() {
                return core[privateName];
            }
        });
    }

};
