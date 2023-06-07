export const scaleModeToGlFilter = {
    linear: 9729,
    nearest: 9728,
};

export const mipmapScaleModeToGlFilter = {
    linear: {
        linear: 9987,
        nearest: 9985,
    },
    nearest: {
        linear: 9986,
        nearest: 9984,
    }
};

export const wrapModeToGlAddress = {
    'clamp-to-edge': 33071,
    repeat: 10497,
    'mirror-repeat': 33648,
};

export const compareModeToGlCompare = {
    never: 512,
    less: 513,
    equal: 514,
    'less-equal': 515,
    greater: 516,
    'not-equal': 517,
    'greater-equal': 518,
    always: 519,
};

