// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'ESEngine',
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/esengine/esengine' }
      ],
      defaultLocale: 'root',
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
        en: {
          label: 'English',
          lang: 'en',
        },
      },
      sidebar: [
        {
          label: '快速开始',
          translations: { en: 'Getting Started' },
          items: [
            { label: '快速入门', slug: 'guide/getting-started', translations: { en: 'Quick Start' } },
            { label: '指南概览', slug: 'guide', translations: { en: 'Guide Overview' } },
          ],
        },
        {
          label: '核心概念',
          translations: { en: 'Core Concepts' },
          items: [
            {
              label: '实体',
              translations: { en: 'Entity' },
              items: [
                { label: '概述', slug: 'guide/entity', translations: { en: 'Overview' } },
                { label: '组件操作', slug: 'guide/entity/component-operations', translations: { en: 'Component Operations' } },
                { label: '实体句柄', slug: 'guide/entity/entity-handle', translations: { en: 'Entity Handle' } },
                { label: '生命周期', slug: 'guide/entity/lifecycle', translations: { en: 'Lifecycle' } },
              ],
            },
            { label: '层级结构', slug: 'guide/hierarchy', translations: { en: 'Hierarchy' } },
            {
              label: '组件',
              translations: { en: 'Component' },
              items: [
                { label: '概述', slug: 'guide/component', translations: { en: 'Overview' } },
                { label: '生命周期', slug: 'guide/component/lifecycle', translations: { en: 'Lifecycle' } },
                { label: 'EntityRef 装饰器', slug: 'guide/component/entity-ref', translations: { en: 'EntityRef' } },
                { label: '最佳实践', slug: 'guide/component/best-practices', translations: { en: 'Best Practices' } },
              ],
            },
            {
              label: '实体查询',
              translations: { en: 'Entity Query' },
              items: [
                { label: '概述', slug: 'guide/entity-query', translations: { en: 'Overview' } },
                { label: 'Matcher API', slug: 'guide/entity-query/matcher-api', translations: { en: 'Matcher API' } },
                { label: '编译查询', slug: 'guide/entity-query/compiled-query', translations: { en: 'Compiled Query' } },
                { label: '最佳实践', slug: 'guide/entity-query/best-practices', translations: { en: 'Best Practices' } },
              ],
            },
            {
              label: '系统',
              translations: { en: 'System' },
              items: [
                { label: '概述', slug: 'guide/system', translations: { en: 'Overview' } },
                { label: '系统类型', slug: 'guide/system/types', translations: { en: 'System Types' } },
                { label: '生命周期', slug: 'guide/system/lifecycle', translations: { en: 'Lifecycle' } },
                { label: '命令缓冲区', slug: 'guide/system/command-buffer', translations: { en: 'Command Buffer' } },
                { label: '系统调度', slug: 'guide/system/scheduling', translations: { en: 'Scheduling' } },
                { label: '变更检测', slug: 'guide/system/change-detection', translations: { en: 'Change Detection' } },
                { label: '最佳实践', slug: 'guide/system/best-practices', translations: { en: 'Best Practices' } },
              ],
            },
            {
              label: '场景',
              translations: { en: 'Scene' },
              items: [
                { label: '概述', slug: 'guide/scene', translations: { en: 'Overview' } },
                { label: '生命周期', slug: 'guide/scene/lifecycle', translations: { en: 'Lifecycle' } },
                { label: '实体管理', slug: 'guide/scene/entity-management', translations: { en: 'Entity Management' } },
                { label: '系统管理', slug: 'guide/scene/system-management', translations: { en: 'System Management' } },
                { label: '事件系统', slug: 'guide/scene/events', translations: { en: 'Events' } },
                { label: '调试与监控', slug: 'guide/scene/debugging', translations: { en: 'Debugging' } },
                { label: '最佳实践', slug: 'guide/scene/best-practices', translations: { en: 'Best Practices' } },
              ],
            },
            {
              label: '序列化',
              translations: { en: 'Serialization' },
              items: [
                { label: '概述', slug: 'guide/serialization', translations: { en: 'Overview' } },
                { label: '装饰器与继承', slug: 'guide/serialization/decorators', translations: { en: 'Decorators & Inheritance' } },
                { label: '增量序列化', slug: 'guide/serialization/incremental', translations: { en: 'Incremental' } },
                { label: '版本迁移', slug: 'guide/serialization/migration', translations: { en: 'Migration' } },
                { label: '使用场景', slug: 'guide/serialization/use-cases', translations: { en: 'Use Cases' } },
              ],
            },
            { label: '事件系统', slug: 'guide/event-system', translations: { en: 'Event System' } },
            { label: '时间与定时器', slug: 'guide/time-and-timers', translations: { en: 'Time & Timers' } },
            { label: '日志系统', slug: 'guide/logging', translations: { en: 'Logging' } },
          ],
        },
        {
          label: '高级功能',
          translations: { en: 'Advanced Features' },
          items: [
            {
              label: '服务容器',
              translations: { en: 'Service Container' },
              items: [
                { label: '概述', slug: 'guide/service-container', translations: { en: 'Overview' } },
                { label: '内置服务', slug: 'guide/service-container/built-in-services', translations: { en: 'Built-in Services' } },
                { label: '依赖注入', slug: 'guide/service-container/dependency-injection', translations: { en: 'Dependency Injection' } },
                { label: 'PluginServiceRegistry', slug: 'guide/service-container/plugin-service-registry', translations: { en: 'PluginServiceRegistry' } },
                { label: '高级用法', slug: 'guide/service-container/advanced', translations: { en: 'Advanced' } },
              ],
            },
            {
              label: '插件系统',
              translations: { en: 'Plugin System' },
              items: [
                { label: '概述', slug: 'guide/plugin-system', translations: { en: 'Overview' } },
                { label: '插件开发', slug: 'guide/plugin-system/development', translations: { en: 'Development' } },
                { label: '服务与系统', slug: 'guide/plugin-system/services-systems', translations: { en: 'Services & Systems' } },
                { label: '依赖管理', slug: 'guide/plugin-system/dependencies', translations: { en: 'Dependencies' } },
                { label: '插件管理', slug: 'guide/plugin-system/management', translations: { en: 'Management' } },
                { label: '示例插件', slug: 'guide/plugin-system/examples', translations: { en: 'Examples' } },
                { label: '最佳实践', slug: 'guide/plugin-system/best-practices', translations: { en: 'Best Practices' } },
              ],
            },
            {
              label: 'Worker 系统',
              translations: { en: 'Worker System' },
              items: [
                { label: '概述', slug: 'guide/worker-system', translations: { en: 'Overview' } },
                { label: '配置选项', slug: 'guide/worker-system/configuration', translations: { en: 'Configuration' } },
                { label: '完整示例', slug: 'guide/worker-system/examples', translations: { en: 'Examples' } },
                { label: '微信小游戏', slug: 'guide/worker-system/wechat', translations: { en: 'WeChat' } },
                { label: '最佳实践', slug: 'guide/worker-system/best-practices', translations: { en: 'Best Practices' } },
              ],
            },
          ],
        },
        {
          label: '平台适配器',
          translations: { en: 'Platform Adapters' },
          items: [
            { label: '概览', slug: 'guide/platform-adapter', translations: { en: 'Overview' } },
            { label: '浏览器', slug: 'guide/platform-adapter/browser', translations: { en: 'Browser' } },
            { label: '微信小游戏', slug: 'guide/platform-adapter/wechat-minigame', translations: { en: 'WeChat Mini Game' } },
            { label: 'Node.js', slug: 'guide/platform-adapter/nodejs', translations: { en: 'Node.js' } },
          ],
        },
        {
          label: '模块',
          translations: { en: 'Modules' },
          items: [
            { label: '模块总览', slug: 'modules', translations: { en: 'Modules Overview' } },
            {
              label: '行为树',
              translations: { en: 'Behavior Tree' },
              items: [
                { label: '概述', slug: 'modules/behavior-tree', translations: { en: 'Overview' } },
                { label: '快速开始', slug: 'modules/behavior-tree/getting-started', translations: { en: 'Getting Started' } },
                { label: '核心概念', slug: 'modules/behavior-tree/core-concepts', translations: { en: 'Core Concepts' } },
                { label: '编辑器指南', slug: 'modules/behavior-tree/editor-guide', translations: { en: 'Editor Guide' } },
                { label: '编辑器工作流', slug: 'modules/behavior-tree/editor-workflow', translations: { en: 'Editor Workflow' } },
                { label: '资产管理', slug: 'modules/behavior-tree/asset-management', translations: { en: 'Asset Management' } },
                { label: '自定义节点', slug: 'modules/behavior-tree/custom-actions', translations: { en: 'Custom Actions' } },
                { label: '高级用法', slug: 'modules/behavior-tree/advanced-usage', translations: { en: 'Advanced Usage' } },
                { label: '最佳实践', slug: 'modules/behavior-tree/best-practices', translations: { en: 'Best Practices' } },
                { label: 'Cocos 集成', slug: 'modules/behavior-tree/cocos-integration', translations: { en: 'Cocos Integration' } },
                { label: 'Laya 集成', slug: 'modules/behavior-tree/laya-integration', translations: { en: 'Laya Integration' } },
                { label: 'Node.js 使用', slug: 'modules/behavior-tree/nodejs-usage', translations: { en: 'Node.js Usage' } },
              ],
            },
            { label: '状态机', slug: 'modules/fsm', translations: { en: 'FSM' } },
            { label: '定时器', slug: 'modules/timer', translations: { en: 'Timer' } },
            { label: '空间索引', slug: 'modules/spatial', translations: { en: 'Spatial' } },
            { label: '寻路', slug: 'modules/pathfinding', translations: { en: 'Pathfinding' } },
            { label: '蓝图', slug: 'modules/blueprint', translations: { en: 'Blueprint' } },
            { label: '程序生成', slug: 'modules/procgen', translations: { en: 'Procgen' } },
            {
              label: '网络',
              translations: { en: 'Network' },
              items: [
                { label: '概述', slug: 'modules/network', translations: { en: 'Overview' } },
                { label: '客户端', slug: 'modules/network/client', translations: { en: 'Client' } },
                { label: '服务器', slug: 'modules/network/server', translations: { en: 'Server' } },
                { label: '状态同步', slug: 'modules/network/sync', translations: { en: 'State Sync' } },
                { label: 'API 参考', slug: 'modules/network/api', translations: { en: 'API Reference' } },
              ],
            },
          ],
        },
        {
          label: '示例',
          translations: { en: 'Examples' },
          items: [
            { label: '示例总览', slug: 'examples', translations: { en: 'Examples Overview' } },
            { label: 'Worker 系统演示', slug: 'examples/worker-system-demo', translations: { en: 'Worker System Demo' } },
          ],
        },
        {
          label: 'API 参考',
          translations: { en: 'API Reference' },
          autogenerate: { directory: 'api' },
        },
        {
          label: '更新日志',
          translations: { en: 'Changelog' },
          items: [
            { label: '@esengine/ecs-framework', link: 'https://github.com/esengine/esengine/blob/master/packages/framework/core/CHANGELOG.md', attrs: { target: '_blank' } },
            { label: '@esengine/behavior-tree', link: 'https://github.com/esengine/esengine/blob/master/packages/framework/behavior-tree/CHANGELOG.md', attrs: { target: '_blank' } },
            { label: '@esengine/fsm', link: 'https://github.com/esengine/esengine/blob/master/packages/framework/fsm/CHANGELOG.md', attrs: { target: '_blank' } },
            { label: '@esengine/timer', link: 'https://github.com/esengine/esengine/blob/master/packages/framework/timer/CHANGELOG.md', attrs: { target: '_blank' } },
            { label: '@esengine/network', link: 'https://github.com/esengine/esengine/blob/master/packages/framework/network/CHANGELOG.md', attrs: { target: '_blank' } },
            { label: '@esengine/cli', link: 'https://github.com/esengine/esengine/blob/master/packages/tools/cli/CHANGELOG.md', attrs: { target: '_blank' } },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      head: [
        { tag: 'meta', attrs: { name: 'theme-color', content: '#646cff' } },
      ],
      components: {
        Head: './src/components/Head.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
    }),
    vue(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
