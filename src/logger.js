import winston from 'winston';

export default winston.createLogger({
	level: 'debug',
	transports: [
		new winston.transports.Console({
			handleExceptions: true,
			handleRejections: true,
		}),
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSSZ' }),
        // TODO filename.function:line
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level} ${message}`),
    ),
});