import type { BindResource } from './BindResource';

export class BindGroup
{
    resources: Record<string, BindResource>;

    usageTick = 0;
    key: string;
    private dirty = true;

    constructor(resources?: Record<string, BindResource>)
    {
        this.resources = resources || {};

        let index = 0;

        for (const i in resources)
        {
            const resource: BindResource = resources[i];

            this.setResource(resource, index++);
        }

        this.updateKey();
    }

    update()
    {
        this.updateKey();
    }

    updateKey(): void
    {
        if (!this.dirty) return;

        this.dirty = false;

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

    setResource(resource: BindResource, index: number): void
    {
        const currentResource = this.resources[index];

        if (resource === currentResource) return;

        if (currentResource)
        {
            resource.onResourceChange?.remove(this);
        }

        resource.onResourceChange?.add(this);

        this.resources[index] = resource;
        this.dirty = true;
    }

    getResource(index: number): BindResource
    {
        return this.resources[index];
    }

    onSourceResize()
    {
        this.dirty = true;
    }

    onStyleUpdate()
    {
        this.dirty = true;
    }

    destroy()
    {
        const resources = this.resources;

        for (const i in resources)
        {
            const resource = resources[i];

            resource.onResourceChange?.remove(this);
        }

        this.resources = null;
    }
}
