// eslint-disable-next-line func-names
module.exports = async function ()
{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.__SERVER__?.kill();
};
