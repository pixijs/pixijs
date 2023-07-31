import type { BindResource } from './BindResource';

export class BindGroup
{
    public resources: Record<string, BindResource>;
    public key: string;
    private _dirty = true;

    constructor(resources?: Record<string, BindResource>)
    {
        this.resources = {};

        let index = 0;

        for (const i in resources)
        {
            const resource: BindResource = resources[i];

            this.setResource(resource, index++);
        }

        this.updateKey();
    }

    public update()
    {
        this.updateKey();
    }

    public updateKey(): void
    {
        if (!this._dirty) return;

        this._dirty = false;

        const keyParts = [];
        let index = 0;

        // TODO - lets use big ints instead of strings...
        for (const i in this.resources)
        {
            // TODO make this consistent...
            keyParts[index++] = this.resources[i].resourceId;
        }

        this.key = keyParts.join('|');
    }

    public setResource(resource: BindResource, index: number): void
    {
        const currentResource = this.resources[index];

        if (resource === currentResource) return;

        if (currentResource)
        {
            resource.off?.('change', this.onResourceChange, this);
        }

        resource.on?.('change', this.onResourceChange, this);

        this.resources[index] = resource;
        this._dirty = true;
    }

    public getResource(index: number): BindResource
    {
        return this.resources[index];
    }

    public destroy()
    {
        const resources = this.resources;

        for (const i in resources)
        {
            const resource = resources[i];

            resource.off?.('change', this.onResourceChange, this);
        }

        this.resources = null;
    }

    protected onResourceChange()
    {
        this._dirty = true;
        this.update();
    }
}
