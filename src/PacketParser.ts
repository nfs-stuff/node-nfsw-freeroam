const cloneBuffer = require('clone-buffer');

export interface ParsedPacket {
    header: Buffer;
    crc: Buffer;
    
    channelInfo: Buffer;
    playerInfo: Buffer;
    carState: Buffer;
    
    type: 'FULL_INFO' | 'CAR_STATE' | 'UNKNOWN';
}

export default function parse(data: Buffer) : ParsedPacket {
    const fullPacket:Buffer = cloneBuffer(data);
    const header = Buffer.alloc(16),
        crc = Buffer.alloc(4);
    let channelInfo: Buffer, playerInfo: Buffer, carState: Buffer;
    
    fullPacket.copy(header, 0, 0, 16);
    fullPacket.copy(crc, 0, fullPacket.length - 4, fullPacket.length);
    
    let subPacketStart = 16;
    let count = 0;
    
    while (fullPacket.readUInt8(subPacketStart) !== -1 && count < 4) {
        let subPacketLength = fullPacket.readUInt8(subPacketStart + 1) + 2;
        
        if (fullPacket.readUInt8(subPacketStart) == 0x00) {
            channelInfo = Buffer.alloc(subPacketLength);
            fullPacket.copy(channelInfo, 0, subPacketStart, subPacketStart = (subPacketStart + subPacketLength));
        }
        
        subPacketLength = fullPacket.readUInt8(subPacketStart + 1) + 2;

        if (fullPacket.readUInt8(subPacketStart) == 0x01) {
            playerInfo = Buffer.alloc(subPacketLength);
            fullPacket.copy(playerInfo, 0, subPacketStart, subPacketStart = (subPacketStart + subPacketLength));
        }
        
        subPacketLength = fullPacket.readUInt8(subPacketStart + 1) + 2;

        if (fullPacket.readUInt8(subPacketStart) == 0x12) {
            carState = Buffer.alloc(subPacketLength);
            fullPacket.copy(carState, 0, subPacketStart, subPacketStart = (subPacketStart + subPacketLength));
        }
        
        count++;
    }
    
    let value = {
        header,
        channelInfo,
        playerInfo,
        carState,
        crc,
        type: (channelInfo && playerInfo && carState) ? "FULL_INFO" : (carState) ? "CAR_STATE" : "UNKNOWN"
    };
    
    return <ParsedPacket> value;
}