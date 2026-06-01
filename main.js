import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("bg");

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias:true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio,2)
);

const scene = new THREE.Scene();

const camera =
new THREE.OrthographicCamera(
    -1,1,1,-1,0.1,10
);

camera.position.z = 1;

const mouse = new THREE.Vector2(0.5,0.5);
const targetMouse = new THREE.Vector2(0.5,0.5);
const velocity = new THREE.Vector2();

let prevX = 0.5;
let prevY = 0.5;

const uniforms = {

    uTime:{value:0},

    uMouse:{value:mouse},

    uVelocity:{value:velocity},

    uResolution:{
        value:new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
        )
    }

};

const material =
new THREE.ShaderMaterial({

uniforms,

vertexShader:`

varying vec2 vUv;

void main(){

    vUv = uv;

    gl_Position =
        vec4(position,1.0);

}
`,

fragmentShader:`

precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform vec2 uResolution;

varying vec2 vUv;

float hash(vec2 p){

    return fract(
        sin(
            dot(
                p,
                vec2(127.1,311.7)
            )
        )*43758.5453123
    );

}

float noise(vec2 p){

    vec2 i=floor(p);
    vec2 f=fract(p);

    float a=hash(i);
    float b=hash(i+vec2(1.,0.));
    float c=hash(i+vec2(0.,1.));
    float d=hash(i+vec2(1.,1.));

    vec2 u=f*f*(3.-2.*f);

    return mix(a,b,u.x)
        +(c-a)*u.y*(1.-u.x)
        +(d-b)*u.x*u.y;

}

float fbm(vec2 p){

    float v=0.0;
    float a=0.5;

    for(int i=0;i<6;i++){

        v+=a*noise(p);

        p*=2.0;

        a*=0.55;

    }

    return v;

}

vec2 curl(vec2 p){

    float e = 0.01;

    float n1 =
        fbm(p+vec2(0.0,e));

    float n2 =
        fbm(p-vec2(0.0,e));

    float a =
        (n1-n2)/(2.0*e);

    float n3 =
        fbm(p+vec2(e,0.0));

    float n4 =
        fbm(p-vec2(e,0.0));

    float b =
        (n3-n4)/(2.0*e);

    return vec2(
        a,
        -b
    );

}

void main(){

    vec2 uv = vUv;

    float t =
        uTime * 0.03;

    vec2 p =
        uv * 1.2;

    vec2 flow1 =
        curl(
            p +
            vec2(
                t,
                t*0.5
            )
        );

    vec2 flow2 =
        curl(
            p*1.8 -
            vec2(
                t*0.3,
                t
            )
        );

    p += flow1 * 0.7;
    p += flow2 * 0.4;

    vec2 away =
        uv-uMouse;

    float d =
        length(away);

    p +=

        normalize(
            away+0.0001
        )

        *

        exp(
            -d*8.0
        )

        *

        length(
            uVelocity
        )

        *

        0.04;

    float dye =

        fbm(
            p+
            vec2(
                t*0.2,
                t*0.1
            )
        );

    dye +=

        0.6 *

        fbm(
            p*1.5 -
            t*0.15
        );

    dye *= 0.55;

    dye =
        smoothstep(
            0.28,
            0.72,
            dye
        );

    vec3 color =
        vec3(0.0);

    color +=

        vec3(
            0.04,
            0.0,
            0.0
        )

        *

        dye;

    color +=

        vec3(
            0.18,
            0.01,
            0.01
        )

        *

        pow(
            dye,
            2.0
        );

    color *= 0.75;

    gl_FragColor =
        vec4(
            color,
            1.0
        );

}
`

});

const plane =
new THREE.Mesh(
    new THREE.PlaneGeometry(2,2),
    material
);

scene.add(plane);

window.addEventListener("mousemove",(e)=>{

    const x =
        e.clientX /
        window.innerWidth;

    const y =
        1 -
        (
            e.clientY /
            window.innerHeight
        );

    velocity.set(
        x-prevX,
        y-prevY
    );

    prevX=x;
    prevY=y;

    targetMouse.set(x,y);

});

window.addEventListener("resize",()=>{

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
    );

});

function animate(){

    requestAnimationFrame(
        animate
    );

    mouse.lerp(
        targetMouse,
        0.08
    );

    velocity.multiplyScalar(
        0.94
    );

    uniforms.uTime.value += 0.01;

    renderer.render(
        scene,
        camera
    );

}

animate();
