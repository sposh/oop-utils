// TODO Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect

function getAllNamesByDescriptorFilter(instance, descriptorFilter) {
    const properties = [];
    if (instance) {
        let currentPrototype = instance;
        while (currentPrototype !== null) {
            const descriptors = Object.getOwnPropertyDescriptors(currentPrototype);
            if (descriptorFilter) {
                properties.push(...Object.getOwnPropertyNames(descriptors).filter(value => descriptorFilter(descriptors, value)));
            } else {
                properties.push(...Object.getOwnPropertyNames(descriptors));
            }
            currentPrototype = Object.getPrototypeOf(currentPrototype); // TODO Make recursive instead of iterative
        }
    }
    const uniqueProperties = [...new Set(properties)];
    return uniqueProperties;
}

/**
 * Get all (including inherited) properties of an object
 */
export function getAllPropertyNames(instance) {
    return getAllNamesByDescriptorFilter(instance);
}

/**
 * Get all (including inherited) properties of an object that are functions
 */
export function getAllFunctionNames(instance) {
    return getAllNamesByDescriptorFilter(instance, (descriptors, value) => typeof descriptors[value].value === 'function');
}

/**
 * Get all (including inherited) properties of an object that are getters that don't begin with underscore
 */
 export function getAllGetterNames(instance) {
    return getAllNamesByDescriptorFilter(instance, (descriptors, value) => value.indexOf('_') !== 0 && typeof descriptors[value].get === 'function');
}