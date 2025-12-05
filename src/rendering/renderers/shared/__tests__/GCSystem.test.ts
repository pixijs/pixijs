import { type NOOP } from '../../../../utils/misc/NOOP';
import { GCSystem } from '../GCSystem';

import type { Renderer } from '../../types';
import type { GCable, GCSystemOptions } from '../GCSystem';

// Mock resource that implements GCable interface
function createMockResource(options: Partial<GCable> = {}): GCable & { once: jest.Mock; off: jest.Mock; unload: jest.Mock }
{
    const mockResource: GCable & { once: jest.Mock; off: jest.Mock; unload: jest.Mock; } = {
        _gpuData: {},
        _onTouch: jest.fn().mockImplementation((now: number) =>
        {
            mockResource._gcLastUsed = now;
        }),
        autoGarbageCollect: true,
        _gcLastUsed: -1,
        _gcData: null,
        unload: jest.fn() as any,
        once: jest.fn(),
        off: jest.fn(),
        ...options,
    };

    return mockResource;
}

// Mock renderer with scheduler
function createMockRenderer(): Renderer
{
    let handlerId = 1;
    const handlers = new Map<number, typeof NOOP>();

    return {
        scheduler: {
            repeat: jest.fn((callback: () => void, _frequency: number) =>
            {
                const id = handlerId++;

                handlers.set(id, callback);

                return id;
            }),
            cancel: jest.fn((id: number) =>
            {
                handlers.delete(id);
            }),
        },
        tick: 0,
        // Helper to trigger scheduler callbacks in tests
        _triggerScheduler: (id: number) =>
        {
            handlers.get(id)?.();
        },
    } as unknown as Renderer;
}

