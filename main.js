import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas =
document.getElementById("bg");

const scene =
new THREE.Scene();

const camera =
new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0.1,
    10
);

camera.position.z = 1;

const renderer =
new THREE.WebGLRenderer({
    canvas,
    antialias:true,
    alpha:false
});

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

const mouse =
new THREE.Vector2(0.5,0.5);

const targetMouse =
new THREE.Vector2(0.5,0.5);

const velocity =
new THREE.Vector2();

const raycaster =
new THREE.Raycaster();

const uniforms = {

    uTime:{
        value:0
    },

    uMouse:{
        value:mouse
    },

    uVelocity:{
        value:velocity
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
        vec4(
            position,
            1.0
        );

}

`,

fragmentShader:`

precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uVelocity;

varying vec2 vUv;

float hash(vec2 p){

    return fract(
        sin(
            dot(
                p,
                vec2(
                    127.1,
                    311.7
                )
            )
        ) * 43758.5453
    );

}

float noise(vec2 p){

    vec2 i=floor(p);
    vec2 f=fract(p);

    float a=hash(i);
    float b=hash(i+vec2(1.,0.));
    float c=hash(i+vec2(0.,1.));
    float d=hash(i+vec2(1.,1.));

    vec2 u=
        f*f*(3.-2.*f);

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

        a*=0.5;
    }

    return v;

}

void main(){

    vec2 uv=vUv;

    float t=uTime*0.04;

    vec2 p=uv*0.18;

    vec2 warp=

        vec2(

            fbm(
                p*2.0+
                t
            ),

            fbm(
                p*2.0-
                t
            )

        );

    p += warp*2.6;

    vec2 away=
        uv-uMouse;

    float d=
        length(
            away
        );

    p +=
    normalize(
        away + 0.0001
    )
    *
    exp(
        -d * 7.0
    )
    *
    length(
        uVelocity
    )
    *
    0.05;

    float density =

    fbm(
        p +
        vec2(
            t*0.25,
            t*0.1
        )
    );

density +=

    0.75 *

    fbm(
        p*1.4 -
        t*0.15
    );

density *= 0.55;

density =
    smoothstep(
        0.20,
        0.65,
        density
    );

    vec3 color=
        vec3(0.0);

    color +=

        vec3(
            0.25,
            0.0,
            0.0
        )

        *

        density;

    color +=

        vec3(
            0.6,
            0.03,
            0.03
        )

        *

        pow(
            density,
            1.5
        );

    vec3 color = vec3(0.0);

color +=
    vec3(
        0.18,
        0.0,
        0.0
    )
    * density;

color +=
    vec3(
        0.7,
        0.04,
        0.04
    )
    *
    pow(
        density,
        2.0
    );

gl_FragColor =
    vec4(
        color,
        1.0
    );

}

`

});

const mesh =
new THREE.Mesh(
    new THREE.PlaneGeometry(
        2,
        2
    ),
    material
);

scene.add(mesh);

let previousX = 0.5;
let previousY = 0.5;

window.addEventListener(
    "mousemove",
    e=>{

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
            x-previousX,
            y-previousY
        );

        previousX=x;
        previousY=y;

        targetMouse.set(
            x,
            y
        );

    }
);

window.addEventListener(
    "resize",
    ()=>{

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);

function animate(){

    requestAnimationFrame(
        animate
    );

    mouse.lerp(
        targetMouse,
        0.06
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
