import { Container } from '../container/Container';

export class RenderLayer extends Container
{
    public isLayer = true;

    public layerChildren: Container[] = [];

    public add(child: Container)
    {
        if (child.parentRenderLayer)
        {
            if (child.parentRenderLayer === this) return;

            this.remove(child);
        }

        this.layerChildren.push(child);

        child.parentRenderLayer = this;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.structureDidChange = true;
        }
    }

    public remove(child: Container)
    {
        const index = this.layerChildren.indexOf(child);

        if (index > -1)
        {
            this.layerChildren.splice(index, 1);
        }

        child.parentRenderLayer = null;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.structureDidChange = true;
        }
    }

    public removeAll()
    {
        const layerChildren = this.layerChildren;

        for (let i = 0; i < layerChildren.length; i++)
        {
            layerChildren[i].parentRenderLayer = null;
        }

        this.layerChildren.length = 0;
    }
}
