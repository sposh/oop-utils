// TODO Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
import logger from './logger';
import { getAllFunctionNames } from './reflection';

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

// TODO JSDoc: for shift-right Promise 1st call needs to be to interface, subsequent could be to implementation
export function createFromPrototype(basePrototype, resolver, ...params) {
    logger.debug('createFromPrototype');
    const prototype = resolver.call(resolver);
    if (typeof prototype.then === 'function') { // TODO Investigate why combination of Node/Jest/import/then returns false for prototype instanceof Promise
        if (basePrototype) {
            let instance = createInstance(basePrototype);
            let resolvedInstance;
            getAllFunctionNames(instance).forEach(functionName => { // TODO Use Proxy/Reflect if it works with private methods?
                logger.silly(`createFromPrototype create shifted promise overwriting method ${functionName}`);
                instance[functionName] = async function (...functionParams) { // TODO Does function name appear in logs and stack traces?
                    logger.silly(`createFromPrototype create shifted promise called method ${functionName}`);
                    if (resolvedInstance === undefined) { // FIXME Creates new instances until resolved
                        logger.silly(`createFromPrototype create shifted promise called method promise return create new instance ${functionName}`);
                        resolvedInstance = createInstance(await prototype, ...params);
                    }
                    logger.silly(`createFromPrototype create shifted promise called promise resolves joined promise-promise ${functionName}`);
                    return await resolvedInstance[functionName].call(resolvedInstance, ...functionParams); // Use Promise.allSettled?
                }
                /* instance[functionName] = function (...params) { // TODO Does function name appear in logs and stack traces?
                    // TODO Might improve readability if we extract this to a separate async function
                    return new Promise(resolve => prototype.then(resolvedPrototype => { // TODO Promise reject?
                        if (resolvedInstance === undefined) {
                            resolvedInstance = createInstance(resolvedPrototype, ...params);
                            instance = { ...resolvedInstance, ...instance }; // TODO Do we need deep merge?
                        }
                        const originalReturn = resolvedInstance[functionName].call(resolvedInstance, ...params);
                        if (originalReturn instanceof Promise) {
                            originalReturn.then(resolvedReturn => resolve(resolvedReturn));
                        } else {
                            resolve(originalReturn);
                        }
                    }));
                } */ // TODO Delete
            });
            logger.debug('createFromPrototype create shifted promise');
            return instance;
            // TODO Delete
            // return (async () => createInstance(await prototype, ...params))();
            // // return new Promise(resolve => prototype.then(resolvedPrototype => resolve(createInstance(resolvedPrototype, ...params)))); // TODO Delete
        } else {
            return async function() {
                logger.debug('createFromPrototype create unshifted promise');
                return createInstance(await prototype, ...params);
            }();
        }
    }
    logger.debug('createFromPrototype create non-promise');
    return createInstance(prototype, ...params);
}