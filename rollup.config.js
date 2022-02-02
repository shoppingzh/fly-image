import { babel } from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.js',
  output: [{
    file: 'dist/fly-image.js',
    format: 'esm',
    name: 'FlyImage'
  }],
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: 'bundled'
    }),
    terser()
  ]
}
