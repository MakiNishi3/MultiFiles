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

Seriously.plugin('Color-BrightnessContrast', {
	shader: function (inputs, shaderSource) {
		shaderSource.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float brightness;',
			'uniform float contrast;',
			'varying vec2 vTexCoord;',
			'void main() {',
			'vec4 color = texture2D(source, vTexCoord);',
			'color.rgb += brightness;',
			'color.rgb = (color.rgb - 0.5) * contrast + 0.5;',
			'gl_FragColor = color;',
			'}'
		].join('\n');
		return shaderSource;
	},
	inputs: {
		source: { type: 'image' },
		brightness: { type: 'number', min: -1, max: 1, defaultValue: 0 },
		contrast: { type: 'number', min: 0, max: 4, defaultValue: 1 }
	}
});

Seriously.plugin('Color-HueShift', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float angle;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'float sA=sin(angle);',
			'float cA=cos(angle);',
			'mat3 m=mat3(',
			'0.299+0.701*cA+0.168*sA,0.587-0.587*cA+0.330*sA,0.114-0.114*cA-0.497*sA,',
			'0.299-0.299*cA-0.328*sA,0.587+0.413*cA+0.035*sA,0.114-0.114*cA+0.292*sA,',
			'0.299-0.300*cA+1.250*sA,0.587-0.588*cA-1.050*sA,0.114+0.886*cA-0.203*sA);',
			'gl_FragColor=vec4(m*c.rgb,c.a);',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		angle: { type: 'number', min: -3.14, max: 3.14, defaultValue: 0 }
	}
});

Seriously.plugin('Color-Invert', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'gl_FragColor=vec4(1.0-c.rgb,c.a);',
			'}'
		].join('\n');
		return s;
	},
	inputs: { source: { type: 'image' } }
});

Seriously.plugin('Color-SaturationVibrance', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float saturation;',
			'uniform float vibrance;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'float avg=(c.r+c.g+c.b)/3.0;',
			'c.rgb=mix(vec3(avg),c.rgb,saturation);',
			'float mx=max(c.r,max(c.g,c.b));',
			'float amt=(mx-avg)*(-vibrance*3.0);',
			'c.rgb=mix(c.rgb,vec3(mx),amt);',
			'gl_FragColor=c;',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		saturation: { type: 'number', min: 0, max: 2, defaultValue: 1 },
		vibrance: { type: 'number', min: -1, max: 1, defaultValue: 0 }
	}
});

Seriously.plugin('Light-Rays', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float intensity;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec2 uv=vTexCoord-0.5;',
			'float d=length(uv);',
			'float ray=sin(d*50.0)*0.5+0.5;',
			'vec4 c=texture2D(source,vTexCoord);',
			'c.rgb+=ray*intensity;',
			'gl_FragColor=c;',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		intensity: { type: 'number', min: 0, max: 2, defaultValue: 0.5 }
	}
});

Seriously.plugin('Color-Temperature', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float temp;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'c.r+=temp;',
			'c.b-=temp;',
			'gl_FragColor=c;',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		temp: { type: 'number', min: -1, max: 1, defaultValue: 0 }
	}
});

Seriously.plugin('Color-Colorize', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform vec3 tint;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'float g=dot(c.rgb,vec3(0.299,0.587,0.114));',
			'gl_FragColor=vec4(g*tint,c.a);',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		tint: { type: 'color', defaultValue: [1, 0, 0] }
	}
});

Seriously.plugin('Color-RGBSplit', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float amount;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec2 off=vec2(amount/512.0);',
			'float r=texture2D(source,vTexCoord+off).r;',
			'float g=texture2D(source,vTexCoord).g;',
			'float b=texture2D(source,vTexCoord-off).b;',
			'gl_FragColor=vec4(r,g,b,1.0);',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		amount: { type: 'number', min: 0, max: 20, defaultValue: 5 }
	}
});

Seriously.plugin('Light-Glow', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float strength;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'float glow=dot(c.rgb,vec3(0.3,0.59,0.11))*strength;',
			'gl_FragColor=vec4(c.rgb+glow,c.a);',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		strength: { type: 'number', min: 0, max: 3, defaultValue: 1 }
	}
});

Seriously.plugin('Light-DarkGlow', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float strength;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'float g=1.0-dot(c.rgb,vec3(0.3,0.59,0.11));',
			'gl_FragColor=vec4(c.rgb+g*strength,c.a);',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		strength: { type: 'number', min: 0, max: 3, defaultValue: 1 }
	}
});

Seriously.plugin('Light-LightGlow', {
	shader: function (i, s) {
		s.fragment = [
			'precision mediump float;',
			'uniform sampler2D source;',
			'uniform float power;',
			'varying vec2 vTexCoord;',
			'void main(){',
			'vec4 c=texture2D(source,vTexCoord);',
			'float g=pow(dot(c.rgb,vec3(0.3,0.59,0.11)),power);',
			'gl_FragColor=vec4(c.rgb+g,c.a);',
			'}'
		].join('\n');
		return s;
	},
	inputs: {
		source: { type: 'image' },
		power: { type: 'number', min: 0.1, max: 5, defaultValue: 1.5 }
	}
});

}));
