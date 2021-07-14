const fs = require('fs');

module.exports = class Config {
    constructor(config_path) {
        this.config_path = config_path;
        this.properties  = {};

        let data = null;

        try {
            data = fs.readFileSync(this.config_path);
        } catch(e) {}

        if (data) this.data = JSON.parse(data);
        else this.data = {};
    }

    defineProperty(name, type, defaultValue) {
        if (typeof this.data[name] != type) this.data[name] = defaultValue;

        this.properties[name] = type;
        this[name] = this.data[name] || defaultValue;
    }

    save() {
        for (let k of Object.keys(this.properties))
            this.data[k] = this[k];

        fs.writeFileSync(this.config_path, JSON.stringify(this.data));
    }
}