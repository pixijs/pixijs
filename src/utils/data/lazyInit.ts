export function lazyInit<T>(initFunc: () => T)
{
    let _value: T | null = null;

    return {
        get value()
        {
            if (_value === null)
            {
                _value = initFunc();
            }

            return _value;
        }
    };
}
