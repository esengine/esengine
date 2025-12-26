# @esengine/network-server

## 1.0.2

### Patch Changes

- [#354](https://github.com/esengine/esengine/pull/354) [`1e240e8`](https://github.com/esengine/esengine/commit/1e240e86f2f75672c3609c9d86238a9ec08ebb4e) Thanks [@esengine](https://github.com/esengine)! - feat(cli): 增强 Node.js 服务端适配器

    **@esengine/cli:**
    - 添加 @esengine/network-server 依赖支持
    - 生成完整的 ECS 游戏服务器项目结构
    - 组件使用 @ECSComponent 装饰器注册
    - tsconfig 启用 experimentalDecorators

    **@esengine/network-server:**
    - 支持 ESM/CJS 双格式导出
    - 添加 ws@8.18.0 解决 Node.js 24 兼容性问题
