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
            resource.off?.('onResourceChange', this.onResourceChange, this);
        }

        resource.on?.('onResourceChange', this.onResourceChange, this);

        this.resources[index] = resource;
        this.dirty = true;
    }

    getResource(index: number): BindResource
    {
        return this.resources[index];
    }

    destroy()
    {
        const resources = this.resources;

        for (const i in resources)
        {
            const resource = resources[i];

            resource.off?.('onResourceChange', this.onResourceChange, this);
        }

        this.resources = null;
    }

    onResourceChange()
    {
        this.dirty = true;
    }
}
