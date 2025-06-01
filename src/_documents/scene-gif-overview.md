---
title: Overview
category: gif
---

# Gif

Optional module to import to decode and play animated GIFs.

```ts
import { Assets } from 'pixi.js';
import { GifSprite } from 'pixi.js/gif';
const source = await Assets.load('example.gif');
const gif = new GifSprite({ source });
```
