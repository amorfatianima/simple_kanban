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
var ICON_ID = "layout-kanban";
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
  }
  render() {
    const container = this.contentEl;
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
    titleEl.addEventListener("click", () => {
      this.plugin.setActiveColumn(column.id);
      new CardModal(this.app, this.plugin, column.id, card).open();
    });
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
    this.submitting = true;
    const tags = parseTags(this.tagsValue);
    const remark = this.remarkValue.trim();
    const deadline = parseDateTimeInput(this.deadlineValue);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgSXRlbVZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5jb25zdCBWSUVXX1RZUEUgPSBcInNpbXBsZS1rYW5iYW4tc2lkZWJhci12aWV3XCI7XG5jb25zdCBJQ09OX0lEID0gXCJsYXlvdXQta2FuYmFuXCI7XG5cbmludGVyZmFjZSBLYW5iYW5IaXN0b3J5RW50cnkge1xuXHR0aW1lc3RhbXA6IG51bWJlcjtcblx0cmVtYXJrOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBLYW5iYW5DYXJkIHtcblx0aWQ6IHN0cmluZztcblx0dGl0bGU6IHN0cmluZztcblx0dGFnczogc3RyaW5nW107XG5cdHJlbWFyazogc3RyaW5nO1xuXHRkZWFkbGluZT86IG51bWJlciB8IG51bGw7XG5cdGNvbXBsZXRlZDogYm9vbGVhbjtcblx0Y29tcGxldGVkQXQ/OiBudW1iZXIgfCBudWxsO1xuXHRjcmVhdGVkQXQ6IG51bWJlcjtcblx0dXBkYXRlZEF0OiBudW1iZXI7XG5cdGhpc3Rvcnk6IEthbmJhbkhpc3RvcnlFbnRyeVtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQ29sdW1uIHtcblx0aWQ6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRjYXJkczogS2FuYmFuQ2FyZFtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQm9hcmREYXRhIHtcblx0Y29sdW1uczogS2FuYmFuQ29sdW1uW107XG59XG5cbmludGVyZmFjZSBEYWlseUNvdW50UG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdHZhbHVlOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVN0YXRzUG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdGNyZWF0ZWQ6IG51bWJlcjtcblx0Y29tcGxldGVkOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVJhdGVQb2ludCB7XG5cdGRhdGU6IHN0cmluZztcblx0cmF0ZTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgU3RhdHNTbmFwc2hvdCB7XG5cdHRvdGFsVGFza3M6IG51bWJlcjtcblx0Y29tcGxldGVkVGFza3M6IG51bWJlcjtcblx0d2lwQ291bnQ6IG51bWJlcjtcblx0Y29tcGxldGlvblJhdGU6IG51bWJlcjtcblx0ZGVhZGxpbmVDb3VudDogbnVtYmVyO1xuXHRkZWFkbGluZUNvdmVyYWdlOiBudW1iZXI7XG5cdG92ZXJkdWVDb3VudDogbnVtYmVyO1xuXHRvdmVyZHVlUmF0ZTogbnVtYmVyO1xuXHRvblRpbWVSYXRlOiBudW1iZXI7XG5cdGF2Z0N5Y2xlVGltZU1zOiBudW1iZXIgfCBudWxsO1xuXHRkYWlseVNlcmllczogRGFpbHlTdGF0c1BvaW50W107XG5cdGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W107XG59XG5cbnR5cGUgU3RhdHNSYW5nZSA9XG5cdHwgeyB0eXBlOiBcInByZXNldFwiOyBkYXlzOiBudW1iZXIgfVxuXHR8IHsgdHlwZTogXCJjdXN0b21cIjsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfTtcblxudHlwZSBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiIHwgXCJ5ZXN0ZXJkYXlcIiB8IFwiY3VzdG9tXCI7XG5cbmludGVyZmFjZSBUaW1lbGluZUVudHJ5IHtcblx0Y2FyZElkOiBzdHJpbmc7XG5cdGNhcmRUaXRsZTogc3RyaW5nO1xuXHRjb2x1bW5OYW1lOiBzdHJpbmc7XG5cdHRpbWVzdGFtcDogbnVtYmVyO1xuXHR0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IERFRkFVTFRfQ09MVU1OUyA9IFtcIlx1NUY4NVx1NTkwNFx1NzQwNlwiLCBcIlx1OEZEQlx1ODg0Q1x1NEUyRFwiLCBcIlx1NURGMlx1NUI4Q1x1NjIxMFwiXTtcbnR5cGUgTnVsbGFibGVUaW1lb3V0ID0gbnVtYmVyIHwgbnVsbDtcblxuZnVuY3Rpb24gY3JlYXRlRGVmYXVsdEJvYXJkKCk6IEthbmJhbkJvYXJkRGF0YSB7XG5cdHJldHVybiB7XG5cdFx0Y29sdW1uczogREVGQVVMVF9DT0xVTU5TLm1hcCgobmFtZSkgPT4gKHtcblx0XHRcdGlkOiBjcmVhdGVJZCgpLFxuXHRcdFx0bmFtZSxcblx0XHRcdGNhcmRzOiBbXSxcblx0XHR9KSksXG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZUthbmJhblBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHByaXZhdGUgYm9hcmQ6IEthbmJhbkJvYXJkRGF0YSA9IGNyZWF0ZURlZmF1bHRCb2FyZCgpO1xuXHRwcml2YXRlIHZpZXdzID0gbmV3IFNldDxLYW5iYW5WaWV3PigpO1xuXHRwcml2YXRlIGxhc3RDb2x1bW5JZD86IHN0cmluZztcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkQm9hcmQoKTtcblxuXHRcdHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRSwgKGxlYWYpID0+IHtcblx0XHRcdGNvbnN0IHZpZXcgPSBuZXcgS2FuYmFuVmlldyhsZWFmLCB0aGlzKTtcblx0XHRcdHRoaXMucmVnaXN0ZXJLYW5iYW5WaWV3KHZpZXcpO1xuXHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZFJpYmJvbkljb24oSUNPTl9JRCwgXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIiwgKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcInNpbXBsZS1rYW5iYW4tb3BlblwiLFxuXHRcdFx0bmFtZTogXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIixcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuXHRcdH0pO1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogXCJzaW1wbGUta2FuYmFuLWFkZC1jYXJkXCIsXG5cdFx0XHRuYW1lOiBcIlx1NkRGQlx1NTJBMFx1NTM2MVx1NzI0N1wiLFxuXHRcdFx0aG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJNb2RcIiwgXCJTaGlmdFwiXSwga2V5OiBcIk5cIiB9XSxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLm9wZW5RdWlja0FkZENhcmQoKSxcblx0XHR9KTtcblxuXHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCkpO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0dGhpcy52aWV3cy5jbGVhcigpO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkQm9hcmQoKSB7XG5cdFx0Y29uc3Qgc3RvcmVkID0gYXdhaXQgdGhpcy5sb2FkRGF0YSgpO1xuXHRcdGlmIChzdG9yZWQgJiYgc3RvcmVkLmNvbHVtbnMpIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBzdG9yZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBjcmVhdGVEZWZhdWx0Qm9hcmQoKTtcblx0XHR9XG5cdFx0dGhpcy5ub3JtYWxpemVCb2FyZCgpO1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gdGhpcy5ib2FyZC5jb2x1bW5zWzBdPy5pZDtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcGVyc2lzdCgpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuYm9hcmQpO1xuXHRcdHRoaXMubm90aWZ5Vmlld3MoKTtcblx0fVxuXG5cdHJlZ2lzdGVyS2FuYmFuVmlldyh2aWV3OiBLYW5iYW5WaWV3KSB7XG5cdFx0dGhpcy52aWV3cy5hZGQodmlldyk7XG5cdFx0dmlldy5yZWdpc3RlcigoKSA9PiB0aGlzLnZpZXdzLmRlbGV0ZSh2aWV3KSk7XG5cdH1cblxuXHRub3RpZnlWaWV3cygpIHtcblx0XHR0aGlzLnZpZXdzLmZvckVhY2goKHZpZXcpID0+IHZpZXcucmVuZGVyKCkpO1xuXHR9XG5cblx0Z2V0Qm9hcmQoKTogS2FuYmFuQm9hcmREYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5ib2FyZDtcblx0fVxuXG5cdGFzeW5jIGFkZENvbHVtbihuYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIW5hbWUudHJpbSgpKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBjb2x1bW4gPSB7IGlkOiBjcmVhdGVJZCgpLCBuYW1lOiBuYW1lLnRyaW0oKSwgY2FyZHM6IFtdIGFzIEthbmJhbkNhcmRbXSB9O1xuXHRcdHRoaXMuYm9hcmQuY29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0aWYgKCF0aGlzLmxhc3RDb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSBjb2x1bW4uaWQ7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgcmVtb3ZlQ29sdW1uKGNvbHVtbklkOiBzdHJpbmcpIHtcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuYm9hcmQuY29sdW1ucy5maW5kSW5kZXgoKGNvbCkgPT4gY29sLmlkID09PSBjb2x1bW5JZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjcyQVx1NjI3RVx1NTIzMFx1NjMwN1x1NUI5QVx1NjgwRlx1NzZFRVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5ib2FyZC5jb2x1bW5zLnNwbGljZShpbmRleCwgMSk7XG5cdFx0aWYgKHRoaXMubGFzdENvbHVtbklkID09PSBjb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSB0aGlzLmJvYXJkLmNvbHVtbnNbMF0/LmlkO1xuXHRcdH1cblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIHJlbmFtZUNvbHVtbihjb2x1bW5JZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3QgbmV4dE5hbWUgPSBuYW1lLnRyaW0oKTtcblx0XHRpZiAoIW5leHROYW1lKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb2x1bW4ubmFtZSA9IG5leHROYW1lO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgYWRkQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHBheWxvYWQ6IHtcblx0XHRcdHRpdGxlOiBzdHJpbmc7XG5cdFx0XHR0YWdzOiBzdHJpbmdbXTtcblx0XHRcdHJlbWFyazogc3RyaW5nO1xuXHRcdFx0aGlzdG9yeU5vdGU6IHN0cmluZztcblx0XHRcdGRlYWRsaW5lPzogbnVtYmVyIHwgbnVsbDtcblx0XHR9LFxuXHQpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRjb25zdCBjYXJkOiBLYW5iYW5DYXJkID0ge1xuXHRcdFx0aWQ6IGNyZWF0ZUlkKCksXG5cdFx0XHR0aXRsZTogcGF5bG9hZC50aXRsZS50cmltKCksXG5cdFx0XHR0YWdzOiBwYXlsb2FkLnRhZ3MsXG5cdFx0XHRyZW1hcms6IHBheWxvYWQucmVtYXJrLFxuXHRcdFx0ZGVhZGxpbmU6IHBheWxvYWQuZGVhZGxpbmUgPz8gbnVsbCxcblx0XHRcdGNvbXBsZXRlZDogZmFsc2UsXG5cdFx0XHRjb21wbGV0ZWRBdDogbnVsbCxcblx0XHRcdGNyZWF0ZWRBdDogbm93LFxuXHRcdFx0dXBkYXRlZEF0OiBub3csXG5cdFx0XHRoaXN0b3J5OiBbXSxcblx0XHR9O1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBwYXlsb2FkLmhpc3RvcnlOb3RlIHx8IFwiXHU1MjFCXHU1RUZBXCIpO1xuXHRcdGNvbHVtbi5jYXJkcy51bnNoaWZ0KGNhcmQpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdXBkYXRlQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdHVwZGF0ZXM6IFBhcnRpYWw8UGljazxLYW5iYW5DYXJkLCBcInRpdGxlXCIgfCBcInRhZ3NcIiB8IFwicmVtYXJrXCIgfCBcImRlYWRsaW5lXCI+Pixcblx0XHRoaXN0b3J5Tm90ZT86IHN0cmluZyxcblx0KSB7XG5cdFx0Y29uc3QgY2FyZCA9IHRoaXMuZ2V0Q2FyZChjb2x1bW5JZCwgY2FyZElkKTtcblx0XHRpZiAoIWNhcmQpIHJldHVybjtcblx0XHRpZiAodXBkYXRlcy50aXRsZSAhPT0gdW5kZWZpbmVkKSBjYXJkLnRpdGxlID0gdXBkYXRlcy50aXRsZS50cmltKCk7XG5cdFx0aWYgKHVwZGF0ZXMudGFncyAhPT0gdW5kZWZpbmVkKSBjYXJkLnRhZ3MgPSB1cGRhdGVzLnRhZ3M7XG5cdFx0aWYgKHVwZGF0ZXMucmVtYXJrICE9PSB1bmRlZmluZWQpIGNhcmQucmVtYXJrID0gdXBkYXRlcy5yZW1hcms7XG5cdFx0aWYgKHVwZGF0ZXMuZGVhZGxpbmUgIT09IHVuZGVmaW5lZCkgY2FyZC5kZWFkbGluZSA9IHVwZGF0ZXMuZGVhZGxpbmU7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBoaXN0b3J5Tm90ZSB8fCBcIlx1NTE4NVx1NUJCOVx1NjZGNFx1NjVCMFwiKTtcblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIG1vdmVDYXJkKFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdGZyb21Db2x1bW5JZDogc3RyaW5nLFxuXHRcdHRvQ29sdW1uSWQ6IHN0cmluZyxcblx0XHRiZWZvcmVDYXJkSWQ/OiBzdHJpbmcsXG5cdCkge1xuXHRcdGNvbnN0IGZyb21Db2x1bW4gPSB0aGlzLmdldENvbHVtbihmcm9tQ29sdW1uSWQpO1xuXHRcdGNvbnN0IHRvQ29sdW1uID0gdGhpcy5nZXRDb2x1bW4odG9Db2x1bW5JZCk7XG5cdFx0Y29uc3QgaW5kZXggPSBmcm9tQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gY2FyZElkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG5cdFx0Y29uc3QgW2NhcmRdID0gZnJvbUNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGxldCB0YXJnZXRJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmxlbmd0aDtcblx0XHRpZiAoYmVmb3JlQ2FyZElkKSB7XG5cdFx0XHRjb25zdCBiZWZvcmVJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gYmVmb3JlQ2FyZElkKTtcblx0XHRcdHRhcmdldEluZGV4ID0gYmVmb3JlSW5kZXggPT09IC0xID8gdG9Db2x1bW4uY2FyZHMubGVuZ3RoIDogYmVmb3JlSW5kZXg7XG5cdFx0fVxuXHRcdHRvQ29sdW1uLmNhcmRzLnNwbGljZSh0YXJnZXRJbmRleCwgMCwgY2FyZCk7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdGlmIChmcm9tQ29sdW1uSWQgIT09IHRvQ29sdW1uSWQpIHtcblx0XHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBgXHU3OUZCXHU1MkE4XHU1MjMwXHUzMDBDJHt0b0NvbHVtbi5uYW1lfVx1MzAwRGApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlY29yZEhpc3RvcnkoY2FyZCwgXCJcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEZcIik7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdG9nZ2xlQ2FyZENvbXBsZXRpb24oY29sdW1uSWQ6IHN0cmluZywgY2FyZElkOiBzdHJpbmcsIGNvbXBsZXRlZDogYm9vbGVhbikge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBpbmRleCA9IGNvbHVtbi5jYXJkcy5maW5kSW5kZXgoKGMpID0+IGMuaWQgPT09IGNhcmRJZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xuXHRcdGNvbnN0IFtjYXJkXSA9IGNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGNhcmQuY29tcGxldGVkID0gY29tcGxldGVkO1xuXHRcdGNhcmQuY29tcGxldGVkQXQgPSBjb21wbGV0ZWQgPyBEYXRlLm5vdygpIDogbnVsbDtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGNvbXBsZXRlZCA/IFwiXHU2ODA3XHU4QkIwXHU1QjhDXHU2MjEwXCIgOiBcIlx1NTNENlx1NkQ4OFx1NUI4Q1x1NjIxMFwiKTtcblx0XHRjb25zdCBpbnNlcnRJbmRleCA9IGNvbXBsZXRlZCA/IGNvbHVtbi5jYXJkcy5sZW5ndGggOiBNYXRoLm1pbihpbmRleCwgY29sdW1uLmNhcmRzLmxlbmd0aCk7XG5cdFx0Y29sdW1uLmNhcmRzLnNwbGljZShpbnNlcnRJbmRleCwgMCwgY2FyZCk7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRwcml2YXRlIGdldENvbHVtbihjb2x1bW5JZDogc3RyaW5nKTogS2FuYmFuQ29sdW1uIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmJvYXJkLmNvbHVtbnMuZmluZCgoY29sKSA9PiBjb2wuaWQgPT09IGNvbHVtbklkKTtcblx0XHRpZiAoIWNvbHVtbikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiXHU2NzJBXHU2MjdFXHU1MjMwXHU2MzA3XHU1QjlBXHU3Njg0XHU2ODBGXHU3NkVFXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRDYXJkKGNvbHVtbklkOiBzdHJpbmcsIGNhcmRJZDogc3RyaW5nKTogS2FuYmFuQ2FyZCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oY29sdW1uSWQpO1xuXHRcdHJldHVybiBjb2x1bW4uY2FyZHMuZmluZCgoY2FyZCkgPT4gY2FyZC5pZCA9PT0gY2FyZElkKTtcblx0fVxuXG5cdHByaXZhdGUgcmVjb3JkSGlzdG9yeShjYXJkOiBLYW5iYW5DYXJkLCByZW1hcms6IHN0cmluZykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpKSB7XG5cdFx0XHRjYXJkLmhpc3RvcnkgPSBbXTtcblx0XHR9XG5cdFx0Y2FyZC5oaXN0b3J5LnVuc2hpZnQoe1xuXHRcdFx0dGltZXN0YW1wOiBEYXRlLm5vdygpLFxuXHRcdFx0cmVtYXJrOiByZW1hcmsgfHwgXCJcdTY2RjRcdTY1QjBcIixcblx0XHR9KTtcblx0XHRjYXJkLmhpc3RvcnkgPSBjYXJkLmhpc3Rvcnkuc2xpY2UoMCwgNTApO1xuXHR9XG5cblx0cHJpdmF0ZSBub3JtYWxpemVCb2FyZCgpIHtcblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLmJvYXJkLmNvbHVtbnMpIHtcblx0XHRcdGNvbHVtbi5jYXJkcyA9IGNvbHVtbi5jYXJkcy5tYXAoKGNhcmQpID0+ICh7XG5cdFx0XHRcdC4uLmNhcmQsXG5cdFx0XHRcdGRlYWRsaW5lOiBjYXJkLmRlYWRsaW5lID8/IG51bGwsXG5cdFx0XHRcdGNvbXBsZXRlZEF0OiBjYXJkLmNvbXBsZXRlZEF0ID8/IG51bGwsXG5cdFx0XHR9KSk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgYWN0aXZhdGVWaWV3KCkge1xuXHRcdGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFKTtcblx0XHRpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYXZlc1swXSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHJpZ2h0TGVhZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRSaWdodExlYWYoZmFsc2UpO1xuXHRcdGF3YWl0IHJpZ2h0TGVhZj8uc2V0Vmlld1N0YXRlKHsgdHlwZTogVklFV19UWVBFLCBhY3RpdmU6IHRydWUgfSk7XG5cdFx0aWYgKHJpZ2h0TGVhZikge1xuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYocmlnaHRMZWFmKTtcblx0XHR9XG5cdH1cblxuXHRzZXRBY3RpdmVDb2x1bW4oY29sdW1uSWQ6IHN0cmluZykge1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gY29sdW1uSWQ7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVDb2x1bW5Gb3JRdWlja0FkZCgpOiBLYW5iYW5Db2x1bW4gfCB1bmRlZmluZWQge1xuXHRcdGlmICghdGhpcy5ib2FyZC5jb2x1bW5zLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRjb25zdCBwcmVmZXJyZWQgPVxuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgJiYgdGhpcy5ib2FyZC5jb2x1bW5zLmZpbmQoKGNvbCkgPT4gY29sLmlkID09PSB0aGlzLmxhc3RDb2x1bW5JZCk7XG5cdFx0cmV0dXJuIHByZWZlcnJlZCA/PyB0aGlzLmJvYXJkLmNvbHVtbnNbMF07XG5cdH1cblxuXHRvcGVuUXVpY2tBZGRDYXJkKCkge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMucmVzb2x2ZUNvbHVtbkZvclF1aWNrQWRkKCk7XG5cdFx0aWYgKCFjb2x1bW4pIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdThCRjdcdTUxNDhcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcywgY29sdW1uLmlkKS5vcGVuKCk7XG5cdH1cbn1cblxuY2xhc3MgS2FuYmFuVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcblx0cHJpdmF0ZSBkcmFnU3RhdGU/OiB7IGNvbHVtbklkOiBzdHJpbmc7IGNhcmRJZDogc3RyaW5nOyBjYXJkSGVpZ2h0OiBudW1iZXIgfTtcblx0cHJpdmF0ZSBwbGFjZWhvbGRlckVsPzogSFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgcGxhY2Vob2xkZXJTdGF0ZT86IHsgY29sdW1uSWQ6IHN0cmluZzsgYmVmb3JlSWQ/OiBzdHJpbmcgfTtcblx0cHJpdmF0ZSBkZWFkbGluZUZpbHRlcnMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcblx0cHJpdmF0ZSBhY3RpdmVUYWI6IFwiYm9hcmRcIiB8IFwic3RhdHNcIiB8IFwidGltZWxpbmVcIiA9IFwiYm9hcmRcIjtcblx0cHJpdmF0ZSBzdGF0c1JhbmdlOiBTdGF0c1JhbmdlID0geyB0eXBlOiBcInByZXNldFwiLCBkYXlzOiAxNCB9O1xuXHRwcml2YXRlIHRpbWVsaW5lUHJlc2V0OiBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiO1xuXHRwcml2YXRlIHRpbWVsaW5lQ3VzdG9tPzogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9O1xuXG5cdGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHByaXZhdGUgcGx1Z2luOiBTaW1wbGVLYW5iYW5QbHVnaW4pIHtcblx0XHRzdXBlcihsZWFmKTtcblx0fVxuXG5cdGdldFZpZXdUeXBlKCkge1xuXHRcdHJldHVybiBWSUVXX1RZUEU7XG5cdH1cblxuXHRnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIlx1NTNGM1x1NEZBN1x1NzcwQlx1Njc3RlwiO1xuXHR9XG5cblx0Z2V0SWNvbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiBJQ09OX0lEO1xuXHR9XG5cblx0YXN5bmMgb25PcGVuKCkge1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblxuXHRhc3luYyBvbkNsb3NlKCkge1xuXHRcdHRoaXMuZHJhZ1N0YXRlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGVudEVsO1xuXHRcdGNvbnRhaW5lci5lbXB0eSgpO1xuXHRcdGNvbnRhaW5lci5hZGRDbGFzcyhcInNrLWthbmJhblwiKTtcblxuXHRcdGNvbnN0IHRhYnMgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRhYnNcIiB9KTtcblx0XHR0aGlzLnJlbmRlclRhYkJ1dHRvbih0YWJzLCBcImJvYXJkXCIsIFwiXHU0RUZCXHU1MkExXHU3NzBCXHU2NzdGXCIpO1xuXHRcdHRoaXMucmVuZGVyVGFiQnV0dG9uKHRhYnMsIFwic3RhdHNcIiwgXCJcdTY1NDhcdTczODdcdTdFREZcdThCQTFcIik7XG5cdFx0dGhpcy5yZW5kZXJUYWJCdXR0b24odGFicywgXCJ0aW1lbGluZVwiLCBcIlx1NjVGNlx1OTVGNFx1OEY3NFwiKTtcblxuXHRcdGNvbnN0IGJvZHkgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRhYi1wYW5lbFwiIH0pO1xuXHRcdGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gXCJib2FyZFwiKSB7XG5cdFx0XHR0aGlzLnJlbmRlckJvYXJkKGJvZHkpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5hY3RpdmVUYWIgPT09IFwic3RhdHNcIikge1xuXHRcdFx0dGhpcy5yZW5kZXJTdGF0cyhib2R5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5yZW5kZXJUaW1lbGluZShib2R5KTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRhYkJ1dHRvbihjb250YWluZXI6IEhUTUxFbGVtZW50LCB0YWI6IFwiYm9hcmRcIiB8IFwic3RhdHNcIiwgbGFiZWw6IHN0cmluZykge1xuXHRcdGNvbnN0IGJ1dHRvbiA9IGNvbnRhaW5lci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBsYWJlbCxcblx0XHRcdGNsczogW1wic2stdGFiXCIsIHRoaXMuYWN0aXZlVGFiID09PSB0YWIgPyBcInNrLXRhYi1hY3RpdmVcIiA6IFwiXCJdLmpvaW4oXCIgXCIpLnRyaW0oKSxcblx0XHR9KTtcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gdGFiKSByZXR1cm47XG5cdFx0XHR0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckJvYXJkKGJvZHk6IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3QgYm9hcmQgPSB0aGlzLnBsdWdpbi5nZXRCb2FyZCgpO1xuXG5cdFx0Y29uc3QgaGVhZGVyID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2staGVhZGVyXCIgfSk7XG5cdFx0aGVhZGVyLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIlx1NEZBN1x1OEZCOVx1NzcwQlx1Njc3RlwiIH0pO1xuXHRcdGNvbnN0IGFkZENvbHVtbkJ0biA9IGhlYWRlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBcIlx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdGFkZENvbHVtbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0bmV3IENvbHVtbk1vZGFsKHRoaXMuYXBwLCB7XG5cdFx0XHRcdHRpdGxlOiBcIlx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0XHRjb25maXJtVGV4dDogXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdFx0b25TdWJtaXQ6IGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLmFkZENvbHVtbih2YWx1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjb2x1bW5zV3JhcHBlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbnNcIiB9KTtcblx0XHRpZiAoIWJvYXJkLmNvbHVtbnMubGVuZ3RoKSB7XG5cdFx0XHRjb2x1bW5zV3JhcHBlci5jcmVhdGVEaXYoeyB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1NjgwRlx1NzZFRVx1RkYwQ1x1NzBCOVx1NTFGQlx1MjAxQ1x1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVx1MjAxRFx1MzAwMlwiLCBjbHM6IFwic2stZW1wdHlcIiB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiBib2FyZC5jb2x1bW5zKSB7XG5cdFx0XHR0aGlzLnJlbmRlckNvbHVtbihjb2x1bW5zV3JhcHBlciwgY29sdW1uKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclN0YXRzKGJvZHk6IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3Qgc3RhdHMgPSB0aGlzLmJ1aWxkU3RhdHNTbmFwc2hvdCh0aGlzLnN0YXRzUmFuZ2UpO1xuXHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIFNuYXBzaG90XCIsIHtcblx0XHRcdHJhbmdlOiB0aGlzLnN0YXRzUmFuZ2UsXG5cdFx0XHRkYWlseVNlcmllczogc3RhdHMuZGFpbHlTZXJpZXMsXG5cdFx0XHRkYWlseVJhdGVzOiBzdGF0cy5kYWlseVJhdGVzLFxuXHRcdH0pO1xuXG5cdFx0Ym9keS5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdTY1NDhcdTczODdcdTdFREZcdThCQTFcIiwgY2xzOiBcInNrLXN0YXRzLXRpdGxlXCIgfSk7XG5cdFx0Y29uc3QgcmFuZ2VDb250cm9scyA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXJhbmdlLWNvbnRyb2xzXCIgfSk7XG5cdFx0cmFuZ2VDb250cm9scy5jcmVhdGVTcGFuKHsgdGV4dDogXCJcdTY1RjZcdTk1RjRcdTgzMDNcdTU2RjRcdUZGMUFcIiB9KTtcblx0XHRjb25zdCBzZWxlY3QgPSByYW5nZUNvbnRyb2xzLmNyZWF0ZUVsKFwic2VsZWN0XCIsIHsgY2xzOiBcInNrLXJhbmdlLXNlbGVjdFwiIH0pIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuXHRcdGNvbnN0IHByZXNldE9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7IFwiN1x1NTkyOVwiOiA3LCBcIjE0XHU1OTI5XCI6IDE0LCBcIjMwXHU1OTI5XCI6IDMwLCBcIjkwXHU1OTI5XCI6IDkwIH07XG5cdFx0T2JqZWN0LmVudHJpZXMocHJlc2V0T3B0aW9ucykuZm9yRWFjaCgoW2xhYmVsLCBkYXlzXSkgPT4ge1xuXHRcdFx0Y29uc3Qgb3B0aW9uID0gc2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdGV4dDogbGFiZWwsIHZhbHVlOiBkYXlzLnRvU3RyaW5nKCkgfSk7XG5cdFx0XHRpZiAodGhpcy5zdGF0c1JhbmdlLnR5cGUgPT09IFwicHJlc2V0XCIgJiYgdGhpcy5zdGF0c1JhbmdlLmRheXMgPT09IGRheXMpIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG5cdFx0fSk7XG5cdFx0Y29uc3QgY3VzdG9tT3B0aW9uID0gc2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdGV4dDogXCJcdTgxRUFcdTVCOUFcdTRFNDlcIiwgdmFsdWU6IFwiY3VzdG9tXCIgfSk7XG5cdFx0aWYgKHRoaXMuc3RhdHNSYW5nZS50eXBlID09PSBcImN1c3RvbVwiKSBjdXN0b21PcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuXG5cdFx0Y29uc3QgY3VzdG9tRmllbGRzID0gcmFuZ2VDb250cm9scy5jcmVhdGVEaXYoeyBjbHM6IFwic2stcmFuZ2UtY3VzdG9tXCIgfSk7XG5cdFx0Y29uc3Qgc3RhcnRJbnB1dCA9IGN1c3RvbUZpZWxkcy5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJkYXRlXCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjb25zdCBlbmRJbnB1dCA9IGN1c3RvbUZpZWxkcy5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJkYXRlXCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjb25zdCB1cGRhdGVDdXN0b21JbnB1dHMgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5zdGF0c1JhbmdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIHtcblx0XHRcdFx0c3RhcnRJbnB1dC52YWx1ZSA9IGZvcm1hdERhdGVJbnB1dFZhbHVlKHRoaXMuc3RhdHNSYW5nZS5zdGFydCk7XG5cdFx0XHRcdGVuZElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy5zdGF0c1JhbmdlLmVuZCk7XG5cdFx0XHRcdGN1c3RvbUZpZWxkcy5hZGRDbGFzcyhcInNrLXJhbmdlLWN1c3RvbS12aXNpYmxlXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3VzdG9tRmllbGRzLnJlbW92ZUNsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR1cGRhdGVDdXN0b21JbnB1dHMoKTtcblxuXHRcdHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcblx0XHRcdGlmIChzZWxlY3QudmFsdWUgPT09IFwiY3VzdG9tXCIpIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdGNvbnN0IGRlZmF1bHRTdGFydCA9IHRvZGF5IC0gMTMgKiAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdFx0XHR0aGlzLnN0YXRzUmFuZ2UgPSB7IHR5cGU6IFwiY3VzdG9tXCIsIHN0YXJ0OiBkZWZhdWx0U3RhcnQsIGVuZDogdG9kYXkgfTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc3RhdHNSYW5nZSA9IHsgdHlwZTogXCJwcmVzZXRcIiwgZGF5czogTnVtYmVyKHNlbGVjdC52YWx1ZSkgfTtcblx0XHRcdH1cblx0XHRcdHVwZGF0ZUN1c3RvbUlucHV0cygpO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGhhbmRsZUN1c3RvbUNoYW5nZSA9ICgpID0+IHtcblx0XHRcdGlmICh0aGlzLnN0YXRzUmFuZ2UudHlwZSAhPT0gXCJjdXN0b21cIikgcmV0dXJuO1xuXHRcdFx0Y29uc3Qgc3RhcnRUcyA9IHN0YXJ0SW5wdXQudmFsdWUgPyB0aGlzLnN0YXJ0T2ZEYXkobmV3IERhdGUoc3RhcnRJbnB1dC52YWx1ZSkuZ2V0VGltZSgpKSA6IG51bGw7XG5cdFx0XHRjb25zdCBlbmRUcyA9IGVuZElucHV0LnZhbHVlID8gdGhpcy5zdGFydE9mRGF5KG5ldyBEYXRlKGVuZElucHV0LnZhbHVlKS5nZXRUaW1lKCkpIDogbnVsbDtcblx0XHRcdGlmIChzdGFydFRzICYmIGVuZFRzICYmIHN0YXJ0VHMgPD0gZW5kVHMpIHtcblx0XHRcdFx0dGhpcy5zdGF0c1JhbmdlID0geyB0eXBlOiBcImN1c3RvbVwiLCBzdGFydDogc3RhcnRUcywgZW5kOiBlbmRUcyB9O1xuXHRcdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0c3RhcnRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGhhbmRsZUN1c3RvbUNoYW5nZSk7XG5cdFx0ZW5kSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBoYW5kbGVDdXN0b21DaGFuZ2UpO1xuXG5cdFx0Y29uc3QgZGFzaGJvYXJkID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtZGFzaGJvYXJkXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChkYXNoYm9hcmQsIFwiXHU2MDNCXHU0RUZCXHU1MkExXCIsIHN0YXRzLnRvdGFsVGFza3MudG9TdHJpbmcoKSwgXCJcdTdEMkZcdThCQTFcdTUyMUJcdTVFRkFcIik7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChcblx0XHRcdGRhc2hib2FyZCxcblx0XHRcdFwiXHU1QjhDXHU2MjEwXHU3Mzg3XCIsXG5cdFx0XHRmb3JtYXRQZXJjZW50KHN0YXRzLmNvbXBsZXRpb25SYXRlKSxcblx0XHRcdGBcdTVERjJcdTVCOENcdTYyMTAgJHtzdGF0cy5jb21wbGV0ZWRUYXNrc30vJHtzdGF0cy50b3RhbFRhc2tzIHx8IDF9YCxcblx0XHQpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoZGFzaGJvYXJkLCBcIlx1NUY1M1x1NTI0RFx1OEZEQlx1ODg0Q1x1NEUyRFwiLCBzdGF0cy53aXBDb3VudC50b1N0cmluZygpLCBcIlx1NEVDRFx1NjcyQVx1NUI4Q1x1NjIxMFwiKTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTkwM0VcdTY3MUZcdTczODdcIixcblx0XHRcdHN0YXRzLmRlYWRsaW5lQ291bnQgPyBmb3JtYXRQZXJjZW50KHN0YXRzLm92ZXJkdWVSYXRlKSA6IFwiXHUyMDE0XCIsXG5cdFx0XHRgJHtzdGF0cy5vdmVyZHVlQ291bnR9LyR7c3RhdHMuZGVhZGxpbmVDb3VudCB8fCAxfSBcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFgLFxuXHRcdCk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChcblx0XHRcdGRhc2hib2FyZCxcblx0XHRcdFwiXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwXHU3Mzg3XCIsXG5cdFx0XHRzdGF0cy5kZWFkbGluZUNvdW50ID8gZm9ybWF0UGVyY2VudChzdGF0cy5vblRpbWVSYXRlKSA6IFwiXHUyMDE0XCIsXG5cdFx0XHRcIlx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVx1NjMwOVx1NjVGNlx1NUI4Q1x1NjIxMFwiLFxuXHRcdCk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChcblx0XHRcdGRhc2hib2FyZCxcblx0XHRcdFwiXHU1RTczXHU1NzQ3XHU1QjhDXHU2MjEwXHU1NDY4XHU2NzFGXCIsXG5cdFx0XHRzdGF0cy5hdmdDeWNsZVRpbWVNcyA/IGZvcm1hdER1cmF0aW9uKHN0YXRzLmF2Z0N5Y2xlVGltZU1zKSA6IFwiXHUyMDE0XCIsXG5cdFx0XHRcIlx1NEVDRVx1NTIxQlx1NUVGQVx1NTIzMFx1NUI4Q1x1NjIxMFwiLFxuXHRcdCk7XG5cblx0XHRjb25zdCBjaGFydFNlY3Rpb24gPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1zZWN0aW9uXCIgfSk7XG5cdFx0Y2hhcnRTZWN0aW9uLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlx1NkJDRlx1NjVFNVx1NEVGQlx1NTJBMVx1OEQ4Qlx1NTJCRlwiIH0pO1xuXHRcdHRoaXMucmVuZGVyRGFpbHlCYXJDaGFydChjaGFydFNlY3Rpb24sIHN0YXRzLmRhaWx5U2VyaWVzKTtcblxuXHRcdGNvbnN0IHJhdGVTZWN0aW9uID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtc2VjdGlvblwiIH0pO1xuXHRcdHJhdGVTZWN0aW9uLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlx1NkJDRlx1NjVFNVx1NUI4Q1x1NjIxMFx1NzM4N1wiIH0pO1xuXHRcdHRoaXMucmVuZGVyRGFpbHlSYXRlQ2hhcnQocmF0ZVNlY3Rpb24sIHN0YXRzLmRhaWx5UmF0ZXMpO1xuXG5cdFx0Y29uc3QgZGVhZGxpbmVTZWN0aW9uID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtc2VjdGlvblwiIH0pO1xuXHRcdGRlYWRsaW5lU2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcdTY5ODJcdTg5QzhcIiB9KTtcblx0XHR0aGlzLnJlbmRlckRlYWRsaW5lQnJlYWtkb3duKGRlYWRsaW5lU2VjdGlvbiwgc3RhdHMpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJUaW1lbGluZShib2R5OiBIVE1MRWxlbWVudCkge1xuXHRcdGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gdGhpcy5yZXNvbHZlVGltZWxpbmVSYW5nZSgpO1xuXHRcdGNvbnN0IGVudHJpZXMgPSB0aGlzLmJ1aWxkVGltZWxpbmVFbnRyaWVzKHN0YXJ0LCBlbmQpO1xuXG5cdFx0Y29uc3QgaGVhZGVyID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2staGVhZGVyXCIgfSk7XG5cdFx0aGVhZGVyLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIlx1NjVGNlx1OTVGNFx1OEY3NFwiIH0pO1xuXHRcdGNvbnN0IGNvbnRyb2xzID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jb250cm9sc1wiIH0pO1xuXHRcdGNvbnN0IHByZXNldFNlbGVjdCA9IGNvbnRyb2xzLmNyZWF0ZUVsKFwic2VsZWN0XCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuXHRcdFtcblx0XHRcdHsgdmFsdWU6IFwidG9kYXlcIiwgbGFiZWw6IFwiXHU0RUNBXHU1OTI5XCIgfSxcblx0XHRcdHsgdmFsdWU6IFwieWVzdGVyZGF5XCIsIGxhYmVsOiBcIlx1NjYyOFx1NTkyOVwiIH0sXG5cdFx0XHR7IHZhbHVlOiBcImN1c3RvbVwiLCBsYWJlbDogXCJcdTgxRUFcdTVCOUFcdTRFNDlcIiB9LFxuXHRcdF0uZm9yRWFjaCgob3B0aW9uKSA9PiB7XG5cdFx0XHRjb25zdCBvcHQgPSBwcmVzZXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBvcHRpb24ubGFiZWwsIHZhbHVlOiBvcHRpb24udmFsdWUgfSk7XG5cdFx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCA9PT0gb3B0aW9uLnZhbHVlKSBvcHQuc2VsZWN0ZWQgPSB0cnVlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY3VzdG9tV3JhcHBlciA9IGNvbnRyb2xzLmNyZWF0ZURpdih7IGNsczogXCJzay1yYW5nZS1jdXN0b21cIiB9KTtcblx0XHRjb25zdCBzdGFydElucHV0ID0gY3VzdG9tV3JhcHBlci5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJkYXRlXCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjb25zdCBlbmRJbnB1dCA9IGN1c3RvbVdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZVwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cblx0XHRjb25zdCB1cGRhdGVDdXN0b21JbnB1dHMgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCA9PT0gXCJjdXN0b21cIiAmJiB0aGlzLnRpbWVsaW5lQ3VzdG9tKSB7XG5cdFx0XHRcdHN0YXJ0SW5wdXQudmFsdWUgPSBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aGlzLnRpbWVsaW5lQ3VzdG9tLnN0YXJ0KTtcblx0XHRcdFx0ZW5kSW5wdXQudmFsdWUgPSBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aGlzLnRpbWVsaW5lQ3VzdG9tLmVuZCk7XG5cdFx0XHRcdGN1c3RvbVdyYXBwZXIuYWRkQ2xhc3MoXCJzay1yYW5nZS1jdXN0b20tdmlzaWJsZVwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1c3RvbVdyYXBwZXIucmVtb3ZlQ2xhc3MoXCJzay1yYW5nZS1jdXN0b20tdmlzaWJsZVwiKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHVwZGF0ZUN1c3RvbUlucHV0cygpO1xuXG5cdFx0Y29uc3QgYXBwbHlQcmVzZXQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IHByZXNldFNlbGVjdC52YWx1ZSBhcyBUaW1lbGluZVJhbmdlUHJlc2V0O1xuXHRcdFx0dGhpcy50aW1lbGluZVByZXNldCA9IHZhbHVlO1xuXHRcdFx0aWYgKHZhbHVlID09PSBcInRvZGF5XCIpIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdHRoaXMudGltZWxpbmVDdXN0b20gPSB7IHN0YXJ0OiB0b2RheSwgZW5kOiB0b2RheSB9O1xuXHRcdFx0fSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJ5ZXN0ZXJkYXlcIikge1xuXHRcdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdFx0Y29uc3QgeWVzdGVyZGF5ID0gdG9kYXkgLSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdFx0XHR0aGlzLnRpbWVsaW5lQ3VzdG9tID0geyBzdGFydDogeWVzdGVyZGF5LCBlbmQ6IHllc3RlcmRheSB9O1xuXHRcdFx0fSBlbHNlIGlmICghdGhpcy50aW1lbGluZUN1c3RvbSkge1xuXHRcdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdFx0dGhpcy50aW1lbGluZUN1c3RvbSA9IHsgc3RhcnQ6IHRvZGF5LCBlbmQ6IHRvZGF5IH07XG5cdFx0XHR9XG5cdFx0XHR1cGRhdGVDdXN0b21JbnB1dHMoKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fTtcblx0XHRwcmVzZXRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhcHBseVByZXNldCk7XG5cblx0XHRjb25zdCBoYW5kbGVDdXN0b21DaGFuZ2UgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCAhPT0gXCJjdXN0b21cIikgcmV0dXJuO1xuXHRcdFx0Y29uc3Qgc3RhcnREYXRlID0gc3RhcnRJbnB1dC52YWx1ZSA/IG5ldyBEYXRlKHN0YXJ0SW5wdXQudmFsdWUpLmdldFRpbWUoKSA6IG51bGw7XG5cdFx0XHRjb25zdCBlbmREYXRlID0gZW5kSW5wdXQudmFsdWUgPyBuZXcgRGF0ZShlbmRJbnB1dC52YWx1ZSkuZ2V0VGltZSgpIDogbnVsbDtcblx0XHRcdGlmIChzdGFydERhdGUgJiYgZW5kRGF0ZSAmJiBzdGFydERhdGUgPD0gZW5kRGF0ZSkge1xuXHRcdFx0XHR0aGlzLnRpbWVsaW5lQ3VzdG9tID0ge1xuXHRcdFx0XHRcdHN0YXJ0OiB0aGlzLnN0YXJ0T2ZEYXkoc3RhcnREYXRlKSxcblx0XHRcdFx0XHRlbmQ6IHRoaXMuc3RhcnRPZkRheShlbmREYXRlKSxcblx0XHRcdFx0fTtcblx0XHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHN0YXJ0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBoYW5kbGVDdXN0b21DaGFuZ2UpO1xuXHRcdGVuZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlQ3VzdG9tQ2hhbmdlKTtcblxuXHRcdGlmICghZW50cmllcy5sZW5ndGgpIHtcblx0XHRcdGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU4QkU1XHU2NUY2XHU5NUY0XHU4MzAzXHU1NkY0XHU1MTg1XHU2Q0ExXHU2NzA5XHU2NENEXHU0RjVDXHU4QkIwXHU1RjU1XCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgdGltZWxpbmVXcmFwcGVyID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtd3JhcHBlclwiIH0pO1xuXHRcdGNvbnN0IHRpbWVsaW5lID0gdGltZWxpbmVXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZVwiIH0pO1xuXHRcdGVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+IHtcblx0XHRcdGNvbnN0IHJvdyA9IHRpbWVsaW5lLmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1yb3dcIiB9KTtcblx0XHRcdGNvbnN0IHRpbWVCb3ggPSByb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLXRpbWVib3hcIiB9KTtcblx0XHRcdHRpbWVCb3guY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLWRhdGVcIiwgdGV4dDogZm9ybWF0RGF0ZU9ubHkoZW50cnkudGltZXN0YW1wKSB9KTtcblx0XHRcdHRpbWVCb3guY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLXRpbWVcIiwgdGV4dDogZm9ybWF0VGltZShlbnRyeS50aW1lc3RhbXApIH0pO1xuXHRcdFx0dGltZUJveC5zZXRBdHRyKFwidGl0bGVcIiwgZm9ybWF0RGF0ZShlbnRyeS50aW1lc3RhbXApKTtcblx0XHRcdGNvbnN0IG1hcmtlciA9IHJvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtbWFya2VyXCIgfSk7XG5cdFx0XHRjb25zdCBjb250ZW50ID0gcm93LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jb250ZW50XCIgfSk7XG5cdFx0XHRjb250ZW50LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jYXJkLXRpdGxlXCIsIHRleHQ6IGVudHJ5LmNhcmRUaXRsZSB9KTtcblx0XHRcdGNvbnRlbnQuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLWNhcmQtYm9keVwiLCB0ZXh0OiBlbnRyeS50ZXh0IH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDb2x1bW4od3JhcHBlcjogSFRNTEVsZW1lbnQsIGNvbHVtbjogS2FuYmFuQ29sdW1uKSB7XG5cdFx0Y29uc3QgY29sdW1uRWwgPSB3cmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW5cIiB9KTtcblxuXHRcdGNvbnN0IGNvbHVtbkhlYWRlciA9IGNvbHVtbkVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW4taGVhZGVyXCIgfSk7XG5cdFx0Y29uc3QgdGl0bGVFbCA9IGNvbHVtbkhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uLXRpdGxlXCIsIGF0dHI6IHsgcm9sZTogXCJidXR0b25cIiB9IH0pO1xuXHRcdHRpdGxlRWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IGNvbHVtbi5uYW1lIH0pO1xuXHRcdHRpdGxlRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDb2x1bW5Nb2RhbCh0aGlzLmFwcCwge1xuXHRcdFx0XHR0aXRsZTogXCJcdTdGMTZcdThGOTFcdTY4MEZcdTc2RUVcIixcblx0XHRcdFx0aW5pdGlhbFZhbHVlOiBjb2x1bW4ubmFtZSxcblx0XHRcdFx0Y29uZmlybVRleHQ6IFwiXHU0RkREXHU1QjU4XCIsXG5cdFx0XHRcdG9uU3VibWl0OiBhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5yZW5hbWVDb2x1bW4oY29sdW1uLmlkLCB2YWx1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBhY3Rpb25zRWwgPSBjb2x1bW5IZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbi1hY3Rpb25zXCIgfSk7XG5cdFx0Y29uc3QgYWRkQnRuID0gYWN0aW9uc0VsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTZERkJcdTUyQTBcdTUzNjFcdTcyNDdcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tc21hbGxcIiB9KTtcblx0XHRhZGRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdHRoaXMucGx1Z2luLnNldEFjdGl2ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGNvbHVtbi5pZCkub3BlbigpO1xuXHRcdH0pO1xuXHRcdGNvbnN0IGRlbGV0ZUJ0biA9IGFjdGlvbnNFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBcIlx1NTIyMFx1OTY2NFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3Qgc2stYnRuLXNtYWxsXCIsXG5cdFx0XHRhdHRyOiB7IFwiYXJpYS1sYWJlbFwiOiBcIlx1NTIyMFx1OTY2NFx1NjgwRlx1NzZFRVwiIH0sXG5cdFx0fSk7XG5cdFx0ZGVsZXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHRuZXcgQ29uZmlybU1vZGFsKHRoaXMuYXBwLCB7XG5cdFx0XHRcdHRpdGxlOiBcIlx1NTIyMFx1OTY2NFx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0XHRtZXNzYWdlOiBgXHU3ODZFXHU1QjlBXHU1MjIwXHU5NjY0XHUzMDBDJHtjb2x1bW4ubmFtZX1cdTMwMERcdTUzQ0FcdTUxNzZcdTYyNDBcdTY3MDlcdTUzNjFcdTcyNDdcdUZGMUZgLFxuXHRcdFx0XHRjb25maXJtVGV4dDogXCJcdTUyMjBcdTk2NjRcIixcblx0XHRcdFx0b25Db25maXJtOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4ucmVtb3ZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjYXJkc0NvbnRhaW5lciA9IGNvbHVtbkVsLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFwic2stY2FyZHNcIixcblx0XHRcdGF0dHI6IHsgXCJkYXRhLWNvbHVtblwiOiBjb2x1bW4uaWQgfSxcblx0XHR9KTtcblx0XHRjb25zdCBmaWx0ZXJXcmFwcGVyID0gYWN0aW9uc0VsLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyBjbHM6IFwic2stZmlsdGVyLXRvZ2dsZVwiIH0pO1xuXHRcdGNvbnN0IGRlYWRsaW5lT25seSA9IHRoaXMuZGVhZGxpbmVGaWx0ZXJzLmdldChjb2x1bW4uaWQpID8/IGZhbHNlO1xuXHRcdGNvbnN0IGZpbHRlckNoZWNrYm94ID0gZmlsdGVyV3JhcHBlci5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0ZmlsdGVyQ2hlY2tib3guY2hlY2tlZCA9IGRlYWRsaW5lT25seTtcblx0XHRmaWx0ZXJDaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcblx0XHRcdHRoaXMuZGVhZGxpbmVGaWx0ZXJzLnNldChjb2x1bW4uaWQsIGZpbHRlckNoZWNrYm94LmNoZWNrZWQpO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0XHRmaWx0ZXJXcmFwcGVyLmNyZWF0ZVNwYW4oeyB0ZXh0OiBcIlx1NEVDNVx1NjIyQVx1NkI2MlwiIH0pO1xuXG5cdFx0Y2FyZHNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0Y29uc3QgYmVmb3JlSWQgPSB0aGlzLmdldEJlZm9yZUNhcmRJZChjYXJkc0NvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY2FyZHNDb250YWluZXIsIGJlZm9yZUlkKTtcblx0XHR9KTtcblx0XHRjYXJkc0NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IGJlZm9yZUlkID1cblx0XHRcdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlPy5jb2x1bW5JZCA9PT0gY29sdW1uLmlkXG5cdFx0XHRcdFx0PyB0aGlzLnBsYWNlaG9sZGVyU3RhdGUuYmVmb3JlSWRcblx0XHRcdFx0XHQ6IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHR2b2lkIHRoaXMuaGFuZGxlRHJvcChjb2x1bW4uaWQsIGJlZm9yZUlkKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGNhcmRzVG9SZW5kZXIgPSB0aGlzLmdldENhcmRzRm9yQ29sdW1uKGNvbHVtbiwgZGVhZGxpbmVPbmx5KTtcblxuXHRcdGlmICghY2FyZHNUb1JlbmRlci5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGVtcHR5VGV4dCA9IGRlYWRsaW5lT25seSA/IFwiXHU2NjgyXHU2NUUwXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXCIgOiBcIlx1RDgzRFx1RENERCBcdTY2ODJcdTY1RTBcdTRFRkJcdTUyQTFcIjtcblx0XHRcdGNvbnN0IGVtcHR5ID0gY2FyZHNDb250YWluZXIuY3JlYXRlRGl2KHsgdGV4dDogZW1wdHlUZXh0LCBjbHM6IFwic2stZW1wdHlcIiB9KTtcblx0XHRcdGVtcHR5LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpZiAoZXZ0LmRhdGFUcmFuc2ZlcikgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJtb3ZlXCI7XG5cdFx0XHRcdGNvbnN0IGJlZm9yZUlkID0gdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY2FyZHNDb250YWluZXIsIGJlZm9yZUlkKTtcblx0XHRcdH0pO1xuXHRcdFx0ZW1wdHkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGV2dCkgPT4ge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0Y29uc3QgYmVmb3JlSWQgPVxuXHRcdFx0XHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZT8uY29sdW1uSWQgPT09IGNvbHVtbi5pZFxuXHRcdFx0XHRcdFx0PyB0aGlzLnBsYWNlaG9sZGVyU3RhdGUuYmVmb3JlSWRcblx0XHRcdFx0XHRcdDogdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdFx0dm9pZCB0aGlzLmhhbmRsZURyb3AoY29sdW1uLmlkLCBiZWZvcmVJZCk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjYXJkc1RvUmVuZGVyLmZvckVhY2goKGNhcmQpID0+IHtcblx0XHRcdHRoaXMucmVuZGVyQ2FyZChjYXJkc0NvbnRhaW5lciwgY29sdW1uLCBjYXJkKTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ2FyZChjb250YWluZXI6IEhUTUxFbGVtZW50LCBjb2x1bW46IEthbmJhbkNvbHVtbiwgY2FyZDogS2FuYmFuQ2FyZCkge1xuXHRcdGNvbnN0IGNhcmRDbGFzc2VzID0gW1wic2stY2FyZFwiXTtcblx0XHRpZiAoY2FyZC5jb21wbGV0ZWQpIGNhcmRDbGFzc2VzLnB1c2goXCJzay1jYXJkLWNvbXBsZXRlZFwiKTtcblx0XHRpZiAoY2FyZC5kZWFkbGluZSkgY2FyZENsYXNzZXMucHVzaChcInNrLWNhcmQtZGVhZGxpbmVcIik7XG5cdFx0Y29uc3QgY2FyZEVsID0gY29udGFpbmVyLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IGNhcmRDbGFzc2VzLmpvaW4oXCIgXCIpLFxuXHRcdFx0YXR0cjogeyBkcmFnZ2FibGU6IFwidHJ1ZVwiLCBcImRhdGEtY2FyZFwiOiBjYXJkLmlkIH0sXG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmRhdGFzZXQuY2FyZElkID0gY2FyZC5pZDtcblxuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldnQpID0+IHtcblx0XHRcdHRoaXMuZHJhZ1N0YXRlID0geyBjYXJkSWQ6IGNhcmQuaWQsIGNvbHVtbklkOiBjb2x1bW4uaWQsIGNhcmRIZWlnaHQ6IGNhcmRFbC5vZmZzZXRIZWlnaHQgfTtcblx0XHRcdGNhcmRFbC5hZGRDbGFzcyhcInNrLWNhcmQtZHJhZ2dpbmdcIik7XG5cdFx0XHRldnQuZGF0YVRyYW5zZmVyPy5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBjYXJkLmlkKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbmRcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcmFnZ2luZ1wiKTtcblx0XHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0Y2FyZEVsLmFkZENsYXNzKFwic2stY2FyZC1kcm9wXCIpO1xuXHRcdFx0Y29uc3QgY29udGFpbmVyID0gY2FyZEVsLnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRjb25zdCBiZWZvcmVJZCA9IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY29udGFpbmVyLCBiZWZvcmVJZCk7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcm9wXCIpO1xuXHRcdH0pO1xuXG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG5cdFx0XHRjb25zdCB0YXJnZXQgPSBldnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0aWYgKHRhcmdldC5jbG9zZXN0KFwiLnNrLWhpc3RvcnktaG9zdFwiKSkgcmV0dXJuO1xuXHRcdFx0dGhpcy5wbHVnaW4uc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0XHRuZXcgQ2FyZE1vZGFsKHRoaXMuYXBwLCB0aGlzLnBsdWdpbiwgY29sdW1uLmlkLCBjYXJkKS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCB0b3BSb3cgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdG9wXCIgfSk7XG5cdFx0Y29uc3QgY2hlY2tib3ggPSB0b3BSb3cuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGNoZWNrYm94LmNoZWNrZWQgPSBjYXJkLmNvbXBsZXRlZDtcblx0XHRjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4udG9nZ2xlQ2FyZENvbXBsZXRpb24oY29sdW1uLmlkLCBjYXJkLmlkLCBjaGVja2JveC5jaGVja2VkKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IHRpdGxlRWwgPSB0b3BSb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdGl0bGVcIiwgdGV4dDogY2FyZC50aXRsZSB9KTtcblx0XHR0aXRsZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnBsdWdpbi5zZXRBY3RpdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRcdG5ldyBDYXJkTW9kYWwodGhpcy5hcHAsIHRoaXMucGx1Z2luLCBjb2x1bW4uaWQsIGNhcmQpLm9wZW4oKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGhpc3RvcnlIb3N0ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LWhvc3RcIiB9KTtcblx0XHRjb25zdCBoaXN0b3J5TWFya2VyID0gaGlzdG9yeUhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhpc3RvcnktbWFya2VyXCIsIHRleHQ6IFwiXHUyM0YxXCIgfSk7XG5cdFx0Y29uc3QgcG9wb3ZlciA9IGhpc3RvcnlIb3N0LmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LXBvcG92ZXJcIiB9KTtcblx0XHRjb25zdCBoaXN0b3J5RW50cmllcyA9IEFycmF5LmlzQXJyYXkoY2FyZC5oaXN0b3J5KSA/IGNhcmQuaGlzdG9yeSA6IFtdO1xuXHRcdGhpc3RvcnlFbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG5cdFx0XHRwb3BvdmVyLmNyZWF0ZURpdih7XG5cdFx0XHRcdGNsczogXCJzay1oaXN0b3J5LWVudHJ5XCIsXG5cdFx0XHRcdHRleHQ6IGAke2Zvcm1hdERhdGUoZW50cnkudGltZXN0YW1wKX0gXHUwMEI3ICR7ZW50cnkucmVtYXJrIHx8IFwiXHU0RkVFXHU2NTM5XCJ9YCxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdGlmICghaGlzdG9yeUVudHJpZXMubGVuZ3RoKSB7XG5cdFx0XHRwb3BvdmVyLmNyZWF0ZURpdih7IHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU1Mzg2XHU1M0YyXCIsIGNsczogXCJzay1oaXN0b3J5LWVudHJ5XCIgfSk7XG5cdFx0fVxuXHRcdGxldCBoaWRlVGltZW91dDogTnVsbGFibGVUaW1lb3V0ID0gbnVsbDtcblx0XHRjb25zdCBjbGVhckhpZGVUaW1lb3V0ID0gKCkgPT4ge1xuXHRcdFx0aWYgKGhpZGVUaW1lb3V0ICE9PSBudWxsKSB7XG5cdFx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoaGlkZVRpbWVvdXQpO1xuXHRcdFx0XHRoaWRlVGltZW91dCA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBzaG93SGlzdG9yeSA9ICgpID0+IHtcblx0XHRcdGNsZWFySGlkZVRpbWVvdXQoKTtcblx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHR9O1xuXHRcdGNvbnN0IHNjaGVkdWxlSGlkZSA9ICgpID0+IHtcblx0XHRcdGNsZWFySGlkZVRpbWVvdXQoKTtcblx0XHRcdGhpZGVUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWhpc3RvcnlIb3N0Lmhhc0NsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIikpIHtcblx0XHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDE1MCk7XG5cdFx0fTtcblx0XHRoaXN0b3J5SG9zdC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93SGlzdG9yeSk7XG5cdFx0aGlzdG9yeUhvc3QuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgc2NoZWR1bGVIaWRlKTtcblx0XHRoaXN0b3J5TWFya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRjbGVhckhpZGVUaW1lb3V0KCk7XG5cdFx0XHRpZiAoaGlzdG9yeUhvc3QuaGFzQ2xhc3MoXCJzay1oaXN0b3J5LXBpbm5lZFwiKSkge1xuXHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpO1xuXHRcdFx0XHRpZiAoIWhpc3RvcnlIb3N0Lm1hdGNoZXMoXCI6aG92ZXJcIikpIHtcblx0XHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIik7XG5cdFx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmIChjYXJkLnRhZ3MubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCB0YWdSb3cgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdGFnc1wiIH0pO1xuXHRcdFx0Y2FyZC50YWdzLmZvckVhY2goKHRhZykgPT4gdGFnUm93LmNyZWF0ZURpdih7IGNsczogXCJzay10YWdcIiwgdGV4dDogdGFnIH0pKTtcblx0XHR9XG5cblx0XHRpZiAoY2FyZC5yZW1hcmspIHtcblx0XHRcdGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC1yZW1hcmtcIiwgdGV4dDogY2FyZC5yZW1hcmsgfSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWV0YSA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC1tZXRhXCIgfSk7XG5cdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NTIxQlx1NUVGQVx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLmNyZWF0ZWRBdCl9YCB9KTtcblx0XHRtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBgXHU2NkY0XHU2NUIwXHVGRjFBJHtmb3JtYXREYXRlKGNhcmQudXBkYXRlZEF0KX1gIH0pO1xuXHRcdGlmIChjYXJkLmRlYWRsaW5lKSB7XG5cdFx0XHRtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBgXHU2MjJBXHU2QjYyXHVGRjFBJHtmb3JtYXREYXRlKGNhcmQuZGVhZGxpbmUpfWAsIGNsczogXCJzay1jYXJkLWRlYWRsaW5lLXRleHRcIiB9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FyZEVsO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVEcm9wKHRhcmdldENvbHVtbklkOiBzdHJpbmcsIGJlZm9yZUNhcmRJZD86IHN0cmluZykge1xuXHRcdGlmICghdGhpcy5kcmFnU3RhdGUpIHJldHVybjtcblx0XHRjb25zdCB7IGNvbHVtbklkLCBjYXJkSWQgfSA9IHRoaXMuZHJhZ1N0YXRlO1xuXHRcdGlmICh0YXJnZXRDb2x1bW5JZCA9PT0gY29sdW1uSWQgJiYgYmVmb3JlQ2FyZElkID09PSBjYXJkSWQpIHtcblx0XHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wbHVnaW4ubW92ZUNhcmQoY2FyZElkLCBjb2x1bW5JZCwgdGFyZ2V0Q29sdW1uSWQsIGJlZm9yZUNhcmRJZCk7XG5cdFx0dGhpcy5yZXNldERyYWdTdGF0ZSgpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRCZWZvcmVDYXJkSWQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY2xpZW50WTogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBjYXJkcyA9IEFycmF5LmZyb20oY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFwiLnNrLWNhcmRcIikpO1xuXHRcdGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuXHRcdFx0Y29uc3QgcmVjdCA9IGNhcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRjb25zdCBtaWRwb2ludCA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyO1xuXHRcdFx0aWYgKGNsaWVudFkgPCBtaWRwb2ludCkge1xuXHRcdFx0XHRjb25zdCBpZCA9IGNhcmQuZGF0YXNldC5jYXJkSWQ7XG5cdFx0XHRcdHJldHVybiBpZCB8fCB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRwcml2YXRlIGdldENhcmRzRm9yQ29sdW1uKGNvbHVtbjogS2FuYmFuQ29sdW1uLCBkZWFkbGluZU9ubHk6IGJvb2xlYW4pOiBLYW5iYW5DYXJkW10ge1xuXHRcdGlmICghZGVhZGxpbmVPbmx5KSB7XG5cdFx0XHRyZXR1cm4gY29sdW1uLmNhcmRzO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uLmNhcmRzXG5cdFx0XHQuZmlsdGVyKChjYXJkKSA9PiAhIWNhcmQuZGVhZGxpbmUpXG5cdFx0XHQuc2xpY2UoKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgYVRpbWUgPSBhLmRlYWRsaW5lID8/IDA7XG5cdFx0XHRcdGNvbnN0IGJUaW1lID0gYi5kZWFkbGluZSA/PyAwO1xuXHRcdFx0XHRyZXR1cm4gYVRpbWUgLSBiVGltZTtcblx0XHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBlbnN1cmVQbGFjZWhvbGRlcigpOiBIVE1MRWxlbWVudCB7XG5cdFx0aWYgKCF0aGlzLnBsYWNlaG9sZGVyRWwpIHtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXJFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyRWwuYWRkQ2xhc3MoXCJzay1jYXJkLXBsYWNlaG9sZGVyXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5wbGFjZWhvbGRlckVsO1xuXHR9XG5cblx0cHJpdmF0ZSBtb3ZlUGxhY2Vob2xkZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgYmVmb3JlSWQ/OiBzdHJpbmcpIHtcblx0XHRpZiAoIXRoaXMuZHJhZ1N0YXRlKSByZXR1cm47XG5cdFx0Y29uc3QgY29sdW1uSWQgPSBjb250YWluZXIuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2x1bW5cIik7XG5cdFx0aWYgKCFjb2x1bW5JZCkgcmV0dXJuO1xuXHRcdGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5lbnN1cmVQbGFjZWhvbGRlcigpO1xuXHRcdGNvbnN0IGRlc2lyZWRIZWlnaHQgPSBNYXRoLm1heCh0aGlzLmRyYWdTdGF0ZS5jYXJkSGVpZ2h0IHx8IDAsIDQ4KTtcblx0XHRwbGFjZWhvbGRlci5zdHlsZS5oZWlnaHQgPSBgJHtkZXNpcmVkSGVpZ2h0fXB4YDtcblx0XHRpZiAocGxhY2Vob2xkZXIucGFyZW50RWxlbWVudCAhPT0gY29udGFpbmVyKSB7XG5cdFx0XHR0aGlzLnJlc3RvcmVQbGFjZWhvbGRlclBhcmVudCgpO1xuXHRcdFx0Y29udGFpbmVyLmFkZENsYXNzKFwic2stY2FyZHMtcGxhY2Vob2xkZXJcIik7XG5cdFx0fVxuXHRcdGNvbnN0IHJlZmVyZW5jZSA9IGJlZm9yZUlkXG5cdFx0XHQ/IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihgLnNrLWNhcmRbZGF0YS1jYXJkLWlkPVwiJHtiZWZvcmVJZH1cIl1gKVxuXHRcdFx0OiBudWxsO1xuXHRcdGlmIChyZWZlcmVuY2UpIHtcblx0XHRcdGNvbnRhaW5lci5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIHJlZmVyZW5jZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG5cdFx0fVxuXHRcdHRoaXMuc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShjb250YWluZXIsIGZhbHNlKTtcblx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGUgPSB7IGNvbHVtbklkLCBiZWZvcmVJZCB9O1xuXHR9XG5cblx0cHJpdmF0ZSByZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKSB7XG5cdFx0aWYgKHRoaXMucGxhY2Vob2xkZXJFbD8ucGFyZW50RWxlbWVudCkge1xuXHRcdFx0Y29uc3QgcGFyZW50ID0gdGhpcy5wbGFjZWhvbGRlckVsLnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRwYXJlbnQucmVtb3ZlQ2xhc3MoXCJzay1jYXJkcy1wbGFjZWhvbGRlclwiKTtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXJFbC5yZW1vdmUoKTtcblx0XHRcdHRoaXMuc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShwYXJlbnQsIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlUGxhY2Vob2xkZXIoKSB7XG5cdFx0dGhpcy5yZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKTtcblx0XHR0aGlzLnBsYWNlaG9sZGVyRWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXRFbXB0eU1lc3NhZ2VWaXNpYmxlKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHZpc2libGU6IGJvb2xlYW4pIHtcblx0XHRjb25zdCBlbXB0eUVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiLnNrLWVtcHR5XCIpO1xuXHRcdGlmIChlbXB0eUVsKSB7XG5cdFx0XHRlbXB0eUVsLnN0eWxlLmRpc3BsYXkgPSB2aXNpYmxlID8gXCJcIiA6IFwibm9uZVwiO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVzZXREcmFnU3RhdGUoKSB7XG5cdFx0dGhpcy5kcmFnU3RhdGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucmVtb3ZlUGxhY2Vob2xkZXIoKTtcblx0XHR0aGlzLmNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNrLWNhcmQtZHJvcFwiKS5mb3JFYWNoKChlbCkgPT4gKGVsIGFzIEhUTUxFbGVtZW50KS5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJvcFwiKSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclN0YXRDYXJkKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHRpdGxlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjYXJkID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0LWNhcmRcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogdGl0bGUsIGNsczogXCJzay1zdGF0LWNhcmQtdGl0bGVcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogdmFsdWUsIGNsczogXCJzay1zdGF0LWNhcmQtdmFsdWVcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogZGVzY3JpcHRpb24sIGNsczogXCJzay1zdGF0LWNhcmQtZGVzY1wiIH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEYWlseUJhckNoYXJ0KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHNlcmllczogRGFpbHlTdGF0c1BvaW50W10pIHtcblx0XHRpZiAoIXNlcmllcy5sZW5ndGgpIHtcblx0XHRcdGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZW1wdHlcIiwgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTY1NzBcdTYzNkVcIiB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3Qgc2Nyb2xsID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1zY3JvbGxcIiB9KTtcblx0XHRjb25zdCBjaGFydCA9IHNjcm9sbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQgc2stY2hhcnQtYmFyc1wiIH0pO1xuXHRcdGNvbnN0IHRvb2x0aXAgPSBjaGFydC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtdG9vbHRpcFwiIH0pO1xuXHRcdGNvbnN0IG1heFZhbHVlID0gTWF0aC5tYXgoXG5cdFx0XHQxLFxuXHRcdFx0Li4uc2VyaWVzLm1hcCgocG9pbnQpID0+IE1hdGgubWF4KHBvaW50LmNyZWF0ZWQsIHBvaW50LmNvbXBsZXRlZCkpLFxuXHRcdCk7XG5cblx0XHRjb25zdCBjb2x1bW5XaWR0aCA9IDM2O1xuXHRcdGNoYXJ0LnN0eWxlLm1pbldpZHRoID0gYCR7c2VyaWVzLmxlbmd0aCAqIGNvbHVtbldpZHRofXB4YDtcblxuXHRcdGNvbnN0IGhpZGVUb29sdGlwID0gKCkgPT4gdG9vbHRpcC5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XG5cblx0XHRzZXJpZXMuZm9yRWFjaCgocG9pbnQpID0+IHtcblx0XHRcdGNvbnN0IGNvbHVtbiA9IGNoYXJ0LmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1jb2xcIiB9KTtcblx0XHRcdGNvbnN0IGJhcnMgPSBjb2x1bW4uY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWNvbC1iYXJzXCIgfSk7XG5cdFx0XHRjb25zdCBjcmVhdGVkQmFyID0gYmFycy5jcmVhdGVEaXYoe1xuXHRcdFx0XHRjbHM6IFwic2stY2hhcnQtYmFyIHNrLWNoYXJ0LWJhci1jcmVhdGVkXCIsXG5cdFx0XHRcdGF0dHI6IHsgc3R5bGU6IGBoZWlnaHQ6JHsocG9pbnQuY3JlYXRlZCAvIG1heFZhbHVlKSAqIDEwMH0lYCB9LFxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBjb21wbGV0ZWRCYXIgPSBiYXJzLmNyZWF0ZURpdih7XG5cdFx0XHRcdGNsczogXCJzay1jaGFydC1iYXIgc2stY2hhcnQtYmFyLWNvbXBsZXRlZFwiLFxuXHRcdFx0XHRhdHRyOiB7IHN0eWxlOiBgaGVpZ2h0OiR7KHBvaW50LmNvbXBsZXRlZCAvIG1heFZhbHVlKSAqIDEwMH0lYCB9LFxuXHRcdFx0fSk7XG5cdFx0XHRjb2x1bW4uY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsXCIsIHRleHQ6IHBvaW50LmRhdGUuc2xpY2UoNSkgfSk7XG5cblx0XHRcdGNvbnN0IHNob3dUb29sdGlwID0gKGV2dDogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRjb25zdCB0YXJnZXQgPSBldnQuY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudDtcblx0XHRcdFx0dG9vbHRpcC5zZXRUZXh0KGAke3BvaW50LmRhdGV9IFx1NjVCMFx1NUVGQSAke3BvaW50LmNyZWF0ZWR9IFx1MDBCNyBcdTVCOENcdTYyMTAgJHtwb2ludC5jb21wbGV0ZWR9YCk7XG5cdFx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXHRcdFx0XHRjb25zdCBib3VuZHMgPSBjaGFydC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0Y29uc3QgeCA9IGV2dC5jbGllbnRYIC0gYm91bmRzLmxlZnQ7XG5cdFx0XHRcdGNvbnN0IHkgPSBldnQuY2xpZW50WSAtIGJvdW5kcy50b3AgLSAyMDtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7eH1weGA7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUudG9wID0gYCR7eX1weGA7XG5cdFx0XHR9O1xuXHRcdFx0W2NyZWF0ZWRCYXIsIGNvbXBsZXRlZEJhciwgY29sdW1uXS5mb3JFYWNoKChlbCkgPT4ge1xuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlVG9vbHRpcCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGxlZ2VuZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtbGVnZW5kXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTY1QjBcdTVFRkFcIiwgXCJ2YXIoLS1jb2xvci1jeWFuLCAjNGVjZGM0KVwiKTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NUI4Q1x1NjIxMFwiLCBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIik7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckxlZ2VuZEl0ZW0oY29udGFpbmVyOiBIVE1MRWxlbWVudCwgbGFiZWw6IHN0cmluZywgY29sb3I6IHN0cmluZykge1xuXHRcdGNvbnN0IGl0ZW0gPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWxlZ2VuZC1pdGVtXCIgfSk7XG5cdFx0Y29uc3QgZG90ID0gaXRlbS5jcmVhdGVEaXYoeyBjbHM6IFwic2stbGVnZW5kLWRvdFwiIH0pO1xuXHRcdChkb3QgYXMgSFRNTERpdkVsZW1lbnQpLnN0eWxlLmJhY2tncm91bmQgPSBjb2xvcjtcblx0XHRpdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiBsYWJlbCB9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGFpbHlSYXRlQ2hhcnQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2VyaWVzOiBEYWlseVJhdGVQb2ludFtdKSB7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gUmVuZGVyaW5nIGRhaWx5IHJhdGUgY2hhcnQgd2l0aFwiLCBzZXJpZXMubGVuZ3RoLCBcInBvaW50c1wiKTtcblx0XHRpZiAoIXNlcmllcy5sZW5ndGgpIHtcblx0XHRcdGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZW1wdHlcIiwgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTVCOENcdTYyMTBcdTczODdcdTY1NzBcdTYzNkVcIiB9KTtcblx0XHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIERhaWx5IHJhdGUgY2hhcnQgaGFzIG5vIGRhdGEuXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1N0YXRzXSBEYWlseSByYXRlIHNhbXBsZXNcIiwgc2VyaWVzKTtcblxuXHRcdGNvbnN0IHNjcm9sbCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtc2Nyb2xsXCIgfSk7XG5cdFx0Y29uc3QgY2hhcnRXcmFwcGVyID0gc2Nyb2xsLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydCBzay1jaGFydC1saW5lXCIgfSk7XG5cdFx0Y29uc3QgbWluQ29sdW1ucyA9IE1hdGgubWF4KHNlcmllcy5sZW5ndGgsIDcpO1xuXHRcdGNvbnN0IHN2Z1dpZHRoID0gbWluQ29sdW1ucyAqIDM2O1xuXHRcdGNvbnN0IGVmZmVjdGl2ZUNvdW50ID0gTWF0aC5tYXgoc2VyaWVzLmxlbmd0aCwgMik7XG5cdFx0Y29uc3QgY29sdW1uV2lkdGggPSAzNjtcblx0XHRjb25zdCB3aWR0aCA9IChlZmZlY3RpdmVDb3VudCAtIDEpICogY29sdW1uV2lkdGg7XG5cdFx0Y29uc3QgbWluV2lkdGggPSBNYXRoLm1heChzZXJpZXMubGVuZ3RoICogY29sdW1uV2lkdGgsIHdpZHRoICsgMjQpO1xuXHRcdGNoYXJ0V3JhcHBlci5zdHlsZS5taW5XaWR0aCA9IGAke21pbldpZHRofXB4YDtcblx0XHRjb25zdCBoZWlnaHQgPSAxNjA7XG5cdFx0Y29uc3QgbGVmdFBhZCA9IDEyO1xuXHRcdGNvbnN0IHJpZ2h0UGFkID0gMTI7XG5cdFx0Y29uc3QgdG90YWxXaWR0aCA9IHdpZHRoICsgbGVmdFBhZCArIHJpZ2h0UGFkO1xuXHRcdGNvbnN0IHN2ZyA9IGNyZWF0ZVN2Z0VsZW1lbnQoXCJzdmdcIikgYXMgU1ZHU1ZHRWxlbWVudDtcblx0XHRzZXRTdmdBdHRycyhzdmcsIHtcblx0XHRcdHZpZXdCb3g6IGAwIDAgJHt0b3RhbFdpZHRofSAke2hlaWdodH1gLFxuXHRcdFx0cHJlc2VydmVBc3BlY3RSYXRpbzogXCJub25lXCIsXG5cdFx0XHR3aWR0aDogU3RyaW5nKHRvdGFsV2lkdGgpLFxuXHRcdFx0aGVpZ2h0OiBTdHJpbmcoaGVpZ2h0KSxcblx0XHR9KTtcblx0XHRjaGFydFdyYXBwZXIuYXBwZW5kQ2hpbGQoc3ZnKTtcblxuXHRcdGNvbnN0IGJhc2VsaW5lID0gY3JlYXRlU3ZnRWxlbWVudChcImxpbmVcIik7XG5cdFx0c2V0U3ZnQXR0cnMoYmFzZWxpbmUsIHtcblx0XHRcdHgxOiBTdHJpbmcobGVmdFBhZCksXG5cdFx0XHR5MTogU3RyaW5nKGhlaWdodCAtIDEpLFxuXHRcdFx0eDI6IFN0cmluZyh0b3RhbFdpZHRoIC0gcmlnaHRQYWQpLFxuXHRcdFx0eTI6IFN0cmluZyhoZWlnaHQgLSAxKSxcblx0XHRcdHN0cm9rZTogXCJ2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcilcIixcblx0XHRcdFwic3Ryb2tlLXdpZHRoXCI6IFwiMVwiLFxuXHRcdH0pO1xuXHRcdHN2Zy5hcHBlbmRDaGlsZChiYXNlbGluZSk7XG5cblx0XHRjb25zdCBwb2ludHNEYXRhID0gc2VyaWVzLm1hcCgocG9pbnQsIGluZGV4KSA9PiB7XG5cdFx0XHRjb25zdCB4ID1cblx0XHRcdFx0c2VyaWVzLmxlbmd0aCA9PT0gMVxuXHRcdFx0XHRcdD8gbGVmdFBhZCArIHdpZHRoIC8gMlxuXHRcdFx0XHRcdDogbGVmdFBhZCArIChpbmRleCAvIChzZXJpZXMubGVuZ3RoIC0gMSB8fCAxKSkgKiB3aWR0aDtcblx0XHRcdGNvbnN0IGNsYW1wZWRSYXRlID0gTWF0aC5taW4oTWF0aC5tYXgocG9pbnQucmF0ZSwgMCksIDEwMCk7XG5cdFx0XHRjb25zdCB5ID0gaGVpZ2h0IC0gKGNsYW1wZWRSYXRlIC8gMTAwKSAqIChoZWlnaHQgLSAyMCkgLSAxMDtcblx0XHRcdHJldHVybiB7IHgsIHksIHJhdGU6IGNsYW1wZWRSYXRlIH07XG5cdFx0fSk7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gRGFpbHkgcmF0ZSBjb29yZGluYXRlc1wiLCBwb2ludHNEYXRhKTtcblx0XHRjb25zdCBwb2ludHMgPSBwb2ludHNEYXRhLm1hcCgocCkgPT4gYCR7cC54fSwke3AueX1gKS5qb2luKFwiIFwiKTtcblx0XHRjb25zdCBwb2x5bGluZSA9IGNyZWF0ZVN2Z0VsZW1lbnQoXCJwb2x5bGluZVwiKTtcblx0XHRzZXRTdmdBdHRycyhwb2x5bGluZSwge1xuXHRcdFx0cG9pbnRzLFxuXHRcdFx0ZmlsbDogXCJub25lXCIsXG5cdFx0XHRzdHJva2U6IFwidmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KVwiLFxuXHRcdFx0XCJzdHJva2Utd2lkdGhcIjogXCIzXCIsXG5cdFx0XHRcInN0cm9rZS1saW5lY2FwXCI6IFwicm91bmRcIixcblx0XHRcdFwic3Ryb2tlLWxpbmVqb2luXCI6IFwicm91bmRcIixcblx0XHR9KTtcblx0XHRzdmcuYXBwZW5kQ2hpbGQocG9seWxpbmUpO1xuXHRcdGNvbnN0IHRvb2x0aXAgPSBjaGFydFdyYXBwZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LXRvb2x0aXBcIiB9KTtcblx0XHRjb25zdCBoaWRlVG9vbHRpcCA9ICgpID0+IHRvb2x0aXAucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50LCBpbmRleCkgPT4ge1xuXHRcdFx0Y29uc3QgZG90WCA9XG5cdFx0XHRcdHNlcmllcy5sZW5ndGggPT09IDFcblx0XHRcdFx0XHQ/IGxlZnRQYWQgKyB3aWR0aCAvIDJcblx0XHRcdFx0XHQ6IGxlZnRQYWQgKyAoaW5kZXggLyAoc2VyaWVzLmxlbmd0aCAtIDEgfHwgMSkpICogd2lkdGg7XG5cdFx0XHRjb25zdCBjbGFtcGVkUmF0ZSA9IE1hdGgubWluKE1hdGgubWF4KHBvaW50LnJhdGUsIDApLCAxMDApO1xuXHRcdFx0Y29uc3QgZG90WSA9IGhlaWdodCAtIChjbGFtcGVkUmF0ZSAvIDEwMCkgKiAoaGVpZ2h0IC0gMjApIC0gMTA7XG5cdFx0XHRjb25zdCBjaXJjbGUgPSBjcmVhdGVTdmdFbGVtZW50KFwiY2lyY2xlXCIpO1xuXHRcdFx0c2V0U3ZnQXR0cnMoY2lyY2xlLCB7XG5cdFx0XHRcdGN4OiBTdHJpbmcoZG90WCksXG5cdFx0XHRcdGN5OiBTdHJpbmcoZG90WSksXG5cdFx0XHRcdHI6IFwiM1wiLFxuXHRcdFx0XHRmaWxsOiBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIixcblx0XHRcdH0pO1xuXHRcdFx0c3ZnLmFwcGVuZENoaWxkKGNpcmNsZSk7XG5cdFx0XHRjb25zdCBzaG93VG9vbHRpcCA9IChldnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3QgYm91bmRzID0gY2hhcnRXcmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRjb25zdCB4ID0gZXZ0LmNsaWVudFggLSBib3VuZHMubGVmdDtcblx0XHRcdFx0Y29uc3QgeSA9IGV2dC5jbGllbnRZIC0gYm91bmRzLnRvcCAtIDIwO1xuXHRcdFx0XHR0b29sdGlwLnNldFRleHQoYCR7cG9pbnQuZGF0ZX0gXHU1QjhDXHU2MjEwXHU3Mzg3ICR7cG9pbnQucmF0ZS50b0ZpeGVkKDEpfSVgKTtcblx0XHRcdFx0dG9vbHRpcC5hZGRDbGFzcyhcInZpc2libGVcIik7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUubGVmdCA9IGAke3h9cHhgO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLnRvcCA9IGAke3l9cHhgO1xuXHRcdFx0fTtcblx0XHRcdGNpcmNsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRjaXJjbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRjaXJjbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGlkZVRvb2x0aXApO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGFiZWxzID0gY2hhcnRXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1sYWJlbC1yb3dcIiB9KSBhcyBIVE1MRGl2RWxlbWVudDtcblx0XHRsYWJlbHMuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGByZXBlYXQoJHtNYXRoLm1heChzZXJpZXMubGVuZ3RoLCAxKX0sIG1pbm1heCgwLCAxZnIpKWA7XG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50KSA9PiB7XG5cdFx0XHRsYWJlbHMuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsXCIsIHRleHQ6IHBvaW50LmRhdGUuc2xpY2UoNSkgfSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRlYWRsaW5lQnJlYWtkb3duKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHN0YXRzOiBTdGF0c1NuYXBzaG90KSB7XG5cdFx0aWYgKCFzdGF0cy5kZWFkbGluZUNvdW50KSB7XG5cdFx0XHRjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU4QkJFXHU3RjZFXHU2MjJBXHU2QjYyXHU2NUY2XHU5NUY0XHU3Njg0XHU0RUZCXHU1MkExXCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGluZm8gPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWRlYWRsaW5lLWluZm9cIiB9KTtcblx0XHRpbmZvLmNyZWF0ZURpdih7IHRleHQ6IGBcdTY3MDlcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcdUZGMUEke3N0YXRzLmRlYWRsaW5lQ291bnR9YCwgY2xzOiBcInNrLWRlYWRsaW5lLWxpbmVcIiB9KTtcblx0XHRpbmZvLmNyZWF0ZURpdih7XG5cdFx0XHR0ZXh0OiBgXHU2MjJBXHU2QjYyXHU4OTg2XHU3NkQ2XHU3Mzg3XHVGRjFBJHtmb3JtYXRQZXJjZW50KHN0YXRzLmRlYWRsaW5lQ292ZXJhZ2UpfWAsXG5cdFx0XHRjbHM6IFwic2stZGVhZGxpbmUtbGluZVwiLFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgcHJvZ3Jlc3MgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXByb2dyZXNzXCIgfSk7XG5cdFx0cHJvZ3Jlc3MuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogXCJzay1wcm9ncmVzcy1vbi10aW1lXCIsXG5cdFx0XHRhdHRyOiB7IHN0eWxlOiBgd2lkdGg6JHtmb3JtYXRQZXJjZW50VmFsdWUoc3RhdHMub25UaW1lUmF0ZSl9JWAgfSxcblx0XHR9KTtcblx0XHRwcm9ncmVzcy5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBcInNrLXByb2dyZXNzLW92ZXJkdWVcIixcblx0XHRcdGF0dHI6IHsgc3R5bGU6IGB3aWR0aDoke2Zvcm1hdFBlcmNlbnRWYWx1ZShzdGF0cy5vdmVyZHVlUmF0ZSl9JWAgfSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IGxlZ2VuZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stcHJvZ3Jlc3MtbGVnZW5kXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTBcIiwgXCJ2YXIoLS1jb2xvci1ncmVlbiwgIzRjYWY1MClcIik7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTVERjIvXHU1QzA2XHU5MDNFXHU2NzFGXCIsIFwidmFyKC0tY29sb3ItcmVkLCAjZmY2YjZiKVwiKTtcblx0fVxuXG5cdHByaXZhdGUgYnVpbGRTdGF0c1NuYXBzaG90KHJhbmdlOiBTdGF0c1JhbmdlKTogU3RhdHNTbmFwc2hvdCB7XG5cdFx0Y29uc3QgYm9hcmQgPSB0aGlzLnBsdWdpbi5nZXRCb2FyZCgpO1xuXHRcdGNvbnN0IGNhcmRzID0gYm9hcmQuY29sdW1ucy5mbGF0TWFwKChjb2wpID0+IGNvbC5jYXJkcyk7XG5cdFx0Y29uc3QgdG90YWxUYXNrcyA9IGNhcmRzLmxlbmd0aDtcblx0XHRjb25zdCBjb21wbGV0ZWRDYXJkcyA9IGNhcmRzLmZpbHRlcigoY2FyZCkgPT4gY2FyZC5jb21wbGV0ZWQpO1xuXHRcdGNvbnN0IGNvbXBsZXRlZFRhc2tzID0gY29tcGxldGVkQ2FyZHMubGVuZ3RoO1xuXHRcdGNvbnN0IHdpcENvdW50ID0gdG90YWxUYXNrcyAtIGNvbXBsZXRlZFRhc2tzO1xuXHRcdGNvbnN0IGNvbXBsZXRpb25SYXRlID0gdG90YWxUYXNrcyA/IGNvbXBsZXRlZFRhc2tzIC8gdG90YWxUYXNrcyA6IDA7XG5cdFx0Y29uc3QgZGVhZGxpbmVDYXJkcyA9IGNhcmRzLmZpbHRlcigoY2FyZCkgPT4gISFjYXJkLmRlYWRsaW5lKTtcblx0XHRjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXHRcdGNvbnN0IG92ZXJkdWVDb3VudCA9IGRlYWRsaW5lQ2FyZHMuZmlsdGVyKChjYXJkKSA9PiB7XG5cdFx0XHRpZiAoIWNhcmQuZGVhZGxpbmUpIHJldHVybiBmYWxzZTtcblx0XHRcdGlmIChjYXJkLmNvbXBsZXRlZCkge1xuXHRcdFx0XHRjb25zdCBkb25lQXQgPSBjYXJkLmNvbXBsZXRlZEF0ID8/IGNhcmQudXBkYXRlZEF0O1xuXHRcdFx0XHRyZXR1cm4gISFkb25lQXQgJiYgZG9uZUF0ID4gY2FyZC5kZWFkbGluZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBub3cgPiBjYXJkLmRlYWRsaW5lO1xuXHRcdH0pLmxlbmd0aDtcblx0XHRjb25zdCBvblRpbWVDb3VudCA9IGRlYWRsaW5lQ2FyZHMuZmlsdGVyKChjYXJkKSA9PiB7XG5cdFx0XHRpZiAoIWNhcmQuZGVhZGxpbmUgfHwgIWNhcmQuY29tcGxldGVkKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRjb25zdCBkb25lQXQgPSBjYXJkLmNvbXBsZXRlZEF0ID8/IGNhcmQudXBkYXRlZEF0O1xuXHRcdFx0cmV0dXJuICEhZG9uZUF0ICYmIGRvbmVBdCA8PSBjYXJkLmRlYWRsaW5lO1xuXHRcdH0pLmxlbmd0aDtcblx0XHRjb25zdCBhdmdDeWNsZVRpbWVNcyA9ICgoKSA9PiB7XG5cdFx0XHRjb25zdCBmaW5pc2hlZCA9IGNvbXBsZXRlZENhcmRzLmZpbHRlcigoY2FyZCkgPT4gY2FyZC5jb21wbGV0ZWRBdCk7XG5cdFx0XHRpZiAoIWZpbmlzaGVkLmxlbmd0aCkgcmV0dXJuIG51bGw7XG5cdFx0XHRjb25zdCB0b3RhbCA9IGZpbmlzaGVkLnJlZHVjZShcblx0XHRcdFx0KHN1bSwgY2FyZCkgPT4gc3VtICsgTWF0aC5tYXgoMCwgKGNhcmQuY29tcGxldGVkQXQhIC0gY2FyZC5jcmVhdGVkQXQpKSxcblx0XHRcdFx0MCxcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gdG90YWwgLyBmaW5pc2hlZC5sZW5ndGg7XG5cdFx0fSkoKTtcblxuXHRcdGNvbnN0IGRhaWx5Q3JlYXRlZCA9IHRoaXMuYnVpbGREYWlseVNlcmllcyhjYXJkcywgXCJjcmVhdGVkXCIsIHJhbmdlKTtcblx0XHRjb25zdCBkYWlseUNvbXBsZXRlZCA9IHRoaXMuYnVpbGREYWlseVNlcmllcyhjYXJkcywgXCJjb21wbGV0ZWRcIiwgcmFuZ2UpO1xuXHRcdGNvbnN0IGRhaWx5U2VyaWVzOiBEYWlseVN0YXRzUG9pbnRbXSA9IGRhaWx5Q3JlYXRlZC5tYXAoKHBvaW50LCBpbmRleCkgPT4gKHtcblx0XHRcdGRhdGU6IHBvaW50LmRhdGUsXG5cdFx0XHRjcmVhdGVkOiBwb2ludC52YWx1ZSxcblx0XHRcdGNvbXBsZXRlZDogZGFpbHlDb21wbGV0ZWRbaW5kZXhdPy52YWx1ZSA/PyAwLFxuXHRcdH0pKTtcblx0XHRjb25zdCBkYWlseVJhdGVzOiBEYWlseVJhdGVQb2ludFtdID0gZGFpbHlTZXJpZXMubWFwKChwb2ludCkgPT4gKHtcblx0XHRcdGRhdGU6IHBvaW50LmRhdGUsXG5cdFx0XHRyYXRlOlxuXHRcdFx0XHRwb2ludC5jcmVhdGVkIHx8IHBvaW50LmNvbXBsZXRlZFxuXHRcdFx0XHRcdD8gTWF0aC5taW4oMTAwLCAocG9pbnQuY29tcGxldGVkIC8gTWF0aC5tYXgocG9pbnQuY3JlYXRlZCwgcG9pbnQuY29tcGxldGVkLCAxKSkgKiAxMDApXG5cdFx0XHRcdFx0OiAwLFxuXHRcdH0pKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3RhbFRhc2tzLFxuXHRcdFx0Y29tcGxldGVkVGFza3MsXG5cdFx0XHR3aXBDb3VudCxcblx0XHRcdGNvbXBsZXRpb25SYXRlLFxuXHRcdFx0ZGVhZGxpbmVDb3VudDogZGVhZGxpbmVDYXJkcy5sZW5ndGgsXG5cdFx0XHRkZWFkbGluZUNvdmVyYWdlOiB0b3RhbFRhc2tzID8gZGVhZGxpbmVDYXJkcy5sZW5ndGggLyB0b3RhbFRhc2tzIDogMCxcblx0XHRcdG92ZXJkdWVDb3VudCxcblx0XHRcdG92ZXJkdWVSYXRlOiBkZWFkbGluZUNhcmRzLmxlbmd0aCA/IG92ZXJkdWVDb3VudCAvIGRlYWRsaW5lQ2FyZHMubGVuZ3RoIDogMCxcblx0XHRcdG9uVGltZVJhdGU6IGRlYWRsaW5lQ2FyZHMubGVuZ3RoID8gb25UaW1lQ291bnQgLyBkZWFkbGluZUNhcmRzLmxlbmd0aCA6IDAsXG5cdFx0XHRhdmdDeWNsZVRpbWVNcyxcblx0XHRcdGRhaWx5U2VyaWVzLFxuXHRcdFx0ZGFpbHlSYXRlcyxcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZERhaWx5U2VyaWVzKGNhcmRzOiBLYW5iYW5DYXJkW10sIGtpbmQ6IFwiY3JlYXRlZFwiIHwgXCJjb21wbGV0ZWRcIiwgcmFuZ2U6IFN0YXRzUmFuZ2UpIHtcblx0XHRjb25zdCBtc1BlckRheSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cdFx0Y29uc3QgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJlc29sdmVSYW5nZShyYW5nZSk7XG5cdFx0Y29uc3QgZGF5cyA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoKGVuZCAtIHN0YXJ0KSAvIG1zUGVyRGF5KSArIDEpO1xuXHRcdGNvbnN0IGJ1Y2tldHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuXHRcdGxldCBwcm9jZXNzZWQgPSAwO1xuXHRcdGxldCBvdXRPZlJhbmdlID0gMDtcblx0XHRsZXQgbWlzc2luZyA9IDA7XG5cblx0XHRmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcblx0XHRcdGNvbnN0IHRpbWVzdGFtcCA9XG5cdFx0XHRcdGtpbmQgPT09IFwiY3JlYXRlZFwiXG5cdFx0XHRcdFx0PyBjYXJkLmNyZWF0ZWRBdFxuXHRcdFx0XHRcdDogY2FyZC5jb21wbGV0ZWRBdCA/PyAoY2FyZC5jb21wbGV0ZWQgPyBjYXJkLnVwZGF0ZWRBdCA6IG51bGwpO1xuXHRcdFx0aWYgKCF0aW1lc3RhbXApIHtcblx0XHRcdFx0bWlzc2luZysrO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmICh0aW1lc3RhbXAgPCBzdGFydCB8fCB0aW1lc3RhbXAgPiBlbmQpIHtcblx0XHRcdFx0b3V0T2ZSYW5nZSsrO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGtleSA9IHRoaXMudG9EYXlLZXkodGltZXN0YW1wKTtcblx0XHRcdGJ1Y2tldHMuc2V0KGtleSwgKGJ1Y2tldHMuZ2V0KGtleSkgPz8gMCkgKyAxKTtcblx0XHRcdHByb2Nlc3NlZCsrO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNlcmllczogRGFpbHlDb3VudFBvaW50W10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGRheXM7IGkrKykge1xuXHRcdFx0Y29uc3QgZGF5VHMgPSBzdGFydCArIGkgKiBtc1BlckRheTtcblx0XHRcdGNvbnN0IGtleSA9IHRoaXMudG9EYXlLZXkoZGF5VHMpO1xuXHRcdFx0c2VyaWVzLnB1c2goeyBkYXRlOiBrZXksIHZhbHVlOiBidWNrZXRzLmdldChrZXkpID8/IDAgfSk7XG5cdFx0fVxuXHRcdGNvbnN0IGxhYmVsID0ga2luZCA9PT0gXCJjcmVhdGVkXCIgPyBcIkNyZWF0ZWRcIiA6IFwiQ29tcGxldGVkXCI7XG5cdFx0Y29uc29sZS5sb2coYFtTaW1wbGVLYW5iYW5dW1N0YXRzXSAke2xhYmVsfSBzZXJpZXMgc3RhdHNgLCB7XG5cdFx0XHRyYW5nZVN0YXJ0OiBuZXcgRGF0ZShzdGFydCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCksXG5cdFx0XHRyYW5nZUVuZDogbmV3IERhdGUoZW5kKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKSxcblx0XHRcdHBvaW50czogc2VyaWVzLmxlbmd0aCxcblx0XHRcdHByb2Nlc3NlZCxcblx0XHRcdG91dE9mUmFuZ2UsXG5cdFx0XHRtaXNzaW5nLFxuXHRcdH0pO1xuXHRcdHJldHVybiBzZXJpZXM7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVSYW5nZShyYW5nZTogU3RhdHNSYW5nZSk6IHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfSB7XG5cdFx0aWYgKHJhbmdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHN0YXJ0OiB0aGlzLnN0YXJ0T2ZEYXkocmFuZ2Uuc3RhcnQpLFxuXHRcdFx0XHRlbmQ6IHRoaXMuc3RhcnRPZkRheShyYW5nZS5lbmQpLFxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3QgbXNQZXJEYXkgPSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdGNvbnN0IGVuZCA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRjb25zdCBzdGFydCA9IGVuZCAtIChyYW5nZS5kYXlzIC0gMSkgKiBtc1BlckRheTtcblx0XHRyZXR1cm4geyBzdGFydCwgZW5kIH07XG5cdH1cblxuXHRwcml2YXRlIHRvRGF5S2V5KHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0XHRjb25zdCB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXHRcdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRcdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0XHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9YDtcblx0fVxuXG5cdHByaXZhdGUgc3RhcnRPZkRheSh0aW1lc3RhbXA6IG51bWJlcik6IG51bWJlciB7XG5cdFx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdFx0ZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcblx0XHRyZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVUaW1lbGluZVJhbmdlKCk6IHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfSB7XG5cdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgPT09IFwiY3VzdG9tXCIgJiYgdGhpcy50aW1lbGluZUN1c3RvbSkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGltZWxpbmVDdXN0b207XG5cdFx0fVxuXHRcdGlmICh0aGlzLnRpbWVsaW5lUHJlc2V0ID09PSBcInllc3RlcmRheVwiKSB7XG5cdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdGNvbnN0IHllc3RlcmRheSA9IHRvZGF5IC0gMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRcdHJldHVybiB7IHN0YXJ0OiB5ZXN0ZXJkYXksIGVuZDogeWVzdGVyZGF5IH07XG5cdFx0fVxuXHRcdGNvbnN0IHRvZGF5ID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdHJldHVybiB7IHN0YXJ0OiB0b2RheSwgZW5kOiB0b2RheSB9O1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZFRpbWVsaW5lRW50cmllcyhzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IFRpbWVsaW5lRW50cnlbXSB7XG5cdFx0Y29uc3QgYm9hcmQgPSB0aGlzLnBsdWdpbi5nZXRCb2FyZCgpO1xuXHRcdGNvbnN0IGVudHJpZXM6IFRpbWVsaW5lRW50cnlbXSA9IFtdO1xuXHRcdGNvbnN0IHN0YXJ0VHMgPSB0aGlzLnN0YXJ0T2ZEYXkoc3RhcnQpO1xuXHRcdGNvbnN0IGVuZFRzID0gdGhpcy5zdGFydE9mRGF5KGVuZCkgKyAyNCAqIDYwICogNjAgKiAxMDAwIC0gMTtcblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiBib2FyZC5jb2x1bW5zKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNhcmQgb2YgY29sdW1uLmNhcmRzKSB7XG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpKSBjb250aW51ZTtcblx0XHRcdFx0Zm9yIChjb25zdCBpdGVtIG9mIGNhcmQuaGlzdG9yeSkge1xuXHRcdFx0XHRcdGlmICghaXRlbS50aW1lc3RhbXApIGNvbnRpbnVlO1xuXHRcdFx0XHRcdGlmIChpdGVtLnRpbWVzdGFtcCA8IHN0YXJ0VHMgfHwgaXRlbS50aW1lc3RhbXAgPiBlbmRUcykgY29udGludWU7XG5cdFx0XHRcdFx0ZW50cmllcy5wdXNoKHtcblx0XHRcdFx0XHRcdGNhcmRJZDogY2FyZC5pZCxcblx0XHRcdFx0XHRcdGNhcmRUaXRsZTogY2FyZC50aXRsZSxcblx0XHRcdFx0XHRcdGNvbHVtbk5hbWU6IGNvbHVtbi5uYW1lLFxuXHRcdFx0XHRcdFx0dGltZXN0YW1wOiBpdGVtLnRpbWVzdGFtcCxcblx0XHRcdFx0XHRcdHRleHQ6IGl0ZW0ucmVtYXJrIHx8IFwiXHU2NkY0XHU2NUIwXCIsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGVudHJpZXMuc29ydCgoYSwgYikgPT4gYS50aW1lc3RhbXAgLSBiLnRpbWVzdGFtcCk7XG5cdH1cbn1cblxuY2xhc3MgQ2FyZE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwcml2YXRlIHRpdGxlVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIHRhZ3NWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgcmVtYXJrVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIGhpc3RvcnlOb3RlID0gXCJcIjtcblx0cHJpdmF0ZSBkZWFkbGluZVZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSBzdWJtaXR0aW5nID0gZmFsc2U7XG5cdHByaXZhdGUga2V5SGFuZGxlciA9IChldnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRpZiAoXG5cdFx0XHRldnQua2V5ID09PSBcIkVudGVyXCIgJiZcblx0XHRcdCFldnQuc2hpZnRLZXkgJiZcblx0XHRcdCFldnQubWV0YUtleSAmJlxuXHRcdFx0IWV2dC5jdHJsS2V5ICYmXG5cdFx0XHQhZXZ0LmFsdEtleSAmJlxuXHRcdFx0IWV2dC5pc0NvbXBvc2luZ1xuXHRcdCkge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR2b2lkIHRoaXMuaGFuZGxlU3VibWl0KCk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGFwcDogQXBwLFxuXHRcdHByaXZhdGUgcGx1Z2luOiBTaW1wbGVLYW5iYW5QbHVnaW4sXG5cdFx0cHJpdmF0ZSBjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHByaXZhdGUgY2FyZD86IEthbmJhbkNhcmQsXG5cdCkge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy5wbHVnaW4uc2V0QWN0aXZlQ29sdW1uKGNvbHVtbklkKTtcblx0XHRpZiAoY2FyZCkge1xuXHRcdFx0dGhpcy50aXRsZVZhbHVlID0gY2FyZC50aXRsZTtcblx0XHRcdHRoaXMudGFnc1ZhbHVlID0gY2FyZC50YWdzLmpvaW4oXCIsIFwiKTtcblx0XHRcdHRoaXMucmVtYXJrVmFsdWUgPSBjYXJkLnJlbWFyaztcblx0XHRcdHRoaXMuZGVhZGxpbmVWYWx1ZSA9IGZvcm1hdERhdGVUaW1lSW5wdXQoY2FyZC5kZWFkbGluZSk7XG5cdFx0fVxuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleUhhbmRsZXIpO1xuXG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLmNhcmQgPyBcIlx1N0YxNlx1OEY5MVx1NTM2MVx1NzI0N1wiIDogXCJcdTY1QjBcdTU4OUVcdTUzNjFcdTcyNDdcIiB9KTtcblxuXHRcdHRoaXMudGl0bGVWYWx1ZSA9IHRoaXMudGl0bGVWYWx1ZSB8fCBcIlwiO1xuXHRcdGNyZWF0ZVRleHRGaWVsZChjb250ZW50RWwsIFwiXHU2ODA3XHU5ODk4XCIsIHRoaXMudGl0bGVWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLnRpdGxlVmFsdWUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdGNyZWF0ZVRleHRGaWVsZChjb250ZW50RWwsIFwiXHU2ODA3XHU3QjdFXHVGRjA4XHU5MDE3XHU1M0Y3XHU1MjA2XHU5Njk0XHVGRjA5XCIsIHRoaXMudGFnc1ZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMudGFnc1ZhbHVlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRcdGNyZWF0ZVRleHRBcmVhKGNvbnRlbnRFbCwgXCJcdTU5MDdcdTZDRThcIiwgdGhpcy5yZW1hcmtWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdHRoaXMucmVtYXJrVmFsdWUgPSB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRjcmVhdGVEYXRlVGltZUZpZWxkKGNvbnRlbnRFbCwgXCJcdTYyMkFcdTZCNjJcdTY1RjZcdTk1RjRcIiwgdGhpcy5kZWFkbGluZVZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdFx0dGhpcy5kZWFkbGluZVZhbHVlID0gdmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdGNyZWF0ZVRleHRBcmVhKGNvbnRlbnRFbCwgXCJcdTRGRUVcdTY1MzlcdThCRjRcdTY2MEVcdUZGMDhcdTUxOTlcdTUxNjVcdTUzODZcdTUzRjJcdUZGMDlcIiwgXCJcIiwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLmhpc3RvcnlOb3RlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU1M0Q2XHU2RDg4XCIsIGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIgfSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3Qgc3VibWl0QnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMuY2FyZCA/IFwiXHU0RkREXHU1QjU4XCIgOiBcIlx1NTIxQlx1NUVGQVwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdm9pZCB0aGlzLmhhbmRsZVN1Ym1pdCgpKTtcblx0fVxuXG5cdG9uQ2xvc2UoKSB7XG5cdFx0dGhpcy5jb250ZW50RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlIYW5kbGVyKTtcblx0XHRzdXBlci5vbkNsb3NlKCk7XG5cdH1cblxuXHRhc3luYyBoYW5kbGVTdWJtaXQoKSB7XG5cdFx0aWYgKHRoaXMuc3VibWl0dGluZykgcmV0dXJuO1xuXHRcdGlmICghdGhpcy50aXRsZVZhbHVlLnRyaW0oKSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjgwN1x1OTg5OFx1NEUwRFx1ODBGRFx1NEUzQVx1N0E3QVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5zdWJtaXR0aW5nID0gdHJ1ZTtcblx0XHRjb25zdCB0YWdzID0gcGFyc2VUYWdzKHRoaXMudGFnc1ZhbHVlKTtcblx0XHRjb25zdCByZW1hcmsgPSB0aGlzLnJlbWFya1ZhbHVlLnRyaW0oKTtcblx0XHRjb25zdCBkZWFkbGluZSA9IHBhcnNlRGF0ZVRpbWVJbnB1dCh0aGlzLmRlYWRsaW5lVmFsdWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5jYXJkKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnVwZGF0ZUNhcmQoXG5cdFx0XHRcdFx0dGhpcy5jb2x1bW5JZCxcblx0XHRcdFx0XHR0aGlzLmNhcmQuaWQsXG5cdFx0XHRcdFx0eyB0aXRsZTogdGhpcy50aXRsZVZhbHVlLCB0YWdzLCByZW1hcmssIGRlYWRsaW5lIH0sXG5cdFx0XHRcdFx0dGhpcy5oaXN0b3J5Tm90ZS50cmltKCkgfHwgXCJcdTUxODVcdTVCQjlcdTY2RjRcdTY1QjBcIixcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLmFkZENhcmQodGhpcy5jb2x1bW5JZCwge1xuXHRcdFx0XHRcdHRpdGxlOiB0aGlzLnRpdGxlVmFsdWUsXG5cdFx0XHRcdFx0dGFncyxcblx0XHRcdFx0XHRyZW1hcmssXG5cdFx0XHRcdFx0aGlzdG9yeU5vdGU6IHRoaXMuaGlzdG9yeU5vdGUudHJpbSgpIHx8IFwiXHU1MjFCXHU1RUZBXCIsXG5cdFx0XHRcdFx0ZGVhZGxpbmUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLnN1Ym1pdHRpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn1cblxuaW50ZXJmYWNlIENvbHVtbk1vZGFsT3B0aW9ucyB7XG5cdHRpdGxlOiBzdHJpbmc7XG5cdGluaXRpYWxWYWx1ZT86IHN0cmluZztcblx0Y29uZmlybVRleHQ/OiBzdHJpbmc7XG5cdG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbn1cblxuY2xhc3MgQ29sdW1uTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHByaXZhdGUgdmFsdWU6IHN0cmluZztcblxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvcHRpb25zOiBDb2x1bW5Nb2RhbE9wdGlvbnMpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMudmFsdWUgPSBvcHRpb25zLmluaXRpYWxWYWx1ZSA/PyBcIlwiO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy5vcHRpb25zLnRpdGxlIH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MEZcdTc2RUVcdTU0MERcdTc5RjBcIiwgdGhpcy52YWx1ZSwgKHZhbHVlKSA9PiAodGhpcy52YWx1ZSA9IHZhbHVlKSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU1M0Q2XHU2RDg4XCIsIGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIgfSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3QgY29uZmlybUJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY29uZmlybVRleHQgfHwgXCJcdTc4NkVcdThCQTRcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRhd2FpdCB0aGlzLm9wdGlvbnMub25TdWJtaXQodGhpcy52YWx1ZSk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH1cbn1cblxuaW50ZXJmYWNlIENvbmZpcm1Nb2RhbE9wdGlvbnMge1xuXHR0aXRsZTogc3RyaW5nO1xuXHRtZXNzYWdlOiBzdHJpbmc7XG5cdGNvbmZpcm1UZXh0Pzogc3RyaW5nO1xuXHRjYW5jZWxUZXh0Pzogc3RyaW5nO1xuXHRvbkNvbmZpcm06ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuXG5jbGFzcyBDb25maXJtTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9wdGlvbnM6IENvbmZpcm1Nb2RhbE9wdGlvbnMpIHtcblx0XHRzdXBlcihhcHApO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy5vcHRpb25zLnRpdGxlIH0pO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVEaXYoeyB0ZXh0OiB0aGlzLm9wdGlvbnMubWVzc2FnZSwgY2xzOiBcInNrLWNvbmZpcm0tdGV4dFwiIH0pO1xuXG5cdFx0Y29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1tb2RhbC1mb290ZXJcIiB9KTtcblx0XHRjb25zdCBjYW5jZWxCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogdGhpcy5vcHRpb25zLmNhbmNlbFRleHQgfHwgXCJcdTUzRDZcdTZEODhcIixcblx0XHRcdGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIsXG5cdFx0fSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3QgY29uZmlybUJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY29uZmlybVRleHQgfHwgXCJcdTc4NkVcdThCQTRcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRhd2FpdCB0aGlzLm9wdGlvbnMub25Db25maXJtKCk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUYWdzKGlucHV0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdHJldHVybiBpbnB1dFxuXHRcdC5zcGxpdChcIixcIilcblx0XHQubWFwKCh0YWcpID0+IHRhZy50cmltKCkpXG5cdFx0LmZpbHRlcigodGFnKSA9PiAhIXRhZyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0ZVRpbWVJbnB1dCh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG5cdGlmICghdmFsdWUudHJpbSgpKSByZXR1cm4gbnVsbDtcblx0Y29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG5cdHJldHVybiBOdW1iZXIuaXNOYU4ocGFyc2VkKSA/IG51bGwgOiBwYXJzZWQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVUaW1lSW5wdXQodmFsdWU/OiBudW1iZXIgfCBudWxsKTogc3RyaW5nIHtcblx0aWYgKCF2YWx1ZSkgcmV0dXJuIFwiXCI7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG5cdGNvbnN0IHl5eXkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG1tID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgZGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgaGggPSBTdHJpbmcoZGF0ZS5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IG1pbiA9IFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eXl5eX0tJHttbX0tJHtkZH1UJHtoaH06JHttaW59YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSWQoKSB7XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSArIERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGhoID0gU3RyaW5nKGRhdGUuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBtbSA9IFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9ICR7aGh9OiR7bW19YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VGltZSh0aW1lc3RhbXA6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRjb25zdCBoaCA9IFN0cmluZyhkYXRlLmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgbW0gPSBTdHJpbmcoZGF0ZS5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke2hofToke21tfWA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVPbmx5KHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5fS0ke219LSR7ZH1gO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQZXJjZW50KHZhbHVlOiBudW1iZXIsIGRpZ2l0cyA9IDApOiBzdHJpbmcge1xuXHRpZiAoIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiBcIjAlXCI7XG5cdHJldHVybiBgJHsoTWF0aC5tYXgoMCwgdmFsdWUpICogMTAwKS50b0ZpeGVkKGRpZ2l0cyl9JWA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFBlcmNlbnRWYWx1ZSh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcblx0aWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gMDtcblx0cmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgdmFsdWUgKiAxMDApKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RHVyYXRpb24obXM6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKG1zIC8gNjAwMDApO1xuXHRjb25zdCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcblx0Y29uc3QgZGF5cyA9IE1hdGguZmxvb3IoaG91cnMgLyAyNCk7XG5cdGlmIChkYXlzID4gMCkge1xuXHRcdGNvbnN0IHJlbUhvdXJzID0gaG91cnMgJSAyNDtcblx0XHRyZXR1cm4gcmVtSG91cnMgPyBgJHtkYXlzfVx1NTkyOSR7cmVtSG91cnN9XHU1QzBGXHU2NUY2YCA6IGAke2RheXN9XHU1OTI5YDtcblx0fVxuXHRpZiAoaG91cnMgPiAwKSB7XG5cdFx0Y29uc3QgcmVtTWludXRlcyA9IG1pbnV0ZXMgJSA2MDtcblx0XHRyZXR1cm4gcmVtTWludXRlcyA/IGAke2hvdXJzfVx1NUMwRlx1NjVGNiR7cmVtTWludXRlc31cdTUyMDZgIDogYCR7aG91cnN9XHU1QzBGXHU2NUY2YDtcblx0fVxuXHRyZXR1cm4gYCR7TWF0aC5tYXgobWludXRlcywgMSl9XHU1MjA2YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke3l9LSR7bX0tJHtkfWA7XG59XG5cbmNvbnN0IFNWR19OUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcblxuZnVuY3Rpb24gY3JlYXRlU3ZnRWxlbWVudDxUIGV4dGVuZHMga2V5b2YgU1ZHRWxlbWVudFRhZ05hbWVNYXA+KHRhZzogVCk6IFNWR0VsZW1lbnRUYWdOYW1lTWFwW1RdIHtcblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIHRhZyk7XG59XG5cbmZ1bmN0aW9uIHNldFN2Z0F0dHJzKGVsOiBFbGVtZW50LCBhdHRyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuXHRPYmplY3QuZW50cmllcyhhdHRycykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiBlbC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0RmllbGQoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgaW5wdXQgPSB3cmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiB9KTtcblx0aW5wdXQudmFsdWUgPSB2YWx1ZTtcblx0aW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGVUaW1lRmllbGQoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgaW5wdXQgPSB3cmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGV0aW1lLWxvY2FsXCIgfSk7XG5cdGlucHV0LnZhbHVlID0gdmFsdWU7XG5cdGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZ0KSA9PiBvbkNoYW5nZSgoZXZ0LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0QXJlYShcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0bGFiZWw6IHN0cmluZyxcblx0dmFsdWU6IHN0cmluZyxcblx0b25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG5cdGNvbnN0IHdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWZpZWxkXCIgfSk7XG5cdHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IHRleHQ6IGxhYmVsIH0pO1xuXHRjb25zdCB0ZXh0YXJlYSA9IHdyYXBwZXIuY3JlYXRlRWwoXCJ0ZXh0YXJlYVwiKTtcblx0dGV4dGFyZWEudmFsdWUgPSB2YWx1ZTtcblx0dGV4dGFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQpLnZhbHVlKSk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFBb0U7QUFFcEUsSUFBTSxZQUFZO0FBQ2xCLElBQU0sVUFBVTtBQTJFaEIsSUFBTSxrQkFBa0IsQ0FBQyxzQkFBTyxzQkFBTyxvQkFBSztBQUc1QyxTQUFTLHFCQUFzQztBQUM5QyxTQUFPO0FBQUEsSUFDTixTQUFTLGdCQUFnQixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQ3ZDLElBQUksU0FBUztBQUFBLE1BQ2I7QUFBQSxNQUNBLE9BQU8sQ0FBQztBQUFBLElBQ1QsRUFBRTtBQUFBLEVBQ0g7QUFDRDtBQUVBLElBQXFCLHFCQUFyQixjQUFnRCx1QkFBTztBQUFBLEVBQXZEO0FBQUE7QUFDQyxTQUFRLFFBQXlCLG1CQUFtQjtBQUNwRCxTQUFRLFFBQVEsb0JBQUksSUFBZ0I7QUFBQTtBQUFBLEVBR3BDLE1BQU0sU0FBUztBQUNkLFVBQU0sS0FBSyxVQUFVO0FBRXJCLFNBQUssYUFBYSxXQUFXLENBQUMsU0FBUztBQUN0QyxZQUFNLE9BQU8sSUFBSSxXQUFXLE1BQU0sSUFBSTtBQUN0QyxXQUFLLG1CQUFtQixJQUFJO0FBQzVCLGFBQU87QUFBQSxJQUNSLENBQUM7QUFFRCxTQUFLLGNBQWMsU0FBUyx3Q0FBVSxNQUFNLEtBQUssYUFBYSxDQUFDO0FBQy9ELFNBQUssV0FBVztBQUFBLE1BQ2YsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04s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
