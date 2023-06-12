import { Bench } from 'tinybench';

const bench = new Bench({ time: 100 });

bench
    .add('faster task', () =>
    {
        console.log('I am faster');
    })
    .add('slower task', async () =>
    {
        await new Promise((r) => setTimeout(r, 1)); // we wait 1ms :)
        console.log('I am slower');
    })
    .todo('unimplemented bench');

await bench.run();

console.table(bench.table());
