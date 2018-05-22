# @pixi/accessibility

## Installation

```bash
npm install @pixi/accessibility
```

## Usage

Simple usage as an Application plugin:

```js
import {AccessibilityPlugin} from '@pixi/accessibility';
import {Application} from '@pixi/app';

Application.registerPlugin(AccessibilityPlugin);

const app = new Application();
// app.accessibility
```

Advanced usage, instanciating the AccessibilityManager directly:

```js
import { AccessibilityManager } from '@pixi/accessibility';
import { Renderer } from '@pixi/core';

const renderer = new Renderer();
const accessibility = new AccessibilityManager(renderer);
```
