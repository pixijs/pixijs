import { Test } from './test.mjs';

(async () =>
{
    const spriteBenchmark = new Test('Sprites (50k)', 50_000);

    await spriteBenchmark.init();
    spriteBenchmark.resetMetrics();
    await spriteBenchmark.render();

    window.benchmarkResult = spriteBenchmark.getPerformanceMetrics();
})();
