import { Renderer } from '@pixi/core';
import { InteractionManager } from '@pixi/interaction';
import { Extract } from '@pixi/extract';
import { Prepare } from '@pixi/prepare';
import { MeshRenderer } from '@pixi/mesh';
import { SpriteRenderer } from '@pixi/sprite';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
import { GraphicsRenderer } from '@pixi/graphics';
import { AccessibilityManager } from '@pixi/accessibility';

Renderer.registerPlugin('accessibility', AccessibilityManager);
Renderer.registerPlugin('extract', Extract);
Renderer.registerPlugin('graphics', GraphicsRenderer);
Renderer.registerPlugin('interaction', InteractionManager);
Renderer.registerPlugin('mesh', MeshRenderer);
Renderer.registerPlugin('prepare', Prepare);
Renderer.registerPlugin('sprite', SpriteRenderer);
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);
