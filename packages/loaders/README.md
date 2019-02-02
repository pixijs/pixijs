# @pixi/loaders

## Installation

```bash
npm install @pixi/loaders
```

## Usage

Using the loader directly:

```js
import { Loader } from '@pixi/loaders';

const loader = new Loader();
loader.add('path/to/file.jpg');
loader.load(() => {});
```

Using the loader as an Application plugin:

```js 
import { AppLoaderPlugin } from '@pixi/loaders';
import { Application } from '@pixi/app';

Application.registerPlugin(AppLoaderPlugin);

const app = new Application();
app.loader.add('path/to/file.jpg');
app.loader.load(() => {});
```
