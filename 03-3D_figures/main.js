/* FILE NAME: main.js
 * PROGRAMMER: IV2
 * DATE: 08.06.2024
 * PURPOSE: rendering module.
 */

console.log("check");

import { mat4, vec3, matrRotate, Cube, Tetrahedron, Render } from "./lib.js";

console.log("MAIN LOADED");

function main() {
  let canvas1 = document.getElementById("myCan1");
  let canvas2 = document.getElementById("myCan2");

  /* canvas1.addEventListener("mousemove", onClick1);
  canvas2.addEventListener("mousemove", onClick2);
  canvas1.addEventListener("wheel", onScroll);
  canvas2.addEventListener("wheel", onScroll);
  */
  console.log(matrRotate(45, vec3(0, 1, 0)));

  let rnd1 = new Render(canvas1);
  let rnd2 = new Render(canvas2);

  let cube = new Cube();
  let tetrahedron = new Tetrahedron();
  console.log(cube);

  let cubeprim = cube.makePrim(rnd1, mat4());
  let tetraprim = tetrahedron.makePrim(rnd2, mat4());
  console.log(cubeprim);

  let rnds = [rnd1, rnd2];
  let prims = [cubeprim, tetraprim];
  let figures = [cube, tetrahedron];

  const draw = () => {
    for (let i = 0; i < rnds.length; i++) {
      figures[i].time.response();

      let time = figures[i].time.localTime;

      rnds[i].renderStart();
      prims[i].render(
        rnds[i],
        mat4(), //.mul(matrRotate(0, vec3(0, 1, 0))),
        //prims[i].matrix.mul(matrRotate(time, vec3(0, 1, 0))),
      );
      window.requestAnimationFrame(draw);
    }
  };
  draw();
}

let rot1 = mat4(),
  rot2 = mat4();
let rotSpeed = 0.008;

function onClick1(e) {
  e.preventDefault();
  if (e.buttons != 1) return;
  rot1 = rot1.mul(matrRotate(e.movementX * rotSpeed, vec3(0, 1, 0)));
  rot1 = rot1.mul(matrRotate(e.movementY * rotSpeed, vec3(1, 0, 0)));
}
function onClick2(e) {
  e.preventDefault();
  if (e.buttons != 1) return;
  rot2 = rot2.mul(matrRotate(e.movementX * rotSpeed, vec3(0, 1, 0)));
  rot2 = rot2.mul(matrRotate(e.movementY * rotSpeed, vec3(1, 0, 0)));
}
function onScroll(e) {
  e.preventDefault();
}

window.addEventListener("load", () => {
  main();
});

// END OF 'main' MODULE
