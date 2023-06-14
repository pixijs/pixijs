# WebGL / WebGPU and Canvas separation

- Shaders are the only area that overlap with WebGL and WebGPU. This is really about convenience! We could split them out but who wants a different blur shader for webGL and WebGPU?
- Any renderable should not have any render logic in it. For example a NiceSlicePlane should not extend mesh, as it will be rendered in canvas a unique way. Its ok behind the scenes to render them as a mesh for WebGL and WebGPU, but the renderable should not know about it.
- Be mindful of imports, webGL and WebGPU should not know about each other (shaders excepted). This will make for very smart code splitting when we load in the correct renderer.
 
# Shader conventions
property names
- uniform buffers `ub` eg `ubFilterUniforms`
- attribute, prefix `a` eg. `aPosition`

# Class constructors
Where possible, favour options object over multiple parameters.

Use a static `defaultOptions` property to hold the default options that a user can easily override.

eg:
```
export interface PersonOptions {
    name:string,
    age:number,
}

class Person {
    static defaultOptions:PersonOptions = {
        name:'person`,
        age:23
    }

    constructor(options:PersonOptions)
    {
        options = {...Person.defaultOptions, ...options}
        // ... code
    }
}
```


# Enums and types 
- where possible prefer a string type over a const. This is a more modern approach and makes code easier to read. Type safety also makes this work well, eg: 
```
export type TEXTURE_DIMENSIONS =
    | '1d'
    | '2d'
    | '3d';
```

Use enums if the information held in the property is important. An example would be WebGPU buffer usage. Each property represents a single bit that can be combined, so strings wont work here!

```
export enum BufferUsage
{
    MAP_READ = 0x0001,
    MAP_WRITE = 0x0002,
    COPY_SRC = 0x0004,
    COPY_DST = 0x0008,
    INDEX = 0x0010,
    VERTEX = 0x0020,
    UNIFORM = 0x0040,
    STORAGE = 0x0080,
    INDIRECT = 0x0100,
    QUERY_RESOLVE = 0x0200,
    STATIC = 0x0400
}

const usage = BufferUsage.MAP_READ | BufferUsage.COPY_SRC
```

# Singleton, System or RenderPipe?

Singleton:
I something is managed at a global level where it does not need to know about the renderer, it should be a singleton. An example of this is the Loader and the Cache classes. We only need one of them, and as a texture can be used across multiple renderers. Other examples are the TexturePool.

System:
A system is used to modify and manage one aspect of WebGL or GPU. An example would be the TextureSystem, it is only responsible for managing textures.

RenderPipes:
A RenderPipe is what is used by the renderer when building and executing its instruction set. An example would be the SpritePipe. This is responsible for adding a Sprite to the renderables list.

# Mats scrappy notes (ignore)
uniforms
- updated and shader bind time 

textures
- updated the moment they are updated
- maybe move this to the sync check?

containers and renderables
- added to a toUpdate queue
- this is triggered before a render

graphics context