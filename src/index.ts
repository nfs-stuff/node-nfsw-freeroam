import * as dgram from 'dgram';
import parsePacket, {ParsedPacket} from './PacketParser';

const udpSocket = dgram.createSocket('udp4');

udpSocket.bind(9999, () => {
    console.info('socket listening');
});

udpSocket.on('message', (msg, rinfo) => {
    if (msg.readUInt8(0) === 0x00 && msg.readUInt8(2) === 0x06) {
        // console.log(`hello from ${rinfo.address}:${rinfo.port}`);

        const helloBuffer: Buffer = Buffer.alloc(11);
        const helloTmp = [
            msg.readUInt8(3),
            msg.readUInt8(4),
            msg.readUInt8(5),
            msg.readUInt8(6),
        ];

        helloBuffer.writeUInt8(0x00, 0);
        helloBuffer.writeUInt8(0x00, 1);
        helloBuffer.writeUInt8(0x01, 2);
        // 4 hello bytes
        helloBuffer.writeUInt8(helloTmp[0], 3);
        helloBuffer.writeUInt8(helloTmp[1], 4);
        helloBuffer.writeUInt8(helloTmp[2], 5);
        helloBuffer.writeUInt8(helloTmp[3], 6);
        // 4 0x01
        helloBuffer.writeUInt8(0x01, 7);
        helloBuffer.writeUInt8(0x01, 8);
        helloBuffer.writeUInt8(0x01, 9);
        helloBuffer.writeUInt8(0x01, 10);

        udpSocket.send(helloBuffer, rinfo.port, rinfo.address);
    } else {
        
    }
});

function badHexToReadableHex(text: string) {
    return text.replace(/(..)/g, '$1:').slice(0, -1);
}