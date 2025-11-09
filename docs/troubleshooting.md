# Simple Sidebar Kanban – 开发/调试注意点

> 随着功能不断增加，这个插件里有几个容易踩坑的点。下面记录在开发和调试时需要特别注意的内容，方便以后排查问题。

## 1. 构建与部署

- **必须运行 `npm run build` 或 `npm run dev:sync`** 才能生成最新的 `main.js` 并把它拷贝到 Obsidian 插件目录。单纯改动 `src/*.ts` 不会自动生效。
- 推荐使用 `npm run dev:sync`：
  - 启动 `esbuild` 的 `--watch`，实时编译 TypeScript；
  - 监听 `main.js`、`styles.css`、`manifest.json`，变化后自动复制到 `/Users/rustling/Desktop/project_sha/01_simple_kanban/test_ob_plugin_vault/.obsidian/plugins/simple-kanban-sidebar`（可通过 `SIMPLE_KANBAN_DEPLOY` 环境变量覆盖）。
- 复制完成后仍需在 Obsidian 中重载插件（关闭/开启或热重载），否则运行的仍然是旧版本。

## 2. 统计视图相关

- **时间范围对统计结果影响巨大**。例如“近 14 天”只覆盖当前日期往前数 14 天（以零点为界），如果所有完成动作都发生在更晚的日期，完成率会显示为 0%。可通过自定义时间范围包含实际完成日期。
- 每次渲染统计都会在控制台输出 `[SimpleKanban][Stats] …` 日志，
  - `Snapshot` 表示当前区间的原始统计结果；
  - `Created/Completed series stats` 可用来确认哪些任务被计入/排除；
  - `Daily rate samples` 与 `Daily rate coordinates` 用于验证折线的输入和坐标。
- 如果 Console 里只有旧日志，通常意味着 Vault 里还在运行旧的 `main.js`——再回到“构建与部署”检查是否重新构建并复制。

## 3. SVG 渲染陷阱

- Obsidian 的 `createEl` 会创建 HTML 元素，不能直接用来生成 `<svg>`、`<polyline>` 等节点。必须使用 `document.createElementNS("http://www.w3.org/2000/svg", tag)` 来渲染折线，否则看不到图形。
- 我们通过 `createSvgElement`/`setSvgAttrs` 封装了这段逻辑，后续做图表时务必复用，避免再次踩坑。

## 4. 其他

- Deadline（截止时间）相关统计只针对带 `deadline` 的任务。若想看到逾期率/按时完成率，需要在卡片上设置截止时间。
- 完成记录使用 `completedAt` 字段，只有调用“标记完成”时才会写入。因此若手动编辑 `data.json` 或通过其他方式调整状态，请同步更新 `completedAt`，否则统计会认为该任务尚未完成。

保持这些注意事项，就能避免 “日志无输出/统计为空/图表不渲染” 等常见问题。
