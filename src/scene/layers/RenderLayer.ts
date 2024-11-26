import { Container } from '../container/Container';

export interface RenderLayerOptions
{
    sortableChildren?: boolean;
    sortFunction?: (a: Container, b: Container) => number;
}

export class RenderLayer extends Container
{
    public static defaultOptions: RenderLayerOptions = {
        sortableChildren: false,
        sortFunction: (a, b) =>
            a.zIndex - b.zIndex,
    };

    public isRenderLayer = true;
    public sortFunction: (a: Container, b: Container) => number;

    public renderLayerChildren: Container[] = [];

    constructor(options: RenderLayerOptions = {})
    {
        options = { ...RenderLayer.defaultOptions, ...options };

        super();

        this.sortableChildren = options.sortableChildren;
        this.sortFunction = options.sortFunction;
    }

    public add(child: Container)
    {
        if (child.parentRenderLayer)
        {
            if (child.parentRenderLayer === this) return;

            this.remove(child);
        }

        this.renderLayerChildren.push(child);

        child.parentRenderLayer = this;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.structureDidChange = true;
        }
    }

    public remove(child: Container)
    {
        const index = this.renderLayerChildren.indexOf(child);

        if (index > -1)
        {
            this.renderLayerChildren.splice(index, 1);
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
        const layerChildren = this.renderLayerChildren;

        for (let i = 0; i < layerChildren.length; i++)
        {
            layerChildren[i].parentRenderLayer = null;
        }

        this.renderLayerChildren.length = 0;
    }

    public sortRenderLayerChildren()
    {
        this.renderLayerChildren.sort(this.sortFunction);
    }
}
