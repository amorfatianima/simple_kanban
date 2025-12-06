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
    this.boardSearch = "";
    this.timelineSearch = "";
    this.lastFocusedSearchTab = null;
    this.isBoardComposing = false;
    this.isTimelineComposing = false;
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
  restoreSearchFocus(tab, input) {
    if (this.lastFocusedSearchTab !== tab)
      return;
    const selection = this.lastSearchSelection;
    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      if (selection) {
        input.setSelectionRange(selection.start, selection.end);
      }
    });
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
    const searchValue = this.boardSearch;
    const filteredColumns = board.columns.map((col) => ({
      ...col,
      cards: this.filterCards(col.cards, searchValue)
    }));
    const totalCards = filteredColumns.reduce((sum, col) => sum + col.cards.length, 0);
    const header = body.createDiv({ cls: "sk-header" });
    header.createEl("h2", { text: `\u4FA7\u8FB9\u770B\u677F\uFF08${totalCards}\uFF09` });
    const searchBox = header.createDiv({ cls: "sk-search" });
    const searchInput = searchBox.createEl("input", {
      type: "search",
      placeholder: "\u641C\u7D22\u6807\u9898/\u5907\u6CE8/\u6807\u7B7E/\u5386\u53F2\u2026",
      value: searchValue
    });
    searchInput.addEventListener("compositionstart", () => {
      this.isBoardComposing = true;
    });
    searchInput.addEventListener("compositionend", () => {
      this.isBoardComposing = false;
      this.boardSearch = searchInput.value;
      this.lastFocusedSearchTab = "board";
      this.lastSearchSelection = {
        start: searchInput.selectionStart ?? searchInput.value.length,
        end: searchInput.selectionEnd ?? searchInput.value.length
      };
      this.render();
    });
    searchInput.addEventListener("input", () => {
      this.boardSearch = searchInput.value;
      if (this.isBoardComposing)
        return;
      this.lastFocusedSearchTab = "board";
      this.lastSearchSelection = {
        start: searchInput.selectionStart ?? searchInput.value.length,
        end: searchInput.selectionEnd ?? searchInput.value.length
      };
      this.render();
    });
    this.restoreSearchFocus("board", searchInput);
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
    for (const column of filteredColumns) {
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
    const searchValue = this.timelineSearch;
    const entries = this.buildTimelineEntries(start, end).filter(
      (entry) => this.matchesSearchText(
        searchValue,
        [entry.cardTitle, entry.text].join(" ")
      )
    );
    const header = body.createDiv({ cls: "sk-header" });
    header.createEl("h2", { text: `\u65F6\u95F4\u8F74\uFF08${entries.length}\uFF09` });
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
    const searchBox = header.createDiv({ cls: "sk-search" });
    const searchInput = searchBox.createEl("input", {
      type: "search",
      placeholder: "\u641C\u7D22\u6807\u9898/\u5185\u5BB9",
      value: searchValue
    });
    searchInput.addEventListener("compositionstart", () => {
      this.isTimelineComposing = true;
    });
    searchInput.addEventListener("compositionend", () => {
      this.isTimelineComposing = false;
      this.timelineSearch = searchInput.value;
      this.lastFocusedSearchTab = "timeline";
      this.lastSearchSelection = {
        start: searchInput.selectionStart ?? searchInput.value.length,
        end: searchInput.selectionEnd ?? searchInput.value.length
      };
      this.render();
    });
    searchInput.addEventListener("input", () => {
      this.timelineSearch = searchInput.value;
      if (this.isTimelineComposing)
        return;
      this.lastFocusedSearchTab = "timeline";
      this.lastSearchSelection = {
        start: searchInput.selectionStart ?? searchInput.value.length,
        end: searchInput.selectionEnd ?? searchInput.value.length
      };
      this.render();
    });
    this.restoreSearchFocus("timeline", searchInput);
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
  filterCards(cards, search) {
    if (!search.trim())
      return cards;
    return cards.filter((card) => {
      const text = [
        card.title,
        card.remark,
        card.tags.join(" "),
        ...Array.isArray(card.history) ? card.history.map((h) => h.remark || "").filter(Boolean) : []
      ].join(" ");
      return this.matchesSearchText(search, text);
    });
  }
  matchesSearchText(search, text) {
    if (!search.trim())
      return true;
    return text.toLowerCase().includes(search.toLowerCase());
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgSXRlbVZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgV29ya3NwYWNlTGVhZiwgYWRkSWNvbiB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5jb25zdCBWSUVXX1RZUEUgPSBcInNpbXBsZS1rYW5iYW4tc2lkZWJhci12aWV3XCI7XG5jb25zdCBJQ09OX0lEID0gXCJzaW1wbGUta2FuYmFuLWVtb2ppXCI7XG5cbmludGVyZmFjZSBLYW5iYW5IaXN0b3J5RW50cnkge1xuXHR0aW1lc3RhbXA6IG51bWJlcjtcblx0cmVtYXJrOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBLYW5iYW5DYXJkIHtcblx0aWQ6IHN0cmluZztcblx0dGl0bGU6IHN0cmluZztcblx0dGFnczogc3RyaW5nW107XG5cdHJlbWFyazogc3RyaW5nO1xuXHRkZWFkbGluZT86IG51bWJlciB8IG51bGw7XG5cdGNvbXBsZXRlZDogYm9vbGVhbjtcblx0Y29tcGxldGVkQXQ/OiBudW1iZXIgfCBudWxsO1xuXHRjcmVhdGVkQXQ6IG51bWJlcjtcblx0dXBkYXRlZEF0OiBudW1iZXI7XG5cdGhpc3Rvcnk6IEthbmJhbkhpc3RvcnlFbnRyeVtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQ29sdW1uIHtcblx0aWQ6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRjYXJkczogS2FuYmFuQ2FyZFtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQm9hcmREYXRhIHtcblx0Y29sdW1uczogS2FuYmFuQ29sdW1uW107XG59XG5cbmludGVyZmFjZSBEYWlseUNvdW50UG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdHZhbHVlOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVN0YXRzUG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdGNyZWF0ZWQ6IG51bWJlcjtcblx0Y29tcGxldGVkOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVJhdGVQb2ludCB7XG5cdGRhdGU6IHN0cmluZztcblx0cmF0ZTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgU3RhdHNTbmFwc2hvdCB7XG5cdHRvdGFsVGFza3M6IG51bWJlcjtcblx0Y29tcGxldGVkVGFza3M6IG51bWJlcjtcblx0d2lwQ291bnQ6IG51bWJlcjtcblx0Y29tcGxldGlvblJhdGU6IG51bWJlcjtcblx0ZGVhZGxpbmVDb3VudDogbnVtYmVyO1xuXHRkZWFkbGluZUNvdmVyYWdlOiBudW1iZXI7XG5cdG92ZXJkdWVDb3VudDogbnVtYmVyO1xuXHRvdmVyZHVlUmF0ZTogbnVtYmVyO1xuXHRvblRpbWVSYXRlOiBudW1iZXI7XG5cdGF2Z0N5Y2xlVGltZU1zOiBudW1iZXIgfCBudWxsO1xuXHRkYWlseVNlcmllczogRGFpbHlTdGF0c1BvaW50W107XG5cdGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W107XG59XG5cbnR5cGUgU3RhdHNSYW5nZSA9XG5cdHwgeyB0eXBlOiBcInByZXNldFwiOyBkYXlzOiBudW1iZXIgfVxuXHR8IHsgdHlwZTogXCJjdXN0b21cIjsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfTtcblxudHlwZSBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiIHwgXCJ5ZXN0ZXJkYXlcIiB8IFwiY3VzdG9tXCI7XG5cbmludGVyZmFjZSBUaW1lbGluZUVudHJ5IHtcblx0Y2FyZElkOiBzdHJpbmc7XG5cdGNhcmRUaXRsZTogc3RyaW5nO1xuXHRjb2x1bW5OYW1lOiBzdHJpbmc7XG5cdHRpbWVzdGFtcDogbnVtYmVyO1xuXHR0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IERFRkFVTFRfQ09MVU1OUyA9IFtcIlx1NUY4NVx1NTkwNFx1NzQwNlwiLCBcIlx1OEZEQlx1ODg0Q1x1NEUyRFwiLCBcIlx1NURGMlx1NUI4Q1x1NjIxMFwiXTtcbnR5cGUgTnVsbGFibGVUaW1lb3V0ID0gbnVtYmVyIHwgbnVsbDtcblxuZnVuY3Rpb24gY3JlYXRlRGVmYXVsdEJvYXJkKCk6IEthbmJhbkJvYXJkRGF0YSB7XG5cdHJldHVybiB7XG5cdFx0Y29sdW1uczogREVGQVVMVF9DT0xVTU5TLm1hcCgobmFtZSkgPT4gKHtcblx0XHRcdGlkOiBjcmVhdGVJZCgpLFxuXHRcdFx0bmFtZSxcblx0XHRcdGNhcmRzOiBbXSxcblx0XHR9KSksXG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZUthbmJhblBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHByaXZhdGUgYm9hcmQ6IEthbmJhbkJvYXJkRGF0YSA9IGNyZWF0ZURlZmF1bHRCb2FyZCgpO1xuXHRwcml2YXRlIHZpZXdzID0gbmV3IFNldDxLYW5iYW5WaWV3PigpO1xuXHRwcml2YXRlIGxhc3RDb2x1bW5JZD86IHN0cmluZztcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkQm9hcmQoKTtcblxuXHRcdGFkZEljb24oXG5cdFx0XHRJQ09OX0lELFxuXHRcdFx0YDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj48dGV4dCB4PVwiMTJcIiB5PVwiMjBcIiBmb250LXNpemU9XCIyMFwiIHRleHQtYW5jaG9yPVwibWlkZGxlXCI+XHVEODNEXHVEQzJGPC90ZXh0Pjwvc3ZnPmAsXG5cdFx0KTtcblxuXHRcdHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRSwgKGxlYWYpID0+IHtcblx0XHRcdGNvbnN0IHZpZXcgPSBuZXcgS2FuYmFuVmlldyhsZWFmLCB0aGlzKTtcblx0XHRcdHRoaXMucmVnaXN0ZXJLYW5iYW5WaWV3KHZpZXcpO1xuXHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZFJpYmJvbkljb24oSUNPTl9JRCwgXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIiwgKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcInNpbXBsZS1rYW5iYW4tb3BlblwiLFxuXHRcdFx0bmFtZTogXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIixcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuXHRcdH0pO1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogXCJzaW1wbGUta2FuYmFuLWFkZC1jYXJkXCIsXG5cdFx0XHRuYW1lOiBcIlx1NkRGQlx1NTJBMFx1NTM2MVx1NzI0N1wiLFxuXHRcdFx0aG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJNb2RcIiwgXCJTaGlmdFwiXSwga2V5OiBcIk5cIiB9XSxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLm9wZW5RdWlja0FkZENhcmQoKSxcblx0XHR9KTtcblxuXHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCkpO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0dGhpcy52aWV3cy5jbGVhcigpO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkQm9hcmQoKSB7XG5cdFx0Y29uc3Qgc3RvcmVkID0gYXdhaXQgdGhpcy5sb2FkRGF0YSgpO1xuXHRcdGlmIChzdG9yZWQgJiYgc3RvcmVkLmNvbHVtbnMpIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBzdG9yZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBjcmVhdGVEZWZhdWx0Qm9hcmQoKTtcblx0XHR9XG5cdFx0dGhpcy5ub3JtYWxpemVCb2FyZCgpO1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gdGhpcy5ib2FyZC5jb2x1bW5zWzBdPy5pZDtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcGVyc2lzdCgpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuYm9hcmQpO1xuXHRcdHRoaXMubm90aWZ5Vmlld3MoKTtcblx0fVxuXG5cdHJlZ2lzdGVyS2FuYmFuVmlldyh2aWV3OiBLYW5iYW5WaWV3KSB7XG5cdFx0dGhpcy52aWV3cy5hZGQodmlldyk7XG5cdFx0dmlldy5yZWdpc3RlcigoKSA9PiB0aGlzLnZpZXdzLmRlbGV0ZSh2aWV3KSk7XG5cdH1cblxuXHRub3RpZnlWaWV3cygpIHtcblx0XHR0aGlzLnZpZXdzLmZvckVhY2goKHZpZXcpID0+IHZpZXcucmVuZGVyKCkpO1xuXHR9XG5cblx0Z2V0Qm9hcmQoKTogS2FuYmFuQm9hcmREYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5ib2FyZDtcblx0fVxuXG5cdGFzeW5jIGFkZENvbHVtbihuYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIW5hbWUudHJpbSgpKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBjb2x1bW4gPSB7IGlkOiBjcmVhdGVJZCgpLCBuYW1lOiBuYW1lLnRyaW0oKSwgY2FyZHM6IFtdIGFzIEthbmJhbkNhcmRbXSB9O1xuXHRcdHRoaXMuYm9hcmQuY29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0aWYgKCF0aGlzLmxhc3RDb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSBjb2x1bW4uaWQ7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgcmVtb3ZlQ29sdW1uKGNvbHVtbklkOiBzdHJpbmcpIHtcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuYm9hcmQuY29sdW1ucy5maW5kSW5kZXgoKGNvbCkgPT4gY29sLmlkID09PSBjb2x1bW5JZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjcyQVx1NjI3RVx1NTIzMFx1NjMwN1x1NUI5QVx1NjgwRlx1NzZFRVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5ib2FyZC5jb2x1bW5zLnNwbGljZShpbmRleCwgMSk7XG5cdFx0aWYgKHRoaXMubGFzdENvbHVtbklkID09PSBjb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSB0aGlzLmJvYXJkLmNvbHVtbnNbMF0/LmlkO1xuXHRcdH1cblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIHJlbmFtZUNvbHVtbihjb2x1bW5JZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3QgbmV4dE5hbWUgPSBuYW1lLnRyaW0oKTtcblx0XHRpZiAoIW5leHROYW1lKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb2x1bW4ubmFtZSA9IG5leHROYW1lO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgYWRkQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHBheWxvYWQ6IHtcblx0XHRcdHRpdGxlOiBzdHJpbmc7XG5cdFx0XHR0YWdzOiBzdHJpbmdbXTtcblx0XHRcdHJlbWFyazogc3RyaW5nO1xuXHRcdFx0aGlzdG9yeU5vdGU6IHN0cmluZztcblx0XHRcdGRlYWRsaW5lPzogbnVtYmVyIHwgbnVsbDtcblx0XHR9LFxuXHQpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRjb25zdCBjYXJkOiBLYW5iYW5DYXJkID0ge1xuXHRcdFx0aWQ6IGNyZWF0ZUlkKCksXG5cdFx0XHR0aXRsZTogcGF5bG9hZC50aXRsZS50cmltKCksXG5cdFx0XHR0YWdzOiBwYXlsb2FkLnRhZ3MsXG5cdFx0XHRyZW1hcms6IHBheWxvYWQucmVtYXJrLFxuXHRcdFx0ZGVhZGxpbmU6IHBheWxvYWQuZGVhZGxpbmUgPz8gbnVsbCxcblx0XHRcdGNvbXBsZXRlZDogZmFsc2UsXG5cdFx0XHRjb21wbGV0ZWRBdDogbnVsbCxcblx0XHRcdGNyZWF0ZWRBdDogbm93LFxuXHRcdFx0dXBkYXRlZEF0OiBub3csXG5cdFx0XHRoaXN0b3J5OiBbXSxcblx0XHR9O1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBwYXlsb2FkLmhpc3RvcnlOb3RlIHx8IFwiXHU1MjFCXHU1RUZBXCIpO1xuXHRcdGNvbHVtbi5jYXJkcy51bnNoaWZ0KGNhcmQpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdXBkYXRlQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdHVwZGF0ZXM6IFBhcnRpYWw8UGljazxLYW5iYW5DYXJkLCBcInRpdGxlXCIgfCBcInRhZ3NcIiB8IFwicmVtYXJrXCIgfCBcImRlYWRsaW5lXCI+Pixcblx0XHRoaXN0b3J5Tm90ZT86IHN0cmluZyxcblx0KSB7XG5cdFx0Y29uc3QgY2FyZCA9IHRoaXMuZ2V0Q2FyZChjb2x1bW5JZCwgY2FyZElkKTtcblx0XHRpZiAoIWNhcmQpIHJldHVybjtcblx0XHRpZiAodXBkYXRlcy50aXRsZSAhPT0gdW5kZWZpbmVkKSBjYXJkLnRpdGxlID0gdXBkYXRlcy50aXRsZS50cmltKCk7XG5cdFx0aWYgKHVwZGF0ZXMudGFncyAhPT0gdW5kZWZpbmVkKSBjYXJkLnRhZ3MgPSB1cGRhdGVzLnRhZ3M7XG5cdFx0aWYgKHVwZGF0ZXMucmVtYXJrICE9PSB1bmRlZmluZWQpIGNhcmQucmVtYXJrID0gdXBkYXRlcy5yZW1hcms7XG5cdFx0aWYgKHVwZGF0ZXMuZGVhZGxpbmUgIT09IHVuZGVmaW5lZCkgY2FyZC5kZWFkbGluZSA9IHVwZGF0ZXMuZGVhZGxpbmU7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBoaXN0b3J5Tm90ZSB8fCBcIlx1NTE4NVx1NUJCOVx1NjZGNFx1NjVCMFwiKTtcblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIG1vdmVDYXJkKFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdGZyb21Db2x1bW5JZDogc3RyaW5nLFxuXHRcdHRvQ29sdW1uSWQ6IHN0cmluZyxcblx0XHRiZWZvcmVDYXJkSWQ/OiBzdHJpbmcsXG5cdCkge1xuXHRcdGNvbnN0IGZyb21Db2x1bW4gPSB0aGlzLmdldENvbHVtbihmcm9tQ29sdW1uSWQpO1xuXHRcdGNvbnN0IHRvQ29sdW1uID0gdGhpcy5nZXRDb2x1bW4odG9Db2x1bW5JZCk7XG5cdFx0Y29uc3QgaW5kZXggPSBmcm9tQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gY2FyZElkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG5cdFx0Y29uc3QgW2NhcmRdID0gZnJvbUNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGxldCB0YXJnZXRJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmxlbmd0aDtcblx0XHRpZiAoYmVmb3JlQ2FyZElkKSB7XG5cdFx0XHRjb25zdCBiZWZvcmVJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gYmVmb3JlQ2FyZElkKTtcblx0XHRcdHRhcmdldEluZGV4ID0gYmVmb3JlSW5kZXggPT09IC0xID8gdG9Db2x1bW4uY2FyZHMubGVuZ3RoIDogYmVmb3JlSW5kZXg7XG5cdFx0fVxuXHRcdHRvQ29sdW1uLmNhcmRzLnNwbGljZSh0YXJnZXRJbmRleCwgMCwgY2FyZCk7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdGlmIChmcm9tQ29sdW1uSWQgIT09IHRvQ29sdW1uSWQpIHtcblx0XHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBgXHU3OUZCXHU1MkE4XHU1MjMwXHUzMDBDJHt0b0NvbHVtbi5uYW1lfVx1MzAwRGApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlY29yZEhpc3RvcnkoY2FyZCwgXCJcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEZcIik7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdG9nZ2xlQ2FyZENvbXBsZXRpb24oY29sdW1uSWQ6IHN0cmluZywgY2FyZElkOiBzdHJpbmcsIGNvbXBsZXRlZDogYm9vbGVhbikge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBpbmRleCA9IGNvbHVtbi5jYXJkcy5maW5kSW5kZXgoKGMpID0+IGMuaWQgPT09IGNhcmRJZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xuXHRcdGNvbnN0IFtjYXJkXSA9IGNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGNhcmQuY29tcGxldGVkID0gY29tcGxldGVkO1xuXHRcdGNhcmQuY29tcGxldGVkQXQgPSBjb21wbGV0ZWQgPyBEYXRlLm5vdygpIDogbnVsbDtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGNvbXBsZXRlZCA/IFwiXHU2ODA3XHU4QkIwXHU1QjhDXHU2MjEwXCIgOiBcIlx1NTNENlx1NkQ4OFx1NUI4Q1x1NjIxMFwiKTtcblx0XHRjb25zdCBpbnNlcnRJbmRleCA9IGNvbXBsZXRlZCA/IGNvbHVtbi5jYXJkcy5sZW5ndGggOiBNYXRoLm1pbihpbmRleCwgY29sdW1uLmNhcmRzLmxlbmd0aCk7XG5cdFx0Y29sdW1uLmNhcmRzLnNwbGljZShpbnNlcnRJbmRleCwgMCwgY2FyZCk7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRwcml2YXRlIGdldENvbHVtbihjb2x1bW5JZDogc3RyaW5nKTogS2FuYmFuQ29sdW1uIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmJvYXJkLmNvbHVtbnMuZmluZCgoY29sKSA9PiBjb2wuaWQgPT09IGNvbHVtbklkKTtcblx0XHRpZiAoIWNvbHVtbikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiXHU2NzJBXHU2MjdFXHU1MjMwXHU2MzA3XHU1QjlBXHU3Njg0XHU2ODBGXHU3NkVFXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRDYXJkKGNvbHVtbklkOiBzdHJpbmcsIGNhcmRJZDogc3RyaW5nKTogS2FuYmFuQ2FyZCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oY29sdW1uSWQpO1xuXHRcdHJldHVybiBjb2x1bW4uY2FyZHMuZmluZCgoY2FyZCkgPT4gY2FyZC5pZCA9PT0gY2FyZElkKTtcblx0fVxuXG5cdHByaXZhdGUgcmVjb3JkSGlzdG9yeShjYXJkOiBLYW5iYW5DYXJkLCByZW1hcms6IHN0cmluZykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpKSB7XG5cdFx0XHRjYXJkLmhpc3RvcnkgPSBbXTtcblx0XHR9XG5cdFx0Y2FyZC5oaXN0b3J5LnVuc2hpZnQoe1xuXHRcdFx0dGltZXN0YW1wOiBEYXRlLm5vdygpLFxuXHRcdFx0cmVtYXJrOiByZW1hcmsgfHwgXCJcdTY2RjRcdTY1QjBcIixcblx0XHR9KTtcblx0XHRjYXJkLmhpc3RvcnkgPSBjYXJkLmhpc3Rvcnkuc2xpY2UoMCwgNTApO1xuXHR9XG5cblx0cHJpdmF0ZSBub3JtYWxpemVCb2FyZCgpIHtcblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLmJvYXJkLmNvbHVtbnMpIHtcblx0XHRcdGNvbHVtbi5jYXJkcyA9IGNvbHVtbi5jYXJkcy5tYXAoKGNhcmQpID0+ICh7XG5cdFx0XHRcdC4uLmNhcmQsXG5cdFx0XHRcdGRlYWRsaW5lOiBjYXJkLmRlYWRsaW5lID8/IG51bGwsXG5cdFx0XHRcdGNvbXBsZXRlZEF0OiBjYXJkLmNvbXBsZXRlZEF0ID8/IG51bGwsXG5cdFx0XHR9KSk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgYWN0aXZhdGVWaWV3KCkge1xuXHRcdGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFKTtcblx0XHRpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYXZlc1swXSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHJpZ2h0TGVhZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRSaWdodExlYWYoZmFsc2UpO1xuXHRcdGF3YWl0IHJpZ2h0TGVhZj8uc2V0Vmlld1N0YXRlKHsgdHlwZTogVklFV19UWVBFLCBhY3RpdmU6IHRydWUgfSk7XG5cdFx0aWYgKHJpZ2h0TGVhZikge1xuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYocmlnaHRMZWFmKTtcblx0XHR9XG5cdH1cblxuXHRzZXRBY3RpdmVDb2x1bW4oY29sdW1uSWQ6IHN0cmluZykge1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gY29sdW1uSWQ7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVDb2x1bW5Gb3JRdWlja0FkZCgpOiBLYW5iYW5Db2x1bW4gfCB1bmRlZmluZWQge1xuXHRcdGlmICghdGhpcy5ib2FyZC5jb2x1bW5zLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRjb25zdCBwcmVmZXJyZWQgPVxuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgJiYgdGhpcy5ib2FyZC5jb2x1bW5zLmZpbmQoKGNvbCkgPT4gY29sLmlkID09PSB0aGlzLmxhc3RDb2x1bW5JZCk7XG5cdFx0cmV0dXJuIHByZWZlcnJlZCA/PyB0aGlzLmJvYXJkLmNvbHVtbnNbMF07XG5cdH1cblxuXHRvcGVuUXVpY2tBZGRDYXJkKCkge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMucmVzb2x2ZUNvbHVtbkZvclF1aWNrQWRkKCk7XG5cdFx0aWYgKCFjb2x1bW4pIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdThCRjdcdTUxNDhcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcywgY29sdW1uLmlkKS5vcGVuKCk7XG5cdH1cbn1cblxuY2xhc3MgS2FuYmFuVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcblx0cHJpdmF0ZSBkcmFnU3RhdGU/OiB7IGNvbHVtbklkOiBzdHJpbmc7IGNhcmRJZDogc3RyaW5nOyBjYXJkSGVpZ2h0OiBudW1iZXIgfTtcblx0cHJpdmF0ZSBwbGFjZWhvbGRlckVsPzogSFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgcGxhY2Vob2xkZXJTdGF0ZT86IHsgY29sdW1uSWQ6IHN0cmluZzsgYmVmb3JlSWQ/OiBzdHJpbmcgfTtcblx0cHJpdmF0ZSBkZWFkbGluZUZpbHRlcnMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcblx0cHJpdmF0ZSBhY3RpdmVUYWI6IFwiYm9hcmRcIiB8IFwic3RhdHNcIiB8IFwidGltZWxpbmVcIiA9IFwiYm9hcmRcIjtcblx0cHJpdmF0ZSBzdGF0c1JhbmdlOiBTdGF0c1JhbmdlID0geyB0eXBlOiBcInByZXNldFwiLCBkYXlzOiAxNCB9O1xuXHRwcml2YXRlIHRpbWVsaW5lUHJlc2V0OiBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiO1xuXHRwcml2YXRlIHRpbWVsaW5lQ3VzdG9tPzogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9O1xuXHRwcml2YXRlIGxhc3RTY3JvbGxUb3AgPSAwO1xuXHRwcml2YXRlIHNjcm9sbFRhcmdldD86IEhUTUxFbGVtZW50O1xuXHRwcml2YXRlIG91dGVyU2Nyb2xsVGFyZ2V0PzogSFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgY29sdW1uU2Nyb2xsID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblx0cHJpdmF0ZSBib2FyZFNlYXJjaCA9IFwiXCI7XG5cdHByaXZhdGUgdGltZWxpbmVTZWFyY2ggPSBcIlwiO1xuXHRwcml2YXRlIGxhc3RGb2N1c2VkU2VhcmNoVGFiOiBcImJvYXJkXCIgfCBcInRpbWVsaW5lXCIgfCBudWxsID0gbnVsbDtcblx0cHJpdmF0ZSBsYXN0U2VhcmNoU2VsZWN0aW9uPzogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9O1xuXHRwcml2YXRlIGlzQm9hcmRDb21wb3NpbmcgPSBmYWxzZTtcblx0cHJpdmF0ZSBpc1RpbWVsaW5lQ29tcG9zaW5nID0gZmFsc2U7XG5cdHByaXZhdGUgc2Nyb2xsSGFuZGxlciA9IChldnQ6IEV2ZW50KSA9PiB7XG5cdFx0Y29uc3QgdGFyZ2V0ID0gKGV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpID8/IHRoaXMuc2Nyb2xsVGFyZ2V0ID8/IHRoaXMuY29udGVudEVsO1xuXHRcdHRoaXMubGFzdFNjcm9sbFRvcCA9IHRhcmdldC5zY3JvbGxUb3A7XG5cdH07XG5cblx0Y29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgcHJpdmF0ZSBwbHVnaW46IFNpbXBsZUthbmJhblBsdWdpbikge1xuXHRcdHN1cGVyKGxlYWYpO1xuXHR9XG5cblx0Z2V0Vmlld1R5cGUoKSB7XG5cdFx0cmV0dXJuIFZJRVdfVFlQRTtcblx0fVxuXG5cdGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIFwiXHU1M0YzXHU0RkE3XHU3NzBCXHU2NzdGXCI7XG5cdH1cblxuXHRnZXRJY29uKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIElDT05fSUQ7XG5cdH1cblxuXHRhc3luYyBvbk9wZW4oKSB7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxuXG5cdGFzeW5jIG9uQ2xvc2UoKSB7XG5cdFx0dGhpcy5kcmFnU3RhdGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy50ZWFyZG93blNjcm9sbFRhcmdldCgpO1xuXHRcdHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgY29udGFpbmVyID0gdGhpcy5jb250ZW50RWw7XG5cdFx0Y29uc3Qgb3V0ZXIgPSB0aGlzLmZpbmRTY3JvbGxQYXJlbnQoY29udGFpbmVyKTtcblx0XHRjb25zdCBjdXJyZW50U2Nyb2xsID0gdGhpcy5zY3JvbGxUYXJnZXQ/LnNjcm9sbFRvcCA/PyBjb250YWluZXIuc2Nyb2xsVG9wO1xuXHRcdGNvbnN0IG91dGVyU2Nyb2xsID0gb3V0ZXI/LnNjcm9sbFRvcCA/PyAwO1xuXHRcdHRoaXMubGFzdFNjcm9sbFRvcCA9IGN1cnJlbnRTY3JvbGw7XG5cdFx0Y29uc3QgbGFzdE91dGVyID0gb3V0ZXJTY3JvbGw7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTY3JvbGxdIGJlZm9yZSByZW5kZXJcIiwge1xuXHRcdFx0dGFiOiB0aGlzLmFjdGl2ZVRhYixcblx0XHRcdHNhdmVkOiB0aGlzLmxhc3RTY3JvbGxUb3AsXG5cdFx0XHRjdXJyZW50OiBjdXJyZW50U2Nyb2xsLFxuXHRcdFx0b3V0ZXI6IGxhc3RPdXRlcixcblx0XHR9KTtcblx0XHQvLyBQcmVzZXJ2ZSBzY3JvbGwgb24gY29sdW1uIGxpc3RzIGJlZm9yZSB3ZSBjbGVhciBET00uXG5cdFx0dGhpcy5jYXB0dXJlQ29sdW1uU2Nyb2xsKCk7XG5cdFx0Y29udGFpbmVyLmVtcHR5KCk7XG5cdFx0Y29udGFpbmVyLmFkZENsYXNzKFwic2sta2FuYmFuXCIpO1xuXG5cdFx0Y29uc3QgdGFicyA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFic1wiIH0pO1xuXHRcdHRoaXMucmVuZGVyVGFiQnV0dG9uKHRhYnMsIFwiYm9hcmRcIiwgXCJcdTRFRkJcdTUyQTFcdTc3MEJcdTY3N0ZcIik7XG5cdFx0dGhpcy5yZW5kZXJUYWJCdXR0b24odGFicywgXCJzdGF0c1wiLCBcIlx1NjU0OFx1NzM4N1x1N0VERlx1OEJBMVwiKTtcblx0XHR0aGlzLnJlbmRlclRhYkJ1dHRvbih0YWJzLCBcInRpbWVsaW5lXCIsIFwiXHU2NUY2XHU5NUY0XHU4Rjc0XCIpO1xuXG5cdFx0Y29uc3QgYm9keSA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFiLXBhbmVsXCIgfSk7XG5cdFx0aWYgKHRoaXMuYWN0aXZlVGFiID09PSBcImJvYXJkXCIpIHtcblx0XHRcdHRoaXMucmVuZGVyQm9hcmQoYm9keSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gXCJzdGF0c1wiKSB7XG5cdFx0XHR0aGlzLnJlbmRlclN0YXRzKGJvZHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlbmRlclRpbWVsaW5lKGJvZHkpO1xuXHRcdH1cblx0XHR0aGlzLnNldHVwU2Nyb2xsVGFyZ2V0KGJvZHkpO1xuXHRcdHRoaXMucmVzdG9yZU91dGVyU2Nyb2xsKG91dGVyU2Nyb2xsLCBvdXRlcik7XG5cdFx0Ly8gUmVzdG9yZSBwZXItY29sdW1uIHNjcm9sbCBwb3NpdGlvbnMgYWZ0ZXIgbmV3IERPTSBpcyByZWFkeS5cblx0XHR0aGlzLnJlc3RvcmVDb2x1bW5TY3JvbGwoKTtcblx0fVxuXG5cdHByaXZhdGUgc2V0dXBTY3JvbGxUYXJnZXQoZWw6IEhUTUxFbGVtZW50KSB7XG5cdFx0dGhpcy50ZWFyZG93blNjcm9sbFRhcmdldCgpO1xuXHRcdHRoaXMuc2Nyb2xsVGFyZ2V0ID0gZWw7XG5cdFx0dGhpcy5zY3JvbGxUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLnNjcm9sbEhhbmRsZXIsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcblx0XHRjb25zdCB0YXJnZXRTY3JvbGwgPSB0aGlzLmxhc3RTY3JvbGxUb3A7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTY3JvbGxdIHNldHVwXCIsIHtcblx0XHRcdHRhYjogdGhpcy5hY3RpdmVUYWIsXG5cdFx0XHR0YXJnZXRTY3JvbGwsXG5cdFx0XHR0YXJnZXRIZWlnaHQ6IHRoaXMuc2Nyb2xsVGFyZ2V0LnNjcm9sbEhlaWdodCxcblx0XHRcdHRhcmdldENsaWVudDogdGhpcy5zY3JvbGxUYXJnZXQuY2xpZW50SGVpZ2h0LFxuXHRcdH0pO1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5zY3JvbGxUYXJnZXQpIHtcblx0XHRcdFx0dGhpcy5zY3JvbGxUYXJnZXQuc2Nyb2xsVG9wID0gdGFyZ2V0U2Nyb2xsO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1Njcm9sbF0gYWZ0ZXIgcmVuZGVyXCIsIHtcblx0XHRcdFx0XHR0YWI6IHRoaXMuYWN0aXZlVGFiLFxuXHRcdFx0XHRcdHJlc3RvcmVkOiB0YXJnZXRTY3JvbGwsXG5cdFx0XHRcdFx0YWN0dWFsOiB0aGlzLnNjcm9sbFRhcmdldC5zY3JvbGxUb3AsXG5cdFx0XHRcdFx0dGFyZ2V0SGVpZ2h0OiB0aGlzLnNjcm9sbFRhcmdldC5zY3JvbGxIZWlnaHQsXG5cdFx0XHRcdFx0dGFyZ2V0Q2xpZW50OiB0aGlzLnNjcm9sbFRhcmdldC5jbGllbnRIZWlnaHQsXG5cdFx0XHRcdFx0b3V0ZXI6IHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQ/LnNjcm9sbFRvcCA/PyAwLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgdGVhcmRvd25TY3JvbGxUYXJnZXQoKSB7XG5cdFx0aWYgKHRoaXMuc2Nyb2xsVGFyZ2V0KSB7XG5cdFx0XHR0aGlzLnNjcm9sbFRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuc2Nyb2xsSGFuZGxlcik7XG5cdFx0fVxuXHRcdHRoaXMuc2Nyb2xsVGFyZ2V0ID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSByZXN0b3JlT3V0ZXJTY3JvbGwodmFsdWU6IG51bWJlciwgdGFyZ2V0PzogSFRNTEVsZW1lbnQpIHtcblx0XHRpZiAoIXRhcmdldCkgcmV0dXJuO1xuXHRcdHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQgPSB0YXJnZXQ7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdGlmICh0aGlzLm91dGVyU2Nyb2xsVGFyZ2V0KSB7XG5cdFx0XHRcdHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQuc2Nyb2xsVG9wID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGNhcHR1cmVDb2x1bW5TY3JvbGwoKSB7XG5cdFx0Y29uc3QgY29udGFpbmVycyA9IEFycmF5LmZyb20oXG5cdFx0XHR0aGlzLmNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcIi5zay1jYXJkc1tkYXRhLWNvbHVtbl1cIiksXG5cdFx0KTtcblx0XHRjb250YWluZXJzLmZvckVhY2goKGVsKSA9PiB7XG5cdFx0XHRjb25zdCBjb2x1bW5JZCA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtY29sdW1uXCIpO1xuXHRcdFx0aWYgKGNvbHVtbklkKSB7XG5cdFx0XHRcdHRoaXMuY29sdW1uU2Nyb2xsLnNldChjb2x1bW5JZCwgZWwuc2Nyb2xsVG9wKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVzdG9yZUNvbHVtblNjcm9sbCgpIHtcblx0XHRjb25zdCBjb250YWluZXJzID0gQXJyYXkuZnJvbShcblx0XHRcdHRoaXMuY29udGVudEVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFwiLnNrLWNhcmRzW2RhdGEtY29sdW1uXVwiKSxcblx0XHQpO1xuXHRcdGNvbnRhaW5lcnMuZm9yRWFjaCgoZWwpID0+IHtcblx0XHRcdGNvbnN0IGNvbHVtbklkID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2x1bW5cIik7XG5cdFx0XHRpZiAoIWNvbHVtbklkKSByZXR1cm47XG5cdFx0XHRjb25zdCB0YXJnZXQgPSB0aGlzLmNvbHVtblNjcm9sbC5nZXQoY29sdW1uSWQpID8/IDA7XG5cdFx0XHRlbC5zY3JvbGxUb3AgPSB0YXJnZXQ7XG5cdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRcInNjcm9sbFwiLFxuXHRcdFx0XHQoZXZ0KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgdGFyZ2V0RWwgPSBldnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHRcdHRoaXMuY29sdW1uU2Nyb2xsLnNldChjb2x1bW5JZCwgdGFyZ2V0RWwuc2Nyb2xsVG9wKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0eyBwYXNzaXZlOiB0cnVlIH0sXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBmaW5kU2Nyb2xsUGFyZW50KGVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG5cdFx0bGV0IG5vZGU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsO1xuXHRcdHdoaWxlIChub2RlKSB7XG5cdFx0XHRpZiAobm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDQpIHtcblx0XHRcdFx0cmV0dXJuIG5vZGU7XG5cdFx0XHR9XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHByaXZhdGUgcmVzdG9yZVNlYXJjaEZvY3VzKHRhYjogXCJib2FyZFwiIHwgXCJ0aW1lbGluZVwiLCBpbnB1dDogSFRNTElucHV0RWxlbWVudCkge1xuXHRcdGlmICh0aGlzLmxhc3RGb2N1c2VkU2VhcmNoVGFiICE9PSB0YWIpIHJldHVybjtcblx0XHRjb25zdCBzZWxlY3Rpb24gPSB0aGlzLmxhc3RTZWFyY2hTZWxlY3Rpb247XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdGlucHV0LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcblx0XHRcdGlmIChzZWxlY3Rpb24pIHtcblx0XHRcdFx0aW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2Uoc2VsZWN0aW9uLnN0YXJ0LCBzZWxlY3Rpb24uZW5kKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVGFiQnV0dG9uKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHRhYjogXCJib2FyZFwiIHwgXCJzdGF0c1wiLCBsYWJlbDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYnV0dG9uID0gY29udGFpbmVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IGxhYmVsLFxuXHRcdFx0Y2xzOiBbXCJzay10YWJcIiwgdGhpcy5hY3RpdmVUYWIgPT09IHRhYiA/IFwic2stdGFiLWFjdGl2ZVwiIDogXCJcIl0uam9pbihcIiBcIikudHJpbSgpLFxuXHRcdH0pO1xuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuYWN0aXZlVGFiID09PSB0YWIpIHJldHVybjtcblx0XHRcdHRoaXMuYWN0aXZlVGFiID0gdGFiO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQm9hcmQoYm9keTogSFRNTEVsZW1lbnQpIHtcblx0XHRjb25zdCBib2FyZCA9IHRoaXMucGx1Z2luLmdldEJvYXJkKCk7XG5cdFx0Y29uc3Qgc2VhcmNoVmFsdWUgPSB0aGlzLmJvYXJkU2VhcmNoO1xuXHRcdGNvbnN0IGZpbHRlcmVkQ29sdW1ucyA9IGJvYXJkLmNvbHVtbnMubWFwKChjb2wpID0+ICh7XG5cdFx0XHQuLi5jb2wsXG5cdFx0XHRjYXJkczogdGhpcy5maWx0ZXJDYXJkcyhjb2wuY2FyZHMsIHNlYXJjaFZhbHVlKSxcblx0XHR9KSk7XG5cdFx0Y29uc3QgdG90YWxDYXJkcyA9IGZpbHRlcmVkQ29sdW1ucy5yZWR1Y2UoKHN1bSwgY29sKSA9PiBzdW0gKyBjb2wuY2FyZHMubGVuZ3RoLCAwKTtcblxuXHRcdGNvbnN0IGhlYWRlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhlYWRlclwiIH0pO1xuXHRcdGhlYWRlci5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogYFx1NEZBN1x1OEZCOVx1NzcwQlx1Njc3Rlx1RkYwOCR7dG90YWxDYXJkc31cdUZGMDlgIH0pO1xuXHRcdGNvbnN0IHNlYXJjaEJveCA9IGhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stc2VhcmNoXCIgfSk7XG5cdFx0Y29uc3Qgc2VhcmNoSW5wdXQgPSBzZWFyY2hCb3guY3JlYXRlRWwoXCJpbnB1dFwiLCB7XG5cdFx0XHR0eXBlOiBcInNlYXJjaFwiLFxuXHRcdFx0cGxhY2Vob2xkZXI6IFwiXHU2NDFDXHU3RDIyXHU2ODA3XHU5ODk4L1x1NTkwN1x1NkNFOC9cdTY4MDdcdTdCN0UvXHU1Mzg2XHU1M0YyXHUyMDI2XCIsXG5cdFx0XHR2YWx1ZTogc2VhcmNoVmFsdWUsXG5cdFx0fSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRzZWFyY2hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY29tcG9zaXRpb25zdGFydFwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmlzQm9hcmRDb21wb3NpbmcgPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHNlYXJjaElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbmVuZFwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmlzQm9hcmRDb21wb3NpbmcgPSBmYWxzZTtcblx0XHRcdHRoaXMuYm9hcmRTZWFyY2ggPSBzZWFyY2hJbnB1dC52YWx1ZTtcblx0XHRcdHRoaXMubGFzdEZvY3VzZWRTZWFyY2hUYWIgPSBcImJvYXJkXCI7XG5cdFx0XHR0aGlzLmxhc3RTZWFyY2hTZWxlY3Rpb24gPSB7XG5cdFx0XHRcdHN0YXJ0OiBzZWFyY2hJbnB1dC5zZWxlY3Rpb25TdGFydCA/PyBzZWFyY2hJbnB1dC52YWx1ZS5sZW5ndGgsXG5cdFx0XHRcdGVuZDogc2VhcmNoSW5wdXQuc2VsZWN0aW9uRW5kID8/IHNlYXJjaElucHV0LnZhbHVlLmxlbmd0aCxcblx0XHRcdH07XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXHRcdHNlYXJjaElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmJvYXJkU2VhcmNoID0gc2VhcmNoSW5wdXQudmFsdWU7XG5cdFx0XHRpZiAodGhpcy5pc0JvYXJkQ29tcG9zaW5nKSByZXR1cm47XG5cdFx0XHR0aGlzLmxhc3RGb2N1c2VkU2VhcmNoVGFiID0gXCJib2FyZFwiO1xuXHRcdFx0dGhpcy5sYXN0U2VhcmNoU2VsZWN0aW9uID0ge1xuXHRcdFx0XHRzdGFydDogc2VhcmNoSW5wdXQuc2VsZWN0aW9uU3RhcnQgPz8gc2VhcmNoSW5wdXQudmFsdWUubGVuZ3RoLFxuXHRcdFx0XHRlbmQ6IHNlYXJjaElucHV0LnNlbGVjdGlvbkVuZCA/PyBzZWFyY2hJbnB1dC52YWx1ZS5sZW5ndGgsXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0XHR0aGlzLnJlc3RvcmVTZWFyY2hGb2N1cyhcImJvYXJkXCIsIHNlYXJjaElucHV0KTtcblxuXHRcdGNvbnN0IGFkZENvbHVtbkJ0biA9IGhlYWRlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBcIlx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdGFkZENvbHVtbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0bmV3IENvbHVtbk1vZGFsKHRoaXMuYXBwLCB7XG5cdFx0XHRcdHRpdGxlOiBcIlx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0XHRjb25maXJtVGV4dDogXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdFx0b25TdWJtaXQ6IGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLmFkZENvbHVtbih2YWx1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjb2x1bW5zV3JhcHBlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbnNcIiB9KTtcblx0XHRpZiAoIWJvYXJkLmNvbHVtbnMubGVuZ3RoKSB7XG5cdFx0XHRjb2x1bW5zV3JhcHBlci5jcmVhdGVEaXYoeyB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1NjgwRlx1NzZFRVx1RkYwQ1x1NzBCOVx1NTFGQlx1MjAxQ1x1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVx1MjAxRFx1MzAwMlwiLCBjbHM6IFwic2stZW1wdHlcIiB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiBmaWx0ZXJlZENvbHVtbnMpIHtcblx0XHRcdHRoaXMucmVuZGVyQ29sdW1uKGNvbHVtbnNXcmFwcGVyLCBjb2x1bW4pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU3RhdHMoYm9keTogSFRNTEVsZW1lbnQpIHtcblx0XHRjb25zdCBzdGF0cyA9IHRoaXMuYnVpbGRTdGF0c1NuYXBzaG90KHRoaXMuc3RhdHNSYW5nZSk7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gU25hcHNob3RcIiwge1xuXHRcdFx0cmFuZ2U6IHRoaXMuc3RhdHNSYW5nZSxcblx0XHRcdGRhaWx5U2VyaWVzOiBzdGF0cy5kYWlseVNlcmllcyxcblx0XHRcdGRhaWx5UmF0ZXM6IHN0YXRzLmRhaWx5UmF0ZXMsXG5cdFx0fSk7XG5cblx0XHRib2R5LmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIlx1NjU0OFx1NzM4N1x1N0VERlx1OEJBMVwiLCBjbHM6IFwic2stc3RhdHMtdGl0bGVcIiB9KTtcblx0XHRjb25zdCByYW5nZUNvbnRyb2xzID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stcmFuZ2UtY29udHJvbHNcIiB9KTtcblx0XHRyYW5nZUNvbnRyb2xzLmNyZWF0ZVNwYW4oeyB0ZXh0OiBcIlx1NjVGNlx1OTVGNFx1ODMwM1x1NTZGNFx1RkYxQVwiIH0pO1xuXHRcdGNvbnN0IHNlbGVjdCA9IHJhbmdlQ29udHJvbHMuY3JlYXRlRWwoXCJzZWxlY3RcIiwgeyBjbHM6IFwic2stcmFuZ2Utc2VsZWN0XCIgfSkgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG5cdFx0Y29uc3QgcHJlc2V0T3B0aW9uczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHsgXCI3XHU1OTI5XCI6IDcsIFwiMTRcdTU5MjlcIjogMTQsIFwiMzBcdTU5MjlcIjogMzAsIFwiOTBcdTU5MjlcIjogOTAgfTtcblx0XHRPYmplY3QuZW50cmllcyhwcmVzZXRPcHRpb25zKS5mb3JFYWNoKChbbGFiZWwsIGRheXNdKSA9PiB7XG5cdFx0XHRjb25zdCBvcHRpb24gPSBzZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBsYWJlbCwgdmFsdWU6IGRheXMudG9TdHJpbmcoKSB9KTtcblx0XHRcdGlmICh0aGlzLnN0YXRzUmFuZ2UudHlwZSA9PT0gXCJwcmVzZXRcIiAmJiB0aGlzLnN0YXRzUmFuZ2UuZGF5cyA9PT0gZGF5cykgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRjb25zdCBjdXN0b21PcHRpb24gPSBzZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBcIlx1ODFFQVx1NUI5QVx1NEU0OVwiLCB2YWx1ZTogXCJjdXN0b21cIiB9KTtcblx0XHRpZiAodGhpcy5zdGF0c1JhbmdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIGN1c3RvbU9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG5cblx0XHRjb25zdCBjdXN0b21GaWVsZHMgPSByYW5nZUNvbnRyb2xzLmNyZWF0ZURpdih7IGNsczogXCJzay1yYW5nZS1jdXN0b21cIiB9KTtcblx0XHRjb25zdCBzdGFydElucHV0ID0gY3VzdG9tRmllbGRzLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGVcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGNvbnN0IGVuZElucHV0ID0gY3VzdG9tRmllbGRzLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGVcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGNvbnN0IHVwZGF0ZUN1c3RvbUlucHV0cyA9ICgpID0+IHtcblx0XHRcdGlmICh0aGlzLnN0YXRzUmFuZ2UudHlwZSA9PT0gXCJjdXN0b21cIikge1xuXHRcdFx0XHRzdGFydElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy5zdGF0c1JhbmdlLnN0YXJ0KTtcblx0XHRcdFx0ZW5kSW5wdXQudmFsdWUgPSBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aGlzLnN0YXRzUmFuZ2UuZW5kKTtcblx0XHRcdFx0Y3VzdG9tRmllbGRzLmFkZENsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXN0b21GaWVsZHMucmVtb3ZlQ2xhc3MoXCJzay1yYW5nZS1jdXN0b20tdmlzaWJsZVwiKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHVwZGF0ZUN1c3RvbUlucHV0cygpO1xuXG5cdFx0c2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHNlbGVjdC52YWx1ZSA9PT0gXCJjdXN0b21cIikge1xuXHRcdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdFx0Y29uc3QgZGVmYXVsdFN0YXJ0ID0gdG9kYXkgLSAxMyAqIDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cdFx0XHRcdHRoaXMuc3RhdHNSYW5nZSA9IHsgdHlwZTogXCJjdXN0b21cIiwgc3RhcnQ6IGRlZmF1bHRTdGFydCwgZW5kOiB0b2RheSB9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zdGF0c1JhbmdlID0geyB0eXBlOiBcInByZXNldFwiLCBkYXlzOiBOdW1iZXIoc2VsZWN0LnZhbHVlKSB9O1xuXHRcdFx0fVxuXHRcdFx0dXBkYXRlQ3VzdG9tSW5wdXRzKCk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgaGFuZGxlQ3VzdG9tQ2hhbmdlID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuc3RhdHNSYW5nZS50eXBlICE9PSBcImN1c3RvbVwiKSByZXR1cm47XG5cdFx0XHRjb25zdCBzdGFydFRzID0gc3RhcnRJbnB1dC52YWx1ZSA/IHRoaXMuc3RhcnRPZkRheShuZXcgRGF0ZShzdGFydElucHV0LnZhbHVlKS5nZXRUaW1lKCkpIDogbnVsbDtcblx0XHRcdGNvbnN0IGVuZFRzID0gZW5kSW5wdXQudmFsdWUgPyB0aGlzLnN0YXJ0T2ZEYXkobmV3IERhdGUoZW5kSW5wdXQudmFsdWUpLmdldFRpbWUoKSkgOiBudWxsO1xuXHRcdFx0aWYgKHN0YXJ0VHMgJiYgZW5kVHMgJiYgc3RhcnRUcyA8PSBlbmRUcykge1xuXHRcdFx0XHR0aGlzLnN0YXRzUmFuZ2UgPSB7IHR5cGU6IFwiY3VzdG9tXCIsIHN0YXJ0OiBzdGFydFRzLCBlbmQ6IGVuZFRzIH07XG5cdFx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRzdGFydElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlQ3VzdG9tQ2hhbmdlKTtcblx0XHRlbmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGhhbmRsZUN1c3RvbUNoYW5nZSk7XG5cblx0XHRjb25zdCBkYXNoYm9hcmQgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1kYXNoYm9hcmRcIiB9KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKGRhc2hib2FyZCwgXCJcdTYwM0JcdTRFRkJcdTUyQTFcIiwgc3RhdHMudG90YWxUYXNrcy50b1N0cmluZygpLCBcIlx1N0QyRlx1OEJBMVx1NTIxQlx1NUVGQVwiKTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTVCOENcdTYyMTBcdTczODdcIixcblx0XHRcdGZvcm1hdFBlcmNlbnQoc3RhdHMuY29tcGxldGlvblJhdGUpLFxuXHRcdFx0YFx1NURGMlx1NUI4Q1x1NjIxMCAke3N0YXRzLmNvbXBsZXRlZFRhc2tzfS8ke3N0YXRzLnRvdGFsVGFza3MgfHwgMX1gLFxuXHRcdCk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChkYXNoYm9hcmQsIFwiXHU1RjUzXHU1MjREXHU4RkRCXHU4ODRDXHU0RTJEXCIsIHN0YXRzLndpcENvdW50LnRvU3RyaW5nKCksIFwiXHU0RUNEXHU2NzJBXHU1QjhDXHU2MjEwXCIpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoXG5cdFx0XHRkYXNoYm9hcmQsXG5cdFx0XHRcIlx1OTAzRVx1NjcxRlx1NzM4N1wiLFxuXHRcdFx0c3RhdHMuZGVhZGxpbmVDb3VudCA/IGZvcm1hdFBlcmNlbnQoc3RhdHMub3ZlcmR1ZVJhdGUpIDogXCJcdTIwMTRcIixcblx0XHRcdGAke3N0YXRzLm92ZXJkdWVDb3VudH0vJHtzdGF0cy5kZWFkbGluZUNvdW50IHx8IDF9IFx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMWAsXG5cdFx0KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTBcdTczODdcIixcblx0XHRcdHN0YXRzLmRlYWRsaW5lQ291bnQgPyBmb3JtYXRQZXJjZW50KHN0YXRzLm9uVGltZVJhdGUpIDogXCJcdTIwMTRcIixcblx0XHRcdFwiXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwXCIsXG5cdFx0KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTU0NjhcdTY3MUZcIixcblx0XHRcdHN0YXRzLmF2Z0N5Y2xlVGltZU1zID8gZm9ybWF0RHVyYXRpb24oc3RhdHMuYXZnQ3ljbGVUaW1lTXMpIDogXCJcdTIwMTRcIixcblx0XHRcdFwiXHU0RUNFXHU1MjFCXHU1RUZBXHU1MjMwXHU1QjhDXHU2MjEwXCIsXG5cdFx0KTtcblxuXHRcdGNvbnN0IGNoYXJ0U2VjdGlvbiA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXRzLXNlY3Rpb25cIiB9KTtcblx0XHRjaGFydFNlY3Rpb24uY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU2QkNGXHU2NUU1XHU0RUZCXHU1MkExXHU4RDhCXHU1MkJGXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJEYWlseUJhckNoYXJ0KGNoYXJ0U2VjdGlvbiwgc3RhdHMuZGFpbHlTZXJpZXMpO1xuXG5cdFx0Y29uc3QgcmF0ZVNlY3Rpb24gPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1zZWN0aW9uXCIgfSk7XG5cdFx0cmF0ZVNlY3Rpb24uY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU2QkNGXHU2NUU1XHU1QjhDXHU2MjEwXHU3Mzg3XCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJEYWlseVJhdGVDaGFydChyYXRlU2VjdGlvbiwgc3RhdHMuZGFpbHlSYXRlcyk7XG5cblx0XHRjb25zdCBkZWFkbGluZVNlY3Rpb24gPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1zZWN0aW9uXCIgfSk7XG5cdFx0ZGVhZGxpbmVTZWN0aW9uLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVx1Njk4Mlx1ODlDOFwiIH0pO1xuXHRcdHRoaXMucmVuZGVyRGVhZGxpbmVCcmVha2Rvd24oZGVhZGxpbmVTZWN0aW9uLCBzdGF0cyk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRpbWVsaW5lKGJvZHk6IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3QgeyBzdGFydCwgZW5kIH0gPSB0aGlzLnJlc29sdmVUaW1lbGluZVJhbmdlKCk7XG5cdFx0Y29uc3Qgc2VhcmNoVmFsdWUgPSB0aGlzLnRpbWVsaW5lU2VhcmNoO1xuXHRcdGNvbnN0IGVudHJpZXMgPSB0aGlzLmJ1aWxkVGltZWxpbmVFbnRyaWVzKHN0YXJ0LCBlbmQpLmZpbHRlcigoZW50cnkpID0+XG5cdFx0XHR0aGlzLm1hdGNoZXNTZWFyY2hUZXh0KFxuXHRcdFx0XHRzZWFyY2hWYWx1ZSxcblx0XHRcdFx0W2VudHJ5LmNhcmRUaXRsZSwgZW50cnkudGV4dF0uam9pbihcIiBcIiksXG5cdFx0XHQpLFxuXHRcdCk7XG5cblx0XHRjb25zdCBoZWFkZXIgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1oZWFkZXJcIiB9KTtcblx0XHRoZWFkZXIuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IGBcdTY1RjZcdTk1RjRcdThGNzRcdUZGMDgke2VudHJpZXMubGVuZ3RofVx1RkYwOWAgfSk7XG5cdFx0Y29uc3QgY29udHJvbHMgPSBoZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLWNvbnRyb2xzXCIgfSk7XG5cdFx0Y29uc3QgcHJlc2V0U2VsZWN0ID0gY29udHJvbHMuY3JlYXRlRWwoXCJzZWxlY3RcIikgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG5cdFx0W1xuXHRcdFx0eyB2YWx1ZTogXCJ0b2RheVwiLCBsYWJlbDogXCJcdTRFQ0FcdTU5MjlcIiB9LFxuXHRcdFx0eyB2YWx1ZTogXCJ5ZXN0ZXJkYXlcIiwgbGFiZWw6IFwiXHU2NjI4XHU1OTI5XCIgfSxcblx0XHRcdHsgdmFsdWU6IFwiY3VzdG9tXCIsIGxhYmVsOiBcIlx1ODFFQVx1NUI5QVx1NEU0OVwiIH0sXG5cdFx0XS5mb3JFYWNoKChvcHRpb24pID0+IHtcblx0XHRcdGNvbnN0IG9wdCA9IHByZXNldFNlbGVjdC5jcmVhdGVFbChcIm9wdGlvblwiLCB7IHRleHQ6IG9wdGlvbi5sYWJlbCwgdmFsdWU6IG9wdGlvbi52YWx1ZSB9KTtcblx0XHRcdGlmICh0aGlzLnRpbWVsaW5lUHJlc2V0ID09PSBvcHRpb24udmFsdWUpIG9wdC5zZWxlY3RlZCA9IHRydWU7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBzZWFyY2hCb3ggPSBoZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXNlYXJjaFwiIH0pO1xuXHRcdGNvbnN0IHNlYXJjaElucHV0ID0gc2VhcmNoQm94LmNyZWF0ZUVsKFwiaW5wdXRcIiwge1xuXHRcdFx0dHlwZTogXCJzZWFyY2hcIixcblx0XHRcdHBsYWNlaG9sZGVyOiBcIlx1NjQxQ1x1N0QyMlx1NjgwN1x1OTg5OC9cdTUxODVcdTVCQjlcIixcblx0XHRcdHZhbHVlOiBzZWFyY2hWYWx1ZSxcblx0XHR9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdHNlYXJjaElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbnN0YXJ0XCIsICgpID0+IHtcblx0XHRcdHRoaXMuaXNUaW1lbGluZUNvbXBvc2luZyA9IHRydWU7XG5cdFx0fSk7XG5cdFx0c2VhcmNoSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbXBvc2l0aW9uZW5kXCIsICgpID0+IHtcblx0XHRcdHRoaXMuaXNUaW1lbGluZUNvbXBvc2luZyA9IGZhbHNlO1xuXHRcdFx0dGhpcy50aW1lbGluZVNlYXJjaCA9IHNlYXJjaElucHV0LnZhbHVlO1xuXHRcdFx0dGhpcy5sYXN0Rm9jdXNlZFNlYXJjaFRhYiA9IFwidGltZWxpbmVcIjtcblx0XHRcdHRoaXMubGFzdFNlYXJjaFNlbGVjdGlvbiA9IHtcblx0XHRcdFx0c3RhcnQ6IHNlYXJjaElucHV0LnNlbGVjdGlvblN0YXJ0ID8/IHNlYXJjaElucHV0LnZhbHVlLmxlbmd0aCxcblx0XHRcdFx0ZW5kOiBzZWFyY2hJbnB1dC5zZWxlY3Rpb25FbmQgPz8gc2VhcmNoSW5wdXQudmFsdWUubGVuZ3RoLFxuXHRcdFx0fTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cdFx0c2VhcmNoSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcblx0XHRcdHRoaXMudGltZWxpbmVTZWFyY2ggPSBzZWFyY2hJbnB1dC52YWx1ZTtcblx0XHRcdGlmICh0aGlzLmlzVGltZWxpbmVDb21wb3NpbmcpIHJldHVybjtcblx0XHRcdHRoaXMubGFzdEZvY3VzZWRTZWFyY2hUYWIgPSBcInRpbWVsaW5lXCI7XG5cdFx0XHR0aGlzLmxhc3RTZWFyY2hTZWxlY3Rpb24gPSB7XG5cdFx0XHRcdHN0YXJ0OiBzZWFyY2hJbnB1dC5zZWxlY3Rpb25TdGFydCA/PyBzZWFyY2hJbnB1dC52YWx1ZS5sZW5ndGgsXG5cdFx0XHRcdGVuZDogc2VhcmNoSW5wdXQuc2VsZWN0aW9uRW5kID8/IHNlYXJjaElucHV0LnZhbHVlLmxlbmd0aCxcblx0XHRcdH07XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXHRcdHRoaXMucmVzdG9yZVNlYXJjaEZvY3VzKFwidGltZWxpbmVcIiwgc2VhcmNoSW5wdXQpO1xuXG5cdFx0Y29uc3QgY3VzdG9tV3JhcHBlciA9IGNvbnRyb2xzLmNyZWF0ZURpdih7IGNsczogXCJzay1yYW5nZS1jdXN0b21cIiB9KTtcblx0XHRjb25zdCBzdGFydElucHV0ID0gY3VzdG9tV3JhcHBlci5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJkYXRlXCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjb25zdCBlbmRJbnB1dCA9IGN1c3RvbVdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZVwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cblx0XHRjb25zdCB1cGRhdGVDdXN0b21JbnB1dHMgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCA9PT0gXCJjdXN0b21cIiAmJiB0aGlzLnRpbWVsaW5lQ3VzdG9tKSB7XG5cdFx0XHRcdHN0YXJ0SW5wdXQudmFsdWUgPSBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aGlzLnRpbWVsaW5lQ3VzdG9tLnN0YXJ0KTtcblx0XHRcdFx0ZW5kSW5wdXQudmFsdWUgPSBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aGlzLnRpbWVsaW5lQ3VzdG9tLmVuZCk7XG5cdFx0XHRcdGN1c3RvbVdyYXBwZXIuYWRkQ2xhc3MoXCJzay1yYW5nZS1jdXN0b20tdmlzaWJsZVwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1c3RvbVdyYXBwZXIucmVtb3ZlQ2xhc3MoXCJzay1yYW5nZS1jdXN0b20tdmlzaWJsZVwiKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHVwZGF0ZUN1c3RvbUlucHV0cygpO1xuXG5cdFx0Y29uc3QgYXBwbHlQcmVzZXQgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IHByZXNldFNlbGVjdC52YWx1ZSBhcyBUaW1lbGluZVJhbmdlUHJlc2V0O1xuXHRcdFx0dGhpcy50aW1lbGluZVByZXNldCA9IHZhbHVlO1xuXHRcdFx0aWYgKHZhbHVlID09PSBcInRvZGF5XCIpIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdHRoaXMudGltZWxpbmVDdXN0b20gPSB7IHN0YXJ0OiB0b2RheSwgZW5kOiB0b2RheSB9O1xuXHRcdFx0fSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJ5ZXN0ZXJkYXlcIikge1xuXHRcdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdFx0Y29uc3QgeWVzdGVyZGF5ID0gdG9kYXkgLSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdFx0XHR0aGlzLnRpbWVsaW5lQ3VzdG9tID0geyBzdGFydDogeWVzdGVyZGF5LCBlbmQ6IHllc3RlcmRheSB9O1xuXHRcdFx0fSBlbHNlIGlmICghdGhpcy50aW1lbGluZUN1c3RvbSkge1xuXHRcdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdFx0dGhpcy50aW1lbGluZUN1c3RvbSA9IHsgc3RhcnQ6IHRvZGF5LCBlbmQ6IHRvZGF5IH07XG5cdFx0XHR9XG5cdFx0XHR1cGRhdGVDdXN0b21JbnB1dHMoKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fTtcblx0XHRwcmVzZXRTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBhcHBseVByZXNldCk7XG5cblx0XHRjb25zdCBoYW5kbGVDdXN0b21DaGFuZ2UgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCAhPT0gXCJjdXN0b21cIikgcmV0dXJuO1xuXHRcdFx0Y29uc3Qgc3RhcnREYXRlID0gc3RhcnRJbnB1dC52YWx1ZSA/IG5ldyBEYXRlKHN0YXJ0SW5wdXQudmFsdWUpLmdldFRpbWUoKSA6IG51bGw7XG5cdFx0XHRjb25zdCBlbmREYXRlID0gZW5kSW5wdXQudmFsdWUgPyBuZXcgRGF0ZShlbmRJbnB1dC52YWx1ZSkuZ2V0VGltZSgpIDogbnVsbDtcblx0XHRcdGlmIChzdGFydERhdGUgJiYgZW5kRGF0ZSAmJiBzdGFydERhdGUgPD0gZW5kRGF0ZSkge1xuXHRcdFx0XHR0aGlzLnRpbWVsaW5lQ3VzdG9tID0ge1xuXHRcdFx0XHRcdHN0YXJ0OiB0aGlzLnN0YXJ0T2ZEYXkoc3RhcnREYXRlKSxcblx0XHRcdFx0XHRlbmQ6IHRoaXMuc3RhcnRPZkRheShlbmREYXRlKSxcblx0XHRcdFx0fTtcblx0XHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHN0YXJ0SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBoYW5kbGVDdXN0b21DaGFuZ2UpO1xuXHRcdGVuZElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlQ3VzdG9tQ2hhbmdlKTtcblxuXHRcdGlmICghZW50cmllcy5sZW5ndGgpIHtcblx0XHRcdGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU4QkU1XHU2NUY2XHU5NUY0XHU4MzAzXHU1NkY0XHU1MTg1XHU2Q0ExXHU2NzA5XHU2NENEXHU0RjVDXHU4QkIwXHU1RjU1XCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgdGltZWxpbmVXcmFwcGVyID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtd3JhcHBlclwiIH0pO1xuXHRcdGNvbnN0IHRpbWVsaW5lID0gdGltZWxpbmVXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZVwiIH0pO1xuXHRcdGVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+IHtcblx0XHRcdGNvbnN0IHJvdyA9IHRpbWVsaW5lLmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1yb3dcIiB9KTtcblx0XHRcdGNvbnN0IHRpbWVCb3ggPSByb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLXRpbWVib3hcIiB9KTtcblx0XHRcdHRpbWVCb3guY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLWRhdGVcIiwgdGV4dDogZm9ybWF0RGF0ZU9ubHkoZW50cnkudGltZXN0YW1wKSB9KTtcblx0XHRcdHRpbWVCb3guY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLXRpbWVcIiwgdGV4dDogZm9ybWF0VGltZShlbnRyeS50aW1lc3RhbXApIH0pO1xuXHRcdFx0dGltZUJveC5zZXRBdHRyKFwidGl0bGVcIiwgZm9ybWF0RGF0ZShlbnRyeS50aW1lc3RhbXApKTtcblx0XHRcdGNvbnN0IG1hcmtlciA9IHJvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtbWFya2VyXCIgfSk7XG5cdFx0XHRjb25zdCBjb250ZW50ID0gcm93LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jb250ZW50XCIgfSk7XG5cdFx0XHRjb250ZW50LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jYXJkLXRpdGxlXCIsIHRleHQ6IGVudHJ5LmNhcmRUaXRsZSB9KTtcblx0XHRcdGNvbnRlbnQuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLWNhcmQtYm9keVwiLCB0ZXh0OiBlbnRyeS50ZXh0IH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDb2x1bW4od3JhcHBlcjogSFRNTEVsZW1lbnQsIGNvbHVtbjogS2FuYmFuQ29sdW1uKSB7XG5cdFx0Y29uc3QgY29sdW1uRWwgPSB3cmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW5cIiB9KTtcblxuXHRcdGNvbnN0IGNvbHVtbkhlYWRlciA9IGNvbHVtbkVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW4taGVhZGVyXCIgfSk7XG5cdFx0Y29uc3QgdGl0bGVFbCA9IGNvbHVtbkhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uLXRpdGxlXCIsIGF0dHI6IHsgcm9sZTogXCJidXR0b25cIiB9IH0pO1xuXHRcdHRpdGxlRWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IGNvbHVtbi5uYW1lIH0pO1xuXHRcdHRpdGxlRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDb2x1bW5Nb2RhbCh0aGlzLmFwcCwge1xuXHRcdFx0XHR0aXRsZTogXCJcdTdGMTZcdThGOTFcdTY4MEZcdTc2RUVcIixcblx0XHRcdFx0aW5pdGlhbFZhbHVlOiBjb2x1bW4ubmFtZSxcblx0XHRcdFx0Y29uZmlybVRleHQ6IFwiXHU0RkREXHU1QjU4XCIsXG5cdFx0XHRcdG9uU3VibWl0OiBhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5yZW5hbWVDb2x1bW4oY29sdW1uLmlkLCB2YWx1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBhY3Rpb25zRWwgPSBjb2x1bW5IZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbi1hY3Rpb25zXCIgfSk7XG5cdFx0Y29uc3QgYWRkQnRuID0gYWN0aW9uc0VsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTZERkJcdTUyQTBcdTUzNjFcdTcyNDdcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tc21hbGxcIiB9KTtcblx0XHRhZGRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdHRoaXMucGx1Z2luLnNldEFjdGl2ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGNvbHVtbi5pZCkub3BlbigpO1xuXHRcdH0pO1xuXHRcdGNvbnN0IGRlbGV0ZUJ0biA9IGFjdGlvbnNFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBcIlx1NTIyMFx1OTY2NFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3Qgc2stYnRuLXNtYWxsXCIsXG5cdFx0XHRhdHRyOiB7IFwiYXJpYS1sYWJlbFwiOiBcIlx1NTIyMFx1OTY2NFx1NjgwRlx1NzZFRVwiIH0sXG5cdFx0fSk7XG5cdFx0ZGVsZXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHRuZXcgQ29uZmlybU1vZGFsKHRoaXMuYXBwLCB7XG5cdFx0XHRcdHRpdGxlOiBcIlx1NTIyMFx1OTY2NFx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0XHRtZXNzYWdlOiBgXHU3ODZFXHU1QjlBXHU1MjIwXHU5NjY0XHUzMDBDJHtjb2x1bW4ubmFtZX1cdTMwMERcdTUzQ0FcdTUxNzZcdTYyNDBcdTY3MDlcdTUzNjFcdTcyNDdcdUZGMUZgLFxuXHRcdFx0XHRjb25maXJtVGV4dDogXCJcdTUyMjBcdTk2NjRcIixcblx0XHRcdFx0b25Db25maXJtOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4ucmVtb3ZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjYXJkc0NvbnRhaW5lciA9IGNvbHVtbkVsLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFwic2stY2FyZHNcIixcblx0XHRcdGF0dHI6IHsgXCJkYXRhLWNvbHVtblwiOiBjb2x1bW4uaWQgfSxcblx0XHR9KTtcblx0XHRjb25zdCBmaWx0ZXJXcmFwcGVyID0gYWN0aW9uc0VsLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyBjbHM6IFwic2stZmlsdGVyLXRvZ2dsZVwiIH0pO1xuXHRcdGNvbnN0IGRlYWRsaW5lT25seSA9IHRoaXMuZGVhZGxpbmVGaWx0ZXJzLmdldChjb2x1bW4uaWQpID8/IGZhbHNlO1xuXHRcdGNvbnN0IGZpbHRlckNoZWNrYm94ID0gZmlsdGVyV3JhcHBlci5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0ZmlsdGVyQ2hlY2tib3guY2hlY2tlZCA9IGRlYWRsaW5lT25seTtcblx0XHRmaWx0ZXJDaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcblx0XHRcdHRoaXMuZGVhZGxpbmVGaWx0ZXJzLnNldChjb2x1bW4uaWQsIGZpbHRlckNoZWNrYm94LmNoZWNrZWQpO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0XHRmaWx0ZXJXcmFwcGVyLmNyZWF0ZVNwYW4oeyB0ZXh0OiBcIlx1NEVDNVx1NjIyQVx1NkI2MlwiIH0pO1xuXG5cdFx0Y2FyZHNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0Y29uc3QgYmVmb3JlSWQgPSB0aGlzLmdldEJlZm9yZUNhcmRJZChjYXJkc0NvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY2FyZHNDb250YWluZXIsIGJlZm9yZUlkKTtcblx0XHR9KTtcblx0XHRjYXJkc0NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IGJlZm9yZUlkID1cblx0XHRcdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlPy5jb2x1bW5JZCA9PT0gY29sdW1uLmlkXG5cdFx0XHRcdFx0PyB0aGlzLnBsYWNlaG9sZGVyU3RhdGUuYmVmb3JlSWRcblx0XHRcdFx0XHQ6IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHR2b2lkIHRoaXMuaGFuZGxlRHJvcChjb2x1bW4uaWQsIGJlZm9yZUlkKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGNhcmRzVG9SZW5kZXIgPSB0aGlzLmdldENhcmRzRm9yQ29sdW1uKGNvbHVtbiwgZGVhZGxpbmVPbmx5KTtcblxuXHRcdGlmICghY2FyZHNUb1JlbmRlci5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGVtcHR5VGV4dCA9IGRlYWRsaW5lT25seSA/IFwiXHU2NjgyXHU2NUUwXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXCIgOiBcIlx1RDgzRFx1RENERCBcdTY2ODJcdTY1RTBcdTRFRkJcdTUyQTFcIjtcblx0XHRcdGNvbnN0IGVtcHR5ID0gY2FyZHNDb250YWluZXIuY3JlYXRlRGl2KHsgdGV4dDogZW1wdHlUZXh0LCBjbHM6IFwic2stZW1wdHlcIiB9KTtcblx0XHRcdGVtcHR5LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpZiAoZXZ0LmRhdGFUcmFuc2ZlcikgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJtb3ZlXCI7XG5cdFx0XHRcdGNvbnN0IGJlZm9yZUlkID0gdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY2FyZHNDb250YWluZXIsIGJlZm9yZUlkKTtcblx0XHRcdH0pO1xuXHRcdFx0ZW1wdHkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGV2dCkgPT4ge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0Y29uc3QgYmVmb3JlSWQgPVxuXHRcdFx0XHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZT8uY29sdW1uSWQgPT09IGNvbHVtbi5pZFxuXHRcdFx0XHRcdFx0PyB0aGlzLnBsYWNlaG9sZGVyU3RhdGUuYmVmb3JlSWRcblx0XHRcdFx0XHRcdDogdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdFx0dm9pZCB0aGlzLmhhbmRsZURyb3AoY29sdW1uLmlkLCBiZWZvcmVJZCk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjYXJkc1RvUmVuZGVyLmZvckVhY2goKGNhcmQpID0+IHtcblx0XHRcdHRoaXMucmVuZGVyQ2FyZChjYXJkc0NvbnRhaW5lciwgY29sdW1uLCBjYXJkKTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ2FyZChjb250YWluZXI6IEhUTUxFbGVtZW50LCBjb2x1bW46IEthbmJhbkNvbHVtbiwgY2FyZDogS2FuYmFuQ2FyZCkge1xuXHRcdGNvbnN0IGNhcmRDbGFzc2VzID0gW1wic2stY2FyZFwiXTtcblx0XHRpZiAoY2FyZC5jb21wbGV0ZWQpIGNhcmRDbGFzc2VzLnB1c2goXCJzay1jYXJkLWNvbXBsZXRlZFwiKTtcblx0XHRpZiAoY2FyZC5kZWFkbGluZSkgY2FyZENsYXNzZXMucHVzaChcInNrLWNhcmQtZGVhZGxpbmVcIik7XG5cdFx0Y29uc3QgY2FyZEVsID0gY29udGFpbmVyLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IGNhcmRDbGFzc2VzLmpvaW4oXCIgXCIpLFxuXHRcdFx0YXR0cjogeyBkcmFnZ2FibGU6IFwidHJ1ZVwiLCBcImRhdGEtY2FyZFwiOiBjYXJkLmlkIH0sXG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmRhdGFzZXQuY2FyZElkID0gY2FyZC5pZDtcblxuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldnQpID0+IHtcblx0XHRcdHRoaXMuZHJhZ1N0YXRlID0geyBjYXJkSWQ6IGNhcmQuaWQsIGNvbHVtbklkOiBjb2x1bW4uaWQsIGNhcmRIZWlnaHQ6IGNhcmRFbC5vZmZzZXRIZWlnaHQgfTtcblx0XHRcdGNhcmRFbC5hZGRDbGFzcyhcInNrLWNhcmQtZHJhZ2dpbmdcIik7XG5cdFx0XHRldnQuZGF0YVRyYW5zZmVyPy5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBjYXJkLmlkKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbmRcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcmFnZ2luZ1wiKTtcblx0XHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0Y2FyZEVsLmFkZENsYXNzKFwic2stY2FyZC1kcm9wXCIpO1xuXHRcdFx0Y29uc3QgY29udGFpbmVyID0gY2FyZEVsLnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRjb25zdCBiZWZvcmVJZCA9IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY29udGFpbmVyLCBiZWZvcmVJZCk7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcm9wXCIpO1xuXHRcdH0pO1xuXG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG5cdFx0XHRjb25zdCB0YXJnZXQgPSBldnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0aWYgKHRhcmdldC5jbG9zZXN0KFwiLnNrLWhpc3RvcnktaG9zdFwiKSkgcmV0dXJuO1xuXHRcdFx0dGhpcy5wbHVnaW4uc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0XHRuZXcgQ2FyZE1vZGFsKHRoaXMuYXBwLCB0aGlzLnBsdWdpbiwgY29sdW1uLmlkLCBjYXJkKS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCB0b3BSb3cgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdG9wXCIgfSk7XG5cdFx0Y29uc3QgY2hlY2tib3ggPSB0b3BSb3cuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGNoZWNrYm94LmNoZWNrZWQgPSBjYXJkLmNvbXBsZXRlZDtcblx0XHRjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4udG9nZ2xlQ2FyZENvbXBsZXRpb24oY29sdW1uLmlkLCBjYXJkLmlkLCBjaGVja2JveC5jaGVja2VkKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IHRpdGxlRWwgPSB0b3BSb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdGl0bGVcIiwgdGV4dDogY2FyZC50aXRsZSB9KTtcblxuXHRcdGNvbnN0IGhpc3RvcnlIb3N0ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LWhvc3RcIiB9KTtcblx0XHRjb25zdCBoaXN0b3J5TWFya2VyID0gaGlzdG9yeUhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhpc3RvcnktbWFya2VyXCIsIHRleHQ6IFwiXHUyM0YxXCIgfSk7XG5cdFx0Y29uc3QgcG9wb3ZlciA9IGhpc3RvcnlIb3N0LmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LXBvcG92ZXJcIiB9KTtcblx0XHRjb25zdCBoaXN0b3J5RW50cmllcyA9IEFycmF5LmlzQXJyYXkoY2FyZC5oaXN0b3J5KSA/IGNhcmQuaGlzdG9yeSA6IFtdO1xuXHRcdGhpc3RvcnlFbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG5cdFx0XHRwb3BvdmVyLmNyZWF0ZURpdih7XG5cdFx0XHRcdGNsczogXCJzay1oaXN0b3J5LWVudHJ5XCIsXG5cdFx0XHRcdHRleHQ6IGAke2Zvcm1hdERhdGUoZW50cnkudGltZXN0YW1wKX0gXHUwMEI3ICR7ZW50cnkucmVtYXJrIHx8IFwiXHU0RkVFXHU2NTM5XCJ9YCxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdGlmICghaGlzdG9yeUVudHJpZXMubGVuZ3RoKSB7XG5cdFx0XHRwb3BvdmVyLmNyZWF0ZURpdih7IHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU1Mzg2XHU1M0YyXCIsIGNsczogXCJzay1oaXN0b3J5LWVudHJ5XCIgfSk7XG5cdFx0fVxuXHRcdGxldCBoaWRlVGltZW91dDogTnVsbGFibGVUaW1lb3V0ID0gbnVsbDtcblx0XHRjb25zdCBjbGVhckhpZGVUaW1lb3V0ID0gKCkgPT4ge1xuXHRcdFx0aWYgKGhpZGVUaW1lb3V0ICE9PSBudWxsKSB7XG5cdFx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoaGlkZVRpbWVvdXQpO1xuXHRcdFx0XHRoaWRlVGltZW91dCA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBzaG93SGlzdG9yeSA9ICgpID0+IHtcblx0XHRcdGNsZWFySGlkZVRpbWVvdXQoKTtcblx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHR9O1xuXHRcdGNvbnN0IHNjaGVkdWxlSGlkZSA9ICgpID0+IHtcblx0XHRcdGNsZWFySGlkZVRpbWVvdXQoKTtcblx0XHRcdGhpZGVUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWhpc3RvcnlIb3N0Lmhhc0NsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIikpIHtcblx0XHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDE1MCk7XG5cdFx0fTtcblx0XHRoaXN0b3J5SG9zdC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93SGlzdG9yeSk7XG5cdFx0aGlzdG9yeUhvc3QuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgc2NoZWR1bGVIaWRlKTtcblx0XHRoaXN0b3J5TWFya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRjbGVhckhpZGVUaW1lb3V0KCk7XG5cdFx0XHRpZiAoaGlzdG9yeUhvc3QuaGFzQ2xhc3MoXCJzay1oaXN0b3J5LXBpbm5lZFwiKSkge1xuXHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpO1xuXHRcdFx0XHRpZiAoIWhpc3RvcnlIb3N0Lm1hdGNoZXMoXCI6aG92ZXJcIikpIHtcblx0XHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIik7XG5cdFx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCBkaXNhYmxlRHJhZyA9IChldnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGNhcmRFbC5zZXRBdHRyKFwiZHJhZ2dhYmxlXCIsIFwiZmFsc2VcIik7XG5cdFx0XHRjb25zdCBlbmFibGUgPSAoKSA9PiB7XG5cdFx0XHRcdGNhcmRFbC5zZXRBdHRyKFwiZHJhZ2dhYmxlXCIsIFwidHJ1ZVwiKTtcblx0XHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZW5hYmxlKTtcblx0XHRcdH07XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBlbmFibGUpO1xuXHRcdH07XG5cdFx0aGlzdG9yeUhvc3QuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBkaXNhYmxlRHJhZyk7XG5cdFx0cG9wb3Zlci5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGRpc2FibGVEcmFnKTtcblxuXHRcdGlmIChjYXJkLnRhZ3MubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCB0YWdSb3cgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdGFnc1wiIH0pO1xuXHRcdFx0Y2FyZC50YWdzLmZvckVhY2goKHRhZykgPT4gdGFnUm93LmNyZWF0ZURpdih7IGNsczogXCJzay10YWdcIiwgdGV4dDogdGFnIH0pKTtcblx0XHR9XG5cblx0XHRpZiAoY2FyZC5yZW1hcmspIHtcblx0XHRcdGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC1yZW1hcmtcIiwgdGV4dDogY2FyZC5yZW1hcmsgfSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWV0YSA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC1tZXRhXCIgfSk7XG5cdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NTIxQlx1NUVGQVx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLmNyZWF0ZWRBdCl9YCB9KTtcblx0XHRtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBgXHU2NkY0XHU2NUIwXHVGRjFBJHtmb3JtYXREYXRlKGNhcmQudXBkYXRlZEF0KX1gIH0pO1xuXHRcdGlmIChjYXJkLmRlYWRsaW5lKSB7XG5cdFx0XHRtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBgXHU2MjJBXHU2QjYyXHVGRjFBJHtmb3JtYXREYXRlKGNhcmQuZGVhZGxpbmUpfWAsIGNsczogXCJzay1jYXJkLWRlYWRsaW5lLXRleHRcIiB9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FyZEVsO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVEcm9wKHRhcmdldENvbHVtbklkOiBzdHJpbmcsIGJlZm9yZUNhcmRJZD86IHN0cmluZykge1xuXHRcdGlmICghdGhpcy5kcmFnU3RhdGUpIHJldHVybjtcblx0XHRjb25zdCB7IGNvbHVtbklkLCBjYXJkSWQgfSA9IHRoaXMuZHJhZ1N0YXRlO1xuXHRcdGlmICh0YXJnZXRDb2x1bW5JZCA9PT0gY29sdW1uSWQgJiYgYmVmb3JlQ2FyZElkID09PSBjYXJkSWQpIHtcblx0XHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wbHVnaW4ubW92ZUNhcmQoY2FyZElkLCBjb2x1bW5JZCwgdGFyZ2V0Q29sdW1uSWQsIGJlZm9yZUNhcmRJZCk7XG5cdFx0dGhpcy5yZXNldERyYWdTdGF0ZSgpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRCZWZvcmVDYXJkSWQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY2xpZW50WTogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBjYXJkcyA9IEFycmF5LmZyb20oY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFwiLnNrLWNhcmRcIikpO1xuXHRcdGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuXHRcdFx0Y29uc3QgcmVjdCA9IGNhcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRjb25zdCBtaWRwb2ludCA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyO1xuXHRcdFx0aWYgKGNsaWVudFkgPCBtaWRwb2ludCkge1xuXHRcdFx0XHRjb25zdCBpZCA9IGNhcmQuZGF0YXNldC5jYXJkSWQ7XG5cdFx0XHRcdHJldHVybiBpZCB8fCB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRwcml2YXRlIGdldENhcmRzRm9yQ29sdW1uKGNvbHVtbjogS2FuYmFuQ29sdW1uLCBkZWFkbGluZU9ubHk6IGJvb2xlYW4pOiBLYW5iYW5DYXJkW10ge1xuXHRcdGlmICghZGVhZGxpbmVPbmx5KSB7XG5cdFx0XHRyZXR1cm4gY29sdW1uLmNhcmRzO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uLmNhcmRzXG5cdFx0XHQuZmlsdGVyKChjYXJkKSA9PiAhIWNhcmQuZGVhZGxpbmUpXG5cdFx0XHQuc2xpY2UoKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgYVRpbWUgPSBhLmRlYWRsaW5lID8/IDA7XG5cdFx0XHRcdGNvbnN0IGJUaW1lID0gYi5kZWFkbGluZSA/PyAwO1xuXHRcdFx0XHRyZXR1cm4gYVRpbWUgLSBiVGltZTtcblx0XHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBlbnN1cmVQbGFjZWhvbGRlcigpOiBIVE1MRWxlbWVudCB7XG5cdFx0aWYgKCF0aGlzLnBsYWNlaG9sZGVyRWwpIHtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXJFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyRWwuYWRkQ2xhc3MoXCJzay1jYXJkLXBsYWNlaG9sZGVyXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5wbGFjZWhvbGRlckVsO1xuXHR9XG5cblx0cHJpdmF0ZSBtb3ZlUGxhY2Vob2xkZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgYmVmb3JlSWQ/OiBzdHJpbmcpIHtcblx0XHRpZiAoIXRoaXMuZHJhZ1N0YXRlKSByZXR1cm47XG5cdFx0Y29uc3QgY29sdW1uSWQgPSBjb250YWluZXIuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2x1bW5cIik7XG5cdFx0aWYgKCFjb2x1bW5JZCkgcmV0dXJuO1xuXHRcdGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5lbnN1cmVQbGFjZWhvbGRlcigpO1xuXHRcdGNvbnN0IGRlc2lyZWRIZWlnaHQgPSBNYXRoLm1heCh0aGlzLmRyYWdTdGF0ZS5jYXJkSGVpZ2h0IHx8IDAsIDQ4KTtcblx0XHRwbGFjZWhvbGRlci5zdHlsZS5oZWlnaHQgPSBgJHtkZXNpcmVkSGVpZ2h0fXB4YDtcblx0XHRpZiAocGxhY2Vob2xkZXIucGFyZW50RWxlbWVudCAhPT0gY29udGFpbmVyKSB7XG5cdFx0XHR0aGlzLnJlc3RvcmVQbGFjZWhvbGRlclBhcmVudCgpO1xuXHRcdFx0Y29udGFpbmVyLmFkZENsYXNzKFwic2stY2FyZHMtcGxhY2Vob2xkZXJcIik7XG5cdFx0fVxuXHRcdGNvbnN0IHJlZmVyZW5jZSA9IGJlZm9yZUlkXG5cdFx0XHQ/IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihgLnNrLWNhcmRbZGF0YS1jYXJkLWlkPVwiJHtiZWZvcmVJZH1cIl1gKVxuXHRcdFx0OiBudWxsO1xuXHRcdGlmIChyZWZlcmVuY2UpIHtcblx0XHRcdGNvbnRhaW5lci5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIHJlZmVyZW5jZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG5cdFx0fVxuXHRcdHRoaXMuc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShjb250YWluZXIsIGZhbHNlKTtcblx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGUgPSB7IGNvbHVtbklkLCBiZWZvcmVJZCB9O1xuXHR9XG5cblx0cHJpdmF0ZSByZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKSB7XG5cdFx0aWYgKHRoaXMucGxhY2Vob2xkZXJFbD8ucGFyZW50RWxlbWVudCkge1xuXHRcdFx0Y29uc3QgcGFyZW50ID0gdGhpcy5wbGFjZWhvbGRlckVsLnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRwYXJlbnQucmVtb3ZlQ2xhc3MoXCJzay1jYXJkcy1wbGFjZWhvbGRlclwiKTtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXJFbC5yZW1vdmUoKTtcblx0XHRcdHRoaXMuc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShwYXJlbnQsIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlUGxhY2Vob2xkZXIoKSB7XG5cdFx0dGhpcy5yZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKTtcblx0XHR0aGlzLnBsYWNlaG9sZGVyRWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXRFbXB0eU1lc3NhZ2VWaXNpYmxlKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHZpc2libGU6IGJvb2xlYW4pIHtcblx0XHRjb25zdCBlbXB0eUVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiLnNrLWVtcHR5XCIpO1xuXHRcdGlmIChlbXB0eUVsKSB7XG5cdFx0XHRlbXB0eUVsLnN0eWxlLmRpc3BsYXkgPSB2aXNpYmxlID8gXCJcIiA6IFwibm9uZVwiO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVzZXREcmFnU3RhdGUoKSB7XG5cdFx0dGhpcy5kcmFnU3RhdGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucmVtb3ZlUGxhY2Vob2xkZXIoKTtcblx0XHR0aGlzLmNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNrLWNhcmQtZHJvcFwiKS5mb3JFYWNoKChlbCkgPT4gKGVsIGFzIEhUTUxFbGVtZW50KS5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJvcFwiKSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclN0YXRDYXJkKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHRpdGxlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjYXJkID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0LWNhcmRcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogdGl0bGUsIGNsczogXCJzay1zdGF0LWNhcmQtdGl0bGVcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogdmFsdWUsIGNsczogXCJzay1zdGF0LWNhcmQtdmFsdWVcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogZGVzY3JpcHRpb24sIGNsczogXCJzay1zdGF0LWNhcmQtZGVzY1wiIH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEYWlseUJhckNoYXJ0KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHNlcmllczogRGFpbHlTdGF0c1BvaW50W10pIHtcblx0XHRpZiAoIXNlcmllcy5sZW5ndGgpIHtcblx0XHRcdGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZW1wdHlcIiwgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTY1NzBcdTYzNkVcIiB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3Qgc2Nyb2xsID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1zY3JvbGxcIiB9KTtcblx0XHRjb25zdCBjaGFydCA9IHNjcm9sbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQgc2stY2hhcnQtYmFyc1wiIH0pO1xuXHRcdGNvbnN0IHRvb2x0aXAgPSBjaGFydC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtdG9vbHRpcFwiIH0pO1xuXHRcdGNvbnN0IG1heFZhbHVlID0gTWF0aC5tYXgoXG5cdFx0XHQxLFxuXHRcdFx0Li4uc2VyaWVzLm1hcCgocG9pbnQpID0+IE1hdGgubWF4KHBvaW50LmNyZWF0ZWQsIHBvaW50LmNvbXBsZXRlZCkpLFxuXHRcdCk7XG5cblx0XHRjb25zdCBjb2x1bW5XaWR0aCA9IDM2O1xuXHRcdGNoYXJ0LnN0eWxlLm1pbldpZHRoID0gYCR7c2VyaWVzLmxlbmd0aCAqIGNvbHVtbldpZHRofXB4YDtcblxuXHRcdGNvbnN0IGhpZGVUb29sdGlwID0gKCkgPT4gdG9vbHRpcC5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XG5cblx0XHRzZXJpZXMuZm9yRWFjaCgocG9pbnQpID0+IHtcblx0XHRcdGNvbnN0IGNvbHVtbiA9IGNoYXJ0LmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1jb2xcIiB9KTtcblx0XHRcdGNvbnN0IGJhcnMgPSBjb2x1bW4uY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWNvbC1iYXJzXCIgfSk7XG5cdFx0XHRjb25zdCBjcmVhdGVkQmFyID0gYmFycy5jcmVhdGVEaXYoe1xuXHRcdFx0XHRjbHM6IFwic2stY2hhcnQtYmFyIHNrLWNoYXJ0LWJhci1jcmVhdGVkXCIsXG5cdFx0XHRcdGF0dHI6IHsgc3R5bGU6IGBoZWlnaHQ6JHsocG9pbnQuY3JlYXRlZCAvIG1heFZhbHVlKSAqIDEwMH0lYCB9LFxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBjb21wbGV0ZWRCYXIgPSBiYXJzLmNyZWF0ZURpdih7XG5cdFx0XHRcdGNsczogXCJzay1jaGFydC1iYXIgc2stY2hhcnQtYmFyLWNvbXBsZXRlZFwiLFxuXHRcdFx0XHRhdHRyOiB7IHN0eWxlOiBgaGVpZ2h0OiR7KHBvaW50LmNvbXBsZXRlZCAvIG1heFZhbHVlKSAqIDEwMH0lYCB9LFxuXHRcdFx0fSk7XG5cdFx0XHRjb2x1bW4uY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsXCIsIHRleHQ6IHBvaW50LmRhdGUuc2xpY2UoNSkgfSk7XG5cblx0XHRcdGNvbnN0IHNob3dUb29sdGlwID0gKGV2dDogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRjb25zdCB0YXJnZXQgPSBldnQuY3VycmVudFRhcmdldCBhcyBIVE1MRWxlbWVudDtcblx0XHRcdFx0dG9vbHRpcC5zZXRUZXh0KGAke3BvaW50LmRhdGV9IFx1NjVCMFx1NUVGQSAke3BvaW50LmNyZWF0ZWR9IFx1MDBCNyBcdTVCOENcdTYyMTAgJHtwb2ludC5jb21wbGV0ZWR9YCk7XG5cdFx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXHRcdFx0XHRjb25zdCBib3VuZHMgPSBjaGFydC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0Y29uc3QgeCA9IGV2dC5jbGllbnRYIC0gYm91bmRzLmxlZnQ7XG5cdFx0XHRcdGNvbnN0IHkgPSBldnQuY2xpZW50WSAtIGJvdW5kcy50b3AgLSAyMDtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7eH1weGA7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUudG9wID0gYCR7eX1weGA7XG5cdFx0XHR9O1xuXHRcdFx0W2NyZWF0ZWRCYXIsIGNvbXBsZXRlZEJhciwgY29sdW1uXS5mb3JFYWNoKChlbCkgPT4ge1xuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlVG9vbHRpcCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGxlZ2VuZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtbGVnZW5kXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTY1QjBcdTVFRkFcIiwgXCJ2YXIoLS1jb2xvci1jeWFuLCAjNGVjZGM0KVwiKTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NUI4Q1x1NjIxMFwiLCBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIik7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckxlZ2VuZEl0ZW0oY29udGFpbmVyOiBIVE1MRWxlbWVudCwgbGFiZWw6IHN0cmluZywgY29sb3I6IHN0cmluZykge1xuXHRcdGNvbnN0IGl0ZW0gPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWxlZ2VuZC1pdGVtXCIgfSk7XG5cdFx0Y29uc3QgZG90ID0gaXRlbS5jcmVhdGVEaXYoeyBjbHM6IFwic2stbGVnZW5kLWRvdFwiIH0pO1xuXHRcdChkb3QgYXMgSFRNTERpdkVsZW1lbnQpLnN0eWxlLmJhY2tncm91bmQgPSBjb2xvcjtcblx0XHRpdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiBsYWJlbCB9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGFpbHlSYXRlQ2hhcnQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2VyaWVzOiBEYWlseVJhdGVQb2ludFtdKSB7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gUmVuZGVyaW5nIGRhaWx5IHJhdGUgY2hhcnQgd2l0aFwiLCBzZXJpZXMubGVuZ3RoLCBcInBvaW50c1wiKTtcblx0XHRpZiAoIXNlcmllcy5sZW5ndGgpIHtcblx0XHRcdGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZW1wdHlcIiwgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTVCOENcdTYyMTBcdTczODdcdTY1NzBcdTYzNkVcIiB9KTtcblx0XHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIERhaWx5IHJhdGUgY2hhcnQgaGFzIG5vIGRhdGEuXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1N0YXRzXSBEYWlseSByYXRlIHNhbXBsZXNcIiwgc2VyaWVzKTtcblxuXHRcdGNvbnN0IHNjcm9sbCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtc2Nyb2xsXCIgfSk7XG5cdFx0Y29uc3QgY2hhcnRXcmFwcGVyID0gc2Nyb2xsLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydCBzay1jaGFydC1saW5lXCIgfSk7XG5cdFx0Y29uc3QgbWluQ29sdW1ucyA9IE1hdGgubWF4KHNlcmllcy5sZW5ndGgsIDcpO1xuXHRcdGNvbnN0IHN2Z1dpZHRoID0gbWluQ29sdW1ucyAqIDM2O1xuXHRcdGNvbnN0IGVmZmVjdGl2ZUNvdW50ID0gTWF0aC5tYXgoc2VyaWVzLmxlbmd0aCwgMik7XG5cdFx0Y29uc3QgY29sdW1uV2lkdGggPSAzNjtcblx0XHRjb25zdCB3aWR0aCA9IChlZmZlY3RpdmVDb3VudCAtIDEpICogY29sdW1uV2lkdGg7XG5cdFx0Y29uc3QgbWluV2lkdGggPSBNYXRoLm1heChzZXJpZXMubGVuZ3RoICogY29sdW1uV2lkdGgsIHdpZHRoICsgMjQpO1xuXHRcdGNoYXJ0V3JhcHBlci5zdHlsZS5taW5XaWR0aCA9IGAke21pbldpZHRofXB4YDtcblx0XHRjb25zdCBoZWlnaHQgPSAxNjA7XG5cdFx0Y29uc3QgbGVmdFBhZCA9IDEyO1xuXHRcdGNvbnN0IHJpZ2h0UGFkID0gMTI7XG5cdFx0Y29uc3QgdG90YWxXaWR0aCA9IHdpZHRoICsgbGVmdFBhZCArIHJpZ2h0UGFkO1xuXHRcdGNvbnN0IHN2ZyA9IGNyZWF0ZVN2Z0VsZW1lbnQoXCJzdmdcIikgYXMgU1ZHU1ZHRWxlbWVudDtcblx0XHRzZXRTdmdBdHRycyhzdmcsIHtcblx0XHRcdHZpZXdCb3g6IGAwIDAgJHt0b3RhbFdpZHRofSAke2hlaWdodH1gLFxuXHRcdFx0cHJlc2VydmVBc3BlY3RSYXRpbzogXCJub25lXCIsXG5cdFx0XHR3aWR0aDogU3RyaW5nKHRvdGFsV2lkdGgpLFxuXHRcdFx0aGVpZ2h0OiBTdHJpbmcoaGVpZ2h0KSxcblx0XHR9KTtcblx0XHRjaGFydFdyYXBwZXIuYXBwZW5kQ2hpbGQoc3ZnKTtcblxuXHRcdGNvbnN0IGJhc2VsaW5lID0gY3JlYXRlU3ZnRWxlbWVudChcImxpbmVcIik7XG5cdFx0c2V0U3ZnQXR0cnMoYmFzZWxpbmUsIHtcblx0XHRcdHgxOiBTdHJpbmcobGVmdFBhZCksXG5cdFx0XHR5MTogU3RyaW5nKGhlaWdodCAtIDEpLFxuXHRcdFx0eDI6IFN0cmluZyh0b3RhbFdpZHRoIC0gcmlnaHRQYWQpLFxuXHRcdFx0eTI6IFN0cmluZyhoZWlnaHQgLSAxKSxcblx0XHRcdHN0cm9rZTogXCJ2YXIoLS1iYWNrZ3JvdW5kLW1vZGlmaWVyLWJvcmRlcilcIixcblx0XHRcdFwic3Ryb2tlLXdpZHRoXCI6IFwiMVwiLFxuXHRcdH0pO1xuXHRcdHN2Zy5hcHBlbmRDaGlsZChiYXNlbGluZSk7XG5cblx0XHRjb25zdCBwb2ludHNEYXRhID0gc2VyaWVzLm1hcCgocG9pbnQsIGluZGV4KSA9PiB7XG5cdFx0XHRjb25zdCB4ID1cblx0XHRcdFx0c2VyaWVzLmxlbmd0aCA9PT0gMVxuXHRcdFx0XHRcdD8gbGVmdFBhZCArIHdpZHRoIC8gMlxuXHRcdFx0XHRcdDogbGVmdFBhZCArIChpbmRleCAvIChzZXJpZXMubGVuZ3RoIC0gMSB8fCAxKSkgKiB3aWR0aDtcblx0XHRcdGNvbnN0IGNsYW1wZWRSYXRlID0gTWF0aC5taW4oTWF0aC5tYXgocG9pbnQucmF0ZSwgMCksIDEwMCk7XG5cdFx0XHRjb25zdCB5ID0gaGVpZ2h0IC0gKGNsYW1wZWRSYXRlIC8gMTAwKSAqIChoZWlnaHQgLSAyMCkgLSAxMDtcblx0XHRcdHJldHVybiB7IHgsIHksIHJhdGU6IGNsYW1wZWRSYXRlIH07XG5cdFx0fSk7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gRGFpbHkgcmF0ZSBjb29yZGluYXRlc1wiLCBwb2ludHNEYXRhKTtcblx0XHRjb25zdCBwb2ludHMgPSBwb2ludHNEYXRhLm1hcCgocCkgPT4gYCR7cC54fSwke3AueX1gKS5qb2luKFwiIFwiKTtcblx0XHRjb25zdCBwb2x5bGluZSA9IGNyZWF0ZVN2Z0VsZW1lbnQoXCJwb2x5bGluZVwiKTtcblx0XHRzZXRTdmdBdHRycyhwb2x5bGluZSwge1xuXHRcdFx0cG9pbnRzLFxuXHRcdFx0ZmlsbDogXCJub25lXCIsXG5cdFx0XHRzdHJva2U6IFwidmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KVwiLFxuXHRcdFx0XCJzdHJva2Utd2lkdGhcIjogXCIzXCIsXG5cdFx0XHRcInN0cm9rZS1saW5lY2FwXCI6IFwicm91bmRcIixcblx0XHRcdFwic3Ryb2tlLWxpbmVqb2luXCI6IFwicm91bmRcIixcblx0XHR9KTtcblx0XHRzdmcuYXBwZW5kQ2hpbGQocG9seWxpbmUpO1xuXHRcdGNvbnN0IHRvb2x0aXAgPSBjaGFydFdyYXBwZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LXRvb2x0aXBcIiB9KTtcblx0XHRjb25zdCBoaWRlVG9vbHRpcCA9ICgpID0+IHRvb2x0aXAucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50LCBpbmRleCkgPT4ge1xuXHRcdFx0Y29uc3QgZG90WCA9XG5cdFx0XHRcdHNlcmllcy5sZW5ndGggPT09IDFcblx0XHRcdFx0XHQ/IGxlZnRQYWQgKyB3aWR0aCAvIDJcblx0XHRcdFx0XHQ6IGxlZnRQYWQgKyAoaW5kZXggLyAoc2VyaWVzLmxlbmd0aCAtIDEgfHwgMSkpICogd2lkdGg7XG5cdFx0XHRjb25zdCBjbGFtcGVkUmF0ZSA9IE1hdGgubWluKE1hdGgubWF4KHBvaW50LnJhdGUsIDApLCAxMDApO1xuXHRcdFx0Y29uc3QgZG90WSA9IGhlaWdodCAtIChjbGFtcGVkUmF0ZSAvIDEwMCkgKiAoaGVpZ2h0IC0gMjApIC0gMTA7XG5cdFx0XHRjb25zdCBjaXJjbGUgPSBjcmVhdGVTdmdFbGVtZW50KFwiY2lyY2xlXCIpO1xuXHRcdFx0c2V0U3ZnQXR0cnMoY2lyY2xlLCB7XG5cdFx0XHRcdGN4OiBTdHJpbmcoZG90WCksXG5cdFx0XHRcdGN5OiBTdHJpbmcoZG90WSksXG5cdFx0XHRcdHI6IFwiM1wiLFxuXHRcdFx0XHRmaWxsOiBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIixcblx0XHRcdH0pO1xuXHRcdFx0c3ZnLmFwcGVuZENoaWxkKGNpcmNsZSk7XG5cdFx0XHRjb25zdCBzaG93VG9vbHRpcCA9IChldnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3QgYm91bmRzID0gY2hhcnRXcmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRjb25zdCB4ID0gZXZ0LmNsaWVudFggLSBib3VuZHMubGVmdDtcblx0XHRcdFx0Y29uc3QgeSA9IGV2dC5jbGllbnRZIC0gYm91bmRzLnRvcCAtIDIwO1xuXHRcdFx0XHR0b29sdGlwLnNldFRleHQoYCR7cG9pbnQuZGF0ZX0gXHU1QjhDXHU2MjEwXHU3Mzg3ICR7cG9pbnQucmF0ZS50b0ZpeGVkKDEpfSVgKTtcblx0XHRcdFx0dG9vbHRpcC5hZGRDbGFzcyhcInZpc2libGVcIik7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUubGVmdCA9IGAke3h9cHhgO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLnRvcCA9IGAke3l9cHhgO1xuXHRcdFx0fTtcblx0XHRcdGNpcmNsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRjaXJjbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRjaXJjbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGlkZVRvb2x0aXApO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQWRkIHdpZGVyIGhvdmVyIGhpdGJveGVzIHRvIG1ha2UgdG9vbHRpcCBlYXNpZXIgdG8gdHJpZ2dlci5cblx0XHRwb2ludHNEYXRhLmZvckVhY2goKHBvaW50LCBpbmRleCkgPT4ge1xuXHRcdFx0Y29uc3QgcHJldiA9IHBvaW50c0RhdGFbaW5kZXggLSAxXTtcblx0XHRcdGNvbnN0IG5leHQgPSBwb2ludHNEYXRhW2luZGV4ICsgMV07XG5cdFx0XHRjb25zdCBsZWZ0Qm91bmQgPSBwcmV2ID8gKHByZXYueCArIHBvaW50LngpIC8gMiA6IGxlZnRQYWQ7XG5cdFx0XHRjb25zdCByaWdodEJvdW5kID0gbmV4dCA/IChwb2ludC54ICsgbmV4dC54KSAvIDIgOiB0b3RhbFdpZHRoIC0gcmlnaHRQYWQ7XG5cdFx0XHRjb25zdCBoaXRib3ggPSBjcmVhdGVTdmdFbGVtZW50KFwicmVjdFwiKTtcblx0XHRcdHNldFN2Z0F0dHJzKGhpdGJveCwge1xuXHRcdFx0XHR4OiBTdHJpbmcobGVmdEJvdW5kKSxcblx0XHRcdFx0eTogXCIwXCIsXG5cdFx0XHRcdHdpZHRoOiBTdHJpbmcoTWF0aC5tYXgoNCwgcmlnaHRCb3VuZCAtIGxlZnRCb3VuZCkpLFxuXHRcdFx0XHRoZWlnaHQ6IFN0cmluZyhoZWlnaHQpLFxuXHRcdFx0XHRmaWxsOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IHNob3dUb29sdGlwID0gKGV2dDogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRjb25zdCBib3VuZHMgPSBjaGFydFdyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdGNvbnN0IHggPSBldnQuY2xpZW50WCAtIGJvdW5kcy5sZWZ0O1xuXHRcdFx0XHRjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSBib3VuZHMudG9wIC0gMjA7XG5cdFx0XHRcdHRvb2x0aXAuc2V0VGV4dChgJHtzZXJpZXNbaW5kZXhdLmRhdGV9IFx1NUI4Q1x1NjIxMFx1NzM4NyAke3Nlcmllc1tpbmRleF0ucmF0ZS50b0ZpeGVkKDEpfSVgKTtcblx0XHRcdFx0dG9vbHRpcC5hZGRDbGFzcyhcInZpc2libGVcIik7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUubGVmdCA9IGAke3h9cHhgO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLnRvcCA9IGAke3l9cHhgO1xuXHRcdFx0fTtcblx0XHRcdGhpdGJveC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRoaXRib3guYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRoaXRib3guYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGlkZVRvb2x0aXApO1xuXHRcdFx0c3ZnLmFwcGVuZENoaWxkKGhpdGJveCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBsYWJlbHMgPSBjaGFydFdyYXBwZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsLXJvd1wiIH0pIGFzIEhUTUxEaXZFbGVtZW50O1xuXHRcdGxhYmVscy5zdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zID0gYHJlcGVhdCgke01hdGgubWF4KHNlcmllcy5sZW5ndGgsIDEpfSwgbWlubWF4KDAsIDFmcikpYDtcblx0XHRzZXJpZXMuZm9yRWFjaCgocG9pbnQpID0+IHtcblx0XHRcdGxhYmVscy5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtbGFiZWxcIiwgdGV4dDogcG9pbnQuZGF0ZS5zbGljZSg1KSB9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgZmlsdGVyQ2FyZHMoY2FyZHM6IEthbmJhbkNhcmRbXSwgc2VhcmNoOiBzdHJpbmcpOiBLYW5iYW5DYXJkW10ge1xuXHRcdGlmICghc2VhcmNoLnRyaW0oKSkgcmV0dXJuIGNhcmRzO1xuXHRcdHJldHVybiBjYXJkcy5maWx0ZXIoKGNhcmQpID0+IHtcblx0XHRcdGNvbnN0IHRleHQgPSBbXG5cdFx0XHRcdGNhcmQudGl0bGUsXG5cdFx0XHRcdGNhcmQucmVtYXJrLFxuXHRcdFx0XHRjYXJkLnRhZ3Muam9pbihcIiBcIiksXG5cdFx0XHRcdC4uLihBcnJheS5pc0FycmF5KGNhcmQuaGlzdG9yeSlcblx0XHRcdFx0XHQ/IGNhcmQuaGlzdG9yeS5tYXAoKGgpID0+IGgucmVtYXJrIHx8IFwiXCIpLmZpbHRlcihCb29sZWFuKVxuXHRcdFx0XHRcdDogW10pLFxuXHRcdFx0XS5qb2luKFwiIFwiKTtcblx0XHRcdHJldHVybiB0aGlzLm1hdGNoZXNTZWFyY2hUZXh0KHNlYXJjaCwgdGV4dCk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIG1hdGNoZXNTZWFyY2hUZXh0KHNlYXJjaDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRpZiAoIXNlYXJjaC50cmltKCkpIHJldHVybiB0cnVlO1xuXHRcdHJldHVybiB0ZXh0LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoLnRvTG93ZXJDYXNlKCkpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEZWFkbGluZUJyZWFrZG93bihjb250YWluZXI6IEhUTUxFbGVtZW50LCBzdGF0czogU3RhdHNTbmFwc2hvdCkge1xuXHRcdGlmICghc3RhdHMuZGVhZGxpbmVDb3VudCkge1xuXHRcdFx0Y29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1lbXB0eVwiLCB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1OEJCRVx1N0Y2RVx1NjIyQVx1NkI2Mlx1NjVGNlx1OTVGNFx1NzY4NFx1NEVGQlx1NTJBMVwiIH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBpbmZvID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1kZWFkbGluZS1pbmZvXCIgfSk7XG5cdFx0aW5mby5jcmVhdGVEaXYoeyB0ZXh0OiBgXHU2NzA5XHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXHVGRjFBJHtzdGF0cy5kZWFkbGluZUNvdW50fWAsIGNsczogXCJzay1kZWFkbGluZS1saW5lXCIgfSk7XG5cdFx0aW5mby5jcmVhdGVEaXYoe1xuXHRcdFx0dGV4dDogYFx1NjIyQVx1NkI2Mlx1ODk4Nlx1NzZENlx1NzM4N1x1RkYxQSR7Zm9ybWF0UGVyY2VudChzdGF0cy5kZWFkbGluZUNvdmVyYWdlKX1gLFxuXHRcdFx0Y2xzOiBcInNrLWRlYWRsaW5lLWxpbmVcIixcblx0XHR9KTtcblxuXHRcdGNvbnN0IHByb2dyZXNzID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1wcm9ncmVzc1wiIH0pO1xuXHRcdHByb2dyZXNzLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFwic2stcHJvZ3Jlc3Mtb24tdGltZVwiLFxuXHRcdFx0YXR0cjogeyBzdHlsZTogYHdpZHRoOiR7Zm9ybWF0UGVyY2VudFZhbHVlKHN0YXRzLm9uVGltZVJhdGUpfSVgIH0sXG5cdFx0fSk7XG5cdFx0cHJvZ3Jlc3MuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogXCJzay1wcm9ncmVzcy1vdmVyZHVlXCIsXG5cdFx0XHRhdHRyOiB7IHN0eWxlOiBgd2lkdGg6JHtmb3JtYXRQZXJjZW50VmFsdWUoc3RhdHMub3ZlcmR1ZVJhdGUpfSVgIH0sXG5cdFx0fSk7XG5cblx0XHRjb25zdCBsZWdlbmQgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXByb2dyZXNzLWxlZ2VuZFwiIH0pO1xuXHRcdHRoaXMucmVuZGVyTGVnZW5kSXRlbShsZWdlbmQsIFwiXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwXCIsIFwidmFyKC0tY29sb3ItZ3JlZW4sICM0Y2FmNTApXCIpO1xuXHRcdHRoaXMucmVuZGVyTGVnZW5kSXRlbShsZWdlbmQsIFwiXHU1REYyL1x1NUMwNlx1OTAzRVx1NjcxRlwiLCBcInZhcigtLWNvbG9yLXJlZCwgI2ZmNmI2YilcIik7XG5cdH1cblxuXHRwcml2YXRlIGJ1aWxkU3RhdHNTbmFwc2hvdChyYW5nZTogU3RhdHNSYW5nZSk6IFN0YXRzU25hcHNob3Qge1xuXHRcdGNvbnN0IGJvYXJkID0gdGhpcy5wbHVnaW4uZ2V0Qm9hcmQoKTtcblx0XHRjb25zdCBjYXJkcyA9IGJvYXJkLmNvbHVtbnMuZmxhdE1hcCgoY29sKSA9PiBjb2wuY2FyZHMpO1xuXHRcdGNvbnN0IHRvdGFsVGFza3MgPSBjYXJkcy5sZW5ndGg7XG5cdFx0Y29uc3QgY29tcGxldGVkQ2FyZHMgPSBjYXJkcy5maWx0ZXIoKGNhcmQpID0+IGNhcmQuY29tcGxldGVkKTtcblx0XHRjb25zdCBjb21wbGV0ZWRUYXNrcyA9IGNvbXBsZXRlZENhcmRzLmxlbmd0aDtcblx0XHRjb25zdCB3aXBDb3VudCA9IHRvdGFsVGFza3MgLSBjb21wbGV0ZWRUYXNrcztcblx0XHRjb25zdCBjb21wbGV0aW9uUmF0ZSA9IHRvdGFsVGFza3MgPyBjb21wbGV0ZWRUYXNrcyAvIHRvdGFsVGFza3MgOiAwO1xuXHRcdGNvbnN0IGRlYWRsaW5lQ2FyZHMgPSBjYXJkcy5maWx0ZXIoKGNhcmQpID0+ICEhY2FyZC5kZWFkbGluZSk7XG5cdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRjb25zdCBvdmVyZHVlQ291bnQgPSBkZWFkbGluZUNhcmRzLmZpbHRlcigoY2FyZCkgPT4ge1xuXHRcdFx0aWYgKCFjYXJkLmRlYWRsaW5lKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRpZiAoY2FyZC5jb21wbGV0ZWQpIHtcblx0XHRcdFx0Y29uc3QgZG9uZUF0ID0gY2FyZC5jb21wbGV0ZWRBdCA/PyBjYXJkLnVwZGF0ZWRBdDtcblx0XHRcdFx0cmV0dXJuICEhZG9uZUF0ICYmIGRvbmVBdCA+IGNhcmQuZGVhZGxpbmU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbm93ID4gY2FyZC5kZWFkbGluZTtcblx0XHR9KS5sZW5ndGg7XG5cdFx0Y29uc3Qgb25UaW1lQ291bnQgPSBkZWFkbGluZUNhcmRzLmZpbHRlcigoY2FyZCkgPT4ge1xuXHRcdFx0aWYgKCFjYXJkLmRlYWRsaW5lIHx8ICFjYXJkLmNvbXBsZXRlZCkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y29uc3QgZG9uZUF0ID0gY2FyZC5jb21wbGV0ZWRBdCA/PyBjYXJkLnVwZGF0ZWRBdDtcblx0XHRcdHJldHVybiAhIWRvbmVBdCAmJiBkb25lQXQgPD0gY2FyZC5kZWFkbGluZTtcblx0XHR9KS5sZW5ndGg7XG5cdFx0Y29uc3QgYXZnQ3ljbGVUaW1lTXMgPSAoKCkgPT4ge1xuXHRcdFx0Y29uc3QgZmluaXNoZWQgPSBjb21wbGV0ZWRDYXJkcy5maWx0ZXIoKGNhcmQpID0+IGNhcmQuY29tcGxldGVkQXQpO1xuXHRcdFx0aWYgKCFmaW5pc2hlZC5sZW5ndGgpIHJldHVybiBudWxsO1xuXHRcdFx0Y29uc3QgdG90YWwgPSBmaW5pc2hlZC5yZWR1Y2UoXG5cdFx0XHRcdChzdW0sIGNhcmQpID0+IHN1bSArIE1hdGgubWF4KDAsIChjYXJkLmNvbXBsZXRlZEF0ISAtIGNhcmQuY3JlYXRlZEF0KSksXG5cdFx0XHRcdDAsXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIHRvdGFsIC8gZmluaXNoZWQubGVuZ3RoO1xuXHRcdH0pKCk7XG5cblx0XHRjb25zdCBkYWlseUNyZWF0ZWQgPSB0aGlzLmJ1aWxkRGFpbHlTZXJpZXMoY2FyZHMsIFwiY3JlYXRlZFwiLCByYW5nZSk7XG5cdFx0Y29uc3QgZGFpbHlDb21wbGV0ZWQgPSB0aGlzLmJ1aWxkRGFpbHlTZXJpZXMoY2FyZHMsIFwiY29tcGxldGVkXCIsIHJhbmdlKTtcblx0XHRjb25zdCBkYWlseVNlcmllczogRGFpbHlTdGF0c1BvaW50W10gPSBkYWlseUNyZWF0ZWQubWFwKChwb2ludCwgaW5kZXgpID0+ICh7XG5cdFx0XHRkYXRlOiBwb2ludC5kYXRlLFxuXHRcdFx0Y3JlYXRlZDogcG9pbnQudmFsdWUsXG5cdFx0XHRjb21wbGV0ZWQ6IGRhaWx5Q29tcGxldGVkW2luZGV4XT8udmFsdWUgPz8gMCxcblx0XHR9KSk7XG5cdFx0Y29uc3QgZGFpbHlSYXRlczogRGFpbHlSYXRlUG9pbnRbXSA9IGRhaWx5U2VyaWVzLm1hcCgocG9pbnQpID0+ICh7XG5cdFx0XHRkYXRlOiBwb2ludC5kYXRlLFxuXHRcdFx0cmF0ZTpcblx0XHRcdFx0cG9pbnQuY3JlYXRlZCB8fCBwb2ludC5jb21wbGV0ZWRcblx0XHRcdFx0XHQ/IE1hdGgubWluKDEwMCwgKHBvaW50LmNvbXBsZXRlZCAvIE1hdGgubWF4KHBvaW50LmNyZWF0ZWQsIHBvaW50LmNvbXBsZXRlZCwgMSkpICogMTAwKVxuXHRcdFx0XHRcdDogMCxcblx0XHR9KSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dG90YWxUYXNrcyxcblx0XHRcdGNvbXBsZXRlZFRhc2tzLFxuXHRcdFx0d2lwQ291bnQsXG5cdFx0XHRjb21wbGV0aW9uUmF0ZSxcblx0XHRcdGRlYWRsaW5lQ291bnQ6IGRlYWRsaW5lQ2FyZHMubGVuZ3RoLFxuXHRcdFx0ZGVhZGxpbmVDb3ZlcmFnZTogdG90YWxUYXNrcyA/IGRlYWRsaW5lQ2FyZHMubGVuZ3RoIC8gdG90YWxUYXNrcyA6IDAsXG5cdFx0XHRvdmVyZHVlQ291bnQsXG5cdFx0XHRvdmVyZHVlUmF0ZTogZGVhZGxpbmVDYXJkcy5sZW5ndGggPyBvdmVyZHVlQ291bnQgLyBkZWFkbGluZUNhcmRzLmxlbmd0aCA6IDAsXG5cdFx0XHRvblRpbWVSYXRlOiBkZWFkbGluZUNhcmRzLmxlbmd0aCA/IG9uVGltZUNvdW50IC8gZGVhZGxpbmVDYXJkcy5sZW5ndGggOiAwLFxuXHRcdFx0YXZnQ3ljbGVUaW1lTXMsXG5cdFx0XHRkYWlseVNlcmllcyxcblx0XHRcdGRhaWx5UmF0ZXMsXG5cdFx0fTtcblx0fVxuXG5cdHByaXZhdGUgYnVpbGREYWlseVNlcmllcyhjYXJkczogS2FuYmFuQ2FyZFtdLCBraW5kOiBcImNyZWF0ZWRcIiB8IFwiY29tcGxldGVkXCIsIHJhbmdlOiBTdGF0c1JhbmdlKSB7XG5cdFx0Y29uc3QgbXNQZXJEYXkgPSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gdGhpcy5yZXNvbHZlUmFuZ2UocmFuZ2UpO1xuXHRcdGNvbnN0IGRheXMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKChlbmQgLSBzdGFydCkgLyBtc1BlckRheSkgKyAxKTtcblx0XHRjb25zdCBidWNrZXRzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblx0XHRsZXQgcHJvY2Vzc2VkID0gMDtcblx0XHRsZXQgb3V0T2ZSYW5nZSA9IDA7XG5cdFx0bGV0IG1pc3NpbmcgPSAwO1xuXG5cdFx0Zm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG5cdFx0XHRjb25zdCB0aW1lc3RhbXAgPVxuXHRcdFx0XHRraW5kID09PSBcImNyZWF0ZWRcIlxuXHRcdFx0XHRcdD8gY2FyZC5jcmVhdGVkQXRcblx0XHRcdFx0XHQ6IGNhcmQuY29tcGxldGVkQXQgPz8gKGNhcmQuY29tcGxldGVkID8gY2FyZC51cGRhdGVkQXQgOiBudWxsKTtcblx0XHRcdGlmICghdGltZXN0YW1wKSB7XG5cdFx0XHRcdG1pc3NpbmcrKztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGltZXN0YW1wIDwgc3RhcnQgfHwgdGltZXN0YW1wID4gZW5kKSB7XG5cdFx0XHRcdG91dE9mUmFuZ2UrKztcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBrZXkgPSB0aGlzLnRvRGF5S2V5KHRpbWVzdGFtcCk7XG5cdFx0XHRidWNrZXRzLnNldChrZXksIChidWNrZXRzLmdldChrZXkpID8/IDApICsgMSk7XG5cdFx0XHRwcm9jZXNzZWQrKztcblx0XHR9XG5cblx0XHRjb25zdCBzZXJpZXM6IERhaWx5Q291bnRQb2ludFtdID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBkYXlzOyBpKyspIHtcblx0XHRcdGNvbnN0IGRheVRzID0gc3RhcnQgKyBpICogbXNQZXJEYXk7XG5cdFx0XHRjb25zdCBrZXkgPSB0aGlzLnRvRGF5S2V5KGRheVRzKTtcblx0XHRcdHNlcmllcy5wdXNoKHsgZGF0ZToga2V5LCB2YWx1ZTogYnVja2V0cy5nZXQoa2V5KSA/PyAwIH0pO1xuXHRcdH1cblx0XHRjb25zdCBsYWJlbCA9IGtpbmQgPT09IFwiY3JlYXRlZFwiID8gXCJDcmVhdGVkXCIgOiBcIkNvbXBsZXRlZFwiO1xuXHRcdGNvbnNvbGUubG9nKGBbU2ltcGxlS2FuYmFuXVtTdGF0c10gJHtsYWJlbH0gc2VyaWVzIHN0YXRzYCwge1xuXHRcdFx0cmFuZ2VTdGFydDogbmV3IERhdGUoc3RhcnQpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApLFxuXHRcdFx0cmFuZ2VFbmQ6IG5ldyBEYXRlKGVuZCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCksXG5cdFx0XHRwb2ludHM6IHNlcmllcy5sZW5ndGgsXG5cdFx0XHRwcm9jZXNzZWQsXG5cdFx0XHRvdXRPZlJhbmdlLFxuXHRcdFx0bWlzc2luZyxcblx0XHR9KTtcblx0XHRyZXR1cm4gc2VyaWVzO1xuXHR9XG5cblx0cHJpdmF0ZSByZXNvbHZlUmFuZ2UocmFuZ2U6IFN0YXRzUmFuZ2UpOiB7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyIH0ge1xuXHRcdGlmIChyYW5nZS50eXBlID09PSBcImN1c3RvbVwiKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzdGFydDogdGhpcy5zdGFydE9mRGF5KHJhbmdlLnN0YXJ0KSxcblx0XHRcdFx0ZW5kOiB0aGlzLnN0YXJ0T2ZEYXkocmFuZ2UuZW5kKSxcblx0XHRcdH07XG5cdFx0fVxuXHRcdGNvbnN0IG1zUGVyRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRjb25zdCBlbmQgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0Y29uc3Qgc3RhcnQgPSBlbmQgLSAocmFuZ2UuZGF5cyAtIDEpICogbXNQZXJEYXk7XG5cdFx0cmV0dXJuIHsgc3RhcnQsIGVuZCB9O1xuXHR9XG5cblx0cHJpdmF0ZSB0b0RheUtleSh0aW1lc3RhbXA6IG51bWJlcik6IHN0cmluZyB7XG5cdFx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdFx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0XHRjb25zdCBtID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0XHRjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdFx0cmV0dXJuIGAke3l9LSR7bX0tJHtkfWA7XG5cdH1cblxuXHRwcml2YXRlIHN0YXJ0T2ZEYXkodGltZXN0YW1wOiBudW1iZXIpOiBudW1iZXIge1xuXHRcdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRcdGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG5cdFx0cmV0dXJuIGRhdGUuZ2V0VGltZSgpO1xuXHR9XG5cblx0cHJpdmF0ZSByZXNvbHZlVGltZWxpbmVSYW5nZSgpOiB7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyIH0ge1xuXHRcdGlmICh0aGlzLnRpbWVsaW5lUHJlc2V0ID09PSBcImN1c3RvbVwiICYmIHRoaXMudGltZWxpbmVDdXN0b20pIHtcblx0XHRcdHJldHVybiB0aGlzLnRpbWVsaW5lQ3VzdG9tO1xuXHRcdH1cblx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCA9PT0gXCJ5ZXN0ZXJkYXlcIikge1xuXHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRjb25zdCB5ZXN0ZXJkYXkgPSB0b2RheSAtIDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cdFx0XHRyZXR1cm4geyBzdGFydDogeWVzdGVyZGF5LCBlbmQ6IHllc3RlcmRheSB9O1xuXHRcdH1cblx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRyZXR1cm4geyBzdGFydDogdG9kYXksIGVuZDogdG9kYXkgfTtcblx0fVxuXG5cdHByaXZhdGUgYnVpbGRUaW1lbGluZUVudHJpZXMoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIpOiBUaW1lbGluZUVudHJ5W10ge1xuXHRcdGNvbnN0IGJvYXJkID0gdGhpcy5wbHVnaW4uZ2V0Qm9hcmQoKTtcblx0XHRjb25zdCBlbnRyaWVzOiBUaW1lbGluZUVudHJ5W10gPSBbXTtcblx0XHRjb25zdCBzdGFydFRzID0gdGhpcy5zdGFydE9mRGF5KHN0YXJ0KTtcblx0XHRjb25zdCBlbmRUcyA9IHRoaXMuc3RhcnRPZkRheShlbmQpICsgMjQgKiA2MCAqIDYwICogMTAwMCAtIDE7XG5cdFx0Zm9yIChjb25zdCBjb2x1bW4gb2YgYm9hcmQuY29sdW1ucykge1xuXHRcdFx0Zm9yIChjb25zdCBjYXJkIG9mIGNvbHVtbi5jYXJkcykge1xuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoY2FyZC5oaXN0b3J5KSkgY29udGludWU7XG5cdFx0XHRcdGZvciAoY29uc3QgaXRlbSBvZiBjYXJkLmhpc3RvcnkpIHtcblx0XHRcdFx0XHRpZiAoIWl0ZW0udGltZXN0YW1wKSBjb250aW51ZTtcblx0XHRcdFx0XHRpZiAoaXRlbS50aW1lc3RhbXAgPCBzdGFydFRzIHx8IGl0ZW0udGltZXN0YW1wID4gZW5kVHMpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdGVudHJpZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRjYXJkSWQ6IGNhcmQuaWQsXG5cdFx0XHRcdFx0XHRjYXJkVGl0bGU6IGNhcmQudGl0bGUsXG5cdFx0XHRcdFx0XHRjb2x1bW5OYW1lOiBjb2x1bW4ubmFtZSxcblx0XHRcdFx0XHRcdHRpbWVzdGFtcDogaXRlbS50aW1lc3RhbXAsXG5cdFx0XHRcdFx0XHR0ZXh0OiBpdGVtLnJlbWFyayB8fCBcIlx1NjZGNFx1NjVCMFwiLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEudGltZXN0YW1wIC0gYi50aW1lc3RhbXApO1xuXHR9XG59XG5cbmNsYXNzIENhcmRNb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSB0aXRsZVZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSB0YWdzVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIHJlbWFya1ZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSBoaXN0b3J5Tm90ZSA9IFwiXCI7XG5cdHByaXZhdGUgZGVhZGxpbmVWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgc3VibWl0dGluZyA9IGZhbHNlO1xuXHRwcml2YXRlIGtleUhhbmRsZXIgPSAoZXZ0OiBLZXlib2FyZEV2ZW50KSA9PiB7XG5cdFx0aWYgKFxuXHRcdFx0ZXZ0LmtleSA9PT0gXCJFbnRlclwiICYmXG5cdFx0XHQhZXZ0LnNoaWZ0S2V5ICYmXG5cdFx0XHQhZXZ0Lm1ldGFLZXkgJiZcblx0XHRcdCFldnQuY3RybEtleSAmJlxuXHRcdFx0IWV2dC5hbHRLZXkgJiZcblx0XHRcdCFldnQuaXNDb21wb3Npbmdcblx0XHQpIHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dm9pZCB0aGlzLmhhbmRsZVN1Ym1pdCgpO1xuXHRcdH1cblx0fTtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRhcHA6IEFwcCxcblx0XHRwcml2YXRlIHBsdWdpbjogU2ltcGxlS2FuYmFuUGx1Z2luLFxuXHRcdHByaXZhdGUgY29sdW1uSWQ6IHN0cmluZyxcblx0XHRwcml2YXRlIGNhcmQ/OiBLYW5iYW5DYXJkLFxuXHQpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMucGx1Z2luLnNldEFjdGl2ZUNvbHVtbihjb2x1bW5JZCk7XG5cdFx0aWYgKGNhcmQpIHtcblx0XHRcdHRoaXMudGl0bGVWYWx1ZSA9IGNhcmQudGl0bGU7XG5cdFx0XHR0aGlzLnRhZ3NWYWx1ZSA9IGNhcmQudGFncy5qb2luKFwiLCBcIik7XG5cdFx0XHR0aGlzLnJlbWFya1ZhbHVlID0gY2FyZC5yZW1hcms7XG5cdFx0XHR0aGlzLmRlYWRsaW5lVmFsdWUgPSBmb3JtYXREYXRlVGltZUlucHV0KGNhcmQuZGVhZGxpbmUpO1xuXHRcdH1cblx0fVxuXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHRjb250ZW50RWwuYWRkQ2xhc3MoXCJzay1tb2RhbFwiKTtcblx0XHRjb250ZW50RWwuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlIYW5kbGVyKTtcblxuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy5jYXJkID8gXCJcdTdGMTZcdThGOTFcdTUzNjFcdTcyNDdcIiA6IFwiXHU2NUIwXHU1ODlFXHU1MzYxXHU3MjQ3XCIgfSk7XG5cblx0XHR0aGlzLnRpdGxlVmFsdWUgPSB0aGlzLnRpdGxlVmFsdWUgfHwgXCJcIjtcblx0XHRjcmVhdGVUZXh0RmllbGQoY29udGVudEVsLCBcIlx1NjgwN1x1OTg5OFwiLCB0aGlzLnRpdGxlVmFsdWUsICh2YWx1ZSkgPT4ge1xuXHRcdFx0dGhpcy50aXRsZVZhbHVlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRjcmVhdGVUZXh0RmllbGQoY29udGVudEVsLCBcIlx1NjgwN1x1N0I3RVx1RkYwOFx1OTAxN1x1NTNGN1x1NTIwNlx1OTY5NFx1RkYwOVwiLCB0aGlzLnRhZ3NWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLnRhZ3NWYWx1ZSA9IHZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0XHRjcmVhdGVUZXh0QXJlYShjb250ZW50RWwsIFwiXHU1OTA3XHU2Q0U4XCIsIHRoaXMucmVtYXJrVmFsdWUsICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLnJlbWFya1ZhbHVlID0gdmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y3JlYXRlRGF0ZVRpbWVGaWVsZChjb250ZW50RWwsIFwiXHU2MjJBXHU2QjYyXHU2NUY2XHU5NUY0XCIsIHRoaXMuZGVhZGxpbmVWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdHRoaXMuZGVhZGxpbmVWYWx1ZSA9IHZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRjcmVhdGVUZXh0QXJlYShjb250ZW50RWwsIFwiXHU0RkVFXHU2NTM5XHU4QkY0XHU2NjBFXHVGRjA4XHU1MTk5XHU1MTY1XHU1Mzg2XHU1M0YyXHVGRjA5XCIsIFwiXCIsICh2YWx1ZSkgPT4ge1xuXHRcdFx0dGhpcy5oaXN0b3J5Tm90ZSA9IHZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1tb2RhbC1mb290ZXJcIiB9KTtcblx0XHRjb25zdCBjYW5jZWxCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1NTNENlx1NkQ4OFwiLCBjbHM6IFwic2stYnRuIHNrLWJ0bi1naG9zdFwiIH0pO1xuXHRcdGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcblxuXHRcdGNvbnN0IHN1Ym1pdEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLmNhcmQgPyBcIlx1NEZERFx1NUI1OFwiIDogXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRzdWJtaXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHZvaWQgdGhpcy5oYW5kbGVTdWJtaXQoKSk7XG5cdH1cblxuXHRvbkNsb3NlKCkge1xuXHRcdHRoaXMuY29udGVudEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5SGFuZGxlcik7XG5cdFx0c3VwZXIub25DbG9zZSgpO1xuXHR9XG5cblx0YXN5bmMgaGFuZGxlU3VibWl0KCkge1xuXHRcdGlmICh0aGlzLnN1Ym1pdHRpbmcpIHJldHVybjtcblx0XHRpZiAoIXRoaXMudGl0bGVWYWx1ZS50cmltKCkpIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdTY4MDdcdTk4OThcdTRFMERcdTgwRkRcdTRFM0FcdTdBN0FcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHRhZ3MgPSBwYXJzZVRhZ3ModGhpcy50YWdzVmFsdWUpO1xuXHRcdGNvbnN0IHJlbWFyayA9IHRoaXMucmVtYXJrVmFsdWUudHJpbSgpO1xuXHRcdGNvbnN0IGRlYWRsaW5lID0gcGFyc2VEYXRlVGltZUlucHV0KHRoaXMuZGVhZGxpbmVWYWx1ZSk7XG5cdFx0dGhpcy5zdWJtaXR0aW5nID0gdHJ1ZTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKHRoaXMuY2FyZCkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi51cGRhdGVDYXJkKFxuXHRcdFx0XHRcdHRoaXMuY29sdW1uSWQsXG5cdFx0XHRcdFx0dGhpcy5jYXJkLmlkLFxuXHRcdFx0XHRcdHsgdGl0bGU6IHRoaXMudGl0bGVWYWx1ZSwgdGFncywgcmVtYXJrLCBkZWFkbGluZSB9LFxuXHRcdFx0XHRcdHRoaXMuaGlzdG9yeU5vdGUudHJpbSgpIHx8IFwiXHU1MTg1XHU1QkI5XHU2NkY0XHU2NUIwXCIsXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5hZGRDYXJkKHRoaXMuY29sdW1uSWQsIHtcblx0XHRcdFx0XHR0aXRsZTogdGhpcy50aXRsZVZhbHVlLFxuXHRcdFx0XHRcdHRhZ3MsXG5cdFx0XHRcdFx0cmVtYXJrLFxuXHRcdFx0XHRcdGhpc3RvcnlOb3RlOiB0aGlzLmhpc3RvcnlOb3RlLnRyaW0oKSB8fCBcIlx1NTIxQlx1NUVGQVwiLFxuXHRcdFx0XHRcdGRlYWRsaW5lLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIltTaW1wbGVLYW5iYW5dW0NhcmRNb2RhbF0gc3VibWl0IGZhaWxlZFwiLCBlcnJvcik7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU0RkREXHU1QjU4XHU1OTMxXHU4RDI1XHVGRjBDXHU4QkY3XHU5MUNEXHU4QkQ1XCIpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLnN1Ym1pdHRpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn1cblxuaW50ZXJmYWNlIENvbHVtbk1vZGFsT3B0aW9ucyB7XG5cdHRpdGxlOiBzdHJpbmc7XG5cdGluaXRpYWxWYWx1ZT86IHN0cmluZztcblx0Y29uZmlybVRleHQ/OiBzdHJpbmc7XG5cdG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbn1cblxuY2xhc3MgQ29sdW1uTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHByaXZhdGUgdmFsdWU6IHN0cmluZztcblxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvcHRpb25zOiBDb2x1bW5Nb2RhbE9wdGlvbnMpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMudmFsdWUgPSBvcHRpb25zLmluaXRpYWxWYWx1ZSA/PyBcIlwiO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy5vcHRpb25zLnRpdGxlIH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MEZcdTc2RUVcdTU0MERcdTc5RjBcIiwgdGhpcy52YWx1ZSwgKHZhbHVlKSA9PiAodGhpcy52YWx1ZSA9IHZhbHVlKSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU1M0Q2XHU2RDg4XCIsIGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIgfSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3QgY29uZmlybUJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY29uZmlybVRleHQgfHwgXCJcdTc4NkVcdThCQTRcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRhd2FpdCB0aGlzLm9wdGlvbnMub25TdWJtaXQodGhpcy52YWx1ZSk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH1cbn1cblxuaW50ZXJmYWNlIENvbmZpcm1Nb2RhbE9wdGlvbnMge1xuXHR0aXRsZTogc3RyaW5nO1xuXHRtZXNzYWdlOiBzdHJpbmc7XG5cdGNvbmZpcm1UZXh0Pzogc3RyaW5nO1xuXHRjYW5jZWxUZXh0Pzogc3RyaW5nO1xuXHRvbkNvbmZpcm06ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuXG5jbGFzcyBDb25maXJtTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9wdGlvbnM6IENvbmZpcm1Nb2RhbE9wdGlvbnMpIHtcblx0XHRzdXBlcihhcHApO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy5vcHRpb25zLnRpdGxlIH0pO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVEaXYoeyB0ZXh0OiB0aGlzLm9wdGlvbnMubWVzc2FnZSwgY2xzOiBcInNrLWNvbmZpcm0tdGV4dFwiIH0pO1xuXG5cdFx0Y29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1tb2RhbC1mb290ZXJcIiB9KTtcblx0XHRjb25zdCBjYW5jZWxCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogdGhpcy5vcHRpb25zLmNhbmNlbFRleHQgfHwgXCJcdTUzRDZcdTZEODhcIixcblx0XHRcdGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIsXG5cdFx0fSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3QgY29uZmlybUJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY29uZmlybVRleHQgfHwgXCJcdTc4NkVcdThCQTRcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRhd2FpdCB0aGlzLm9wdGlvbnMub25Db25maXJtKCk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUYWdzKGlucHV0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdHJldHVybiBpbnB1dFxuXHRcdC5zcGxpdChcIixcIilcblx0XHQubWFwKCh0YWcpID0+IHRhZy50cmltKCkpXG5cdFx0LmZpbHRlcigodGFnKSA9PiAhIXRhZyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0ZVRpbWVJbnB1dCh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG5cdGlmICghdmFsdWUudHJpbSgpKSByZXR1cm4gbnVsbDtcblx0Y29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG5cdHJldHVybiBOdW1iZXIuaXNOYU4ocGFyc2VkKSA/IG51bGwgOiBwYXJzZWQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVUaW1lSW5wdXQodmFsdWU/OiBudW1iZXIgfCBudWxsKTogc3RyaW5nIHtcblx0aWYgKCF2YWx1ZSkgcmV0dXJuIFwiXCI7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG5cdGNvbnN0IHl5eXkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG1tID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgZGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgaGggPSBTdHJpbmcoZGF0ZS5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IG1pbiA9IFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eXl5eX0tJHttbX0tJHtkZH1UJHtoaH06JHttaW59YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSWQoKSB7XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSArIERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGhoID0gU3RyaW5nKGRhdGUuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBtbSA9IFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9ICR7aGh9OiR7bW19YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VGltZSh0aW1lc3RhbXA6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRjb25zdCBoaCA9IFN0cmluZyhkYXRlLmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgbW0gPSBTdHJpbmcoZGF0ZS5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke2hofToke21tfWA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVPbmx5KHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5fS0ke219LSR7ZH1gO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQZXJjZW50KHZhbHVlOiBudW1iZXIsIGRpZ2l0cyA9IDApOiBzdHJpbmcge1xuXHRpZiAoIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiBcIjAlXCI7XG5cdHJldHVybiBgJHsoTWF0aC5tYXgoMCwgdmFsdWUpICogMTAwKS50b0ZpeGVkKGRpZ2l0cyl9JWA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFBlcmNlbnRWYWx1ZSh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcblx0aWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gMDtcblx0cmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgdmFsdWUgKiAxMDApKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RHVyYXRpb24obXM6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKG1zIC8gNjAwMDApO1xuXHRjb25zdCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcblx0Y29uc3QgZGF5cyA9IE1hdGguZmxvb3IoaG91cnMgLyAyNCk7XG5cdGlmIChkYXlzID4gMCkge1xuXHRcdGNvbnN0IHJlbUhvdXJzID0gaG91cnMgJSAyNDtcblx0XHRyZXR1cm4gcmVtSG91cnMgPyBgJHtkYXlzfVx1NTkyOSR7cmVtSG91cnN9XHU1QzBGXHU2NUY2YCA6IGAke2RheXN9XHU1OTI5YDtcblx0fVxuXHRpZiAoaG91cnMgPiAwKSB7XG5cdFx0Y29uc3QgcmVtTWludXRlcyA9IG1pbnV0ZXMgJSA2MDtcblx0XHRyZXR1cm4gcmVtTWludXRlcyA/IGAke2hvdXJzfVx1NUMwRlx1NjVGNiR7cmVtTWludXRlc31cdTUyMDZgIDogYCR7aG91cnN9XHU1QzBGXHU2NUY2YDtcblx0fVxuXHRyZXR1cm4gYCR7TWF0aC5tYXgobWludXRlcywgMSl9XHU1MjA2YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke3l9LSR7bX0tJHtkfWA7XG59XG5cbmNvbnN0IFNWR19OUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcblxuZnVuY3Rpb24gY3JlYXRlU3ZnRWxlbWVudDxUIGV4dGVuZHMga2V5b2YgU1ZHRWxlbWVudFRhZ05hbWVNYXA+KHRhZzogVCk6IFNWR0VsZW1lbnRUYWdOYW1lTWFwW1RdIHtcblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIHRhZyk7XG59XG5cbmZ1bmN0aW9uIHNldFN2Z0F0dHJzKGVsOiBFbGVtZW50LCBhdHRyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuXHRPYmplY3QuZW50cmllcyhhdHRycykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiBlbC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0RmllbGQoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgaW5wdXQgPSB3cmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiB9KTtcblx0aW5wdXQudmFsdWUgPSB2YWx1ZTtcblx0aW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGVUaW1lRmllbGQoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgaW5wdXQgPSB3cmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGV0aW1lLWxvY2FsXCIgfSk7XG5cdGlucHV0LnZhbHVlID0gdmFsdWU7XG5cdGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZ0KSA9PiBvbkNoYW5nZSgoZXZ0LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0QXJlYShcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0bGFiZWw6IHN0cmluZyxcblx0dmFsdWU6IHN0cmluZyxcblx0b25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG5cdGNvbnN0IHdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWZpZWxkXCIgfSk7XG5cdHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IHRleHQ6IGxhYmVsIH0pO1xuXHRjb25zdCB0ZXh0YXJlYSA9IHdyYXBwZXIuY3JlYXRlRWwoXCJ0ZXh0YXJlYVwiKTtcblx0dGV4dGFyZWEudmFsdWUgPSB2YWx1ZTtcblx0dGV4dGFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQpLnZhbHVlKSk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFBNkU7QUFFN0UsSUFBTSxZQUFZO0FBQ2xCLElBQU0sVUFBVTtBQTJFaEIsSUFBTSxrQkFBa0IsQ0FBQyxzQkFBTyxzQkFBTyxvQkFBSztBQUc1QyxTQUFTLHFCQUFzQztBQUM5QyxTQUFPO0FBQUEsSUFDTixTQUFTLGdCQUFnQixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQ3ZDLElBQUksU0FBUztBQUFBLE1BQ2I7QUFBQSxNQUNBLE9BQU8sQ0FBQztBQUFBLElBQ1QsRUFBRTtBQUFBLEVBQ0g7QUFDRDtBQUVBLElBQXFCLHFCQUFyQixjQUFnRCx1QkFBTztBQUFBLEVBQXZEO0FBQUE7QUFDQyxTQUFRLFFBQXlCLG1CQUFtQjtBQUNwRCxTQUFRLFFBQVEsb0JBQUksSUFBZ0I7QUFBQTtBQUFBLEVBR3BDLE1BQU0sU0FBUztBQUNkLFVBQU0sS0FBSyxVQUFVO0FBRXJCO0FBQUEsTUFDQztBQUFBLE1BQ0E7QUFBQSxJQUNEO0FBRUEsU0FBSyxhQUFhLFdBQVcsQ0FBQyxTQUFTO0FBQ3RDLFlBQU0sT0FBTyxJQUFJLFdBQVcsTUFBTSxJQUFJO0FBQ3RDLFdBQUssbUJBQW1CLElBQUk7QUFDNUIsYUFBTztBQUFBLElBQ1IsQ0FBQztBQUVELFNBQUssY0FBYyxTQUFTLHdDQUFVLE1BQU0sS0FBSyxhQUFhLENBQUM7QUFDL0QsU0FBSyxXQUFXO0FBQUEsTUFDZixJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhO0FBQUEsSUFDbkMsQ0FBQztBQUNELFNBQUssV0FBVztBQUFBLE1BQ2YsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLEVBQUUsV0FBVyxDQUFDLE9BQU8sT0FBTyxHQUFHLEtBQUssSUFBSSxDQUFDO0FBQUEsTUFDbkQsVUFBVSxNQUFNLEtBQUssaUJBQWlCO0FBQUEsSUFDdkMsQ0FBQztBQUVELFNBQUssSUFBSSxVQUFVLGNBQWMsTUFBTSxLQUFLLGFBQWEsQ0FBQztBQUFBLEVBQzNEO0FBQUEsRUFFQSxXQUFXO0FBQ1YsU0FBSyxNQUFNLE1BQU07QUFBQSxFQUNsQjtBQUFBLEVBRUEsTUFBYyxZQUFZO0FBQ3pCLFVBQU0sU0FBUyxNQUFNLEtBQUssU0FBUztBQUNuQyxRQUFJLFVBQVUsT0FBTyxTQUFTO0FBQzdCLFdBQUssUUFBUTtBQUFBLElBQ2QsT0FBTztBQUNOLFdBQUssUUFBUSxtQkFBbUI7QUFBQSxJQUNqQztBQUNBLFNBQUssZUFBZTtBQUNwQixTQUFLLGVBQWUsS0FBSyxNQUFNLFFBQVEsQ0FBQyxHQUFHO0FBQUEsRUFDNUM7QUFBQSxFQUVBLE1BQWMsVUFBVTtBQUN2QixVQUFNLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFDOUIsU0FBSyxZQUFZO0FBQUEsRUFDbEI7QUFBQSxFQUVBLG1CQUFtQixNQUFrQjtBQUNwQyxTQUFLLE1BQU0sSUFBSSxJQUFJO0FBQ25CLFNBQUssU0FBUyxNQUFNLEtBQUssTUFBTSxPQUFPLElBQUksQ0FBQztBQUFBLEVBQzVDO0FBQUEsRUFFQSxjQUFjO0FBQ2IsU0FBSyxNQUFNLFFBQVEsQ0FBQyxTQUFTLEtBQUssT0FBTyxDQUFDO0FBQUEsRUFDM0M7QUFBQSxFQUVBLFdBQTRCO0FBQzNCLFdBQU8sS0FBSztBQUFBLEVBQ2I7QUFBQSxFQUVBLE1BQU0sVUFBVSxNQUFjO0FBQzdCLFFBQUksQ0FBQyxLQUFLLEtBQUssR0FBRztBQUNqQixVQUFJLHVCQUFPLGtEQUFVO0FBQ3JCO0FBQUEsSUFDRDtBQUNBLFVBQU0sU0FBUyxFQUFFLElBQUksU0FBUyxHQUFHLE1BQU0sS0FBSyxLQUFLLEdBQUcsT0FBTyxDQUFDLEVBQWtCO0FBQzlFLFNBQUssTUFBTSxRQUFRLEtBQUssTUFBTTtBQUM5QixRQUFJLENBQUMsS0FBSyxjQUFjO0FBQ3ZCLFdBQUssZUFBZSxPQUFPO0FBQUEsSUFDNUI7QUFDQSxVQUFNLEtBQUssUUFBUTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxNQUFNLGFBQWEsVUFBa0I7QUFDcEMsVUFBTSxRQUFRLEtBQUssTUFBTSxRQUFRLFVBQVUsQ0FBQyxRQUFRLElBQUksT0FBTyxRQUFRO0FBQ3ZFLFFBQUksVUFBVSxJQUFJO0FBQ2pCLFVBQUksdUJBQU8sNENBQVM7QUFDcEI7QUFBQSxJQUNEO0FBQ0EsU0FBSyxNQUFNLFFBQVEsT0FBTyxPQUFPLENBQUM7QUFDbEMsUUFBSSxLQUFLLGlCQUFpQixVQUFVO0FBQ25DLFdBQUssZUFBZSxLQUFLLE1BQU0sUUFBUSxDQUFDLEdBQUc7QUFBQSxJQUM1QztBQUNBLFVBQU0sS0FBSyxRQUFRO0FBQUEsRUFDcEI7QUFBQSxFQUVBLE1BQU0sYUFBYSxVQUFrQixNQUFjO0FBQ2xELFVBQU0sU0FBUyxLQUFLLFVBQVUsUUFBUTtBQUN0QyxVQUFNLFdBQVcsS0FBSyxLQUFLO0FBQzNCLFFBQUksQ0FBQyxVQUFVO0FBQ2QsVUFBSSx1QkFBTyxrREFBVTtBQUNyQjtBQUFBLElBQ0Q7QUFDQSxXQUFPLE9BQU87QUFDZCxVQUFNLEtBQUssUUFBUTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxNQUFNLFFBQ0wsVUFDQSxTQU9DO0FBQ0QsVUFBTSxTQUFTLEtBQUssVUFBVSxRQUFRO0FBQ3RDLFVBQU0sTUFBTSxLQUFLLElBQUk7QUFDckIsVUFBTSxPQUFtQjtBQUFBLE1BQ3hCLElBQUksU0FBUztBQUFBLE1BQ2IsT0FBTyxRQUFRLE1BQU0sS0FBSztBQUFBLE1BQzFCLE1BQU0sUUFBUTtBQUFBLE1BQ2QsUUFBUSxRQUFRO0FBQUEsTUFDaEIsVUFBVSxRQUFRLFlBQVk7QUFBQSxNQUM5QixXQUFXO0FBQUEsTUFDWCxhQUFhO0FBQUEsTUFDYixXQUFXO0FBQUEsTUFDWCxXQUFXO0FBQUEsTUFDWCxTQUFTLENBQUM7QUFBQSxJQUNYO0FBQ0EsU0FBSyxjQUFjLE1BQU0sUUFBUSxlQUFlLGNBQUk7QUFDcEQsV0FBTyxNQUFNLFFBQVEsSUFBSTtBQUN6QixVQUFNLEtBQUssUUFBUTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxNQUFNLFdBQ0wsVUFDQSxRQUNBLFNBQ0EsYUFDQztBQUNELFVBQU0sT0FBTyxLQUFLLFFBQVEsVUFBVSxNQUFNO0FBQzFDLFFBQUksQ0FBQztBQUFNO0FBQ1gsUUFBSSxRQUFRLFVBQVU7QUFBVyxXQUFLLFFBQVEsUUFBUSxNQUFNLEtBQUs7QUFDakUsUUFBSSxRQUFRLFNBQVM7QUFBVyxXQUFLLE9BQU8sUUFBUTtBQUNwRCxRQUFJLFFBQVEsV0FBVztBQUFXLFdBQUssU0FBUyxRQUFRO0FBQ3hELFFBQUksUUFBUSxhQUFhO0FBQVcsV0FBSyxXQUFXLFFBQVE7QUFDNUQsU0FBSyxZQUFZLEtBQUssSUFBSTtBQUMxQixTQUFLLGNBQWMsTUFBTSxlQUFlLDBCQUFNO0FBQzlDLFVBQU0sS0FBSyxRQUFRO0FBQUEsRUFDcEI7QUFBQSxFQUVBLE1BQU0sU0FDTCxRQUNBLGNBQ0EsWUFDQSxjQUNDO0FBQ0QsVUFBTSxhQUFhLEtBQUssVUFBVSxZQUFZO0FBQzlDLFVBQU0sV0FBVyxLQUFLLFVBQVUsVUFBVTtBQUMxQyxVQUFNLFFBQVEsV0FBVyxNQUFNLFVBQVUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxNQUFNO0FBQy9ELFFBQUksVUFBVTtBQUFJO0FBQ2xCLFVBQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxNQUFNLE9BQU8sT0FBTyxDQUFDO0FBQy9DLFFBQUksY0FBYyxTQUFTLE1BQU07QUFDakMsUUFBSSxjQUFjO0FBQ2pCLFlBQU0sY0FBYyxTQUFTLE1BQU0sVUFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLFlBQVk7QUFDekUsb0JBQWMsZ0JBQWdCLEtBQUssU0FBUyxNQUFNLFNBQVM7QUFBQSxJQUM1RDtBQUNBLGFBQVMsTUFBTSxPQUFPLGFBQWEsR0FBRyxJQUFJO0FBQzFDLFNBQUssWUFBWSxLQUFLLElBQUk7QUFDMUIsUUFBSSxpQkFBaUIsWUFBWTtBQUNoQyxXQUFLLGNBQWMsTUFBTSwyQkFBTyxTQUFTLElBQUksUUFBRztBQUFBLElBQ2pELE9BQU87QUFDTixXQUFLLGNBQWMsTUFBTSwwQkFBTTtBQUFBLElBQ2hDO0FBQ0EsVUFBTSxLQUFLLFFBQVE7QUFBQSxFQUNwQjtBQUFBLEVBRUEsTUFBTSxxQkFBcUIsVUFBa0IsUUFBZ0IsV0FBb0I7QUFDaEYsVUFBTSxTQUFTLEtBQUssVUFBVSxRQUFRO0FBQ3RDLFVBQU0sUUFBUSxPQUFPLE1BQU0sVUFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLE1BQU07QUFDM0QsUUFBSSxVQUFVO0FBQUk7QUFDbEIsVUFBTSxDQUFDLElBQUksSUFBSSxPQUFPLE1BQU0sT0FBTyxPQUFPLENBQUM7QUFDM0MsU0FBSyxZQUFZO0FBQ2pCLFNBQUssY0FBYyxZQUFZLEtBQUssSUFBSSxJQUFJO0FBQzVDLFNBQUssWUFBWSxLQUFLLElBQUk7QUFDMUIsU0FBSyxjQUFjLE1BQU0sWUFBWSw2QkFBUywwQkFBTTtBQUNwRCxVQUFNLGNBQWMsWUFBWSxPQUFPLE1BQU0sU0FBUyxLQUFLLElBQUksT0FBTyxPQUFPLE1BQU0sTUFBTTtBQUN6RixXQUFPLE1BQU0sT0FBTyxhQUFhLEdBQUcsSUFBSTtBQUN4QyxVQUFNLEtBQUssUUFBUTtBQUFBLEVBQ3BCO0FBQUEsRUFFUSxVQUFVLFVBQWdDO0FBQ2pELFVBQU0sU0FBUyxLQUFLLE1BQU0sUUFBUSxLQUFLLENBQUMsUUFBUSxJQUFJLE9BQU8sUUFBUTtBQUNuRSxRQUFJLENBQUMsUUFBUTtBQUNaLFlBQU0sSUFBSSxNQUFNLGtEQUFVO0FBQUEsSUFDM0I7QUFDQSxXQUFPO0FBQUEsRUFDUjtBQUFBLEVBRVEsUUFBUSxVQUFrQixRQUF3QztBQUN6RSxVQUFNLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDdEMsV0FBTyxPQUFPLE1BQU0sS0FBSyxDQUFDLFNBQVMsS0FBSyxPQUFPLE1BQU07QUFBQSxFQUN0RDtBQUFBLEVBRVEsY0FBYyxNQUFrQixRQUFnQjtBQUN2RCxRQUFJLENBQUMsTUFBTSxRQUFRLEtBQUssT0FBTyxHQUFHO0FBQ2pDLFdBQUssVUFBVSxDQUFDO0FBQUEsSUFDakI7QUFDQSxTQUFLLFFBQVEsUUFBUTtBQUFBLE1BQ3BCLFdBQVcsS0FBSyxJQUFJO0FBQUEsTUFDcEIsUUFBUSxVQUFVO0FBQUEsSUFDbkIsQ0FBQztBQUNELFNBQUssVUFBVSxLQUFLLFFBQVEsTUFBTSxHQUFHLEVBQUU7QUFBQSxFQUN4QztBQUFBLEVBRVEsaUJBQWlCO0FBQ3hCLGVBQVcsVUFBVSxLQUFLLE1BQU0sU0FBUztBQUN4QyxhQUFPLFFBQVEsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVO0FBQUEsUUFDMUMsR0FBRztBQUFBLFFBQ0gsVUFBVSxLQUFLLFlBQVk7QUFBQSxRQUMzQixhQUFhLEtBQUssZUFBZTtBQUFBLE1BQ2xDLEVBQUU7QUFBQSxJQUNIO0FBQUEsRUFDRDtBQUFBLEVBRUEsTUFBTSxlQUFlO0FBQ3BCLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0IsU0FBUztBQUMzRCxRQUFJLE9BQU8sU0FBUyxHQUFHO0FBQ3RCLFdBQUssSUFBSSxVQUFVLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFDdkM7QUFBQSxJQUNEO0FBQ0EsVUFBTSxZQUFZLEtBQUssSUFBSSxVQUFVLGFBQWEsS0FBSztBQUN2RCxVQUFNLFdBQVcsYUFBYSxFQUFFLE1BQU0sV0FBVyxRQUFRLEtBQUssQ0FBQztBQUMvRCxRQUFJLFdBQVc7QUFDZCxXQUFLLElBQUksVUFBVSxXQUFXLFNBQVM7QUFBQSxJQUN4QztBQUFBLEVBQ0Q7QUFBQSxFQUVBLGdCQUFnQixVQUFrQjtBQUNqQyxTQUFLLGVBQWU7QUFBQSxFQUNyQjtBQUFBLEVBRVEsMkJBQXFEO0FBQzVELFFBQUksQ0FBQyxLQUFLLE1BQU0sUUFBUTtBQUFRLGFBQU87QUFDdkMsVUFBTSxZQUNMLEtBQUssZ0JBQWdCLEtBQUssTUFBTSxRQUFRLEtBQUssQ0FBQyxRQUFRLElBQUksT0FBTyxLQUFLLFlBQVk7QUFDbkYsV0FBTyxhQUFhLEtBQUssTUFBTSxRQUFRLENBQUM7QUFBQSxFQUN6QztBQUFBLEVBRUEsbUJBQW1CO0FBQ2xCLFVBQU0sU0FBUyxLQUFLLHlCQUF5QjtBQUM3QyxRQUFJLENBQUMsUUFBUTtBQUNaLFVBQUksdUJBQU8sc0NBQVE7QUFDbkI7QUFBQSxJQUNEO0FBQ0EsU0FBSyxnQkFBZ0IsT0FBTyxFQUFFO0FBQzlCLFFBQUksVUFBVSxLQUFLLEtBQUssTUFBTSxPQUFPLEVBQUUsRUFBRSxLQUFLO0FBQUEsRUFDL0M7QUFDRDtBQUVBLElBQU0sYUFBTixjQUF5Qix5QkFBUztBQUFBLEVBd0JqQyxZQUFZLE1BQTZCLFFBQTRCO0FBQ3BFLFVBQU0sSUFBSTtBQUQ4QjtBQXBCekMsU0FBUSxrQkFBa0Isb0JBQUksSUFBcUI7QUFDbkQsU0FBUSxZQUE0QztBQUNwRCxTQUFRLGFBQXlCLEVBQUUsTUFBTSxVQUFVLE1BQU0sR0FBRztBQUM1RCxTQUFRLGlCQUFzQztBQUU5QyxTQUFRLGdCQUFnQjtBQUd4QixTQUFRLGVBQWUsb0JBQUksSUFBb0I7QUFDL0MsU0FBUSxjQUFjO0FBQ3RCLFNBQVEsaUJBQWlCO0FBQ3pCLFNBQVEsdUJBQW9EO0FBRTVELFNBQVEsbUJBQW1CO0FBQzNCLFNBQVEsc0JBQXNCO0FBQzlCLFNBQVEsZ0JBQWdCLENBQUMsUUFBZTtBQUN2QyxZQUFNLFNBQVUsSUFBSSxVQUEwQixLQUFLLGdCQUFnQixLQUFLO0FBQ3hFLFdBQUssZ0JBQWdCLE9BQU87QUFBQSxJQUM3QjtBQUFBLEVBSUE7QUFBQSxFQUVBLGNBQWM7QUFDYixXQUFPO0FBQUEsRUFDUjtBQUFBLEVBRUEsaUJBQXlCO0FBQ3hCLFdBQU87QUFBQSxFQUNSO0FBQUEsRUFFQSxVQUFrQjtBQUNqQixXQUFPO0FBQUEsRUFDUjtBQUFBLEVBRUEsTUFBTSxTQUFTO0FBQ2QsU0FBSyxPQUFPO0FBQUEsRUFDYjtBQUFBLEVBRUEsTUFBTSxVQUFVO0FBQ2YsU0FBSyxZQUFZO0FBQ2pCLFNBQUsscUJBQXFCO0FBQzFCLFNBQUssb0JBQW9CO0FBQUEsRUFDMUI7QUFBQSxFQUVBLFNBQVM7QUFDUixVQUFNLFlBQVksS0FBSztBQUN2QixVQUFNLFFBQVEsS0FBSyxpQkFBaUIsU0FBUztBQUM3QyxVQUFNLGdCQUFnQixLQUFLLGNBQWMsYUFBYSxVQUFVO0FBQ2hFLFVBQU0sY0FBYyxPQUFPLGFBQWE7QUFDeEMsU0FBSyxnQkFBZ0I7QUFDckIsVUFBTSxZQUFZO0FBQ2xCLFlBQVEsSUFBSSx3Q0FBd0M7QUFBQSxNQUNuRCxLQUFLLEtBQUs7QUFBQSxNQUNWLE9BQU8sS0FBSztBQUFBLE1BQ1osU0FBUztBQUFBLE1BQ1QsT0FBTztBQUFBLElBQ1IsQ0FBQztBQUVELFNBQUssb0JBQW9CO0FBQ3pCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMsV0FBVztBQUU5QixVQUFNLE9BQU8sVUFBVSxVQUFVLEVBQUUsS0FBSyxVQUFVLENBQUM7QUFDbkQsU0FBSyxnQkFBZ0IsTUFBTSxTQUFTLDBCQUFNO0FBQzFDLFNBQUssZ0JBQWdCLE1BQU0sU0FBUywwQkFBTTtBQUMxQyxTQUFLLGdCQUFnQixNQUFNLFlBQVksb0JBQUs7QUFFNUMsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssZUFBZSxDQUFDO0FBQ3hELFFBQUksS0FBSyxjQUFjLFNBQVM7QUFDL0IsV0FBSyxZQUFZLElBQUk7QUFBQSxJQUN0QixXQUFXLEtBQUssY0FBYyxTQUFTO0FBQ3RDLFdBQUssWUFBWSxJQUFJO0FBQUEsSUFDdEIsT0FBTztBQUNOLFdBQUssZUFBZSxJQUFJO0FBQUEsSUFDekI7QUFDQSxTQUFLLGtCQUFrQixJQUFJO0FBQzNCLFNBQUssbUJBQW1CLGFBQWEsS0FBSztBQUUxQyxTQUFLLG9CQUFvQjtBQUFBLEVBQzFCO0FBQUEsRUFFUSxrQkFBa0IsSUFBaUI7QUFDMUMsU0FBSyxxQkFBcUI7QUFDMUIsU0FBSyxlQUFlO0FBQ3BCLFNBQUssYUFBYSxpQkFBaUIsVUFBVSxLQUFLLGVBQWUsRUFBRSxTQUFTLEtBQUssQ0FBQztBQUNsRixVQUFNLGVBQWUsS0FBSztBQUMxQixZQUFRLElBQUksZ0NBQWdDO0FBQUEsTUFDM0MsS0FBSyxLQUFLO0FBQUEsTUFDVjtBQUFBLE1BQ0EsY0FBYyxLQUFLLGFBQWE7QUFBQSxNQUNoQyxjQUFjLEtBQUssYUFBYTtBQUFBLElBQ2pDLENBQUM7QUFDRCwwQkFBc0IsTUFBTTtBQUMzQixVQUFJLEtBQUssY0FBYztBQUN0QixhQUFLLGFBQWEsWUFBWTtBQUM5QixnQkFBUSxJQUFJLHVDQUF1QztBQUFBLFVBQ2xELEtBQUssS0FBSztBQUFBLFVBQ1YsVUFBVTtBQUFBLFVBQ1YsUUFBUSxLQUFLLGFBQWE7QUFBQSxVQUMxQixjQUFjLEtBQUssYUFBYTtBQUFBLFVBQ2hDLGNBQWMsS0FBSyxhQUFhO0FBQUEsVUFDaEMsT0FBTyxLQUFLLG1CQUFtQixhQUFhO0FBQUEsUUFDN0MsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNELENBQUM7QUFBQSxFQUNGO0FBQUEsRUFFUSx1QkFBdUI7QUFDOUIsUUFBSSxLQUFLLGNBQWM7QUFDdEIsV0FBSyxhQUFhLG9CQUFvQixVQUFVLEtBQUssYUFBYTtBQUFBLElBQ25FO0FBQ0EsU0FBSyxlQUFlO0FBQUEsRUFDckI7QUFBQSxFQUVRLG1CQUFtQixPQUFlLFFBQXNCO0FBQy9ELFFBQUksQ0FBQztBQUFRO0FBQ2IsU0FBSyxvQkFBb0I7QUFDekIsMEJBQXNCLE1BQU07QUFDM0IsVUFBSSxLQUFLLG1CQUFtQjtBQUMzQixhQUFLLGtCQUFrQixZQUFZO0FBQUEsTUFDcEM7QUFBQSxJQUNELENBQUM7QUFBQSxFQUNGO0FBQUEsRUFFUSxzQkFBc0I7QUFDN0IsVUFBTSxhQUFhLE1BQU07QUFBQSxNQUN4QixLQUFLLFVBQVUsaUJBQThCLHdCQUF3QjtBQUFBLElBQ3RFO0FBQ0EsZUFBVyxRQUFRLENBQUMsT0FBTztBQUMxQixZQUFNLFdBQVcsR0FBRyxhQUFhLGFBQWE7QUFDOUMsVUFBSSxVQUFVO0FBQ2IsYUFBSyxhQUFhLElBQUksVUFBVSxHQUFHLFNBQVM7QUFBQSxNQUM3QztBQUFBLElBQ0QsQ0FBQztBQUFBLEVBQ0Y7QUFBQSxFQUVRLHNCQUFzQjtBQUM3QixVQUFNLGFBQWEsTUFBTTtBQUFBLE1BQ3hCLEtBQUssVUFBVSxpQkFBOEIsd0JBQXdCO0FBQUEsSUFDdEU7QUFDQSxlQUFXLFFBQVEsQ0FBQyxPQUFPO0FBQzFCLFlBQU0sV0FBVyxHQUFHLGFBQWEsYUFBYTtBQUM5QyxVQUFJLENBQUM7QUFBVTtBQUNmLFlBQU0sU0FBUyxLQUFLLGFBQWEsSUFBSSxRQUFRLEtBQUs7QUFDbEQsU0FBRyxZQUFZO0FBQ2YsU0FBRztBQUFBLFFBQ0Y7QUFBQSxRQUNBLENBQUMsUUFBUTtBQUNSLGdCQUFNLFdBQVcsSUFBSTtBQUNyQixlQUFLLGFBQWEsSUFBSSxVQUFVLFNBQVMsU0FBUztBQUFBLFFBQ25EO0FBQUEsUUFDQSxFQUFFLFNBQVMsS0FBSztBQUFBLE1BQ2pCO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRVEsaUJBQWlCLElBQXFDO0FBQzdELFFBQUksT0FBMkI7QUFDL0IsV0FBTyxNQUFNO0FBQ1osVUFBSSxLQUFLLGVBQWUsS0FBSyxlQUFlLEdBQUc7QUFDOUMsZUFBTztBQUFBLE1BQ1I7QUFDQSxhQUFPLEtBQUs7QUFBQSxJQUNiO0FBQ0EsV0FBTztBQUFBLEVBQ1I7QUFBQSxFQUVRLG1CQUFtQixLQUEyQixPQUF5QjtBQUM5RSxRQUFJLEtBQUsseUJBQXlCO0FBQUs7QUFDdkMsVUFBTSxZQUFZLEtBQUs7QUFDdkIsMEJBQXNCLE1BQU07QUFDM0IsWUFBTSxNQUFNLEVBQUUsZUFBZSxLQUFLLENBQUM7QUFDbkMsVUFBSSxXQUFXO0FBQ2QsY0FBTSxrQkFBa0IsVUFBVSxPQUFPLFVBQVUsR0FBRztBQUFBLE1BQ3ZEO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRVEsZ0JBQWdCLFdBQXdCLEtBQXdCLE9BQWU7QUFDdEYsVUFBTSxTQUFTLFVBQVUsU0FBUyxVQUFVO0FBQUEsTUFDM0MsTUFBTTtBQUFBLE1BQ04sS0FBSyxDQUFDLFVBQVUsS0FBSyxjQUFjLE1BQU0sa0JBQWtCLEVBQUUsRUFBRSxLQUFLLEdBQUcsRUFBRSxLQUFLO0FBQUEsSUFDL0UsQ0FBQztBQUNELFdBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUN0QyxVQUFJLEtBQUssY0FBYztBQUFLO0FBQzVCLFdBQUssWUFBWTtBQUNqQixXQUFLLE9BQU87QUFBQSxJQUNiLENBQUM7QUFBQSxFQUNGO0FBQUEsRUFFUSxZQUFZLE1BQW1CO0FBQ3RDLFVBQU0sUUFBUSxLQUFLLE9BQU8sU0FBUztBQUNuQyxVQUFNLGNBQWMsS0FBSztBQUN6QixVQUFNLGtCQUFrQixNQUFNLFFBQVEsSUFBSSxDQUFDLFNBQVM7QUFBQSxNQUNuRCxHQUFHO0FBQUEsTUFDSCxPQUFPLEtBQUssWUFBWSxJQUFJLE9BQU8sV0FBVztBQUFBLElBQy9DLEVBQUU7QUFDRixVQUFNLGFBQWEsZ0JBQWdCLE9BQU8sQ0FBQyxLQUFLLFFBQVEsTUFBTSxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRWpGLFVBQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxLQUFLLFlBQVksQ0FBQztBQUNsRCxXQUFPLFNBQVMsTUFBTSxFQUFFLE1BQU0saUNBQVEsVUFBVSxTQUFJLENBQUM7QUFDckQsVUFBTSxZQUFZLE9BQU8sVUFBVSxFQUFFLEtBQUssWUFBWSxDQUFDO0FBQ3ZELFVBQU0sY0FBYyxVQUFVLFNBQVMsU0FBUztBQUFBLE1BQy9DLE1BQU07QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLE9BQU87QUFBQSxJQUNSLENBQUM7QUFDRCxnQkFBWSxpQkFBaUIsb0JBQW9CLE1BQU07QUFDdEQsV0FBSyxtQkFBbUI7QUFBQSxJQUN6QixDQUFDO0FBQ0QsZ0JBQVksaUJBQWlCLGtCQUFrQixNQUFNO0FBQ3BELFdBQUssbUJBQW1CO0FBQ3hCLFdBQUssY0FBYyxZQUFZO0FBQy9CLFdBQUssdUJBQXVCO0FBQzVCLFdBQUssc0JBQXNCO0FBQUEsUUFDMUIsT0FBTyxZQUFZLGtCQUFrQixZQUFZLE1BQU07QUFBQSxRQUN2RCxLQUFLLFlBQVksZ0JBQWdCLFlBQVksTUFBTTtBQUFBLE1BQ3BEO0FBQ0EsV0FBSyxPQUFPO0FBQUEsSUFDYixDQUFDO0FBQ0QsZ0JBQVksaUJBQWlCLFNBQVMsTUFBTTtBQUMzQyxXQUFLLGNBQWMsWUFBWTtBQUMvQixVQUFJLEtBQUs7QUFBa0I7QUFDM0IsV0FBSyx1QkFBdUI7QUFDNUIsV0FBSyxzQkFBc0I7QUFBQSxRQUMxQixPQUFPLFlBQVksa0JBQWtCLFlBQVksTUFBTTtBQUFBLFFBQ3ZELEtBQUssWUFBWSxnQkFBZ0IsWUFBWSxNQUFNO0FBQUEsTUFDcEQ7QUFDQSxXQUFLLE9BQU87QUFBQSxJQUNiLENBQUM7QUFDRCxTQUFLLG1CQUFtQixTQUFTLFdBQVc7QUFFNUMsVUFBTSxlQUFlLE9BQU8sU0FBUyxVQUFVO0FBQUEsTUFDOUMsTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLElBQ04sQ0FBQztBQUNELGlCQUFhLGlCQUFpQixTQUFTLE1BQU07QUFDNUMsVUFBSSxZQUFZLEtBQUssS0FBSztBQUFBLFFBQ3pCLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFVBQVUsT0FBTyxVQUFVO0FBQzFCLGdCQUFNLEtBQUssT0FBTyxVQUFVLEtBQUs7QUFBQSxRQUNsQztBQUFBLE1BQ0QsQ0FBQyxFQUFFLEtBQUs7QUFBQSxJQUNULENBQUM7QUFFRCxVQUFNLGlCQUFpQixLQUFLLFVBQVUsRUFBRSxLQUFLLGFBQWEsQ0FBQztBQUMzRCxRQUFJLENBQUMsTUFBTSxRQUFRLFFBQVE7QUFDMUIscUJBQWUsVUFBVSxFQUFFLE1BQU0sd0ZBQWtCLEtBQUssV0FBVyxDQUFDO0FBQ3BFO0FBQUEsSUFDRDtBQUVBLGVBQVcsVUFBVSxpQkFBaUI7QUFDckMsV0FBSyxhQUFhLGdCQUFnQixNQUFNO0FBQUEsSUFDekM7QUFBQSxFQUNEO0FBQUEsRUFFUSxZQUFZLE1BQW1CO0FBQ3RDLFVBQU0sUUFBUSxLQUFLLG1CQUFtQixLQUFLLFVBQVU7QUFDckQsWUFBUSxJQUFJLGtDQUFrQztBQUFBLE1BQzdDLE9BQU8sS0FBSztBQUFBLE1BQ1osYUFBYSxNQUFNO0FBQUEsTUFDbkIsWUFBWSxNQUFNO0FBQUEsSUFDbkIsQ0FBQztBQUVELFNBQUssU0FBUyxNQUFNLEVBQUUsTUFBTSw0QkFBUSxLQUFLLGlCQUFpQixDQUFDO0FBQzNELFVBQU0sZ0JBQWdCLEtBQUssVUFBVSxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDakUsa0JBQWMsV0FBVyxFQUFFLE1BQU0saUNBQVEsQ0FBQztBQUMxQyxVQUFNLFNBQVMsY0FBYyxTQUFTLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQzFFLFVBQU0sZ0JBQXdDLEVBQUUsV0FBTSxHQUFHLFlBQU8sSUFBSSxZQUFPLElBQUksWUFBTyxHQUFHO0FBQ3pGLFdBQU8sUUFBUSxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsT0FBTyxJQUFJLE1BQU07QUFDeEQsWUFBTSxTQUFTLE9BQU8sU0FBUyxVQUFVLEVBQUUsTUFBTSxPQUFPLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztBQUNoRixVQUFJLEtBQUssV0FBVyxTQUFTLFlBQVksS0FBSyxXQUFXLFNBQVM7QUFBTSxlQUFPLFdBQVc7QUFBQSxJQUMzRixDQUFDO0FBQ0QsVUFBTSxlQUFlLE9BQU8sU0FBUyxVQUFVLEVBQUUsTUFBTSxzQkFBTyxPQUFPLFNBQVMsQ0FBQztBQUMvRSxRQUFJLEtBQUssV0FBVyxTQUFTO0FBQVUsbUJBQWEsV0FBVztBQUUvRCxVQUFNLGVBQWUsY0FBYyxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUN2RSxVQUFNLGFBQWEsYUFBYSxTQUFTLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUNsRSxVQUFNLFdBQVcsYUFBYSxTQUFTLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUNoRSxVQUFNLHFCQUFxQixNQUFNO0FBQ2hDLFVBQUksS0FBSyxXQUFXLFNBQVMsVUFBVTtBQUN0QyxtQkFBVyxRQUFRLHFCQUFxQixLQUFLLFdBQVcsS0FBSztBQUM3RCxpQkFBUyxRQUFRLHFCQUFxQixLQUFLLFdBQVcsR0FBRztBQUN6RCxxQkFBYSxTQUFTLHlCQUF5QjtBQUFBLE1BQ2hELE9BQU87QUFDTixxQkFBYSxZQUFZLHlCQUF5QjtBQUFBLE1BQ25EO0FBQUEsSUFDRDtBQUNBLHVCQUFtQjtBQUVuQixXQUFPLGlCQUFpQixVQUFVLE1BQU07QUFDdkMsVUFBSSxPQUFPLFVBQVUsVUFBVTtBQUM5QixjQUFNLFFBQVEsS0FBSyxXQUFXLEtBQUssSUFBSSxDQUFDO0FBQ3hDLGNBQU0sZUFBZSxRQUFRLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDakQsYUFBSyxhQUFhLEVBQUUsTUFBTSxVQUFVLE9BQU8sY0FBYyxLQUFLLE1BQU07QUFBQSxNQUNyRSxPQUFPO0FBQ04sYUFBSyxhQUFhLEVBQUUsTUFBTSxVQUFVLE1BQU0sT0FBTyxPQUFPLEtBQUssRUFBRTtBQUFBLE1BQ2hFO0FBQ0EseUJBQW1CO0FBQ25CLFdBQUssT0FBTztBQUFBLElBQ2IsQ0FBQztBQUVELFVBQU0scUJBQXFCLE1BQU07QUFDaEMsVUFBSSxLQUFLLFdBQVcsU0FBUztBQUFVO0FBQ3ZDLFlBQU0sVUFBVSxXQUFXLFFBQVEsS0FBSyxXQUFXLElBQUksS0FBSyxXQUFXLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSTtBQUMzRixZQUFNLFFBQVEsU0FBUyxRQUFRLEtBQUssV0FBVyxJQUFJLEtBQUssU0FBUyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUk7QUFDckYsVUFBSSxXQUFXLFNBQVMsV0FBVyxPQUFPO0FBQ3pDLGFBQUssYUFBYSxFQUFFLE1BQU0sVUFBVSxPQUFPLFNBQVMsS0FBSyxNQUFNO0FBQy9ELGFBQUssT0FBTztBQUFBLE1BQ2I7QUFBQSxJQUNEO0FBQ0EsZUFBVyxpQkFBaUIsVUFBVSxrQkFBa0I7QUFDeEQsYUFBUyxpQkFBaUIsVUFBVSxrQkFBa0I7QUFFdEQsVUFBTSxZQUFZLEtBQUssVUFBVSxFQUFFLEtBQUsscUJBQXFCLENBQUM7QUFDOUQsU0FBSyxlQUFlLFdBQVcsc0JBQU8sTUFBTSxXQUFXLFNBQVMsR0FBRywwQkFBTTtBQUN6RSxTQUFLO0FBQUEsTUFDSjtBQUFBLE1BQ0E7QUFBQSxNQUNBLGNBQWMsTUFBTSxjQUFjO0FBQUEsTUFDbEMsc0JBQU8sTUFBTSxjQUFjLElBQUksTUFBTSxjQUFjLENBQUM7QUFBQSxJQUNyRDtBQUNBLFNBQUssZUFBZSxXQUFXLGtDQUFTLE1BQU0sU0FBUyxTQUFTLEdBQUcsMEJBQU07QUFDekUsU0FBSztBQUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsTUFDQSxNQUFNLGdCQUFnQixjQUFjLE1BQU0sV0FBVyxJQUFJO0FBQUEsTUFDekQsR0FBRyxNQUFNLFlBQVksSUFBSSxNQUFNLGlCQUFpQixDQUFDO0FBQUEsSUFDbEQ7QUFDQSxTQUFLO0FBQUEsTUFDSjtBQUFBLE1BQ0E7QUFBQSxNQUNBLE1BQU0sZ0JBQWdCLGNBQWMsTUFBTSxVQUFVLElBQUk7QUFBQSxNQUN4RDtBQUFBLElBQ0Q7QUFDQSxTQUFLO0FBQUEsTUFDSjtBQUFBLE1BQ0E7QUFBQSxNQUNBLE1BQU0saUJBQWlCLGVBQWUsTUFBTSxjQUFjLElBQUk7QUFBQSxNQUM5RDtBQUFBLElBQ0Q7QUFFQSxVQUFNLGVBQWUsS0FBSyxVQUFVLEVBQUUsS0FBSyxtQkFBbUIsQ0FBQztBQUMvRCxpQkFBYSxTQUFTLE1BQU0sRUFBRSxNQUFNLHVDQUFTLENBQUM7QUFDOUMsU0FBSyxvQkFBb0IsY0FBYyxNQUFNLFdBQVc7QUFFeEQsVUFBTSxjQUFjLEtBQUssVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDOUQsZ0JBQVksU0FBUyxNQUFNLEVBQUUsTUFBTSxpQ0FBUSxDQUFDO0FBQzVDLFNBQUsscUJBQXFCLGFBQWEsTUFBTSxVQUFVO0FBRXZELFVBQU0sa0JBQWtCLEtBQUssVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDbEUsb0JBQWdCLFNBQVMsTUFBTSxFQUFFLE1BQU0sdUNBQVMsQ0FBQztBQUNqRCxTQUFLLHdCQUF3QixpQkFBaUIsS0FBSztBQUFBLEVBQ3BEO0FBQUEsRUFFUSxlQUFlLE1BQW1CO0FBQ3pDLFVBQU0sRUFBRSxPQUFPLElBQUksSUFBSSxLQUFLLHFCQUFxQjtBQUNqRCxVQUFNLGNBQWMsS0FBSztBQUN6QixVQUFNLFVBQVUsS0FBSyxxQkFBcUIsT0FBTyxHQUFHLEVBQUU7QUFBQSxNQUFPLENBQUMsVUFDN0QsS0FBSztBQUFBLFFBQ0o7QUFBQSxRQUNBLENBQUMsTUFBTSxXQUFXLE1BQU0sSUFBSSxFQUFFLEtBQUssR0FBRztBQUFBLE1BQ3ZDO0FBQUEsSUFDRDtBQUVBLFVBQU0sU0FBUyxLQUFLLFVBQVUsRUFBRSxLQUFLLFlBQVksQ0FBQztBQUNsRCxXQUFPLFNBQVMsTUFBTSxFQUFFLE1BQU0sMkJBQU8sUUFBUSxNQUFNLFNBQUksQ0FBQztBQUN4RCxVQUFNLFdBQVcsT0FBTyxVQUFVLEVBQUUsS0FBSyx1QkFBdUIsQ0FBQztBQUNqRSxVQUFNLGVBQWUsU0FBUyxTQUFTLFFBQVE7QUFDL0M7QUFBQSxNQUNDLEVBQUUsT0FBTyxTQUFTLE9BQU8sZUFBSztBQUFBLE1BQzlCLEVBQUUsT0FBTyxhQUFhLE9BQU8sZUFBSztBQUFBLE1BQ2xDLEVBQUUsT0FBTyxVQUFVLE9BQU8scUJBQU07QUFBQSxJQUNqQyxFQUFFLFFBQVEsQ0FBQyxXQUFXO0FBQ3JCLFlBQU0sTUFBTSxhQUFhLFNBQVMsVUFBVSxFQUFFLE1BQU0sT0FBTyxPQUFPLE9BQU8sT0FBTyxNQUFNLENBQUM7QUFDdkYsVUFBSSxLQUFLLG1CQUFtQixPQUFPO0FBQU8sWUFBSSxXQUFXO0FBQUEsSUFDMUQsQ0FBQztBQUVELFVBQU0sWUFBWSxPQUFPLFVBQVUsRUFBRSxLQUFLLFlBQVksQ0FBQztBQUN2RCxVQUFNLGNBQWMsVUFBVSxTQUFTLFNBQVM7QUFBQSxNQUMvQyxNQUFNO0FBQUEsTUFDTixhQUFhO0FBQUEsTUFDYixPQUFPO0FBQUEsSUFDUixDQUFDO0FBQ0QsZ0JBQVksaUJBQWlCLG9CQUFvQixNQUFNO0FBQ3RELFdBQUssc0JBQXNCO0FBQUEsSUFDNUIsQ0FBQztBQUNELGdCQUFZLGlCQUFpQixrQkFBa0IsTUFBTTtBQUNwRCxXQUFLLHNCQUFzQjtBQUMzQixXQUFLLGlCQUFpQixZQUFZO0FBQ2xDLFdBQUssdUJBQXVCO0FBQzVCLFdBQUssc0JBQXNCO0FBQUEsUUFDMUIsT0FBTyxZQUFZLGtCQUFrQixZQUFZLE1BQU07QUFBQSxRQUN2RCxLQUFLLFlBQVksZ0JBQWdCLFlBQVksTUFBTTtBQUFBLE1BQ3BEO0FBQ0EsV0FBSyxPQUFPO0FBQUEsSUFDYixDQUFDO0FBQ0QsZ0JBQVksaUJBQWlCLFNBQVMsTUFBTTtBQUMzQyxXQUFLLGlCQUFpQixZQUFZO0FBQ2xDLFVBQUksS0FBSztBQUFxQjtBQUM5QixXQUFLLHVCQUF1QjtBQUM1QixXQUFLLHNCQUFzQjtBQUFBLFFBQzFCLE9BQU8sWUFBWSxrQkFBa0IsWUFBWSxNQUFNO0FBQUEsUUFDdkQsS0FBSyxZQUFZLGdCQUFnQixZQUFZLE1BQU07QUFBQSxNQUNwRDtBQUNBLFdBQUssT0FBTztBQUFBLElBQ2IsQ0FBQztBQUNELFNBQUssbUJBQW1CLFlBQVksV0FBVztBQUUvQyxVQUFNLGdCQUFnQixTQUFTLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQ25FLFVBQU0sYUFBYSxjQUFjLFNBQVMsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQ25FLFVBQU0sV0FBVyxjQUFjLFNBQVMsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRWpFLFVBQU0scUJBQXFCLE1BQU07QUFDaEMsVUFBSSxLQUFLLG1CQUFtQixZQUFZLEtBQUssZ0JBQWdCO0FBQzVELG1CQUFXLFFBQVEscUJBQXFCLEtBQUssZUFBZSxLQUFLO0FBQ2pFLGlCQUFTLFFBQVEscUJBQXFCLEtBQUssZUFBZSxHQUFHO0FBQzdELHNCQUFjLFNBQVMseUJBQXlCO0FBQUEsTUFDakQsT0FBTztBQUNOLHNCQUFjLFlBQVkseUJBQXlCO0FBQUEsTUFDcEQ7QUFBQSxJQUNEO0FBQ0EsdUJBQW1CO0FBRW5CLFVBQU0sY0FBYyxNQUFNO0FBQ3pCLFlBQU0sUUFBUSxhQUFhO0FBQzNCLFdBQUssaUJBQWlCO0FBQ3RCLFVBQUksVUFBVSxTQUFTO0FBQ3RCLGNBQU0sUUFBUSxLQUFLLFdBQVcsS0FBSyxJQUFJLENBQUM7QUFDeEMsYUFBSyxpQkFBaUIsRUFBRSxPQUFPLE9BQU8sS0FBSyxNQUFNO0FBQUEsTUFDbEQsV0FBVyxVQUFVLGFBQWE7QUFDakMsY0FBTSxRQUFRLEtBQUssV0FBVyxLQUFLLElBQUksQ0FBQztBQUN4QyxjQUFNLFlBQVksUUFBUSxLQUFLLEtBQUssS0FBSztBQUN6QyxhQUFLLGlCQUFpQixFQUFFLE9BQU8sV0FBVyxLQUFLLFVBQVU7QUFBQSxNQUMxRCxXQUFXLENBQUMsS0FBSyxnQkFBZ0I7QUFDaEMsY0FBTSxRQUFRLEtBQUssV0FBVyxLQUFLLElBQUksQ0FBQztBQUN4QyxhQUFLLGlCQUFpQixFQUFFLE9BQU8sT0FBTyxLQUFLLE1BQU07QUFBQSxNQUNsRDtBQUNBLHlCQUFtQjtBQUNuQixXQUFLLE9BQU87QUFBQSxJQUNiO0FBQ0EsaUJBQWEsaUJBQWlCLFVBQVUsV0FBVztBQUVuRCxVQUFNLHFCQUFxQixNQUFNO0FBQ2hDLFVBQUksS0FBSyxtQkFBbUI7QUFBVTtBQUN0QyxZQUFNLFlBQVksV0FBVyxRQUFRLElBQUksS0FBSyxXQUFXLEtBQUssRUFBRSxRQUFRLElBQUk7QUFDNUUsWUFBTSxVQUFVLFNBQVMsUUFBUSxJQUFJLEtBQUssU0FBUyxLQUFLLEVBQUUsUUFBUSxJQUFJO0FBQ3RFLFVBQUksYUFBYSxXQUFXLGFBQWEsU0FBUztBQUNqRCxhQUFLLGlCQUFpQjtBQUFBLFVBQ3JCLE9BQU8sS0FBSyxXQUFXLFNBQVM7QUFBQSxVQUNoQyxLQUFLLEtBQUssV0FBVyxPQUFPO0FBQUEsUUFDN0I7QUFDQSxhQUFLLE9BQU87QUFBQSxNQUNiO0FBQUEsSUFDRDtBQUNBLGVBQVcsaUJBQWlCLFVBQVUsa0JBQWtCO0FBQ3hELGFBQVMsaUJBQWlCLFVBQVUsa0JBQWtCO0FBRXRELFFBQUksQ0FBQyxRQUFRLFFBQVE7QUFDcEIsV0FBSyxVQUFVLEVBQUUsS0FBSyxZQUFZLE1BQU0sMkVBQWUsQ0FBQztBQUN4RDtBQUFBLElBQ0Q7QUFFQSxVQUFNLGtCQUFrQixLQUFLLFVBQVUsRUFBRSxLQUFLLHNCQUFzQixDQUFDO0FBQ3JFLFVBQU0sV0FBVyxnQkFBZ0IsVUFBVSxFQUFFLEtBQUssY0FBYyxDQUFDO0FBQ2pFLFlBQVEsUUFBUSxDQUFDLFVBQVU7QUFDMUIsWUFBTSxNQUFNLFNBQVMsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDekQsWUFBTSxVQUFVLElBQUksVUFBVSxFQUFFLEtBQUssc0JBQXNCLENBQUM7QUFDNUQsY0FBUSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxlQUFlLE1BQU0sU0FBUyxFQUFFLENBQUM7QUFDcEYsY0FBUSxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxXQUFXLE1BQU0sU0FBUyxFQUFFLENBQUM7QUFDaEYsY0FBUSxRQUFRLFNBQVMsV0FBVyxNQUFNLFNBQVMsQ0FBQztBQUNwRCxZQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUMxRCxZQUFNLFVBQVUsSUFBSSxVQUFVLEVBQUUsS0FBSyxzQkFBc0IsQ0FBQztBQUM1RCxjQUFRLFVBQVUsRUFBRSxLQUFLLDBCQUEwQixNQUFNLE1BQU0sVUFBVSxDQUFDO0FBQzFFLGNBQVEsVUFBVSxFQUFFLEtBQUsseUJBQXlCLE1BQU0sTUFBTSxLQUFLLENBQUM7QUFBQSxJQUNyRSxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRVEsYUFBYSxTQUFzQixRQUFzQjtBQUNoRSxVQUFNLFdBQVcsUUFBUSxVQUFVLEVBQUUsS0FBSyxZQUFZLENBQUM7QUFFdkQsVUFBTSxlQUFlLFNBQVMsVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDbkUsVUFBTSxVQUFVLGFBQWEsVUFBVSxFQUFFLEtBQUssbUJBQW1CLE1BQU0sRUFBRSxNQUFNLFNBQVMsRUFBRSxDQUFDO0FBQzNGLFlBQVEsU0FBUyxNQUFNLEVBQUUsTUFBTSxPQUFPLEtBQUssQ0FBQztBQUM1QyxZQUFRLGlCQUFpQixTQUFTLE1BQU07QUFDdkMsVUFBSSxZQUFZLEtBQUssS0FBSztBQUFBLFFBQ3pCLE9BQU87QUFBQSxRQUNQLGNBQWMsT0FBTztBQUFBLFFBQ3JCLGFBQWE7QUFBQSxRQUNiLFVBQVUsT0FBTyxVQUFVO0FBQzFCLGdCQUFNLEtBQUssT0FBTyxhQUFhLE9BQU8sSUFBSSxLQUFLO0FBQUEsUUFDaEQ7QUFBQSxNQUNELENBQUMsRUFBRSxLQUFLO0FBQUEsSUFDVCxDQUFDO0FBRUQsVUFBTSxZQUFZLGFBQWEsVUFBVSxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDckUsVUFBTSxTQUFTLFVBQVUsU0FBUyxVQUFVLEVBQUUsTUFBTSw0QkFBUSxLQUFLLHNCQUFzQixDQUFDO0FBQ3hGLFdBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUN0QyxXQUFLLE9BQU8sZ0JBQWdCLE9BQU8sRUFBRTtBQUNyQyxVQUFJLFVBQVUsS0FBSyxLQUFLLEtBQUssUUFBUSxPQUFPLEVBQUUsRUFBRSxLQUFLO0FBQUEsSUFDdEQsQ0FBQztBQUNELFVBQU0sWUFBWSxVQUFVLFNBQVMsVUFBVTtBQUFBLE1BQzlDLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLE1BQU0sRUFBRSxjQUFjLDJCQUFPO0FBQUEsSUFDOUIsQ0FBQztBQUNELGNBQVUsaUJBQWlCLFNBQVMsTUFBTTtBQUN6QyxVQUFJLGFBQWEsS0FBSyxLQUFLO0FBQUEsUUFDMUIsT0FBTztBQUFBLFFBQ1AsU0FBUyxpQ0FBUSxPQUFPLElBQUk7QUFBQSxRQUM1QixhQUFhO0FBQUEsUUFDYixXQUFXLFlBQVk7QUFDdEIsZ0JBQU0sS0FBSyxPQUFPLGFBQWEsT0FBTyxFQUFFO0FBQUEsUUFDekM7QUFBQSxNQUNELENBQUMsRUFBRSxLQUFLO0FBQUEsSUFDVCxDQUFDO0FBRUQsVUFBTSxpQkFBaUIsU0FBUyxVQUFVO0FBQUEsTUFDekMsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLGVBQWUsT0FBTyxHQUFHO0FBQUEsSUFDbEMsQ0FBQztBQUNELFVBQU0sZ0JBQWdCLFVBQVUsU0FBUyxTQUFTLEVBQUUsS0FBSyxtQkFBbUIsQ0FBQztBQUM3RSxVQUFNLGVBQWUsS0FBSyxnQkFBZ0IsSUFBSSxPQUFPLEVBQUUsS0FBSztBQUM1RCxVQUFNLGlCQUFpQixjQUFjLFNBQVMsU0FBUyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzNFLG1CQUFlLFVBQVU7QUFDekIsbUJBQWUsaUJBQWlCLFVBQVUsTUFBTTtBQUMvQyxXQUFLLGdCQUFnQixJQUFJLE9BQU8sSUFBSSxlQUFlLE9BQU87QUFDMUQsV0FBSyxPQUFPO0FBQUEsSUFDYixDQUFDO0FBQ0Qsa0JBQWMsV0FBVyxFQUFFLE1BQU0scUJBQU0sQ0FBQztBQUV4QyxtQkFBZSxpQkFBaUIsWUFBWSxDQUFDLFFBQVE7QUFDcEQsVUFBSSxlQUFlO0FBQ25CLFVBQUksSUFBSTtBQUFjLFlBQUksYUFBYSxhQUFhO0FBQ3BELFlBQU0sV0FBVyxLQUFLLGdCQUFnQixnQkFBZ0IsSUFBSSxPQUFPO0FBQ2pFLFdBQUssZ0JBQWdCLGdCQUFnQixRQUFRO0FBQUEsSUFDOUMsQ0FBQztBQUNELG1CQUFlLGlCQUFpQixRQUFRLENBQUMsUUFBUTtBQUNoRCxVQUFJLGVBQWU7QUFDbkIsWUFBTSxXQUNMLEtBQUssa0JBQWtCLGFBQWEsT0FBTyxLQUN4QyxLQUFLLGlCQUFpQixXQUN0QixLQUFLLGdCQUFnQixnQkFBZ0IsSUFBSSxPQUFPO0FBQ3BELFdBQUssS0FBSyxXQUFXLE9BQU8sSUFBSSxRQUFRO0FBQUEsSUFDekMsQ0FBQztBQUVELFVBQU0sZ0JBQWdCLEtBQUssa0JBQWtCLFFBQVEsWUFBWTtBQUVqRSxRQUFJLENBQUMsY0FBYyxRQUFRO0FBQzFCLFlBQU0sWUFBWSxlQUFlLHlDQUFXO0FBQzVDLFlBQU0sUUFBUSxlQUFlLFVBQVUsRUFBRSxNQUFNLFdBQVcsS0FBSyxXQUFXLENBQUM7QUFDM0UsWUFBTSxpQkFBaUIsWUFBWSxDQUFDLFFBQVE7QUFDM0MsWUFBSSxlQUFlO0FBQ25CLFlBQUksSUFBSTtBQUFjLGNBQUksYUFBYSxhQUFhO0FBQ3BELGNBQU0sV0FBVyxLQUFLLGdCQUFnQixnQkFBZ0IsSUFBSSxPQUFPO0FBQ2pFLGFBQUssZ0JBQWdCLGdCQUFnQixRQUFRO0FBQUEsTUFDOUMsQ0FBQztBQUNELFlBQU0saUJBQWlCLFFBQVEsQ0FBQyxRQUFRO0FBQ3ZDLFlBQUksZUFBZTtBQUNuQixjQUFNLFdBQ0wsS0FBSyxrQkFBa0IsYUFBYSxPQUFPLEtBQ3hDLEtBQUssaUJBQWlCLFdBQ3RCLEtBQUssZ0JBQWdCLGdCQUFnQixJQUFJLE9BQU87QUFDcEQsYUFBSyxLQUFLLFdBQVcsT0FBTyxJQUFJLFFBQVE7QUFBQSxNQUN6QyxDQUFDO0FBQ0Q7QUFBQSxJQUNEO0FBRUEsa0JBQWMsUUFBUSxDQUFDLFNBQVM7QUFDL0IsV0FBSyxXQUFXLGdCQUFnQixRQUFRLElBQUk7QUFBQSxJQUM3QyxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRVEsV0FBVyxXQUF3QixRQUFzQixNQUFrQjtBQUNsRixVQUFNLGNBQWMsQ0FBQyxTQUFTO0FBQzlCLFFBQUksS0FBSztBQUFXLGtCQUFZLEtBQUssbUJBQW1CO0FBQ3hELFFBQUksS0FBSztBQUFVLGtCQUFZLEtBQUssa0JBQWtCO0FBQ3RELFVBQU0sU0FBUyxVQUFVLFVBQVU7QUFBQSxNQUNsQyxLQUFLLFlBQVksS0FBSyxHQUFHO0FBQUEsTUFDekIsTUFBTSxFQUFFLFdBQVcsUUFBUSxhQUFhLEtBQUssR0FBRztBQUFBLElBQ2pELENBQUM7QUFDRCxXQUFPLFFBQVEsU0FBUyxLQUFLO0FBRTdCLFdBQU8saUJBQWlCLGFBQWEsQ0FBQyxRQUFRO0FBQzdDLFdBQUssWUFBWSxFQUFFLFFBQVEsS0FBSyxJQUFJLFVBQVUsT0FBTyxJQUFJLFlBQVksT0FBTyxhQUFhO0FBQ3pGLGFBQU8sU0FBUyxrQkFBa0I7QUFDbEMsVUFBSSxjQUFjLFFBQVEsY0FBYyxLQUFLLEVBQUU7QUFBQSxJQUNoRCxDQUFDO0FBQ0QsV0FBTyxpQkFBaUIsV0FBVyxNQUFNO0FBQ3hDLGFBQU8sWUFBWSxrQkFBa0I7QUFDckMsV0FBSyxlQUFlO0FBQUEsSUFDckIsQ0FBQztBQUNELFdBQU8saUJBQWlCLFlBQVksQ0FBQyxRQUFRO0FBQzVDLFVBQUksZUFBZTtBQUNuQixVQUFJLElBQUk7QUFBYyxZQUFJLGFBQWEsYUFBYTtBQUNwRCxhQUFPLFNBQVMsY0FBYztBQUM5QixZQUFNQSxhQUFZLE9BQU87QUFDekIsWUFBTSxXQUFXLEtBQUssZ0JBQWdCQSxZQUFXLElBQUksT0FBTztBQUM1RCxXQUFLLGdCQUFnQkEsWUFBVyxRQUFRO0FBQUEsSUFDekMsQ0FBQztBQUNELFdBQU8saUJBQWlCLGFBQWEsTUFBTTtBQUMxQyxhQUFPLFlBQVksY0FBYztBQUFBLElBQ2xDLENBQUM7QUFFRCxXQUFPLGlCQUFpQixTQUFTLENBQUMsUUFBUTtBQUN6QyxZQUFNLFNBQVMsSUFBSTtBQUNuQixVQUFJLE9BQU8sUUFBUSxrQkFBa0I7QUFBRztBQUN4QyxXQUFLLE9BQU8sZ0JBQWdCLE9BQU8sRUFBRTtBQUNyQyxVQUFJLFVBQVUsS0FBSyxLQUFLLEtBQUssUUFBUSxPQUFPLElBQUksSUFBSSxFQUFFLEtBQUs7QUFBQSxJQUM1RCxDQUFDO0FBRUQsVUFBTSxTQUFTLE9BQU8sVUFBVSxFQUFFLEtBQUssY0FBYyxDQUFDO0FBQ3RELFVBQU0sV0FBVyxPQUFPLFNBQVMsU0FBUyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzlELGFBQVMsVUFBVSxLQUFLO0FBQ3hCLGFBQVMsaUJBQWlCLFNBQVMsT0FBTyxRQUFRO0FBQ2pELFVBQUksZ0JBQWdCO0FBQ3BCLFlBQU0sS0FBSyxPQUFPLHFCQUFxQixPQUFPLElBQUksS0FBSyxJQUFJLFNBQVMsT0FBTztBQUFBLElBQzVFLENBQUM7QUFFRCxVQUFNLFVBQVUsT0FBTyxVQUFVLEVBQUUsS0FBSyxpQkFBaUIsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUUzRSxVQUFNLGNBQWMsT0FBTyxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUMvRCxVQUFNLGdCQUFnQixZQUFZLFVBQVUsRUFBRSxLQUFLLHFCQUFxQixNQUFNLFNBQUksQ0FBQztBQUNuRixVQUFNLFVBQVUsWUFBWSxVQUFVLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUNuRSxVQUFNLGlCQUFpQixNQUFNLFFBQVEsS0FBSyxPQUFPLElBQUksS0FBSyxVQUFVLENBQUM7QUFDckUsbUJBQWUsUUFBUSxDQUFDLFVBQVU7QUFDakMsY0FBUSxVQUFVO0FBQUEsUUFDakIsS0FBSztBQUFBLFFBQ0wsTUFBTSxHQUFHLFdBQVcsTUFBTSxTQUFTLENBQUMsU0FBTSxNQUFNLFVBQVUsY0FBSTtBQUFBLE1BQy9ELENBQUM7QUFBQSxJQUNGLENBQUM7QUFDRCxRQUFJLENBQUMsZUFBZSxRQUFRO0FBQzNCLGNBQVEsVUFBVSxFQUFFLE1BQU0sNEJBQVEsS0FBSyxtQkFBbUIsQ0FBQztBQUFBLElBQzVEO0FBQ0EsUUFBSSxjQUErQjtBQUNuQyxVQUFNLG1CQUFtQixNQUFNO0FBQzlCLFVBQUksZ0JBQWdCLE1BQU07QUFDekIsZUFBTyxhQUFhLFdBQVc7QUFDL0Isc0JBQWM7QUFBQSxNQUNmO0FBQUEsSUFDRDtBQUNBLFVBQU0sY0FBYyxNQUFNO0FBQ3pCLHVCQUFpQjtBQUNqQixrQkFBWSxTQUFTLGtCQUFrQjtBQUFBLElBQ3hDO0FBQ0EsVUFBTSxlQUFlLE1BQU07QUFDMUIsdUJBQWlCO0FBQ2pCLG9CQUFjLE9BQU8sV0FBVyxNQUFNO0FBQ3JDLFlBQUksQ0FBQyxZQUFZLFNBQVMsbUJBQW1CLEdBQUc7QUFDL0Msc0JBQVksWUFBWSxrQkFBa0I7QUFBQSxRQUMzQztBQUFBLE1BQ0QsR0FBRyxHQUFHO0FBQUEsSUFDUDtBQUNBLGdCQUFZLGlCQUFpQixjQUFjLFdBQVc7QUFDdEQsZ0JBQVksaUJBQWlCLGNBQWMsWUFBWTtBQUN2RCxrQkFBYyxpQkFBaUIsU0FBUyxDQUFDLFFBQVE7QUFDaEQsVUFBSSxnQkFBZ0I7QUFDcEIsdUJBQWlCO0FBQ2pCLFVBQUksWUFBWSxTQUFTLG1CQUFtQixHQUFHO0FBQzlDLG9CQUFZLFlBQVksbUJBQW1CO0FBQzNDLFlBQUksQ0FBQyxZQUFZLFFBQVEsUUFBUSxHQUFHO0FBQ25DLHNCQUFZLFlBQVksa0JBQWtCO0FBQUEsUUFDM0M7QUFBQSxNQUNELE9BQU87QUFDTixvQkFBWSxTQUFTLG1CQUFtQjtBQUN4QyxvQkFBWSxTQUFTLGtCQUFrQjtBQUFBLE1BQ3hDO0FBQUEsSUFDRCxDQUFDO0FBQ0QsVUFBTSxjQUFjLENBQUMsUUFBb0I7QUFDeEMsVUFBSSxnQkFBZ0I7QUFDcEIsYUFBTyxRQUFRLGFBQWEsT0FBTztBQUNuQyxZQUFNLFNBQVMsTUFBTTtBQUNwQixlQUFPLFFBQVEsYUFBYSxNQUFNO0FBQ2xDLGlCQUFTLG9CQUFvQixXQUFXLE1BQU07QUFBQSxNQUMvQztBQUNBLGVBQVMsaUJBQWlCLFdBQVcsTUFBTTtBQUFBLElBQzVDO0FBQ0EsZ0JBQVksaUJBQWlCLGFBQWEsV0FBVztBQUNyRCxZQUFRLGlCQUFpQixhQUFhLFdBQVc7QUFFakQsUUFBSSxLQUFLLEtBQUssUUFBUTtBQUNyQixZQUFNLFNBQVMsT0FBTyxVQUFVLEVBQUUsS0FBSyxlQUFlLENBQUM7QUFDdkQsV0FBSyxLQUFLLFFBQVEsQ0FBQyxRQUFRLE9BQU8sVUFBVSxFQUFFLEtBQUssVUFBVSxNQUFNLElBQUksQ0FBQyxDQUFDO0FBQUEsSUFDMUU7QUFFQSxRQUFJLEtBQUssUUFBUTtBQUNoQixhQUFPLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixNQUFNLEtBQUssT0FBTyxDQUFDO0FBQUEsSUFDOUQ7QUFFQSxVQUFNLE9BQU8sT0FBTyxVQUFVLEVBQUUsS0FBSyxlQUFlLENBQUM7QUFDckQsU0FBSyxXQUFXLEVBQUUsTUFBTSxxQkFBTSxXQUFXLEtBQUssU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUM1RCxTQUFLLFdBQVcsRUFBRSxNQUFNLHFCQUFNLFdBQVcsS0FBSyxTQUFTLENBQUMsR0FBRyxDQUFDO0FBQzVELFFBQUksS0FBSyxVQUFVO0FBQ2xCLFdBQUssV0FBVyxFQUFFLE1BQU0scUJBQU0sV0FBVyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEtBQUssd0JBQXdCLENBQUM7QUFBQSxJQUMxRjtBQUVBLFdBQU87QUFBQSxFQUNSO0FBQUEsRUFFQSxNQUFjLFdBQVcsZ0JBQXdCLGNBQXVCO0FBQ3ZFLFFBQUksQ0FBQyxLQUFLO0FBQVc7QUFDckIsVUFBTSxFQUFFLFVBQVUsT0FBTyxJQUFJLEtBQUs7QUFDbEMsUUFBSSxtQkFBbUIsWUFBWSxpQkFBaUIsUUFBUTtBQUMzRCxXQUFLLGVBQWU7QUFDcEI7QUFBQSxJQUNEO0FBQ0EsVUFBTSxLQUFLLE9BQU8sU0FBUyxRQUFRLFVBQVUsZ0JBQWdCLFlBQVk7QUFDekUsU0FBSyxlQUFlO0FBQUEsRUFDckI7QUFBQSxFQUVRLGdCQUFnQixXQUF3QixTQUFxQztBQUNwRixVQUFNLFFBQVEsTUFBTSxLQUFLLFVBQVUsaUJBQThCLFVBQVUsQ0FBQztBQUM1RSxlQUFXLFFBQVEsT0FBTztBQUN6QixZQUFNLE9BQU8sS0FBSyxzQkFBc0I7QUFDeEMsWUFBTSxXQUFXLEtBQUssTUFBTSxLQUFLLFNBQVM7QUFDMUMsVUFBSSxVQUFVLFVBQVU7QUFDdkIsY0FBTSxLQUFLLEtBQUssUUFBUTtBQUN4QixlQUFPLE1BQU07QUFBQSxNQUNkO0FBQUEsSUFDRDtBQUNBLFdBQU87QUFBQSxFQUNSO0FBQUEsRUFFUSxrQkFBa0IsUUFBc0IsY0FBcUM7QUFDcEYsUUFBSSxDQUFDLGNBQWM7QUFDbEIsYUFBTyxPQUFPO0FBQUEsSUFDZjtBQUNBLFdBQU8sT0FBTyxNQUNaLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFDaEMsTUFBTSxFQUNOLEtBQUssQ0FBQyxHQUFHLE1BQU07QUFDZixZQUFNLFFBQVEsRUFBRSxZQUFZO0FBQzVCLFlBQU0sUUFBUSxFQUFFLFlBQVk7QUFDNUIsYUFBTyxRQUFRO0FBQUEsSUFDaEIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVRLG9CQUFpQztBQUN4QyxRQUFJLENBQUMsS0FBSyxlQUFlO0FBQ3hCLFdBQUssZ0JBQWdCLFNBQVMsY0FBYyxLQUFLO0FBQ2pELFdBQUssY0FBYyxTQUFTLHFCQUFxQjtBQUFBLElBQ2xEO0FBQ0EsV0FBTyxLQUFLO0FBQUEsRUFDYjtBQUFBLEVBRVEsZ0JBQWdCLFdBQXdCLFVBQW1CO0FBQ2xFLFFBQUksQ0FBQyxLQUFLO0FBQVc7QUFDckIsVUFBTSxXQUFXLFVBQVUsYUFBYSxhQUFhO0FBQ3JELFFBQUksQ0FBQztBQUFVO0FBQ2YsVUFBTSxjQUFjLEtBQUssa0JBQWtCO0FBQzNDLFVBQU0sZ0JBQWdCLEtBQUssSUFBSSxLQUFLLFVBQVUsY0FBYyxHQUFHLEVBQUU7QUFDakUsZ0JBQVksTUFBTSxTQUFTLEdBQUcsYUFBYTtBQUMzQyxRQUFJLFlBQVksa0JBQWtCLFdBQVc7QUFDNUMsV0FBSyx5QkFBeUI7QUFDOUIsZ0JBQVUsU0FBUyxzQkFBc0I7QUFBQSxJQUMxQztBQUNBLFVBQU0sWUFBWSxXQUNmLFVBQVUsY0FBMkIsMEJBQTBCLFFBQVEsSUFBSSxJQUMzRTtBQUNILFFBQUksV0FBVztBQUNkLGdCQUFVLGFBQWEsYUFBYSxTQUFTO0FBQUEsSUFDOUMsT0FBTztBQUNOLGdCQUFVLFlBQVksV0FBVztBQUFBLElBQ2xDO0FBQ0EsU0FBSyx1QkFBdUIsV0FBVyxLQUFLO0FBQzVDLFNBQUssbUJBQW1CLEVBQUUsVUFBVSxTQUFTO0FBQUEsRUFDOUM7QUFBQSxFQUVRLDJCQUEyQjtBQUNsQyxRQUFJLEtBQUssZUFBZSxlQUFlO0FBQ3RDLFlBQU0sU0FBUyxLQUFLLGNBQWM7QUFDbEMsYUFBTyxZQUFZLHNCQUFzQjtBQUN6QyxXQUFLLGNBQWMsT0FBTztBQUMxQixXQUFLLHVCQUF1QixRQUFRLElBQUk7QUFBQSxJQUN6QztBQUFBLEVBQ0Q7QUFBQSxFQUVRLG9CQUFvQjtBQUMzQixTQUFLLHlCQUF5QjtBQUM5QixTQUFLLGdCQUFnQjtBQUNyQixTQUFLLG1CQUFtQjtBQUFBLEVBQ3pCO0FBQUEsRUFFUSx1QkFBdUIsV0FBd0IsU0FBa0I7QUFDeEUsVUFBTSxVQUFVLFVBQVUsY0FBMkIsV0FBVztBQUNoRSxRQUFJLFNBQVM7QUFDWixjQUFRLE1BQU0sVUFBVSxVQUFVLEtBQUs7QUFBQSxJQUN4QztBQUFBLEVBQ0Q7QUFBQSxFQUVRLGlCQUFpQjtBQUN4QixTQUFLLFlBQVk7QUFDakIsU0FBSyxtQkFBbUI7QUFDeEIsU0FBSyxrQkFBa0I7QUFDdkIsU0FBSyxVQUFVLGlCQUFpQixlQUFlLEVBQUUsUUFBUSxDQUFDLE9BQVEsR0FBbUIsWUFBWSxjQUFjLENBQUM7QUFBQSxFQUNqSDtBQUFBLEVBRVEsZUFBZSxXQUF3QixPQUFlLE9BQWUsYUFBcUI7QUFDakcsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssZUFBZSxDQUFDO0FBQ3hELFNBQUssU0FBUyxPQUFPLEVBQUUsTUFBTSxPQUFPLEtBQUsscUJBQXFCLENBQUM7QUFDL0QsU0FBSyxTQUFTLE9BQU8sRUFBRSxNQUFNLE9BQU8sS0FBSyxxQkFBcUIsQ0FBQztBQUMvRCxTQUFLLFNBQVMsT0FBTyxFQUFFLE1BQU0sYUFBYSxLQUFLLG9CQUFvQixDQUFDO0FBQUEsRUFDckU7QUFBQSxFQUVRLG9CQUFvQixXQUF3QixRQUEyQjtBQUM5RSxRQUFJLENBQUMsT0FBTyxRQUFRO0FBQ25CLGdCQUFVLFVBQVUsRUFBRSxLQUFLLFlBQVksTUFBTSwyQkFBTyxDQUFDO0FBQ3JEO0FBQUEsSUFDRDtBQUNBLFVBQU0sU0FBUyxVQUFVLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQzdELFVBQU0sUUFBUSxPQUFPLFVBQVUsRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBQ2hFLFVBQU0sVUFBVSxNQUFNLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQzNELFVBQU0sV0FBVyxLQUFLO0FBQUEsTUFDckI7QUFBQSxNQUNBLEdBQUcsT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksTUFBTSxTQUFTLE1BQU0sU0FBUyxDQUFDO0FBQUEsSUFDbEU7QUFFQSxVQUFNLGNBQWM7QUFDcEIsVUFBTSxNQUFNLFdBQVcsR0FBRyxPQUFPLFNBQVMsV0FBVztBQUVyRCxVQUFNLGNBQWMsTUFBTSxRQUFRLFlBQVksU0FBUztBQUV2RCxXQUFPLFFBQVEsQ0FBQyxVQUFVO0FBQ3pCLFlBQU0sU0FBUyxNQUFNLFVBQVUsRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUN0RCxZQUFNLE9BQU8sT0FBTyxVQUFVLEVBQUUsS0FBSyxvQkFBb0IsQ0FBQztBQUMxRCxZQUFNLGFBQWEsS0FBSyxVQUFVO0FBQUEsUUFDakMsS0FBSztBQUFBLFFBQ0wsTUFBTSxFQUFFLE9BQU8sVUFBVyxNQUFNLFVBQVUsV0FBWSxHQUFHLElBQUk7QUFBQSxNQUM5RCxDQUFDO0FBQ0QsWUFBTSxlQUFlLEtBQUssVUFBVTtBQUFBLFFBQ25DLEtBQUs7QUFBQSxRQUNMLE1BQU0sRUFBRSxPQUFPLFVBQVcsTUFBTSxZQUFZLFdBQVksR0FBRyxJQUFJO0FBQUEsTUFDaEUsQ0FBQztBQUNELGFBQU8sVUFBVSxFQUFFLEtBQUssa0JBQWtCLE1BQU0sTUFBTSxLQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUM7QUFFckUsWUFBTSxjQUFjLENBQUMsUUFBb0I7QUFDeEMsY0FBTSxTQUFTLElBQUk7QUFDbkIsZ0JBQVEsUUFBUSxHQUFHLE1BQU0sSUFBSSxpQkFBTyxNQUFNLE9BQU8sc0JBQVMsTUFBTSxTQUFTLEVBQUU7QUFDM0UsZ0JBQVEsU0FBUyxTQUFTO0FBQzFCLGNBQU0sU0FBUyxNQUFNLHNCQUFzQjtBQUMzQyxjQUFNLElBQUksSUFBSSxVQUFVLE9BQU87QUFDL0IsY0FBTSxJQUFJLElBQUksVUFBVSxPQUFPLE1BQU07QUFDckMsZ0JBQVEsTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUN6QixnQkFBUSxNQUFNLE1BQU0sR0FBRyxDQUFDO0FBQUEsTUFDekI7QUFDQSxPQUFDLFlBQVksY0FBYyxNQUFNLEVBQUUsUUFBUSxDQUFDLE9BQU87QUFDbEQsV0FBRyxpQkFBaUIsY0FBYyxXQUFXO0FBQzdDLFdBQUcsaUJBQWlCLGFBQWEsV0FBVztBQUM1QyxXQUFHLGlCQUFpQixjQUFjLFdBQVc7QUFBQSxNQUM5QyxDQUFDO0FBQUEsSUFDRixDQUFDO0FBRUQsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDN0QsU0FBSyxpQkFBaUIsUUFBUSxnQkFBTSw0QkFBNEI7QUFDaEUsU0FBSyxpQkFBaUIsUUFBUSxnQkFBTSwyQkFBMkI7QUFBQSxFQUNoRTtBQUFBLEVBRVEsaUJBQWlCLFdBQXdCLE9BQWUsT0FBZTtBQUM5RSxVQUFNLE9BQU8sVUFBVSxVQUFVLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUMxRCxVQUFNLE1BQU0sS0FBSyxVQUFVLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQztBQUNuRCxJQUFDLElBQXVCLE1BQU0sYUFBYTtBQUMzQyxTQUFLLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUFBLEVBQ2hDO0FBQUEsRUFFUSxxQkFBcUIsV0FBd0IsUUFBMEI7QUFDOUUsWUFBUSxJQUFJLHlEQUF5RCxPQUFPLFFBQVEsUUFBUTtBQUM1RixRQUFJLENBQUMsT0FBTyxRQUFRO0FBQ25CLGdCQUFVLFVBQVUsRUFBRSxLQUFLLFlBQVksTUFBTSw2Q0FBVSxDQUFDO0FBQ3hELGNBQVEsSUFBSSxxREFBcUQ7QUFDakU7QUFBQSxJQUNEO0FBQ0EsWUFBUSxJQUFJLDRDQUE0QyxNQUFNO0FBRTlELFVBQU0sU0FBUyxVQUFVLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQzdELFVBQU0sZUFBZSxPQUFPLFVBQVUsRUFBRSxLQUFLLHlCQUF5QixDQUFDO0FBQ3ZFLFVBQU0sYUFBYSxLQUFLLElBQUksT0FBTyxRQUFRLENBQUM7QUFDNUMsVUFBTSxXQUFXLGFBQWE7QUFDOUIsVUFBTSxpQkFBaUIsS0FBSyxJQUFJLE9BQU8sUUFBUSxDQUFDO0FBQ2hELFVBQU0sY0FBYztBQUNwQixVQUFNLFNBQVMsaUJBQWlCLEtBQUs7QUFDckMsVUFBTSxXQUFXLEtBQUssSUFBSSxPQUFPLFNBQVMsYUFBYSxRQUFRLEVBQUU7QUFDakUsaUJBQWEsTUFBTSxXQUFXLEdBQUcsUUFBUTtBQUN6QyxVQUFNLFNBQVM7QUFDZixVQUFNLFVBQVU7QUFDaEIsVUFBTSxXQUFXO0FBQ2pCLFVBQU0sYUFBYSxRQUFRLFVBQVU7QUFDckMsVUFBTSxNQUFNLGlCQUFpQixLQUFLO0FBQ2xDLGdCQUFZLEtBQUs7QUFBQSxNQUNoQixTQUFTLE9BQU8sVUFBVSxJQUFJLE1BQU07QUFBQSxNQUNwQyxxQkFBcUI7QUFBQSxNQUNyQixPQUFPLE9BQU8sVUFBVTtBQUFBLE1BQ3hCLFFBQVEsT0FBTyxNQUFNO0FBQUEsSUFDdEIsQ0FBQztBQUNELGlCQUFhLFlBQVksR0FBRztBQUU1QixVQUFNLFdBQVcsaUJBQWlCLE1BQU07QUFDeEMsZ0JBQVksVUFBVTtBQUFBLE1BQ3JCLElBQUksT0FBTyxPQUFPO0FBQUEsTUFDbEIsSUFBSSxPQUFPLFNBQVMsQ0FBQztBQUFBLE1BQ3JCLElBQUksT0FBTyxhQUFhLFFBQVE7QUFBQSxNQUNoQyxJQUFJLE9BQU8sU0FBUyxDQUFDO0FBQUEsTUFDckIsUUFBUTtBQUFBLE1BQ1IsZ0JBQWdCO0FBQUEsSUFDakIsQ0FBQztBQUNELFFBQUksWUFBWSxRQUFRO0FBRXhCLFVBQU0sYUFBYSxPQUFPLElBQUksQ0FBQyxPQUFPLFVBQVU7QUFDL0MsWUFBTSxJQUNMLE9BQU8sV0FBVyxJQUNmLFVBQVUsUUFBUSxJQUNsQixVQUFXLFNBQVMsT0FBTyxTQUFTLEtBQUssS0FBTTtBQUNuRCxZQUFNLGNBQWMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUc7QUFDekQsWUFBTSxJQUFJLFNBQVUsY0FBYyxPQUFRLFNBQVMsTUFBTTtBQUN6RCxhQUFPLEVBQUUsR0FBRyxHQUFHLE1BQU0sWUFBWTtBQUFBLElBQ2xDLENBQUM7QUFDRCxZQUFRLElBQUksZ0RBQWdELFVBQVU7QUFDdEUsVUFBTSxTQUFTLFdBQVcsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRztBQUM5RCxVQUFNLFdBQVcsaUJBQWlCLFVBQVU7QUFDNUMsZ0JBQVksVUFBVTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSxNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixnQkFBZ0I7QUFBQSxNQUNoQixrQkFBa0I7QUFBQSxNQUNsQixtQkFBbUI7QUFBQSxJQUNwQixDQUFDO0FBQ0QsUUFBSSxZQUFZLFFBQVE7QUFDeEIsVUFBTSxVQUFVLGFBQWEsVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDbEUsVUFBTSxjQUFjLE1BQU0sUUFBUSxZQUFZLFNBQVM7QUFFdkQsV0FBTyxRQUFRLENBQUMsT0FBTyxVQUFVO0FBQ2hDLFlBQU0sT0FDTCxPQUFPLFdBQVcsSUFDZixVQUFVLFFBQVEsSUFDbEIsVUFBVyxTQUFTLE9BQU8sU0FBUyxLQUFLLEtBQU07QUFDbkQsWUFBTSxjQUFjLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxNQUFNLENBQUMsR0FBRyxHQUFHO0FBQ3pELFlBQU0sT0FBTyxTQUFVLGNBQWMsT0FBUSxTQUFTLE1BQU07QUFDNUQsWUFBTSxTQUFTLGlCQUFpQixRQUFRO0FBQ3hDLGtCQUFZLFFBQVE7QUFBQSxRQUNuQixJQUFJLE9BQU8sSUFBSTtBQUFBLFFBQ2YsSUFBSSxPQUFPLElBQUk7QUFBQSxRQUNmLEdBQUc7QUFBQSxRQUNILE1BQU07QUFBQSxNQUNQLENBQUM7QUFDRCxVQUFJLFlBQVksTUFBTTtBQUN0QixZQUFNLGNBQWMsQ0FBQyxRQUFvQjtBQUN4QyxjQUFNLFNBQVMsYUFBYSxzQkFBc0I7QUFDbEQsY0FBTSxJQUFJLElBQUksVUFBVSxPQUFPO0FBQy9CLGNBQU0sSUFBSSxJQUFJLFVBQVUsT0FBTyxNQUFNO0FBQ3JDLGdCQUFRLFFBQVEsR0FBRyxNQUFNLElBQUksdUJBQVEsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLEdBQUc7QUFDN0QsZ0JBQVEsU0FBUyxTQUFTO0FBQzFCLGdCQUFRLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFDekIsZ0JBQVEsTUFBTSxNQUFNLEdBQUcsQ0FBQztBQUFBLE1BQ3pCO0FBQ0EsYUFBTyxpQkFBaUIsY0FBYyxXQUFXO0FBQ2pELGFBQU8saUJBQWlCLGFBQWEsV0FBVztBQUNoRCxhQUFPLGlCQUFpQixjQUFjLFdBQVc7QUFBQSxJQUNsRCxDQUFDO0FBR0QsZUFBVyxRQUFRLENBQUMsT0FBTyxVQUFVO0FBQ3BDLFlBQU0sT0FBTyxXQUFXLFFBQVEsQ0FBQztBQUNqQyxZQUFNLE9BQU8sV0FBVyxRQUFRLENBQUM7QUFDakMsWUFBTSxZQUFZLFFBQVEsS0FBSyxJQUFJLE1BQU0sS0FBSyxJQUFJO0FBQ2xELFlBQU0sYUFBYSxRQUFRLE1BQU0sSUFBSSxLQUFLLEtBQUssSUFBSSxhQUFhO0FBQ2hFLFlBQU0sU0FBUyxpQkFBaUIsTUFBTTtBQUN0QyxrQkFBWSxRQUFRO0FBQUEsUUFDbkIsR0FBRyxPQUFPLFNBQVM7QUFBQSxRQUNuQixHQUFHO0FBQUEsUUFDSCxPQUFPLE9BQU8sS0FBSyxJQUFJLEdBQUcsYUFBYSxTQUFTLENBQUM7QUFBQSxRQUNqRCxRQUFRLE9BQU8sTUFBTTtBQUFBLFFBQ3JCLE1BQU07QUFBQSxNQUNQLENBQUM7QUFDRCxZQUFNLGNBQWMsQ0FBQyxRQUFvQjtBQUN4QyxjQUFNLFNBQVMsYUFBYSxzQkFBc0I7QUFDbEQsY0FBTSxJQUFJLElBQUksVUFBVSxPQUFPO0FBQy9CLGNBQU0sSUFBSSxJQUFJLFVBQVUsT0FBTyxNQUFNO0FBQ3JDLGdCQUFRLFFBQVEsR0FBRyxPQUFPLEtBQUssRUFBRSxJQUFJLHVCQUFRLE9BQU8sS0FBSyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsR0FBRztBQUM3RSxnQkFBUSxTQUFTLFNBQVM7QUFDMUIsZ0JBQVEsTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUN6QixnQkFBUSxNQUFNLE1BQU0sR0FBRyxDQUFDO0FBQUEsTUFDekI7QUFDQSxhQUFPLGlCQUFpQixjQUFjLFdBQVc7QUFDakQsYUFBTyxpQkFBaUIsYUFBYSxXQUFXO0FBQ2hELGFBQU8saUJBQWlCLGNBQWMsV0FBVztBQUNqRCxVQUFJLFlBQVksTUFBTTtBQUFBLElBQ3ZCLENBQUM7QUFFRCxVQUFNLFNBQVMsYUFBYSxVQUFVLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUNuRSxXQUFPLE1BQU0sc0JBQXNCLFVBQVUsS0FBSyxJQUFJLE9BQU8sUUFBUSxDQUFDLENBQUM7QUFDdkUsV0FBTyxRQUFRLENBQUMsVUFBVTtBQUN6QixhQUFPLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixNQUFNLE1BQU0sS0FBSyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQUEsSUFDdEUsQ0FBQztBQUFBLEVBQ0Y7QUFBQSxFQUVRLFlBQVksT0FBcUIsUUFBOEI7QUFDdEUsUUFBSSxDQUFDLE9BQU8sS0FBSztBQUFHLGFBQU87QUFDM0IsV0FBTyxNQUFNLE9BQU8sQ0FBQyxTQUFTO0FBQzdCLFlBQU0sT0FBTztBQUFBLFFBQ1osS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSyxLQUFLLEtBQUssR0FBRztBQUFBLFFBQ2xCLEdBQUksTUFBTSxRQUFRLEtBQUssT0FBTyxJQUMzQixLQUFLLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxPQUFPLE9BQU8sSUFDdEQsQ0FBQztBQUFBLE1BQ0wsRUFBRSxLQUFLLEdBQUc7QUFDVixhQUFPLEtBQUssa0JBQWtCLFFBQVEsSUFBSTtBQUFBLElBQzNDLENBQUM7QUFBQSxFQUNGO0FBQUEsRUFFUSxrQkFBa0IsUUFBZ0IsTUFBdUI7QUFDaEUsUUFBSSxDQUFDLE9BQU8sS0FBSztBQUFHLGFBQU87QUFDM0IsV0FBTyxLQUFLLFlBQVksRUFBRSxTQUFTLE9BQU8sWUFBWSxDQUFDO0FBQUEsRUFDeEQ7QUFBQSxFQUVRLHdCQUF3QixXQUF3QixPQUFzQjtBQUM3RSxRQUFJLENBQUMsTUFBTSxlQUFlO0FBQ3pCLGdCQUFVLFVBQVUsRUFBRSxLQUFLLFlBQVksTUFBTSxxRUFBYyxDQUFDO0FBQzVEO0FBQUEsSUFDRDtBQUNBLFVBQU0sT0FBTyxVQUFVLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQzVELFNBQUssVUFBVSxFQUFFLE1BQU0sdUNBQVMsTUFBTSxhQUFhLElBQUksS0FBSyxtQkFBbUIsQ0FBQztBQUNoRixTQUFLLFVBQVU7QUFBQSxNQUNkLE1BQU0sdUNBQVMsY0FBYyxNQUFNLGdCQUFnQixDQUFDO0FBQUEsTUFDcEQsS0FBSztBQUFBLElBQ04sQ0FBQztBQUVELFVBQU0sV0FBVyxVQUFVLFVBQVUsRUFBRSxLQUFLLGNBQWMsQ0FBQztBQUMzRCxhQUFTLFVBQVU7QUFBQSxNQUNsQixLQUFLO0FBQUEsTUFDTCxNQUFNLEVBQUUsT0FBTyxTQUFTLG1CQUFtQixNQUFNLFVBQVUsQ0FBQyxJQUFJO0FBQUEsSUFDakUsQ0FBQztBQUNELGFBQVMsVUFBVTtBQUFBLE1BQ2xCLEtBQUs7QUFBQSxNQUNMLE1BQU0sRUFBRSxPQUFPLFNBQVMsbUJBQW1CLE1BQU0sV0FBVyxDQUFDLElBQUk7QUFBQSxJQUNsRSxDQUFDO0FBRUQsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUsscUJBQXFCLENBQUM7QUFDaEUsU0FBSyxpQkFBaUIsUUFBUSw0QkFBUSw2QkFBNkI7QUFDbkUsU0FBSyxpQkFBaUIsUUFBUSw2QkFBUywyQkFBMkI7QUFBQSxFQUNuRTtBQUFBLEVBRVEsbUJBQW1CLE9BQWtDO0FBQzVELFVBQU0sUUFBUSxLQUFLLE9BQU8sU0FBUztBQUNuQyxVQUFNLFFBQVEsTUFBTSxRQUFRLFFBQVEsQ0FBQyxRQUFRLElBQUksS0FBSztBQUN0RCxVQUFNLGFBQWEsTUFBTTtBQUN6QixVQUFNLGlCQUFpQixNQUFNLE9BQU8sQ0FBQyxTQUFTLEtBQUssU0FBUztBQUM1RCxVQUFNLGlCQUFpQixlQUFlO0FBQ3RDLFVBQU0sV0FBVyxhQUFhO0FBQzlCLFVBQU0saUJBQWlCLGFBQWEsaUJBQWlCLGFBQWE7QUFDbEUsVUFBTSxnQkFBZ0IsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQzVELFVBQU0sTUFBTSxLQUFLLElBQUk7QUFDckIsVUFBTSxlQUFlLGNBQWMsT0FBTyxDQUFDLFNBQVM7QUFDbkQsVUFBSSxDQUFDLEtBQUs7QUFBVSxlQUFPO0FBQzNCLFVBQUksS0FBSyxXQUFXO0FBQ25CLGNBQU0sU0FBUyxLQUFLLGVBQWUsS0FBSztBQUN4QyxlQUFPLENBQUMsQ0FBQyxVQUFVLFNBQVMsS0FBSztBQUFBLE1BQ2xDO0FBQ0EsYUFBTyxNQUFNLEtBQUs7QUFBQSxJQUNuQixDQUFDLEVBQUU7QUFDSCxVQUFNLGNBQWMsY0FBYyxPQUFPLENBQUMsU0FBUztBQUNsRCxVQUFJLENBQUMsS0FBSyxZQUFZLENBQUMsS0FBSztBQUFXLGVBQU87QUFDOUMsWUFBTSxTQUFTLEtBQUssZUFBZSxLQUFLO0FBQ3hDLGFBQU8sQ0FBQyxDQUFDLFVBQVUsVUFBVSxLQUFLO0FBQUEsSUFDbkMsQ0FBQyxFQUFFO0FBQ0gsVUFBTSxrQkFBa0IsTUFBTTtBQUM3QixZQUFNLFdBQVcsZUFBZSxPQUFPLENBQUMsU0FBUyxLQUFLLFdBQVc7QUFDakUsVUFBSSxDQUFDLFNBQVM7QUFBUSxlQUFPO0FBQzdCLFlBQU0sUUFBUSxTQUFTO0FBQUEsUUFDdEIsQ0FBQyxLQUFLLFNBQVMsTUFBTSxLQUFLLElBQUksR0FBSSxLQUFLLGNBQWUsS0FBSyxTQUFVO0FBQUEsUUFDckU7QUFBQSxNQUNEO0FBQ0EsYUFBTyxRQUFRLFNBQVM7QUFBQSxJQUN6QixHQUFHO0FBRUgsVUFBTSxlQUFlLEtBQUssaUJBQWlCLE9BQU8sV0FBVyxLQUFLO0FBQ2xFLFVBQU0saUJBQWlCLEtBQUssaUJBQWlCLE9BQU8sYUFBYSxLQUFLO0FBQ3RFLFVBQU0sY0FBaUMsYUFBYSxJQUFJLENBQUMsT0FBTyxXQUFXO0FBQUEsTUFDMUUsTUFBTSxNQUFNO0FBQUEsTUFDWixTQUFTLE1BQU07QUFBQSxNQUNmLFdBQVcsZUFBZSxLQUFLLEdBQUcsU0FBUztBQUFBLElBQzVDLEVBQUU7QUFDRixVQUFNLGFBQStCLFlBQVksSUFBSSxDQUFDLFdBQVc7QUFBQSxNQUNoRSxNQUFNLE1BQU07QUFBQSxNQUNaLE1BQ0MsTUFBTSxXQUFXLE1BQU0sWUFDcEIsS0FBSyxJQUFJLEtBQU0sTUFBTSxZQUFZLEtBQUssSUFBSSxNQUFNLFNBQVMsTUFBTSxXQUFXLENBQUMsSUFBSyxHQUFHLElBQ25GO0FBQUEsSUFDTCxFQUFFO0FBRUYsV0FBTztBQUFBLE1BQ047QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLGVBQWUsY0FBYztBQUFBLE1BQzdCLGtCQUFrQixhQUFhLGNBQWMsU0FBUyxhQUFhO0FBQUEsTUFDbkU7QUFBQSxNQUNBLGFBQWEsY0FBYyxTQUFTLGVBQWUsY0FBYyxTQUFTO0FBQUEsTUFDMUUsWUFBWSxjQUFjLFNBQVMsY0FBYyxjQUFjLFNBQVM7QUFBQSxNQUN4RTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUVRLGlCQUFpQixPQUFxQixNQUErQixPQUFtQjtBQUMvRixVQUFNLFdBQVcsS0FBSyxLQUFLLEtBQUs7QUFDaEMsVUFBTSxFQUFFLE9BQU8sSUFBSSxJQUFJLEtBQUssYUFBYSxLQUFLO0FBQzlDLFVBQU0sT0FBTyxLQUFLLElBQUksR0FBRyxLQUFLLE9BQU8sTUFBTSxTQUFTLFFBQVEsSUFBSSxDQUFDO0FBQ2pFLFVBQU0sVUFBVSxvQkFBSSxJQUFvQjtBQUN4QyxRQUFJLFlBQVk7QUFDaEIsUUFBSSxhQUFhO0FBQ2pCLFFBQUksVUFBVTtBQUVkLGVBQVcsUUFBUSxPQUFPO0FBQ3pCLFlBQU0sWUFDTCxTQUFTLFlBQ04sS0FBSyxZQUNMLEtBQUssZ0JBQWdCLEtBQUssWUFBWSxLQUFLLFlBQVk7QUFDM0QsVUFBSSxDQUFDLFdBQVc7QUFDZjtBQUNBO0FBQUEsTUFDRDtBQUNBLFVBQUksWUFBWSxTQUFTLFlBQVksS0FBSztBQUN6QztBQUNBO0FBQUEsTUFDRDtBQUNBLFlBQU0sTUFBTSxLQUFLLFNBQVMsU0FBUztBQUNuQyxjQUFRLElBQUksTUFBTSxRQUFRLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztBQUM1QztBQUFBLElBQ0Q7QUFFQSxVQUFNLFNBQTRCLENBQUM7QUFDbkMsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLEtBQUs7QUFDOUIsWUFBTSxRQUFRLFFBQVEsSUFBSTtBQUMxQixZQUFNLE1BQU0sS0FBSyxTQUFTLEtBQUs7QUFDL0IsYUFBTyxLQUFLLEVBQUUsTUFBTSxLQUFLLE9BQU8sUUFBUSxJQUFJLEdBQUcsS0FBSyxFQUFFLENBQUM7QUFBQSxJQUN4RDtBQUNBLFVBQU0sUUFBUSxTQUFTLFlBQVksWUFBWTtBQUMvQyxZQUFRLElBQUkseUJBQXlCLEtBQUssaUJBQWlCO0FBQUEsTUFDMUQsWUFBWSxJQUFJLEtBQUssS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUFBLE1BQ3JELFVBQVUsSUFBSSxLQUFLLEdBQUcsRUFBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFBQSxNQUNqRCxRQUFRLE9BQU87QUFBQSxNQUNmO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNELENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDUjtBQUFBLEVBRVEsYUFBYSxPQUFtRDtBQUN2RSxRQUFJLE1BQU0sU0FBUyxVQUFVO0FBQzVCLGFBQU87QUFBQSxRQUNOLE9BQU8sS0FBSyxXQUFXLE1BQU0sS0FBSztBQUFBLFFBQ2xDLEtBQUssS0FBSyxXQUFXLE1BQU0sR0FBRztBQUFBLE1BQy9CO0FBQUEsSUFDRDtBQUNBLFVBQU0sV0FBVyxLQUFLLEtBQUssS0FBSztBQUNoQyxVQUFNLE1BQU0sS0FBSyxXQUFXLEtBQUssSUFBSSxDQUFDO0FBQ3RDLFVBQU0sUUFBUSxPQUFPLE1BQU0sT0FBTyxLQUFLO0FBQ3ZDLFdBQU8sRUFBRSxPQUFPLElBQUk7QUFBQSxFQUNyQjtBQUFBLEVBRVEsU0FBUyxXQUEyQjtBQUMzQyxVQUFNLE9BQU8sSUFBSSxLQUFLLFNBQVM7QUFDL0IsVUFBTSxJQUFJLEtBQUssWUFBWTtBQUMzQixVQUFNLElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDckQsVUFBTSxJQUFJLE9BQU8sS0FBSyxRQUFRLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNoRCxXQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDdEI7QUFBQSxFQUVRLFdBQVcsV0FBMkI7QUFDN0MsVUFBTSxPQUFPLElBQUksS0FBSyxTQUFTO0FBQy9CLFNBQUssU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLFdBQU8sS0FBSyxRQUFRO0FBQUEsRUFDckI7QUFBQSxFQUVRLHVCQUF1RDtBQUM5RCxRQUFJLEtBQUssbUJBQW1CLFlBQVksS0FBSyxnQkFBZ0I7QUFDNUQsYUFBTyxLQUFLO0FBQUEsSUFDYjtBQUNBLFFBQUksS0FBSyxtQkFBbUIsYUFBYTtBQUN4QyxZQUFNQyxTQUFRLEtBQUssV0FBVyxLQUFLLElBQUksQ0FBQztBQUN4QyxZQUFNLFlBQVlBLFNBQVEsS0FBSyxLQUFLLEtBQUs7QUFDekMsYUFBTyxFQUFFLE9BQU8sV0FBVyxLQUFLLFVBQVU7QUFBQSxJQUMzQztBQUNBLFVBQU0sUUFBUSxLQUFLLFdBQVcsS0FBSyxJQUFJLENBQUM7QUFDeEMsV0FBTyxFQUFFLE9BQU8sT0FBTyxLQUFLLE1BQU07QUFBQSxFQUNuQztBQUFBLEVBRVEscUJBQXFCLE9BQWUsS0FBOEI7QUFDekUsVUFBTSxRQUFRLEtBQUssT0FBTyxTQUFTO0FBQ25DLFVBQU0sVUFBMkIsQ0FBQztBQUNsQyxVQUFNLFVBQVUsS0FBSyxXQUFXLEtBQUs7QUFDckMsVUFBTSxRQUFRLEtBQUssV0FBVyxHQUFHLElBQUksS0FBSyxLQUFLLEtBQUssTUFBTztBQUMzRCxlQUFXLFVBQVUsTUFBTSxTQUFTO0FBQ25DLGlCQUFXLFFBQVEsT0FBTyxPQUFPO0FBQ2hDLFlBQUksQ0FBQyxNQUFNLFFBQVEsS0FBSyxPQUFPO0FBQUc7QUFDbEMsbUJBQVcsUUFBUSxLQUFLLFNBQVM7QUFDaEMsY0FBSSxDQUFDLEtBQUs7QUFBVztBQUNyQixjQUFJLEtBQUssWUFBWSxXQUFXLEtBQUssWUFBWTtBQUFPO0FBQ3hELGtCQUFRLEtBQUs7QUFBQSxZQUNaLFFBQVEsS0FBSztBQUFBLFlBQ2IsV0FBVyxLQUFLO0FBQUEsWUFDaEIsWUFBWSxPQUFPO0FBQUEsWUFDbkIsV0FBVyxLQUFLO0FBQUEsWUFDaEIsTUFBTSxLQUFLLFVBQVU7QUFBQSxVQUN0QixDQUFDO0FBQUEsUUFDRjtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQ0EsV0FBTyxRQUFRLEtBQUssQ0FBQyxHQUFHLE1BQU0sRUFBRSxZQUFZLEVBQUUsU0FBUztBQUFBLEVBQ3hEO0FBQ0Q7QUFFQSxJQUFNLFlBQU4sY0FBd0Isc0JBQU07QUFBQSxFQXFCN0IsWUFDQyxLQUNRLFFBQ0EsVUFDQSxNQUNQO0FBQ0QsVUFBTSxHQUFHO0FBSkQ7QUFDQTtBQUNBO0FBeEJULFNBQVEsYUFBYTtBQUNyQixTQUFRLFlBQVk7QUFDcEIsU0FBUSxjQUFjO0FBQ3RCLFNBQVEsY0FBYztBQUN0QixTQUFRLGdCQUFnQjtBQUN4QixTQUFRLGFBQWE7QUFDckIsU0FBUSxhQUFhLENBQUMsUUFBdUI7QUFDNUMsVUFDQyxJQUFJLFFBQVEsV0FDWixDQUFDLElBQUksWUFDTCxDQUFDLElBQUksV0FDTCxDQUFDLElBQUksV0FDTCxDQUFDLElBQUksVUFDTCxDQUFDLElBQUksYUFDSjtBQUNELFlBQUksZUFBZTtBQUNuQixhQUFLLEtBQUssYUFBYTtBQUFBLE1BQ3hCO0FBQUEsSUFDRDtBQVNDLFNBQUssT0FBTyxnQkFBZ0IsUUFBUTtBQUNwQyxRQUFJLE1BQU07QUFDVCxXQUFLLGFBQWEsS0FBSztBQUN2QixXQUFLLFlBQVksS0FBSyxLQUFLLEtBQUssSUFBSTtBQUNwQyxXQUFLLGNBQWMsS0FBSztBQUN4QixXQUFLLGdCQUFnQixvQkFBb0IsS0FBSyxRQUFRO0FBQUEsSUFDdkQ7QUFBQSxFQUNEO0FBQUEsRUFFQSxTQUFTO0FBQ1IsVUFBTSxFQUFFLFVBQVUsSUFBSTtBQUN0QixjQUFVLE1BQU07QUFDaEIsY0FBVSxTQUFTLFVBQVU7QUFDN0IsY0FBVSxpQkFBaUIsV0FBVyxLQUFLLFVBQVU7QUFFckQsY0FBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLEtBQUssT0FBTyw2QkFBUywyQkFBTyxDQUFDO0FBRTlELFNBQUssYUFBYSxLQUFLLGNBQWM7QUFDckMsb0JBQWdCLFdBQVcsZ0JBQU0sS0FBSyxZQUFZLENBQUMsVUFBVTtBQUM1RCxXQUFLLGFBQWE7QUFBQSxJQUNuQixDQUFDO0FBRUQsb0JBQWdCLFdBQVcsb0RBQVksS0FBSyxXQUFXLENBQUMsVUFBVTtBQUNqRSxXQUFLLFlBQVk7QUFBQSxJQUNsQixDQUFDO0FBRUEsbUJBQWUsV0FBVyxnQkFBTSxLQUFLLGFBQWEsQ0FBQyxVQUFVO0FBQzVELFdBQUssY0FBYztBQUFBLElBQ3BCLENBQUM7QUFFRCx3QkFBb0IsV0FBVyw0QkFBUSxLQUFLLGVBQWUsQ0FBQyxVQUFVO0FBQ3JFLFdBQUssZ0JBQWdCO0FBQUEsSUFDdEIsQ0FBQztBQUVGLG1CQUFlLFdBQVcsZ0VBQWMsSUFBSSxDQUFDLFVBQVU7QUFDdEQsV0FBSyxjQUFjO0FBQUEsSUFDcEIsQ0FBQztBQUVELFVBQU0sU0FBUyxVQUFVLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQzdELFVBQU0sWUFBWSxPQUFPLFNBQVMsVUFBVSxFQUFFLE1BQU0sZ0JBQU0sS0FBSyxzQkFBc0IsQ0FBQztBQUN0RixjQUFVLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFFdEQsVUFBTSxZQUFZLE9BQU8sU0FBUyxVQUFVO0FBQUEsTUFDM0MsTUFBTSxLQUFLLE9BQU8saUJBQU87QUFBQSxNQUN6QixLQUFLO0FBQUEsSUFDTixDQUFDO0FBQ0QsY0FBVSxpQkFBaUIsU0FBUyxNQUFNLEtBQUssS0FBSyxhQUFhLENBQUM7QUFBQSxFQUNuRTtBQUFBLEVBRUEsVUFBVTtBQUNULFNBQUssVUFBVSxvQkFBb0IsV0FBVyxLQUFLLFVBQVU7QUFDN0QsVUFBTSxRQUFRO0FBQUEsRUFDZjtBQUFBLEVBRUEsTUFBTSxlQUFlO0FBQ3BCLFFBQUksS0FBSztBQUFZO0FBQ3JCLFFBQUksQ0FBQyxLQUFLLFdBQVcsS0FBSyxHQUFHO0FBQzVCLFVBQUksdUJBQU8sc0NBQVE7QUFDbkI7QUFBQSxJQUNEO0FBQ0EsVUFBTSxPQUFPLFVBQVUsS0FBSyxTQUFTO0FBQ3JDLFVBQU0sU0FBUyxLQUFLLFlBQVksS0FBSztBQUNyQyxVQUFNLFdBQVcsbUJBQW1CLEtBQUssYUFBYTtBQUN0RCxTQUFLLGFBQWE7QUFDbEIsUUFBSTtBQUNILFVBQUksS0FBSyxNQUFNO0FBQ2QsY0FBTSxLQUFLLE9BQU87QUFBQSxVQUNqQixLQUFLO0FBQUEsVUFDTCxLQUFLLEtBQUs7QUFBQSxVQUNWLEVBQUUsT0FBTyxLQUFLLFlBQVksTUFBTSxRQUFRLFNBQVM7QUFBQSxVQUNqRCxLQUFLLFlBQVksS0FBSyxLQUFLO0FBQUEsUUFDNUI7QUFBQSxNQUNELE9BQU87QUFDTixjQUFNLEtBQUssT0FBTyxRQUFRLEtBQUssVUFBVTtBQUFBLFVBQ3hDLE9BQU8sS0FBSztBQUFBLFVBQ1o7QUFBQSxVQUNBO0FBQUEsVUFDQSxhQUFhLEtBQUssWUFBWSxLQUFLLEtBQUs7QUFBQSxVQUN4QztBQUFBLFFBQ0QsQ0FBQztBQUFBLE1BQ0Y7QUFDQSxXQUFLLE1BQU07QUFBQSxJQUNaLFNBQVMsT0FBTztBQUNmLGNBQVEsTUFBTSwyQ0FBMkMsS0FBSztBQUM5RCxVQUFJLHVCQUFPLGtEQUFVO0FBQUEsSUFDdEIsVUFBRTtBQUNELFdBQUssYUFBYTtBQUFBLElBQ25CO0FBQUEsRUFDRDtBQUNEO0FBU0EsSUFBTSxjQUFOLGNBQTBCLHNCQUFNO0FBQUEsRUFHL0IsWUFBWSxLQUFrQixTQUE2QjtBQUMxRCxVQUFNLEdBQUc7QUFEb0I7QUFFN0IsU0FBSyxRQUFRLFFBQVEsZ0JBQWdCO0FBQUEsRUFDdEM7QUFBQSxFQUVBLFNBQVM7QUFDUixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMsVUFBVTtBQUM3QixjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sS0FBSyxRQUFRLE1BQU0sQ0FBQztBQUVyRCxvQkFBZ0IsV0FBVyw0QkFBUSxLQUFLLE9BQU8sQ0FBQyxVQUFXLEtBQUssUUFBUSxLQUFNO0FBRTlFLFVBQU0sU0FBUyxVQUFVLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQzdELFVBQU0sWUFBWSxPQUFPLFNBQVMsVUFBVSxFQUFFLE1BQU0sZ0JBQU0sS0FBSyxzQkFBc0IsQ0FBQztBQUN0RixjQUFVLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFFdEQsVUFBTSxhQUFhLE9BQU8sU0FBUyxVQUFVO0FBQUEsTUFDNUMsTUFBTSxLQUFLLFFBQVEsZUFBZTtBQUFBLE1BQ2xDLEtBQUs7QUFBQSxJQUNOLENBQUM7QUFDRCxlQUFXLGlCQUFpQixTQUFTLFlBQVk7QUFDaEQsWUFBTSxLQUFLLFFBQVEsU0FBUyxLQUFLLEtBQUs7QUFDdEMsV0FBSyxNQUFNO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDRjtBQUNEO0FBVUEsSUFBTSxlQUFOLGNBQTJCLHNCQUFNO0FBQUEsRUFDaEMsWUFBWSxLQUFrQixTQUE4QjtBQUMzRCxVQUFNLEdBQUc7QUFEb0I7QUFBQSxFQUU5QjtBQUFBLEVBRUEsU0FBUztBQUNSLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxNQUFNO0FBQ2hCLGNBQVUsU0FBUyxVQUFVO0FBQzdCLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQ3JELGNBQVUsVUFBVSxFQUFFLE1BQU0sS0FBSyxRQUFRLFNBQVMsS0FBSyxrQkFBa0IsQ0FBQztBQUUxRSxVQUFNLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUM3RCxVQUFNLFlBQVksT0FBTyxTQUFTLFVBQVU7QUFBQSxNQUMzQyxNQUFNLEtBQUssUUFBUSxjQUFjO0FBQUEsTUFDakMsS0FBSztBQUFBLElBQ04sQ0FBQztBQUNELGNBQVUsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUV0RCxVQUFNLGFBQWEsT0FBTyxTQUFTLFVBQVU7QUFBQSxNQUM1QyxNQUFNLEtBQUssUUFBUSxlQUFlO0FBQUEsTUFDbEMsS0FBSztBQUFBLElBQ04sQ0FBQztBQUNELGVBQVcsaUJBQWlCLFNBQVMsWUFBWTtBQUNoRCxZQUFNLEtBQUssUUFBUSxVQUFVO0FBQzdCLFdBQUssTUFBTTtBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0Y7QUFDRDtBQUVBLFNBQVMsVUFBVSxPQUF5QjtBQUMzQyxTQUFPLE1BQ0wsTUFBTSxHQUFHLEVBQ1QsSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsRUFDdkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUc7QUFDeEI7QUFFQSxTQUFTLG1CQUFtQixPQUE4QjtBQUN6RCxNQUFJLENBQUMsTUFBTSxLQUFLO0FBQUcsV0FBTztBQUMxQixRQUFNLFNBQVMsS0FBSyxNQUFNLEtBQUs7QUFDL0IsU0FBTyxPQUFPLE1BQU0sTUFBTSxJQUFJLE9BQU87QUFDdEM7QUFFQSxTQUFTLG9CQUFvQixPQUErQjtBQUMzRCxNQUFJLENBQUM7QUFBTyxXQUFPO0FBQ25CLFFBQU0sT0FBTyxJQUFJLEtBQUssS0FBSztBQUMzQixRQUFNLE9BQU8sS0FBSyxZQUFZO0FBQzlCLFFBQU0sS0FBSyxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUN0RCxRQUFNLEtBQUssT0FBTyxLQUFLLFFBQVEsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ2pELFFBQU0sS0FBSyxPQUFPLEtBQUssU0FBUyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDbEQsUUFBTSxNQUFNLE9BQU8sS0FBSyxXQUFXLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNyRCxTQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUc7QUFDeEM7QUFFQSxTQUFTLFdBQVc7QUFDbkIsU0FBTyxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDcEU7QUFFQSxTQUFTLFdBQVcsV0FBMkI7QUFDOUMsUUFBTSxPQUFPLElBQUksS0FBSyxTQUFTO0FBQy9CLFFBQU0sSUFBSSxLQUFLLFlBQVk7QUFDM0IsUUFBTSxJQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ3JELFFBQU0sSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDaEQsUUFBTSxLQUFLLE9BQU8sS0FBSyxTQUFTLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNsRCxRQUFNLEtBQUssT0FBTyxLQUFLLFdBQVcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ3BELFNBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUNsQztBQUVBLFNBQVMsV0FBVyxXQUEyQjtBQUM5QyxRQUFNLE9BQU8sSUFBSSxLQUFLLFNBQVM7QUFDL0IsUUFBTSxLQUFLLE9BQU8sS0FBSyxTQUFTLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNsRCxRQUFNLEtBQUssT0FBTyxLQUFLLFdBQVcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ3BELFNBQU8sR0FBRyxFQUFFLElBQUksRUFBRTtBQUNuQjtBQUVBLFNBQVMsZUFBZSxXQUEyQjtBQUNsRCxRQUFNLE9BQU8sSUFBSSxLQUFLLFNBQVM7QUFDL0IsUUFBTSxJQUFJLEtBQUssWUFBWTtBQUMzQixRQUFNLElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDckQsUUFBTSxJQUFJLE9BQU8sS0FBSyxRQUFRLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNoRCxTQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3RCO0FBRUEsU0FBUyxjQUFjLE9BQWUsU0FBUyxHQUFXO0FBQ3pELE1BQUksQ0FBQyxPQUFPLFNBQVMsS0FBSztBQUFHLFdBQU87QUFDcEMsU0FBTyxJQUFJLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQ3JEO0FBRUEsU0FBUyxtQkFBbUIsT0FBdUI7QUFDbEQsTUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLO0FBQUcsV0FBTztBQUNwQyxTQUFPLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxLQUFLLFFBQVEsR0FBRyxDQUFDO0FBQzlDO0FBRUEsU0FBUyxlQUFlLElBQW9CO0FBQzNDLFFBQU0sVUFBVSxLQUFLLE1BQU0sS0FBSyxHQUFLO0FBQ3JDLFFBQU0sUUFBUSxLQUFLLE1BQU0sVUFBVSxFQUFFO0FBQ3JDLFFBQU0sT0FBTyxLQUFLLE1BQU0sUUFBUSxFQUFFO0FBQ2xDLE1BQUksT0FBTyxHQUFHO0FBQ2IsVUFBTSxXQUFXLFFBQVE7QUFDekIsV0FBTyxXQUFXLEdBQUcsSUFBSSxTQUFJLFFBQVEsaUJBQU8sR0FBRyxJQUFJO0FBQUEsRUFDcEQ7QUFDQSxNQUFJLFFBQVEsR0FBRztBQUNkLFVBQU0sYUFBYSxVQUFVO0FBQzdCLFdBQU8sYUFBYSxHQUFHLEtBQUssZUFBSyxVQUFVLFdBQU0sR0FBRyxLQUFLO0FBQUEsRUFDMUQ7QUFDQSxTQUFPLEdBQUcsS0FBSyxJQUFJLFNBQVMsQ0FBQyxDQUFDO0FBQy9CO0FBRUEsU0FBUyxxQkFBcUIsV0FBMkI7QUFDeEQsUUFBTSxPQUFPLElBQUksS0FBSyxTQUFTO0FBQy9CLFFBQU0sSUFBSSxLQUFLLFlBQVk7QUFDM0IsUUFBTSxJQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ3JELFFBQU0sSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDaEQsU0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN0QjtBQUVBLElBQU0sU0FBUztBQUVmLFNBQVMsaUJBQXVELEtBQWlDO0FBQ2hHLFNBQU8sU0FBUyxnQkFBZ0IsUUFBUSxHQUFHO0FBQzVDO0FBRUEsU0FBUyxZQUFZLElBQWEsT0FBK0I7QUFDaEUsU0FBTyxRQUFRLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxLQUFLLEtBQUssTUFBTSxHQUFHLGFBQWEsS0FBSyxLQUFLLENBQUM7QUFDNUU7QUFFQSxTQUFTLGdCQUNSLFdBQ0EsT0FDQSxPQUNBLFVBQ0M7QUFDRCxRQUFNLFVBQVUsVUFBVSxVQUFVLEVBQUUsS0FBSyxXQUFXLENBQUM7QUFDdkQsVUFBUSxTQUFTLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6QyxRQUFNLFFBQVEsUUFBUSxTQUFTLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUN4RCxRQUFNLFFBQVE7QUFDZCxRQUFNLGlCQUFpQixTQUFTLENBQUMsUUFBUSxTQUFVLElBQUksT0FBNEIsS0FBSyxDQUFDO0FBQzFGO0FBRUEsU0FBUyxvQkFDUixXQUNBLE9BQ0EsT0FDQSxVQUNDO0FBQ0QsUUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUssV0FBVyxDQUFDO0FBQ3ZELFVBQVEsU0FBUyxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDekMsUUFBTSxRQUFRLFFBQVEsU0FBUyxTQUFTLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNsRSxRQUFNLFFBQVE7QUFDZCxRQUFNLGlCQUFpQixTQUFTLENBQUMsUUFBUSxTQUFVLElBQUksT0FBNEIsS0FBSyxDQUFDO0FBQzFGO0FBRUEsU0FBUyxlQUNSLFdBQ0EsT0FDQSxPQUNBLFVBQ0M7QUFDRCxRQUFNLFVBQVUsVUFBVSxVQUFVLEVBQUUsS0FBSyxXQUFXLENBQUM7QUFDdkQsVUFBUSxTQUFTLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6QyxRQUFNLFdBQVcsUUFBUSxTQUFTLFVBQVU7QUFDNUMsV0FBUyxRQUFRO0FBQ2pCLFdBQVMsaUJBQWlCLFNBQVMsQ0FBQyxRQUFRLFNBQVUsSUFBSSxPQUErQixLQUFLLENBQUM7QUFDaEc7IiwKICAibmFtZXMiOiBbImNvbnRhaW5lciIsICJ0b2RheSJdCn0K
