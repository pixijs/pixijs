import EventEmitter from 'eventemitter3';
import { RendererType } from '../../../../types';
import { BindGroup } from '../../gpu/shader/BindGroup';
import { RendererType } from '../../types';
import { UniformGroup } from './UniformGroup';

import type { GlProgram } from '../../gl/shader/GlProgram';
import type { BindResource } from '../../gpu/shader/BindResource';
import type { GpuProgram } from '../../gpu/shader/GpuProgram';

export type ShaderGroups = Record<number, BindGroup>;

export interface ShaderWithGroupsDescriptor
{
    glProgram?: GlProgram;
    gpuProgram?: GpuProgram;
    groups: ShaderGroups;
    groupMap?: Record<string, Record<string, any>>;
    compatibleRenderers?: number;
}

export interface ShaderWithResourcesDescriptor
{
    glProgram?: GlProgram;
    gpuProgram?: GpuProgram;
    resources: Record<string, any>;
    compatibleRenderers?: number;
}

interface GroupsData
{
    group: number
    binding: number
    name: string
}

type ShaderDescriptor = ShaderWithGroupsDescriptor & ShaderWithResourcesDescriptor;

export class Shader extends EventEmitter<{
    'destroy': Shader;
}>
{
    public gpuProgram: GpuProgram;
    public glProgram: GlProgram;

    public readonly compatibleRenderers;

    public groups: Record<number, BindGroup>;
    public resources: Record<string, any>;

    public uniformBindMap: Record<number, Record<number, string>> = {};

    constructor({ gpuProgram, glProgram, resources, compatibleRenderers }: ShaderWithResourcesDescriptor);
    constructor({ gpuProgram, glProgram, groups, groupMap, compatibleRenderers }: ShaderWithGroupsDescriptor);
    constructor({ gpuProgram, glProgram, groups, resources, groupMap, compatibleRenderers }: ShaderDescriptor)
    {
        super();

        this.gpuProgram = gpuProgram;
        this.glProgram = glProgram;

        if (compatibleRenderers === undefined)
        {
            compatibleRenderers = 0;

            if (gpuProgram)compatibleRenderers |= RendererType.WEBGPU;
            if (glProgram)compatibleRenderers |= RendererType.WEBGL;
        }

        this.compatibleRenderers = compatibleRenderers;

        const nameHash: Record<string, GroupsData> = {};

        if (resources && groups)
        {
            throw new Error('[Shader] Cannot have both resources and groups');
        }
        else if (!resources && !groups)
        {
            throw new Error('[Shader] Must provide either resources or groups descriptor');
        }
        else if (!gpuProgram && groups && !groupMap)
        {
            throw new Error('[Shader] No group map or WebGPU shader provided - consider using resources instead.');
        }
        else if (!gpuProgram && groups && groupMap)
        {
            for (const i in groupMap)
            {
                for (const j in groupMap[i])
                {
                    const uniformName = groupMap[i][j];

                    nameHash[uniformName] = {
                        group: i as unknown as number,
                        binding: j as unknown as number,
                        name: uniformName
                    };
                }
            }
        }
        else if (gpuProgram && groups && !groupMap)
        {
            const groupData = gpuProgram.structsAndGroups.groups;

            groupMap = {};

            groupData.forEach((data) =>
            {
                groupMap[data.group] = groupMap[data.group] || {};
                groupMap[data.group][data.binding] = data.name;

                nameHash[data.name] = data;
            });
        }
        else if (resources)
        {
            if (!gpuProgram)
            {
                // build out a dummy bind group..
                groupMap = {};
                groups = {
                    99: new BindGroup(),
                };

                let bindTick = 0;

                for (const i in resources)
                {
                    // Yes i know this is a little strange, but wil line up the shaders neatly
                    // basically we want to be driven by how webGPU does things.
                    // so making a fake group will work and not affect gpu as it means no gpu shader was provided..
                    nameHash[i] = { group: 99, binding: bindTick, name: i };

                    groupMap[99] = groupMap[99] || {};
                    groupMap[99][bindTick] = i;

                    bindTick++;
                }
            }
            else
            {
                const groupData = gpuProgram.structsAndGroups.groups;

                groupMap = {};

                groupData.forEach((data) =>
                {
                    groupMap[data.group] = groupMap[data.group] || {};
                    groupMap[data.group][data.binding] = data.name;

                    nameHash[data.name] = data;
                });
            }

            groups = {};

            for (const i in resources)
            {
                const name = i;
                let value = resources[i];

                if (!(value.source) && !(value as BindResource).resourceType)
                {
                    value = new UniformGroup(value);
                }

                const data = nameHash[name];

                if (data)
                {
                    groups[data.group] = groups[data.group] || new BindGroup();

                    groups[data.group].setResource(value, data.binding);
                }
            }
        }

        this.groups = groups;
        this.uniformBindMap = groupMap;

        this.resources = this._buildResourceAccessor(groups, nameHash);
    }

    public addResource(name: string, groupIndex: number, bindIndex: number): void
    {
        this.uniformBindMap[groupIndex] ||= {};

        this.uniformBindMap[groupIndex][bindIndex] ||= name;
    }

    private _buildResourceAccessor(groups: ShaderGroups, nameHash: Record<string, GroupsData>)
    {
        const uniformsOut = {};

        for (const i in nameHash)
        {
            const data = nameHash[i];

            // add getter setter for uniforms
            Object.defineProperty(uniformsOut, data.name, {
                get()
                {
                    return groups[data.group].getResource(data.binding);
                },
                set(value)
                {
                    groups[data.group].setResource(value, data.binding);
                }
            });
        }

        return uniformsOut;
    }

    public destroy(destroyProgram = false): void
    {
        this.emit('destroy', this);

        if (destroyProgram)
        {
            this.gpuProgram?.destroy();
            this.glProgram?.destroy();
        }

        this.gpuProgram = null;
        this.glProgram = null;

        this.groups = null;

        this.removeAllListeners();

        this.uniformBindMap = null;

        this.resources = null;
    }
}
