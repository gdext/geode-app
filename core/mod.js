const Zip = require("adm-zip");
const fs = require("fs");

const path = require("path");

module.exports = class Mod {
    constructor(file, modCache) {
        this.loaded = true;
        this.reason = "";

        this.modCache = modCache;

        this.zipName = path.basename(file);

        if (!fs.existsSync(file)) {
            this.error("Could not find this mod");
            return;
        }

        if (this.zipName.match(/\.dll$/g) != null) {
            this.name    = this.zipName;
            this.dllPath = file;
            return;
        }

        this.zip = new Zip(file);
        this.metadata = null;

        this.enabled = false;

        let entries = this.zip.getEntries();

        for (let entry of entries) {
            if (entry.entryName == "metadata.json" && !entry.isDirectory)
                this.metadata = JSON.parse(entry.getData().toString("utf8"));
        }

        if (this.metadata == null) {
            this.error("This mod does not have a metadata file");
            return;
        }

        this.readMetadata();
        if (!this.isLoaded()) return;

        let dllEntry = this.zip.getEntry(this.dllZip);

        if (dllEntry == null) {
            this.error("Could not find mod dll or invalid 'dll' property");
            return;
        }

        this.dllPath = this.modCache;

        this.zip.extractEntryTo(this.dllZip, this.dllPath);

        fs.renameSync(path.join(this.dllPath, path.basename(this.dllZip)), path.join(this.dllPath, this.zipName + ".dll"));

        this.dllPath = path.join(this.dllPath, this.zipName + ".dll");
    }

    readMetadata() {
        if (typeof this.metadata != "object") {
            this.error("Invalid metadata: metadata is not an object");
            return;
        }

        if (typeof this.metadata["name"] != "string") {
            this.error("Invalid metadata: property 'name' is not a string");
            return;
        }
        this.name = this.metadata["name"];

        if (typeof this.metadata["version"] != "string") {
            this.error("Invalid metadata: property 'version' is not a string");
            return;
        }
        this.version = this.metadata["version"];

        if (!Array.isArray(this.metadata["authors"]) &&
            typeof this.metadata["authors"] != "string") {
            this.error("Invalid metadata: property 'authors' is not an array or string");
            return;
        }

        if (Array.isArray(this.metadata["authors"]))
            for (let author of this.metadata["authors"])
                if (typeof author != "string") {
                    this.error("Invalid metadata: property 'authors' has non-string members");
                    return;
                }

        this.authors = typeof this.metadata["authors"] == "string" ?
            [ this.metadata["authors"] ] : this.metadata["authors"];

        if (typeof this.metadata["dll"] != "string") {
            this.error("Invalid metadata: property 'dll' is not a string");
            return;
        }

        this.dllZip = this.metadata["dll"];
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