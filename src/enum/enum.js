const { isPlainObject } = require("lodash");

class Emun {
    #map = new Map();
    constructor(entries) {
        if (isPlainObject(entries)) {
            entries = Object.entries(entries);
        }
        this.#map(entries);
        for (const [key, value] of this.#map.entries()) {
            this.#map[key] = value;
        }
    }
    keys() {
        return this.#map.keys();
    }
}
module.exports = Emun;