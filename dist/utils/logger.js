"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger {
    constructor(component, logLevel = LogLevel.INFO) {
        this.component = component;
        this.logLevel = logLevel;
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') : '';
        return `[${timestamp}] [${level}] [${this.component}] ${message}${formattedArgs}`;
    }
    debug(message, ...args) {
        if (this.logLevel <= LogLevel.DEBUG) {
            console.debug(this.formatMessage('DEBUG', message, ...args));
        }
    }
    info(message, ...args) {
        if (this.logLevel <= LogLevel.INFO) {
            console.info(this.formatMessage('INFO', message, ...args));
        }
    }
    warn(message, ...args) {
        if (this.logLevel <= LogLevel.WARN) {
            console.warn(this.formatMessage('WARN', message, ...args));
        }
    }
    error(message, ...args) {
        if (this.logLevel <= LogLevel.ERROR) {
            console.error(this.formatMessage('ERROR', message, ...args));
        }
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    getLogLevel() {
        return this.logLevel;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map