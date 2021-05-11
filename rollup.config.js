import { babel } from '@rollup/plugin-babel'

export default {
  input: 'src/index.js',
  output: [{
    file: 'fly-image.esm.js',
    format: 'esm'
  }, {
    file: 'fly-image.umd.js',
    format: 'umd',
    name: 'FlyImage'
  }],
  plugins: [
    babel({
      babelHelpers: 'bundled'
    })
  ]
}
