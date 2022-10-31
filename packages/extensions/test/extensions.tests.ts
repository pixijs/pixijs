import type { ExtensionMetadata, ExtensionType } from '@pixi/extensions';
import { extensions } from '@pixi/extensions';

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
        extensions['_addHandlers'][exampleType] = undefined;
        extensions['_removeHandlers'][exampleType] = undefined;
        extensions['_addHandlers'][exampleType2] = undefined;
        extensions['_removeHandlers'][exampleType2] = undefined;
    });

    describe('handle', () =>
    {
        it('should throw when extension type is handled twice', () =>
        {
            extensions.handle(exampleType, () => null, () => null);
            expect(() =>
            {
                extensions.handle(exampleType, () => null, () => null);
            }).toThrowError(`Extension type ${exampleType} already has a handler`);
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
            expect(list.length).toBe(1);
        });
    });

    describe('add', () =>
    {
        it('should register simple extension data', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example2);
            expect(list.length).toBe(1);
            expect(list[0]).toBe(example2);
            extensions.remove(example2);
            expect(list.length).toBe(0);
        });

        it('should support spread', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example2, example);
            expect(list.length).toBe(2);
            extensions.remove(example2, example);
            expect(list.length).toBe(0);
        });

        it('should immedately register extension before handle', () =>
        {
            const list: any[] = [];

            extensions.handleByList(exampleType, list);
            extensions.add(example);
            expect(list.length).toBe(1);
            expect(list[0]).toBe(example);
            extensions.remove(example);
            expect(list.length).toBe(0);
        });

        it('should immedately register extension after handle', () =>
        {
            const list: any[] = [];

            extensions.add(example);
            extensions.handleByList(exampleType, list);
            expect(list.length).toBe(1);
            expect(list[0]).toBe(example);
            extensions.remove(example);
            expect(list.length).toBe(0);
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
            expect(list.length).toBe(1);
            expect(list2.length).toBe(1);
            expect(list[0]).toBe(example3);
            expect(list2[0]).toBe(example3);
            extensions.remove(example3);
            expect(list.length).toBe(0);
            expect(list2.length).toBe(0);
        });
    });
});
