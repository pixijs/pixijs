# @pixi/runner

A simple alternative to events and signals with an emphasis on performance.

Can be used as an alternative to events / signals. 

## Installation

```bash
npm install @pixi/runner
```

## Usage

```js
import { Runner } from '@pixi/runner';

const onComplete = new Runner('onComplete');

//listenerObject needs to have a 'onComplete' function
onComplete.add(listenerObject);

//emit and all listeners will have their 'onComplete' functions called
onComplete.emit(data);
```

Can be used to execute a function on many objects. Handy for games. If you need to update you game elements each frame:

```js
import { Runner } from '@pixi/runner';

const updateRunner = new Runner('update');

// gameItems should all have a 'update' function
updateRunner.add(gameItem1);
updateRunner.add(gameItem2);
updateRunner.add(gameItem3);

// update game elements..
updateRunner.emit();
```

## Features

- Easy to use familiar API.
- Under the hood it dynamically creates a looping function that is highly optimised. 
- Avoids using 'call' and runs the function directly (which is faster!).
- You can pass parameters when emitting.

Pros:
- Doesn't rely on strings.
- Code-completion works properly.
- Trying to dispatch or listen to an event type that doesn't exist throws errors (helps you find errors early).
- No need to create constants to store string values.
- Easy to identify which signals the object dispatch.
- Favor composition over inheritance.
- Doesn't mess with the prototype chain.
- Its fast, a lot faster than events and signals.
- Great for when performance matters.
- Its light weight, with a tiny memory footprint (smaller than events and signals)


Cons:
- Not quite as flexible. All listeners / items in the runner must have the correct function name specified within the runners constructor.

## When to Use

In practice I have found the Runner incredibly useful and so thought it would be nice to share with the world. It currently forms the backbone of the messaging system in our game engine. Its working out great for things like update events, collision events etc.

Great to use if you are say looping through and array and calling the same function on each object. The resulting code is cleaner than a loop whilst still keeping the performance as fast as possible.

So yeah, if you are dispatching signals/events to a lot of listeners often (like everyframe often), then I would consider using this alternative. For most cases, this performance boost is not really important enough to switch from your current fave.

Think of this as a nice alternative for when speed really counts!

to run the tests, move to the runner-benchmark folder then run the following:

```bash
npm run benchmark
```

Next open you browser (http://localhost:9966). The test is run in the console.
The test result above comes from macbook pro chrome 58.

Any thoughts or comments hit me up on twitter [@doormat23](https://twitter.com/doormat23), I'd love to hear them! 
