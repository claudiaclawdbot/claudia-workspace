"use strict";
/**
 * Winston Logger Configuration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
const { combine, timestamp, json, errors, printf, colorize } = winston_1.default.format;
// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
const logger = winston_1.default.createLogger({
    level: config_1.config.environment === 'production' ? 'info' : 'debug',
    defaultMeta: { service: 'x402-research-service' },
    transports: [
        // Console output
        new winston_1.default.transports.Console({
            format: combine(timestamp(), config_1.config.environment === 'production' ? json() : combine(colorize(), devFormat))
        }),
        // File output for production
        ...(config_1.config.environment === 'production' ? [
            new winston_1.default.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                format: combine(timestamp(), json())
            }),
            new winston_1.default.transports.File({
                filename: 'logs/combined.log',
                format: combine(timestamp(), json())
            })
        ] : [])
    ],
    exceptionHandlers: [
        new winston_1.default.transports.Console()
    ],
    rejectionHandlers: [
        new winston_1.default.transports.Console()
    ]
});
exports.logger = logger;
//# sourceMappingURL=logger.js.map