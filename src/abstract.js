/**
 * Default unimplemented method for "abstract" classes and interfaces.
 */
export function abstractMethod(name) {
    throw Error(`unimplemented abstract method${name ? ` ${name}` : ''}`);
};