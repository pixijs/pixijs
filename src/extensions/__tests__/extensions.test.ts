import { extensions } from '../Extensions';

import type { ExtensionMetadata, ExtensionType } from '../Extensions';

const exampleType = 'test-extension' as ExtensionType;
const exampleType2 = 'test-extension2' as ExtensionType;

const example = {
    extension: {
        type: exampleType,
        name: 'test',
    } as ExtensionMetadata,
};

const example2 = {
    extension: exampleType as ExtensionMetadata,
};

describe('extensions', () =>
{
    afterEach(() =>
    {
        delete extensions._addHandlers[exampleType];
        delete extensions._removeHandlers[exampleType];
        delete extensions._addHandlers[exampleType2];
        delete extensions._removeHandlers[exampleType2];
    });

    describe('handle', () =>
    {
        it('should throw when extension type is handled twice', () =>
        {
            extensions.handle(exampleType, () => null, () => null);
            expect(() =>
            {
                extensions.handle(exampleType, () => null, () => null);
            }).toThrow(`Extension type ${exampleType} already has a handler`);
        });
    });

    describe('handleByMap', () =>
    {
        it('should successfully handle an extension by a map', () =>
        {
            const map = {} as Record<string, any>;

            extensions.handleByMap(exampleType, map);
            extensions.add(example);
            expect(map.test).toBe(example);
            extensions.remove(example);
            expect(map.test).toBeUndefined();
        });
    });

    describe('handleByList', () =>
    {
        it('should successfully handle an extension by a map', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example);
            expect(list[0]).toBe(example);
            extensions.remove(example);
            expect(list[0]).toBeUndefined();
        });

        it('should not add duplicating extensions', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example);
            extensions.add(example);
            expect(list).toHaveLength(1);
        });

        it('should add extensions in order of priority', () =>
        {
            const ext1 = {
                extension: {
                    priority: 1,
                    type: exampleType,
                },
            };
            const ext2 = {
                extension: {
                    priority: 2,
                    type: exampleType,
                },
            };
            const ext3 = {
                extension: {
                    priority: 0,
                    type: exampleType,
                },
            };
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(ext1);
            extensions.add(ext2);
            extensions.add(ext3);
            expect(list[0]).toBe(ext2);
            expect(list[1]).toBe(ext1);
            expect(list[2]).toBe(ext3);
        });
    });

    describe('add', () =>
    {
        it('should register simple extension data', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example2);
            expect(list).toHaveLength(1);
            expect(list[0]).toBe(example2);
            extensions.remove(example2);
            expect(list).toHaveLength(0);
        });

        it('should support spread', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example2, example);
            expect(list).toHaveLength(2);
            extensions.remove(example2, example);
            expect(list).toHaveLength(0);
        });

        it('should immediately register extension before handle', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example);
            expect(list).toHaveLength(1);
            expect(list[0]).toBe(example);
            extensions.remove(example);
            expect(list).toHaveLength(0);
        });

        it('should immediately register extension after handle', () =>
        {
            const list: any[] = [];

            extensions.add(example);
            extensions.handleByList(exampleType, list);
            expect(list).toHaveLength(1);
            expect(list[0]).toBe(example);
            extensions.remove(example);
            expect(list).toHaveLength(0);
        });

        it('should support multiple types', () =>
        {
            const list: any[] = [];
            const list2: any[] = [];
            const example3 = {
                extension: {
                    type: [exampleType, exampleType2] as ExtensionType[],
                } as ExtensionMetadata,
            };

            extensions.handleByList(exampleType, list);
            extensions.handleByList(exampleType2, list2);
            extensions.add(example3);
            expect(list).toHaveLength(1);
            expect(list2).toHaveLength(1);
            expect(list[0]).toBe(example3);
            expect(list2[0]).toBe(example3);
            extensions.remove(example3);
            expect(list).toHaveLength(0);
            expect(list2).toHaveLength(0);
        });
    });

    describe('mixin', () =>
    {
        it('should mixin properties from source objects into the target object', () =>
        {
            class Target {}
            const source1 = { prop1: 'value1' };
            const source2 = { prop2: 'value2' };

            extensions.mixin(Target, source1, source2);

            const targetInstance = new Target();

            expect(targetInstance).toHaveProperty('prop1', 'value1');
            expect(targetInstance).toHaveProperty('prop2', 'value2');
        });

        it('should not affect the prototype chain of the source objects', () =>
        {
            class Target {}
            const source = { prop: 'value' };

            extensions.mixin(Target, source);

            expect(Object.getPrototypeOf(source)).toBe(Object.prototype);
        });

        it('should handle multiple sources correctly', () =>
        {
            class Target {}
            const source1 = { prop1: 'value1' };
            const source2 = { prop2: 'value2' };
            const source3 = { prop3: 'value3' };

            extensions.mixin(Target, source1, source2, source3);

            const targetInstance = new Target();

            expect(targetInstance).toHaveProperty('prop1', 'value1');
            expect(targetInstance).toHaveProperty('prop2', 'value2');
            expect(targetInstance).toHaveProperty('prop3', 'value3');
        });
    });
});
