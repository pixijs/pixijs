---
title: Overview
category: utils
---

# Utils

PixiJS provides a comprehensive collection of utility functions for browser detection, device capabilities, data manipulation, and canvas operations. These utilities are designed to help with common tasks in game and application development.

## Browser Detection

Check browser capabilities and features:

```ts
import {
    isWebGLSupported,
    isWebGPUSupported,
    isSafari,
    isMobile
} from 'pixi.js';

// Graphics API support
if (isWebGLSupported()) {
    console.log('WebGL is available');
}

if (await isWebGPUSupported()) {
    console.log('WebGPU is available');
}

// Browser and device detection
if (isSafari()) {
    console.log('Running in Safari');
}

if (isMobile.any) {
    console.log('Running on mobile device');
}
```

## Data Management

Handle data structures and arrays efficiently:

```ts
import { removeItems, uid, clean } from 'pixi.js';

// Generate unique IDs
const id = uid(); // "1"
const id2 = uid(); // "2"

// Array manipulation
const array = [1, 2, 3, 4, 5];
removeItems(array, 1, 2); // Removes 2 items starting at index 1
console.log(array); // [1, 4, 5]

// Clean object properties
const obj = { a: null, b: undefined, c: 'valid' };
clean(obj); // Removes null/undefined properties
console.log(obj); // { c: 'valid' }
```

## Path Resolution

Handle file and URL paths:

```ts
import { path } from 'pixi.js';

// Join path segments
const fullPath = path.join('assets', 'images', 'sprite.png');

// Get file information
const ext = path.extname('image.png');     // '.png'
const name = path.basename('image.png');    // 'image.png'
const dir = path.dirname('assets/image.png'); // 'assets'
```

## Best Practices

- Use browser detection for feature-specific code paths
- Use `uid()` for generating unique identifiers
- Use path utilities for consistent file handling
- Consider mobile-specific optimizations with `isMobile`

## Related Documentation

- See {@link isWebGLSupported} for WebGL detection
- See {@link isWebGPUSupported} for WebGPU detection
- See {@link isMobile} for mobile device detection
- See {@link path} for path utilities

For detailed implementation requirements and advanced usage, refer to the API documentation of individual utilities.
