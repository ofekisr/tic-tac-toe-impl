"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClientMessage = isClientMessage;
exports.isServerMessage = isServerMessage;
// Type guards
function isClientMessage(msg) {
    if (typeof msg !== 'object' || msg === null) {
        return false;
    }
    if (!('type' in msg)) {
        return false;
    }
    const type = msg.type;
    if (type === 'join') {
        return 'gameCode' in msg && typeof msg.gameCode === 'string';
    }
    if (type === 'move') {
        const moveMsg = msg;
        return (typeof moveMsg.gameCode === 'string' &&
            typeof moveMsg.row === 'number' &&
            typeof moveMsg.col === 'number');
    }
    return false;
}
function isServerMessage(msg) {
    if (typeof msg !== 'object' || msg === null) {
        return false;
    }
    if (!('type' in msg)) {
        return false;
    }
    const type = msg.type;
    const validTypes = ['joined', 'update', 'win', 'draw', 'error'];
    return typeof type === 'string' && validTypes.includes(type);
}
//# sourceMappingURL=messages.js.map