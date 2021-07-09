const net = require('net');
const { EventEmitter } = require('stream');

module.exports = class Connection extends EventEmitter {
    sendDataToSockets(data) {
        for (let s of this.sockets)
            s.write(data);
    }

    addToCurrentData(buffer) {
        this.currentData = Buffer.concat([
            this.currentData,
            buffer
        ]);
    }

    onPacketData(data) {
        this.emit("packet", JSON.parse(data.toString()));
    }

    checkForPackets() {
        while (true) {
            if (this.currentData.length >= 4) {
                let packet_length = this.currentData.readUInt32LE(0);

                if (this.currentData.length >= packet_length + 4) {
                    let packet_data = this.currentData.slice(4, packet_length + 4);
                
                    this.currentData = this.currentData.slice(packet_length + 4, this.currentData.length);
                    this.onPacketData(packet_data);
                } else return;
            } else return;
        }
    }

    onData(d) {
        this.addToCurrentData(d);
        this.checkForPackets();
    }
    
    onConnection(s) {
        this.sockets.push(s);

        s.on("data", this.onData.bind(this));
        s.on("error", this.onError.bind(this));

        if (this.packet_queue.length > 0) {
            for (let d of this.packet_queue)
                this.sendDataToSockets(d);
            
            this.packet_queue = [];
        }

        this.emit("connection");
    }

    onError(e) {
        this.emit("error", e);
    }

    sendString(str) {
        let buffer = Buffer.alloc(str.length + 4);

        buffer.writeUInt32LE(str.length, 0);
        buffer.write(str, 4);

        if (this.sockets.length > 0)
            this.sendDataToSockets(buffer);
        else
            this.packet_queue.push(buffer);
    }

    sendPacket(type, data) {
        data.type = type;
        this.sendString(JSON.stringify(data));
    }

    constructor(port) {
        super();

        this.port = port;

        this.packet_queue = [];
        this.connected = false;

        this.sockets = [];

        this.currentData = Buffer.alloc(0);

        this.server = net.createServer(this.onConnection.bind(this));
        this.server.listen(port);
    }
}