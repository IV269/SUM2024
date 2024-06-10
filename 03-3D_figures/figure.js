import { vertex, Timer, mat4, vec3, primitive } from "./lib.js";

class Figure {
  constructor() {
    this.vertexes = [];
    this.time = new Timer();
    this.matrix = mat4();
  }

  makePrim(rnd, matrix) {
    let indicies = [];
    let vertexes = [];
    let j = 0;
    this.matrix = matrix;

    for (let edge of this.vertexes) {
      for (let v of edge) {
        vertexes.push(vertex(v, vec3(0)));
      }

      for (let i = 2; i < edge.length; i++) {
        indicies.push(j + 0);
        indicies.push(j + i - 1);
        indicies.push(j + i);
      }
      j += edge.length;
    }

    return new primitive(rnd, vertexes, indicies);
  }
}

export class Cube extends Figure {
  constructor() {
    super();
    this.vertexes = [
      [
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, 0.5, -0.5),
        vec3(0.5, 0.5, -0.5),
        vec3(0.5, -0.5, -0.5),
      ], // Front
      [
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
      ], // Back
      [
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(-0.5, 0.5, -0.5),
      ], // Left
      [
        vec3(0.5, -0.5, -0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, 0.5, -0.5),
      ], // Right
      [
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, -0.5, -0.5),
      ], // Bottom
      [
        vec3(-0.5, 0.5, -0.5),
        vec3(-0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, 0.5, -0.5),
      ], // Top
    ];
  }
}

export class Tetrahedron extends Figure {
  constructor() {
    super();
    const sqrt3 = Math.sqrt(3.0),
      sqrt2 = Math.sqrt(2.0);

    const top = vec3(0, sqrt2 / sqrt3, 0),
      front = vec3(0, 0, sqrt3 / 3.0),
      left = vec3(-0.5, 0, -sqrt3 / 6.0),
      right = vec3(0.5, 0, -sqrt3 / 6.0);

    this.vertexes = [
      [left, front, top],
      [left, right, top],
      [right, front, top],
      [front, right, left],
    ];
  }
}
