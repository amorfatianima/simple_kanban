/*
THIS IS A GENERATED FILE BY THE SIMPLE SIDEBAR KANBAN PLUGIN.
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => SimpleKanbanPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var VIEW_TYPE = "simple-kanban-sidebar-view";
var ICON_ID = "simple-kanban-emoji";
var DEFAULT_COLUMNS = ["\u5F85\u5904\u7406", "\u8FDB\u884C\u4E2D", "\u5DF2\u5B8C\u6210"];
function createDefaultBoard() {
  return {
    columns: DEFAULT_COLUMNS.map((name) => ({
      id: createId(),
      name,
      cards: []
    }))
  };
}
var SimpleKanbanPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.board = createDefaultBoard();
    this.views = /* @__PURE__ */ new Set();
  }
  async onload() {
    await this.loadBoard();
    (0, import_obsidian.addIcon)(
      ICON_ID,
      `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="12" y="20" font-size="20" text-anchor="middle">\u{1F42F}</text></svg>`
    );
    this.registerView(VIEW_TYPE, (leaf) => {
      const view = new KanbanView(leaf, this);
      this.registerKanbanView(view);
      return view;
    });
    this.addRibbonIcon(ICON_ID, "\u6253\u5F00\u53F3\u4FA7\u770B\u677F", () => this.activateView());
    this.addCommand({
      id: "simple-kanban-open",
      name: "\u6253\u5F00\u53F3\u4FA7\u770B\u677F",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "simple-kanban-add-card",
      name: "\u6DFB\u52A0\u5361\u7247",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "N" }],
      callback: () => this.openQuickAddCard()
    });
    this.app.workspace.onLayoutReady(() => this.activateView());
  }
  onunload() {
    this.views.clear();
  }
  async loadBoard() {
    const stored = await this.loadData();
    if (stored && stored.columns) {
      this.board = stored;
    } else {
      this.board = createDefaultBoard();
    }
    this.normalizeBoard();
    this.lastColumnId = this.board.columns[0]?.id;
  }
  async persist() {
    await this.saveData(this.board);
    this.notifyViews();
  }
  registerKanbanView(view) {
    this.views.add(view);
    view.register(() => this.views.delete(view));
  }
  notifyViews() {
    this.views.forEach((view) => view.render());
  }
  getBoard() {
    return this.board;
  }
  async addColumn(name) {
    if (!name.trim()) {
      new import_obsidian.Notice("\u680F\u76EE\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
      return;
    }
    const column = { id: createId(), name: name.trim(), cards: [] };
    this.board.columns.push(column);
    if (!this.lastColumnId) {
      this.lastColumnId = column.id;
    }
    await this.persist();
  }
  async removeColumn(columnId) {
    const index = this.board.columns.findIndex((col) => col.id === columnId);
    if (index === -1) {
      new import_obsidian.Notice("\u672A\u627E\u5230\u6307\u5B9A\u680F\u76EE");
      return;
    }
    this.board.columns.splice(index, 1);
    if (this.lastColumnId === columnId) {
      this.lastColumnId = this.board.columns[0]?.id;
    }
    await this.persist();
  }
  async renameColumn(columnId, name) {
    const column = this.getColumn(columnId);
    const nextName = name.trim();
    if (!nextName) {
      new import_obsidian.Notice("\u680F\u76EE\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
      return;
    }
    column.name = nextName;
    await this.persist();
  }
  async addCard(columnId, payload) {
    const column = this.getColumn(columnId);
    const now = Date.now();
    const card = {
      id: createId(),
      title: payload.title.trim(),
      tags: payload.tags,
      remark: payload.remark,
      deadline: payload.deadline ?? null,
      completed: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      history: []
    };
    this.recordHistory(card, payload.historyNote || "\u521B\u5EFA");
    column.cards.unshift(card);
    await this.persist();
  }
  async updateCard(columnId, cardId, updates, historyNote) {
    const card = this.getCard(columnId, cardId);
    if (!card)
      return;
    if (updates.title !== void 0)
      card.title = updates.title.trim();
    if (updates.tags !== void 0)
      card.tags = updates.tags;
    if (updates.remark !== void 0)
      card.remark = updates.remark;
    if (updates.deadline !== void 0)
      card.deadline = updates.deadline;
    card.updatedAt = Date.now();
    this.recordHistory(card, historyNote || "\u5185\u5BB9\u66F4\u65B0");
    await this.persist();
  }
  async moveCard(cardId, fromColumnId, toColumnId, beforeCardId) {
    const fromColumn = this.getColumn(fromColumnId);
    const toColumn = this.getColumn(toColumnId);
    const index = fromColumn.cards.findIndex((c) => c.id === cardId);
    if (index === -1)
      return;
    const [card] = fromColumn.cards.splice(index, 1);
    let targetIndex = toColumn.cards.length;
    if (beforeCardId) {
      const beforeIndex = toColumn.cards.findIndex((c) => c.id === beforeCardId);
      targetIndex = beforeIndex === -1 ? toColumn.cards.length : beforeIndex;
    }
    toColumn.cards.splice(targetIndex, 0, card);
    card.updatedAt = Date.now();
    if (fromColumnId !== toColumnId) {
      this.recordHistory(card, `\u79FB\u52A8\u5230\u300C${toColumn.name}\u300D`);
    } else {
      this.recordHistory(card, "\u8C03\u6574\u987A\u5E8F");
    }
    await this.persist();
  }
  async toggleCardCompletion(columnId, cardId, completed) {
    const column = this.getColumn(columnId);
    const index = column.cards.findIndex((c) => c.id === cardId);
    if (index === -1)
      return;
    const [card] = column.cards.splice(index, 1);
    card.completed = completed;
    card.completedAt = completed ? Date.now() : null;
    card.updatedAt = Date.now();
    this.recordHistory(card, completed ? "\u6807\u8BB0\u5B8C\u6210" : "\u53D6\u6D88\u5B8C\u6210");
    const insertIndex = completed ? column.cards.length : Math.min(index, column.cards.length);
    column.cards.splice(insertIndex, 0, card);
    await this.persist();
  }
  getColumn(columnId) {
    const column = this.board.columns.find((col) => col.id === columnId);
    if (!column) {
      throw new Error("\u672A\u627E\u5230\u6307\u5B9A\u7684\u680F\u76EE");
    }
    return column;
  }
  getCard(columnId, cardId) {
    const column = this.getColumn(columnId);
    return column.cards.find((card) => card.id === cardId);
  }
  recordHistory(card, remark) {
    if (!Array.isArray(card.history)) {
      card.history = [];
    }
    card.history.unshift({
      timestamp: Date.now(),
      remark: remark || "\u66F4\u65B0"
    });
    card.history = card.history.slice(0, 50);
  }
  normalizeBoard() {
    for (const column of this.board.columns) {
      column.cards = column.cards.map((card) => ({
        ...card,
        deadline: card.deadline ?? null,
        completedAt: card.completedAt ?? null
      }));
    }
  }
  async activateView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (leaves.length > 0) {
      this.app.workspace.revealLeaf(leaves[0]);
      return;
    }
    const rightLeaf = this.app.workspace.getRightLeaf(false);
    await rightLeaf?.setViewState({ type: VIEW_TYPE, active: true });
    if (rightLeaf) {
      this.app.workspace.revealLeaf(rightLeaf);
    }
  }
  setActiveColumn(columnId) {
    this.lastColumnId = columnId;
  }
  resolveColumnForQuickAdd() {
    if (!this.board.columns.length)
      return void 0;
    const preferred = this.lastColumnId && this.board.columns.find((col) => col.id === this.lastColumnId);
    return preferred ?? this.board.columns[0];
  }
  openQuickAddCard() {
    const column = this.resolveColumnForQuickAdd();
    if (!column) {
      new import_obsidian.Notice("\u8BF7\u5148\u65B0\u589E\u680F\u76EE");
      return;
    }
    this.setActiveColumn(column.id);
    new CardModal(this.app, this, column.id).open();
  }
};
var KanbanView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.deadlineFilters = /* @__PURE__ */ new Map();
    this.activeTab = "board";
    this.statsRange = { type: "preset", days: 14 };
    this.timelinePreset = "today";
    this.lastScrollTop = 0;
    this.columnScroll = /* @__PURE__ */ new Map();
    this.scrollHandler = (evt) => {
      const target = evt.target ?? this.scrollTarget ?? this.contentEl;
      this.lastScrollTop = target.scrollTop;
    };
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "\u53F3\u4FA7\u770B\u677F";
  }
  getIcon() {
    return ICON_ID;
  }
  async onOpen() {
    this.render();
  }
  async onClose() {
    this.dragState = void 0;
    this.teardownScrollTarget();
    this.outerScrollTarget = void 0;
  }
  render() {
    const container = this.contentEl;
    const outer = this.findScrollParent(container);
    const currentScroll = this.scrollTarget?.scrollTop ?? container.scrollTop;
    const outerScroll = outer?.scrollTop ?? 0;
    this.lastScrollTop = currentScroll;
    const lastOuter = outerScroll;
    console.log("[SimpleKanban][Scroll] before render", {
      tab: this.activeTab,
      saved: this.lastScrollTop,
      current: currentScroll,
      outer: lastOuter
    });
    this.captureColumnScroll();
    container.empty();
    container.addClass("sk-kanban");
    const tabs = container.createDiv({ cls: "sk-tabs" });
    this.renderTabButton(tabs, "board", "\u4EFB\u52A1\u770B\u677F");
    this.renderTabButton(tabs, "stats", "\u6548\u7387\u7EDF\u8BA1");
    this.renderTabButton(tabs, "timeline", "\u65F6\u95F4\u8F74");
    const body = container.createDiv({ cls: "sk-tab-panel" });
    if (this.activeTab === "board") {
      this.renderBoard(body);
    } else if (this.activeTab === "stats") {
      this.renderStats(body);
    } else {
      this.renderTimeline(body);
    }
    this.setupScrollTarget(body);
    this.restoreOuterScroll(outerScroll, outer);
    this.restoreColumnScroll();
  }
  setupScrollTarget(el) {
    this.teardownScrollTarget();
    this.scrollTarget = el;
    this.scrollTarget.addEventListener("scroll", this.scrollHandler, { passive: true });
    const targetScroll = this.lastScrollTop;
    console.log("[SimpleKanban][Scroll] setup", {
      tab: this.activeTab,
      targetScroll,
      targetHeight: this.scrollTarget.scrollHeight,
      targetClient: this.scrollTarget.clientHeight
    });
    requestAnimationFrame(() => {
      if (this.scrollTarget) {
        this.scrollTarget.scrollTop = targetScroll;
        console.log("[SimpleKanban][Scroll] after render", {
          tab: this.activeTab,
          restored: targetScroll,
          actual: this.scrollTarget.scrollTop,
          targetHeight: this.scrollTarget.scrollHeight,
          targetClient: this.scrollTarget.clientHeight,
          outer: this.outerScrollTarget?.scrollTop ?? 0
        });
      }
    });
  }
  teardownScrollTarget() {
    if (this.scrollTarget) {
      this.scrollTarget.removeEventListener("scroll", this.scrollHandler);
    }
    this.scrollTarget = void 0;
  }
  restoreOuterScroll(value, target) {
    if (!target)
      return;
    this.outerScrollTarget = target;
    requestAnimationFrame(() => {
      if (this.outerScrollTarget) {
        this.outerScrollTarget.scrollTop = value;
      }
    });
  }
  captureColumnScroll() {
    const containers = Array.from(
      this.contentEl.querySelectorAll(".sk-cards[data-column]")
    );
    containers.forEach((el) => {
      const columnId = el.getAttribute("data-column");
      if (columnId) {
        this.columnScroll.set(columnId, el.scrollTop);
      }
    });
  }
  restoreColumnScroll() {
    const containers = Array.from(
      this.contentEl.querySelectorAll(".sk-cards[data-column]")
    );
    containers.forEach((el) => {
      const columnId = el.getAttribute("data-column");
      if (!columnId)
        return;
      const target = this.columnScroll.get(columnId) ?? 0;
      el.scrollTop = target;
      el.addEventListener(
        "scroll",
        (evt) => {
          const targetEl = evt.target;
          this.columnScroll.set(columnId, targetEl.scrollTop);
        },
        { passive: true }
      );
    });
  }
  findScrollParent(el) {
    let node = el;
    while (node) {
      if (node.scrollHeight > node.clientHeight + 4) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }
  renderTabButton(container, tab, label) {
    const button = container.createEl("button", {
      text: label,
      cls: ["sk-tab", this.activeTab === tab ? "sk-tab-active" : ""].join(" ").trim()
    });
    button.addEventListener("click", () => {
      if (this.activeTab === tab)
        return;
      this.activeTab = tab;
      this.render();
    });
  }
  renderBoard(body) {
    const board = this.plugin.getBoard();
    const header = body.createDiv({ cls: "sk-header" });
    header.createEl("h2", { text: "\u4FA7\u8FB9\u770B\u677F" });
    const addColumnBtn = header.createEl("button", {
      text: "\u65B0\u589E\u680F\u76EE",
      cls: "sk-btn"
    });
    addColumnBtn.addEventListener("click", () => {
      new ColumnModal(this.app, {
        title: "\u65B0\u589E\u680F\u76EE",
        confirmText: "\u521B\u5EFA",
        onSubmit: async (value) => {
          await this.plugin.addColumn(value);
        }
      }).open();
    });
    const columnsWrapper = body.createDiv({ cls: "sk-columns" });
    if (!board.columns.length) {
      columnsWrapper.createDiv({ text: "\u6682\u65E0\u680F\u76EE\uFF0C\u70B9\u51FB\u201C\u65B0\u589E\u680F\u76EE\u201D\u3002", cls: "sk-empty" });
      return;
    }
    for (const column of board.columns) {
      this.renderColumn(columnsWrapper, column);
    }
  }
  renderStats(body) {
    const stats = this.buildStatsSnapshot(this.statsRange);
    console.log("[SimpleKanban][Stats] Snapshot", {
      range: this.statsRange,
      dailySeries: stats.dailySeries,
      dailyRates: stats.dailyRates
    });
    body.createEl("h2", { text: "\u6548\u7387\u7EDF\u8BA1", cls: "sk-stats-title" });
    const rangeControls = body.createDiv({ cls: "sk-range-controls" });
    rangeControls.createSpan({ text: "\u65F6\u95F4\u8303\u56F4\uFF1A" });
    const select = rangeControls.createEl("select", { cls: "sk-range-select" });
    const presetOptions = { "7\u5929": 7, "14\u5929": 14, "30\u5929": 30, "90\u5929": 90 };
    Object.entries(presetOptions).forEach(([label, days]) => {
      const option = select.createEl("option", { text: label, value: days.toString() });
      if (this.statsRange.type === "preset" && this.statsRange.days === days)
        option.selected = true;
    });
    const customOption = select.createEl("option", { text: "\u81EA\u5B9A\u4E49", value: "custom" });
    if (this.statsRange.type === "custom")
      customOption.selected = true;
    const customFields = rangeControls.createDiv({ cls: "sk-range-custom" });
    const startInput = customFields.createEl("input", { type: "date" });
    const endInput = customFields.createEl("input", { type: "date" });
    const updateCustomInputs = () => {
      if (this.statsRange.type === "custom") {
        startInput.value = formatDateInputValue(this.statsRange.start);
        endInput.value = formatDateInputValue(this.statsRange.end);
        customFields.addClass("sk-range-custom-visible");
      } else {
        customFields.removeClass("sk-range-custom-visible");
      }
    };
    updateCustomInputs();
    select.addEventListener("change", () => {
      if (select.value === "custom") {
        const today = this.startOfDay(Date.now());
        const defaultStart = today - 13 * 24 * 60 * 60 * 1e3;
        this.statsRange = { type: "custom", start: defaultStart, end: today };
      } else {
        this.statsRange = { type: "preset", days: Number(select.value) };
      }
      updateCustomInputs();
      this.render();
    });
    const handleCustomChange = () => {
      if (this.statsRange.type !== "custom")
        return;
      const startTs = startInput.value ? this.startOfDay(new Date(startInput.value).getTime()) : null;
      const endTs = endInput.value ? this.startOfDay(new Date(endInput.value).getTime()) : null;
      if (startTs && endTs && startTs <= endTs) {
        this.statsRange = { type: "custom", start: startTs, end: endTs };
        this.render();
      }
    };
    startInput.addEventListener("change", handleCustomChange);
    endInput.addEventListener("change", handleCustomChange);
    const dashboard = body.createDiv({ cls: "sk-stats-dashboard" });
    this.renderStatCard(dashboard, "\u603B\u4EFB\u52A1", stats.totalTasks.toString(), "\u7D2F\u8BA1\u521B\u5EFA");
    this.renderStatCard(
      dashboard,
      "\u5B8C\u6210\u7387",
      formatPercent(stats.completionRate),
      `\u5DF2\u5B8C\u6210 ${stats.completedTasks}/${stats.totalTasks || 1}`
    );
    this.renderStatCard(dashboard, "\u5F53\u524D\u8FDB\u884C\u4E2D", stats.wipCount.toString(), "\u4ECD\u672A\u5B8C\u6210");
    this.renderStatCard(
      dashboard,
      "\u903E\u671F\u7387",
      stats.deadlineCount ? formatPercent(stats.overdueRate) : "\u2014",
      `${stats.overdueCount}/${stats.deadlineCount || 1} \u622A\u6B62\u4EFB\u52A1`
    );
    this.renderStatCard(
      dashboard,
      "\u6309\u65F6\u5B8C\u6210\u7387",
      stats.deadlineCount ? formatPercent(stats.onTimeRate) : "\u2014",
      "\u622A\u6B62\u4EFB\u52A1\u6309\u65F6\u5B8C\u6210"
    );
    this.renderStatCard(
      dashboard,
      "\u5E73\u5747\u5B8C\u6210\u5468\u671F",
      stats.avgCycleTimeMs ? formatDuration(stats.avgCycleTimeMs) : "\u2014",
      "\u4ECE\u521B\u5EFA\u5230\u5B8C\u6210"
    );
    const chartSection = body.createDiv({ cls: "sk-stats-section" });
    chartSection.createEl("h3", { text: "\u6BCF\u65E5\u4EFB\u52A1\u8D8B\u52BF" });
    this.renderDailyBarChart(chartSection, stats.dailySeries);
    const rateSection = body.createDiv({ cls: "sk-stats-section" });
    rateSection.createEl("h3", { text: "\u6BCF\u65E5\u5B8C\u6210\u7387" });
    this.renderDailyRateChart(rateSection, stats.dailyRates);
    const deadlineSection = body.createDiv({ cls: "sk-stats-section" });
    deadlineSection.createEl("h3", { text: "\u622A\u6B62\u4EFB\u52A1\u6982\u89C8" });
    this.renderDeadlineBreakdown(deadlineSection, stats);
  }
  renderTimeline(body) {
    const { start, end } = this.resolveTimelineRange();
    const entries = this.buildTimelineEntries(start, end);
    const header = body.createDiv({ cls: "sk-header" });
    header.createEl("h2", { text: "\u65F6\u95F4\u8F74" });
    const controls = header.createDiv({ cls: "sk-timeline-controls" });
    const presetSelect = controls.createEl("select");
    [
      { value: "today", label: "\u4ECA\u5929" },
      { value: "yesterday", label: "\u6628\u5929" },
      { value: "custom", label: "\u81EA\u5B9A\u4E49" }
    ].forEach((option) => {
      const opt = presetSelect.createEl("option", { text: option.label, value: option.value });
      if (this.timelinePreset === option.value)
        opt.selected = true;
    });
    const customWrapper = controls.createDiv({ cls: "sk-range-custom" });
    const startInput = customWrapper.createEl("input", { type: "date" });
    const endInput = customWrapper.createEl("input", { type: "date" });
    const updateCustomInputs = () => {
      if (this.timelinePreset === "custom" && this.timelineCustom) {
        startInput.value = formatDateInputValue(this.timelineCustom.start);
        endInput.value = formatDateInputValue(this.timelineCustom.end);
        customWrapper.addClass("sk-range-custom-visible");
      } else {
        customWrapper.removeClass("sk-range-custom-visible");
      }
    };
    updateCustomInputs();
    const applyPreset = () => {
      const value = presetSelect.value;
      this.timelinePreset = value;
      if (value === "today") {
        const today = this.startOfDay(Date.now());
        this.timelineCustom = { start: today, end: today };
      } else if (value === "yesterday") {
        const today = this.startOfDay(Date.now());
        const yesterday = today - 24 * 60 * 60 * 1e3;
        this.timelineCustom = { start: yesterday, end: yesterday };
      } else if (!this.timelineCustom) {
        const today = this.startOfDay(Date.now());
        this.timelineCustom = { start: today, end: today };
      }
      updateCustomInputs();
      this.render();
    };
    presetSelect.addEventListener("change", applyPreset);
    const handleCustomChange = () => {
      if (this.timelinePreset !== "custom")
        return;
      const startDate = startInput.value ? new Date(startInput.value).getTime() : null;
      const endDate = endInput.value ? new Date(endInput.value).getTime() : null;
      if (startDate && endDate && startDate <= endDate) {
        this.timelineCustom = {
          start: this.startOfDay(startDate),
          end: this.startOfDay(endDate)
        };
        this.render();
      }
    };
    startInput.addEventListener("change", handleCustomChange);
    endInput.addEventListener("change", handleCustomChange);
    if (!entries.length) {
      body.createDiv({ cls: "sk-empty", text: "\u8BE5\u65F6\u95F4\u8303\u56F4\u5185\u6CA1\u6709\u64CD\u4F5C\u8BB0\u5F55" });
      return;
    }
    const timelineWrapper = body.createDiv({ cls: "sk-timeline-wrapper" });
    const timeline = timelineWrapper.createDiv({ cls: "sk-timeline" });
    entries.forEach((entry) => {
      const row = timeline.createDiv({ cls: "sk-timeline-row" });
      const timeBox = row.createDiv({ cls: "sk-timeline-timebox" });
      timeBox.createDiv({ cls: "sk-timeline-date", text: formatDateOnly(entry.timestamp) });
      timeBox.createDiv({ cls: "sk-timeline-time", text: formatTime(entry.timestamp) });
      timeBox.setAttr("title", formatDate(entry.timestamp));
      const marker = row.createDiv({ cls: "sk-timeline-marker" });
      const content = row.createDiv({ cls: "sk-timeline-content" });
      content.createDiv({ cls: "sk-timeline-card-title", text: entry.cardTitle });
      content.createDiv({ cls: "sk-timeline-card-body", text: entry.text });
    });
  }
  renderColumn(wrapper, column) {
    const columnEl = wrapper.createDiv({ cls: "sk-column" });
    const columnHeader = columnEl.createDiv({ cls: "sk-column-header" });
    const titleEl = columnHeader.createDiv({ cls: "sk-column-title", attr: { role: "button" } });
    titleEl.createEl("h3", { text: column.name });
    titleEl.addEventListener("click", () => {
      new ColumnModal(this.app, {
        title: "\u7F16\u8F91\u680F\u76EE",
        initialValue: column.name,
        confirmText: "\u4FDD\u5B58",
        onSubmit: async (value) => {
          await this.plugin.renameColumn(column.id, value);
        }
      }).open();
    });
    const actionsEl = columnHeader.createDiv({ cls: "sk-column-actions" });
    const addBtn = actionsEl.createEl("button", { text: "\u6DFB\u52A0\u5361\u7247", cls: "sk-btn sk-btn-small" });
    addBtn.addEventListener("click", () => {
      this.plugin.setActiveColumn(column.id);
      new CardModal(this.app, this.plugin, column.id).open();
    });
    const deleteBtn = actionsEl.createEl("button", {
      text: "\u5220\u9664",
      cls: "sk-btn sk-btn-ghost sk-btn-small",
      attr: { "aria-label": "\u5220\u9664\u680F\u76EE" }
    });
    deleteBtn.addEventListener("click", () => {
      new ConfirmModal(this.app, {
        title: "\u5220\u9664\u680F\u76EE",
        message: `\u786E\u5B9A\u5220\u9664\u300C${column.name}\u300D\u53CA\u5176\u6240\u6709\u5361\u7247\uFF1F`,
        confirmText: "\u5220\u9664",
        onConfirm: async () => {
          await this.plugin.removeColumn(column.id);
        }
      }).open();
    });
    const cardsContainer = columnEl.createDiv({
      cls: "sk-cards",
      attr: { "data-column": column.id }
    });
    const filterWrapper = actionsEl.createEl("label", { cls: "sk-filter-toggle" });
    const deadlineOnly = this.deadlineFilters.get(column.id) ?? false;
    const filterCheckbox = filterWrapper.createEl("input", { type: "checkbox" });
    filterCheckbox.checked = deadlineOnly;
    filterCheckbox.addEventListener("change", () => {
      this.deadlineFilters.set(column.id, filterCheckbox.checked);
      this.render();
    });
    filterWrapper.createSpan({ text: "\u4EC5\u622A\u6B62" });
    cardsContainer.addEventListener("dragover", (evt) => {
      evt.preventDefault();
      if (evt.dataTransfer)
        evt.dataTransfer.dropEffect = "move";
      const beforeId = this.getBeforeCardId(cardsContainer, evt.clientY);
      this.movePlaceholder(cardsContainer, beforeId);
    });
    cardsContainer.addEventListener("drop", (evt) => {
      evt.preventDefault();
      const beforeId = this.placeholderState?.columnId === column.id ? this.placeholderState.beforeId : this.getBeforeCardId(cardsContainer, evt.clientY);
      void this.handleDrop(column.id, beforeId);
    });
    const cardsToRender = this.getCardsForColumn(column, deadlineOnly);
    if (!cardsToRender.length) {
      const emptyText = deadlineOnly ? "\u6682\u65E0\u622A\u6B62\u4EFB\u52A1" : "\u{1F4DD} \u6682\u65E0\u4EFB\u52A1";
      const empty = cardsContainer.createDiv({ text: emptyText, cls: "sk-empty" });
      empty.addEventListener("dragover", (evt) => {
        evt.preventDefault();
        if (evt.dataTransfer)
          evt.dataTransfer.dropEffect = "move";
        const beforeId = this.getBeforeCardId(cardsContainer, evt.clientY);
        this.movePlaceholder(cardsContainer, beforeId);
      });
      empty.addEventListener("drop", (evt) => {
        evt.preventDefault();
        const beforeId = this.placeholderState?.columnId === column.id ? this.placeholderState.beforeId : this.getBeforeCardId(cardsContainer, evt.clientY);
        void this.handleDrop(column.id, beforeId);
      });
      return;
    }
    cardsToRender.forEach((card) => {
      this.renderCard(cardsContainer, column, card);
    });
  }
  renderCard(container, column, card) {
    const cardClasses = ["sk-card"];
    if (card.completed)
      cardClasses.push("sk-card-completed");
    if (card.deadline)
      cardClasses.push("sk-card-deadline");
    const cardEl = container.createDiv({
      cls: cardClasses.join(" "),
      attr: { draggable: "true", "data-card": card.id }
    });
    cardEl.dataset.cardId = card.id;
    cardEl.addEventListener("dragstart", (evt) => {
      this.dragState = { cardId: card.id, columnId: column.id, cardHeight: cardEl.offsetHeight };
      cardEl.addClass("sk-card-dragging");
      evt.dataTransfer?.setData("text/plain", card.id);
    });
    cardEl.addEventListener("dragend", () => {
      cardEl.removeClass("sk-card-dragging");
      this.resetDragState();
    });
    cardEl.addEventListener("dragover", (evt) => {
      evt.preventDefault();
      if (evt.dataTransfer)
        evt.dataTransfer.dropEffect = "move";
      cardEl.addClass("sk-card-drop");
      const container2 = cardEl.parentElement;
      const beforeId = this.getBeforeCardId(container2, evt.clientY);
      this.movePlaceholder(container2, beforeId);
    });
    cardEl.addEventListener("dragleave", () => {
      cardEl.removeClass("sk-card-drop");
    });
    cardEl.addEventListener("click", (evt) => {
      const target = evt.target;
      if (target.closest(".sk-history-host"))
        return;
      this.plugin.setActiveColumn(column.id);
      new CardModal(this.app, this.plugin, column.id, card).open();
    });
    const topRow = cardEl.createDiv({ cls: "sk-card-top" });
    const checkbox = topRow.createEl("input", { type: "checkbox" });
    checkbox.checked = card.completed;
    checkbox.addEventListener("click", async (evt) => {
      evt.stopPropagation();
      await this.plugin.toggleCardCompletion(column.id, card.id, checkbox.checked);
    });
    const titleEl = topRow.createDiv({ cls: "sk-card-title", text: card.title });
    const historyHost = cardEl.createDiv({ cls: "sk-history-host" });
    const historyMarker = historyHost.createDiv({ cls: "sk-history-marker", text: "\u23F1" });
    const popover = historyHost.createDiv({ cls: "sk-history-popover" });
    const historyEntries = Array.isArray(card.history) ? card.history : [];
    historyEntries.forEach((entry) => {
      popover.createDiv({
        cls: "sk-history-entry",
        text: `${formatDate(entry.timestamp)} \xB7 ${entry.remark || "\u4FEE\u6539"}`
      });
    });
    if (!historyEntries.length) {
      popover.createDiv({ text: "\u6682\u65E0\u5386\u53F2", cls: "sk-history-entry" });
    }
    let hideTimeout = null;
    const clearHideTimeout = () => {
      if (hideTimeout !== null) {
        window.clearTimeout(hideTimeout);
        hideTimeout = null;
      }
    };
    const showHistory = () => {
      clearHideTimeout();
      historyHost.addClass("sk-history-hover");
    };
    const scheduleHide = () => {
      clearHideTimeout();
      hideTimeout = window.setTimeout(() => {
        if (!historyHost.hasClass("sk-history-pinned")) {
          historyHost.removeClass("sk-history-hover");
        }
      }, 150);
    };
    historyHost.addEventListener("mouseenter", showHistory);
    historyHost.addEventListener("mouseleave", scheduleHide);
    historyMarker.addEventListener("click", (evt) => {
      evt.stopPropagation();
      clearHideTimeout();
      if (historyHost.hasClass("sk-history-pinned")) {
        historyHost.removeClass("sk-history-pinned");
        if (!historyHost.matches(":hover")) {
          historyHost.removeClass("sk-history-hover");
        }
      } else {
        historyHost.addClass("sk-history-pinned");
        historyHost.addClass("sk-history-hover");
      }
    });
    const disableDrag = (evt) => {
      evt.stopPropagation();
      cardEl.setAttr("draggable", "false");
      const enable = () => {
        cardEl.setAttr("draggable", "true");
        document.removeEventListener("mouseup", enable);
      };
      document.addEventListener("mouseup", enable);
    };
    historyHost.addEventListener("mousedown", disableDrag);
    popover.addEventListener("mousedown", disableDrag);
    if (card.tags.length) {
      const tagRow = cardEl.createDiv({ cls: "sk-card-tags" });
      card.tags.forEach((tag) => tagRow.createDiv({ cls: "sk-tag", text: tag }));
    }
    if (card.remark) {
      cardEl.createDiv({ cls: "sk-card-remark", text: card.remark });
    }
    const meta = cardEl.createDiv({ cls: "sk-card-meta" });
    meta.createSpan({ text: `\u521B\u5EFA\uFF1A${formatDate(card.createdAt)}` });
    meta.createSpan({ text: `\u66F4\u65B0\uFF1A${formatDate(card.updatedAt)}` });
    if (card.deadline) {
      meta.createSpan({ text: `\u622A\u6B62\uFF1A${formatDate(card.deadline)}`, cls: "sk-card-deadline-text" });
    }
    return cardEl;
  }
  async handleDrop(targetColumnId, beforeCardId) {
    if (!this.dragState)
      return;
    const { columnId, cardId } = this.dragState;
    if (targetColumnId === columnId && beforeCardId === cardId) {
      this.resetDragState();
      return;
    }
    await this.plugin.moveCard(cardId, columnId, targetColumnId, beforeCardId);
    this.resetDragState();
  }
  getBeforeCardId(container, clientY) {
    const cards = Array.from(container.querySelectorAll(".sk-card"));
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (clientY < midpoint) {
        const id = card.dataset.cardId;
        return id || void 0;
      }
    }
    return void 0;
  }
  getCardsForColumn(column, deadlineOnly) {
    if (!deadlineOnly) {
      return column.cards;
    }
    return column.cards.filter((card) => !!card.deadline).slice().sort((a, b) => {
      const aTime = a.deadline ?? 0;
      const bTime = b.deadline ?? 0;
      return aTime - bTime;
    });
  }
  ensurePlaceholder() {
    if (!this.placeholderEl) {
      this.placeholderEl = document.createElement("div");
      this.placeholderEl.addClass("sk-card-placeholder");
    }
    return this.placeholderEl;
  }
  movePlaceholder(container, beforeId) {
    if (!this.dragState)
      return;
    const columnId = container.getAttribute("data-column");
    if (!columnId)
      return;
    const placeholder = this.ensurePlaceholder();
    const desiredHeight = Math.max(this.dragState.cardHeight || 0, 48);
    placeholder.style.height = `${desiredHeight}px`;
    if (placeholder.parentElement !== container) {
      this.restorePlaceholderParent();
      container.addClass("sk-cards-placeholder");
    }
    const reference = beforeId ? container.querySelector(`.sk-card[data-card-id="${beforeId}"]`) : null;
    if (reference) {
      container.insertBefore(placeholder, reference);
    } else {
      container.appendChild(placeholder);
    }
    this.setEmptyMessageVisible(container, false);
    this.placeholderState = { columnId, beforeId };
  }
  restorePlaceholderParent() {
    if (this.placeholderEl?.parentElement) {
      const parent = this.placeholderEl.parentElement;
      parent.removeClass("sk-cards-placeholder");
      this.placeholderEl.remove();
      this.setEmptyMessageVisible(parent, true);
    }
  }
  removePlaceholder() {
    this.restorePlaceholderParent();
    this.placeholderEl = void 0;
    this.placeholderState = void 0;
  }
  setEmptyMessageVisible(container, visible) {
    const emptyEl = container.querySelector(".sk-empty");
    if (emptyEl) {
      emptyEl.style.display = visible ? "" : "none";
    }
  }
  resetDragState() {
    this.dragState = void 0;
    this.placeholderState = void 0;
    this.removePlaceholder();
    this.contentEl.querySelectorAll(".sk-card-drop").forEach((el) => el.removeClass("sk-card-drop"));
  }
  renderStatCard(container, title, value, description) {
    const card = container.createDiv({ cls: "sk-stat-card" });
    card.createEl("div", { text: title, cls: "sk-stat-card-title" });
    card.createEl("div", { text: value, cls: "sk-stat-card-value" });
    card.createEl("div", { text: description, cls: "sk-stat-card-desc" });
  }
  renderDailyBarChart(container, series) {
    if (!series.length) {
      container.createDiv({ cls: "sk-empty", text: "\u6682\u65E0\u6570\u636E" });
      return;
    }
    const scroll = container.createDiv({ cls: "sk-chart-scroll" });
    const chart = scroll.createDiv({ cls: "sk-chart sk-chart-bars" });
    const tooltip = chart.createDiv({ cls: "sk-chart-tooltip" });
    const maxValue = Math.max(
      1,
      ...series.map((point) => Math.max(point.created, point.completed))
    );
    const columnWidth = 36;
    chart.style.minWidth = `${series.length * columnWidth}px`;
    const hideTooltip = () => tooltip.removeClass("visible");
    series.forEach((point) => {
      const column = chart.createDiv({ cls: "sk-chart-col" });
      const bars = column.createDiv({ cls: "sk-chart-col-bars" });
      const createdBar = bars.createDiv({
        cls: "sk-chart-bar sk-chart-bar-created",
        attr: { style: `height:${point.created / maxValue * 100}%` }
      });
      const completedBar = bars.createDiv({
        cls: "sk-chart-bar sk-chart-bar-completed",
        attr: { style: `height:${point.completed / maxValue * 100}%` }
      });
      column.createDiv({ cls: "sk-chart-label", text: point.date.slice(5) });
      const showTooltip = (evt) => {
        const target = evt.currentTarget;
        tooltip.setText(`${point.date} \u65B0\u5EFA ${point.created} \xB7 \u5B8C\u6210 ${point.completed}`);
        tooltip.addClass("visible");
        const bounds = chart.getBoundingClientRect();
        const x = evt.clientX - bounds.left;
        const y = evt.clientY - bounds.top - 20;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      };
      [createdBar, completedBar, column].forEach((el) => {
        el.addEventListener("mouseenter", showTooltip);
        el.addEventListener("mousemove", showTooltip);
        el.addEventListener("mouseleave", hideTooltip);
      });
    });
    const legend = container.createDiv({ cls: "sk-chart-legend" });
    this.renderLegendItem(legend, "\u65B0\u5EFA", "var(--color-cyan, #4ecdc4)");
    this.renderLegendItem(legend, "\u5B8C\u6210", "var(--interactive-accent)");
  }
  renderLegendItem(container, label, color) {
    const item = container.createDiv({ cls: "sk-legend-item" });
    const dot = item.createDiv({ cls: "sk-legend-dot" });
    dot.style.background = color;
    item.createSpan({ text: label });
  }
  renderDailyRateChart(container, series) {
    console.log("[SimpleKanban][Stats] Rendering daily rate chart with", series.length, "points");
    if (!series.length) {
      container.createDiv({ cls: "sk-empty", text: "\u6682\u65E0\u5B8C\u6210\u7387\u6570\u636E" });
      console.log("[SimpleKanban][Stats] Daily rate chart has no data.");
      return;
    }
    console.log("[SimpleKanban][Stats] Daily rate samples", series);
    const scroll = container.createDiv({ cls: "sk-chart-scroll" });
    const chartWrapper = scroll.createDiv({ cls: "sk-chart sk-chart-line" });
    const minColumns = Math.max(series.length, 7);
    const svgWidth = minColumns * 36;
    const effectiveCount = Math.max(series.length, 2);
    const columnWidth = 36;
    const width = (effectiveCount - 1) * columnWidth;
    const minWidth = Math.max(series.length * columnWidth, width + 24);
    chartWrapper.style.minWidth = `${minWidth}px`;
    const height = 160;
    const leftPad = 12;
    const rightPad = 12;
    const totalWidth = width + leftPad + rightPad;
    const svg = createSvgElement("svg");
    setSvgAttrs(svg, {
      viewBox: `0 0 ${totalWidth} ${height}`,
      preserveAspectRatio: "none",
      width: String(totalWidth),
      height: String(height)
    });
    chartWrapper.appendChild(svg);
    const baseline = createSvgElement("line");
    setSvgAttrs(baseline, {
      x1: String(leftPad),
      y1: String(height - 1),
      x2: String(totalWidth - rightPad),
      y2: String(height - 1),
      stroke: "var(--background-modifier-border)",
      "stroke-width": "1"
    });
    svg.appendChild(baseline);
    const pointsData = series.map((point, index) => {
      const x = series.length === 1 ? leftPad + width / 2 : leftPad + index / (series.length - 1 || 1) * width;
      const clampedRate = Math.min(Math.max(point.rate, 0), 100);
      const y = height - clampedRate / 100 * (height - 20) - 10;
      return { x, y, rate: clampedRate };
    });
    console.log("[SimpleKanban][Stats] Daily rate coordinates", pointsData);
    const points = pointsData.map((p) => `${p.x},${p.y}`).join(" ");
    const polyline = createSvgElement("polyline");
    setSvgAttrs(polyline, {
      points,
      fill: "none",
      stroke: "var(--interactive-accent)",
      "stroke-width": "3",
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    });
    svg.appendChild(polyline);
    const tooltip = chartWrapper.createDiv({ cls: "sk-chart-tooltip" });
    const hideTooltip = () => tooltip.removeClass("visible");
    series.forEach((point, index) => {
      const dotX = series.length === 1 ? leftPad + width / 2 : leftPad + index / (series.length - 1 || 1) * width;
      const clampedRate = Math.min(Math.max(point.rate, 0), 100);
      const dotY = height - clampedRate / 100 * (height - 20) - 10;
      const circle = createSvgElement("circle");
      setSvgAttrs(circle, {
        cx: String(dotX),
        cy: String(dotY),
        r: "3",
        fill: "var(--interactive-accent)"
      });
      svg.appendChild(circle);
      const showTooltip = (evt) => {
        const bounds = chartWrapper.getBoundingClientRect();
        const x = evt.clientX - bounds.left;
        const y = evt.clientY - bounds.top - 20;
        tooltip.setText(`${point.date} \u5B8C\u6210\u7387 ${point.rate.toFixed(1)}%`);
        tooltip.addClass("visible");
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      };
      circle.addEventListener("mouseenter", showTooltip);
      circle.addEventListener("mousemove", showTooltip);
      circle.addEventListener("mouseleave", hideTooltip);
    });
    pointsData.forEach((point, index) => {
      const prev = pointsData[index - 1];
      const next = pointsData[index + 1];
      const leftBound = prev ? (prev.x + point.x) / 2 : leftPad;
      const rightBound = next ? (point.x + next.x) / 2 : totalWidth - rightPad;
      const hitbox = createSvgElement("rect");
      setSvgAttrs(hitbox, {
        x: String(leftBound),
        y: "0",
        width: String(Math.max(4, rightBound - leftBound)),
        height: String(height),
        fill: "transparent"
      });
      const showTooltip = (evt) => {
        const bounds = chartWrapper.getBoundingClientRect();
        const x = evt.clientX - bounds.left;
        const y = evt.clientY - bounds.top - 20;
        tooltip.setText(`${series[index].date} \u5B8C\u6210\u7387 ${series[index].rate.toFixed(1)}%`);
        tooltip.addClass("visible");
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      };
      hitbox.addEventListener("mouseenter", showTooltip);
      hitbox.addEventListener("mousemove", showTooltip);
      hitbox.addEventListener("mouseleave", hideTooltip);
      svg.appendChild(hitbox);
    });
    const labels = chartWrapper.createDiv({ cls: "sk-chart-label-row" });
    labels.style.gridTemplateColumns = `repeat(${Math.max(series.length, 1)}, minmax(0, 1fr))`;
    series.forEach((point) => {
      labels.createDiv({ cls: "sk-chart-label", text: point.date.slice(5) });
    });
  }
  renderDeadlineBreakdown(container, stats) {
    if (!stats.deadlineCount) {
      container.createDiv({ cls: "sk-empty", text: "\u6682\u65E0\u8BBE\u7F6E\u622A\u6B62\u65F6\u95F4\u7684\u4EFB\u52A1" });
      return;
    }
    const info = container.createDiv({ cls: "sk-deadline-info" });
    info.createDiv({ text: `\u6709\u622A\u6B62\u4EFB\u52A1\uFF1A${stats.deadlineCount}`, cls: "sk-deadline-line" });
    info.createDiv({
      text: `\u622A\u6B62\u8986\u76D6\u7387\uFF1A${formatPercent(stats.deadlineCoverage)}`,
      cls: "sk-deadline-line"
    });
    const progress = container.createDiv({ cls: "sk-progress" });
    progress.createDiv({
      cls: "sk-progress-on-time",
      attr: { style: `width:${formatPercentValue(stats.onTimeRate)}%` }
    });
    progress.createDiv({
      cls: "sk-progress-overdue",
      attr: { style: `width:${formatPercentValue(stats.overdueRate)}%` }
    });
    const legend = container.createDiv({ cls: "sk-progress-legend" });
    this.renderLegendItem(legend, "\u6309\u65F6\u5B8C\u6210", "var(--color-green, #4caf50)");
    this.renderLegendItem(legend, "\u5DF2/\u5C06\u903E\u671F", "var(--color-red, #ff6b6b)");
  }
  buildStatsSnapshot(range) {
    const board = this.plugin.getBoard();
    const cards = board.columns.flatMap((col) => col.cards);
    const totalTasks = cards.length;
    const completedCards = cards.filter((card) => card.completed);
    const completedTasks = completedCards.length;
    const wipCount = totalTasks - completedTasks;
    const completionRate = totalTasks ? completedTasks / totalTasks : 0;
    const deadlineCards = cards.filter((card) => !!card.deadline);
    const now = Date.now();
    const overdueCount = deadlineCards.filter((card) => {
      if (!card.deadline)
        return false;
      if (card.completed) {
        const doneAt = card.completedAt ?? card.updatedAt;
        return !!doneAt && doneAt > card.deadline;
      }
      return now > card.deadline;
    }).length;
    const onTimeCount = deadlineCards.filter((card) => {
      if (!card.deadline || !card.completed)
        return false;
      const doneAt = card.completedAt ?? card.updatedAt;
      return !!doneAt && doneAt <= card.deadline;
    }).length;
    const avgCycleTimeMs = (() => {
      const finished = completedCards.filter((card) => card.completedAt);
      if (!finished.length)
        return null;
      const total = finished.reduce(
        (sum, card) => sum + Math.max(0, card.completedAt - card.createdAt),
        0
      );
      return total / finished.length;
    })();
    const dailyCreated = this.buildDailySeries(cards, "created", range);
    const dailyCompleted = this.buildDailySeries(cards, "completed", range);
    const dailySeries = dailyCreated.map((point, index) => ({
      date: point.date,
      created: point.value,
      completed: dailyCompleted[index]?.value ?? 0
    }));
    const dailyRates = dailySeries.map((point) => ({
      date: point.date,
      rate: point.created || point.completed ? Math.min(100, point.completed / Math.max(point.created, point.completed, 1) * 100) : 0
    }));
    return {
      totalTasks,
      completedTasks,
      wipCount,
      completionRate,
      deadlineCount: deadlineCards.length,
      deadlineCoverage: totalTasks ? deadlineCards.length / totalTasks : 0,
      overdueCount,
      overdueRate: deadlineCards.length ? overdueCount / deadlineCards.length : 0,
      onTimeRate: deadlineCards.length ? onTimeCount / deadlineCards.length : 0,
      avgCycleTimeMs,
      dailySeries,
      dailyRates
    };
  }
  buildDailySeries(cards, kind, range) {
    const msPerDay = 24 * 60 * 60 * 1e3;
    const { start, end } = this.resolveRange(range);
    const days = Math.max(1, Math.round((end - start) / msPerDay) + 1);
    const buckets = /* @__PURE__ */ new Map();
    let processed = 0;
    let outOfRange = 0;
    let missing = 0;
    for (const card of cards) {
      const timestamp = kind === "created" ? card.createdAt : card.completedAt ?? (card.completed ? card.updatedAt : null);
      if (!timestamp) {
        missing++;
        continue;
      }
      if (timestamp < start || timestamp > end) {
        outOfRange++;
        continue;
      }
      const key = this.toDayKey(timestamp);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
      processed++;
    }
    const series = [];
    for (let i = 0; i < days; i++) {
      const dayTs = start + i * msPerDay;
      const key = this.toDayKey(dayTs);
      series.push({ date: key, value: buckets.get(key) ?? 0 });
    }
    const label = kind === "created" ? "Created" : "Completed";
    console.log(`[SimpleKanban][Stats] ${label} series stats`, {
      rangeStart: new Date(start).toISOString().slice(0, 10),
      rangeEnd: new Date(end).toISOString().slice(0, 10),
      points: series.length,
      processed,
      outOfRange,
      missing
    });
    return series;
  }
  resolveRange(range) {
    if (range.type === "custom") {
      return {
        start: this.startOfDay(range.start),
        end: this.startOfDay(range.end)
      };
    }
    const msPerDay = 24 * 60 * 60 * 1e3;
    const end = this.startOfDay(Date.now());
    const start = end - (range.days - 1) * msPerDay;
    return { start, end };
  }
  toDayKey(timestamp) {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  startOfDay(timestamp) {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }
  resolveTimelineRange() {
    if (this.timelinePreset === "custom" && this.timelineCustom) {
      return this.timelineCustom;
    }
    if (this.timelinePreset === "yesterday") {
      const today2 = this.startOfDay(Date.now());
      const yesterday = today2 - 24 * 60 * 60 * 1e3;
      return { start: yesterday, end: yesterday };
    }
    const today = this.startOfDay(Date.now());
    return { start: today, end: today };
  }
  buildTimelineEntries(start, end) {
    const board = this.plugin.getBoard();
    const entries = [];
    const startTs = this.startOfDay(start);
    const endTs = this.startOfDay(end) + 24 * 60 * 60 * 1e3 - 1;
    for (const column of board.columns) {
      for (const card of column.cards) {
        if (!Array.isArray(card.history))
          continue;
        for (const item of card.history) {
          if (!item.timestamp)
            continue;
          if (item.timestamp < startTs || item.timestamp > endTs)
            continue;
          entries.push({
            cardId: card.id,
            cardTitle: card.title,
            columnName: column.name,
            timestamp: item.timestamp,
            text: item.remark || "\u66F4\u65B0"
          });
        }
      }
    }
    return entries.sort((a, b) => a.timestamp - b.timestamp);
  }
};
var CardModal = class extends import_obsidian.Modal {
  constructor(app, plugin, columnId, card) {
    super(app);
    this.plugin = plugin;
    this.columnId = columnId;
    this.card = card;
    this.titleValue = "";
    this.tagsValue = "";
    this.remarkValue = "";
    this.historyNote = "";
    this.deadlineValue = "";
    this.submitting = false;
    this.keyHandler = (evt) => {
      if (evt.key === "Enter" && !evt.shiftKey && !evt.metaKey && !evt.ctrlKey && !evt.altKey && !evt.isComposing) {
        evt.preventDefault();
        void this.handleSubmit();
      }
    };
    this.plugin.setActiveColumn(columnId);
    if (card) {
      this.titleValue = card.title;
      this.tagsValue = card.tags.join(", ");
      this.remarkValue = card.remark;
      this.deadlineValue = formatDateTimeInput(card.deadline);
    }
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sk-modal");
    contentEl.addEventListener("keydown", this.keyHandler);
    contentEl.createEl("h2", { text: this.card ? "\u7F16\u8F91\u5361\u7247" : "\u65B0\u589E\u5361\u7247" });
    this.titleValue = this.titleValue || "";
    createTextField(contentEl, "\u6807\u9898", this.titleValue, (value) => {
      this.titleValue = value;
    });
    createTextField(contentEl, "\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF09", this.tagsValue, (value) => {
      this.tagsValue = value;
    });
    createTextArea(contentEl, "\u5907\u6CE8", this.remarkValue, (value) => {
      this.remarkValue = value;
    });
    createDateTimeField(contentEl, "\u622A\u6B62\u65F6\u95F4", this.deadlineValue, (value) => {
      this.deadlineValue = value;
    });
    createTextArea(contentEl, "\u4FEE\u6539\u8BF4\u660E\uFF08\u5199\u5165\u5386\u53F2\uFF09", "", (value) => {
      this.historyNote = value;
    });
    const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
    const cancelBtn = footer.createEl("button", { text: "\u53D6\u6D88", cls: "sk-btn sk-btn-ghost" });
    cancelBtn.addEventListener("click", () => this.close());
    const submitBtn = footer.createEl("button", {
      text: this.card ? "\u4FDD\u5B58" : "\u521B\u5EFA",
      cls: "sk-btn"
    });
    submitBtn.addEventListener("click", () => void this.handleSubmit());
  }
  onClose() {
    this.contentEl.removeEventListener("keydown", this.keyHandler);
    super.onClose();
  }
  async handleSubmit() {
    if (this.submitting)
      return;
    if (!this.titleValue.trim()) {
      new import_obsidian.Notice("\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A");
      return;
    }
    const tags = parseTags(this.tagsValue);
    const remark = this.remarkValue.trim();
    const deadline = parseDateTimeInput(this.deadlineValue);
    this.submitting = true;
    try {
      if (this.card) {
        await this.plugin.updateCard(
          this.columnId,
          this.card.id,
          { title: this.titleValue, tags, remark, deadline },
          this.historyNote.trim() || "\u5185\u5BB9\u66F4\u65B0"
        );
      } else {
        await this.plugin.addCard(this.columnId, {
          title: this.titleValue,
          tags,
          remark,
          historyNote: this.historyNote.trim() || "\u521B\u5EFA",
          deadline
        });
      }
      this.close();
    } catch (error) {
      console.error("[SimpleKanban][CardModal] submit failed", error);
      new import_obsidian.Notice("\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");
    } finally {
      this.submitting = false;
    }
  }
};
var ColumnModal = class extends import_obsidian.Modal {
  constructor(app, options) {
    super(app);
    this.options = options;
    this.value = options.initialValue ?? "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sk-modal");
    contentEl.createEl("h2", { text: this.options.title });
    createTextField(contentEl, "\u680F\u76EE\u540D\u79F0", this.value, (value) => this.value = value);
    const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
    const cancelBtn = footer.createEl("button", { text: "\u53D6\u6D88", cls: "sk-btn sk-btn-ghost" });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = footer.createEl("button", {
      text: this.options.confirmText || "\u786E\u8BA4",
      cls: "sk-btn"
    });
    confirmBtn.addEventListener("click", async () => {
      await this.options.onSubmit(this.value);
      this.close();
    });
  }
};
var ConfirmModal = class extends import_obsidian.Modal {
  constructor(app, options) {
    super(app);
    this.options = options;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sk-modal");
    contentEl.createEl("h2", { text: this.options.title });
    contentEl.createDiv({ text: this.options.message, cls: "sk-confirm-text" });
    const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
    const cancelBtn = footer.createEl("button", {
      text: this.options.cancelText || "\u53D6\u6D88",
      cls: "sk-btn sk-btn-ghost"
    });
    cancelBtn.addEventListener("click", () => this.close());
    const confirmBtn = footer.createEl("button", {
      text: this.options.confirmText || "\u786E\u8BA4",
      cls: "sk-btn"
    });
    confirmBtn.addEventListener("click", async () => {
      await this.options.onConfirm();
      this.close();
    });
  }
};
function parseTags(input) {
  return input.split(",").map((tag) => tag.trim()).filter((tag) => !!tag);
}
function parseDateTimeInput(value) {
  if (!value.trim())
    return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}
