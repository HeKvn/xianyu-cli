import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.mjs'],
  outDir: 'dist',
  format: ['esm'],
  platform: 'node',
  // 混淆压缩
  minify: true,
  // 保留头部 shebang
  shebang: '#!/usr/bin/env node',
  // 打包成单文件、内置依赖（可选）
  bundle: true,
  // 外部依赖排除（如果需要用户全局安装依赖就关掉）
  // external: []
})