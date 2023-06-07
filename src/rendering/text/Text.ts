import { Container } from '../scene/Container';
import { TextView } from './TextView';

import type { ContainerOptions } from '../scene/Container';
import type { DestroyOptions } from '../scene/destroyTypes';
import type { TextStyle } from './TextStyle';
import type { TextViewOptions } from './TextView';

const defaultDestroyOptions: DestroyOptions = {
    texture: true,
    children: false,
    textureSource: true,
};

export type TextOptions = ContainerOptions<TextView> & TextViewOptions;

export class Text extends Container<TextView>
{
    constructor(options: TextOptions)
    {
        super({
            view: new TextView(options),
            label: 'Text',
            ...options
        });
    }

    get anchor()
    {
        return this.view.anchor;
    }

    set text(value: string)
    {
        this.view.text = value;
    }

    get text(): string
    {
        return this.view.text;
    }

    set style(value: TextStyle | Partial<TextStyle>)
    {
        this.view.style = value;
    }

    get style(): TextStyle
    {
        return this.view.style;
    }

    /**
     * Destroys this text and optionally its texture and children.
     * Do not use a Sprite after calling `destroy`.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the sprite as well
     * @param {boolean} [options.context=false] - Only used for children with graphicsContexts e.g. Graphics.
     * If options.children is set to true it should destroy the context of the child graphics
     */
    public destroy(options: DestroyOptions = false): void
    {
        if (typeof options === 'boolean')
        {
            options = { children: options };
        }

        options = Object.assign({}, defaultDestroyOptions, options);

        super.destroy(options);

        this.view.destroy(options);
    }
}
