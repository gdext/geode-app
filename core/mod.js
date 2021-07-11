const Zip = require("adm-zip");
const fs = require("fs");

const path = require("path");

module.exports = class Mod {
    constructor(file, appData) {
        this.loaded = true;
        this.reason = "";

        this.appData = appData;

        if (!fs.existsSync(file)) {
            this.error("Could not find this mod");
            return;
        }

        this.zip = new Zip(file);
        this.config = null;

        let entries = this.zip.getEntries();

        for (let entry of entries) {
            if (entry.entryName == "config.json" && !entry.isDirectory)
                this.config = JSON.parse(entry.getData().toString("utf8"));
        }

        if (this.config == null) {
            this.error("This mod does not have a config file");
            return;
        }

        this.readConfig();
        if (!this.isLoaded()) return;

        let dllEntry = this.zip.getEntry(this.dllZip);

        if (dllEntry == null) {
            this.error("Could not find mod dll or invalid 'dll' property");
            return;
        }

        this.zipName = path.basename(file);
        this.dllPath = path.join(this.appData, '/temp/mods/');

        this.zip.extractEntryTo(this.dllZip, this.dllPath);

        fs.renameSync(path.join(this.dllPath, path.basename(this.dllZip)), path.join(this.dllPath, this.zipName + ".dll"));

        this.dllPath = path.join(this.dllPath, this.zipName + ".dll");
    }

    readConfig() {
        if (typeof this.config != "object") {
            this.error("Invalid config: config is not an object");
            return;
        }

        if (typeof this.config["name"] != "string") {
            this.error("Invalid config: property 'name' is not a string");
            return;
        }
        this.name = this.config["name"];

        if (typeof this.config["version"] != "string") {
            this.error("Invalid config: property 'version' is not a string");
            return;
        }
        this.version = this.config["version"];

        if (!Array.isArray(this.config["authors"]) &&
            typeof this.config["authors"] != "string") {
            this.error("Invalid config: property 'authors' is not an array or string");
            return;
        }

        if (Array.isArray(this.config["authors"]))
            for (let author of this.config["authors"])
                if (typeof author != "string") {
                    this.error("Invalid config: property 'authors' has non-string members");
                    return;
                }

        this.authors = typeof this.config["authors"] == "string" ?
            [ this.config["authors"] ] : this.config["authors"];

        if (typeof this.config["dll"] != "string") {
            this.error("Invalid config: property 'dll' is not a string");
            return;
        }

        this.dllZip = this.config["dll"];
    }

    error(message) {
        this.loaded = false;
        this.reason = message;
    }

    isLoaded() {
        return this.loaded;
    }

    getReason() {
        return this.reason;
    }
}