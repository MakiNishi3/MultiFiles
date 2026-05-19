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

function shader(vs, fs, inputs) {
return {
shader: function () {
return {
vertex: vs,
fragment: fs
};
},
inputs: inputs
};
}

var v = `
precision mediump float;
attribute vec2 position;
varying vec2 vTexCoord;
void main() {
vTexCoord = position * 0.5 + 0.5;
gl_Position = vec4(position,0.0,1.0);
}
`;

Seriously.plugin('ccinvert', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
void main(){
vec4 c=texture2D(source,vTexCoord);
gl_FragColor=vec4(1.0-c.rgb,c.a);
}
`,{source:{type:'image'}}));

Seriously.plugin('cclightness', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
uniform float amount;
void main(){
vec4 c=texture2D(source,vTexCoord);
gl_FragColor=vec4(c.rgb+amount,c.a);
}
`,{source:{type:'image'},amount:{type:'number',defaultValue:0,min:-1,max:1}}));

Seriously.plugin('cchuesaturation', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
uniform float hue;
uniform float sat;
void main(){
vec4 c=texture2D(source,vTexCoord);
float angle=hue*3.14159;
float s=sin(angle),cA=cos(angle);
mat3 m=mat3(
0.299+0.701*cA+0.168*s,0.587-0.587*cA+0.330*s,0.114-0.114*cA-0.497*s,
0.299-0.299*cA-0.328*s,0.587+0.413*cA+0.035*s,0.114-0.114*cA+0.292*s,
0.299-0.3*cA+1.25*s,0.587-0.588*cA-1.05*s,0.114+0.886*cA-0.203*s
);
vec3 col=m*c.rgb;
float l=dot(col,vec3(0.2126,0.7152,0.0722));
col=mix(vec3(l),col,sat);
gl_FragColor=vec4(col,c.a);
}
`,{source:{type:'image'},hue:{type:'number',defaultValue:0},sat:{type:'number',defaultValue:1,min:0,max:2}}));

Seriously.plugin('ccgaussianblur', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
uniform float radius;
void main(){
vec2 texel=vec2(radius)/512.0;
vec4 sum=vec4(0.0);
sum+=texture2D(source,vTexCoord-4.0*texel)*0.05;
sum+=texture2D(source,vTexCoord-2.0*texel)*0.09;
sum+=texture2D(source,vTexCoord)*0.62;
sum+=texture2D(source,vTexCoord+2.0*texel)*0.09;
sum+=texture2D(source,vTexCoord+4.0*texel)*0.05;
gl_FragColor=sum;
}
`,{source:{type:'image'},radius:{type:'number',defaultValue:2,min:0,max:10}}));

Seriously.plugin('ccmirror', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
void main(){
vec2 uv=vTexCoord;
if(uv.x>0.5) uv.x=1.0-uv.x;
gl_FragColor=texture2D(source,uv);
}
`,{source:{type:'image'}}));

Seriously.plugin('ccedgedetect', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
void main(){
float dx=1.0/512.0;
float dy=1.0/512.0;
vec3 c=texture2D(source,vTexCoord).rgb;
vec3 cx=texture2D(source,vTexCoord+vec2(dx,0.0)).rgb;
vec3 cy=texture2D(source,vTexCoord+vec2(0.0,dy)).rgb;
float e=length(cx-c)+length(cy-c);
gl_FragColor=vec4(vec3(e),1.0);
}
`,{source:{type:'image'}}));

Seriously.plugin('cctile', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
uniform float scale;
void main(){
vec2 uv=fract(vTexCoord*scale);
gl_FragColor=texture2D(source,uv);
}
`,{source:{type:'image'},scale:{type:'number',defaultValue:4,min:1,max:20}}));

Seriously.plugin('ccwavewarp', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
uniform float amp;
uniform float freq;
void main(){
vec2 uv=vTexCoord;
uv.y+=sin(uv.x*freq)*amp;
gl_FragColor=texture2D(source,uv);
}
`,{source:{type:'image'},amp:{type:'number',defaultValue:0.02},freq:{type:'number',defaultValue:10}}));

Seriously.plugin('ccpinchandbulge', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
uniform float strength;
void main(){
vec2 uv=vTexCoord-0.5;
float r=length(uv);
uv*=mix(1.0, r, strength);
gl_FragColor=texture2D(source,uv+0.5);
}
`,{source:{type:'image'},strength:{type:'number',defaultValue:0.5,min:-1,max:1}}));

Seriously.plugin('cccheckerboard', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform float scale;
void main(){
vec2 uv=floor(vTexCoord*scale);
float c=mod(uv.x+uv.y,2.0);
gl_FragColor=vec4(vec3(c),1.0);
}
`,{scale:{type:'number',defaultValue:8,min:2,max:50}}));

Seriously.plugin('ccturbulence', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform float time;
void main(){
float v=sin(vTexCoord.x*10.0+time)+cos(vTexCoord.y*10.0+time);
gl_FragColor=vec4(vec3(v*0.5+0.5),1.0);
}
`,{time:{type:'number',defaultValue:0}}));

Seriously.plugin('cckaleido', shader(v, `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D source;
uniform float sides;
void main(){
vec2 uv=vTexCoord-0.5;
float a=atan(uv.y,uv.x);
float r=length(uv);
float tau=6.28318/sides;
a=mod(a,tau);
a=abs(a-tau/2.0);
uv=r*vec2(cos(a),sin(a));
gl_FragColor=texture2D(source,uv+0.5);
}
`,{source:{type:'image'},sides:{type:'number',defaultValue:6,min:2,max:20}}));

}));
