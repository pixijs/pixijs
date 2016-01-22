var = renderWebGL = function (renderer, sprite)
{
    if(this.textureDirty)
    {
        this.textureDirty = false;

        this._onTextureUpdate();
        
        this.vertexDirty = true;
    }

    if(this.vertexDirty)
    {
        this.vertexDirty = false;

        // set the vertex data
        this.caclulateVertices();

    }
    
    renderer.setObjectRenderer(renderer.plugins.sprite);
    renderer.plugins.sprite.render(this);
};
