import { BaseTexture } from '@pixi/core';

BaseTexture.prototype.getDrawableSource = function getDrawableSource()
{
    const resource = this.resource;

    return resource ? (resource.bitmap || resource.source) : this.source;
};
