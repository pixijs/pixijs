import mapType from './mapType';
import mapSize from './mapSize';

/**
 * Extracts the attributes
 * @method extractAttributes
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param program {WebGLProgram} The shader program to get the attributes from
 * @return attributes {Object}
 */
export default function extractAttributes(gl, program)
{
    const attributes = {};

    const totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < totalAttributes; i++)
    {
        const attribData = gl.getActiveAttrib(program, i);
        const type = mapType(gl, attribData.type);

        attributes[attribData.name] = {
            type,
            size: mapSize(type),
            location: gl.getAttribLocation(program, attribData.name),
            // TODO - make an attribute object
            pointer,
        };
    }

    return attributes;
}

function pointer()// type, normalized, stride, start)
{
    // gl.vertexAttribPointer(this.location, this.size, type || gl.FLOAT, normalized || false, stride || 0, start || 0);
}
