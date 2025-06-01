---
title: Overview
category: ticker
---

# Ticker

{@link Ticker} provide periodic callbacks based on the system clock.
Your game update logic will generally be run in response to a tick once per frame.
You can have multiple tickers in use at one time.

```js
import { Ticker } from 'pixi.js';
const callback = (ticker: Ticker) => {
   // do something on the next animation frame
};
// create a ticker
const ticker = new Ticker();
// register the callback and start the ticker
ticker.add(callback);
ticker.start();
```

You can always use the {@link Ticker.shared} ticker that Pixi renders with by default.

```js
Ticker.shared.add(callback);
```
