/**
 * TS for extracting the system as a record based on a list of systems
 * @example
 *
 * type Systems = [
 *   { extension: { name: 'foo' }, defaultOptions: { foo: 1 } },
 *   { extension: { name: 'bar' }, defaultOptions: { bar: 2 } },
 *   { extension: { name: 'baz' }, defaultOptions: { baz: 3 } },
 * ];
 *
 * type SystemTypes = ExtractSystemTypes<Systems>;
 *
 * SystemTypes = {
 *     foo: { extension: { name: 'foo' }, defaultOptions: { foo: 1 } },
 *     bar: { extension: { name: 'bar' }, defaultOptions: { bar: 2 } },
 *     baz: { extension: { name: 'baz' }, defaultOptions: { baz: 3 } },
 * }
 */

interface System
{
    extension: {name: string}
    defaultOptions?: any
    new (...args: any): any
}

type SystemsWithExtensionList = System[];

// converts a typeof item to an instance type (eg typeof Class -> Class)
type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;

// Extract the type of the 'name' property
type NameType<T extends SystemsWithExtensionList> = T[number]['extension']['name'];

// Create a mapped type where each property key is a 'name' value,
// and each property value is an ElementType with a matching 'name'
export type ExtractSystemTypes<T extends SystemsWithExtensionList> = {
    [K in NameType<T>]: InstanceType<Extract<T[number], { extension: { name: K } }>>
};

/**
 *   TS for extracting the init options based on a list of systems
 *   @example
 *
 *   const list = [
 *      { extension: { name: 'foo' }, defaultOptions: { foo: 1 } },
 *      { extension: { name: 'bar' }, defaultOptions: { bar: 2 } },
 *      { extension: { name: 'baz' }, defaultOptions: { baz: 3 } },
 *   ]
 *
 *   type Options = ExtractRendererOptions<typeof list> // { foo: 1 } & { bar: 2 } & { baz: 3 }
 */

// turns any keys that are unknown to never..
type NotUnknown<T> = T extends unknown ? keyof T extends never ? never : T : T;

// returns a filtered type with any unknown keys removed
type KnownProperties<T> = {
    [K in keyof T as NotUnknown<T[K]> extends never ? never : K]: T[K]
};

// Flatten the FinalOptionsType into a union of its values
type FlattenOptions<T> = T extends {[K: string]: infer U} ? U : never;

// Extract the options from each system and flatten them into a union
type OptionsUnion<T extends SystemsWithExtensionList> = FlattenOptions<SeparateOptions<T>>;

// extracts the default options from each system
type DefaultOptionsTypes<T extends SystemsWithExtensionList> = {
    [K in NameType<T>]: Extract<T[number], { extension: { name: K } }>['defaultOptions']
};

// extract the options filtering out any unknown keys
type SeparateOptions<T extends SystemsWithExtensionList> = KnownProperties<DefaultOptionsTypes<T>>;

// Create a distributive conditional type that turns the union into an intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export type ExtractRendererOptions<T extends SystemsWithExtensionList> = UnionToIntersection<OptionsUnion<T>>;
