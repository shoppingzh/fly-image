import { defineConfig } from 'rollup'
import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import sizes from '@atomico/rollup-plugin-sizes'
import ts from '@rollup/plugin-typescript'
import beep from '@rollup/plugin-beep'
import { terser } from 'rollup-plugin-terser'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'umd',
    name: 'MyLib',
    globals: {
      'lodash': '_',
      '@babel/runtime-corejs2/helpers/classCallCheck': '_classCallCheck',
      '@babel/runtime-corejs2/helpers/createClass': '_createClass'
    }
  },
  external: [
    'lodash',
    /@babel\/runtime/
  ],
  plugins: [
    // 别名
    alias({
      entries: [{
        find: '@utils',
        replacement: 'src/utils'
      }]
    }),
    ts(), 
    // 代码转译、polyfill
    babel({
      babelHelpers: 'runtime'
    }),
    // 生成包大小监控
    sizes(100),
    // 代码混淆
    terser(),
    // 警告
    beep()
  ]
})
