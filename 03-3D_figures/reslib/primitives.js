/* FILE NAME: primitives.js
 * PROGRAMMER: IV2
 * DATE: 08.06.2024
 * PURPOSE: primitives library for 3D rendering.
 */

import "../lib.js";

class _vertex {
  constructor(pos, norm) {
    this.pos = pos;
    this.norm = norm;
  }
} // end of '_vertex' class

export function vertex(...args) {
  return new _vertex(...args);
} // end of 'vertex' function

export function autoNormals(vertexes, indicies) {
  /* Set all vertex normals to zero */
  for (let i = 0; i < vertexes.length; i++) {
    vertexes[i].norm = vec3(0);
  }

  /* Eval normal for every facet */
  for (i = 0; i < indicies.length; i += 3) {
    let n0 = indicies[i],
      n1 = indicies[i + 1],
      n2 = indicies[i + 2];
    let p0 = vertexes[n0].pos,
      p1 = vertexes[n1].pos,
      p2 = vertexes[n2].pos,
      N = p1.sub(p0).cross(p2.sub(p0)).norm();

    vertexes[n0].norm = vertexes[n0].norm.add(N);
    vertexes[n1].norm = vertexes[n1].norm.add(N);
    vertexes[n2].norm = vertexes[n2].norm.add(N);
  }

  /* Normalize all vertex normals */
  for (i = 0; i < vertexes.length; i++) {
    vertexes[i].norm = vertexes[i].norm.norm();
  }
}

class _primitive {
  constructor(vertexes, indicies) {
    let smt = [],
      i = 0;

    autoNormals(vertexes, indicies);

    for (let v of vertexes) {
      smt[i++] = v.pos.x;
      smt[i++] = v.pos.y;
      smt[i++] = v.pos.z;
      smt[i++] = v.norm.x;
      smt[i++] = v.norm.y;
      smt[i++] = v.norm.z;
    }
    this.vertexArrayId = window.gl.createVertexArray();

    window.gl.bindVertexArray(this.vertexArrayId);
    this.vertexBufferId = window.gl.createBuffer();

    window.gl.bindBuffer(window.gl.ARRAY_BUFFER, this.vertexBufferId);
    window.gl.bufferData(
      window.gl.ARRAY_BUFFER,
      new Float32Array(smt),
      window.gl.STATIC_DRAW,
    );

    if (window.posLoc != -1) {
      window.gl.vertexAttribPointer(
        window.posLoc,
        3,
        window.gl.FLOAT,
        false,
        24,
        0,
      );
      window.gl.enableVertexAttribArray(window.posLoc);
      window.gl.vertexAttribPointer(
        window.normLoc,
        3,
        window.gl.FLOAT,
        false,
        24,
        12,
      );
      window.gl.enableVertexAttribArray(window.normLoc);
    }

    this.IndexBufferId = window.gl.createBuffer();
    window.gl.bindBuffer(window.gl.ELEMENT_ARRAY_BUFFER, this.IndexBufferId);
    window.gl.bufferData(
      window.gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(indicies),
      window.gl.STATIC_DRAW,
    );

    this.numOfElements = indicies.length;
    this.numOfVertexes = vertexes.length;
  }

  rndPrimEvalBB(V) {
    (this.MinBB = vec3()), (this.MaxBB = vec3());

    if (V == undefined || V == null || V.length == 0) {
      return;
    }
    let NoofV = V.length;
    (this.MinBB = V[0].P), (this.MaxBB = V[0].P);
    for (let i = 1; i < NoofV; ++i) {
      if (this.MinBB.x > V[i].P.x) {
        this.MinBB.x = V[i].P.x;
      }
      if (this.MaxBB.x < V[i].P.x) {
        this.MaxBB.x = V[i].P.x;
      }

      if (this.MinBB.y > V[i].P.y) {
        this.MinBB.y = V[i].P.y;
      }
      if (this.MaxBB.y < V[i].P.y) {
        this.MaxBB.y = V[i].P.y;
      }
      if (this.MinBB.z > V[i].P.z) {
        this.MinBB.z = V[i].P.z;
      }
      if (this.MaxBB.z < V[i].P.z) {
        this.MaxBB.z = V[i].P.z;
      }
    }
  }

  rndPrimDraw(world) {}

  rndPrimFree() {
    if (this.VA != 0) {
      window.gl.bindVertexArray(this.VA);
      window.gl.bindBuffer(GL_ARRAY_BUFFER, 0);
      window.gl.deleteBuffer(1, this.VBuf);
      window.gl.bindVertexArray(0);
      window.gl.deleteVertexArray(1, this.VA);
    }
    if (this.IBuf != 0) {
      window.gl.deleteBuffer(1, this.IBuf);
    }
  }
} // end of '_primitives' class

export function primCreate(...args) {
  return new _primitive(...args);
} // end of 'primitive' function

/* END OF 'primitive.js' FILE */
