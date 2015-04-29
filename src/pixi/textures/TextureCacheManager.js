/**
 * @author Andrew Champion http://aschampion.github.io/
 */

/**
 * A cumulative cache stores all items put into it indefinitely, unless the
 * underlying cache object is manually cleared. If the set of items that will
 * be cached is large or unbounded, consider using PIXI.LRUCacheManager instead.
 *
 * @class CumulativeCacheManager
 * @constructor
 * @param cache {Object} The backing object that will store references to cached items.
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

/**
 * A least recently used (LRU) cache stores all items put into it until it has
 * reached capacity, at which point newly inserted items will remove least
 * recently used items from the cache. This manager is only aware of uses which
 * call its touch method.
 *
 * @class LRUCacheManager
 * @constructor
 * @param cache {Object} The backing object that will store references to cached items.
 * @param capacity {Number} The maximum number of items that should be cached.
 */
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
