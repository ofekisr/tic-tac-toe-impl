"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
// Error Code Enum
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_MESSAGE"] = "INVALID_MESSAGE";
    ErrorCode["GAME_NOT_FOUND"] = "GAME_NOT_FOUND";
    ErrorCode["GAME_FULL"] = "GAME_FULL";
    ErrorCode["INVALID_MOVE"] = "INVALID_MOVE";
    ErrorCode["NOT_YOUR_TURN"] = "NOT_YOUR_TURN";
    ErrorCode["CELL_OCCUPIED"] = "CELL_OCCUPIED";
    ErrorCode["INVALID_POSITION"] = "INVALID_POSITION";
    ErrorCode["GAME_ALREADY_FINISHED"] = "GAME_ALREADY_FINISHED";
    ErrorCode["CONNECTION_ERROR"] = "CONNECTION_ERROR";
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=errors.js.map