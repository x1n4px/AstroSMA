const env = import.meta.env.MODE || 'development';
const shouldDebug = env === 'development' || env === 'test';

const serializeArg = arg => {
    if (arg instanceof Error) {
        return arg.stack || arg.message;
    }

    if (arg && typeof arg === 'object') {
        try {
            return JSON.stringify(arg);
        } catch (error) {
            return '[Unserializable object]';
        }
    }

    return arg;
};

const wrap = fn => (...args) => fn(...args.map(serializeArg));

export const logger = {
    debug: shouldDebug ? wrap(console.debug.bind(console)) : () => {},
    info: wrap(console.info.bind(console)),
    warn: wrap(console.warn.bind(console)),
    error: wrap(console.error.bind(console)),
    write: value => console.log(value)
};
