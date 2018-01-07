import { BaseTexture } from '@pixi/core';

BaseTexture.prototype.getCanvasSource = function getCanvasSource()
{
    const resource = this.resource;

    return resource ? (resource.bitmap || resource.source) : this.source;
};
