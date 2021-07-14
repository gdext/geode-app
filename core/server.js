const http = require('http');
const querystring = require('querystring');

module.exports = class ServerAPI {
    constructor(hostname, port) {
        this.hostname = hostname;
        this.port = port;
    }

    GET(path, params = {}) {
        let prms = new URLSearchParams();

        for (let [k, v] of Object.entries(params))
            prms.set(k, v);

        if (prms.toString() != '')
            path += '?' + prms.toString();

        const opts = {
            hostname: this.hostname,
            port: this.port,
            path: path,
            method: 'GET'
        };

        return new Promise((resolve, reject) => {
            let data = "";
            
            const req = http.request(opts, (res) => {
                console.log('RESPONSE');

                res.on('data', d => data += d);
                res.on('close', () => resolve(data));
            });

            req.on('error', reject);
            req.end();
        });
    }

    POST(path, params = {}) {
        let postData = querystring.stringify(params);

        const opts = {
            hostname: this.hostname,
            port: this.port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        return new Promise((resolve, reject) => {
            let data = "";
            
            const req = http.request(opts, res => {
                res.on('data', d => data += d);
                res.on('close', () => resolve(data));
            });

            req.on('error', reject);

            req.write(postData);
            req.end();
        });
    }

    search(query, page = null, limit = null) {
        return new Promise((resolve, reject) => {
            let params = {};

            if (page != null)  params.page  = page;
            if (limit != null) params.limit = limit;

            this.GET(`/mod/${encodeURIComponent(query)}`, params)
                .then(res => {
                    let data = JSON.parse(res);

                    if (typeof data != 'object' || Array.isArray(data))
                        throw new Error('Invalid response: data is not an object');

                    if (typeof data.code != 'number')
                        throw new Error('Invalid response: property `code` is not a number');

                    if (data.code != 200)
                        throw new Error('Server error: ' + data.message);

                    if (!Array.isArray(data.results))
                        throw new Error('Invalid response: property `results` is not an array');

                    resolve(data.results);
                })
                .catch(reject);
        });
    }
}