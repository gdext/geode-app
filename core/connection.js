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
        for (let i = 0; i < this.currentData.length; i++) {
            if (this.currentData[i] === 0x17) {
                let packet_data = this.currentData.slice(0, i);
                
                this.currentData = this.currentData.slice(i + 1, this.currentData.length);
                this.onPacketData(packet_data);
            }
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

        this.emit("connect");
    }

    onError(e) {
        this.emit("error", e);
    }

    sendString(str) {
        let buffer = Buffer.alloc(str.length + 1);

        buffer.write(str, 0);
        buffer.writeUInt8(0x17, str.length);

        console.log(str);

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