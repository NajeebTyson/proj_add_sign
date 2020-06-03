const winston = require('winston');

const newFormat = winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`);

module.exports = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(),
    winston.format.colorize({ all: true }),
    newFormat),
  transports: [
    new winston.transports.Console()
    // new winston.transports.File({ filename: 'logs/combined.log' })
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
});
