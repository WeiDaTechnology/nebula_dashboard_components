const typescript = require('@rollup/plugin-typescript')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')
const { dts } = require('rollup-plugin-dts')

module.exports = ({ pkg }) => {
  const input = 'src/index.ts'
  // 只 external peerDependencies
  const external = [...Object.keys(pkg.peerDependencies || {})]

  // 生成不同格式的配置
  const formats = [
    {
      format: 'cjs',
      file: pkg.main,
      sourcemap: true,
    },
    {
      format: 'esm',
      file: pkg.module,
      sourcemap: true,
    },
  ]

  // 基础配置
  const baseConfig = {
    input,
    external,
    plugins: [
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      }),
      commonjs(),
      json(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        declaration: true,
        declarationDir: 'dist',
        exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
      }),
    ],
  }

  // 生成所有配置
  const config = [
    // 生成 JS 文件
    ...formats.map(format => ({
      ...baseConfig,
      output: format,
    })),
    // 生成类型声明文件
    {
      input,
      external,
      plugins: [dts()],
      output: {
        file: pkg.types,
        format: 'esm',
      },
    },
  ]

  return config
}