function formatDateTimeInput(value) {
  if (!value)
    return "";
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function formatDateOnly(timestamp) {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatPercent(value, digits = 0) {
  if (!Number.isFinite(value))
    return "0%";
  return `${(Math.max(0, value) * 100).toFixed(digits)}%`;
}
function formatPercentValue(value) {
  if (!Number.isFinite(value))
    return 0;
  return Math.max(0, Math.min(100, value * 100));
}
function formatDuration(ms) {
  const minutes = Math.floor(ms / 6e4);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) {
    const remHours = hours % 24;
    return remHours ? `${days}\u5929${remHours}\u5C0F\u65F6` : `${days}\u5929`;
  }
  if (hours > 0) {
    const remMinutes = minutes % 60;
    return remMinutes ? `${hours}\u5C0F\u65F6${remMinutes}\u5206` : `${hours}\u5C0F\u65F6`;
  }
  return `${Math.max(minutes, 1)}\u5206`;
}
function formatDateInputValue(timestamp) {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
var SVG_NS = "http://www.w3.org/2000/svg";
function createSvgElement(tag) {
  return document.createElementNS(SVG_NS, tag);
}
function setSvgAttrs(el, attrs) {
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
}
function createTextField(container, label, value, onChange) {
  const wrapper = container.createDiv({ cls: "sk-field" });
  wrapper.createEl("label", { text: label });
  const input = wrapper.createEl("input", { type: "text" });
  input.value = value;
  input.addEventListener("input", (evt) => onChange(evt.target.value));
}
function createDateTimeField(container, label, value, onChange) {
  const wrapper = container.createDiv({ cls: "sk-field" });
  wrapper.createEl("label", { text: label });
  const input = wrapper.createEl("input", { type: "datetime-local" });
  input.value = value;
  input.addEventListener("input", (evt) => onChange(evt.target.value));
}
function createTextArea(container, label, value, onChange) {
  const wrapper = container.createDiv({ cls: "sk-field" });
  wrapper.createEl("label", { text: label });
  const textarea = wrapper.createEl("textarea");
  textarea.value = value;
  textarea.addEventListener("input", (evt) => onChange(evt.target.value));
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgSXRlbVZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgV29ya3NwYWNlTGVhZiwgYWRkSWNvbiB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5jb25zdCBWSUVXX1RZUEUgPSBcInNpbXBsZS1rYW5iYW4tc2lkZWJhci12aWV3XCI7XG5jb25zdCBJQ09OX0lEID0gXCJzaW1wbGUta2FuYmFuLWVtb2ppXCI7XG5cbmludGVyZmFjZSBLYW5iYW5IaXN0b3J5RW50cnkge1xuXHR0aW1lc3RhbXA6IG51bWJlcjtcblx0cmVtYXJrOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBLYW5iYW5DYXJkIHtcblx0aWQ6IHN0cmluZztcblx0dGl0bGU6IHN0cmluZztcblx0dGFnczogc3RyaW5nW107XG5cdHJlbWFyazogc3RyaW5nO1xuXHRkZWFkbGluZT86IG51bWJlciB8IG51bGw7XG5cdGNvbXBsZXRlZDogYm9vbGVhbjtcblx0Y29tcGxldGVkQXQ/OiBudW1iZXIgfCBudWxsO1xuXHRjcmVhdGVkQXQ6IG51bWJlcjtcblx0dXBkYXRlZEF0OiBudW1iZXI7XG5cdGhpc3Rvcnk6IEthbmJhbkhpc3RvcnlFbnRyeVtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQ29sdW1uIHtcblx0aWQ6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRjYXJkczogS2FuYmFuQ2FyZFtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQm9hcmREYXRhIHtcblx0Y29sdW1uczogS2FuYmFuQ29sdW1uW107XG59XG5cbmludGVyZmFjZSBEYWlseUNvdW50UG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdHZhbHVlOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVN0YXRzUG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdGNyZWF0ZWQ6IG51bWJlcjtcblx0Y29tcGxldGVkOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVJhdGVQb2ludCB7XG5cdGRhdGU6IHN0cmluZztcblx0cmF0ZTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgU3RhdHNTbmFwc2hvdCB7XG5cdHRvdGFsVGFza3M6IG51bWJlcjtcblx0Y29tcGxldGVkVGFza3M6IG51bWJlcjtcblx0d2lwQ291bnQ6IG51bWJlcjtcblx0Y29tcGxldGlvblJhdGU6IG51bWJlcjtcblx0ZGVhZGxpbmVDb3VudDogbnVtYmVyO1xuXHRkZWFkbGluZUNvdmVyYWdlOiBudW1iZXI7XG5cdG92ZXJkdWVDb3VudDogbnVtYmVyO1xuXHRvdmVyZHVlUmF0ZTogbnVtYmVyO1xuXHRvblRpbWVSYXRlOiBudW1iZXI7XG5cdGF2Z0N5Y2xlVGltZU1zOiBudW1iZXIgfCBudWxsO1xuXHRkYWlseVNlcmllczogRGFpbHlTdGF0c1BvaW50W107XG5cdGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W107XG59XG5cbnR5cGUgU3RhdHNSYW5nZSA9XG5cdHwgeyB0eXBlOiBcInByZXNldFwiOyBkYXlzOiBudW1iZXIgfVxuXHR8IHsgdHlwZTogXCJjdXN0b21cIjsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfTtcblxudHlwZSBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiIHwgXCJ5ZXN0ZXJkYXlcIiB8IFwiY3VzdG9tXCI7XG5cbmludGVyZmFjZSBUaW1lbGluZUVudHJ5IHtcblx0Y2FyZElkOiBzdHJpbmc7XG5cdGNhcmRUaXRsZTogc3RyaW5nO1xuXHRjb2x1bW5OYW1lOiBzdHJpbmc7XG5cdHRpbWVzdGFtcDogbnVtYmVyO1xuXHR0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IERFRkFVTFRfQ09MVU1OUyA9IFtcIlx1NUY4NVx1NTkwNFx1NzQwNlwiLCBcIlx1OEZEQlx1ODg0Q1x1NEUyRFwiLCBcIlx1NURGMlx1NUI4Q1x1NjIxMFwiXTtcbnR5cGUgTnVsbGFibGVUaW1lb3V0ID0gbnVtYmVyIHwgbnVsbDtcblxuZnVuY3Rpb24gY3JlYXRlRGVmYXVsdEJvYXJkKCk6IEthbmJhbkJvYXJkRGF0YSB7XG5cdHJldHVybiB7XG5cdFx0Y29sdW1uczogREVGQVVMVF9DT0xVTU5TLm1hcCgobmFtZSkgPT4gKHtcblx0XHRcdGlkOiBjcmVhdGVJZCgpLFxuXHRcdFx0bmFtZSxcblx0XHRcdGNhcmRzOiBbXSxcblx0XHR9KSksXG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZUthbmJhblBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHByaXZhdGUgYm9hcmQ6IEthbmJhbkJvYXJkRGF0YSA9IGNyZWF0ZURlZmF1bHRCb2FyZCgpO1xuXHRwcml2YXRlIHZpZXdzID0gbmV3IFNldDxLYW5iYW5WaWV3PigpO1xuXHRwcml2YXRlIGxhc3RDb2x1bW5JZD86IHN0cmluZztcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkQm9hcmQoKTtcblxuXHRcdGFkZEljb24oXG5cdFx0XHRJQ09OX0lELFxuXHRcdFx0YDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj48dGV4dCB4PVwiMTJcIiB5PVwiMjBcIiBmb250LXNpemU9XCIyMFwiIHRleHQtYW5jaG9yPVwibWlkZGxlXCI+XHVEODNEXHVEQzJGPC90ZXh0Pjwvc3ZnPmAsXG5cdFx0KTtcblxuXHRcdHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRSwgKGxlYWYpID0+IHtcblx0XHRcdGNvbnN0IHZpZXcgPSBuZXcgS2FuYmFuVmlldyhsZWFmLCB0aGlzKTtcblx0XHRcdHRoaXMucmVnaXN0ZXJLYW5iYW5WaWV3KHZpZXcpO1xuXHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZFJpYmJvbkljb24oSUNPTl9JRCwgXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIiwgKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcInNpbXBsZS1rYW5iYW4tb3BlblwiLFxuXHRcdFx0bmFtZTogXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIixcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuXHRcdH0pO1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogXCJzaW1wbGUta2FuYmFuLWFkZC1jYXJkXCIsXG5cdFx0XHRuYW1lOiBcIlx1NkRGQlx1NTJBMFx1NTM2MVx1NzI0N1wiLFxuXHRcdFx0aG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJNb2RcIiwgXCJTaGlmdFwiXSwga2V5OiBcIk5cIiB9XSxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLm9wZW5RdWlja0FkZENhcmQoKSxcblx0XHR9KTtcblxuXHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCkpO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0dGhpcy52aWV3cy5jbGVhcigpO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkQm9hcmQoKSB7XG5cdFx0Y29uc3Qgc3RvcmVkID0gYXdhaXQgdGhpcy5sb2FkRGF0YSgpO1xuXHRcdGlmIChzdG9yZWQgJiYgc3RvcmVkLmNvbHVtbnMpIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBzdG9yZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBjcmVhdGVEZWZhdWx0Qm9hcmQoKTtcblx0XHR9XG5cdFx0dGhpcy5ub3JtYWxpemVCb2FyZCgpO1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gdGhpcy5ib2FyZC5jb2x1bW5zWzBdPy5pZDtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcGVyc2lzdCgpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuYm9hcmQpO1xuXHRcdHRoaXMubm90aWZ5Vmlld3MoKTtcblx0fVxuXG5cdHJlZ2lzdGVyS2FuYmFuVmlldyh2aWV3OiBLYW5iYW5WaWV3KSB7XG5cdFx0dGhpcy52aWV3cy5hZGQodmlldyk7XG5cdFx0dmlldy5yZWdpc3RlcigoKSA9PiB0aGlzLnZpZXdzLmRlbGV0ZSh2aWV3KSk7XG5cdH1cblxuXHRub3RpZnlWaWV3cygpIHtcblx0XHR0aGlzLnZpZXdzLmZvckVhY2goKHZpZXcpID0+IHZpZXcucmVuZGVyKCkpO1xuXHR9XG5cblx0Z2V0Qm9hcmQoKTogS2FuYmFuQm9hcmREYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5ib2FyZDtcblx0fVxuXG5cdGFzeW5jIGFkZENvbHVtbihuYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIW5hbWUudHJpbSgpKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBjb2x1bW4gPSB7IGlkOiBjcmVhdGVJZCgpLCBuYW1lOiBuYW1lLnRyaW0oKSwgY2FyZHM6IFtdIGFzIEthbmJhbkNhcmRbXSB9O1xuXHRcdHRoaXMuYm9hcmQuY29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0aWYgKCF0aGlzLmxhc3RDb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSBjb2x1bW4uaWQ7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgcmVtb3ZlQ29sdW1uKGNvbHVtbklkOiBzdHJpbmcpIHtcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuYm9hcmQuY29sdW1ucy5maW5kSW5kZXgoKGNvbCkgPT4gY29sLmlkID09PSBjb2x1bW5JZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjcyQVx1NjI3RVx1NTIzMFx1NjMwN1x1NUI5QVx1NjgwRlx1NzZFRVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5ib2FyZC5jb2x1bW5zLnNwbGljZShpbmRleCwgMSk7XG5cdFx0aWYgKHRoaXMubGFzdENvbHVtbklkID09PSBjb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSB0aGlzLmJvYXJkLmNvbHVtbnNbMF0/LmlkO1xuXHRcdH1cblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIHJlbmFtZUNvbHVtbihjb2x1bW5JZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3QgbmV4dE5hbWUgPSBuYW1lLnRyaW0oKTtcblx0XHRpZiAoIW5leHROYW1lKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb2x1bW4ubmFtZSA9IG5leHROYW1lO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgYWRkQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHBheWxvYWQ6IHtcblx0XHRcdHRpdGxlOiBzdHJpbmc7XG5cdFx0XHR0YWdzOiBzdHJpbmdbXTtcblx0XHRcdHJlbWFyazogc3RyaW5nO1xuXHRcdFx0aGlzdG9yeU5vdGU6IHN0cmluZztcblx0XHRcdGRlYWRsaW5lPzogbnVtYmVyIHwgbnVsbDtcblx0XHR9LFxuXHQpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRjb25zdCBjYXJkOiBLYW5iYW5DYXJkID0ge1xuXHRcdFx0aWQ6IGNyZWF0ZUlkKCksXG5cdFx0XHR0aXRsZTogcGF5bG9hZC50aXRsZS50cmltKCksXG5cdFx0XHR0YWdzOiBwYXlsb2FkLnRhZ3MsXG5cdFx0XHRyZW1hcms6IHBheWxvYWQucmVtYXJrLFxuXHRcdFx0ZGVhZGxpbmU6IHBheWxvYWQuZGVhZGxpbmUgPz8gbnVsbCxcblx0XHRcdGNvbXBsZXRlZDogZmFsc2UsXG5cdFx0XHRjb21wbGV0ZWRBdDogbnVsbCxcblx0XHRcdGNyZWF0ZWRBdDogbm93LFxuXHRcdFx0dXBkYXRlZEF0OiBub3csXG5cdFx0XHRoaXN0b3J5OiBbXSxcblx0XHR9O1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBwYXlsb2FkLmhpc3RvcnlOb3RlIHx8IFwiXHU1MjFCXHU1RUZBXCIpO1xuXHRcdGNvbHVtbi5jYXJkcy51bnNoaWZ0KGNhcmQpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdXBkYXRlQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdHVwZGF0ZXM6IFBhcnRpYWw8UGljazxLYW5iYW5DYXJkLCBcInRpdGxlXCIgfCBcInRhZ3NcIiB8IFwicmVtYXJrXCIgfCBcImRlYWRsaW5lXCI+Pixcblx0XHRoaXN0b3J5Tm90ZT86IHN0cmluZyxcblx0KSB7XG5cdFx0Y29uc3QgY2FyZCA9IHRoaXMuZ2V0Q2FyZChjb2x1bW5JZCwgY2FyZElkKTtcblx0XHRpZiAoIWNhcmQpIHJldHVybjtcblx0XHRpZiAodXBkYXRlcy50aXRsZSAhPT0gdW5kZWZpbmVkKSBjYXJkLnRpdGxlID0gdXBkYXRlcy50aXRsZS50cmltKCk7XG5cdFx0aWYgKHVwZGF0ZXMudGFncyAhPT0gdW5kZWZpbmVkKSBjYXJkLnRhZ3MgPSB1cGRhdGVzLnRhZ3M7XG5cdFx0aWYgKHVwZGF0ZXMucmVtYXJrICE9PSB1bmRlZmluZWQpIGNhcmQucmVtYXJrID0gdXBkYXRlcy5yZW1hcms7XG5cdFx0aWYgKHVwZGF0ZXMuZGVhZGxpbmUgIT09IHVuZGVmaW5lZCkgY2FyZC5kZWFkbGluZSA9IHVwZGF0ZXMuZGVhZGxpbmU7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBoaXN0b3J5Tm90ZSB8fCBcIlx1NTE4NVx1NUJCOVx1NjZGNFx1NjVCMFwiKTtcblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIG1vdmVDYXJkKFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdGZyb21Db2x1bW5JZDogc3RyaW5nLFxuXHRcdHRvQ29sdW1uSWQ6IHN0cmluZyxcblx0XHRiZWZvcmVDYXJkSWQ/OiBzdHJpbmcsXG5cdCkge1xuXHRcdGNvbnN0IGZyb21Db2x1bW4gPSB0aGlzLmdldENvbHVtbihmcm9tQ29sdW1uSWQpO1xuXHRcdGNvbnN0IHRvQ29sdW1uID0gdGhpcy5nZXRDb2x1bW4odG9Db2x1bW5JZCk7XG5cdFx0Y29uc3QgaW5kZXggPSBmcm9tQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gY2FyZElkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG5cdFx0Y29uc3QgW2NhcmRdID0gZnJvbUNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGxldCB0YXJnZXRJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmxlbmd0aDtcblx0XHRpZiAoYmVmb3JlQ2FyZElkKSB7XG5cdFx0XHRjb25zdCBiZWZvcmVJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gYmVmb3JlQ2FyZElkKTtcblx0XHRcdHRhcmdldEluZGV4ID0gYmVmb3JlSW5kZXggPT09IC0xID8gdG9Db2x1bW4uY2FyZHMubGVuZ3RoIDogYmVmb3JlSW5kZXg7XG5cdFx0fVxuXHRcdHRvQ29sdW1uLmNhcmRzLnNwbGljZSh0YXJnZXRJbmRleCwgMCwgY2FyZCk7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdGlmIChmcm9tQ29sdW1uSWQgIT09IHRvQ29sdW1uSWQpIHtcblx0XHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBgXHU3OUZCXHU1MkE4XHU1MjMwXHUzMDBDJHt0b0NvbHVtbi5uYW1lfVx1MzAwRGApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlY29yZEhpc3RvcnkoY2FyZCwgXCJcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEZcIik7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdG9nZ2xlQ2FyZENvbXBsZXRpb24oY29sdW1uSWQ6IHN0cmluZywgY2FyZElkOiBzdHJpbmcsIGNvbXBsZXRlZDogYm9vbGVhbikge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBpbmRleCA9IGNvbHVtbi5jYXJkcy5maW5kSW5kZXgoKGMpID0+IGMuaWQgPT09IGNhcmRJZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xuXHRcdGNvbnN0IFtjYXJkXSA9IGNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGNhcmQuY29tcGxldGVkID0gY29tcGxldGVkO1xuXHRcdGNhcmQuY29tcGxldGVkQXQgPSBjb21wbGV0ZWQgPyBEYXRlLm5vdygpIDogbnVsbDtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGNvbXBsZXRlZCA/IFwiXHU2ODA3XHU4QkIwXHU1QjhDXHU2MjEwXCIgOiBcIlx1NTNENlx1NkQ4OFx1NUI4Q1x1NjIxMFwiKTtcblx0XHRjb25zdCBpbnNlcnRJbmRleCA9IGNvbXBsZXRlZCA/IGNvbHVtbi5jYXJkcy5sZW5ndGggOiBNYXRoLm1pbihpbmRleCwgY29sdW1uLmNhcmRzLmxlbmd0aCk7XG5cdFx0Y29sdW1uLmNhcmRzLnNwbGljZShpbnNlcnRJbmRleCwgMCwgY2FyZCk7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRwcml2YXRlIGdldENvbHVtbihjb2x1bW5JZDogc3RyaW5nKTogS2FuYmFuQ29sdW1uIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmJvYXJkLmNvbHVtbnMuZmluZCgoY29sKSA9PiBjb2wuaWQgPT09IGNvbHVtbklkKTtcblx0XHRpZiAoIWNvbHVtbikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiXHU2NzJBXHU2MjdFXHU1MjMwXHU2MzA3XHU1QjlBXHU3Njg0XHU2ODBGXHU3NkVFXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRDYXJkKGNvbHVtbklkOiBzdHJpbmcsIGNhcmRJZDogc3RyaW5nKTogS2FuYmFuQ2FyZCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oY29sdW1uSWQpO1xuXHRcdHJldHVybiBjb2x1bW4uY2FyZHMuZmluZCgoY2FyZCkgPT4gY2FyZC5pZCA9PT0gY2FyZElkKTtcblx0fVxuXG5cdHByaXZhdGUgcmVjb3JkSGlzdG9yeShjYXJkOiBLYW5iYW5DYXJkLCByZW1hcms6IHN0cmluZykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpKSB7XG5cdFx0XHRjYXJkLmhpc3RvcnkgPSBbXTtcblx0XHR9XG5cdFx0Y2FyZC5oaXN0b3J5LnVuc2hpZnQoe1xuXHRcdFx0dGltZXN0YW1wOiBEYXRlLm5vdygpLFxuXHRcdFx0cmVtYXJrOiByZW1hcmsgfHwgXCJcdTY2RjRcdTY1QjBcIixcblx0XHR9KTtcblx0XHRjYXJkLmhpc3RvcnkgPSBjYXJkLmhpc3Rvcnkuc2xpY2UoMCwgNTApO1xuXHR9XG5cblx0cHJpdmF0ZSBub3JtYWxpemVCb2FyZCgpIHtcblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLmJvYXJkLmNvbHVtbnMpIHtcblx0XHRcdGNvbHVtbi5jYXJkcyA9IGNvbHVtbi5jYXJkcy5tYXAoKGNhcmQpID0+ICh7XG5cdFx0XHRcdC4uLmNhcmQsXG5cdFx0XHRcdGRlYWRsaW5lOiBjYXJkLmRlYWRsaW5lID8/IG51bGwsXG5cdFx0XHRcdGNvbXBsZXRlZEF0OiBjYXJkLmNvbXBsZXRlZEF0ID8/IG51bGwsXG5cdFx0XHR9KSk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgYWN0aXZhdGVWaWV3KCkge1xuXHRcdGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFKTtcblx0XHRpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYXZlc1swXSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHJpZ2h0TGVhZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRSaWdodExlYWYoZmFsc2UpO1xuXHRcdGF3YWl0IHJpZ2h0TGVhZj8uc2V0Vmlld1N0YXRlKHsgdHlwZTogVklFV19UWVBFLCBhY3RpdmU6IHRydWUgfSk7XG5cdFx0aWYgKHJpZ2h0TGVhZikge1xuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYocmlnaHRMZWFmKTtcblx0XHR9XG5cdH1cblxuXHRzZXRBY3RpdmVDb2x1bW4oY29sdW1uSWQ6IHN0cmluZykge1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gY29sdW1uSWQ7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVDb2x1bW5Gb3JRdWlja0FkZCgpOiBLYW5iYW5Db2x1bW4gfCB1bmRlZmluZWQge1xuXHRcdGlmICghdGhpcy5ib2FyZC5jb2x1bW5zLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRjb25zdCBwcmVmZXJyZWQgPVxuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgJiYgdGhpcy5ib2FyZC5jb2x1bW5zLmZpbmQoKGNvbCkgPT4gY29sLmlkID09PSB0aGlzLmxhc3RDb2x1bW5JZCk7XG5cdFx0cmV0dXJuIHByZWZlcnJlZCA/PyB0aGlzLmJvYXJkLmNvbHVtbnNbMF07XG5cdH1cblxuXHRvcGVuUXVpY2tBZGRDYXJkKCkge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMucmVzb2x2ZUNvbHVtbkZvclF1aWNrQWRkKCk7XG5cdFx0aWYgKCFjb2x1bW4pIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdThCRjdcdTUxNDhcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcywgY29sdW1uLmlkKS5vcGVuKCk7XG5cdH1cbn1cblxuY2xhc3MgS2FuYmFuVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcblx0cHJpdmF0ZSBkcmFnU3RhdGU/OiB7IGNvbHVtbklkOiBzdHJpbmc7IGNhcmRJZDogc3RyaW5nOyBjYXJkSGVpZ2h0OiBudW1iZXIgfTtcblx0cHJpdmF0ZSBwbGFjZWhvbGRlckVsPzogSFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgcGxhY2Vob2xkZXJTdGF0ZT86IHsgY29sdW1uSWQ6IHN0cmluZzsgYmVmb3JlSWQ/OiBzdHJpbmcgfTtcblx0cHJpdmF0ZSBkZWFkbGluZUZpbHRlcnMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcblx0cHJpdmF0ZSBhY3RpdmVUYWI6IFwiYm9hcmRcIiB8IFwic3RhdHNcIiB8IFwidGltZWxpbmVcIiA9IFwiYm9hcmRcIjtcblx0cHJpdmF0ZSBzdGF0c1JhbmdlOiBTdGF0c1JhbmdlID0geyB0eXBlOiBcInByZXNldFwiLCBkYXlzOiAxNCB9O1xuXHRwcml2YXRlIHRpbWVsaW5lUHJlc2V0OiBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiO1xuXHRwcml2YXRlIHRpbWVsaW5lQ3VzdG9tPzogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9O1xuXHRwcml2YXRlIGxhc3RTY3JvbGxUb3AgPSAwO1xuXHRwcml2YXRlIHNjcm9sbFRhcmdldD86IEhUTUxFbGVtZW50O1xuXHRwcml2YXRlIG91dGVyU2Nyb2xsVGFyZ2V0PzogSFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgY29sdW1uU2Nyb2xsID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblx0cHJpdmF0ZSBzY3JvbGxIYW5kbGVyID0gKGV2dDogRXZlbnQpID0+IHtcblx0XHRjb25zdCB0YXJnZXQgPSAoZXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudCkgPz8gdGhpcy5zY3JvbGxUYXJnZXQgPz8gdGhpcy5jb250ZW50RWw7XG5cdFx0dGhpcy5sYXN0U2Nyb2xsVG9wID0gdGFyZ2V0LnNjcm9sbFRvcDtcblx0fTtcblxuXHRjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCBwcml2YXRlIHBsdWdpbjogU2ltcGxlS2FuYmFuUGx1Z2luKSB7XG5cdFx0c3VwZXIobGVhZik7XG5cdH1cblxuXHRnZXRWaWV3VHlwZSgpIHtcblx0XHRyZXR1cm4gVklFV19UWVBFO1xuXHR9XG5cblx0Z2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gXCJcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIjtcblx0fVxuXG5cdGdldEljb24oKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gSUNPTl9JRDtcblx0fVxuXG5cdGFzeW5jIG9uT3BlbigpIHtcblx0XHR0aGlzLnJlbmRlcigpO1xuXHR9XG5cblx0YXN5bmMgb25DbG9zZSgpIHtcblx0XHR0aGlzLmRyYWdTdGF0ZSA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnRlYXJkb3duU2Nyb2xsVGFyZ2V0KCk7XG5cdFx0dGhpcy5vdXRlclNjcm9sbFRhcmdldCA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRlbnRFbDtcblx0XHRjb25zdCBvdXRlciA9IHRoaXMuZmluZFNjcm9sbFBhcmVudChjb250YWluZXIpO1xuXHRcdGNvbnN0IGN1cnJlbnRTY3JvbGwgPSB0aGlzLnNjcm9sbFRhcmdldD8uc2Nyb2xsVG9wID8/IGNvbnRhaW5lci5zY3JvbGxUb3A7XG5cdFx0Y29uc3Qgb3V0ZXJTY3JvbGwgPSBvdXRlcj8uc2Nyb2xsVG9wID8/IDA7XG5cdFx0dGhpcy5sYXN0U2Nyb2xsVG9wID0gY3VycmVudFNjcm9sbDtcblx0XHRjb25zdCBsYXN0T3V0ZXIgPSBvdXRlclNjcm9sbDtcblx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1Njcm9sbF0gYmVmb3JlIHJlbmRlclwiLCB7XG5cdFx0XHR0YWI6IHRoaXMuYWN0aXZlVGFiLFxuXHRcdFx0c2F2ZWQ6IHRoaXMubGFzdFNjcm9sbFRvcCxcblx0XHRcdGN1cnJlbnQ6IGN1cnJlbnRTY3JvbGwsXG5cdFx0XHRvdXRlcjogbGFzdE91dGVyLFxuXHRcdH0pO1xuXHRcdC8vIFByZXNlcnZlIHNjcm9sbCBvbiBjb2x1bW4gbGlzdHMgYmVmb3JlIHdlIGNsZWFyIERPTS5cblx0XHR0aGlzLmNhcHR1cmVDb2x1bW5TY3JvbGwoKTtcblx0XHRjb250YWluZXIuZW1wdHkoKTtcblx0XHRjb250YWluZXIuYWRkQ2xhc3MoXCJzay1rYW5iYW5cIik7XG5cblx0XHRjb25zdCB0YWJzID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay10YWJzXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJUYWJCdXR0b24odGFicywgXCJib2FyZFwiLCBcIlx1NEVGQlx1NTJBMVx1NzcwQlx1Njc3RlwiKTtcblx0XHR0aGlzLnJlbmRlclRhYkJ1dHRvbih0YWJzLCBcInN0YXRzXCIsIFwiXHU2NTQ4XHU3Mzg3XHU3RURGXHU4QkExXCIpO1xuXHRcdHRoaXMucmVuZGVyVGFiQnV0dG9uKHRhYnMsIFwidGltZWxpbmVcIiwgXCJcdTY1RjZcdTk1RjRcdThGNzRcIik7XG5cblx0XHRjb25zdCBib2R5ID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay10YWItcGFuZWxcIiB9KTtcblx0XHRpZiAodGhpcy5hY3RpdmVUYWIgPT09IFwiYm9hcmRcIikge1xuXHRcdFx0dGhpcy5yZW5kZXJCb2FyZChib2R5KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuYWN0aXZlVGFiID09PSBcInN0YXRzXCIpIHtcblx0XHRcdHRoaXMucmVuZGVyU3RhdHMoYm9keSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVuZGVyVGltZWxpbmUoYm9keSk7XG5cdFx0fVxuXHRcdHRoaXMuc2V0dXBTY3JvbGxUYXJnZXQoYm9keSk7XG5cdFx0dGhpcy5yZXN0b3JlT3V0ZXJTY3JvbGwob3V0ZXJTY3JvbGwsIG91dGVyKTtcblx0XHQvLyBSZXN0b3JlIHBlci1jb2x1bW4gc2Nyb2xsIHBvc2l0aW9ucyBhZnRlciBuZXcgRE9NIGlzIHJlYWR5LlxuXHRcdHRoaXMucmVzdG9yZUNvbHVtblNjcm9sbCgpO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXR1cFNjcm9sbFRhcmdldChlbDogSFRNTEVsZW1lbnQpIHtcblx0XHR0aGlzLnRlYXJkb3duU2Nyb2xsVGFyZ2V0KCk7XG5cdFx0dGhpcy5zY3JvbGxUYXJnZXQgPSBlbDtcblx0XHR0aGlzLnNjcm9sbFRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuc2Nyb2xsSGFuZGxlciwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXHRcdGNvbnN0IHRhcmdldFNjcm9sbCA9IHRoaXMubGFzdFNjcm9sbFRvcDtcblx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1Njcm9sbF0gc2V0dXBcIiwge1xuXHRcdFx0dGFiOiB0aGlzLmFjdGl2ZVRhYixcblx0XHRcdHRhcmdldFNjcm9sbCxcblx0XHRcdHRhcmdldEhlaWdodDogdGhpcy5zY3JvbGxUYXJnZXQuc2Nyb2xsSGVpZ2h0LFxuXHRcdFx0dGFyZ2V0Q2xpZW50OiB0aGlzLnNjcm9sbFRhcmdldC5jbGllbnRIZWlnaHQsXG5cdFx0fSk7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdGlmICh0aGlzLnNjcm9sbFRhcmdldCkge1xuXHRcdFx0XHR0aGlzLnNjcm9sbFRhcmdldC5zY3JvbGxUb3AgPSB0YXJnZXRTY3JvbGw7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU2Nyb2xsXSBhZnRlciByZW5kZXJcIiwge1xuXHRcdFx0XHRcdHRhYjogdGhpcy5hY3RpdmVUYWIsXG5cdFx0XHRcdFx0cmVzdG9yZWQ6IHRhcmdldFNjcm9sbCxcblx0XHRcdFx0XHRhY3R1YWw6IHRoaXMuc2Nyb2xsVGFyZ2V0LnNjcm9sbFRvcCxcblx0XHRcdFx0XHR0YXJnZXRIZWlnaHQ6IHRoaXMuc2Nyb2xsVGFyZ2V0LnNjcm9sbEhlaWdodCxcblx0XHRcdFx0XHR0YXJnZXRDbGllbnQ6IHRoaXMuc2Nyb2xsVGFyZ2V0LmNsaWVudEhlaWdodCxcblx0XHRcdFx0XHRvdXRlcjogdGhpcy5vdXRlclNjcm9sbFRhcmdldD8uc2Nyb2xsVG9wID8/IDAsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSB0ZWFyZG93blNjcm9sbFRhcmdldCgpIHtcblx0XHRpZiAodGhpcy5zY3JvbGxUYXJnZXQpIHtcblx0XHRcdHRoaXMuc2Nyb2xsVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5zY3JvbGxIYW5kbGVyKTtcblx0XHR9XG5cdFx0dGhpcy5zY3JvbGxUYXJnZXQgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRwcml2YXRlIHJlc3RvcmVPdXRlclNjcm9sbCh2YWx1ZTogbnVtYmVyLCB0YXJnZXQ/OiBIVE1MRWxlbWVudCkge1xuXHRcdGlmICghdGFyZ2V0KSByZXR1cm47XG5cdFx0dGhpcy5vdXRlclNjcm9sbFRhcmdldCA9IHRhcmdldDtcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQpIHtcblx0XHRcdFx0dGhpcy5vdXRlclNjcm9sbFRhcmdldC5zY3JvbGxUb3AgPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgY2FwdHVyZUNvbHVtblNjcm9sbCgpIHtcblx0XHRjb25zdCBjb250YWluZXJzID0gQXJyYXkuZnJvbShcblx0XHRcdHRoaXMuY29udGVudEVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFwiLnNrLWNhcmRzW2RhdGEtY29sdW1uXVwiKSxcblx0XHQpO1xuXHRcdGNvbnRhaW5lcnMuZm9yRWFjaCgoZWwpID0+IHtcblx0XHRcdGNvbnN0IGNvbHVtbklkID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2x1bW5cIik7XG5cdFx0XHRpZiAoY29sdW1uSWQpIHtcblx0XHRcdFx0dGhpcy5jb2x1bW5TY3JvbGwuc2V0KGNvbHVtbklkLCBlbC5zY3JvbGxUb3ApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZXN0b3JlQ29sdW1uU2Nyb2xsKCkge1xuXHRcdGNvbnN0IGNvbnRhaW5lcnMgPSBBcnJheS5mcm9tKFxuXHRcdFx0dGhpcy5jb250ZW50RWwucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXCIuc2stY2FyZHNbZGF0YS1jb2x1bW5dXCIpLFxuXHRcdCk7XG5cdFx0Y29udGFpbmVycy5mb3JFYWNoKChlbCkgPT4ge1xuXHRcdFx0Y29uc3QgY29sdW1uSWQgPSBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbHVtblwiKTtcblx0XHRcdGlmICghY29sdW1uSWQpIHJldHVybjtcblx0XHRcdGNvbnN0IHRhcmdldCA9IHRoaXMuY29sdW1uU2Nyb2xsLmdldChjb2x1bW5JZCkgPz8gMDtcblx0XHRcdGVsLnNjcm9sbFRvcCA9IHRhcmdldDtcblx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdFwic2Nyb2xsXCIsXG5cdFx0XHRcdChldnQpID0+IHtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRFbCA9IGV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRcdFx0dGhpcy5jb2x1bW5TY3JvbGwuc2V0KGNvbHVtbklkLCB0YXJnZXRFbC5zY3JvbGxUb3ApO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR7IHBhc3NpdmU6IHRydWUgfSxcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGZpbmRTY3JvbGxQYXJlbnQoZWw6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQgfCBudWxsIHtcblx0XHRsZXQgbm9kZTogSFRNTEVsZW1lbnQgfCBudWxsID0gZWw7XG5cdFx0d2hpbGUgKG5vZGUpIHtcblx0XHRcdGlmIChub2RlLnNjcm9sbEhlaWdodCA+IG5vZGUuY2xpZW50SGVpZ2h0ICsgNCkge1xuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH1cblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJUYWJCdXR0b24oY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdGFiOiBcImJvYXJkXCIgfCBcInN0YXRzXCIsIGxhYmVsOiBzdHJpbmcpIHtcblx0XHRjb25zdCBidXR0b24gPSBjb250YWluZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogbGFiZWwsXG5cdFx0XHRjbHM6IFtcInNrLXRhYlwiLCB0aGlzLmFjdGl2ZVRhYiA9PT0gdGFiID8gXCJzay10YWItYWN0aXZlXCIgOiBcIlwiXS5qb2luKFwiIFwiKS50cmltKCksXG5cdFx0fSk7XG5cdFx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5hY3RpdmVUYWIgPT09IHRhYikgcmV0dXJuO1xuXHRcdFx0dGhpcy5hY3RpdmVUYWIgPSB0YWI7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJCb2FyZChib2R5OiBIVE1MRWxlbWVudCkge1xuXHRcdGNvbnN0IGJvYXJkID0gdGhpcy5wbHVnaW4uZ2V0Qm9hcmQoKTtcblxuXHRcdGNvbnN0IGhlYWRlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhlYWRlclwiIH0pO1xuXHRcdGhlYWRlci5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdTRGQTdcdThGQjlcdTc3MEJcdTY3N0ZcIiB9KTtcblx0XHRjb25zdCBhZGRDb2x1bW5CdG4gPSBoZWFkZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogXCJcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRhZGRDb2x1bW5CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDb2x1bW5Nb2RhbCh0aGlzLmFwcCwge1xuXHRcdFx0XHR0aXRsZTogXCJcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIixcblx0XHRcdFx0Y29uZmlybVRleHQ6IFwiXHU1MjFCXHU1RUZBXCIsXG5cdFx0XHRcdG9uU3VibWl0OiBhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5hZGRDb2x1bW4odmFsdWUpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY29sdW1uc1dyYXBwZXIgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW5zXCIgfSk7XG5cdFx0aWYgKCFib2FyZC5jb2x1bW5zLmxlbmd0aCkge1xuXHRcdFx0Y29sdW1uc1dyYXBwZXIuY3JlYXRlRGl2KHsgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTY4MEZcdTc2RUVcdUZGMENcdTcwQjlcdTUxRkJcdTIwMUNcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcdTIwMURcdTMwMDJcIiwgY2xzOiBcInNrLWVtcHR5XCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBjb2x1bW4gb2YgYm9hcmQuY29sdW1ucykge1xuXHRcdFx0dGhpcy5yZW5kZXJDb2x1bW4oY29sdW1uc1dyYXBwZXIsIGNvbHVtbik7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJTdGF0cyhib2R5OiBIVE1MRWxlbWVudCkge1xuXHRcdGNvbnN0IHN0YXRzID0gdGhpcy5idWlsZFN0YXRzU25hcHNob3QodGhpcy5zdGF0c1JhbmdlKTtcblx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1N0YXRzXSBTbmFwc2hvdFwiLCB7XG5cdFx0XHRyYW5nZTogdGhpcy5zdGF0c1JhbmdlLFxuXHRcdFx0ZGFpbHlTZXJpZXM6IHN0YXRzLmRhaWx5U2VyaWVzLFxuXHRcdFx0ZGFpbHlSYXRlczogc3RhdHMuZGFpbHlSYXRlcyxcblx0XHR9KTtcblxuXHRcdGJvZHkuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiXHU2NTQ4XHU3Mzg3XHU3RURGXHU4QkExXCIsIGNsczogXCJzay1zdGF0cy10aXRsZVwiIH0pO1xuXHRcdGNvbnN0IHJhbmdlQ29udHJvbHMgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1yYW5nZS1jb250cm9sc1wiIH0pO1xuXHRcdHJhbmdlQ29udHJvbHMuY3JlYXRlU3Bhbih7IHRleHQ6IFwiXHU2NUY2XHU5NUY0XHU4MzAzXHU1NkY0XHVGRjFBXCIgfSk7XG5cdFx0Y29uc3Qgc2VsZWN0ID0gcmFuZ2VDb250cm9scy5jcmVhdGVFbChcInNlbGVjdFwiLCB7IGNsczogXCJzay1yYW5nZS1zZWxlY3RcIiB9KSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcblx0XHRjb25zdCBwcmVzZXRPcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0geyBcIjdcdTU5MjlcIjogNywgXCIxNFx1NTkyOVwiOiAxNCwgXCIzMFx1NTkyOVwiOiAzMCwgXCI5MFx1NTkyOVwiOiA5MCB9O1xuXHRcdE9iamVjdC5lbnRyaWVzKHByZXNldE9wdGlvbnMpLmZvckVhY2goKFtsYWJlbCwgZGF5c10pID0+IHtcblx0XHRcdGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHRleHQ6IGxhYmVsLCB2YWx1ZTogZGF5cy50b1N0cmluZygpIH0pO1xuXHRcdFx0aWYgKHRoaXMuc3RhdHNSYW5nZS50eXBlID09PSBcInByZXNldFwiICYmIHRoaXMuc3RhdHNSYW5nZS5kYXlzID09PSBkYXlzKSBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuXHRcdH0pO1xuXHRcdGNvbnN0IGN1c3RvbU9wdGlvbiA9IHNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHRleHQ6IFwiXHU4MUVBXHU1QjlBXHU0RTQ5XCIsIHZhbHVlOiBcImN1c3RvbVwiIH0pO1xuXHRcdGlmICh0aGlzLnN0YXRzUmFuZ2UudHlwZSA9PT0gXCJjdXN0b21cIikgY3VzdG9tT3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcblxuXHRcdGNvbnN0IGN1c3RvbUZpZWxkcyA9IHJhbmdlQ29udHJvbHMuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXJhbmdlLWN1c3RvbVwiIH0pO1xuXHRcdGNvbnN0IHN0YXJ0SW5wdXQgPSBjdXN0b21GaWVsZHMuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZVwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0Y29uc3QgZW5kSW5wdXQgPSBjdXN0b21GaWVsZHMuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZVwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0Y29uc3QgdXBkYXRlQ3VzdG9tSW5wdXRzID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuc3RhdHNSYW5nZS50eXBlID09PSBcImN1c3RvbVwiKSB7XG5cdFx0XHRcdHN0YXJ0SW5wdXQudmFsdWUgPSBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aGlzLnN0YXRzUmFuZ2Uuc3RhcnQpO1xuXHRcdFx0XHRlbmRJbnB1dC52YWx1ZSA9IGZvcm1hdERhdGVJbnB1dFZhbHVlKHRoaXMuc3RhdHNSYW5nZS5lbmQpO1xuXHRcdFx0XHRjdXN0b21GaWVsZHMuYWRkQ2xhc3MoXCJzay1yYW5nZS1jdXN0b20tdmlzaWJsZVwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1c3RvbUZpZWxkcy5yZW1vdmVDbGFzcyhcInNrLXJhbmdlLWN1c3RvbS12aXNpYmxlXCIpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0dXBkYXRlQ3VzdG9tSW5wdXRzKCk7XG5cblx0XHRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG5cdFx0XHRpZiAoc2VsZWN0LnZhbHVlID09PSBcImN1c3RvbVwiKSB7XG5cdFx0XHRcdGNvbnN0IHRvZGF5ID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdFx0XHRjb25zdCBkZWZhdWx0U3RhcnQgPSB0b2RheSAtIDEzICogMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRcdFx0dGhpcy5zdGF0c1JhbmdlID0geyB0eXBlOiBcImN1c3RvbVwiLCBzdGFydDogZGVmYXVsdFN0YXJ0LCBlbmQ6IHRvZGF5IH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnN0YXRzUmFuZ2UgPSB7IHR5cGU6IFwicHJlc2V0XCIsIGRheXM6IE51bWJlcihzZWxlY3QudmFsdWUpIH07XG5cdFx0XHR9XG5cdFx0XHR1cGRhdGVDdXN0b21JbnB1dHMoKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBoYW5kbGVDdXN0b21DaGFuZ2UgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5zdGF0c1JhbmdlLnR5cGUgIT09IFwiY3VzdG9tXCIpIHJldHVybjtcblx0XHRcdGNvbnN0IHN0YXJ0VHMgPSBzdGFydElucHV0LnZhbHVlID8gdGhpcy5zdGFydE9mRGF5KG5ldyBEYXRlKHN0YXJ0SW5wdXQudmFsdWUpLmdldFRpbWUoKSkgOiBudWxsO1xuXHRcdFx0Y29uc3QgZW5kVHMgPSBlbmRJbnB1dC52YWx1ZSA/IHRoaXMuc3RhcnRPZkRheShuZXcgRGF0ZShlbmRJbnB1dC52YWx1ZSkuZ2V0VGltZSgpKSA6IG51bGw7XG5cdFx0XHRpZiAoc3RhcnRUcyAmJiBlbmRUcyAmJiBzdGFydFRzIDw9IGVuZFRzKSB7XG5cdFx0XHRcdHRoaXMuc3RhdHNSYW5nZSA9IHsgdHlwZTogXCJjdXN0b21cIiwgc3RhcnQ6IHN0YXJ0VHMsIGVuZDogZW5kVHMgfTtcblx0XHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHN0YXJ0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBoYW5kbGVDdXN0b21DaGFuZ2UpO1xuXHRcdGVuZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlQ3VzdG9tQ2hhbmdlKTtcblxuXHRcdGNvbnN0IGRhc2hib2FyZCA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXRzLWRhc2hib2FyZFwiIH0pO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoZGFzaGJvYXJkLCBcIlx1NjAzQlx1NEVGQlx1NTJBMVwiLCBzdGF0cy50b3RhbFRhc2tzLnRvU3RyaW5nKCksIFwiXHU3RDJGXHU4QkExXHU1MjFCXHU1RUZBXCIpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoXG5cdFx0XHRkYXNoYm9hcmQsXG5cdFx0XHRcIlx1NUI4Q1x1NjIxMFx1NzM4N1wiLFxuXHRcdFx0Zm9ybWF0UGVyY2VudChzdGF0cy5jb21wbGV0aW9uUmF0ZSksXG5cdFx0XHRgXHU1REYyXHU1QjhDXHU2MjEwICR7c3RhdHMuY29tcGxldGVkVGFza3N9LyR7c3RhdHMudG90YWxUYXNrcyB8fCAxfWAsXG5cdFx0KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKGRhc2hib2FyZCwgXCJcdTVGNTNcdTUyNERcdThGREJcdTg4NENcdTRFMkRcIiwgc3RhdHMud2lwQ291bnQudG9TdHJpbmcoKSwgXCJcdTRFQ0RcdTY3MkFcdTVCOENcdTYyMTBcIik7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChcblx0XHRcdGRhc2hib2FyZCxcblx0XHRcdFwiXHU5MDNFXHU2NzFGXHU3Mzg3XCIsXG5cdFx0XHRzdGF0cy5kZWFkbGluZUNvdW50ID8gZm9ybWF0UGVyY2VudChzdGF0cy5vdmVyZHVlUmF0ZSkgOiBcIlx1MjAxNFwiLFxuXHRcdFx0YCR7c3RhdHMub3ZlcmR1ZUNvdW50fS8ke3N0YXRzLmRlYWRsaW5lQ291bnQgfHwgMX0gXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExYCxcblx0XHQpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoXG5cdFx0XHRkYXNoYm9hcmQsXG5cdFx0XHRcIlx1NjMwOVx1NjVGNlx1NUI4Q1x1NjIxMFx1NzM4N1wiLFxuXHRcdFx0c3RhdHMuZGVhZGxpbmVDb3VudCA/IGZvcm1hdFBlcmNlbnQoc3RhdHMub25UaW1lUmF0ZSkgOiBcIlx1MjAxNFwiLFxuXHRcdFx0XCJcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTBcIixcblx0XHQpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoXG5cdFx0XHRkYXNoYm9hcmQsXG5cdFx0XHRcIlx1NUU3M1x1NTc0N1x1NUI4Q1x1NjIxMFx1NTQ2OFx1NjcxRlwiLFxuXHRcdFx0c3RhdHMuYXZnQ3ljbGVUaW1lTXMgPyBmb3JtYXREdXJhdGlvbihzdGF0cy5hdmdDeWNsZVRpbWVNcykgOiBcIlx1MjAxNFwiLFxuXHRcdFx0XCJcdTRFQ0VcdTUyMUJcdTVFRkFcdTUyMzBcdTVCOENcdTYyMTBcIixcblx0XHQpO1xuXG5cdFx0Y29uc3QgY2hhcnRTZWN0aW9uID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtc2VjdGlvblwiIH0pO1xuXHRcdGNoYXJ0U2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdTZCQ0ZcdTY1RTVcdTRFRkJcdTUyQTFcdThEOEJcdTUyQkZcIiB9KTtcblx0XHR0aGlzLnJlbmRlckRhaWx5QmFyQ2hhcnQoY2hhcnRTZWN0aW9uLCBzdGF0cy5kYWlseVNlcmllcyk7XG5cblx0XHRjb25zdCByYXRlU2VjdGlvbiA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXRzLXNlY3Rpb25cIiB9KTtcblx0XHRyYXRlU2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdTZCQ0ZcdTY1RTVcdTVCOENcdTYyMTBcdTczODdcIiB9KTtcblx0XHR0aGlzLnJlbmRlckRhaWx5UmF0ZUNoYXJ0KHJhdGVTZWN0aW9uLCBzdGF0cy5kYWlseVJhdGVzKTtcblxuXHRcdGNvbnN0IGRlYWRsaW5lU2VjdGlvbiA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXRzLXNlY3Rpb25cIiB9KTtcblx0XHRkZWFkbGluZVNlY3Rpb24uY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXHU2OTgyXHU4OUM4XCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJEZWFkbGluZUJyZWFrZG93bihkZWFkbGluZVNlY3Rpb24sIHN0YXRzKTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVGltZWxpbmUoYm9keTogSFRNTEVsZW1lbnQpIHtcblx0XHRjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMucmVzb2x2ZVRpbWVsaW5lUmFuZ2UoKTtcblx0XHRjb25zdCBlbnRyaWVzID0gdGhpcy5idWlsZFRpbWVsaW5lRW50cmllcyhzdGFydCwgZW5kKTtcblxuXHRcdGNvbnN0IGhlYWRlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhlYWRlclwiIH0pO1xuXHRcdGhlYWRlci5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdTY1RjZcdTk1RjRcdThGNzRcIiB9KTtcblx0XHRjb25zdCBjb250cm9scyA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtY29udHJvbHNcIiB9KTtcblx0XHRjb25zdCBwcmVzZXRTZWxlY3QgPSBjb250cm9scy5jcmVhdGVFbChcInNlbGVjdFwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcblx0XHRbXG5cdFx0XHR7IHZhbHVlOiBcInRvZGF5XCIsIGxhYmVsOiBcIlx1NEVDQVx1NTkyOVwiIH0sXG5cdFx0XHR7IHZhbHVlOiBcInllc3RlcmRheVwiLCBsYWJlbDogXCJcdTY2MjhcdTU5MjlcIiB9LFxuXHRcdFx0eyB2YWx1ZTogXCJjdXN0b21cIiwgbGFiZWw6IFwiXHU4MUVBXHU1QjlBXHU0RTQ5XCIgfSxcblx0XHRdLmZvckVhY2goKG9wdGlvbikgPT4ge1xuXHRcdFx0Y29uc3Qgb3B0ID0gcHJlc2V0U2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdGV4dDogb3B0aW9uLmxhYmVsLCB2YWx1ZTogb3B0aW9uLnZhbHVlIH0pO1xuXHRcdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgPT09IG9wdGlvbi52YWx1ZSkgb3B0LnNlbGVjdGVkID0gdHJ1ZTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGN1c3RvbVdyYXBwZXIgPSBjb250cm9scy5jcmVhdGVEaXYoeyBjbHM6IFwic2stcmFuZ2UtY3VzdG9tXCIgfSk7XG5cdFx0Y29uc3Qgc3RhcnRJbnB1dCA9IGN1c3RvbVdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZVwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0Y29uc3QgZW5kSW5wdXQgPSBjdXN0b21XcmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGVcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXG5cdFx0Y29uc3QgdXBkYXRlQ3VzdG9tSW5wdXRzID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgPT09IFwiY3VzdG9tXCIgJiYgdGhpcy50aW1lbGluZUN1c3RvbSkge1xuXHRcdFx0XHRzdGFydElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy50aW1lbGluZUN1c3RvbS5zdGFydCk7XG5cdFx0XHRcdGVuZElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy50aW1lbGluZUN1c3RvbS5lbmQpO1xuXHRcdFx0XHRjdXN0b21XcmFwcGVyLmFkZENsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXN0b21XcmFwcGVyLnJlbW92ZUNsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR1cGRhdGVDdXN0b21JbnB1dHMoKTtcblxuXHRcdGNvbnN0IGFwcGx5UHJlc2V0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBwcmVzZXRTZWxlY3QudmFsdWUgYXMgVGltZWxpbmVSYW5nZVByZXNldDtcblx0XHRcdHRoaXMudGltZWxpbmVQcmVzZXQgPSB2YWx1ZTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gXCJ0b2RheVwiKSB7XG5cdFx0XHRcdGNvbnN0IHRvZGF5ID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdFx0XHR0aGlzLnRpbWVsaW5lQ3VzdG9tID0geyBzdGFydDogdG9kYXksIGVuZDogdG9kYXkgfTtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWUgPT09IFwieWVzdGVyZGF5XCIpIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdGNvbnN0IHllc3RlcmRheSA9IHRvZGF5IC0gMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRcdFx0dGhpcy50aW1lbGluZUN1c3RvbSA9IHsgc3RhcnQ6IHllc3RlcmRheSwgZW5kOiB5ZXN0ZXJkYXkgfTtcblx0XHRcdH0gZWxzZSBpZiAoIXRoaXMudGltZWxpbmVDdXN0b20pIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdHRoaXMudGltZWxpbmVDdXN0b20gPSB7IHN0YXJ0OiB0b2RheSwgZW5kOiB0b2RheSB9O1xuXHRcdFx0fVxuXHRcdFx0dXBkYXRlQ3VzdG9tSW5wdXRzKCk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH07XG5cdFx0cHJlc2V0U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgYXBwbHlQcmVzZXQpO1xuXG5cdFx0Y29uc3QgaGFuZGxlQ3VzdG9tQ2hhbmdlID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgIT09IFwiY3VzdG9tXCIpIHJldHVybjtcblx0XHRcdGNvbnN0IHN0YXJ0RGF0ZSA9IHN0YXJ0SW5wdXQudmFsdWUgPyBuZXcgRGF0ZShzdGFydElucHV0LnZhbHVlKS5nZXRUaW1lKCkgOiBudWxsO1xuXHRcdFx0Y29uc3QgZW5kRGF0ZSA9IGVuZElucHV0LnZhbHVlID8gbmV3IERhdGUoZW5kSW5wdXQudmFsdWUpLmdldFRpbWUoKSA6IG51bGw7XG5cdFx0XHRpZiAoc3RhcnREYXRlICYmIGVuZERhdGUgJiYgc3RhcnREYXRlIDw9IGVuZERhdGUpIHtcblx0XHRcdFx0dGhpcy50aW1lbGluZUN1c3RvbSA9IHtcblx0XHRcdFx0XHRzdGFydDogdGhpcy5zdGFydE9mRGF5KHN0YXJ0RGF0ZSksXG5cdFx0XHRcdFx0ZW5kOiB0aGlzLnN0YXJ0T2ZEYXkoZW5kRGF0ZSksXG5cdFx0XHRcdH07XG5cdFx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRzdGFydElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlQ3VzdG9tQ2hhbmdlKTtcblx0XHRlbmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGhhbmRsZUN1c3RvbUNoYW5nZSk7XG5cblx0XHRpZiAoIWVudHJpZXMubGVuZ3RoKSB7XG5cdFx0XHRib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1lbXB0eVwiLCB0ZXh0OiBcIlx1OEJFNVx1NjVGNlx1OTVGNFx1ODMwM1x1NTZGNFx1NTE4NVx1NkNBMVx1NjcwOVx1NjRDRFx1NEY1Q1x1OEJCMFx1NUY1NVwiIH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRpbWVsaW5lV3JhcHBlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLXdyYXBwZXJcIiB9KTtcblx0XHRjb25zdCB0aW1lbGluZSA9IHRpbWVsaW5lV3JhcHBlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmVcIiB9KTtcblx0XHRlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG5cdFx0XHRjb25zdCByb3cgPSB0aW1lbGluZS5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtcm93XCIgfSk7XG5cdFx0XHRjb25zdCB0aW1lQm94ID0gcm93LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS10aW1lYm94XCIgfSk7XG5cdFx0XHR0aW1lQm94LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1kYXRlXCIsIHRleHQ6IGZvcm1hdERhdGVPbmx5KGVudHJ5LnRpbWVzdGFtcCkgfSk7XG5cdFx0XHR0aW1lQm94LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS10aW1lXCIsIHRleHQ6IGZvcm1hdFRpbWUoZW50cnkudGltZXN0YW1wKSB9KTtcblx0XHRcdHRpbWVCb3guc2V0QXR0cihcInRpdGxlXCIsIGZvcm1hdERhdGUoZW50cnkudGltZXN0YW1wKSk7XG5cdFx0XHRjb25zdCBtYXJrZXIgPSByb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLW1hcmtlclwiIH0pO1xuXHRcdFx0Y29uc3QgY29udGVudCA9IHJvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtY29udGVudFwiIH0pO1xuXHRcdFx0Y29udGVudC5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtY2FyZC10aXRsZVwiLCB0ZXh0OiBlbnRyeS5jYXJkVGl0bGUgfSk7XG5cdFx0XHRjb250ZW50LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jYXJkLWJvZHlcIiwgdGV4dDogZW50cnkudGV4dCB9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ29sdW1uKHdyYXBwZXI6IEhUTUxFbGVtZW50LCBjb2x1bW46IEthbmJhbkNvbHVtbikge1xuXHRcdGNvbnN0IGNvbHVtbkVsID0gd3JhcHBlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uXCIgfSk7XG5cblx0XHRjb25zdCBjb2x1bW5IZWFkZXIgPSBjb2x1bW5FbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uLWhlYWRlclwiIH0pO1xuXHRcdGNvbnN0IHRpdGxlRWwgPSBjb2x1bW5IZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbi10aXRsZVwiLCBhdHRyOiB7IHJvbGU6IFwiYnV0dG9uXCIgfSB9KTtcblx0XHR0aXRsZUVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBjb2x1bW4ubmFtZSB9KTtcblx0XHR0aXRsZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHRuZXcgQ29sdW1uTW9kYWwodGhpcy5hcHAsIHtcblx0XHRcdFx0dGl0bGU6IFwiXHU3RjE2XHU4RjkxXHU2ODBGXHU3NkVFXCIsXG5cdFx0XHRcdGluaXRpYWxWYWx1ZTogY29sdW1uLm5hbWUsXG5cdFx0XHRcdGNvbmZpcm1UZXh0OiBcIlx1NEZERFx1NUI1OFwiLFxuXHRcdFx0XHRvblN1Ym1pdDogYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4ucmVuYW1lQ29sdW1uKGNvbHVtbi5pZCwgdmFsdWUpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgYWN0aW9uc0VsID0gY29sdW1uSGVhZGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW4tYWN0aW9uc1wiIH0pO1xuXHRcdGNvbnN0IGFkZEJ0biA9IGFjdGlvbnNFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU2REZCXHU1MkEwXHU1MzYxXHU3MjQ3XCIsIGNsczogXCJzay1idG4gc2stYnRuLXNtYWxsXCIgfSk7XG5cdFx0YWRkQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnBsdWdpbi5zZXRBY3RpdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRcdG5ldyBDYXJkTW9kYWwodGhpcy5hcHAsIHRoaXMucGx1Z2luLCBjb2x1bW4uaWQpLm9wZW4oKTtcblx0XHR9KTtcblx0XHRjb25zdCBkZWxldGVCdG4gPSBhY3Rpb25zRWwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogXCJcdTUyMjBcdTk2NjRcIixcblx0XHRcdGNsczogXCJzay1idG4gc2stYnRuLWdob3N0IHNrLWJ0bi1zbWFsbFwiLFxuXHRcdFx0YXR0cjogeyBcImFyaWEtbGFiZWxcIjogXCJcdTUyMjBcdTk2NjRcdTY4MEZcdTc2RUVcIiB9LFxuXHRcdH0pO1xuXHRcdGRlbGV0ZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0bmV3IENvbmZpcm1Nb2RhbCh0aGlzLmFwcCwge1xuXHRcdFx0XHR0aXRsZTogXCJcdTUyMjBcdTk2NjRcdTY4MEZcdTc2RUVcIixcblx0XHRcdFx0bWVzc2FnZTogYFx1Nzg2RVx1NUI5QVx1NTIyMFx1OTY2NFx1MzAwQyR7Y29sdW1uLm5hbWV9XHUzMDBEXHU1M0NBXHU1MTc2XHU2MjQwXHU2NzA5XHU1MzYxXHU3MjQ3XHVGRjFGYCxcblx0XHRcdFx0Y29uZmlybVRleHQ6IFwiXHU1MjIwXHU5NjY0XCIsXG5cdFx0XHRcdG9uQ29uZmlybTogYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnJlbW92ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY2FyZHNDb250YWluZXIgPSBjb2x1bW5FbC5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBcInNrLWNhcmRzXCIsXG5cdFx0XHRhdHRyOiB7IFwiZGF0YS1jb2x1bW5cIjogY29sdW1uLmlkIH0sXG5cdFx0fSk7XG5cdFx0Y29uc3QgZmlsdGVyV3JhcHBlciA9IGFjdGlvbnNFbC5jcmVhdGVFbChcImxhYmVsXCIsIHsgY2xzOiBcInNrLWZpbHRlci10b2dnbGVcIiB9KTtcblx0XHRjb25zdCBkZWFkbGluZU9ubHkgPSB0aGlzLmRlYWRsaW5lRmlsdGVycy5nZXQoY29sdW1uLmlkKSA/PyBmYWxzZTtcblx0XHRjb25zdCBmaWx0ZXJDaGVja2JveCA9IGZpbHRlcldyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGZpbHRlckNoZWNrYm94LmNoZWNrZWQgPSBkZWFkbGluZU9ubHk7XG5cdFx0ZmlsdGVyQ2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmRlYWRsaW5lRmlsdGVycy5zZXQoY29sdW1uLmlkLCBmaWx0ZXJDaGVja2JveC5jaGVja2VkKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cdFx0ZmlsdGVyV3JhcHBlci5jcmVhdGVTcGFuKHsgdGV4dDogXCJcdTRFQzVcdTYyMkFcdTZCNjJcIiB9KTtcblxuXHRcdGNhcmRzQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmIChldnQuZGF0YVRyYW5zZmVyKSBldnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcIm1vdmVcIjtcblx0XHRcdGNvbnN0IGJlZm9yZUlkID0gdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdHRoaXMubW92ZVBsYWNlaG9sZGVyKGNhcmRzQ29udGFpbmVyLCBiZWZvcmVJZCk7XG5cdFx0fSk7XG5cdFx0Y2FyZHNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRjb25zdCBiZWZvcmVJZCA9XG5cdFx0XHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZT8uY29sdW1uSWQgPT09IGNvbHVtbi5pZFxuXHRcdFx0XHRcdD8gdGhpcy5wbGFjZWhvbGRlclN0YXRlLmJlZm9yZUlkXG5cdFx0XHRcdFx0OiB0aGlzLmdldEJlZm9yZUNhcmRJZChjYXJkc0NvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dm9pZCB0aGlzLmhhbmRsZURyb3AoY29sdW1uLmlkLCBiZWZvcmVJZCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjYXJkc1RvUmVuZGVyID0gdGhpcy5nZXRDYXJkc0ZvckNvbHVtbihjb2x1bW4sIGRlYWRsaW5lT25seSk7XG5cblx0XHRpZiAoIWNhcmRzVG9SZW5kZXIubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBlbXB0eVRleHQgPSBkZWFkbGluZU9ubHkgPyBcIlx1NjY4Mlx1NjVFMFx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVwiIDogXCJcdUQ4M0RcdURDREQgXHU2NjgyXHU2NUUwXHU0RUZCXHU1MkExXCI7XG5cdFx0XHRjb25zdCBlbXB0eSA9IGNhcmRzQ29udGFpbmVyLmNyZWF0ZURpdih7IHRleHQ6IGVtcHR5VGV4dCwgY2xzOiBcInNrLWVtcHR5XCIgfSk7XG5cdFx0XHRlbXB0eS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2dCkgPT4ge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0XHRjb25zdCBiZWZvcmVJZCA9IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHRcdHRoaXMubW92ZVBsYWNlaG9sZGVyKGNhcmRzQ29udGFpbmVyLCBiZWZvcmVJZCk7XG5cdFx0XHR9KTtcblx0XHRcdGVtcHR5LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIChldnQpID0+IHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGNvbnN0IGJlZm9yZUlkID1cblx0XHRcdFx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGU/LmNvbHVtbklkID09PSBjb2x1bW4uaWRcblx0XHRcdFx0XHRcdD8gdGhpcy5wbGFjZWhvbGRlclN0YXRlLmJlZm9yZUlkXG5cdFx0XHRcdFx0XHQ6IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHRcdHZvaWQgdGhpcy5oYW5kbGVEcm9wKGNvbHVtbi5pZCwgYmVmb3JlSWQpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y2FyZHNUb1JlbmRlci5mb3JFYWNoKChjYXJkKSA9PiB7XG5cdFx0XHR0aGlzLnJlbmRlckNhcmQoY2FyZHNDb250YWluZXIsIGNvbHVtbiwgY2FyZCk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckNhcmQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY29sdW1uOiBLYW5iYW5Db2x1bW4sIGNhcmQ6IEthbmJhbkNhcmQpIHtcblx0XHRjb25zdCBjYXJkQ2xhc3NlcyA9IFtcInNrLWNhcmRcIl07XG5cdFx0aWYgKGNhcmQuY29tcGxldGVkKSBjYXJkQ2xhc3Nlcy5wdXNoKFwic2stY2FyZC1jb21wbGV0ZWRcIik7XG5cdFx0aWYgKGNhcmQuZGVhZGxpbmUpIGNhcmRDbGFzc2VzLnB1c2goXCJzay1jYXJkLWRlYWRsaW5lXCIpO1xuXHRcdGNvbnN0IGNhcmRFbCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBjYXJkQ2xhc3Nlcy5qb2luKFwiIFwiKSxcblx0XHRcdGF0dHI6IHsgZHJhZ2dhYmxlOiBcInRydWVcIiwgXCJkYXRhLWNhcmRcIjogY2FyZC5pZCB9LFxuXHRcdH0pO1xuXHRcdGNhcmRFbC5kYXRhc2V0LmNhcmRJZCA9IGNhcmQuaWQ7XG5cblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCAoZXZ0KSA9PiB7XG5cdFx0XHR0aGlzLmRyYWdTdGF0ZSA9IHsgY2FyZElkOiBjYXJkLmlkLCBjb2x1bW5JZDogY29sdW1uLmlkLCBjYXJkSGVpZ2h0OiBjYXJkRWwub2Zmc2V0SGVpZ2h0IH07XG5cdFx0XHRjYXJkRWwuYWRkQ2xhc3MoXCJzay1jYXJkLWRyYWdnaW5nXCIpO1xuXHRcdFx0ZXZ0LmRhdGFUcmFuc2Zlcj8uc2V0RGF0YShcInRleHQvcGxhaW5cIiwgY2FyZC5pZCk7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW5kXCIsICgpID0+IHtcblx0XHRcdGNhcmRFbC5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJhZ2dpbmdcIik7XG5cdFx0XHR0aGlzLnJlc2V0RHJhZ1N0YXRlKCk7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmIChldnQuZGF0YVRyYW5zZmVyKSBldnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcIm1vdmVcIjtcblx0XHRcdGNhcmRFbC5hZGRDbGFzcyhcInNrLWNhcmQtZHJvcFwiKTtcblx0XHRcdGNvbnN0IGNvbnRhaW5lciA9IGNhcmRFbC5wYXJlbnRFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0Y29uc3QgYmVmb3JlSWQgPSB0aGlzLmdldEJlZm9yZUNhcmRJZChjb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdHRoaXMubW92ZVBsYWNlaG9sZGVyKGNvbnRhaW5lciwgYmVmb3JlSWQpO1xuXHRcdH0pO1xuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsICgpID0+IHtcblx0XHRcdGNhcmRFbC5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJvcFwiKTtcblx0XHR9KTtcblxuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2dCkgPT4ge1xuXHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblx0XHRcdGlmICh0YXJnZXQuY2xvc2VzdChcIi5zay1oaXN0b3J5LWhvc3RcIikpIHJldHVybjtcblx0XHRcdHRoaXMucGx1Z2luLnNldEFjdGl2ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGNvbHVtbi5pZCwgY2FyZCkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgdG9wUm93ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRvcFwiIH0pO1xuXHRcdGNvbnN0IGNoZWNrYm94ID0gdG9wUm93LmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjaGVja2JveC5jaGVja2VkID0gY2FyZC5jb21wbGV0ZWQ7XG5cdFx0Y2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChldnQpID0+IHtcblx0XHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnRvZ2dsZUNhcmRDb21wbGV0aW9uKGNvbHVtbi5pZCwgY2FyZC5pZCwgY2hlY2tib3guY2hlY2tlZCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCB0aXRsZUVsID0gdG9wUm93LmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRpdGxlXCIsIHRleHQ6IGNhcmQudGl0bGUgfSk7XG5cblx0XHRjb25zdCBoaXN0b3J5SG9zdCA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2staGlzdG9yeS1ob3N0XCIgfSk7XG5cdFx0Y29uc3QgaGlzdG9yeU1hcmtlciA9IGhpc3RvcnlIb3N0LmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LW1hcmtlclwiLCB0ZXh0OiBcIlx1MjNGMVwiIH0pO1xuXHRcdGNvbnN0IHBvcG92ZXIgPSBoaXN0b3J5SG9zdC5jcmVhdGVEaXYoeyBjbHM6IFwic2staGlzdG9yeS1wb3BvdmVyXCIgfSk7XG5cdFx0Y29uc3QgaGlzdG9yeUVudHJpZXMgPSBBcnJheS5pc0FycmF5KGNhcmQuaGlzdG9yeSkgPyBjYXJkLmhpc3RvcnkgOiBbXTtcblx0XHRoaXN0b3J5RW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuXHRcdFx0cG9wb3Zlci5jcmVhdGVEaXYoe1xuXHRcdFx0XHRjbHM6IFwic2staGlzdG9yeS1lbnRyeVwiLFxuXHRcdFx0XHR0ZXh0OiBgJHtmb3JtYXREYXRlKGVudHJ5LnRpbWVzdGFtcCl9IFx1MDBCNyAke2VudHJ5LnJlbWFyayB8fCBcIlx1NEZFRVx1NjUzOVwifWAsXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRpZiAoIWhpc3RvcnlFbnRyaWVzLmxlbmd0aCkge1xuXHRcdFx0cG9wb3Zlci5jcmVhdGVEaXYoeyB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1NTM4Nlx1NTNGMlwiLCBjbHM6IFwic2staGlzdG9yeS1lbnRyeVwiIH0pO1xuXHRcdH1cblx0XHRsZXQgaGlkZVRpbWVvdXQ6IE51bGxhYmxlVGltZW91dCA9IG51bGw7XG5cdFx0Y29uc3QgY2xlYXJIaWRlVGltZW91dCA9ICgpID0+IHtcblx0XHRcdGlmIChoaWRlVGltZW91dCAhPT0gbnVsbCkge1xuXHRcdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KGhpZGVUaW1lb3V0KTtcblx0XHRcdFx0aGlkZVRpbWVvdXQgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3Qgc2hvd0hpc3RvcnkgPSAoKSA9PiB7XG5cdFx0XHRjbGVhckhpZGVUaW1lb3V0KCk7XG5cdFx0XHRoaXN0b3J5SG9zdC5hZGRDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0fTtcblx0XHRjb25zdCBzY2hlZHVsZUhpZGUgPSAoKSA9PiB7XG5cdFx0XHRjbGVhckhpZGVUaW1lb3V0KCk7XG5cdFx0XHRoaWRlVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0aWYgKCFoaXN0b3J5SG9zdC5oYXNDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpKSB7XG5cdFx0XHRcdFx0aGlzdG9yeUhvc3QucmVtb3ZlQ2xhc3MoXCJzay1oaXN0b3J5LWhvdmVyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAxNTApO1xuXHRcdH07XG5cdFx0aGlzdG9yeUhvc3QuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd0hpc3RvcnkpO1xuXHRcdGhpc3RvcnlIb3N0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHNjaGVkdWxlSGlkZSk7XG5cdFx0aGlzdG9yeU1hcmtlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0Y2xlYXJIaWRlVGltZW91dCgpO1xuXHRcdFx0aWYgKGhpc3RvcnlIb3N0Lmhhc0NsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIikpIHtcblx0XHRcdFx0aGlzdG9yeUhvc3QucmVtb3ZlQ2xhc3MoXCJzay1oaXN0b3J5LXBpbm5lZFwiKTtcblx0XHRcdFx0aWYgKCFoaXN0b3J5SG9zdC5tYXRjaGVzKFwiOmhvdmVyXCIpKSB7XG5cdFx0XHRcdFx0aGlzdG9yeUhvc3QucmVtb3ZlQ2xhc3MoXCJzay1oaXN0b3J5LWhvdmVyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRoaXN0b3J5SG9zdC5hZGRDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpO1xuXHRcdFx0XHRoaXN0b3J5SG9zdC5hZGRDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3QgZGlzYWJsZURyYWcgPSAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRjYXJkRWwuc2V0QXR0cihcImRyYWdnYWJsZVwiLCBcImZhbHNlXCIpO1xuXHRcdFx0Y29uc3QgZW5hYmxlID0gKCkgPT4ge1xuXHRcdFx0XHRjYXJkRWwuc2V0QXR0cihcImRyYWdnYWJsZVwiLCBcInRydWVcIik7XG5cdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGVuYWJsZSk7XG5cdFx0XHR9O1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZW5hYmxlKTtcblx0XHR9O1xuXHRcdGhpc3RvcnlIb3N0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZGlzYWJsZURyYWcpO1xuXHRcdHBvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBkaXNhYmxlRHJhZyk7XG5cblx0XHRpZiAoY2FyZC50YWdzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgdGFnUm93ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRhZ3NcIiB9KTtcblx0XHRcdGNhcmQudGFncy5mb3JFYWNoKCh0YWcpID0+IHRhZ1Jvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFnXCIsIHRleHQ6IHRhZyB9KSk7XG5cdFx0fVxuXG5cdFx0aWYgKGNhcmQucmVtYXJrKSB7XG5cdFx0XHRjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtcmVtYXJrXCIsIHRleHQ6IGNhcmQucmVtYXJrIH0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1ldGEgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtbWV0YVwiIH0pO1xuXHRcdG1ldGEuY3JlYXRlU3Bhbih7IHRleHQ6IGBcdTUyMUJcdTVFRkFcdUZGMUEke2Zvcm1hdERhdGUoY2FyZC5jcmVhdGVkQXQpfWAgfSk7XG5cdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NjZGNFx1NjVCMFx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLnVwZGF0ZWRBdCl9YCB9KTtcblx0XHRpZiAoY2FyZC5kZWFkbGluZSkge1xuXHRcdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NjIyQVx1NkI2Mlx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLmRlYWRsaW5lKX1gLCBjbHM6IFwic2stY2FyZC1kZWFkbGluZS10ZXh0XCIgfSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhcmRFbDtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlRHJvcCh0YXJnZXRDb2x1bW5JZDogc3RyaW5nLCBiZWZvcmVDYXJkSWQ/OiBzdHJpbmcpIHtcblx0XHRpZiAoIXRoaXMuZHJhZ1N0YXRlKSByZXR1cm47XG5cdFx0Y29uc3QgeyBjb2x1bW5JZCwgY2FyZElkIH0gPSB0aGlzLmRyYWdTdGF0ZTtcblx0XHRpZiAodGFyZ2V0Q29sdW1uSWQgPT09IGNvbHVtbklkICYmIGJlZm9yZUNhcmRJZCA9PT0gY2FyZElkKSB7XG5cdFx0XHR0aGlzLnJlc2V0RHJhZ1N0YXRlKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGx1Z2luLm1vdmVDYXJkKGNhcmRJZCwgY29sdW1uSWQsIHRhcmdldENvbHVtbklkLCBiZWZvcmVDYXJkSWQpO1xuXHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0QmVmb3JlQ2FyZElkKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNsaWVudFk6IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgY2FyZHMgPSBBcnJheS5mcm9tKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcIi5zay1jYXJkXCIpKTtcblx0XHRmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcblx0XHRcdGNvbnN0IHJlY3QgPSBjYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0Y29uc3QgbWlkcG9pbnQgPSByZWN0LnRvcCArIHJlY3QuaGVpZ2h0IC8gMjtcblx0XHRcdGlmIChjbGllbnRZIDwgbWlkcG9pbnQpIHtcblx0XHRcdFx0Y29uc3QgaWQgPSBjYXJkLmRhdGFzZXQuY2FyZElkO1xuXHRcdFx0XHRyZXR1cm4gaWQgfHwgdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRDYXJkc0ZvckNvbHVtbihjb2x1bW46IEthbmJhbkNvbHVtbiwgZGVhZGxpbmVPbmx5OiBib29sZWFuKTogS2FuYmFuQ2FyZFtdIHtcblx0XHRpZiAoIWRlYWRsaW5lT25seSkge1xuXHRcdFx0cmV0dXJuIGNvbHVtbi5jYXJkcztcblx0XHR9XG5cdFx0cmV0dXJuIGNvbHVtbi5jYXJkc1xuXHRcdFx0LmZpbHRlcigoY2FyZCkgPT4gISFjYXJkLmRlYWRsaW5lKVxuXHRcdFx0LnNsaWNlKClcblx0XHRcdC5zb3J0KChhLCBiKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGFUaW1lID0gYS5kZWFkbGluZSA/PyAwO1xuXHRcdFx0XHRjb25zdCBiVGltZSA9IGIuZGVhZGxpbmUgPz8gMDtcblx0XHRcdFx0cmV0dXJuIGFUaW1lIC0gYlRpbWU7XG5cdFx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgZW5zdXJlUGxhY2Vob2xkZXIoKTogSFRNTEVsZW1lbnQge1xuXHRcdGlmICghdGhpcy5wbGFjZWhvbGRlckVsKSB7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0dGhpcy5wbGFjZWhvbGRlckVsLmFkZENsYXNzKFwic2stY2FyZC1wbGFjZWhvbGRlclwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMucGxhY2Vob2xkZXJFbDtcblx0fVxuXG5cdHByaXZhdGUgbW92ZVBsYWNlaG9sZGVyKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGJlZm9yZUlkPzogc3RyaW5nKSB7XG5cdFx0aWYgKCF0aGlzLmRyYWdTdGF0ZSkgcmV0dXJuO1xuXHRcdGNvbnN0IGNvbHVtbklkID0gY29udGFpbmVyLmdldEF0dHJpYnV0ZShcImRhdGEtY29sdW1uXCIpO1xuXHRcdGlmICghY29sdW1uSWQpIHJldHVybjtcblx0XHRjb25zdCBwbGFjZWhvbGRlciA9IHRoaXMuZW5zdXJlUGxhY2Vob2xkZXIoKTtcblx0XHRjb25zdCBkZXNpcmVkSGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5kcmFnU3RhdGUuY2FyZEhlaWdodCB8fCAwLCA0OCk7XG5cdFx0cGxhY2Vob2xkZXIuc3R5bGUuaGVpZ2h0ID0gYCR7ZGVzaXJlZEhlaWdodH1weGA7XG5cdFx0aWYgKHBsYWNlaG9sZGVyLnBhcmVudEVsZW1lbnQgIT09IGNvbnRhaW5lcikge1xuXHRcdFx0dGhpcy5yZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKTtcblx0XHRcdGNvbnRhaW5lci5hZGRDbGFzcyhcInNrLWNhcmRzLXBsYWNlaG9sZGVyXCIpO1xuXHRcdH1cblx0XHRjb25zdCByZWZlcmVuY2UgPSBiZWZvcmVJZFxuXHRcdFx0PyBjb250YWluZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oYC5zay1jYXJkW2RhdGEtY2FyZC1pZD1cIiR7YmVmb3JlSWR9XCJdYClcblx0XHRcdDogbnVsbDtcblx0XHRpZiAocmVmZXJlbmNlKSB7XG5cdFx0XHRjb250YWluZXIuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCByZWZlcmVuY2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQocGxhY2Vob2xkZXIpO1xuXHRcdH1cblx0XHR0aGlzLnNldEVtcHR5TWVzc2FnZVZpc2libGUoY29udGFpbmVyLCBmYWxzZSk7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0geyBjb2x1bW5JZCwgYmVmb3JlSWQgfTtcblx0fVxuXG5cdHByaXZhdGUgcmVzdG9yZVBsYWNlaG9sZGVyUGFyZW50KCkge1xuXHRcdGlmICh0aGlzLnBsYWNlaG9sZGVyRWw/LnBhcmVudEVsZW1lbnQpIHtcblx0XHRcdGNvbnN0IHBhcmVudCA9IHRoaXMucGxhY2Vob2xkZXJFbC5wYXJlbnRFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0cGFyZW50LnJlbW92ZUNsYXNzKFwic2stY2FyZHMtcGxhY2Vob2xkZXJcIik7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyRWwucmVtb3ZlKCk7XG5cdFx0XHR0aGlzLnNldEVtcHR5TWVzc2FnZVZpc2libGUocGFyZW50LCB0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbW92ZVBsYWNlaG9sZGVyKCkge1xuXHRcdHRoaXMucmVzdG9yZVBsYWNlaG9sZGVyUGFyZW50KCk7XG5cdFx0dGhpcy5wbGFjZWhvbGRlckVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdHByaXZhdGUgc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShjb250YWluZXI6IEhUTUxFbGVtZW50LCB2aXNpYmxlOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgZW1wdHlFbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIi5zay1lbXB0eVwiKTtcblx0XHRpZiAoZW1wdHlFbCkge1xuXHRcdFx0ZW1wdHlFbC5zdHlsZS5kaXNwbGF5ID0gdmlzaWJsZSA/IFwiXCIgOiBcIm5vbmVcIjtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlc2V0RHJhZ1N0YXRlKCkge1xuXHRcdHRoaXMuZHJhZ1N0YXRlID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZSA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnJlbW92ZVBsYWNlaG9sZGVyKCk7XG5cdFx0dGhpcy5jb250ZW50RWwucXVlcnlTZWxlY3RvckFsbChcIi5zay1jYXJkLWRyb3BcIikuZm9yRWFjaCgoZWwpID0+IChlbCBhcyBIVE1MRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJzay1jYXJkLWRyb3BcIikpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJTdGF0Q2FyZChjb250YWluZXI6IEhUTUxFbGVtZW50LCB0aXRsZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG5cdFx0Y29uc3QgY2FyZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdC1jYXJkXCIgfSk7XG5cdFx0Y2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IHRpdGxlLCBjbHM6IFwic2stc3RhdC1jYXJkLXRpdGxlXCIgfSk7XG5cdFx0Y2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IHZhbHVlLCBjbHM6IFwic2stc3RhdC1jYXJkLXZhbHVlXCIgfSk7XG5cdFx0Y2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGRlc2NyaXB0aW9uLCBjbHM6IFwic2stc3RhdC1jYXJkLWRlc2NcIiB9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGFpbHlCYXJDaGFydChjb250YWluZXI6IEhUTUxFbGVtZW50LCBzZXJpZXM6IERhaWx5U3RhdHNQb2ludFtdKSB7XG5cdFx0aWYgKCFzZXJpZXMubGVuZ3RoKSB7XG5cdFx0XHRjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU2NTcwXHU2MzZFXCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNjcm9sbCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtc2Nyb2xsXCIgfSk7XG5cdFx0Y29uc3QgY2hhcnQgPSBzY3JvbGwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0IHNrLWNoYXJ0LWJhcnNcIiB9KTtcblx0XHRjb25zdCB0b29sdGlwID0gY2hhcnQuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LXRvb2x0aXBcIiB9KTtcblx0XHRjb25zdCBtYXhWYWx1ZSA9IE1hdGgubWF4KFxuXHRcdFx0MSxcblx0XHRcdC4uLnNlcmllcy5tYXAoKHBvaW50KSA9PiBNYXRoLm1heChwb2ludC5jcmVhdGVkLCBwb2ludC5jb21wbGV0ZWQpKSxcblx0XHQpO1xuXG5cdFx0Y29uc3QgY29sdW1uV2lkdGggPSAzNjtcblx0XHRjaGFydC5zdHlsZS5taW5XaWR0aCA9IGAke3Nlcmllcy5sZW5ndGggKiBjb2x1bW5XaWR0aH1weGA7XG5cblx0XHRjb25zdCBoaWRlVG9vbHRpcCA9ICgpID0+IHRvb2x0aXAucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50KSA9PiB7XG5cdFx0XHRjb25zdCBjb2x1bW4gPSBjaGFydC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtY29sXCIgfSk7XG5cdFx0XHRjb25zdCBiYXJzID0gY29sdW1uLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1jb2wtYmFyc1wiIH0pO1xuXHRcdFx0Y29uc3QgY3JlYXRlZEJhciA9IGJhcnMuY3JlYXRlRGl2KHtcblx0XHRcdFx0Y2xzOiBcInNrLWNoYXJ0LWJhciBzay1jaGFydC1iYXItY3JlYXRlZFwiLFxuXHRcdFx0XHRhdHRyOiB7IHN0eWxlOiBgaGVpZ2h0OiR7KHBvaW50LmNyZWF0ZWQgLyBtYXhWYWx1ZSkgKiAxMDB9JWAgfSxcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgY29tcGxldGVkQmFyID0gYmFycy5jcmVhdGVEaXYoe1xuXHRcdFx0XHRjbHM6IFwic2stY2hhcnQtYmFyIHNrLWNoYXJ0LWJhci1jb21wbGV0ZWRcIixcblx0XHRcdFx0YXR0cjogeyBzdHlsZTogYGhlaWdodDokeyhwb2ludC5jb21wbGV0ZWQgLyBtYXhWYWx1ZSkgKiAxMDB9JWAgfSxcblx0XHRcdH0pO1xuXHRcdFx0Y29sdW1uLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1sYWJlbFwiLCB0ZXh0OiBwb2ludC5kYXRlLnNsaWNlKDUpIH0pO1xuXG5cdFx0XHRjb25zdCBzaG93VG9vbHRpcCA9IChldnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZ0LmN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRcdHRvb2x0aXAuc2V0VGV4dChgJHtwb2ludC5kYXRlfSBcdTY1QjBcdTVFRkEgJHtwb2ludC5jcmVhdGVkfSBcdTAwQjcgXHU1QjhDXHU2MjEwICR7cG9pbnQuY29tcGxldGVkfWApO1xuXHRcdFx0XHR0b29sdGlwLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcblx0XHRcdFx0Y29uc3QgYm91bmRzID0gY2hhcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdGNvbnN0IHggPSBldnQuY2xpZW50WCAtIGJvdW5kcy5sZWZ0O1xuXHRcdFx0XHRjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSBib3VuZHMudG9wIC0gMjA7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUubGVmdCA9IGAke3h9cHhgO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLnRvcCA9IGAke3l9cHhgO1xuXHRcdFx0fTtcblx0XHRcdFtjcmVhdGVkQmFyLCBjb21wbGV0ZWRCYXIsIGNvbHVtbl0uZm9yRWFjaCgoZWwpID0+IHtcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNob3dUb29sdGlwKTtcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGlkZVRvb2x0aXApO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBsZWdlbmQgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxlZ2VuZFwiIH0pO1xuXHRcdHRoaXMucmVuZGVyTGVnZW5kSXRlbShsZWdlbmQsIFwiXHU2NUIwXHU1RUZBXCIsIFwidmFyKC0tY29sb3ItY3lhbiwgIzRlY2RjNClcIik7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTVCOENcdTYyMTBcIiwgXCJ2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpXCIpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJMZWdlbmRJdGVtKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGxhYmVsOiBzdHJpbmcsIGNvbG9yOiBzdHJpbmcpIHtcblx0XHRjb25zdCBpdGVtID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1sZWdlbmQtaXRlbVwiIH0pO1xuXHRcdGNvbnN0IGRvdCA9IGl0ZW0uY3JlYXRlRGl2KHsgY2xzOiBcInNrLWxlZ2VuZC1kb3RcIiB9KTtcblx0XHQoZG90IGFzIEhUTUxEaXZFbGVtZW50KS5zdHlsZS5iYWNrZ3JvdW5kID0gY29sb3I7XG5cdFx0aXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogbGFiZWwgfSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRhaWx5UmF0ZUNoYXJ0KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHNlcmllczogRGFpbHlSYXRlUG9pbnRbXSkge1xuXHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIFJlbmRlcmluZyBkYWlseSByYXRlIGNoYXJ0IHdpdGhcIiwgc2VyaWVzLmxlbmd0aCwgXCJwb2ludHNcIik7XG5cdFx0aWYgKCFzZXJpZXMubGVuZ3RoKSB7XG5cdFx0XHRjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU1QjhDXHU2MjEwXHU3Mzg3XHU2NTcwXHU2MzZFXCIgfSk7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1N0YXRzXSBEYWlseSByYXRlIGNoYXJ0IGhhcyBubyBkYXRhLlwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gRGFpbHkgcmF0ZSBzYW1wbGVzXCIsIHNlcmllcyk7XG5cblx0XHRjb25zdCBzY3JvbGwgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LXNjcm9sbFwiIH0pO1xuXHRcdGNvbnN0IGNoYXJ0V3JhcHBlciA9IHNjcm9sbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQgc2stY2hhcnQtbGluZVwiIH0pO1xuXHRcdGNvbnN0IG1pbkNvbHVtbnMgPSBNYXRoLm1heChzZXJpZXMubGVuZ3RoLCA3KTtcblx0XHRjb25zdCBzdmdXaWR0aCA9IG1pbkNvbHVtbnMgKiAzNjtcblx0XHRjb25zdCBlZmZlY3RpdmVDb3VudCA9IE1hdGgubWF4KHNlcmllcy5sZW5ndGgsIDIpO1xuXHRcdGNvbnN0IGNvbHVtbldpZHRoID0gMzY7XG5cdFx0Y29uc3Qgd2lkdGggPSAoZWZmZWN0aXZlQ291bnQgLSAxKSAqIGNvbHVtbldpZHRoO1xuXHRcdGNvbnN0IG1pbldpZHRoID0gTWF0aC5tYXgoc2VyaWVzLmxlbmd0aCAqIGNvbHVtbldpZHRoLCB3aWR0aCArIDI0KTtcblx0XHRjaGFydFdyYXBwZXIuc3R5bGUubWluV2lkdGggPSBgJHttaW5XaWR0aH1weGA7XG5cdFx0Y29uc3QgaGVpZ2h0ID0gMTYwO1xuXHRcdGNvbnN0IGxlZnRQYWQgPSAxMjtcblx0XHRjb25zdCByaWdodFBhZCA9IDEyO1xuXHRcdGNvbnN0IHRvdGFsV2lkdGggPSB3aWR0aCArIGxlZnRQYWQgKyByaWdodFBhZDtcblx0XHRjb25zdCBzdmcgPSBjcmVhdGVTdmdFbGVtZW50KFwic3ZnXCIpIGFzIFNWR1NWR0VsZW1lbnQ7XG5cdFx0c2V0U3ZnQXR0cnMoc3ZnLCB7XG5cdFx0XHR2aWV3Qm94OiBgMCAwICR7dG90YWxXaWR0aH0gJHtoZWlnaHR9YCxcblx0XHRcdHByZXNlcnZlQXNwZWN0UmF0aW86IFwibm9uZVwiLFxuXHRcdFx0d2lkdGg6IFN0cmluZyh0b3RhbFdpZHRoKSxcblx0XHRcdGhlaWdodDogU3RyaW5nKGhlaWdodCksXG5cdFx0fSk7XG5cdFx0Y2hhcnRXcmFwcGVyLmFwcGVuZENoaWxkKHN2Zyk7XG5cblx0XHRjb25zdCBiYXNlbGluZSA9IGNyZWF0ZVN2Z0VsZW1lbnQoXCJsaW5lXCIpO1xuXHRcdHNldFN2Z0F0dHJzKGJhc2VsaW5lLCB7XG5cdFx0XHR4MTogU3RyaW5nKGxlZnRQYWQpLFxuXHRcdFx0eTE6IFN0cmluZyhoZWlnaHQgLSAxKSxcblx0XHRcdHgyOiBTdHJpbmcodG90YWxXaWR0aCAtIHJpZ2h0UGFkKSxcblx0XHRcdHkyOiBTdHJpbmcoaGVpZ2h0IC0gMSksXG5cdFx0XHRzdHJva2U6IFwidmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpXCIsXG5cdFx0XHRcInN0cm9rZS13aWR0aFwiOiBcIjFcIixcblx0XHR9KTtcblx0XHRzdmcuYXBwZW5kQ2hpbGQoYmFzZWxpbmUpO1xuXG5cdFx0Y29uc3QgcG9pbnRzRGF0YSA9IHNlcmllcy5tYXAoKHBvaW50LCBpbmRleCkgPT4ge1xuXHRcdFx0Y29uc3QgeCA9XG5cdFx0XHRcdHNlcmllcy5sZW5ndGggPT09IDFcblx0XHRcdFx0XHQ/IGxlZnRQYWQgKyB3aWR0aCAvIDJcblx0XHRcdFx0XHQ6IGxlZnRQYWQgKyAoaW5kZXggLyAoc2VyaWVzLmxlbmd0aCAtIDEgfHwgMSkpICogd2lkdGg7XG5cdFx0XHRjb25zdCBjbGFtcGVkUmF0ZSA9IE1hdGgubWluKE1hdGgubWF4KHBvaW50LnJhdGUsIDApLCAxMDApO1xuXHRcdFx0Y29uc3QgeSA9IGhlaWdodCAtIChjbGFtcGVkUmF0ZSAvIDEwMCkgKiAoaGVpZ2h0IC0gMjApIC0gMTA7XG5cdFx0XHRyZXR1cm4geyB4LCB5LCByYXRlOiBjbGFtcGVkUmF0ZSB9O1xuXHRcdH0pO1xuXHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIERhaWx5IHJhdGUgY29vcmRpbmF0ZXNcIiwgcG9pbnRzRGF0YSk7XG5cdFx0Y29uc3QgcG9pbnRzID0gcG9pbnRzRGF0YS5tYXAoKHApID0+IGAke3AueH0sJHtwLnl9YCkuam9pbihcIiBcIik7XG5cdFx0Y29uc3QgcG9seWxpbmUgPSBjcmVhdGVTdmdFbGVtZW50KFwicG9seWxpbmVcIik7XG5cdFx0c2V0U3ZnQXR0cnMocG9seWxpbmUsIHtcblx0XHRcdHBvaW50cyxcblx0XHRcdGZpbGw6IFwibm9uZVwiLFxuXHRcdFx0c3Ryb2tlOiBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIixcblx0XHRcdFwic3Ryb2tlLXdpZHRoXCI6IFwiM1wiLFxuXHRcdFx0XCJzdHJva2UtbGluZWNhcFwiOiBcInJvdW5kXCIsXG5cdFx0XHRcInN0cm9rZS1saW5lam9pblwiOiBcInJvdW5kXCIsXG5cdFx0fSk7XG5cdFx0c3ZnLmFwcGVuZENoaWxkKHBvbHlsaW5lKTtcblx0XHRjb25zdCB0b29sdGlwID0gY2hhcnRXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC10b29sdGlwXCIgfSk7XG5cdFx0Y29uc3QgaGlkZVRvb2x0aXAgPSAoKSA9PiB0b29sdGlwLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcblxuXHRcdHNlcmllcy5mb3JFYWNoKChwb2ludCwgaW5kZXgpID0+IHtcblx0XHRcdGNvbnN0IGRvdFggPVxuXHRcdFx0XHRzZXJpZXMubGVuZ3RoID09PSAxXG5cdFx0XHRcdFx0PyBsZWZ0UGFkICsgd2lkdGggLyAyXG5cdFx0XHRcdFx0OiBsZWZ0UGFkICsgKGluZGV4IC8gKHNlcmllcy5sZW5ndGggLSAxIHx8IDEpKSAqIHdpZHRoO1xuXHRcdFx0Y29uc3QgY2xhbXBlZFJhdGUgPSBNYXRoLm1pbihNYXRoLm1heChwb2ludC5yYXRlLCAwKSwgMTAwKTtcblx0XHRcdGNvbnN0IGRvdFkgPSBoZWlnaHQgLSAoY2xhbXBlZFJhdGUgLyAxMDApICogKGhlaWdodCAtIDIwKSAtIDEwO1xuXHRcdFx0Y29uc3QgY2lyY2xlID0gY3JlYXRlU3ZnRWxlbWVudChcImNpcmNsZVwiKTtcblx0XHRcdHNldFN2Z0F0dHJzKGNpcmNsZSwge1xuXHRcdFx0XHRjeDogU3RyaW5nKGRvdFgpLFxuXHRcdFx0XHRjeTogU3RyaW5nKGRvdFkpLFxuXHRcdFx0XHRyOiBcIjNcIixcblx0XHRcdFx0ZmlsbDogXCJ2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpXCIsXG5cdFx0XHR9KTtcblx0XHRcdHN2Zy5hcHBlbmRDaGlsZChjaXJjbGUpO1xuXHRcdFx0Y29uc3Qgc2hvd1Rvb2x0aXAgPSAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGJvdW5kcyA9IGNoYXJ0V3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0Y29uc3QgeCA9IGV2dC5jbGllbnRYIC0gYm91bmRzLmxlZnQ7XG5cdFx0XHRcdGNvbnN0IHkgPSBldnQuY2xpZW50WSAtIGJvdW5kcy50b3AgLSAyMDtcblx0XHRcdFx0dG9vbHRpcC5zZXRUZXh0KGAke3BvaW50LmRhdGV9IFx1NUI4Q1x1NjIxMFx1NzM4NyAke3BvaW50LnJhdGUudG9GaXhlZCgxKX0lYCk7XG5cdFx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHt4fXB4YDtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS50b3AgPSBgJHt5fXB4YDtcblx0XHRcdH07XG5cdFx0XHRjaXJjbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0Y2lyY2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0Y2lyY2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGVUb29sdGlwKTtcblx0XHR9KTtcblxuXHRcdC8vIEFkZCB3aWRlciBob3ZlciBoaXRib3hlcyB0byBtYWtlIHRvb2x0aXAgZWFzaWVyIHRvIHRyaWdnZXIuXG5cdFx0cG9pbnRzRGF0YS5mb3JFYWNoKChwb2ludCwgaW5kZXgpID0+IHtcblx0XHRcdGNvbnN0IHByZXYgPSBwb2ludHNEYXRhW2luZGV4IC0gMV07XG5cdFx0XHRjb25zdCBuZXh0ID0gcG9pbnRzRGF0YVtpbmRleCArIDFdO1xuXHRcdFx0Y29uc3QgbGVmdEJvdW5kID0gcHJldiA/IChwcmV2LnggKyBwb2ludC54KSAvIDIgOiBsZWZ0UGFkO1xuXHRcdFx0Y29uc3QgcmlnaHRCb3VuZCA9IG5leHQgPyAocG9pbnQueCArIG5leHQueCkgLyAyIDogdG90YWxXaWR0aCAtIHJpZ2h0UGFkO1xuXHRcdFx0Y29uc3QgaGl0Ym94ID0gY3JlYXRlU3ZnRWxlbWVudChcInJlY3RcIik7XG5cdFx0XHRzZXRTdmdBdHRycyhoaXRib3gsIHtcblx0XHRcdFx0eDogU3RyaW5nKGxlZnRCb3VuZCksXG5cdFx0XHRcdHk6IFwiMFwiLFxuXHRcdFx0XHR3aWR0aDogU3RyaW5nKE1hdGgubWF4KDQsIHJpZ2h0Qm91bmQgLSBsZWZ0Qm91bmQpKSxcblx0XHRcdFx0aGVpZ2h0OiBTdHJpbmcoaGVpZ2h0KSxcblx0XHRcdFx0ZmlsbDogXCJ0cmFuc3BhcmVudFwiLFxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBzaG93VG9vbHRpcCA9IChldnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3QgYm91bmRzID0gY2hhcnRXcmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRjb25zdCB4ID0gZXZ0LmNsaWVudFggLSBib3VuZHMubGVmdDtcblx0XHRcdFx0Y29uc3QgeSA9IGV2dC5jbGllbnRZIC0gYm91bmRzLnRvcCAtIDIwO1xuXHRcdFx0XHR0b29sdGlwLnNldFRleHQoYCR7c2VyaWVzW2luZGV4XS5kYXRlfSBcdTVCOENcdTYyMTBcdTczODcgJHtzZXJpZXNbaW5kZXhdLnJhdGUudG9GaXhlZCgxKX0lYCk7XG5cdFx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHt4fXB4YDtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS50b3AgPSBgJHt5fXB4YDtcblx0XHRcdH07XG5cdFx0XHRoaXRib3guYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0aGl0Ym94LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0aGl0Ym94LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGVUb29sdGlwKTtcblx0XHRcdHN2Zy5hcHBlbmRDaGlsZChoaXRib3gpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGFiZWxzID0gY2hhcnRXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1sYWJlbC1yb3dcIiB9KSBhcyBIVE1MRGl2RWxlbWVudDtcblx0XHRsYWJlbHMuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGByZXBlYXQoJHtNYXRoLm1heChzZXJpZXMubGVuZ3RoLCAxKX0sIG1pbm1heCgwLCAxZnIpKWA7XG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50KSA9PiB7XG5cdFx0XHRsYWJlbHMuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsXCIsIHRleHQ6IHBvaW50LmRhdGUuc2xpY2UoNSkgfSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRlYWRsaW5lQnJlYWtkb3duKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHN0YXRzOiBTdGF0c1NuYXBzaG90KSB7XG5cdFx0aWYgKCFzdGF0cy5kZWFkbGluZUNvdW50KSB7XG5cdFx0XHRjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU4QkJFXHU3RjZFXHU2MjJBXHU2QjYyXHU2NUY2XHU5NUY0XHU3Njg0XHU0RUZCXHU1MkExXCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGluZm8gPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWRlYWRsaW5lLWluZm9cIiB9KTtcblx0XHRpbmZvLmNyZWF0ZURpdih7IHRleHQ6IGBcdTY3MDlcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcdUZGMUEke3N0YXRzLmRlYWRsaW5lQ291bnR9YCwgY2xzOiBcInNrLWRlYWRsaW5lLWxpbmVcIiB9KTtcblx0XHRpbmZvLmNyZWF0ZURpdih7XG5cdFx0XHR0ZXh0OiBgXHU2MjJBXHU2QjYyXHU4OTg2XHU3NkQ2XHU3Mzg3XHVGRjFBJHtmb3JtYXRQZXJjZW50KHN0YXRzLmRlYWRsaW5lQ292ZXJhZ2UpfWAsXG5cdFx0XHRjbHM6IFwic2stZGVhZGxpbmUtbGluZVwiLFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgcHJvZ3Jlc3MgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXByb2dyZXNzXCIgfSk7XG5cdFx0cHJvZ3Jlc3MuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogXCJzay1wcm9ncmVzcy1vbi10aW1lXCIsXG5cdFx0XHRhdHRyOiB7IHN0eWxlOiBgd2lkdGg6JHtmb3JtYXRQZXJjZW50VmFsdWUoc3RhdHMub25UaW1lUmF0ZSl9JWAgfSxcblx0XHR9KTtcblx0XHRwcm9ncmVzcy5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBcInNrLXByb2dyZXNzLW92ZXJkdWVcIixcblx0XHRcdGF0dHI6IHsgc3R5bGU6IGB3aWR0aDoke2Zvcm1hdFBlcmNlbnRWYWx1ZShzdGF0cy5vdmVyZHVlUmF0ZSl9JWAgfSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IGxlZ2VuZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stcHJvZ3Jlc3MtbGVnZW5kXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTBcIiwgXCJ2YXIoLS1jb2xvci1ncmVlbiwgIzRjYWY1MClcIik7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTVERjIvXHU1QzA2XHU5MDNFXHU2NzFGXCIsIFwidmFyKC0tY29sb3ItcmVkLCAjZmY2YjZiKVwiKTtcblx0fVxuXG5cdHByaXZhdGUgYnVpbGRTdGF0c1NuYXBzaG90KHJhbmdlOiBTdGF0c1JhbmdlKTogU3RhdHNTbmFwc2hvdCB7XG5cdFx0Y29uc3QgYm9hcmQgPSB0aGlzLnBsdWdpbi5nZXRCb2FyZCgpO1xuXHRcdGNvbnN0IGNhcmRzID0gYm9hcmQuY29sdW1ucy5mbGF0TWFwKChjb2wpID0+IGNvbC5jYXJkcyk7XG5cdFx0Y29uc3QgdG90YWxUYXNrcyA9IGNhcmRzLmxlbmd0aDtcblx0XHRjb25zdCBjb21wbGV0ZWRDYXJkcyA9IGNhcmRzLmZpbHRlcigoY2FyZCkgPT4gY2FyZC5jb21wbGV0ZWQpO1xuXHRcdGNvbnN0IGNvbXBsZXRlZFRhc2tzID0gY29tcGxldGVkQ2FyZHMubGVuZ3RoO1xuXHRcdGNvbnN0IHdpcENvdW50ID0gdG90YWxUYXNrcyAtIGNvbXBsZXRlZFRhc2tzO1xuXHRcdGNvbnN0IGNvbXBsZXRpb25SYXRlID0gdG90YWxUYXNrcyA/IGNvbXBsZXRlZFRhc2tzIC8gdG90YWxUYXNrcyA6IDA7XG5cdFx0Y29uc3QgZGVhZGxpbmVDYXJkcyA9IGNhcmRzLmZpbHRlcigoY2FyZCkgPT4gISFjYXJkLmRlYWRsaW5lKTtcblx0XHRjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXHRcdGNvbnN0IG92ZXJkdWVDb3VudCA9IGRlYWRsaW5lQ2FyZHMuZmlsdGVyKChjYXJkKSA9PiB7XG5cdFx0XHRpZiAoIWNhcmQuZGVhZGxpbmUpIHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChjYXJkLmNvbXBsZXRlZCkge1xuXHRcdFx0XHRjb25zdCBkb25lQXQgPSBjYXJkLmNvbXBsZXRlZEF0ID8/IGNhcmQudXBkYXRlZEF0O1xuXHRcdFx0XHRyZXR1cm4gISFkb25lQXQgJiYgZG9uZUF0ID4gY2FyZC5kZWFkbGluZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBub3cgPiBjYXJkLmRlYWRsaW5lO1xuXHRcdH0pLmxlbmd0aDtcblx0XHRjb25zdCBvblRpbWVDb3VudCA9IGRlYWRsaW5lQ2FyZHMuZmlsdGVyKChjYXJkKSA9PiB7XG5cdFx0XHRpZiAoIWNhcmQuZGVhZGxpbmUgfHwgIWNhcmQuY29tcGxldGVkKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjb25zdCBkb25lQXQgPSBjYXJkLmNvbXBsZXRlZEF0ID8/IGNhcmQudXBkYXRlZEF0O1xuXHRcdFx0cmV0dXJuICEhZG9uZUF0ICYmIGRvbmVBdCA8PSBjYXJkLmRlYWRsaW5lO1xuXHRcdH0pLmxlbmd0aDtcblx0XHRjb25zdCBhdmdDeWNsZVRpbWVNcyA9ICgoKSA9PiB7XG5cdFx0XHRjb25zdCBmaW5pc2hlZCA9IGNvbXBsZXRlZENhcmRzLmZpbHRlcigoY2FyZCkgPT4gY2FyZC5jb21wbGV0ZWRBdCk7XG5cdFx0XHRpZiAoIWZpbmlzaGVkLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cdFx0XHRjb25zdCB0b3RhbCA9IGZpbmlzaGVkLnJlZHVjZShcblx0XHRcdFx0KHN1bSwgY2FyZCkgPT4gc3VtICsgTWF0aC5tYXgoMCwgKGNhcmQuY29tcGxldGVkQXQhIC0gY2FyZC5jcmVhdGVkQXQpKSxcblx0XHRcdFx0MCxcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gdG90YWwgLyBmaW5pc2hlZC5sZW5ndGg7XG5cdFx0fSkoKTtcblxuXHRcdGNvbnN0IGRhaWx5Q3JlYXRlZCA9IHRoaXMuYnVpbGREYWlseVNlcmllcyhjYXJkcywgXCJjcmVhdGVkXCIsIHJhbmdlKTtcblx0XHRjb25zdCBkYWlseUNvbXBsZXRlZCA9IHRoaXMuYnVpbGREYWlseVNlcmllcyhjYXJkcywgXCJjb21wbGV0ZWRcIiwgcmFuZ2UpO1xuXHRcdGNvbnN0IGRhaWx5U2VyaWVzOiBEYWlseVN0YXRzUG9pbnRbXSA9IGRhaWx5Q3JlYXRlZC5tYXAoKHBvaW50LCBpbmRleCkgPT4gKHtcblx0XHRcdGRhdGU6IHBvaW50LmRhdGUsXG5cdFx0XHRjcmVhdGVkOiBwb2ludC52YWx1ZSxcblx0XHRcdGNvbXBsZXRlZDogZGFpbHlDb21wbGV0ZWRbaW5kZXhdPy52YWx1ZSA/PyAwLFxuXHRcdH0pKTtcblx0XHRjb25zdCBkYWlseVJhdGVzOiBEYWlseVJhdGVQb2ludFtdID0gZGFpbHlTZXJpZXMubWFwKChwb2ludCkgPT4gKHtcblx0XHRcdGRhdGU6IHBvaW50LmRhdGUsXG5cdFx0XHRyYXRlOlxuXHRcdFx0XHRwb2ludC5jcmVhdGVkIHx8IHBvaW50LmNvbXBsZXRlZFxuXHRcdFx0XHRcdD8gTWF0aC5taW4oMTAwLCAocG9pbnQuY29tcGxldGVkIC8gTWF0aC5tYXgocG9pbnQuY3JlYXRlZCwgcG9pbnQuY29tcGxldGVkLCAxKSkgKiAxMDApXG5cdFx0XHRcdFx0OiAwLFxuXHRcdH0pKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3RhbFRhc2tzLFxuXHRcdFx0Y29tcGxldGVkVGFza3MsXG5cdFx0XHR3aXBDb3VudCxcblx0XHRcdGNvbXBsZXRpb25SYXRlLFxuXHRcdFx0ZGVhZGxpbmVDb3VudDogZGVhZGxpbmVDYXJkcy5sZW5ndGgsXG5cdFx0XHRkZWFkbGluZUNvdmVyYWdlOiB0b3RhbFRhc2tzID8gZGVhZGxpbmVDYXJkcy5sZW5ndGggLyB0b3RhbFRhc2tzIDogMCxcblx0XHRcdG92ZXJkdWVDb3VudCxcblx0XHRcdG92ZXJkdWVSYXRlOiBkZWFkbGluZUNhcmRzLmxlbmd0aCA/IG92ZXJkdWVDb3VudCAvIGRlYWRsaW5lQ2FyZHMubGVuZ3RoIDogMCxcblx0XHRcdG9uVGltZVJhdGU6IGRlYWRsaW5lQ2FyZHMubGVuZ3RoID8gb25UaW1lQ291bnQgLyBkZWFkbGluZUNhcmRzLmxlbmd0aCA6IDAsXG5cdFx0XHRhdmdDeWNsZVRpbWVNcyxcblx0XHRcdGRhaWx5U2VyaWVzLFxuXHRcdFx0ZGFpbHlSYXRlcyxcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZERhaWx5U2VyaWVzKGNhcmRzOiBLYW5iYW5DYXJkW10sIGtpbmQ6IFwiY3JlYXRlZFwiIHwgXCJjb21wbGV0ZWRcIiwgcmFuZ2U6IFN0YXRzUmFuZ2UpIHtcblx0XHRjb25zdCBtc1BlckRheSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cdFx0Y29uc3QgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJlc29sdmVSYW5nZShyYW5nZSk7XG5cdFx0Y29uc3QgZGF5cyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoKGVuZCAtIHN0YXJ0KSAvIG1zUGVyRGF5KSArIDEpO1xuXHRcdGNvbnN0IGJ1Y2tldHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuXHRcdGxldCBwcm9jZXNzZWQgPSAwO1xuXHRcdGxldCBvdXRPZlJhbmdlID0gMDtcblx0XHRsZXQgbWlzc2luZyA9IDA7XG5cblx0XHRmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcblx0XHRcdGNvbnN0IHRpbWVzdGFtcCA9XG5cdFx0XHRcdGtpbmQgPT09IFwiY3JlYXRlZFwiXG5cdFx0XHRcdFx0PyBjYXJkLmNyZWF0ZWRBdFxuXHRcdFx0XHRcdDogY2FyZC5jb21wbGV0ZWRBdCA/PyAoY2FyZC5jb21wbGV0ZWQgPyBjYXJkLnVwZGF0ZWRBdCA6IG51bGwpO1xuXHRcdFx0aWYgKCF0aW1lc3RhbXApIHtcblx0XHRcdFx0bWlzc2luZysrO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmICh0aW1lc3RhbXAgPCBzdGFydCB8fCB0aW1lc3RhbXAgPiBlbmQpIHtcblx0XHRcdFx0b3V0T2ZSYW5nZSsrO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGtleSA9IHRoaXMudG9EYXlLZXkodGltZXN0YW1wKTtcblx0XHRcdGJ1Y2tldHMuc2V0KGtleSwgKGJ1Y2tldHMuZ2V0KGtleSkgPz8gMCkgKyAxKTtcblx0XHRcdHByb2Nlc3NlZCsrO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNlcmllczogRGFpbHlDb3VudFBvaW50W10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGRheXM7IGkrKykge1xuXHRcdFx0Y29uc3QgZGF5VHMgPSBzdGFydCArIGkgKiBtc1BlckRheTtcblx0XHRcdGNvbnN0IGtleSA9IHRoaXMudG9EYXlLZXkoZGF5VHMpO1xuXHRcdFx0c2VyaWVzLnB1c2goeyBkYXRlOiBrZXksIHZhbHVlOiBidWNrZXRzLmdldChrZXkpID8/IDAgfSk7XG5cdFx0fVxuXHRcdGNvbnN0IGxhYmVsID0ga2luZCA9PT0gXCJjcmVhdGVkXCIgPyBcIkNyZWF0ZWRcIiA6IFwiQ29tcGxldGVkXCI7XG5cdFx0Y29uc29sZS5sb2coYFtTaW1wbGVLYW5iYW5dW1N0YXRzXSAke2xhYmVsfSBzZXJpZXMgc3RhdHNgLCB7XG5cdFx0XHRyYW5nZVN0YXJ0OiBuZXcgRGF0ZShzdGFydCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCksXG5cdFx0XHRyYW5nZUVuZDogbmV3IERhdGUoZW5kKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKSxcblx0XHRcdHBvaW50czogc2VyaWVzLmxlbmd0aCxcblx0XHRcdHByb2Nlc3NlZCxcblx0XHRcdG91dE9mUmFuZ2UsXG5cdFx0XHRtaXNzaW5nLFxuXHRcdH0pO1xuXHRcdHJldHVybiBzZXJpZXM7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVSYW5nZShyYW5nZTogU3RhdHNSYW5nZSk6IHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfSB7XG5cdFx0aWYgKHJhbmdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHN0YXJ0OiB0aGlzLnN0YXJ0T2ZEYXkocmFuZ2Uuc3RhcnQpLFxuXHRcdFx0XHRlbmQ6IHRoaXMuc3RhcnRPZkRheShyYW5nZS5lbmQpLFxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3QgbXNQZXJEYXkgPSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdGNvbnN0IGVuZCA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRjb25zdCBzdGFydCA9IGVuZCAtIChyYW5nZS5kYXlzIC0gMSkgKiBtc1BlckRheTtcblx0XHRyZXR1cm4geyBzdGFydCwgZW5kIH07XG5cdH1cblxuXHRwcml2YXRlIHRvRGF5S2V5KHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0XHRjb25zdCB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXHRcdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRcdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0XHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9YDtcblx0fVxuXG5cdHByaXZhdGUgc3RhcnRPZkRheSh0aW1lc3RhbXA6IG51bWJlcik6IG51bWJlciB7XG5cdFx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdFx0ZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcblx0XHRyZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVUaW1lbGluZVJhbmdlKCk6IHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfSB7XG5cdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgPT09IFwiY3VzdG9tXCIgJiYgdGhpcy50aW1lbGluZUN1c3RvbSkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGltZWxpbmVDdXN0b207XG5cdFx0fVxuXHRcdGlmICh0aGlzLnRpbWVsaW5lUHJlc2V0ID09PSBcInllc3RlcmRheVwiKSB7XG5cdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdGNvbnN0IHllc3RlcmRheSA9IHRvZGF5IC0gMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRcdHJldHVybiB7IHN0YXJ0OiB5ZXN0ZXJkYXksIGVuZDogeWVzdGVyZGF5IH07XG5cdFx0fVxuXHRcdGNvbnN0IHRvZGF5ID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdHJldHVybiB7IHN0YXJ0OiB0b2RheSwgZW5kOiB0b2RheSB9O1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZFRpbWVsaW5lRW50cmllcyhzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IFRpbWVsaW5lRW50cnlbXSB7XG5cdFx0Y29uc3QgYm9hcmQgPSB0aGlzLnBsdWdpbi5nZXRCb2FyZCgpO1xuXHRcdGNvbnN0IGVudHJpZXM6IFRpbWVsaW5lRW50cnlbXSA9IFtdO1xuXHRcdGNvbnN0IHN0YXJ0VHMgPSB0aGlzLnN0YXJ0T2ZEYXkoc3RhcnQpO1xuXHRcdGNvbnN0IGVuZFRzID0gdGhpcy5zdGFydE9mRGF5KGVuZCkgKyAyNCAqIDYwICogNjAgKiAxMDAwIC0gMTtcblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiBib2FyZC5jb2x1bW5zKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNhcmQgb2YgY29sdW1uLmNhcmRzKSB7XG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpKSBjb250aW51ZTtcblx0XHRcdFx0Zm9yIChjb25zdCBpdGVtIG9mIGNhcmQuaGlzdG9yeSkge1xuXHRcdFx0XHRcdGlmICghaXRlbS50aW1lc3RhbXApIGNvbnRpbnVlO1xuXHRcdFx0XHRcdGlmIChpdGVtLnRpbWVzdGFtcCA8IHN0YXJ0VHMgfHwgaXRlbS50aW1lc3RhbXAgPiBlbmRUcykgY29udGludWU7XG5cdFx0XHRcdFx0ZW50cmllcy5wdXNoKHtcblx0XHRcdFx0XHRcdGNhcmRJZDogY2FyZC5pZCxcblx0XHRcdFx0XHRcdGNhcmRUaXRsZTogY2FyZC50aXRsZSxcblx0XHRcdFx0XHRcdGNvbHVtbk5hbWU6IGNvbHVtbi5uYW1lLFxuXHRcdFx0XHRcdFx0dGltZXN0YW1wOiBpdGVtLnRpbWVzdGFtcCxcblx0XHRcdFx0XHRcdHRleHQ6IGl0ZW0ucmVtYXJrIHx8IFwiXHU2NkY0XHU2NUIwXCIsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS50aW1lc3RhbXAgLSBiLnRpbWVzdGFtcCk7XG5cdH1cbn1cblxuY2xhc3MgQ2FyZE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwcml2YXRlIHRpdGxlVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIHRhZ3NWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgcmVtYXJrVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIGhpc3RvcnlOb3RlID0gXCJcIjtcblx0cHJpdmF0ZSBkZWFkbGluZVZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSBzdWJtaXR0aW5nID0gZmFsc2U7XG5cdHByaXZhdGUga2V5SGFuZGxlciA9IChldnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRpZiAoXG5cdFx0XHRldnQua2V5ID09PSBcIkVudGVyXCIgJiZcblx0XHRcdCFldnQuc2hpZnRLZXkgJiZcblx0XHRcdCFldnQubWV0YUtleSAmJlxuXHRcdFx0IWV2dC5jdHJsS2V5ICYmXG5cdFx0XHQhZXZ0LmFsdEtleSAmJlxuXHRcdFx0IWV2dC5pc0NvbXBvc2luZ1xuXHRcdCkge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR2b2lkIHRoaXMuaGFuZGxlU3VibWl0KCk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGFwcDogQXBwLFxuXHRcdHByaXZhdGUgcGx1Z2luOiBTaW1wbGVLYW5iYW5QbHVnaW4sXG5cdFx0cHJpdmF0ZSBjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHByaXZhdGUgY2FyZD86IEthbmJhbkNhcmQsXG5cdCkge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy5wbHVnaW4uc2V0QWN0aXZlQ29sdW1uKGNvbHVtbklkKTtcblx0XHRpZiAoY2FyZCkge1xuXHRcdFx0dGhpcy50aXRsZVZhbHVlID0gY2FyZC50aXRsZTtcblx0XHRcdHRoaXMudGFnc1ZhbHVlID0gY2FyZC50YWdzLmpvaW4oXCIsIFwiKTtcblx0XHRcdHRoaXMucmVtYXJrVmFsdWUgPSBjYXJkLnJlbWFyaztcblx0XHRcdHRoaXMuZGVhZGxpbmVWYWx1ZSA9IGZvcm1hdERhdGVUaW1lSW5wdXQoY2FyZC5kZWFkbGluZSk7XG5cdFx0fVxuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleUhhbmRsZXIpO1xuXG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLmNhcmQgPyBcIlx1N0YxNlx1OEY5MVx1NTM2MVx1NzI0N1wiIDogXCJcdTY1QjBcdTU4OUVcdTUzNjFcdTcyNDdcIiB9KTtcblxuXHRcdHRoaXMudGl0bGVWYWx1ZSA9IHRoaXMudGl0bGVWYWx1ZSB8fCBcIlwiO1xuXHRcdGNyZWF0ZVRleHRGaWVsZChjb250ZW50RWwsIFwiXHU2ODA3XHU5ODk4XCIsIHRoaXMudGl0bGVWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLnRpdGxlVmFsdWUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdGNyZWF0ZVRleHRGaWVsZChjb250ZW50RWwsIFwiXHU2ODA3XHU3QjdFXHVGRjA4XHU5MDE3XHU1M0Y3XHU1MjA2XHU5Njk0XHVGRjA5XCIsIHRoaXMudGFnc1ZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMudGFnc1ZhbHVlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRcdGNyZWF0ZVRleHRBcmVhKGNvbnRlbnRFbCwgXCJcdTU5MDdcdTZDRThcIiwgdGhpcy5yZW1hcmtWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdHRoaXMucmVtYXJrVmFsdWUgPSB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRjcmVhdGVEYXRlVGltZUZpZWxkKGNvbnRlbnRFbCwgXCJcdTYyMkFcdTZCNjJcdTY1RjZcdTk1RjRcIiwgdGhpcy5kZWFkbGluZVZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdFx0dGhpcy5kZWFkbGluZVZhbHVlID0gdmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdGNyZWF0ZVRleHRBcmVhKGNvbnRlbnRFbCwgXCJcdTRGRUVcdTY1MzlcdThCRjRcdTY2MEVcdUZGMDhcdTUxOTlcdTUxNjVcdTUzODZcdTUzRjJcdUZGMDlcIiwgXCJcIiwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLmhpc3RvcnlOb3RlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU1M0Q2XHU2RDg4XCIsIGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIgfSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3Qgc3VibWl0QnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMuY2FyZCA/IFwiXHU0RkREXHU1QjU4XCIgOiBcIlx1NTIxQlx1NUVGQVwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdm9pZCB0aGlzLmhhbmRsZVN1Ym1pdCgpKTtcblx0fVxuXG5cdG9uQ2xvc2UoKSB7XG5cdFx0dGhpcy5jb250ZW50RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlIYW5kbGVyKTtcblx0XHRzdXBlci5vbkNsb3NlKCk7XG5cdH1cblxuXHRhc3luYyBoYW5kbGVTdWJtaXQoKSB7XG5cdFx0aWYgKHRoaXMuc3VibWl0dGluZykgcmV0dXJuO1xuXHRcdGlmICghdGhpcy50aXRsZVZhbHVlLnRyaW0oKSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjgwN1x1OTg5OFx1NEUwRFx1ODBGRFx1NEUzQVx1N0E3QVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgdGFncyA9IHBhcnNlVGFncyh0aGlzLnRhZ3NWYWx1ZSk7XG5cdFx0Y29uc3QgcmVtYXJrID0gdGhpcy5yZW1hcmtWYWx1ZS50cmltKCk7XG5cdFx0Y29uc3QgZGVhZGxpbmUgPSBwYXJzZURhdGVUaW1lSW5wdXQodGhpcy5kZWFkbGluZVZhbHVlKTtcblx0XHR0aGlzLnN1Ym1pdHRpbmcgPSB0cnVlO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5jYXJkKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnVwZGF0ZUNhcmQoXG5cdFx0XHRcdFx0dGhpcy5jb2x1bW5JZCxcblx0XHRcdFx0XHR0aGlzLmNhcmQuaWQsXG5cdFx0XHRcdFx0eyB0aXRsZTogdGhpcy50aXRsZVZhbHVlLCB0YWdzLCByZW1hcmssIGRlYWRsaW5lIH0sXG5cdFx0XHRcdFx0dGhpcy5oaXN0b3J5Tm90ZS50cmltKCkgfHwgXCJcdTUxODVcdTVCQjlcdTY2RjRcdTY1QjBcIixcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLmFkZENhcmQodGhpcy5jb2x1bW5JZCwge1xuXHRcdFx0XHRcdHRpdGxlOiB0aGlzLnRpdGxlVmFsdWUsXG5cdFx0XHRcdFx0dGFncyxcblx0XHRcdFx0XHRyZW1hcmssXG5cdFx0XHRcdFx0aGlzdG9yeU5vdGU6IHRoaXMuaGlzdG9yeU5vdGUudHJpbSgpIHx8IFwiXHU1MjFCXHU1RUZBXCIsXG5cdFx0XHRcdFx0ZGVhZGxpbmUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiW1NpbXBsZUthbmJhbl1bQ2FyZE1vZGFsXSBzdWJtaXQgZmFpbGVkXCIsIGVycm9yKTtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdTRGRERcdTVCNThcdTU5MzFcdThEMjVcdUZGMENcdThCRjdcdTkxQ0RcdThCRDVcIik7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuc3VibWl0dGluZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxufVxuXG5pbnRlcmZhY2UgQ29sdW1uTW9kYWxPcHRpb25zIHtcblx0dGl0bGU6IHN0cmluZztcblx0aW5pdGlhbFZhbHVlPzogc3RyaW5nO1xuXHRjb25maXJtVGV4dD86IHN0cmluZztcblx0b25TdWJtaXQ6ICh2YWx1ZTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xufVxuXG5jbGFzcyBDb2x1bW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSB2YWx1ZTogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9wdGlvbnM6IENvbHVtbk1vZGFsT3B0aW9ucykge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy52YWx1ZSA9IG9wdGlvbnMuaW5pdGlhbFZhbHVlID8/IFwiXCI7XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKFwic2stbW9kYWxcIik7XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLm9wdGlvbnMudGl0bGUgfSk7XG5cblx0XHRjcmVhdGVUZXh0RmllbGQoY29udGVudEVsLCBcIlx1NjgwRlx1NzZFRVx1NTQwRFx1NzlGMFwiLCB0aGlzLnZhbHVlLCAodmFsdWUpID0+ICh0aGlzLnZhbHVlID0gdmFsdWUpKTtcblxuXHRcdGNvbnN0IGZvb3RlciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stbW9kYWwtZm9vdGVyXCIgfSk7XG5cdFx0Y29uc3QgY2FuY2VsQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTUzRDZcdTZEODhcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3RcIiB9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG5cblx0XHRjb25zdCBjb25maXJtQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMub3B0aW9ucy5jb25maXJtVGV4dCB8fCBcIlx1Nzg2RVx1OEJBNFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcblx0XHRcdGF3YWl0IHRoaXMub3B0aW9ucy5vblN1Ym1pdCh0aGlzLnZhbHVlKTtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9KTtcblx0fVxufVxuXG5pbnRlcmZhY2UgQ29uZmlybU1vZGFsT3B0aW9ucyB7XG5cdHRpdGxlOiBzdHJpbmc7XG5cdG1lc3NhZ2U6IHN0cmluZztcblx0Y29uZmlybVRleHQ/OiBzdHJpbmc7XG5cdGNhbmNlbFRleHQ/OiBzdHJpbmc7XG5cdG9uQ29uZmlybTogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG59XG5cbmNsYXNzIENvbmZpcm1Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb3B0aW9uczogQ29uZmlybU1vZGFsT3B0aW9ucykge1xuXHRcdHN1cGVyKGFwcCk7XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKFwic2stbW9kYWxcIik7XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLm9wdGlvbnMudGl0bGUgfSk7XG5cdFx0Y29udGVudEVsLmNyZWF0ZURpdih7IHRleHQ6IHRoaXMub3B0aW9ucy5tZXNzYWdlLCBjbHM6IFwic2stY29uZmlybS10ZXh0XCIgfSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY2FuY2VsVGV4dCB8fCBcIlx1NTNENlx1NkQ4OFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3RcIixcblx0XHR9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG5cblx0XHRjb25zdCBjb25maXJtQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMub3B0aW9ucy5jb25maXJtVGV4dCB8fCBcIlx1Nzg2RVx1OEJBNFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcblx0XHRcdGF3YWl0IHRoaXMub3B0aW9ucy5vbkNvbmZpcm0oKTtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVRhZ3MoaW5wdXQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcblx0cmV0dXJuIGlucHV0XG5cdFx0LnNwbGl0KFwiLFwiKVxuXHRcdC5tYXAoKHRhZykgPT4gdGFnLnRyaW0oKSlcblx0XHQuZmlsdGVyKCh0YWcpID0+ICEhdGFnKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXRlVGltZUlucHV0KHZhbHVlOiBzdHJpbmcpOiBudW1iZXIgfCBudWxsIHtcblx0aWYgKCF2YWx1ZS50cmltKCkpIHJldHVybiBudWxsO1xuXHRjb25zdCBwYXJzZWQgPSBEYXRlLnBhcnNlKHZhbHVlKTtcblx0cmV0dXJuIE51bWJlci5pc05hTihwYXJzZWQpID8gbnVsbCA6IHBhcnNlZDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWVJbnB1dCh2YWx1ZT86IG51bWJlciB8IG51bGwpOiBzdHJpbmcge1xuXHRpZiAoIXZhbHVlKSByZXR1cm4gXCJcIjtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKTtcblx0Y29uc3QgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbW0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBoaCA9IFN0cmluZyhkYXRlLmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgbWluID0gU3RyaW5nKGRhdGUuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5eXl5fS0ke21tfS0ke2RkfVQke2hofToke21pbn1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJZCgpIHtcblx0cmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpICsgRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgaGggPSBTdHJpbmcoZGF0ZS5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IG1tID0gU3RyaW5nKGRhdGUuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5fS0ke219LSR7ZH0gJHtoaH06JHttbX1gO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRUaW1lKHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdGNvbnN0IGhoID0gU3RyaW5nKGRhdGUuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBtbSA9IFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7aGh9OiR7bW19YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZU9ubHkodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke3l9LSR7bX0tJHtkfWA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFBlcmNlbnQodmFsdWU6IG51bWJlciwgZGlnaXRzID0gMCk6IHN0cmluZyB7XG5cdGlmICghTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIFwiMCVcIjtcblx0cmV0dXJuIGAkeyhNYXRoLm1heCgwLCB2YWx1ZSkgKiAxMDApLnRvRml4ZWQoZGlnaXRzKX0lYDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UGVyY2VudFZhbHVlKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuXHRpZiAoIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiAwO1xuXHRyZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMTAwLCB2YWx1ZSAqIDEwMCkpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREdXJhdGlvbihtczogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IobXMgLyA2MDAwMCk7XG5cdGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApO1xuXHRjb25zdCBkYXlzID0gTWF0aC5mbG9vcihob3VycyAvIDI0KTtcblx0aWYgKGRheXMgPiAwKSB7XG5cdFx0Y29uc3QgcmVtSG91cnMgPSBob3VycyAlIDI0O1xuXHRcdHJldHVybiByZW1Ib3VycyA/IGAke2RheXN9XHU1OTI5JHtyZW1Ib3Vyc31cdTVDMEZcdTY1RjZgIDogYCR7ZGF5c31cdTU5MjlgO1xuXHR9XG5cdGlmIChob3VycyA+IDApIHtcblx0XHRjb25zdCByZW1NaW51dGVzID0gbWludXRlcyAlIDYwO1xuXHRcdHJldHVybiByZW1NaW51dGVzID8gYCR7aG91cnN9XHU1QzBGXHU2NUY2JHtyZW1NaW51dGVzfVx1NTIwNmAgOiBgJHtob3Vyc31cdTVDMEZcdTY1RjZgO1xuXHR9XG5cdHJldHVybiBgJHtNYXRoLm1heChtaW51dGVzLCAxKX1cdTUyMDZgO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aW1lc3RhbXA6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRjb25zdCB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXHRjb25zdCBtID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9YDtcbn1cblxuY29uc3QgU1ZHX05TID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiO1xuXG5mdW5jdGlvbiBjcmVhdGVTdmdFbGVtZW50PFQgZXh0ZW5kcyBrZXlvZiBTVkdFbGVtZW50VGFnTmFtZU1hcD4odGFnOiBUKTogU1ZHRWxlbWVudFRhZ05hbWVNYXBbVF0ge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFNWR19OUywgdGFnKTtcbn1cblxuZnVuY3Rpb24gc2V0U3ZnQXR0cnMoZWw6IEVsZW1lbnQsIGF0dHJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG5cdE9iamVjdC5lbnRyaWVzKGF0dHJzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IGVsLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRGaWVsZChcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0bGFiZWw6IHN0cmluZyxcblx0dmFsdWU6IHN0cmluZyxcblx0b25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG5cdGNvbnN0IHdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWZpZWxkXCIgfSk7XG5cdHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IHRleHQ6IGxhYmVsIH0pO1xuXHRjb25zdCBpbnB1dCA9IHdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiIH0pO1xuXHRpbnB1dC52YWx1ZSA9IHZhbHVlO1xuXHRpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2dCkgPT4gb25DaGFuZ2UoKGV2dC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGF0ZVRpbWVGaWVsZChcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0bGFiZWw6IHN0cmluZyxcblx0dmFsdWU6IHN0cmluZyxcblx0b25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG5cdGNvbnN0IHdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWZpZWxkXCIgfSk7XG5cdHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IHRleHQ6IGxhYmVsIH0pO1xuXHRjb25zdCBpbnB1dCA9IHdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZXRpbWUtbG9jYWxcIiB9KTtcblx0aW5wdXQudmFsdWUgPSB2YWx1ZTtcblx0aW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRBcmVhKFxuXHRjb250YWluZXI6IEhUTUxFbGVtZW50LFxuXHRsYWJlbDogc3RyaW5nLFxuXHR2YWx1ZTogc3RyaW5nLFxuXHRvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQsXG4pIHtcblx0Y29uc3Qgd3JhcHBlciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZmllbGRcIiB9KTtcblx0d3JhcHBlci5jcmVhdGVFbChcImxhYmVsXCIsIHsgdGV4dDogbGFiZWwgfSk7XG5cdGNvbnN0IHRleHRhcmVhID0gd3JhcHBlci5jcmVhdGVFbChcInRleHRhcmVhXCIpO1xuXHR0ZXh0YXJlYS52YWx1ZSA9IHZhbHVlO1xuXHR0ZXh0YXJlYS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2dCkgPT4gb25DaGFuZ2UoKGV2dC50YXJnZXQgYXMgSFRNTFRleHRBcmVhRWxlbWVudCkudmFsdWUpKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUE2RTtBQUU3RSxJQUFNLFlBQVk7QUFDbEIsSUFBTSxVQUFVO0FBMkVoQixJQUFNLGtCQUFrQixDQUFDLHNCQUFPLHNCQUFPLG9CQUFLO0FBRzVDLFNBQVMscUJBQXNDO0FBQzlDLFNBQU87QUFBQSxJQUNOLFNBQVMsZ0JBQWdCLElBQUksQ0FBQyxVQUFVO0FBQUEsTUFDdkMsSUFBSSxTQUFTO0FBQUEs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
