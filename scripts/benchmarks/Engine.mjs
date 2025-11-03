import * as PIXI from 'pixi.js';

class Engine
{
    constructor(name, count)
    {
        this.count = count || 0;
        this.name = name || 'Unnamed Benchmark';
    }

    async init()
    {
        this.width = 800;
        this.height = 600;
        this.maxFrames = 500;
        this.app = new PIXI.Application();
        await this.app.init({
            width: this.width,
            height: this.height,
            backgroundColor: 0x1a1a1a,
            antialias: false,
        });

        document.body.appendChild(this.app.canvas);
        this.resetMetrics();
    }

    async render()
    {
        // abstract method to be implemented by subclasses
    }

    tick()
    {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        // Update frame timing
        this.frameCount++;
        this.totalFrameTime += deltaTime;

        // Calculate instantaneous FPS
        const instantFps = deltaTime > 0 ? 1000 / deltaTime : 0;

        // Track frame times for smoothed FPS calculation
        this.frameTimes.push(deltaTime);
        if (this.frameTimes.length > this.maxFrameTimeHistory)
        {
            this.frameTimes.shift();
        }

        // Calculate smoothed FPS (average over recent frames)
        const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;

        this.fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

        // Track min/max FPS
        if (instantFps > 0)
        {
            this.minFps = Math.min(this.minFps, instantFps);
            this.maxFps = Math.max(this.maxFps, instantFps);
        }

        // Update for next frame
        this.lastFrameTime = currentTime;
    }

    /**
     * Get current performance metrics
     * @returns {object} Performance metrics object
     */
    getPerformanceMetrics()
    {
        const currentTime = performance.now();
        const totalBenchmarkTime = currentTime - this.benchmarkStartTime;
        const avgFps = this.frameCount > 0 ? (this.frameCount * 1000) / totalBenchmarkTime : 0;
        const avgFrameTime = this.frameCount > 0 ? this.totalFrameTime / this.frameCount : 0;

        return {
            fps: Math.round(this.fps * 100) / 100,
            avgFps: Math.round(avgFps * 100) / 100,
            minFps: this.minFps === Infinity ? 0 : Math.round(this.minFps * 100) / 100,
            maxFps: Math.round(this.maxFps * 100) / 100,
            frameCount: this.frameCount,
            avgFrameTime: Math.round(avgFrameTime * 100) / 100,
            totalTime: Math.round(totalBenchmarkTime * 100) / 100,
            name: this.name || 'Unnamed Benchmark',
        };
    }

    /** Reset performance metrics */
    resetMetrics()
    {
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.frameTimes = [];
        this.minFps = Infinity;
        this.maxFps = 0;
        this.totalFrameTime = 0;
        this.benchmarkStartTime = performance.now();
    }
}

export default Engine;
