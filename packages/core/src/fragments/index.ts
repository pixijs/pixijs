import $defaultVertex from './default.vert';
import $defaultFilterVertex from './defaultFilter.vert';

/**
 * Default vertex shader
 * @memberof PIXI
 * @member {string} defaultVertex
 */

/**
 * Default filter vertex shader
 * @memberof PIXI
 * @member {string} defaultFilterVertex
 */

// NOTE: This black magic is so that @microsoft/api-extractor does not complain! This explicitly specifies the types
// of defaultVertex, defaultFilterVertex.
const defaultVertex: string = $defaultVertex;
const defaultFilterVertex: string = $defaultFilterVertex;

export { defaultVertex, defaultFilterVertex };
