/* eslint-disable no-console, func-names */
const { Runner } = require('../');
const Signal = require('signals');
const MiniSignal = require('mini-signals');
const EventEmitter = require('eventemitter3');

const updateRunner = new Runner('update');
const updateRunnerAdhoc = new Runner('update');
const updateSignal = new Signal();
const updateMiniSignal = new MiniSignal();
const updateEvent = new EventEmitter();

const numListeners = 10;
const numCycles = 2000;
const numRuns = 100;
const timings = {};

function Listener()
{
    this.time = 0;
}

Listener.prototype.update = function ()
{
    this.time++;
};

for (let i = 0; i < numListeners; i++)
{
    const listener = new Listener();

    updateRunner.add(listener);
    updateRunnerAdhoc.add({ time: 0, update: Listener.prototype.update });
    updateSignal.add(listener.update, listener);
    updateMiniSignal.add(listener.update, listener);
    updateEvent.on('update', listener.update, listener);
}

// bench helper
function doBench(name, fn)
{
    timings[name] = {
        runs: [],
        total: 0,
        avg: 0,
    };

    console.log(`\nbenchmarking ${name}...`);

    for (let r = 0; r < numRuns; ++r)
    {
        const start = performance.now();

        for (let i = 0; i < numCycles; i++)
        {
            fn();
        }

        let time = performance.now() - start;

        time /= 1000;
        timings[name].runs.push(time);
        timings[name].total += time;
    }

    timings[name].avg = timings[name].total / numRuns;

    console.log(`${name}: ${timings[name].avg}`);
}

log(`Number of listeners: ${numListeners}`);
log(`Number of runs each: ${numRuns}`);
log(`Number of cycles per run: ${numCycles}`);

// ///// SIGNALS ///////
doBench('signals', function ()
{
    updateSignal.dispatch();
});

// ///// MINI-SIGNALS ///////
doBench('miniSignals', function ()
{
    updateMiniSignal.dispatch();
});

// ///// EVENTS ///////
doBench('events', function ()
{
    updateEvent.emit('update');
});

// ////// RUNNER ///////
doBench('runner', function ()
{
    updateRunner.emit();
});

// ////// RUNNER ADHOC ///////
doBench('runnerAdHoc', function ()
{
    updateRunnerAdhoc.emit();
});

// ////// RESULTS ///////
console.log('\n');
function log(msg)
{
    console.log(msg);
    /* jshint ignore:start */
    document.write(`<pre>${msg}</pre>`);
    /* jshint ignore:end */
}

log(`mini-runner is ${timings.signals.avg / timings.runner.avg}x faster than signals`);
log(`mini-runner is ${timings.miniSignals.avg / timings.runner.avg}x faster than mini-signals`);
log(`mini-runner is ${timings.events.avg / timings.runner.avg}x faster than events`);
log('\n');
log(`mini-runner (adhoc) is ${timings.signals.avg / timings.runnerAdHoc.avg}x faster than signals`);
log(`mini-runner (adhoc) is ${timings.miniSignals.avg / timings.runnerAdHoc.avg}x faster than mini-signals`);
log(`mini-runner (adhoc) is ${timings.events.avg / timings.runnerAdHoc.avg}x faster than events`);
