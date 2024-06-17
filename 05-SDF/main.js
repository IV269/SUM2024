const INF = 255000;

async function loadImage(url) {
    return new Promise((r) => {
        let i = new Image();
        i.onload = () => r(i);
        i.src = url;
    });
}

let img = await loadImage("./images/test2.png");
let wi = img.width;
let he = img.height;

function transpose(sedt, w = 0, h = 0) {
    if (sedt[0].length > 0) {
        let v = [];
        for (let i = 0; i < sedt[0].length; i++) {
            v[i] = [];
        }
        for (let i = 0; i < sedt[0].length; i++) {
            for (let j = 0; j < sedt.length; j++) {
                v[i].push(sedt[j][i]);
            }
        }
        return v;
    } else {
        let v = [];
        if (w > h) {
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    v.push(sedt[j * h + i]);
                }
            }
        } else {
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    v.push(sedt[j * h + i]);
                }
            }
        }
        return v;
    }
}

function intersect_parabolas(p, q) {
    let x = (q[1] + q[0] * q[0] - (p[1] + p[0] * p[0])) / (2 * q[0] - 2 * p[0]);
    return [x, 0];
}

function find_hull_parabolas(single_row, hull_vertices, hull_intersections) {
    let d = single_row;
    let v = hull_vertices;
    let z = hull_intersections;
    let k = 0;
    v[0] = [];
    z[0] = [];
    z[1] = [];
    v[0][0] = 0;
    z[0][0] = -INF;
    z[1][0] = +INF;
    for (let i = 1; i < d.length; i++) {
        let q = [i, d[i]];
        let p = v[k];
        if (p[0] == undefined) {
            p[0] = 0;
        }
        if (p[1] == undefined) {
            p[1] = 0;
        }
        let s = intersect_parabolas(p, q);
        while (s[0] <= z[k][0]) {
            k--;
            p = v[k];
            if (p[0] == undefined) {
                p[0] = 0;
            }
            if (p[1] == undefined) {
                p[1] = 0;
            }
            s = intersect_parabolas(p, q);
        }
        k++;
        v[k] = q;
        z[k][0] = s[0];
        if (z[k + 1] == undefined) {
            z[k + 1] = [];
            z[k + 1][0] = 0;
            z[k + 1][1] = 0;
        }
        z[k + 1][0] = +INF;
    }
}

function march_parabolas(single_row, hull_vertices, hull_intersections) {
    let d = single_row;
    let v = hull_vertices;
    let z = hull_intersections;
    let k = 0;

    for (let q = 0; q < d.length; q++) {
        if (z[k + 1] == undefined || z[k + 1][0] == undefined) {
            z[k + 1] = [];
            z[k + 1] = 0;
        }

        while (z[k + 1][0] < q) {
            k++;
        }
        if (v[k] == undefined || v[k][0] == undefined) {
            v[k] = [];
            v[k][0] = 0;
            v[k][1] = 0;
        }
        let dx = q - v[k][0];
        d[q] = dx * dx + v[k][1];
    }
}
function horizontal_pass(single_row) {
    let hull_vertices = [];
    let hull_intersections = [];
    find_hull_parabolas(single_row, hull_vertices, hull_intersections);
    march_parabolas(single_row, hull_vertices, hull_intersections);
}

function compute_edt(bool_field) {
    let sedt = [];
    let r = bool_field.slice(0);
    for (let i = 0; i < he; i++) {
        sedt[i] = [];
    }
    for (let i = 0; i < he; i++) {
        for (let j = 0; j < wi; j++) {
            if (r[i * wi + j]) {
                r[i * wi + j] = 0;
            } else {
                r[i * wi + j] = +INF;
            }
            sedt[i][j] = r[i * wi + j];
        }
    }
    console.log(sedt);
    for (let i = 0; i < sedt.length; i++) {
        horizontal_pass(sedt[i]);
    }
    sedt = transpose(sedt);
    console.log(sedt);
    for (let i = 0; i < sedt.length; i++) {
        horizontal_pass(sedt[i]);
    }
    sedt = transpose(sedt);
    for (let i = 0; i < sedt.length; i++) {
        for (let j = 0; j < sedt[0].length; j++) {
            sedt[i][j] = Math.sqrt(sedt[i][j]);
        }
    }
    return sedt;
}

setTimeout(function main() {
    let tex = document.getElementById("t_orig");
    let sdf_tex = document.getElementById("t_sdf");

    // creating canvas
    let can = document.createElement("canvas");
    can.setAttribute("id", "orig");
    can.width = img.width;
    can.height = img.height;

    tex.insertAdjacentElement("afterend", can);
    let ctx = can.getContext("2d");

    // creating sdf canvas
    let sdf_can = document.createElement("canvas");
    sdf_can.setAttribute("id", "sdf");
    sdf_can.width = img.width; // For test!!!
    sdf_can.height = img.height; // For test!!!

    sdf_tex.insertAdjacentElement("afterend", sdf_can);
    let sdf_ctx = sdf_can.getContext("2d");

    // drawing original
    ctx.drawImage(img, 0, 0, img.width, img.height);
    // taking info from image
    let src = ctx.getImageData(0, 0, img.width, img.height).data;
    let data = [];
    for (let i = 0; i < src.length; i += 4) {
        data[i / 4] = src[i] / 255;
    }
    data = compute_edt(data);
    let buffer = new Uint8ClampedArray(img.width * img.height * 4);
    // console.log(data);
    // data = transpose(data, sdf_can.height, sdf_can.width);
    console.log(data);
    let sad = 0,
        sad2 = 0;
    const coef = 20;
    for (let i = 0; i < sdf_can.height; i++) {
        for (let j = 0; j < sdf_can.width; j++) {
            let pos = (i * sdf_can.width + j) * 4;
            if (sad >= data[0].length) {
                sad = 0;
                sad2 += 1;
            }
            buffer[pos] = data[sad2][sad] * coef;
            buffer[pos + 1] = data[sad2][sad] * coef;
            buffer[pos + 2] = data[sad2][sad] * coef;
            buffer[pos + 3] = 255;
            sad += 1;
        }
    }
    console.log(buffer);
    let idata = sdf_ctx.createImageData(sdf_can.width, sdf_can.height);
    idata.data.set(buffer);
    sdf_ctx.putImageData(idata, 0, 0);

    //console.log(src);
    //console.log(data);
}, 1000);