describe('GCSystem', () =>
{
    let gcSystem: GCSystem;
    let renderer: ReturnType<typeof createMockRenderer>;

    beforeEach(() =>
    {
        renderer = createMockRenderer();
        gcSystem = new GCSystem(renderer as Renderer);
    });

    afterEach(() =>
    {
        gcSystem.destroy();
    });

    describe('constructor', () =>
    {
        it('should create a new instance', () =>
        {
            expect(gcSystem).toBeInstanceOf(GCSystem);
        });
    });

    describe('init', () =>
    {
        it('should initialize with default options', () =>
        {
            gcSystem.init({} as GCSystemOptions);

            expect(gcSystem.maxUnusedTime).toBe(GCSystem.defaultOptions.gcMaxUnusedTime);
            expect(gcSystem.enabled).toBe(GCSystem.defaultOptions.gcActive);
        });

        it('should initialize with custom options', () =>
        {
            gcSystem.init({
                gcActive: false,
                gcMaxUnusedTime: 30000,
                gcFrequency: 5000,
            });

            expect(gcSystem.maxUnusedTime).toBe(30000);
            expect(gcSystem.enabled).toBe(false);
        });

        it('should override default options with provided options', () =>
        {
            gcSystem.init({
                gcActive: true,
                gcMaxUnusedTime: 120000,
                gcFrequency: 20000,
            });

            expect(gcSystem.maxUnusedTime).toBe(120000);
        });
    });

    describe('enabled', () =>
    {
        it('should return false when not initialized', () =>
        {
            expect(gcSystem.enabled).toBe(false);
        });

        it('should return true after enabling', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });

            expect(gcSystem.enabled).toBe(true);
        });

        it('should schedule repeat when enabled', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });

            expect(renderer.scheduler.repeat).toHaveBeenCalled();
        });

        it('should cancel scheduler when disabled', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
            gcSystem.enabled = false;

            expect(renderer.scheduler.cancel).toHaveBeenCalled();
            expect(gcSystem.enabled).toBe(false);
        });

        it('should be able to re-enable after disabling', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
            gcSystem.enabled = false;
            gcSystem.enabled = true;

            expect(gcSystem.enabled).toBe(true);
            expect(renderer.scheduler.repeat).toHaveBeenCalledTimes(2);
        });

        it('should not double-enable if already enabled', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
            gcSystem.enabled = true;

            expect(renderer.scheduler.repeat).toHaveBeenCalledTimes(1);
        });

        it('should not double-disable if already disabled', () =>
        {
            gcSystem.init({ gcActive: false, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
            gcSystem.enabled = false;

            expect(renderer.scheduler.cancel).not.toHaveBeenCalled();
        });
    });

    describe('addResource', () =>
    {
        beforeEach(() =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
        });

        it('should add a resource and set up GC data', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');

            expect(resource._gcData).not.toBeNull();
            expect(resource._gcData?.type).toBe('resource');
            expect(resource._gcData?.index).toBe(0);
        });

        it('should register unload listener', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');

            expect(resource.once).toHaveBeenCalledWith('unload', gcSystem.removeResource, gcSystem);
        });

        it('should touch existing resource if already tracked', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');
            const originalLastUsed = resource._gcLastUsed;

            // Wait a tiny bit to ensure time difference
            const laterTime = (originalLastUsed ?? 0) + 100;

            gcSystem.now = laterTime;

            gcSystem.addResource(resource, 'resource');

            expect(resource._gcLastUsed).toBe(laterTime);

            jest.restoreAllMocks();
        });

        it('should track multiple resources with correct indices', () =>
        {
            const resource1 = createMockResource();
            const resource2 = createMockResource();
            const resource3 = createMockResource();

            gcSystem.addResource(resource1, 'resource');
            gcSystem.addResource(resource2, 'resource');
            gcSystem.addResource(resource3, 'resource');

            expect(resource1._gcData?.index).toBe(0);
            expect(resource2._gcData?.index).toBe(1);
            expect(resource3._gcData?.index).toBe(2);
        });
    });

    describe('removeResource', () =>
    {
        beforeEach(() =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
        });

        it('should remove a resource and clear GC data', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');
            gcSystem.removeResource(resource);

            expect(resource._gcData).toBeNull();
        });

        it('should do nothing if resource is not tracked', () =>
        {
            const resource = createMockResource();

            // Should not throw
            expect(() => gcSystem.removeResource(resource)).not.toThrow();
        });

        it('should perform O(1) removal by swapping with last element', () =>
        {
            const resource1 = createMockResource();
            const resource2 = createMockResource();
            const resource3 = createMockResource();

            gcSystem.addResource(resource1, 'resource');
            gcSystem.addResource(resource2, 'resource');
            gcSystem.addResource(resource3, 'resource');

            // Remove first resource
            gcSystem.removeResource(resource1);

            // resource3 should have been swapped to index 0
            expect(resource3._gcData?.index).toBe(0);
            expect(resource2._gcData?.index).toBe(1);
        });

        it('should handle removing last element correctly', () =>
        {
            const resource1 = createMockResource();
            const resource2 = createMockResource();

            gcSystem.addResource(resource1, 'resource');
            gcSystem.addResource(resource2, 'resource');

            gcSystem.removeResource(resource2);

            expect(resource1._gcData?.index).toBe(0);
            expect(resource2._gcData).toBeNull();
        });
    });

    describe('touch', () =>
    {
        beforeEach(() =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
        });

        it('should update lastUsed timestamp', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');
            const originalLastUsed = resource._gcLastUsed;

            const laterTime = (originalLastUsed ?? 0) + 1000;

            gcSystem.now = laterTime;

            resource._gcLastUsed = laterTime;

            expect(resource._gcLastUsed).toBe(laterTime);

            jest.restoreAllMocks();
        });

        it('should call _onTouch callback if defined', () =>
        {
            const onTouch = jest.fn();
            const resource = createMockResource({ _onTouch: onTouch });

            gcSystem.addResource(resource, 'resource');
            resource._gcLastUsed = renderer.tick;

            expect(onTouch).toHaveBeenCalled();
        });
    });

    describe('run', () =>
    {
        beforeEach(() =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 1000, gcFrequency: 100 });
        });

        it('should keep recently used resources', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');
            gcSystem.run();

            expect(resource.unload).not.toHaveBeenCalled();
            expect(resource._gcData).not.toBeNull();
        });

        it('should garbage collect old resources', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');

            // Simulate resource being old
            resource._gcLastUsed = gcSystem.now - 2000;

            gcSystem.run();

            expect(resource.unload).toHaveBeenCalled();
            expect(resource._gcData).toBeNull();
        });

        it('should not garbage collect resources with autoGarbageCollect disabled', () =>
        {
            const resource = createMockResource({ autoGarbageCollect: false });

            gcSystem.addResource(resource, 'resource');

            // Simulate resource being old
            resource._gcLastUsed = gcSystem.now - 2000;

            gcSystem.run();

            expect(resource.unload).not.toHaveBeenCalled();
            expect(resource._gcData).not.toBeNull();
        });

        it('should update indices after garbage collection', () =>
        {
            const resource1 = createMockResource();
            const resource2 = createMockResource();
            const resource3 = createMockResource();

            gcSystem.addResource(resource1, 'resource');
            gcSystem.addResource(resource2, 'resource');
            gcSystem.addResource(resource3, 'resource');

            // Make middle resource old
            resource2._gcLastUsed = gcSystem.now - 2000;

            gcSystem.run();

            expect(resource2.unload).toHaveBeenCalled();
            expect(resource1._gcData?.index).toBe(0);
            expect(resource3._gcData?.index).toBe(1);
        });

        it('should remove unload listener when garbage collecting', () =>
        {
            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');
            resource._gcLastUsed = gcSystem.now - 2000;

            gcSystem.run();

            expect(resource.off).toHaveBeenCalledWith('unload', gcSystem.removeResource, gcSystem);
        });
    });

    describe('addResourceHash', () =>
    {
        beforeEach(() =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 1000, gcFrequency: 100 });
        });

        it('should add a resource hash entry', () =>
        {
            const context = { myHash: {} };

            gcSystem.addResourceHash(context, 'myHash', 'resource');

            // Run GC to verify hash is being processed
            gcSystem.run();

            // No errors should occur
            expect(true).toBe(true);
        });

        it('should sort hash entries by priority', () =>
        {
            const context1 = { hash1: {} };
            const context2 = { hash2: {} };
            const context3 = { hash3: {} };

            gcSystem.addResourceHash(context1, 'hash1', 'resource', 10);
            gcSystem.addResourceHash(context2, 'hash2', 'resource', 5);
            gcSystem.addResourceHash(context3, 'hash3', 'resource', 15);

            // Access private array to verify sorting
            const hashes = (gcSystem as any)._managedResourceHashes;

            expect(hashes[0].priority).toBe(5);
            expect(hashes[1].priority).toBe(10);
            expect(hashes[2].priority).toBe(15);
        });
    });

    describe('runOnHash', () =>
    {
        beforeEach(() =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 1000, gcFrequency: 100 });
        });

        it('should initialize GC data for new resources in hash', () =>
        {
            const resource = createMockResource();
            const context = { myHash: { key1: resource } };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            expect(resource._gcLastUsed).not.toBe(-1);
        });

        it('should garbage collect old resources from hash', () =>
        {
            const resource = createMockResource();

            resource._gcData = {
                type: 'resource',
            };
            resource._gcLastUsed = gcSystem.now - 2000;

            const context = { myHash: { key1: resource } };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            expect(resource.unload).toHaveBeenCalled();
            // Resource entry is set to null (lazy cleanup - hash not replaced until threshold)
            expect(context.myHash.key1).toBeNull();
        });

        it('should keep recently used resources in hash', () =>
        {
            const resource = createMockResource();

            resource._gcData = {
                type: 'resource',
            };
            resource._gcLastUsed = gcSystem.now;

            const context = { myHash: { key1: resource } };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            expect(resource.unload).not.toHaveBeenCalled();
            expect(context.myHash.key1).toBe(resource);
        });

        it('should skip null entries in hash', () =>
        {
            const resource = createMockResource();
            const context = {
                myHash: {
                    key1: null,
                    key2: resource,
                } as Record<string, GCable | null>,
            };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            expect(resource._gcLastUsed).not.toBe(-1);
        });

        it('should not replace hash if nothing changed', () =>
        {
            const resource = createMockResource();

            resource._gcData = {
                type: 'resource',
            };
            resource._gcLastUsed = gcSystem.now;

            const originalHash = { key1: resource };
            const context = { myHash: originalHash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should be the same object (not replaced)
            expect(context.myHash).toBe(originalHash);
        });

        it('should set entry to null when resource is garbage collected (lazy cleanup)', () =>
        {
            const resource1 = createMockResource();
            const resource2 = createMockResource();

            resource1._gcData = {
                type: 'resource',
            };
            resource1._gcLastUsed = gcSystem.now - 2000;
            resource2._gcData = {
                type: 'resource',
            };
            resource2._gcLastUsed = gcSystem.now;

            const originalHash: Record<string, GCable | null> = { key1: resource1, key2: resource2 };
            const context = { myHash: originalHash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should be the same object (entries set to null, not replaced)
            expect(context.myHash).toBe(originalHash);
            // GC'd resource entry is set to null
            expect(context.myHash.key1).toBeNull();
            // Active resource remains
            expect(context.myHash.key2).toBe(resource2);
        });

        it('should not garbage collect resources with autoGarbageCollect disabled in hash', () =>
        {
            const resource = createMockResource({ autoGarbageCollect: false });

            resource._gcData = {
                type: 'resource',
            };
            resource._gcLastUsed = gcSystem.now - 2000;

            const context = { myHash: { key1: resource } };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            expect(resource.unload).not.toHaveBeenCalled();
            expect(context.myHash.key1).toBe(resource);
        });
    });

    describe('destroy', () =>
    {
        it('should disable GC', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });
            gcSystem.destroy();

            expect(gcSystem.enabled).toBe(false);
        });

        it('should remove all event listeners from resources', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });

            const resource1 = createMockResource();
            const resource2 = createMockResource();

            gcSystem.addResource(resource1, 'resource');
            gcSystem.addResource(resource2, 'resource');

            gcSystem.destroy();

            expect(resource1.off).toHaveBeenCalledWith('unload', gcSystem.removeResource, gcSystem);
            expect(resource2.off).toHaveBeenCalledWith('unload', gcSystem.removeResource, gcSystem);
        });

        it('should clear managed resources array', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });

            const resource = createMockResource();

            gcSystem.addResource(resource, 'resource');
            gcSystem.destroy();

            const managedResources = (gcSystem as any)._managedResources;

            expect(managedResources.length).toBe(0);
        });

        it('should clear managed resource hashes array', () =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 60000, gcFrequency: 10000 });

            const context = { myHash: {} };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.destroy();

            const managedHashes = (gcSystem as any)._managedResourceHashes;

            expect(managedHashes.length).toBe(0);
        });
    });

    describe('lazy hash replacement', () =>
    {
        beforeEach(() =>
        {
            gcSystem.init({ gcActive: true, gcMaxUnusedTime: 1000, gcFrequency: 100 });
        });

        it('should set GC\'d entry to null instead of replacing hash (below threshold)', () =>
        {
            const resource = createMockResource();

            resource._gcData = {
                type: 'resource',
            };
            resource._gcLastUsed = gcSystem.now - 2000;

            const originalHash: Record<string, GCable | null> = { key1: resource };
            const context = { myHash: originalHash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should NOT be replaced (same object reference)
            expect(context.myHash).toBe(originalHash);
            // Entry should be set to null
            expect(context.myHash.key1).toBeNull();
        });

        it('should not replace hash when GC\'d resources are below 10,000 threshold', () =>
        {
            const hash: Record<string, GCable | null> = {};

            // Add 100 resources that will be GC'd
            for (let i = 0; i < 100; i++)
            {
                const resource = createMockResource();

                resource._gcData = {
                    type: 'resource',
                };
                resource._gcLastUsed = performance.now() - 2000;
                hash[`old_${i}`] = resource;
            }

            // Add one valid resource
            const validResource = createMockResource();

            validResource._gcData = { type: 'resource' };
            validResource._gcLastUsed = performance.now();
            hash.valid = validResource;

            const context = { myHash: hash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should NOT be replaced
            expect(context.myHash).toBe(hash);
            // Old entries should be null
            expect(context.myHash.old_0).toBeNull();
            expect(context.myHash.old_99).toBeNull();
            // Valid resource remains
            expect(context.myHash.valid).toBe(validResource);
        });

        it('should replace hash when existing null entries reach 10,000 threshold', () =>
        {
            const hash: Record<string, GCable | null> = {};

            // Add 10,000 null entries
            for (let i = 0; i < 10000; i++)
            {
                hash[`null_${i}`] = null;
            }

            // Add one valid resource
            const resource = createMockResource();

            resource._gcData = { type: 'resource' };
            resource._gcLastUsed = performance.now();
            hash.valid = resource;

            const context = { myHash: hash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should be replaced (cleaned up)
            expect(context.myHash).not.toBe(hash);
            // Only the valid resource should remain
            expect(Object.keys(context.myHash).length).toBe(1);
            expect(context.myHash.valid).toBe(resource);
        });

        it('should replace hash when GC\'d resources cause null count to reach threshold', () =>
        {
            const hash: Record<string, GCable | null> = {};

            // Add 9,999 existing null entries (just below threshold)
            for (let i = 0; i < 9999; i++)
            {
                hash[`null_${i}`] = null;
            }

            // Add one resource that will be GC'd (this will push count to 10,000)
            const oldResource = createMockResource();

            oldResource._gcData = {
                type: 'resource',
            };
            oldResource._gcLastUsed = performance.now() - 2000;
            hash.old = oldResource;

            // Add one valid resource
            const validResource = createMockResource();

            validResource._gcData = { type: 'resource' };
            validResource._gcLastUsed = performance.now();
            hash.valid = validResource;

            const context = { myHash: hash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should be replaced when threshold is reached
            expect(context.myHash).not.toBe(hash);
            // Old resource should be cleaned up (not in new hash)
            expect('old' in context.myHash).toBe(false);
            // Valid resource should remain
            expect(context.myHash.valid).toBe(validResource);
            // Null entries should be cleaned up
            expect(Object.keys(context.myHash).length).toBe(1);
        });

        it('should accumulate null count from both existing nulls and GC\'d resources', () =>
        {
            const hash: Record<string, GCable | null> = {};

            // Add 5,000 existing null entries
            for (let i = 0; i < 5000; i++)
            {
                hash[`null_${i}`] = null;
            }

            // Add 5,000 resources that will be GC'd
            for (let i = 0; i < 5000; i++)
            {
                const resource = createMockResource();

                resource._gcData = {
                    type: 'resource',
                };
                resource._gcLastUsed = performance.now() - 2000;
                hash[`old_${i}`] = resource;
            }

            // Add one valid resource at the end
            const validResource = createMockResource();

            validResource._gcData = { type: 'resource' };
            validResource._gcLastUsed = performance.now();
            hash.valid = validResource;

            const context = { myHash: hash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should be replaced (5000 nulls + 5000 GC'd = 10000)
            expect(context.myHash).not.toBe(hash);
            // Only valid resource should remain
            expect(Object.keys(context.myHash).length).toBe(1);
            expect(context.myHash.valid).toBe(validResource);
        });

        it('should not replace hash when total nulls stay below threshold', () =>
        {
            const hash: Record<string, GCable | null> = {};

            // Add 4,999 existing null entries
            for (let i = 0; i < 4999; i++)
            {
                hash[`null_${i}`] = null;
            }

            // Add 4,999 resources that will be GC'd (total: 9,998, below threshold)
            for (let i = 0; i < 4999; i++)
            {
                const resource = createMockResource();

                resource._gcData = {
                    type: 'resource',
                };
                resource._gcLastUsed = performance.now() - 2000;
                hash[`old_${i}`] = resource;
            }

            // Add one valid resource
            const validResource = createMockResource();

            validResource._gcData = { type: 'resource' };
            validResource._gcLastUsed = performance.now();
            hash.valid = validResource;

            const context = { myHash: hash };

            gcSystem.addResourceHash(context, 'myHash', 'resource');
            gcSystem.run();

            // Hash should NOT be replaced (9,998 < 10,000)
            expect(context.myHash).toBe(hash);
            // Valid resource should remain
            expect(context.myHash.valid).toBe(validResource);
        });
    });

    describe('static properties', () =>
    {
        it('should have correct extension configuration', () =>
        {
            expect(GCSystem.extension.name).toBe('gc');
            expect(GCSystem.extension.type).toContain('webgl-system');
            expect(GCSystem.extension.type).toContain('webgpu-system');
        });

        it('should have correct default options', () =>
        {
            expect(GCSystem.defaultOptions.gcActive).toBe(true);
            expect(GCSystem.defaultOptions.gcMaxUnusedTime).toBe(60000);
            expect(GCSystem.defaultOptions.gcFrequency).toBe(30000);
        });
    });
});
