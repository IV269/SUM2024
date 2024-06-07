/* FILE NAME: vec3.js
 * PROGRAMMER: IV2
 * DATE: 07.06.2024
 * PURPOSE: vector library for 3D rendering.
 */

class _vec3 {
  constructor(x, y, z) {
    if (x == undefined) {
      (this.x = 0), (this.y = 0), (this.z = 0);
    } else if (typeof x == "object") {
      if (x.length == 3) {
        (this.x = x[0]), (this.y = x[1]), (this.z = x[2]);
      } else {
        (this.x = x.x), (this.y = x.y), (this.z = x.z);
      }
    } else {
      if (y == undefined || z == undefined) {
        (this.x = x), (this.y = x), (this.z = x);
      } else {
        (this.x = x), (this.y = y), (this.z = z);
      }
    }
  }

  add(v) {
    if (typeof v == "number") {
      return vec3(this.x + v, this.y + v, this.z + v);
    }
    return vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v) {
    if (typeof v == "number") {
      return vec3(this.x - v, this.y - v, this.z - v);
    }
    return vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  neg() {
    return vec3(-this.x, -this.y, -this.z);
  }

  mulNum(n) {
    return vec3(this.x * n, this.y * n, this.z * n);
  }

  divNum(n) {
    return vec3(this.x / n, this.y / n, this.z / n);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    return vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  normalize() {
    let len = this.dot(this);

    if (len != 0 && len != 1) {
      return this.divNum(Math.sqrt(len));
    }
    return vec3(this);
  }

  len() {
    let len = this.dot(this);

    if (len != 0 && len != 1) {
      return Math.sqrt(len);
    }
    return len;
  }

  pointTransform(m) {
    return vec3(
      this.x * m.m[0][0] + this.y * m.m[1][0] + this.z * m.m[2][0] + m.m[3][0],
      this.x * m.m[0][1] + this.y * m.m[1][1] + this.z * m.m[2][1] + m.m[3][1],
      this.x * m.m[0][2] + this.y * m.m[1][2] + this.z * m.m[2][2] + m.m[3][2],
    );
  }

  vectorTransform(m) {
    return vec3(
      this.x * m.m[0][0] + this.y * m.m[1][0] + this.z * m.m[2][0],
      this.x * m.m[0][1] + this.y * m.m[1][1] + this.z * m.m[2][1],
      this.x * m.m[0][2] + this.y * m.m[1][2] + this.z * m.m[2][2],
    );
  }
}

export function vec3(...args) {
  return new _vec3(...args);
} // end of 'vec3' function

/* END OF 'vec3.js' FILE */
