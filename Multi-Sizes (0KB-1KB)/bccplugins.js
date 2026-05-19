/* global define, require */
(function (root, factory) {
'use strict';

if (typeof define === 'function' && define.amd) {
define(['seriously'], factory);
} else if (typeof exports === 'object') {
factory(require('seriously'));
} else {
if (!root.Seriously) {
root.Seriously = { plugin: function (name, opt) { this[name] = opt; } };
}
factory(root.Seriously);
}
}(window, function (Seriously) {
'use strict';

Seriously.plugin('BCCBrightnessContrast', {
title: 'BCC Brightness Contrast',
inputs: {
source: { type: 'image' },
brightness: { type: 'number', min: -1, max: 1, defaultValue: 0 },
contrast: { type: 'number', min: -1, max: 1, defaultValue: 0 },
gamma: { type: 'number', min: 0, max: 5, defaultValue: 1 }
}
});

Seriously.plugin('BCCGaussianBlur', {
title: 'BCC Gaussian Blur',
inputs: {
source: { type: 'image' },
radius: { type: 'number', min: 0, max: 100, defaultValue: 10 },
iterations: { type: 'number', min: 1, max: 10, defaultValue: 1 }
}
});

Seriously.plugin('BCCSharpen', {
title: 'BCC Sharpen',
inputs: {
source: { type: 'image' },
amount: { type: 'number', min: 0, max: 5, defaultValue: 1 },
radius: { type: 'number', min: 0, max: 10, defaultValue: 1 }
}
});

Seriously.plugin('BCCColorBalance', {
title: 'BCC Color Balance',
inputs: {
source: { type: 'image' },
red: { type: 'number', min: -1, max: 1, defaultValue: 0 },
green: { type: 'number', min: -1, max: 1, defaultValue: 0 },
blue: { type: 'number', min: -1, max: 1, defaultValue: 0 }
}
});

Seriously.plugin('BCCHueSaturation', {
title: 'BCC Hue Saturation',
inputs: {
source: { type: 'image' },
hue: { type: 'number', min: -180, max: 180, defaultValue: 0 },
saturation: { type: 'number', min: -1, max: 1, defaultValue: 0 },
lightness: { type: 'number', min: -1, max: 1, defaultValue: 0 }
}
});

Seriously.plugin('BCCGlow', {
title: 'BCC Glow',
inputs: {
source: { type: 'image' },
intensity: { type: 'number', min: 0, max: 5, defaultValue: 1 },
threshold: { type: 'number', min: 0, max: 1, defaultValue: 0.5 },
radius: { type: 'number', min: 0, max: 100, defaultValue: 20 }
}
});

Seriously.plugin('BCCEmboss', {
title: 'BCC Emboss',
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: 0, max: 5, defaultValue: 1 },
angle: { type: 'number', min: 0, max: 360, defaultValue: 45 }
}
});

Seriously.plugin('BCCEdgeDetect', {
title: 'BCC Edge Detect',
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: 0, max: 5, defaultValue: 1 }
}
});

Seriously.plugin('BCCVignette', {
title: 'BCC Vignette',
inputs: {
source: { type: 'image' },
radius: { type: 'number', min: 0, max: 1, defaultValue: 0.5 },
softness: { type: 'number', min: 0, max: 1, defaultValue: 0.5 },
strength: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
}
});

Seriously.plugin('BCCNoise', {
title: 'BCC Noise',
inputs: {
source: { type: 'image' },
amount: { type: 'number', min: 0, max: 1, defaultValue: 0.1 },
size: { type: 'number', min: 0, max: 10, defaultValue: 1 }
}
});

Seriously.plugin('BCCZoomBlur', {
title: 'BCC Zoom Blur',
inputs: {
source: { type: 'image' },
centerX: { type: 'number', min: 0, max: 1, defaultValue: 0.5 },
centerY: { type: 'number', min: 0, max: 1, defaultValue: 0.5 },
strength: { type: 'number', min: 0, max: 2, defaultValue: 0.5 }
}
});

Seriously.plugin('BCCDirectionalBlur', {
title: 'BCC Directional Blur',
inputs: {
source: { type: 'image' },
angle: { type: 'number', min: 0, max: 360, defaultValue: 0 },
distance: { type: 'number', min: 0, max: 100, defaultValue: 10 }
}
});

Seriously.plugin('BCCLensBlur', {
title: 'BCC Lens Blur',
inputs: {
source: { type: 'image' },
radius: { type: 'number', min: 0, max: 50, defaultValue: 10 },
bladeCount: { type: 'number', min: 3, max: 8, defaultValue: 6 }
}
});

Seriously.plugin('BCCPosterize', {
title: 'BCC Posterize',
inputs: {
source: { type: 'image' },
levels: { type: 'number', min: 2, max: 256, defaultValue: 8 }
}
});

Seriously.plugin('BCCThreshold', {
title: 'BCC Threshold',
inputs: {
source: { type: 'image' },
threshold: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
}
});

Seriously.plugin('BCCPixelate', {
title: 'BCC Pixelate',
inputs: {
source: { type: 'image' },
size: { type: 'number', min: 1, max: 100, defaultValue: 10 }
}
});

Seriously.plugin('BCCSwirl', {
title: 'BCC Swirl',
inputs: {
source: { type: 'image' },
angle: { type: 'number', min: -360, max: 360, defaultValue: 180 },
radius: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
}
});

Seriously.plugin('BCCBulge', {
title: 'BCC Bulge',
inputs: {
source: { type: 'image' },
strength: { type: 'number', min: -1, max: 1, defaultValue: 0.5 },
radius: { type: 'number', min: 0, max: 1, defaultValue: 0.5 }
}
});

Seriously.plugin('BCCRipple', {
title: 'BCC Ripple',
inputs: {
source: { type: 'image' },
amplitude: { type: 'number', min: 0, max: 1, defaultValue: 0.2 },
frequency: { type: 'number', min: 0, max: 20, defaultValue: 5 }
}
});

}));
