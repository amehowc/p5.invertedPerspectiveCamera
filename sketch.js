let cam;
let positions = [];
const colors = [
    "#abcd5e",
    "#14976b",
    "#2b67af",
    "#62b6de",
    "#f589a3",
    "#ef562f",
    "#fc8405",
    "#f9d531",
];
function setup() {
    createCanvas(600, 600, WEBGL);


    const eye = min(width, height) / 4 / Math.tan(Math.PI / 4);
    const fov = Math.atan2(min(width, height) / 2, eye) / 4;
    const factor = 0.095;
    const cam = createCamera();
    cam.invertedPerspective(
        fov,
        min(width, height) / max(width, height),
        eye / 10,
        eye * 10,
        factor
    );
    noStroke();
    positions = new Array(6).fill(0).map((o, i, a) => {
        const angle = ((Math.PI * 2 * 1) / a.length) * i;
        const x = (cos(angle) * height) / 4;
        const y = 0;
        const z = (sin(angle) * height) / 4;

        return createVector(x, y, z);
    });

    const points = [];
    const r = 40;
    for (let theta = 0; theta < 6 * 2 * PI; theta += 0.1) {
        const x = r * cos(theta);
        const z = r * sin(theta);
        const y = map(theta, 0, 6 * 2 * PI, -100, 100);
        points.push(createVector(x, y, z));
    }
    corkscrew = pointsToPipeGeom(points, 12);
}

function draw() {
    background(10);
    orbitControl();
    const numframes = 8 * 60;
    const progress = (frameCount / numframes) % 1;
    ambientLight(180);
    directionalLight(100, 125, 255, -1, 1, 1);
    directionalLight(155, 120, 0, 1, 0, -1);
    ambientMaterial(125, 100, 200);
    specularMaterial(128);
    shininess(5);
    push();
    scale(0.5)
    rotateY(progress * TWO_PI);
    positions.forEach((p, i, a) => {
        push();
        translate(p);
        fill(colors[i]);
        if (i === 0) {
            rotateX(progress * TWO_PI + PI);
            rotateY(-progress * TWO_PI + PI);
            box(120);
        } else if (i === 1) {
            rotateX(progress * TWO_PI - PI / 2);
            cylinder(60, 120, 48, 48);
        } else if (i === 2) {
            rotateX(progress * TWO_PI + PI);
            torus(50, 30, 48, 48);
        } else if (i === 3) {
            rotateX(-progress * TWO_PI + PI / 2);
            rotateY(-progress * TWO_PI + PI / 2);
            cone(80, 120, 48, 48);
        } else if (i === 4) {
            scale(1);
            rotateX(progress * TWO_PI + PI / 2);
            rotateY(-progress * TWO_PI - PI / 2);
            model(corkscrew);
        } else {
            sphere(80, 48, 48);
        }

        pop();
    });
    pop();
}
