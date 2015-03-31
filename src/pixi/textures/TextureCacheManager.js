/**
 * @author Andrew Champion http://aschampion.github.io/
 */

/**
 * @class CumulativeCacheManager
 * @constructor
 */
PIXI.CumulativeCacheManager = function (cache) {
    this.cache = cache;
};

PIXI.CumulativeCacheManager.prototype.constructor = PIXI.CumulativeCacheManager;

PIXI.CumulativeCacheManager.prototype.put = function (key, value) {
    this.cache[key] = value;
};

PIXI.CumulativeCacheManager.prototype.get = function (key) {
    return this.cache[key];
};

PIXI.CumulativeCacheManager.prototype.touch = function () {};

PIXI.LRUCacheManager = function (cache, capacity) {
    this.cache = cache;
    this.capacity = capacity;
    this.size = 0;
    this.queue = {};
    this.oldest = null;
    this.newest = null;
};

PIXI.LRUCacheManager.prototype.constructor = PIXI.LRUCacheManager;

PIXI.LRUCacheManager.prototype.put = function (key, value) {
    while (this.size > this.capacity && this.oldest !== null) {
        this.remove(this.oldest);
    }
    this.cache[key] = value;
    this.touch(key);
};

PIXI.LRUCacheManager.prototype.get = function (key) {
    var value = this.cache[key];

    if (typeof value !== 'undefined') {
        this.touch(key);
    }

    return value;
};

PIXI.LRUCacheManager.prototype.touch = function (key) {
    var status = this.queue[key];

    if (typeof status !== 'undefined') { // Key is already tracked by cache.
        if (status.newer !== null) this.queue[status.newer].older = status.older;
        if (status.older !== null) this.queue[status.older].newer = status.newer;
        if (this.oldest === key) this.oldest = status.newer;
    } else {
        this.size++;
    }

    this.queue[key] = {newer: null, older: this.newest};
    if (this.newest !== null && this.newest !== key) {
        this.queue[this.newest].newer = key;
    }
    this.newest = key;
    if (this.oldest === null) {
        this.oldest = key;
    }
};

PIXI.LRUCacheManager.prototype.remove = function (key) {
    var status = this.queue[key];

    if (typeof status !== 'undefined') { // Key is already tracked by cache.
        if (status.newer !== null) this.queue[status.newer].older = status.older;
        if (status.older !== null) this.queue[status.older].newer = status.newer;
        if (this.oldest === key) this.oldest = status.newer;
        if (this.newest === key) this.newest = status.older;
        this.size--;
    }
    delete this.queue[key];

    var value = this.cache[key];
    if (typeof value.destroy === 'function') {
        value.destroy();
    }
    delete this.cache[key];
};
