var Resource = require('asset-loader').Resource,
    core = require('../core');

module.exports = function ()
{
    return function (resource, next)
    {
        // if no data, skip
        if (!resource.data) {
            next();
        }

        // if loaded with xhr as a blob, we need to transform the blob into an Image object
        // TODO: Need an 'affinity' property on the Resource that says 'image' 'binary' 'xml' etc...
        if (resource.loadType === Resource.LOAD_TYPE.XHR && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BLOB) {
            resource.data = new Image();
            resource.data.src = window.URL.createObjectURL(request.data);

            // cleanup the no longer used blob after the image loads
            resource.data.onload = function () {
                window.URL.revokeObjectURL(resource.data.src);
            }
        }

        // if this is an image object
        if (resource.data.nodeName && resource.data.nodeName.toLowerCase() === 'img')
        {
            resource.texture = new core.Texture(new core.BaseTexture(resource.data));
        }

        next();
    };
};
