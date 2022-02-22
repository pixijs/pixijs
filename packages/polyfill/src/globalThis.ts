if (typeof globalThis === 'undefined')
{
    if (typeof self !== 'undefined')
    {
        // covers browsers
        // @ts-expect-error not-writable ts(2540) error only on node
        self.globalThis = self;
    }
    else if (typeof global !== 'undefined')
    {
        // covers versions of Node < 12
        // @ts-expect-error not-writable ts(2540) error only on node
        global.globalThis = global;
    }
}
