import terser from "@rollup/plugin-terser";

export default {
    input: "client/index.js",
    output: {
        dir: "client/output",
        format: "iife",
        sourcemap: "inline",
        name: "chsBundled",
    },
    plugins: [terser()],
};
