export interface BaseDestroyOptions
{
    children?: boolean;
}

export interface TextureDestroyOptions
{
    texture?: boolean;
    textureSource?: boolean;
}

export interface ContextDestroyOptions
{
    context?: boolean;
}

export interface ViewSystemDestroyOptions
{
    removeView?: boolean;
}

export type TypeOrBool<T> = T | boolean;

export type DestroyOptions = TypeOrBool<
BaseDestroyOptions &
ContextDestroyOptions &
TextureDestroyOptions &
ViewSystemDestroyOptions
>;
