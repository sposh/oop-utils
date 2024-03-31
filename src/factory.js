// TODO Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
import logger from './logger.js';
import { getAllFunctionNames } from './reflection.js';

/**
 * Create an instance from a prototype or a class
 */
export function createInstance(prototype, ...params) { // TODO Test if this still works after Babel transpilation
    if (typeof prototype === 'function' && typeof prototype.constructor === 'function' && typeof prototype.prototype === 'object') {
        logger.debug(`utils.oop createInstance of ${prototype.name} with new`);
        return new prototype(...params);
    } else if (prototype !== null && typeof prototype === 'object' && typeof prototype.constructor === 'function' && typeof prototype.__proto__ === 'object') {
        logger.debug('utils.oop createInstance with Object.create');
        return Object.create(prototype, ...params);
    }
    logger.warn('utils.oop createInstance undefined');
}

// TODO: also overwrite getters, setters, properties & symbls/iterators; more tests in di project
// TODO JSDoc: for shift-right Promise 1st call needs to be to interface, subsequent could be to implementation; careful about race conditions: generally call await on all operations
export function createFromPrototype(basePrototype, resolver, ...params) {
    logger.debug('createFromPrototype');
    const prototype = resolver.call(resolver);
    const instance = createInstance(basePrototype);
    // TODO if (!instance) & (typeof prototype.then !== 'function') return createInstance (need to reorder control flow)
    let resolvedInstance;
    if (typeof prototype.then !== 'function') { // TODO Move promise to createInstance
        resolvedInstance = createInstance(prototype, ...params);
    }
    getAllFunctionNames(instance).forEach(functionName => { // TODO Use Proxy/Reflect if it works with private methods?
        if (typeof prototype.then === 'function') { // TODO Investigate why combination of Node/Jest/import/then returns false for prototype instanceof Promise
            logger.silly(`createFromPrototype create shifted promise overwriting method ${functionName}`);
            instance[functionName] = async function (...functionParams) { // TODO Does function name appear in logs and stack traces?
                logger.silly(`createFromPrototype create shifted promise called method ${functionName}`);
                if (resolvedInstance === undefined) {
                    logger.silly(`createFromPrototype create shifted promise called method promise return create new instance ${functionName}`);
                    resolvedInstance = createInstance(await prototype, ...params);
                }
                logger.silly(`createFromPrototype create shifted promise called promise resolves joined promise-promise ${functionName}`);
                if (typeof resolvedInstance[functionName] === 'function') {
                    return await resolvedInstance[functionName].call(resolvedInstance, ...functionParams); // Use Promise.allSettled?
                }
                throw new Error(`[@sposh/oop-utils]factory.createFromPrototype: expected basePrototype '${basePrototype.constructor ? basePrototype.constructor.name: basePrototype}' function '${functionName}' not implemented in resolvedInstance '${resolvedInstance.constructor ? resolvedInstance.constructor.name: resolvedInstance}'`);
            }
        } else {
            logger.silly(`createFromPrototype overwriting method ${functionName}`);
            instance[functionName] = function (...functionParams) { // TODO Does function name appear in logs and stack traces?
                if (typeof resolvedInstance[functionName] === 'function') {
                    return resolvedInstance[functionName].call(resolvedInstance, ...functionParams);
                }
                throw new Error(`[@sposh/oop-utils]factory.createFromPrototype: expected basePrototype '${basePrototype.constructor ? basePrototype.constructor.name: basePrototype}' function '${functionName}' not implemented in resolvedInstance '${prototype.constructor ? prototype.constructor.name: prototype}'`);
            }
        }
    });
    logger.debug('createFromPrototype create shifted promise');
    return instance;
}