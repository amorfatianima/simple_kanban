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
    const openCards = filteredColumns.reduce(
      (sum, col) => sum + col.cards.filter((c) => !c.completed).length,
      0
    );
    const header = body.createDiv({ cls: "sk-header" });
    header.createEl("h2", { text: `\u4FA7\u8FB9\u770B\u677F\uFF08${openCards}/${totalCards}\uFF09` });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgSXRlbVZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgV29ya3NwYWNlTGVhZiwgYWRkSWNvbiB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5jb25zdCBWSUVXX1RZUEUgPSBcInNpbXBsZS1rYW5iYW4tc2lkZWJhci12aWV3XCI7XG5jb25zdCBJQ09OX0lEID0gXCJzaW1wbGUta2FuYmFuLWVtb2ppXCI7XG5cbmludGVyZmFjZSBLYW5iYW5IaXN0b3J5RW50cnkge1xuXHR0aW1lc3RhbXA6IG51bWJlcjtcblx0cmVtYXJrOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBLYW5iYW5DYXJkIHtcblx0aWQ6IHN0cmluZztcblx0dGl0bGU6IHN0cmluZztcblx0dGFnczogc3RyaW5nW107XG5cdHJlbWFyazogc3RyaW5nO1xuXHRkZWFkbGluZT86IG51bWJlciB8IG51bGw7XG5cdGNvbXBsZXRlZDogYm9vbGVhbjtcblx0Y29tcGxldGVkQXQ/OiBudW1iZXIgfCBudWxsO1xuXHRjcmVhdGVkQXQ6IG51bWJlcjtcblx0dXBkYXRlZEF0OiBudW1iZXI7XG5cdGhpc3Rvcnk6IEthbmJhbkhpc3RvcnlFbnRyeVtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQ29sdW1uIHtcblx0aWQ6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRjYXJkczogS2FuYmFuQ2FyZFtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQm9hcmREYXRhIHtcblx0Y29sdW1uczogS2FuYmFuQ29sdW1uW107XG59XG5cbmludGVyZmFjZSBEYWlseUNvdW50UG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdHZhbHVlOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVN0YXRzUG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdGNyZWF0ZWQ6IG51bWJlcjtcblx0Y29tcGxldGVkOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVJhdGVQb2ludCB7XG5cdGRhdGU6IHN0cmluZztcblx0cmF0ZTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgU3RhdHNTbmFwc2hvdCB7XG5cdHRvdGFsVGFza3M6IG51bWJlcjtcblx0Y29tcGxldGVkVGFza3M6IG51bWJlcjtcblx0d2lwQ291bnQ6IG51bWJlcjtcblx0Y29tcGxldGlvblJhdGU6IG51bWJlcjtcblx0ZGVhZGxpbmVDb3VudDogbnVtYmVyO1xuXHRkZWFkbGluZUNvdmVyYWdlOiBudW1iZXI7XG5cdG92ZXJkdWVDb3VudDogbnVtYmVyO1xuXHRvdmVyZHVlUmF0ZTogbnVtYmVyO1xuXHRvblRpbWVSYXRlOiBudW1iZXI7XG5cdGF2Z0N5Y2xlVGltZU1zOiBudW1iZXIgfCBudWxsO1xuXHRkYWlseVNlcmllczogRGFpbHlTdGF0c1BvaW50W107XG5cdGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W107XG59XG5cbnR5cGUgU3RhdHNSYW5nZSA9XG5cdHwgeyB0eXBlOiBcInByZXNldFwiOyBkYXlzOiBudW1iZXIgfVxuXHR8IHsgdHlwZTogXCJjdXN0b21cIjsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfTtcblxudHlwZSBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiIHwgXCJ5ZXN0ZXJkYXlcIiB8IFwiY3VzdG9tXCI7XG5cbmludGVyZmFjZSBUaW1lbGluZUVudHJ5IHtcblx0Y2FyZElkOiBzdHJpbmc7XG5cdGNhcmRUaXRsZTogc3RyaW5nO1xuXHRjb2x1bW5OYW1lOiBzdHJpbmc7XG5cdHRpbWVzdGFtcDogbnVtYmVyO1xuXHR0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IERFRkFVTFRfQ09MVU1OUyA9IFtcIlx1NUY4NVx1NTkwNFx1NzQwNlwiLCBcIlx1OEZEQlx1ODg0Q1x1NEUyRFwiLCBcIlx1NURGMlx1NUI4Q1x1NjIxMFwiXTtcbnR5cGUgTnVsbGFibGVUaW1lb3V0ID0gbnVtYmVyIHwgbnVsbDtcblxuZnVuY3Rpb24gY3JlYXRlRGVmYXVsdEJvYXJkKCk6IEthbmJhbkJvYXJkRGF0YSB7XG5cdHJldHVybiB7XG5cdFx0Y29sdW1uczogREVGQVVMVF9DT0xVTU5TLm1hcCgobmFtZSkgPT4gKHtcblx0XHRcdGlkOiBjcmVhdGVJZCgpLFxuXHRcdFx0bmFtZSxcblx0XHRcdGNhcmRzOiBbXSxcblx0XHR9KSksXG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZUthbmJhblBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG5cdHByaXZhdGUgYm9hcmQ6IEthbmJhbkJvYXJkRGF0YSA9IGNyZWF0ZURlZmF1bHRCb2FyZCgpO1xuXHRwcml2YXRlIHZpZXdzID0gbmV3IFNldDxLYW5iYW5WaWV3PigpO1xuXHRwcml2YXRlIGxhc3RDb2x1bW5JZD86IHN0cmluZztcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkQm9hcmQoKTtcblxuXHRcdGFkZEljb24oXG5cdFx0XHRJQ09OX0lELFxuXHRcdFx0YDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj48dGV4dCB4PVwiMTJcIiB5PVwiMjBcIiBmb250LXNpemU9XCIyMFwiIHRleHQtYW5jaG9yPVwibWlkZGxlXCI+XHVEODNEXHVEQzJGPC90ZXh0Pjwvc3ZnPmAsXG5cdFx0KTtcblxuXHRcdHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRSwgKGxlYWYpID0+IHtcblx0XHRcdGNvbnN0IHZpZXcgPSBuZXcgS2FuYmFuVmlldyhsZWFmLCB0aGlzKTtcblx0XHRcdHRoaXMucmVnaXN0ZXJLYW5iYW5WaWV3KHZpZXcpO1xuXHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZFJpYmJvbkljb24oSUNPTl9JRCwgXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIiwgKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcInNpbXBsZS1rYW5iYW4tb3BlblwiLFxuXHRcdFx0bmFtZTogXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIixcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuXHRcdH0pO1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogXCJzaW1wbGUta2FuYmFuLWFkZC1jYXJkXCIsXG5cdFx0XHRuYW1lOiBcIlx1NkRGQlx1NTJBMFx1NTM2MVx1NzI0N1wiLFxuXHRcdFx0aG90a2V5czogW3sgbW9kaWZpZXJzOiBbXCJNb2RcIiwgXCJTaGlmdFwiXSwga2V5OiBcIk5cIiB9XSxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLm9wZW5RdWlja0FkZENhcmQoKSxcblx0XHR9KTtcblxuXHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCkpO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0dGhpcy52aWV3cy5jbGVhcigpO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkQm9hcmQoKSB7XG5cdFx0Y29uc3Qgc3RvcmVkID0gYXdhaXQgdGhpcy5sb2FkRGF0YSgpO1xuXHRcdGlmIChzdG9yZWQgJiYgc3RvcmVkLmNvbHVtbnMpIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBzdG9yZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYm9hcmQgPSBjcmVhdGVEZWZhdWx0Qm9hcmQoKTtcblx0XHR9XG5cdFx0dGhpcy5ub3JtYWxpemVCb2FyZCgpO1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gdGhpcy5ib2FyZC5jb2x1bW5zWzBdPy5pZDtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcGVyc2lzdCgpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuYm9hcmQpO1xuXHRcdHRoaXMubm90aWZ5Vmlld3MoKTtcblx0fVxuXG5cdHJlZ2lzdGVyS2FuYmFuVmlldyh2aWV3OiBLYW5iYW5WaWV3KSB7XG5cdFx0dGhpcy52aWV3cy5hZGQodmlldyk7XG5cdFx0dmlldy5yZWdpc3RlcigoKSA9PiB0aGlzLnZpZXdzLmRlbGV0ZSh2aWV3KSk7XG5cdH1cblxuXHRub3RpZnlWaWV3cygpIHtcblx0XHR0aGlzLnZpZXdzLmZvckVhY2goKHZpZXcpID0+IHZpZXcucmVuZGVyKCkpO1xuXHR9XG5cblx0Z2V0Qm9hcmQoKTogS2FuYmFuQm9hcmREYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5ib2FyZDtcblx0fVxuXG5cdGFzeW5jIGFkZENvbHVtbihuYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIW5hbWUudHJpbSgpKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBjb2x1bW4gPSB7IGlkOiBjcmVhdGVJZCgpLCBuYW1lOiBuYW1lLnRyaW0oKSwgY2FyZHM6IFtdIGFzIEthbmJhbkNhcmRbXSB9O1xuXHRcdHRoaXMuYm9hcmQuY29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0aWYgKCF0aGlzLmxhc3RDb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSBjb2x1bW4uaWQ7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgcmVtb3ZlQ29sdW1uKGNvbHVtbklkOiBzdHJpbmcpIHtcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuYm9hcmQuY29sdW1ucy5maW5kSW5kZXgoKGNvbCkgPT4gY29sLmlkID09PSBjb2x1bW5JZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjcyQVx1NjI3RVx1NTIzMFx1NjMwN1x1NUI5QVx1NjgwRlx1NzZFRVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5ib2FyZC5jb2x1bW5zLnNwbGljZShpbmRleCwgMSk7XG5cdFx0aWYgKHRoaXMubGFzdENvbHVtbklkID09PSBjb2x1bW5JZCkge1xuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSB0aGlzLmJvYXJkLmNvbHVtbnNbMF0/LmlkO1xuXHRcdH1cblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIHJlbmFtZUNvbHVtbihjb2x1bW5JZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3QgbmV4dE5hbWUgPSBuYW1lLnRyaW0oKTtcblx0XHRpZiAoIW5leHROYW1lKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb2x1bW4ubmFtZSA9IG5leHROYW1lO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgYWRkQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHBheWxvYWQ6IHtcblx0XHRcdHRpdGxlOiBzdHJpbmc7XG5cdFx0XHR0YWdzOiBzdHJpbmdbXTtcblx0XHRcdHJlbWFyazogc3RyaW5nO1xuXHRcdFx0aGlzdG9yeU5vdGU6IHN0cmluZztcblx0XHRcdGRlYWRsaW5lPzogbnVtYmVyIHwgbnVsbDtcblx0XHR9LFxuXHQpIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRjb25zdCBjYXJkOiBLYW5iYW5DYXJkID0ge1xuXHRcdFx0aWQ6IGNyZWF0ZUlkKCksXG5cdFx0XHR0aXRsZTogcGF5bG9hZC50aXRsZS50cmltKCksXG5cdFx0XHR0YWdzOiBwYXlsb2FkLnRhZ3MsXG5cdFx0XHRyZW1hcms6IHBheWxvYWQucmVtYXJrLFxuXHRcdFx0ZGVhZGxpbmU6IHBheWxvYWQuZGVhZGxpbmUgPz8gbnVsbCxcblx0XHRcdGNvbXBsZXRlZDogZmFsc2UsXG5cdFx0XHRjb21wbGV0ZWRBdDogbnVsbCxcblx0XHRcdGNyZWF0ZWRBdDogbm93LFxuXHRcdFx0dXBkYXRlZEF0OiBub3csXG5cdFx0XHRoaXN0b3J5OiBbXSxcblx0XHR9O1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBwYXlsb2FkLmhpc3RvcnlOb3RlIHx8IFwiXHU1MjFCXHU1RUZBXCIpO1xuXHRcdGNvbHVtbi5jYXJkcy51bnNoaWZ0KGNhcmQpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdXBkYXRlQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdHVwZGF0ZXM6IFBhcnRpYWw8UGljazxLYW5iYW5DYXJkLCBcInRpdGxlXCIgfCBcInRhZ3NcIiB8IFwicmVtYXJrXCIgfCBcImRlYWRsaW5lXCI+Pixcblx0XHRoaXN0b3J5Tm90ZT86IHN0cmluZyxcblx0KSB7XG5cdFx0Y29uc3QgY2FyZCA9IHRoaXMuZ2V0Q2FyZChjb2x1bW5JZCwgY2FyZElkKTtcblx0XHRpZiAoIWNhcmQpIHJldHVybjtcblx0XHRpZiAodXBkYXRlcy50aXRsZSAhPT0gdW5kZWZpbmVkKSBjYXJkLnRpdGxlID0gdXBkYXRlcy50aXRsZS50cmltKCk7XG5cdFx0aWYgKHVwZGF0ZXMudGFncyAhPT0gdW5kZWZpbmVkKSBjYXJkLnRhZ3MgPSB1cGRhdGVzLnRhZ3M7XG5cdFx0aWYgKHVwZGF0ZXMucmVtYXJrICE9PSB1bmRlZmluZWQpIGNhcmQucmVtYXJrID0gdXBkYXRlcy5yZW1hcms7XG5cdFx0aWYgKHVwZGF0ZXMuZGVhZGxpbmUgIT09IHVuZGVmaW5lZCkgY2FyZC5kZWFkbGluZSA9IHVwZGF0ZXMuZGVhZGxpbmU7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBoaXN0b3J5Tm90ZSB8fCBcIlx1NTE4NVx1NUJCOVx1NjZGNFx1NjVCMFwiKTtcblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdGFzeW5jIG1vdmVDYXJkKFxuXHRcdGNhcmRJZDogc3RyaW5nLFxuXHRcdGZyb21Db2x1bW5JZDogc3RyaW5nLFxuXHRcdHRvQ29sdW1uSWQ6IHN0cmluZyxcblx0XHRiZWZvcmVDYXJkSWQ/OiBzdHJpbmcsXG5cdCkge1xuXHRcdGNvbnN0IGZyb21Db2x1bW4gPSB0aGlzLmdldENvbHVtbihmcm9tQ29sdW1uSWQpO1xuXHRcdGNvbnN0IHRvQ29sdW1uID0gdGhpcy5nZXRDb2x1bW4odG9Db2x1bW5JZCk7XG5cdFx0Y29uc3QgaW5kZXggPSBmcm9tQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gY2FyZElkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG5cdFx0Y29uc3QgW2NhcmRdID0gZnJvbUNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGxldCB0YXJnZXRJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmxlbmd0aDtcblx0XHRpZiAoYmVmb3JlQ2FyZElkKSB7XG5cdFx0XHRjb25zdCBiZWZvcmVJbmRleCA9IHRvQ29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gYmVmb3JlQ2FyZElkKTtcblx0XHRcdHRhcmdldEluZGV4ID0gYmVmb3JlSW5kZXggPT09IC0xID8gdG9Db2x1bW4uY2FyZHMubGVuZ3RoIDogYmVmb3JlSW5kZXg7XG5cdFx0fVxuXHRcdHRvQ29sdW1uLmNhcmRzLnNwbGljZSh0YXJnZXRJbmRleCwgMCwgY2FyZCk7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdGlmIChmcm9tQ29sdW1uSWQgIT09IHRvQ29sdW1uSWQpIHtcblx0XHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBgXHU3OUZCXHU1MkE4XHU1MjMwXHUzMDBDJHt0b0NvbHVtbi5uYW1lfVx1MzAwRGApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlY29yZEhpc3RvcnkoY2FyZCwgXCJcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEZcIik7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgdG9nZ2xlQ2FyZENvbXBsZXRpb24oY29sdW1uSWQ6IHN0cmluZywgY2FyZElkOiBzdHJpbmcsIGNvbXBsZXRlZDogYm9vbGVhbikge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBpbmRleCA9IGNvbHVtbi5jYXJkcy5maW5kSW5kZXgoKGMpID0+IGMuaWQgPT09IGNhcmRJZCk7XG5cdFx0aWYgKGluZGV4ID09PSAtMSkgcmV0dXJuO1xuXHRcdGNvbnN0IFtjYXJkXSA9IGNvbHVtbi5jYXJkcy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdGNhcmQuY29tcGxldGVkID0gY29tcGxldGVkO1xuXHRcdGNhcmQuY29tcGxldGVkQXQgPSBjb21wbGV0ZWQgPyBEYXRlLm5vdygpIDogbnVsbDtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGNvbXBsZXRlZCA/IFwiXHU2ODA3XHU4QkIwXHU1QjhDXHU2MjEwXCIgOiBcIlx1NTNENlx1NkQ4OFx1NUI4Q1x1NjIxMFwiKTtcblx0XHRjb25zdCBpbnNlcnRJbmRleCA9IGNvbXBsZXRlZCA/IGNvbHVtbi5jYXJkcy5sZW5ndGggOiBNYXRoLm1pbihpbmRleCwgY29sdW1uLmNhcmRzLmxlbmd0aCk7XG5cdFx0Y29sdW1uLmNhcmRzLnNwbGljZShpbnNlcnRJbmRleCwgMCwgY2FyZCk7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRwcml2YXRlIGdldENvbHVtbihjb2x1bW5JZDogc3RyaW5nKTogS2FuYmFuQ29sdW1uIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmJvYXJkLmNvbHVtbnMuZmluZCgoY29sKSA9PiBjb2wuaWQgPT09IGNvbHVtbklkKTtcblx0XHRpZiAoIWNvbHVtbikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiXHU2NzJBXHU2MjdFXHU1MjMwXHU2MzA3XHU1QjlBXHU3Njg0XHU2ODBGXHU3NkVFXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRDYXJkKGNvbHVtbklkOiBzdHJpbmcsIGNhcmRJZDogc3RyaW5nKTogS2FuYmFuQ2FyZCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oY29sdW1uSWQpO1xuXHRcdHJldHVybiBjb2x1bW4uY2FyZHMuZmluZCgoY2FyZCkgPT4gY2FyZC5pZCA9PT0gY2FyZElkKTtcblx0fVxuXG5cdHByaXZhdGUgcmVjb3JkSGlzdG9yeShjYXJkOiBLYW5iYW5DYXJkLCByZW1hcms6IHN0cmluZykge1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpKSB7XG5cdFx0XHRjYXJkLmhpc3RvcnkgPSBbXTtcblx0XHR9XG5cdFx0Y2FyZC5oaXN0b3J5LnVuc2hpZnQoe1xuXHRcdFx0dGltZXN0YW1wOiBEYXRlLm5vdygpLFxuXHRcdFx0cmVtYXJrOiByZW1hcmsgfHwgXCJcdTY2RjRcdTY1QjBcIixcblx0XHR9KTtcblx0XHRjYXJkLmhpc3RvcnkgPSBjYXJkLmhpc3Rvcnkuc2xpY2UoMCwgNTApO1xuXHR9XG5cblx0cHJpdmF0ZSBub3JtYWxpemVCb2FyZCgpIHtcblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLmJvYXJkLmNvbHVtbnMpIHtcblx0XHRcdGNvbHVtbi5jYXJkcyA9IGNvbHVtbi5jYXJkcy5tYXAoKGNhcmQpID0+ICh7XG5cdFx0XHRcdC4uLmNhcmQsXG5cdFx0XHRcdGRlYWRsaW5lOiBjYXJkLmRlYWRsaW5lID8/IG51bGwsXG5cdFx0XHRcdGNvbXBsZXRlZEF0OiBjYXJkLmNvbXBsZXRlZEF0ID8/IG51bGwsXG5cdFx0XHR9KSk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgYWN0aXZhdGVWaWV3KCkge1xuXHRcdGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFKTtcblx0XHRpZiAobGVhdmVzLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYXZlc1swXSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHJpZ2h0TGVhZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRSaWdodExlYWYoZmFsc2UpO1xuXHRcdGF3YWl0IHJpZ2h0TGVhZj8uc2V0Vmlld1N0YXRlKHsgdHlwZTogVklFV19UWVBFLCBhY3RpdmU6IHRydWUgfSk7XG5cdFx0aWYgKHJpZ2h0TGVhZikge1xuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYocmlnaHRMZWFmKTtcblx0XHR9XG5cdH1cblxuXHRzZXRBY3RpdmVDb2x1bW4oY29sdW1uSWQ6IHN0cmluZykge1xuXHRcdHRoaXMubGFzdENvbHVtbklkID0gY29sdW1uSWQ7XG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVDb2x1bW5Gb3JRdWlja0FkZCgpOiBLYW5iYW5Db2x1bW4gfCB1bmRlZmluZWQge1xuXHRcdGlmICghdGhpcy5ib2FyZC5jb2x1bW5zLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRjb25zdCBwcmVmZXJyZWQgPVxuXHRcdFx0dGhpcy5sYXN0Q29sdW1uSWQgJiYgdGhpcy5ib2FyZC5jb2x1bW5zLmZpbmQoKGNvbCkgPT4gY29sLmlkID09PSB0aGlzLmxhc3RDb2x1bW5JZCk7XG5cdFx0cmV0dXJuIHByZWZlcnJlZCA/PyB0aGlzLmJvYXJkLmNvbHVtbnNbMF07XG5cdH1cblxuXHRvcGVuUXVpY2tBZGRDYXJkKCkge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMucmVzb2x2ZUNvbHVtbkZvclF1aWNrQWRkKCk7XG5cdFx0aWYgKCFjb2x1bW4pIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdThCRjdcdTUxNDhcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcywgY29sdW1uLmlkKS5vcGVuKCk7XG5cdH1cbn1cblxuY2xhc3MgS2FuYmFuVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcblx0cHJpdmF0ZSBkcmFnU3RhdGU/OiB7IGNvbHVtbklkOiBzdHJpbmc7IGNhcmRJZDogc3RyaW5nOyBjYXJkSGVpZ2h0OiBudW1iZXIgfTtcblx0cHJpdmF0ZSBwbGFjZWhvbGRlckVsPzogSFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgcGxhY2Vob2xkZXJTdGF0ZT86IHsgY29sdW1uSWQ6IHN0cmluZzsgYmVmb3JlSWQ/OiBzdHJpbmcgfTtcblx0cHJpdmF0ZSBkZWFkbGluZUZpbHRlcnMgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcblx0cHJpdmF0ZSBhY3RpdmVUYWI6IFwiYm9hcmRcIiB8IFwic3RhdHNcIiB8IFwidGltZWxpbmVcIiA9IFwiYm9hcmRcIjtcblx0cHJpdmF0ZSBzdGF0c1JhbmdlOiBTdGF0c1JhbmdlID0geyB0eXBlOiBcInByZXNldFwiLCBkYXlzOiAxNCB9O1xuXHRwcml2YXRlIHRpbWVsaW5lUHJlc2V0OiBUaW1lbGluZVJhbmdlUHJlc2V0ID0gXCJ0b2RheVwiO1xuXHRwcml2YXRlIHRpbWVsaW5lQ3VzdG9tPzogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9O1xuXHRwcml2YXRlIGxhc3RTY3JvbGxUb3AgPSAwO1xuXHRwcml2YXRlIHNjcm9sbFRhcmdldD86IEhUTUxFbGVtZW50O1xuXHRwcml2YXRlIG91dGVyU2Nyb2xsVGFyZ2V0PzogSFRNTEVsZW1lbnQ7XG5cdHByaXZhdGUgY29sdW1uU2Nyb2xsID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblx0cHJpdmF0ZSBib2FyZFNlYXJjaCA9IFwiXCI7XG5cdHByaXZhdGUgdGltZWxpbmVTZWFyY2ggPSBcIlwiO1xuXHRwcml2YXRlIGxhc3RGb2N1c2VkU2VhcmNoVGFiOiBcImJvYXJkXCIgfCBcInRpbWVsaW5lXCIgfCBudWxsID0gbnVsbDtcblx0cHJpdmF0ZSBsYXN0U2VhcmNoU2VsZWN0aW9uPzogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9O1xuXHRwcml2YXRlIGlzQm9hcmRDb21wb3NpbmcgPSBmYWxzZTtcblx0cHJpdmF0ZSBpc1RpbWVsaW5lQ29tcG9zaW5nID0gZmFsc2U7XG5cdHByaXZhdGUgc2Nyb2xsSGFuZGxlciA9IChldnQ6IEV2ZW50KSA9PiB7XG5cdFx0Y29uc3QgdGFyZ2V0ID0gKGV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpID8/IHRoaXMuc2Nyb2xsVGFyZ2V0ID8/IHRoaXMuY29udGVudEVsO1xuXHRcdHRoaXMubGFzdFNjcm9sbFRvcCA9IHRhcmdldC5zY3JvbGxUb3A7XG5cdH07XG5cblx0Y29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgcHJpdmF0ZSBwbHVnaW46IFNpbXBsZUthbmJhblBsdWdpbikge1xuXHRcdHN1cGVyKGxlYWYpO1xuXHR9XG5cblx0Z2V0Vmlld1R5cGUoKSB7XG5cdFx0cmV0dXJuIFZJRVdfVFlQRTtcblx0fVxuXG5cdGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIFwiXHU1M0YzXHU0RkE3XHU3NzBCXHU2NzdGXCI7XG5cdH1cblxuXHRnZXRJY29uKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIElDT05fSUQ7XG5cdH1cblxuXHRhc3luYyBvbk9wZW4oKSB7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxuXG5cdGFzeW5jIG9uQ2xvc2UoKSB7XG5cdFx0dGhpcy5kcmFnU3RhdGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy50ZWFyZG93blNjcm9sbFRhcmdldCgpO1xuXHRcdHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgY29udGFpbmVyID0gdGhpcy5jb250ZW50RWw7XG5cdFx0Y29uc3Qgb3V0ZXIgPSB0aGlzLmZpbmRTY3JvbGxQYXJlbnQoY29udGFpbmVyKTtcblx0XHRjb25zdCBjdXJyZW50U2Nyb2xsID0gdGhpcy5zY3JvbGxUYXJnZXQ/LnNjcm9sbFRvcCA/PyBjb250YWluZXIuc2Nyb2xsVG9wO1xuXHRcdGNvbnN0IG91dGVyU2Nyb2xsID0gb3V0ZXI/LnNjcm9sbFRvcCA/PyAwO1xuXHRcdHRoaXMubGFzdFNjcm9sbFRvcCA9IGN1cnJlbnRTY3JvbGw7XG5cdFx0Y29uc3QgbGFzdE91dGVyID0gb3V0ZXJTY3JvbGw7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTY3JvbGxdIGJlZm9yZSByZW5kZXJcIiwge1xuXHRcdFx0dGFiOiB0aGlzLmFjdGl2ZVRhYixcblx0XHRcdHNhdmVkOiB0aGlzLmxhc3RTY3JvbGxUb3AsXG5cdFx0XHRjdXJyZW50OiBjdXJyZW50U2Nyb2xsLFxuXHRcdFx0b3V0ZXI6IGxhc3RPdXRlcixcblx0XHR9KTtcblx0XHQvLyBQcmVzZXJ2ZSBzY3JvbGwgb24gY29sdW1uIGxpc3RzIGJlZm9yZSB3ZSBjbGVhciBET00uXG5cdFx0dGhpcy5jYXB0dXJlQ29sdW1uU2Nyb2xsKCk7XG5cdFx0Y29udGFpbmVyLmVtcHR5KCk7XG5cdFx0Y29udGFpbmVyLmFkZENsYXNzKFwic2sta2FuYmFuXCIpO1xuXG5cdFx0Y29uc3QgdGFicyA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFic1wiIH0pO1xuXHRcdHRoaXMucmVuZGVyVGFiQnV0dG9uKHRhYnMsIFwiYm9hcmRcIiwgXCJcdTRFRkJcdTUyQTFcdTc3MEJcdTY3N0ZcIik7XG5cdFx0dGhpcy5yZW5kZXJUYWJCdXR0b24odGFicywgXCJzdGF0c1wiLCBcIlx1NjU0OFx1NzM4N1x1N0VERlx1OEJBMVwiKTtcblx0XHR0aGlzLnJlbmRlclRhYkJ1dHRvbih0YWJzLCBcInRpbWVsaW5lXCIsIFwiXHU2NUY2XHU5NUY0XHU4Rjc0XCIpO1xuXG5cdFx0Y29uc3QgYm9keSA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFiLXBhbmVsXCIgfSk7XG5cdFx0aWYgKHRoaXMuYWN0aXZlVGFiID09PSBcImJvYXJkXCIpIHtcblx0XHRcdHRoaXMucmVuZGVyQm9hcmQoYm9keSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gXCJzdGF0c1wiKSB7XG5cdFx0XHR0aGlzLnJlbmRlclN0YXRzKGJvZHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlbmRlclRpbWVsaW5lKGJvZHkpO1xuXHRcdH1cblx0XHR0aGlzLnNldHVwU2Nyb2xsVGFyZ2V0KGJvZHkpO1xuXHRcdHRoaXMucmVzdG9yZU91dGVyU2Nyb2xsKG91dGVyU2Nyb2xsLCBvdXRlcik7XG5cdFx0Ly8gUmVzdG9yZSBwZXItY29sdW1uIHNjcm9sbCBwb3NpdGlvbnMgYWZ0ZXIgbmV3IERPTSBpcyByZWFkeS5cblx0XHR0aGlzLnJlc3RvcmVDb2x1bW5TY3JvbGwoKTtcblx0fVxuXG5cdHByaXZhdGUgc2V0dXBTY3JvbGxUYXJnZXQoZWw6IEhUTUxFbGVtZW50KSB7XG5cdFx0dGhpcy50ZWFyZG93blNjcm9sbFRhcmdldCgpO1xuXHRcdHRoaXMuc2Nyb2xsVGFyZ2V0ID0gZWw7XG5cdFx0dGhpcy5zY3JvbGxUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLnNjcm9sbEhhbmRsZXIsIHsgcGFzc2l2ZTogdHJ1ZSB9KTtcblx0XHRjb25zdCB0YXJnZXRTY3JvbGwgPSB0aGlzLmxhc3RTY3JvbGxUb3A7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTY3JvbGxdIHNldHVwXCIsIHtcblx0XHRcdHRhYjogdGhpcy5hY3RpdmVUYWIsXG5cdFx0XHR0YXJnZXRTY3JvbGwsXG5cdFx0XHR0YXJnZXRIZWlnaHQ6IHRoaXMuc2Nyb2xsVGFyZ2V0LnNjcm9sbEhlaWdodCxcblx0XHRcdHRhcmdldENsaWVudDogdGhpcy5zY3JvbGxUYXJnZXQuY2xpZW50SGVpZ2h0LFxuXHRcdH0pO1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5zY3JvbGxUYXJnZXQpIHtcblx0XHRcdFx0dGhpcy5zY3JvbGxUYXJnZXQuc2Nyb2xsVG9wID0gdGFyZ2V0U2Nyb2xsO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1Njcm9sbF0gYWZ0ZXIgcmVuZGVyXCIsIHtcblx0XHRcdFx0XHR0YWI6IHRoaXMuYWN0aXZlVGFiLFxuXHRcdFx0XHRcdHJlc3RvcmVkOiB0YXJnZXRTY3JvbGwsXG5cdFx0XHRcdFx0YWN0dWFsOiB0aGlzLnNjcm9sbFRhcmdldC5zY3JvbGxUb3AsXG5cdFx0XHRcdFx0dGFyZ2V0SGVpZ2h0OiB0aGlzLnNjcm9sbFRhcmdldC5zY3JvbGxIZWlnaHQsXG5cdFx0XHRcdFx0dGFyZ2V0Q2xpZW50OiB0aGlzLnNjcm9sbFRhcmdldC5jbGllbnRIZWlnaHQsXG5cdFx0XHRcdFx0b3V0ZXI6IHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQ/LnNjcm9sbFRvcCA/PyAwLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgdGVhcmRvd25TY3JvbGxUYXJnZXQoKSB7XG5cdFx0aWYgKHRoaXMuc2Nyb2xsVGFyZ2V0KSB7XG5cdFx0XHR0aGlzLnNjcm9sbFRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuc2Nyb2xsSGFuZGxlcik7XG5cdFx0fVxuXHRcdHRoaXMuc2Nyb2xsVGFyZ2V0ID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSByZXN0b3JlT3V0ZXJTY3JvbGwodmFsdWU6IG51bWJlciwgdGFyZ2V0PzogSFRNTEVsZW1lbnQpIHtcblx0XHRpZiAoIXRhcmdldCkgcmV0dXJuO1xuXHRcdHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQgPSB0YXJnZXQ7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdGlmICh0aGlzLm91dGVyU2Nyb2xsVGFyZ2V0KSB7XG5cdFx0XHRcdHRoaXMub3V0ZXJTY3JvbGxUYXJnZXQuc2Nyb2xsVG9wID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGNhcHR1cmVDb2x1bW5TY3JvbGwoKSB7XG5cdFx0Y29uc3QgY29udGFpbmVycyA9IEFycmF5LmZyb20oXG5cdFx0XHR0aGlzLmNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcIi5zay1jYXJkc1tkYXRhLWNvbHVtbl1cIiksXG5cdFx0KTtcblx0XHRjb250YWluZXJzLmZvckVhY2goKGVsKSA9PiB7XG5cdFx0XHRjb25zdCBjb2x1bW5JZCA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtY29sdW1uXCIpO1xuXHRcdFx0aWYgKGNvbHVtbklkKSB7XG5cdFx0XHRcdHRoaXMuY29sdW1uU2Nyb2xsLnNldChjb2x1bW5JZCwgZWwuc2Nyb2xsVG9wKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVzdG9yZUNvbHVtblNjcm9sbCgpIHtcblx0XHRjb25zdCBjb250YWluZXJzID0gQXJyYXkuZnJvbShcblx0XHRcdHRoaXMuY29udGVudEVsLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFwiLnNrLWNhcmRzW2RhdGEtY29sdW1uXVwiKSxcblx0XHQpO1xuXHRcdGNvbnRhaW5lcnMuZm9yRWFjaCgoZWwpID0+IHtcblx0XHRcdGNvbnN0IGNvbHVtbklkID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2x1bW5cIik7XG5cdFx0XHRpZiAoIWNvbHVtbklkKSByZXR1cm47XG5cdFx0XHRjb25zdCB0YXJnZXQgPSB0aGlzLmNvbHVtblNjcm9sbC5nZXQoY29sdW1uSWQpID8/IDA7XG5cdFx0XHRlbC5zY3JvbGxUb3AgPSB0YXJnZXQ7XG5cdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRcInNjcm9sbFwiLFxuXHRcdFx0XHQoZXZ0KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgdGFyZ2V0RWwgPSBldnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHRcdHRoaXMuY29sdW1uU2Nyb2xsLnNldChjb2x1bW5JZCwgdGFyZ2V0RWwuc2Nyb2xsVG9wKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0eyBwYXNzaXZlOiB0cnVlIH0sXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBmaW5kU2Nyb2xsUGFyZW50KGVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG5cdFx0bGV0IG5vZGU6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGVsO1xuXHRcdHdoaWxlIChub2RlKSB7XG5cdFx0XHRpZiAobm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDQpIHtcblx0XHRcdFx0cmV0dXJuIG5vZGU7XG5cdFx0XHR9XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHByaXZhdGUgcmVzdG9yZVNlYXJjaEZvY3VzKHRhYjogXCJib2FyZFwiIHwgXCJ0aW1lbGluZVwiLCBpbnB1dDogSFRNTElucHV0RWxlbWVudCkge1xuXHRcdGlmICh0aGlzLmxhc3RGb2N1c2VkU2VhcmNoVGFiICE9PSB0YWIpIHJldHVybjtcblx0XHRjb25zdCBzZWxlY3Rpb24gPSB0aGlzLmxhc3RTZWFyY2hTZWxlY3Rpb247XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdGlucHV0LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcblx0XHRcdGlmIChzZWxlY3Rpb24pIHtcblx0XHRcdFx0aW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2Uoc2VsZWN0aW9uLnN0YXJ0LCBzZWxlY3Rpb24uZW5kKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVGFiQnV0dG9uKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHRhYjogXCJib2FyZFwiIHwgXCJzdGF0c1wiLCBsYWJlbDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYnV0dG9uID0gY29udGFpbmVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IGxhYmVsLFxuXHRcdFx0Y2xzOiBbXCJzay10YWJcIiwgdGhpcy5hY3RpdmVUYWIgPT09IHRhYiA/IFwic2stdGFiLWFjdGl2ZVwiIDogXCJcIl0uam9pbihcIiBcIikudHJpbSgpLFxuXHRcdH0pO1xuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuYWN0aXZlVGFiID09PSB0YWIpIHJldHVybjtcblx0XHRcdHRoaXMuYWN0aXZlVGFiID0gdGFiO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQm9hcmQoYm9keTogSFRNTEVsZW1lbnQpIHtcblx0XHRjb25zdCBib2FyZCA9IHRoaXMucGx1Z2luLmdldEJvYXJkKCk7XG5cdFx0Y29uc3Qgc2VhcmNoVmFsdWUgPSB0aGlzLmJvYXJkU2VhcmNoO1xuXHRcdGNvbnN0IGZpbHRlcmVkQ29sdW1ucyA9IGJvYXJkLmNvbHVtbnMubWFwKChjb2wpID0+ICh7XG5cdFx0XHQuLi5jb2wsXG5cdFx0XHRjYXJkczogdGhpcy5maWx0ZXJDYXJkcyhjb2wuY2FyZHMsIHNlYXJjaFZhbHVlKSxcblx0XHR9KSk7XG5cdFx0Y29uc3QgdG90YWxDYXJkcyA9IGZpbHRlcmVkQ29sdW1ucy5yZWR1Y2UoKHN1bSwgY29sKSA9PiBzdW0gKyBjb2wuY2FyZHMubGVuZ3RoLCAwKTtcblx0XHRjb25zdCBvcGVuQ2FyZHMgPSBmaWx0ZXJlZENvbHVtbnMucmVkdWNlKFxuXHRcdFx0KHN1bSwgY29sKSA9PiBzdW0gKyBjb2wuY2FyZHMuZmlsdGVyKChjKSA9PiAhYy5jb21wbGV0ZWQpLmxlbmd0aCxcblx0XHRcdDAsXG5cdFx0KTtcblxuXHRcdGNvbnN0IGhlYWRlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhlYWRlclwiIH0pO1xuXHRcdGhlYWRlci5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogYFx1NEZBN1x1OEZCOVx1NzcwQlx1Njc3Rlx1RkYwOCR7b3BlbkNhcmRzfS8ke3RvdGFsQ2FyZHN9XHVGRjA5YCB9KTtcblx0XHRjb25zdCBzZWFyY2hCb3ggPSBoZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXNlYXJjaFwiIH0pO1xuXHRcdGNvbnN0IHNlYXJjaElucHV0ID0gc2VhcmNoQm94LmNyZWF0ZUVsKFwiaW5wdXRcIiwge1xuXHRcdFx0dHlwZTogXCJzZWFyY2hcIixcblx0XHRcdHBsYWNlaG9sZGVyOiBcIlx1NjQxQ1x1N0QyMlx1NjgwN1x1OTg5OC9cdTU5MDdcdTZDRTgvXHU2ODA3XHU3QjdFL1x1NTM4Nlx1NTNGMlx1MjAyNlwiLFxuXHRcdFx0dmFsdWU6IHNlYXJjaFZhbHVlLFxuXHRcdH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0c2VhcmNoSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbXBvc2l0aW9uc3RhcnRcIiwgKCkgPT4ge1xuXHRcdFx0dGhpcy5pc0JvYXJkQ29tcG9zaW5nID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRzZWFyY2hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY29tcG9zaXRpb25lbmRcIiwgKCkgPT4ge1xuXHRcdFx0dGhpcy5pc0JvYXJkQ29tcG9zaW5nID0gZmFsc2U7XG5cdFx0XHR0aGlzLmJvYXJkU2VhcmNoID0gc2VhcmNoSW5wdXQudmFsdWU7XG5cdFx0XHR0aGlzLmxhc3RGb2N1c2VkU2VhcmNoVGFiID0gXCJib2FyZFwiO1xuXHRcdFx0dGhpcy5sYXN0U2VhcmNoU2VsZWN0aW9uID0ge1xuXHRcdFx0XHRzdGFydDogc2VhcmNoSW5wdXQuc2VsZWN0aW9uU3RhcnQgPz8gc2VhcmNoSW5wdXQudmFsdWUubGVuZ3RoLFxuXHRcdFx0XHRlbmQ6IHNlYXJjaElucHV0LnNlbGVjdGlvbkVuZCA/PyBzZWFyY2hJbnB1dC52YWx1ZS5sZW5ndGgsXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0XHRzZWFyY2hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuXHRcdFx0dGhpcy5ib2FyZFNlYXJjaCA9IHNlYXJjaElucHV0LnZhbHVlO1xuXHRcdFx0aWYgKHRoaXMuaXNCb2FyZENvbXBvc2luZykgcmV0dXJuO1xuXHRcdFx0dGhpcy5sYXN0Rm9jdXNlZFNlYXJjaFRhYiA9IFwiYm9hcmRcIjtcblx0XHRcdHRoaXMubGFzdFNlYXJjaFNlbGVjdGlvbiA9IHtcblx0XHRcdFx0c3RhcnQ6IHNlYXJjaElucHV0LnNlbGVjdGlvblN0YXJ0ID8/IHNlYXJjaElucHV0LnZhbHVlLmxlbmd0aCxcblx0XHRcdFx0ZW5kOiBzZWFyY2hJbnB1dC5zZWxlY3Rpb25FbmQgPz8gc2VhcmNoSW5wdXQudmFsdWUubGVuZ3RoLFxuXHRcdFx0fTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cdFx0dGhpcy5yZXN0b3JlU2VhcmNoRm9jdXMoXCJib2FyZFwiLCBzZWFyY2hJbnB1dCk7XG5cblx0XHRjb25zdCBhZGRDb2x1bW5CdG4gPSBoZWFkZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogXCJcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRhZGRDb2x1bW5CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDb2x1bW5Nb2RhbCh0aGlzLmFwcCwge1xuXHRcdFx0XHR0aXRsZTogXCJcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIixcblx0XHRcdFx0Y29uZmlybVRleHQ6IFwiXHU1MjFCXHU1RUZBXCIsXG5cdFx0XHRcdG9uU3VibWl0OiBhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5hZGRDb2x1bW4odmFsdWUpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY29sdW1uc1dyYXBwZXIgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW5zXCIgfSk7XG5cdFx0aWYgKCFib2FyZC5jb2x1bW5zLmxlbmd0aCkge1xuXHRcdFx0Y29sdW1uc1dyYXBwZXIuY3JlYXRlRGl2KHsgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTY4MEZcdTc2RUVcdUZGMENcdTcwQjlcdTUxRkJcdTIwMUNcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcdTIwMURcdTMwMDJcIiwgY2xzOiBcInNrLWVtcHR5XCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBjb2x1bW4gb2YgZmlsdGVyZWRDb2x1bW5zKSB7XG5cdFx0XHR0aGlzLnJlbmRlckNvbHVtbihjb2x1bW5zV3JhcHBlciwgY29sdW1uKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclN0YXRzKGJvZHk6IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3Qgc3RhdHMgPSB0aGlzLmJ1aWxkU3RhdHNTbmFwc2hvdCh0aGlzLnN0YXRzUmFuZ2UpO1xuXHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIFNuYXBzaG90XCIsIHtcblx0XHRcdHJhbmdlOiB0aGlzLnN0YXRzUmFuZ2UsXG5cdFx0XHRkYWlseVNlcmllczogc3RhdHMuZGFpbHlTZXJpZXMsXG5cdFx0XHRkYWlseVJhdGVzOiBzdGF0cy5kYWlseVJhdGVzLFxuXHRcdH0pO1xuXG5cdFx0Ym9keS5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdTY1NDhcdTczODdcdTdFREZcdThCQTFcIiwgY2xzOiBcInNrLXN0YXRzLXRpdGxlXCIgfSk7XG5cdFx0Y29uc3QgcmFuZ2VDb250cm9scyA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXJhbmdlLWNvbnRyb2xzXCIgfSk7XG5cdFx0cmFuZ2VDb250cm9scy5jcmVhdGVTcGFuKHsgdGV4dDogXCJcdTY1RjZcdTk1RjRcdTgzMDNcdTU2RjRcdUZGMUFcIiB9KTtcblx0XHRjb25zdCBzZWxlY3QgPSByYW5nZUNvbnRyb2xzLmNyZWF0ZUVsKFwic2VsZWN0XCIsIHsgY2xzOiBcInNrLXJhbmdlLXNlbGVjdFwiIH0pIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuXHRcdGNvbnN0IHByZXNldE9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7IFwiN1x1NTkyOVwiOiA3LCBcIjE0XHU1OTI5XCI6IDE0LCBcIjMwXHU1OTI5XCI6IDMwLCBcIjkwXHU1OTI5XCI6IDkwIH07XG5cdFx0T2JqZWN0LmVudHJpZXMocHJlc2V0T3B0aW9ucykuZm9yRWFjaCgoW2xhYmVsLCBkYXlzXSkgPT4ge1xuXHRcdFx0Y29uc3Qgb3B0aW9uID0gc2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdGV4dDogbGFiZWwsIHZhbHVlOiBkYXlzLnRvU3RyaW5nKCkgfSk7XG5cdFx0XHRpZiAodGhpcy5zdGF0c1JhbmdlLnR5cGUgPT09IFwicHJlc2V0XCIgJiYgdGhpcy5zdGF0c1JhbmdlLmRheXMgPT09IGRheXMpIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG5cdFx0fSk7XG5cdFx0Y29uc3QgY3VzdG9tT3B0aW9uID0gc2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdGV4dDogXCJcdTgxRUFcdTVCOUFcdTRFNDlcIiwgdmFsdWU6IFwiY3VzdG9tXCIgfSk7XG5cdFx0aWYgKHRoaXMuc3RhdHNSYW5nZS50eXBlID09PSBcImN1c3RvbVwiKSBjdXN0b21PcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuXG5cdFx0Y29uc3QgY3VzdG9tRmllbGRzID0gcmFuZ2VDb250cm9scy5jcmVhdGVEaXYoeyBjbHM6IFwic2stcmFuZ2UtY3VzdG9tXCIgfSk7XG5cdFx0Y29uc3Qgc3RhcnRJbnB1dCA9IGN1c3RvbUZpZWxkcy5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJkYXRlXCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjb25zdCBlbmRJbnB1dCA9IGN1c3RvbUZpZWxkcy5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJkYXRlXCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjb25zdCB1cGRhdGVDdXN0b21JbnB1dHMgPSAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5zdGF0c1JhbmdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIHtcblx0XHRcdFx0c3RhcnRJbnB1dC52YWx1ZSA9IGZvcm1hdERhdGVJbnB1dFZhbHVlKHRoaXMuc3RhdHNSYW5nZS5zdGFydCk7XG5cdFx0XHRcdGVuZElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy5zdGF0c1JhbmdlLmVuZCk7XG5cdFx0XHRcdGN1c3RvbUZpZWxkcy5hZGRDbGFzcyhcInNrLXJhbmdlLWN1c3RvbS12aXNpYmxlXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y3VzdG9tRmllbGRzLnJlbW92ZUNsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR1cGRhdGVDdXN0b21JbnB1dHMoKTtcblxuXHRcdHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcblx0XHRcdGlmIChzZWxlY3QudmFsdWUgPT09IFwiY3VzdG9tXCIpIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdGNvbnN0IGRlZmF1bHRTdGFydCA9IHRvZGF5IC0gMTMgKiAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdFx0XHR0aGlzLnN0YXRzUmFuZ2UgPSB7IHR5cGU6IFwiY3VzdG9tXCIsIHN0YXJ0OiBkZWZhdWx0U3RhcnQsIGVuZDogdG9kYXkgfTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc3RhdHNSYW5nZSA9IHsgdHlwZTogXCJwcmVzZXRcIiwgZGF5czogTnVtYmVyKHNlbGVjdC52YWx1ZSkgfTtcblx0XHRcdH1cblx0XHRcdHVwZGF0ZUN1c3RvbUlucHV0cygpO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGhhbmRsZUN1c3RvbUNoYW5nZSA9ICgpID0+IHtcblx0XHRcdGlmICh0aGlzLnN0YXRzUmFuZ2UudHlwZSAhPT0gXCJjdXN0b21cIikgcmV0dXJuO1xuXHRcdFx0Y29uc3Qgc3RhcnRUcyA9IHN0YXJ0SW5wdXQudmFsdWUgPyB0aGlzLnN0YXJ0T2ZEYXkobmV3IERhdGUoc3RhcnRJbnB1dC52YWx1ZSkuZ2V0VGltZSgpKSA6IG51bGw7XG5cdFx0XHRjb25zdCBlbmRUcyA9IGVuZElucHV0LnZhbHVlID8gdGhpcy5zdGFydE9mRGF5KG5ldyBEYXRlKGVuZElucHV0LnZhbHVlKS5nZXRUaW1lKCkpIDogbnVsbDtcblx0XHRcdGlmIChzdGFydFRzICYmIGVuZFRzICYmIHN0YXJ0VHMgPD0gZW5kVHMpIHtcblx0XHRcdFx0dGhpcy5zdGF0c1JhbmdlID0geyB0eXBlOiBcImN1c3RvbVwiLCBzdGFydDogc3RhcnRUcywgZW5kOiBlbmRUcyB9O1xuXHRcdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0c3RhcnRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGhhbmRsZUN1c3RvbUNoYW5nZSk7XG5cdFx0ZW5kSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBoYW5kbGVDdXN0b21DaGFuZ2UpO1xuXG5cdFx0Y29uc3QgZGFzaGJvYXJkID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtZGFzaGJvYXJkXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChkYXNoYm9hcmQsIFwiXHU2MDNCXHU0RUZCXHU1MkExXCIsIHN0YXRzLnRvdGFsVGFza3MudG9TdHJpbmcoKSwgXCJcdTdEMkZcdThCQTFcdTUyMUJcdTVFRkFcIik7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChcblx0XHRcdGRhc2hib2FyZCxcblx0XHRcdFwiXHU1QjhDXHU2MjEwXHU3Mzg3XCIsXG5cdFx0XHRmb3JtYXRQZXJjZW50KHN0YXRzLmNvbXBsZXRpb25SYXRlKSxcblx0XHRcdGBcdTVERjJcdTVCOENcdTYyMTAgJHtzdGF0cy5jb21wbGV0ZWRUYXNrc30vJHtzdGF0cy50b3RhbFRhc2tzIHx8IDF9YCxcblx0XHQpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoZGFzaGJvYXJkLCBcIlx1NUY1M1x1NTI0RFx1OEZEQlx1ODg0Q1x1NEUyRFwiLCBzdGF0cy53aXBDb3VudC50b1N0cmluZygpLCBcIlx1NEVDRFx1NjcyQVx1NUI4Q1x1NjIxMFwiKTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTkwM0VcdTY3MUZcdTczODdcIixcblx0XHRcdHN0YXRzLmRlYWRsaW5lQ291bnQgPyBmb3JtYXRQZXJjZW50KHN0YXRzLm92ZXJkdWVSYXRlKSA6IFwiXHUyMDE0XCIsXG5cdFx0XHRgJHtzdGF0cy5vdmVyZHVlQ291bnR9LyR7c3RhdHMuZGVhZGxpbmVDb3VudCB8fCAxfSBcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFgLFxuXHRcdCk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChcblx0XHRcdGRhc2hib2FyZCxcblx0XHRcdFwiXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwXHU3Mzg3XCIsXG5cdFx0XHRzdGF0cy5kZWFkbGluZUNvdW50ID8gZm9ybWF0UGVyY2VudChzdGF0cy5vblRpbWVSYXRlKSA6IFwiXHUyMDE0XCIsXG5cdFx0XHRcIlx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVx1NjMwOVx1NjVGNlx1NUI4Q1x1NjIxMFwiLFxuXHRcdCk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChcblx0XHRcdGRhc2hib2FyZCxcblx0XHRcdFwiXHU1RTczXHU1NzQ3XHU1QjhDXHU2MjEwXHU1NDY4XHU2NzFGXCIsXG5cdFx0XHRzdGF0cy5hdmdDeWNsZVRpbWVNcyA/IGZvcm1hdER1cmF0aW9uKHN0YXRzLmF2Z0N5Y2xlVGltZU1zKSA6IFwiXHUyMDE0XCIsXG5cdFx0XHRcIlx1NEVDRVx1NTIxQlx1NUVGQVx1NTIzMFx1NUI4Q1x1NjIxMFwiLFxuXHRcdCk7XG5cblx0XHRjb25zdCBjaGFydFNlY3Rpb24gPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1zZWN0aW9uXCIgfSk7XG5cdFx0Y2hhcnRTZWN0aW9uLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlx1NkJDRlx1NjVFNVx1NEVGQlx1NTJBMVx1OEQ4Qlx1NTJCRlwiIH0pO1xuXHRcdHRoaXMucmVuZGVyRGFpbHlCYXJDaGFydChjaGFydFNlY3Rpb24sIHN0YXRzLmRhaWx5U2VyaWVzKTtcblxuXHRcdGNvbnN0IHJhdGVTZWN0aW9uID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtc2VjdGlvblwiIH0pO1xuXHRcdHJhdGVTZWN0aW9uLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlx1NkJDRlx1NjVFNVx1NUI4Q1x1NjIxMFx1NzM4N1wiIH0pO1xuXHRcdHRoaXMucmVuZGVyRGFpbHlSYXRlQ2hhcnQocmF0ZVNlY3Rpb24sIHN0YXRzLmRhaWx5UmF0ZXMpO1xuXG5cdFx0Y29uc3QgZGVhZGxpbmVTZWN0aW9uID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtc2VjdGlvblwiIH0pO1xuXHRcdGRlYWRsaW5lU2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcdTY5ODJcdTg5QzhcIiB9KTtcblx0XHR0aGlzLnJlbmRlckRlYWRsaW5lQnJlYWtkb3duKGRlYWRsaW5lU2VjdGlvbiwgc3RhdHMpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJUaW1lbGluZShib2R5OiBIVE1MRWxlbWVudCkge1xuXHRcdGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gdGhpcy5yZXNvbHZlVGltZWxpbmVSYW5nZSgpO1xuXHRcdGNvbnN0IHNlYXJjaFZhbHVlID0gdGhpcy50aW1lbGluZVNlYXJjaDtcblx0XHRjb25zdCBlbnRyaWVzID0gdGhpcy5idWlsZFRpbWVsaW5lRW50cmllcyhzdGFydCwgZW5kKS5maWx0ZXIoKGVudHJ5KSA9PlxuXHRcdFx0dGhpcy5tYXRjaGVzU2VhcmNoVGV4dChcblx0XHRcdFx0c2VhcmNoVmFsdWUsXG5cdFx0XHRcdFtlbnRyeS5jYXJkVGl0bGUsIGVudHJ5LnRleHRdLmpvaW4oXCIgXCIpLFxuXHRcdFx0KSxcblx0XHQpO1xuXG5cdFx0Y29uc3QgaGVhZGVyID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2staGVhZGVyXCIgfSk7XG5cdFx0aGVhZGVyLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBgXHU2NUY2XHU5NUY0XHU4Rjc0XHVGRjA4JHtlbnRyaWVzLmxlbmd0aH1cdUZGMDlgIH0pO1xuXHRcdGNvbnN0IGNvbnRyb2xzID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jb250cm9sc1wiIH0pO1xuXHRcdGNvbnN0IHByZXNldFNlbGVjdCA9IGNvbnRyb2xzLmNyZWF0ZUVsKFwic2VsZWN0XCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuXHRcdFtcblx0XHRcdHsgdmFsdWU6IFwidG9kYXlcIiwgbGFiZWw6IFwiXHU0RUNBXHU1OTI5XCIgfSxcblx0XHRcdHsgdmFsdWU6IFwieWVzdGVyZGF5XCIsIGxhYmVsOiBcIlx1NjYyOFx1NTkyOVwiIH0sXG5cdFx0XHR7IHZhbHVlOiBcImN1c3RvbVwiLCBsYWJlbDogXCJcdTgxRUFcdTVCOUFcdTRFNDlcIiB9LFxuXHRcdF0uZm9yRWFjaCgob3B0aW9uKSA9PiB7XG5cdFx0XHRjb25zdCBvcHQgPSBwcmVzZXRTZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBvcHRpb24ubGFiZWwsIHZhbHVlOiBvcHRpb24udmFsdWUgfSk7XG5cdFx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCA9PT0gb3B0aW9uLnZhbHVlKSBvcHQuc2VsZWN0ZWQgPSB0cnVlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3Qgc2VhcmNoQm94ID0gaGVhZGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1zZWFyY2hcIiB9KTtcblx0XHRjb25zdCBzZWFyY2hJbnB1dCA9IHNlYXJjaEJveC5jcmVhdGVFbChcImlucHV0XCIsIHtcblx0XHRcdHR5cGU6IFwic2VhcmNoXCIsXG5cdFx0XHRwbGFjZWhvbGRlcjogXCJcdTY0MUNcdTdEMjJcdTY4MDdcdTk4OTgvXHU1MTg1XHU1QkI5XCIsXG5cdFx0XHR2YWx1ZTogc2VhcmNoVmFsdWUsXG5cdFx0fSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRzZWFyY2hJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY29tcG9zaXRpb25zdGFydFwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmlzVGltZWxpbmVDb21wb3NpbmcgPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHNlYXJjaElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbmVuZFwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmlzVGltZWxpbmVDb21wb3NpbmcgPSBmYWxzZTtcblx0XHRcdHRoaXMudGltZWxpbmVTZWFyY2ggPSBzZWFyY2hJbnB1dC52YWx1ZTtcblx0XHRcdHRoaXMubGFzdEZvY3VzZWRTZWFyY2hUYWIgPSBcInRpbWVsaW5lXCI7XG5cdFx0XHR0aGlzLmxhc3RTZWFyY2hTZWxlY3Rpb24gPSB7XG5cdFx0XHRcdHN0YXJ0OiBzZWFyY2hJbnB1dC5zZWxlY3Rpb25TdGFydCA/PyBzZWFyY2hJbnB1dC52YWx1ZS5sZW5ndGgsXG5cdFx0XHRcdGVuZDogc2VhcmNoSW5wdXQuc2VsZWN0aW9uRW5kID8/IHNlYXJjaElucHV0LnZhbHVlLmxlbmd0aCxcblx0XHRcdH07XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXHRcdHNlYXJjaElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnRpbWVsaW5lU2VhcmNoID0gc2VhcmNoSW5wdXQudmFsdWU7XG5cdFx0XHRpZiAodGhpcy5pc1RpbWVsaW5lQ29tcG9zaW5nKSByZXR1cm47XG5cdFx0XHR0aGlzLmxhc3RGb2N1c2VkU2VhcmNoVGFiID0gXCJ0aW1lbGluZVwiO1xuXHRcdFx0dGhpcy5sYXN0U2VhcmNoU2VsZWN0aW9uID0ge1xuXHRcdFx0XHRzdGFydDogc2VhcmNoSW5wdXQuc2VsZWN0aW9uU3RhcnQgPz8gc2VhcmNoSW5wdXQudmFsdWUubGVuZ3RoLFxuXHRcdFx0XHRlbmQ6IHNlYXJjaElucHV0LnNlbGVjdGlvbkVuZCA/PyBzZWFyY2hJbnB1dC52YWx1ZS5sZW5ndGgsXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0XHR0aGlzLnJlc3RvcmVTZWFyY2hGb2N1cyhcInRpbWVsaW5lXCIsIHNlYXJjaElucHV0KTtcblxuXHRcdGNvbnN0IGN1c3RvbVdyYXBwZXIgPSBjb250cm9scy5jcmVhdGVEaXYoeyBjbHM6IFwic2stcmFuZ2UtY3VzdG9tXCIgfSk7XG5cdFx0Y29uc3Qgc3RhcnRJbnB1dCA9IGN1c3RvbVdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZVwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0Y29uc3QgZW5kSW5wdXQgPSBjdXN0b21XcmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGVcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXG5cdFx0Y29uc3QgdXBkYXRlQ3VzdG9tSW5wdXRzID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgPT09IFwiY3VzdG9tXCIgJiYgdGhpcy50aW1lbGluZUN1c3RvbSkge1xuXHRcdFx0XHRzdGFydElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy50aW1lbGluZUN1c3RvbS5zdGFydCk7XG5cdFx0XHRcdGVuZElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy50aW1lbGluZUN1c3RvbS5lbmQpO1xuXHRcdFx0XHRjdXN0b21XcmFwcGVyLmFkZENsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXN0b21XcmFwcGVyLnJlbW92ZUNsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR1cGRhdGVDdXN0b21JbnB1dHMoKTtcblxuXHRcdGNvbnN0IGFwcGx5UHJlc2V0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBwcmVzZXRTZWxlY3QudmFsdWUgYXMgVGltZWxpbmVSYW5nZVByZXNldDtcblx0XHRcdHRoaXMudGltZWxpbmVQcmVzZXQgPSB2YWx1ZTtcblx0XHRcdGlmICh2YWx1ZSA9PT0gXCJ0b2RheVwiKSB7XG5cdFx0XHRcdGNvbnN0IHRvZGF5ID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdFx0XHR0aGlzLnRpbWVsaW5lQ3VzdG9tID0geyBzdGFydDogdG9kYXksIGVuZDogdG9kYXkgfTtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWUgPT09IFwieWVzdGVyZGF5XCIpIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdGNvbnN0IHllc3RlcmRheSA9IHRvZGF5IC0gMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRcdFx0dGhpcy50aW1lbGluZUN1c3RvbSA9IHsgc3RhcnQ6IHllc3RlcmRheSwgZW5kOiB5ZXN0ZXJkYXkgfTtcblx0XHRcdH0gZWxzZSBpZiAoIXRoaXMudGltZWxpbmVDdXN0b20pIHtcblx0XHRcdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0XHRcdHRoaXMudGltZWxpbmVDdXN0b20gPSB7IHN0YXJ0OiB0b2RheSwgZW5kOiB0b2RheSB9O1xuXHRcdFx0fVxuXHRcdFx0dXBkYXRlQ3VzdG9tSW5wdXRzKCk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH07XG5cdFx0cHJlc2V0U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgYXBwbHlQcmVzZXQpO1xuXG5cdFx0Y29uc3QgaGFuZGxlQ3VzdG9tQ2hhbmdlID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgIT09IFwiY3VzdG9tXCIpIHJldHVybjtcblx0XHRcdGNvbnN0IHN0YXJ0RGF0ZSA9IHN0YXJ0SW5wdXQudmFsdWUgPyBuZXcgRGF0ZShzdGFydElucHV0LnZhbHVlKS5nZXRUaW1lKCkgOiBudWxsO1xuXHRcdFx0Y29uc3QgZW5kRGF0ZSA9IGVuZElucHV0LnZhbHVlID8gbmV3IERhdGUoZW5kSW5wdXQudmFsdWUpLmdldFRpbWUoKSA6IG51bGw7XG5cdFx0XHRpZiAoc3RhcnREYXRlICYmIGVuZERhdGUgJiYgc3RhcnREYXRlIDw9IGVuZERhdGUpIHtcblx0XHRcdFx0dGhpcy50aW1lbGluZUN1c3RvbSA9IHtcblx0XHRcdFx0XHRzdGFydDogdGhpcy5zdGFydE9mRGF5KHN0YXJ0RGF0ZSksXG5cdFx0XHRcdFx0ZW5kOiB0aGlzLnN0YXJ0T2ZEYXkoZW5kRGF0ZSksXG5cdFx0XHRcdH07XG5cdFx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRzdGFydElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlQ3VzdG9tQ2hhbmdlKTtcblx0XHRlbmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGhhbmRsZUN1c3RvbUNoYW5nZSk7XG5cblx0XHRpZiAoIWVudHJpZXMubGVuZ3RoKSB7XG5cdFx0XHRib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1lbXB0eVwiLCB0ZXh0OiBcIlx1OEJFNVx1NjVGNlx1OTVGNFx1ODMwM1x1NTZGNFx1NTE4NVx1NkNBMVx1NjcwOVx1NjRDRFx1NEY1Q1x1OEJCMFx1NUY1NVwiIH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRpbWVsaW5lV3JhcHBlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLXdyYXBwZXJcIiB9KTtcblx0XHRjb25zdCB0aW1lbGluZSA9IHRpbWVsaW5lV3JhcHBlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmVcIiB9KTtcblx0XHRlbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG5cdFx0XHRjb25zdCByb3cgPSB0aW1lbGluZS5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtcm93XCIgfSk7XG5cdFx0XHRjb25zdCB0aW1lQm94ID0gcm93LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS10aW1lYm94XCIgfSk7XG5cdFx0XHR0aW1lQm94LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1kYXRlXCIsIHRleHQ6IGZvcm1hdERhdGVPbmx5KGVudHJ5LnRpbWVzdGFtcCkgfSk7XG5cdFx0XHR0aW1lQm94LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS10aW1lXCIsIHRleHQ6IGZvcm1hdFRpbWUoZW50cnkudGltZXN0YW1wKSB9KTtcblx0XHRcdHRpbWVCb3guc2V0QXR0cihcInRpdGxlXCIsIGZvcm1hdERhdGUoZW50cnkudGltZXN0YW1wKSk7XG5cdFx0XHRjb25zdCBtYXJrZXIgPSByb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRpbWVsaW5lLW1hcmtlclwiIH0pO1xuXHRcdFx0Y29uc3QgY29udGVudCA9IHJvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtY29udGVudFwiIH0pO1xuXHRcdFx0Y29udGVudC5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGltZWxpbmUtY2FyZC10aXRsZVwiLCB0ZXh0OiBlbnRyeS5jYXJkVGl0bGUgfSk7XG5cdFx0XHRjb250ZW50LmNyZWF0ZURpdih7IGNsczogXCJzay10aW1lbGluZS1jYXJkLWJvZHlcIiwgdGV4dDogZW50cnkudGV4dCB9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ29sdW1uKHdyYXBwZXI6IEhUTUxFbGVtZW50LCBjb2x1bW46IEthbmJhbkNvbHVtbikge1xuXHRcdGNvbnN0IGNvbHVtbkVsID0gd3JhcHBlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uXCIgfSk7XG5cblx0XHRjb25zdCBjb2x1bW5IZWFkZXIgPSBjb2x1bW5FbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uLWhlYWRlclwiIH0pO1xuXHRcdGNvbnN0IHRpdGxlRWwgPSBjb2x1bW5IZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbi10aXRsZVwiLCBhdHRyOiB7IHJvbGU6IFwiYnV0dG9uXCIgfSB9KTtcblx0XHR0aXRsZUVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBjb2x1bW4ubmFtZSB9KTtcblx0XHR0aXRsZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHRuZXcgQ29sdW1uTW9kYWwodGhpcy5hcHAsIHtcblx0XHRcdFx0dGl0bGU6IFwiXHU3RjE2XHU4RjkxXHU2ODBGXHU3NkVFXCIsXG5cdFx0XHRcdGluaXRpYWxWYWx1ZTogY29sdW1uLm5hbWUsXG5cdFx0XHRcdGNvbmZpcm1UZXh0OiBcIlx1NEZERFx1NUI1OFwiLFxuXHRcdFx0XHRvblN1Ym1pdDogYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4ucmVuYW1lQ29sdW1uKGNvbHVtbi5pZCwgdmFsdWUpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgYWN0aW9uc0VsID0gY29sdW1uSGVhZGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW4tYWN0aW9uc1wiIH0pO1xuXHRcdGNvbnN0IGFkZEJ0biA9IGFjdGlvbnNFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU2REZCXHU1MkEwXHU1MzYxXHU3MjQ3XCIsIGNsczogXCJzay1idG4gc2stYnRuLXNtYWxsXCIgfSk7XG5cdFx0YWRkQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnBsdWdpbi5zZXRBY3RpdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRcdG5ldyBDYXJkTW9kYWwodGhpcy5hcHAsIHRoaXMucGx1Z2luLCBjb2x1bW4uaWQpLm9wZW4oKTtcblx0XHR9KTtcblx0XHRjb25zdCBkZWxldGVCdG4gPSBhY3Rpb25zRWwuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogXCJcdTUyMjBcdTk2NjRcIixcblx0XHRcdGNsczogXCJzay1idG4gc2stYnRuLWdob3N0IHNrLWJ0bi1zbWFsbFwiLFxuXHRcdFx0YXR0cjogeyBcImFyaWEtbGFiZWxcIjogXCJcdTUyMjBcdTk2NjRcdTY4MEZcdTc2RUVcIiB9LFxuXHRcdH0pO1xuXHRcdGRlbGV0ZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0bmV3IENvbmZpcm1Nb2RhbCh0aGlzLmFwcCwge1xuXHRcdFx0XHR0aXRsZTogXCJcdTUyMjBcdTk2NjRcdTY4MEZcdTc2RUVcIixcblx0XHRcdFx0bWVzc2FnZTogYFx1Nzg2RVx1NUI5QVx1NTIyMFx1OTY2NFx1MzAwQyR7Y29sdW1uLm5hbWV9XHUzMDBEXHU1M0NBXHU1MTc2XHU2MjQwXHU2NzA5XHU1MzYxXHU3MjQ3XHVGRjFGYCxcblx0XHRcdFx0Y29uZmlybVRleHQ6IFwiXHU1MjIwXHU5NjY0XCIsXG5cdFx0XHRcdG9uQ29uZmlybTogYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnJlbW92ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY2FyZHNDb250YWluZXIgPSBjb2x1bW5FbC5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBcInNrLWNhcmRzXCIsXG5cdFx0XHRhdHRyOiB7IFwiZGF0YS1jb2x1bW5cIjogY29sdW1uLmlkIH0sXG5cdFx0fSk7XG5cdFx0Y29uc3QgZmlsdGVyV3JhcHBlciA9IGFjdGlvbnNFbC5jcmVhdGVFbChcImxhYmVsXCIsIHsgY2xzOiBcInNrLWZpbHRlci10b2dnbGVcIiB9KTtcblx0XHRjb25zdCBkZWFkbGluZU9ubHkgPSB0aGlzLmRlYWRsaW5lRmlsdGVycy5nZXQoY29sdW1uLmlkKSA/PyBmYWxzZTtcblx0XHRjb25zdCBmaWx0ZXJDaGVja2JveCA9IGZpbHRlcldyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGZpbHRlckNoZWNrYm94LmNoZWNrZWQgPSBkZWFkbGluZU9ubHk7XG5cdFx0ZmlsdGVyQ2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmRlYWRsaW5lRmlsdGVycy5zZXQoY29sdW1uLmlkLCBmaWx0ZXJDaGVja2JveC5jaGVja2VkKTtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cdFx0ZmlsdGVyV3JhcHBlci5jcmVhdGVTcGFuKHsgdGV4dDogXCJcdTRFQzVcdTYyMkFcdTZCNjJcIiB9KTtcblxuXHRcdGNhcmRzQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmIChldnQuZGF0YVRyYW5zZmVyKSBldnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcIm1vdmVcIjtcblx0XHRcdGNvbnN0IGJlZm9yZUlkID0gdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdHRoaXMubW92ZVBsYWNlaG9sZGVyKGNhcmRzQ29udGFpbmVyLCBiZWZvcmVJZCk7XG5cdFx0fSk7XG5cdFx0Y2FyZHNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRjb25zdCBiZWZvcmVJZCA9XG5cdFx0XHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZT8uY29sdW1uSWQgPT09IGNvbHVtbi5pZFxuXHRcdFx0XHRcdD8gdGhpcy5wbGFjZWhvbGRlclN0YXRlLmJlZm9yZUlkXG5cdFx0XHRcdFx0OiB0aGlzLmdldEJlZm9yZUNhcmRJZChjYXJkc0NvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dm9pZCB0aGlzLmhhbmRsZURyb3AoY29sdW1uLmlkLCBiZWZvcmVJZCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjYXJkc1RvUmVuZGVyID0gdGhpcy5nZXRDYXJkc0ZvckNvbHVtbihjb2x1bW4sIGRlYWRsaW5lT25seSk7XG5cblx0XHRpZiAoIWNhcmRzVG9SZW5kZXIubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBlbXB0eVRleHQgPSBkZWFkbGluZU9ubHkgPyBcIlx1NjY4Mlx1NjVFMFx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVwiIDogXCJcdUQ4M0RcdURDREQgXHU2NjgyXHU2NUUwXHU0RUZCXHU1MkExXCI7XG5cdFx0XHRjb25zdCBlbXB0eSA9IGNhcmRzQ29udGFpbmVyLmNyZWF0ZURpdih7IHRleHQ6IGVtcHR5VGV4dCwgY2xzOiBcInNrLWVtcHR5XCIgfSk7XG5cdFx0XHRlbXB0eS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2dCkgPT4ge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0XHRjb25zdCBiZWZvcmVJZCA9IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHRcdHRoaXMubW92ZVBsYWNlaG9sZGVyKGNhcmRzQ29udGFpbmVyLCBiZWZvcmVJZCk7XG5cdFx0XHR9KTtcblx0XHRcdGVtcHR5LmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIChldnQpID0+IHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGNvbnN0IGJlZm9yZUlkID1cblx0XHRcdFx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGU/LmNvbHVtbklkID09PSBjb2x1bW4uaWRcblx0XHRcdFx0XHRcdD8gdGhpcy5wbGFjZWhvbGRlclN0YXRlLmJlZm9yZUlkXG5cdFx0XHRcdFx0XHQ6IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHRcdHZvaWQgdGhpcy5oYW5kbGVEcm9wKGNvbHVtbi5pZCwgYmVmb3JlSWQpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y2FyZHNUb1JlbmRlci5mb3JFYWNoKChjYXJkKSA9PiB7XG5cdFx0XHR0aGlzLnJlbmRlckNhcmQoY2FyZHNDb250YWluZXIsIGNvbHVtbiwgY2FyZCk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckNhcmQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY29sdW1uOiBLYW5iYW5Db2x1bW4sIGNhcmQ6IEthbmJhbkNhcmQpIHtcblx0XHRjb25zdCBjYXJkQ2xhc3NlcyA9IFtcInNrLWNhcmRcIl07XG5cdFx0aWYgKGNhcmQuY29tcGxldGVkKSBjYXJkQ2xhc3Nlcy5wdXNoKFwic2stY2FyZC1jb21wbGV0ZWRcIik7XG5cdFx0aWYgKGNhcmQuZGVhZGxpbmUpIGNhcmRDbGFzc2VzLnB1c2goXCJzay1jYXJkLWRlYWRsaW5lXCIpO1xuXHRcdGNvbnN0IGNhcmRFbCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBjYXJkQ2xhc3Nlcy5qb2luKFwiIFwiKSxcblx0XHRcdGF0dHI6IHsgZHJhZ2dhYmxlOiBcInRydWVcIiwgXCJkYXRhLWNhcmRcIjogY2FyZC5pZCB9LFxuXHRcdH0pO1xuXHRcdGNhcmRFbC5kYXRhc2V0LmNhcmRJZCA9IGNhcmQuaWQ7XG5cblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCAoZXZ0KSA9PiB7XG5cdFx0XHR0aGlzLmRyYWdTdGF0ZSA9IHsgY2FyZElkOiBjYXJkLmlkLCBjb2x1bW5JZDogY29sdW1uLmlkLCBjYXJkSGVpZ2h0OiBjYXJkRWwub2Zmc2V0SGVpZ2h0IH07XG5cdFx0XHRjYXJkRWwuYWRkQ2xhc3MoXCJzay1jYXJkLWRyYWdnaW5nXCIpO1xuXHRcdFx0ZXZ0LmRhdGFUcmFuc2Zlcj8uc2V0RGF0YShcInRleHQvcGxhaW5cIiwgY2FyZC5pZCk7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW5kXCIsICgpID0+IHtcblx0XHRcdGNhcmRFbC5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJhZ2dpbmdcIik7XG5cdFx0XHR0aGlzLnJlc2V0RHJhZ1N0YXRlKCk7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmIChldnQuZGF0YVRyYW5zZmVyKSBldnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcIm1vdmVcIjtcblx0XHRcdGNhcmRFbC5hZGRDbGFzcyhcInNrLWNhcmQtZHJvcFwiKTtcblx0XHRcdGNvbnN0IGNvbnRhaW5lciA9IGNhcmRFbC5wYXJlbnRFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0Y29uc3QgYmVmb3JlSWQgPSB0aGlzLmdldEJlZm9yZUNhcmRJZChjb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdHRoaXMubW92ZVBsYWNlaG9sZGVyKGNvbnRhaW5lciwgYmVmb3JlSWQpO1xuXHRcdH0pO1xuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsICgpID0+IHtcblx0XHRcdGNhcmRFbC5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJvcFwiKTtcblx0XHR9KTtcblxuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2dCkgPT4ge1xuXHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZ0LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcblx0XHRcdGlmICh0YXJnZXQuY2xvc2VzdChcIi5zay1oaXN0b3J5LWhvc3RcIikpIHJldHVybjtcblx0XHRcdHRoaXMucGx1Z2luLnNldEFjdGl2ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGNvbHVtbi5pZCwgY2FyZCkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgdG9wUm93ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRvcFwiIH0pO1xuXHRcdGNvbnN0IGNoZWNrYm94ID0gdG9wUm93LmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjaGVja2JveC5jaGVja2VkID0gY2FyZC5jb21wbGV0ZWQ7XG5cdFx0Y2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChldnQpID0+IHtcblx0XHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnRvZ2dsZUNhcmRDb21wbGV0aW9uKGNvbHVtbi5pZCwgY2FyZC5pZCwgY2hlY2tib3guY2hlY2tlZCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCB0aXRsZUVsID0gdG9wUm93LmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRpdGxlXCIsIHRleHQ6IGNhcmQudGl0bGUgfSk7XG5cblx0XHRjb25zdCBoaXN0b3J5SG9zdCA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2staGlzdG9yeS1ob3N0XCIgfSk7XG5cdFx0Y29uc3QgaGlzdG9yeU1hcmtlciA9IGhpc3RvcnlIb3N0LmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LW1hcmtlclwiLCB0ZXh0OiBcIlx1MjNGMVwiIH0pO1xuXHRcdGNvbnN0IHBvcG92ZXIgPSBoaXN0b3J5SG9zdC5jcmVhdGVEaXYoeyBjbHM6IFwic2staGlzdG9yeS1wb3BvdmVyXCIgfSk7XG5cdFx0Y29uc3QgaGlzdG9yeUVudHJpZXMgPSBBcnJheS5pc0FycmF5KGNhcmQuaGlzdG9yeSkgPyBjYXJkLmhpc3RvcnkgOiBbXTtcblx0XHRoaXN0b3J5RW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuXHRcdFx0cG9wb3Zlci5jcmVhdGVEaXYoe1xuXHRcdFx0XHRjbHM6IFwic2staGlzdG9yeS1lbnRyeVwiLFxuXHRcdFx0XHR0ZXh0OiBgJHtmb3JtYXREYXRlKGVudHJ5LnRpbWVzdGFtcCl9IFx1MDBCNyAke2VudHJ5LnJlbWFyayB8fCBcIlx1NEZFRVx1NjUzOVwifWAsXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRpZiAoIWhpc3RvcnlFbnRyaWVzLmxlbmd0aCkge1xuXHRcdFx0cG9wb3Zlci5jcmVhdGVEaXYoeyB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1NTM4Nlx1NTNGMlwiLCBjbHM6IFwic2staGlzdG9yeS1lbnRyeVwiIH0pO1xuXHRcdH1cblx0XHRsZXQgaGlkZVRpbWVvdXQ6IE51bGxhYmxlVGltZW91dCA9IG51bGw7XG5cdFx0Y29uc3QgY2xlYXJIaWRlVGltZW91dCA9ICgpID0+IHtcblx0XHRcdGlmIChoaWRlVGltZW91dCAhPT0gbnVsbCkge1xuXHRcdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KGhpZGVUaW1lb3V0KTtcblx0XHRcdFx0aGlkZVRpbWVvdXQgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3Qgc2hvd0hpc3RvcnkgPSAoKSA9PiB7XG5cdFx0XHRjbGVhckhpZGVUaW1lb3V0KCk7XG5cdFx0XHRoaXN0b3J5SG9zdC5hZGRDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0fTtcblx0XHRjb25zdCBzY2hlZHVsZUhpZGUgPSAoKSA9PiB7XG5cdFx0XHRjbGVhckhpZGVUaW1lb3V0KCk7XG5cdFx0XHRoaWRlVGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0aWYgKCFoaXN0b3J5SG9zdC5oYXNDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpKSB7XG5cdFx0XHRcdFx0aGlzdG9yeUhvc3QucmVtb3ZlQ2xhc3MoXCJzay1oaXN0b3J5LWhvdmVyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAxNTApO1xuXHRcdH07XG5cdFx0aGlzdG9yeUhvc3QuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd0hpc3RvcnkpO1xuXHRcdGhpc3RvcnlIb3N0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHNjaGVkdWxlSGlkZSk7XG5cdFx0aGlzdG9yeU1hcmtlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0Y2xlYXJIaWRlVGltZW91dCgpO1xuXHRcdFx0aWYgKGhpc3RvcnlIb3N0Lmhhc0NsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIikpIHtcblx0XHRcdFx0aGlzdG9yeUhvc3QucmVtb3ZlQ2xhc3MoXCJzay1oaXN0b3J5LXBpbm5lZFwiKTtcblx0XHRcdFx0aWYgKCFoaXN0b3J5SG9zdC5tYXRjaGVzKFwiOmhvdmVyXCIpKSB7XG5cdFx0XHRcdFx0aGlzdG9yeUhvc3QucmVtb3ZlQ2xhc3MoXCJzay1oaXN0b3J5LWhvdmVyXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRoaXN0b3J5SG9zdC5hZGRDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpO1xuXHRcdFx0XHRoaXN0b3J5SG9zdC5hZGRDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3QgZGlzYWJsZURyYWcgPSAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRjYXJkRWwuc2V0QXR0cihcImRyYWdnYWJsZVwiLCBcImZhbHNlXCIpO1xuXHRcdFx0Y29uc3QgZW5hYmxlID0gKCkgPT4ge1xuXHRcdFx0XHRjYXJkRWwuc2V0QXR0cihcImRyYWdnYWJsZVwiLCBcInRydWVcIik7XG5cdFx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGVuYWJsZSk7XG5cdFx0XHR9O1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZW5hYmxlKTtcblx0XHR9O1xuXHRcdGhpc3RvcnlIb3N0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZGlzYWJsZURyYWcpO1xuXHRcdHBvcG92ZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBkaXNhYmxlRHJhZyk7XG5cblx0XHRpZiAoY2FyZC50YWdzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgdGFnUm93ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRhZ3NcIiB9KTtcblx0XHRcdGNhcmQudGFncy5mb3JFYWNoKCh0YWcpID0+IHRhZ1Jvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFnXCIsIHRleHQ6IHRhZyB9KSk7XG5cdFx0fVxuXG5cdFx0aWYgKGNhcmQucmVtYXJrKSB7XG5cdFx0XHRjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtcmVtYXJrXCIsIHRleHQ6IGNhcmQucmVtYXJrIH0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1ldGEgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtbWV0YVwiIH0pO1xuXHRcdG1ldGEuY3JlYXRlU3Bhbih7IHRleHQ6IGBcdTUyMUJcdTVFRkFcdUZGMUEke2Zvcm1hdERhdGUoY2FyZC5jcmVhdGVkQXQpfWAgfSk7XG5cdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NjZGNFx1NjVCMFx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLnVwZGF0ZWRBdCl9YCB9KTtcblx0XHRpZiAoY2FyZC5kZWFkbGluZSkge1xuXHRcdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NjIyQVx1NkI2Mlx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLmRlYWRsaW5lKX1gLCBjbHM6IFwic2stY2FyZC1kZWFkbGluZS10ZXh0XCIgfSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhcmRFbDtcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlRHJvcCh0YXJnZXRDb2x1bW5JZDogc3RyaW5nLCBiZWZvcmVDYXJkSWQ/OiBzdHJpbmcpIHtcblx0XHRpZiAoIXRoaXMuZHJhZ1N0YXRlKSByZXR1cm47XG5cdFx0Y29uc3QgeyBjb2x1bW5JZCwgY2FyZElkIH0gPSB0aGlzLmRyYWdTdGF0ZTtcblx0XHRpZiAodGFyZ2V0Q29sdW1uSWQgPT09IGNvbHVtbklkICYmIGJlZm9yZUNhcmRJZCA9PT0gY2FyZElkKSB7XG5cdFx0XHR0aGlzLnJlc2V0RHJhZ1N0YXRlKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGx1Z2luLm1vdmVDYXJkKGNhcmRJZCwgY29sdW1uSWQsIHRhcmdldENvbHVtbklkLCBiZWZvcmVDYXJkSWQpO1xuXHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0QmVmb3JlQ2FyZElkKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNsaWVudFk6IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgY2FyZHMgPSBBcnJheS5mcm9tKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcIi5zay1jYXJkXCIpKTtcblx0XHRmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcblx0XHRcdGNvbnN0IHJlY3QgPSBjYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0Y29uc3QgbWlkcG9pbnQgPSByZWN0LnRvcCArIHJlY3QuaGVpZ2h0IC8gMjtcblx0XHRcdGlmIChjbGllbnRZIDwgbWlkcG9pbnQpIHtcblx0XHRcdFx0Y29uc3QgaWQgPSBjYXJkLmRhdGFzZXQuY2FyZElkO1xuXHRcdFx0XHRyZXR1cm4gaWQgfHwgdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRDYXJkc0ZvckNvbHVtbihjb2x1bW46IEthbmJhbkNvbHVtbiwgZGVhZGxpbmVPbmx5OiBib29sZWFuKTogS2FuYmFuQ2FyZFtdIHtcblx0XHRpZiAoIWRlYWRsaW5lT25seSkge1xuXHRcdFx0cmV0dXJuIGNvbHVtbi5jYXJkcztcblx0XHR9XG5cdFx0cmV0dXJuIGNvbHVtbi5jYXJkc1xuXHRcdFx0LmZpbHRlcigoY2FyZCkgPT4gISFjYXJkLmRlYWRsaW5lKVxuXHRcdFx0LnNsaWNlKClcblx0XHRcdC5zb3J0KChhLCBiKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGFUaW1lID0gYS5kZWFkbGluZSA/PyAwO1xuXHRcdFx0XHRjb25zdCBiVGltZSA9IGIuZGVhZGxpbmUgPz8gMDtcblx0XHRcdFx0cmV0dXJuIGFUaW1lIC0gYlRpbWU7XG5cdFx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgZW5zdXJlUGxhY2Vob2xkZXIoKTogSFRNTEVsZW1lbnQge1xuXHRcdGlmICghdGhpcy5wbGFjZWhvbGRlckVsKSB7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXHRcdFx0dGhpcy5wbGFjZWhvbGRlckVsLmFkZENsYXNzKFwic2stY2FyZC1wbGFjZWhvbGRlclwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMucGxhY2Vob2xkZXJFbDtcblx0fVxuXG5cdHByaXZhdGUgbW92ZVBsYWNlaG9sZGVyKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGJlZm9yZUlkPzogc3RyaW5nKSB7XG5cdFx0aWYgKCF0aGlzLmRyYWdTdGF0ZSkgcmV0dXJuO1xuXHRcdGNvbnN0IGNvbHVtbklkID0gY29udGFpbmVyLmdldEF0dHJpYnV0ZShcImRhdGEtY29sdW1uXCIpO1xuXHRcdGlmICghY29sdW1uSWQpIHJldHVybjtcblx0XHRjb25zdCBwbGFjZWhvbGRlciA9IHRoaXMuZW5zdXJlUGxhY2Vob2xkZXIoKTtcblx0XHRjb25zdCBkZXNpcmVkSGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5kcmFnU3RhdGUuY2FyZEhlaWdodCB8fCAwLCA0OCk7XG5cdFx0cGxhY2Vob2xkZXIuc3R5bGUuaGVpZ2h0ID0gYCR7ZGVzaXJlZEhlaWdodH1weGA7XG5cdFx0aWYgKHBsYWNlaG9sZGVyLnBhcmVudEVsZW1lbnQgIT09IGNvbnRhaW5lcikge1xuXHRcdFx0dGhpcy5yZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKTtcblx0XHRcdGNvbnRhaW5lci5hZGRDbGFzcyhcInNrLWNhcmRzLXBsYWNlaG9sZGVyXCIpO1xuXHRcdH1cblx0XHRjb25zdCByZWZlcmVuY2UgPSBiZWZvcmVJZFxuXHRcdFx0PyBjb250YWluZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oYC5zay1jYXJkW2RhdGEtY2FyZC1pZD1cIiR7YmVmb3JlSWR9XCJdYClcblx0XHRcdDogbnVsbDtcblx0XHRpZiAocmVmZXJlbmNlKSB7XG5cdFx0XHRjb250YWluZXIuaW5zZXJ0QmVmb3JlKHBsYWNlaG9sZGVyLCByZWZlcmVuY2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQocGxhY2Vob2xkZXIpO1xuXHRcdH1cblx0XHR0aGlzLnNldEVtcHR5TWVzc2FnZVZpc2libGUoY29udGFpbmVyLCBmYWxzZSk7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0geyBjb2x1bW5JZCwgYmVmb3JlSWQgfTtcblx0fVxuXG5cdHByaXZhdGUgcmVzdG9yZVBsYWNlaG9sZGVyUGFyZW50KCkge1xuXHRcdGlmICh0aGlzLnBsYWNlaG9sZGVyRWw/LnBhcmVudEVsZW1lbnQpIHtcblx0XHRcdGNvbnN0IHBhcmVudCA9IHRoaXMucGxhY2Vob2xkZXJFbC5wYXJlbnRFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0cGFyZW50LnJlbW92ZUNsYXNzKFwic2stY2FyZHMtcGxhY2Vob2xkZXJcIik7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyRWwucmVtb3ZlKCk7XG5cdFx0XHR0aGlzLnNldEVtcHR5TWVzc2FnZVZpc2libGUocGFyZW50LCB0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbW92ZVBsYWNlaG9sZGVyKCkge1xuXHRcdHRoaXMucmVzdG9yZVBsYWNlaG9sZGVyUGFyZW50KCk7XG5cdFx0dGhpcy5wbGFjZWhvbGRlckVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdHByaXZhdGUgc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShjb250YWluZXI6IEhUTUxFbGVtZW50LCB2aXNpYmxlOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgZW1wdHlFbCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIi5zay1lbXB0eVwiKTtcblx0XHRpZiAoZW1wdHlFbCkge1xuXHRcdFx0ZW1wdHlFbC5zdHlsZS5kaXNwbGF5ID0gdmlzaWJsZSA/IFwiXCIgOiBcIm5vbmVcIjtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlc2V0RHJhZ1N0YXRlKCkge1xuXHRcdHRoaXMuZHJhZ1N0YXRlID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZSA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnJlbW92ZVBsYWNlaG9sZGVyKCk7XG5cdFx0dGhpcy5jb250ZW50RWwucXVlcnlTZWxlY3RvckFsbChcIi5zay1jYXJkLWRyb3BcIikuZm9yRWFjaCgoZWwpID0+IChlbCBhcyBIVE1MRWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJzay1jYXJkLWRyb3BcIikpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJTdGF0Q2FyZChjb250YWluZXI6IEhUTUxFbGVtZW50LCB0aXRsZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nKSB7XG5cdFx0Y29uc3QgY2FyZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdC1jYXJkXCIgfSk7XG5cdFx0Y2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IHRpdGxlLCBjbHM6IFwic2stc3RhdC1jYXJkLXRpdGxlXCIgfSk7XG5cdFx0Y2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IHZhbHVlLCBjbHM6IFwic2stc3RhdC1jYXJkLXZhbHVlXCIgfSk7XG5cdFx0Y2FyZC5jcmVhdGVFbChcImRpdlwiLCB7IHRleHQ6IGRlc2NyaXB0aW9uLCBjbHM6IFwic2stc3RhdC1jYXJkLWRlc2NcIiB9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGFpbHlCYXJDaGFydChjb250YWluZXI6IEhUTUxFbGVtZW50LCBzZXJpZXM6IERhaWx5U3RhdHNQb2ludFtdKSB7XG5cdFx0aWYgKCFzZXJpZXMubGVuZ3RoKSB7XG5cdFx0XHRjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU2NTcwXHU2MzZFXCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNjcm9sbCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtc2Nyb2xsXCIgfSk7XG5cdFx0Y29uc3QgY2hhcnQgPSBzY3JvbGwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0IHNrLWNoYXJ0LWJhcnNcIiB9KTtcblx0XHRjb25zdCB0b29sdGlwID0gY2hhcnQuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LXRvb2x0aXBcIiB9KTtcblx0XHRjb25zdCBtYXhWYWx1ZSA9IE1hdGgubWF4KFxuXHRcdFx0MSxcblx0XHRcdC4uLnNlcmllcy5tYXAoKHBvaW50KSA9PiBNYXRoLm1heChwb2ludC5jcmVhdGVkLCBwb2ludC5jb21wbGV0ZWQpKSxcblx0XHQpO1xuXG5cdFx0Y29uc3QgY29sdW1uV2lkdGggPSAzNjtcblx0XHRjaGFydC5zdHlsZS5taW5XaWR0aCA9IGAke3Nlcmllcy5sZW5ndGggKiBjb2x1bW5XaWR0aH1weGA7XG5cblx0XHRjb25zdCBoaWRlVG9vbHRpcCA9ICgpID0+IHRvb2x0aXAucmVtb3ZlQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50KSA9PiB7XG5cdFx0XHRjb25zdCBjb2x1bW4gPSBjaGFydC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtY29sXCIgfSk7XG5cdFx0XHRjb25zdCBiYXJzID0gY29sdW1uLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1jb2wtYmFyc1wiIH0pO1xuXHRcdFx0Y29uc3QgY3JlYXRlZEJhciA9IGJhcnMuY3JlYXRlRGl2KHtcblx0XHRcdFx0Y2xzOiBcInNrLWNoYXJ0LWJhciBzay1jaGFydC1iYXItY3JlYXRlZFwiLFxuXHRcdFx0XHRhdHRyOiB7IHN0eWxlOiBgaGVpZ2h0OiR7KHBvaW50LmNyZWF0ZWQgLyBtYXhWYWx1ZSkgKiAxMDB9JWAgfSxcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgY29tcGxldGVkQmFyID0gYmFycy5jcmVhdGVEaXYoe1xuXHRcdFx0XHRjbHM6IFwic2stY2hhcnQtYmFyIHNrLWNoYXJ0LWJhci1jb21wbGV0ZWRcIixcblx0XHRcdFx0YXR0cjogeyBzdHlsZTogYGhlaWdodDokeyhwb2ludC5jb21wbGV0ZWQgLyBtYXhWYWx1ZSkgKiAxMDB9JWAgfSxcblx0XHRcdH0pO1xuXHRcdFx0Y29sdW1uLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1sYWJlbFwiLCB0ZXh0OiBwb2ludC5kYXRlLnNsaWNlKDUpIH0pO1xuXG5cdFx0XHRjb25zdCBzaG93VG9vbHRpcCA9IChldnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gZXZ0LmN1cnJlbnRUYXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRcdHRvb2x0aXAuc2V0VGV4dChgJHtwb2ludC5kYXRlfSBcdTY1QjBcdTVFRkEgJHtwb2ludC5jcmVhdGVkfSBcdTAwQjcgXHU1QjhDXHU2MjEwICR7cG9pbnQuY29tcGxldGVkfWApO1xuXHRcdFx0XHR0b29sdGlwLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcblx0XHRcdFx0Y29uc3QgYm91bmRzID0gY2hhcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdGNvbnN0IHggPSBldnQuY2xpZW50WCAtIGJvdW5kcy5sZWZ0O1xuXHRcdFx0XHRjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSBib3VuZHMudG9wIC0gMjA7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUubGVmdCA9IGAke3h9cHhgO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLnRvcCA9IGAke3l9cHhgO1xuXHRcdFx0fTtcblx0XHRcdFtjcmVhdGVkQmFyLCBjb21wbGV0ZWRCYXIsIGNvbHVtbl0uZm9yRWFjaCgoZWwpID0+IHtcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNob3dUb29sdGlwKTtcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgaGlkZVRvb2x0aXApO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBsZWdlbmQgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxlZ2VuZFwiIH0pO1xuXHRcdHRoaXMucmVuZGVyTGVnZW5kSXRlbShsZWdlbmQsIFwiXHU2NUIwXHU1RUZBXCIsIFwidmFyKC0tY29sb3ItY3lhbiwgIzRlY2RjNClcIik7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTVCOENcdTYyMTBcIiwgXCJ2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpXCIpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJMZWdlbmRJdGVtKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGxhYmVsOiBzdHJpbmcsIGNvbG9yOiBzdHJpbmcpIHtcblx0XHRjb25zdCBpdGVtID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1sZWdlbmQtaXRlbVwiIH0pO1xuXHRcdGNvbnN0IGRvdCA9IGl0ZW0uY3JlYXRlRGl2KHsgY2xzOiBcInNrLWxlZ2VuZC1kb3RcIiB9KTtcblx0XHQoZG90IGFzIEhUTUxEaXZFbGVtZW50KS5zdHlsZS5iYWNrZ3JvdW5kID0gY29sb3I7XG5cdFx0aXRlbS5jcmVhdGVTcGFuKHsgdGV4dDogbGFiZWwgfSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRhaWx5UmF0ZUNoYXJ0KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHNlcmllczogRGFpbHlSYXRlUG9pbnRbXSkge1xuXHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIFJlbmRlcmluZyBkYWlseSByYXRlIGNoYXJ0IHdpdGhcIiwgc2VyaWVzLmxlbmd0aCwgXCJwb2ludHNcIik7XG5cdFx0aWYgKCFzZXJpZXMubGVuZ3RoKSB7XG5cdFx0XHRjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU1QjhDXHU2MjEwXHU3Mzg3XHU2NTcwXHU2MzZFXCIgfSk7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1N0YXRzXSBEYWlseSByYXRlIGNoYXJ0IGhhcyBubyBkYXRhLlwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gRGFpbHkgcmF0ZSBzYW1wbGVzXCIsIHNlcmllcyk7XG5cblx0XHRjb25zdCBzY3JvbGwgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LXNjcm9sbFwiIH0pO1xuXHRcdGNvbnN0IGNoYXJ0V3JhcHBlciA9IHNjcm9sbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQgc2stY2hhcnQtbGluZVwiIH0pO1xuXHRcdGNvbnN0IG1pbkNvbHVtbnMgPSBNYXRoLm1heChzZXJpZXMubGVuZ3RoLCA3KTtcblx0XHRjb25zdCBzdmdXaWR0aCA9IG1pbkNvbHVtbnMgKiAzNjtcblx0XHRjb25zdCBlZmZlY3RpdmVDb3VudCA9IE1hdGgubWF4KHNlcmllcy5sZW5ndGgsIDIpO1xuXHRcdGNvbnN0IGNvbHVtbldpZHRoID0gMzY7XG5cdFx0Y29uc3Qgd2lkdGggPSAoZWZmZWN0aXZlQ291bnQgLSAxKSAqIGNvbHVtbldpZHRoO1xuXHRcdGNvbnN0IG1pbldpZHRoID0gTWF0aC5tYXgoc2VyaWVzLmxlbmd0aCAqIGNvbHVtbldpZHRoLCB3aWR0aCArIDI0KTtcblx0XHRjaGFydFdyYXBwZXIuc3R5bGUubWluV2lkdGggPSBgJHttaW5XaWR0aH1weGA7XG5cdFx0Y29uc3QgaGVpZ2h0ID0gMTYwO1xuXHRcdGNvbnN0IGxlZnRQYWQgPSAxMjtcblx0XHRjb25zdCByaWdodFBhZCA9IDEyO1xuXHRcdGNvbnN0IHRvdGFsV2lkdGggPSB3aWR0aCArIGxlZnRQYWQgKyByaWdodFBhZDtcblx0XHRjb25zdCBzdmcgPSBjcmVhdGVTdmdFbGVtZW50KFwic3ZnXCIpIGFzIFNWR1NWR0VsZW1lbnQ7XG5cdFx0c2V0U3ZnQXR0cnMoc3ZnLCB7XG5cdFx0XHR2aWV3Qm94OiBgMCAwICR7dG90YWxXaWR0aH0gJHtoZWlnaHR9YCxcblx0XHRcdHByZXNlcnZlQXNwZWN0UmF0aW86IFwibm9uZVwiLFxuXHRcdFx0d2lkdGg6IFN0cmluZyh0b3RhbFdpZHRoKSxcblx0XHRcdGhlaWdodDogU3RyaW5nKGhlaWdodCksXG5cdFx0fSk7XG5cdFx0Y2hhcnRXcmFwcGVyLmFwcGVuZENoaWxkKHN2Zyk7XG5cblx0XHRjb25zdCBiYXNlbGluZSA9IGNyZWF0ZVN2Z0VsZW1lbnQoXCJsaW5lXCIpO1xuXHRcdHNldFN2Z0F0dHJzKGJhc2VsaW5lLCB7XG5cdFx0XHR4MTogU3RyaW5nKGxlZnRQYWQpLFxuXHRcdFx0eTE6IFN0cmluZyhoZWlnaHQgLSAxKSxcblx0XHRcdHgyOiBTdHJpbmcodG90YWxXaWR0aCAtIHJpZ2h0UGFkKSxcblx0XHRcdHkyOiBTdHJpbmcoaGVpZ2h0IC0gMSksXG5cdFx0XHRzdHJva2U6IFwidmFyKC0tYmFja2dyb3VuZC1tb2RpZmllci1ib3JkZXIpXCIsXG5cdFx0XHRcInN0cm9rZS13aWR0aFwiOiBcIjFcIixcblx0XHR9KTtcblx0XHRzdmcuYXBwZW5kQ2hpbGQoYmFzZWxpbmUpO1xuXG5cdFx0Y29uc3QgcG9pbnRzRGF0YSA9IHNlcmllcy5tYXAoKHBvaW50LCBpbmRleCkgPT4ge1xuXHRcdFx0Y29uc3QgeCA9XG5cdFx0XHRcdHNlcmllcy5sZW5ndGggPT09IDFcblx0XHRcdFx0XHQ/IGxlZnRQYWQgKyB3aWR0aCAvIDJcblx0XHRcdFx0XHQ6IGxlZnRQYWQgKyAoaW5kZXggLyAoc2VyaWVzLmxlbmd0aCAtIDEgfHwgMSkpICogd2lkdGg7XG5cdFx0XHRjb25zdCBjbGFtcGVkUmF0ZSA9IE1hdGgubWluKE1hdGgubWF4KHBvaW50LnJhdGUsIDApLCAxMDApO1xuXHRcdFx0Y29uc3QgeSA9IGhlaWdodCAtIChjbGFtcGVkUmF0ZSAvIDEwMCkgKiAoaGVpZ2h0IC0gMjApIC0gMTA7XG5cdFx0XHRyZXR1cm4geyB4LCB5LCByYXRlOiBjbGFtcGVkUmF0ZSB9O1xuXHRcdH0pO1xuXHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIERhaWx5IHJhdGUgY29vcmRpbmF0ZXNcIiwgcG9pbnRzRGF0YSk7XG5cdFx0Y29uc3QgcG9pbnRzID0gcG9pbnRzRGF0YS5tYXAoKHApID0+IGAke3AueH0sJHtwLnl9YCkuam9pbihcIiBcIik7XG5cdFx0Y29uc3QgcG9seWxpbmUgPSBjcmVhdGVTdmdFbGVtZW50KFwicG9seWxpbmVcIik7XG5cdFx0c2V0U3ZnQXR0cnMocG9seWxpbmUsIHtcblx0XHRcdHBvaW50cyxcblx0XHRcdGZpbGw6IFwibm9uZVwiLFxuXHRcdFx0c3Ryb2tlOiBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIixcblx0XHRcdFwic3Ryb2tlLXdpZHRoXCI6IFwiM1wiLFxuXHRcdFx0XCJzdHJva2UtbGluZWNhcFwiOiBcInJvdW5kXCIsXG5cdFx0XHRcInN0cm9rZS1saW5lam9pblwiOiBcInJvdW5kXCIsXG5cdFx0fSk7XG5cdFx0c3ZnLmFwcGVuZENoaWxkKHBvbHlsaW5lKTtcblx0XHRjb25zdCB0b29sdGlwID0gY2hhcnRXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC10b29sdGlwXCIgfSk7XG5cdFx0Y29uc3QgaGlkZVRvb2x0aXAgPSAoKSA9PiB0b29sdGlwLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcblxuXHRcdHNlcmllcy5mb3JFYWNoKChwb2ludCwgaW5kZXgpID0+IHtcblx0XHRcdGNvbnN0IGRvdFggPVxuXHRcdFx0XHRzZXJpZXMubGVuZ3RoID09PSAxXG5cdFx0XHRcdFx0PyBsZWZ0UGFkICsgd2lkdGggLyAyXG5cdFx0XHRcdFx0OiBsZWZ0UGFkICsgKGluZGV4IC8gKHNlcmllcy5sZW5ndGggLSAxIHx8IDEpKSAqIHdpZHRoO1xuXHRcdFx0Y29uc3QgY2xhbXBlZFJhdGUgPSBNYXRoLm1pbihNYXRoLm1heChwb2ludC5yYXRlLCAwKSwgMTAwKTtcblx0XHRcdGNvbnN0IGRvdFkgPSBoZWlnaHQgLSAoY2xhbXBlZFJhdGUgLyAxMDApICogKGhlaWdodCAtIDIwKSAtIDEwO1xuXHRcdFx0Y29uc3QgY2lyY2xlID0gY3JlYXRlU3ZnRWxlbWVudChcImNpcmNsZVwiKTtcblx0XHRcdHNldFN2Z0F0dHJzKGNpcmNsZSwge1xuXHRcdFx0XHRjeDogU3RyaW5nKGRvdFgpLFxuXHRcdFx0XHRjeTogU3RyaW5nKGRvdFkpLFxuXHRcdFx0XHRyOiBcIjNcIixcblx0XHRcdFx0ZmlsbDogXCJ2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpXCIsXG5cdFx0XHR9KTtcblx0XHRcdHN2Zy5hcHBlbmRDaGlsZChjaXJjbGUpO1xuXHRcdFx0Y29uc3Qgc2hvd1Rvb2x0aXAgPSAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGJvdW5kcyA9IGNoYXJ0V3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0Y29uc3QgeCA9IGV2dC5jbGllbnRYIC0gYm91bmRzLmxlZnQ7XG5cdFx0XHRcdGNvbnN0IHkgPSBldnQuY2xpZW50WSAtIGJvdW5kcy50b3AgLSAyMDtcblx0XHRcdFx0dG9vbHRpcC5zZXRUZXh0KGAke3BvaW50LmRhdGV9IFx1NUI4Q1x1NjIxMFx1NzM4NyAke3BvaW50LnJhdGUudG9GaXhlZCgxKX0lYCk7XG5cdFx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHt4fXB4YDtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS50b3AgPSBgJHt5fXB4YDtcblx0XHRcdH07XG5cdFx0XHRjaXJjbGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0Y2lyY2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0Y2lyY2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGVUb29sdGlwKTtcblx0XHR9KTtcblxuXHRcdC8vIEFkZCB3aWRlciBob3ZlciBoaXRib3hlcyB0byBtYWtlIHRvb2x0aXAgZWFzaWVyIHRvIHRyaWdnZXIuXG5cdFx0cG9pbnRzRGF0YS5mb3JFYWNoKChwb2ludCwgaW5kZXgpID0+IHtcblx0XHRcdGNvbnN0IHByZXYgPSBwb2ludHNEYXRhW2luZGV4IC0gMV07XG5cdFx0XHRjb25zdCBuZXh0ID0gcG9pbnRzRGF0YVtpbmRleCArIDFdO1xuXHRcdFx0Y29uc3QgbGVmdEJvdW5kID0gcHJldiA/IChwcmV2LnggKyBwb2ludC54KSAvIDIgOiBsZWZ0UGFkO1xuXHRcdFx0Y29uc3QgcmlnaHRCb3VuZCA9IG5leHQgPyAocG9pbnQueCArIG5leHQueCkgLyAyIDogdG90YWxXaWR0aCAtIHJpZ2h0UGFkO1xuXHRcdFx0Y29uc3QgaGl0Ym94ID0gY3JlYXRlU3ZnRWxlbWVudChcInJlY3RcIik7XG5cdFx0XHRzZXRTdmdBdHRycyhoaXRib3gsIHtcblx0XHRcdFx0eDogU3RyaW5nKGxlZnRCb3VuZCksXG5cdFx0XHRcdHk6IFwiMFwiLFxuXHRcdFx0XHR3aWR0aDogU3RyaW5nKE1hdGgubWF4KDQsIHJpZ2h0Qm91bmQgLSBsZWZ0Qm91bmQpKSxcblx0XHRcdFx0aGVpZ2h0OiBTdHJpbmcoaGVpZ2h0KSxcblx0XHRcdFx0ZmlsbDogXCJ0cmFuc3BhcmVudFwiLFxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBzaG93VG9vbHRpcCA9IChldnQ6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3QgYm91bmRzID0gY2hhcnRXcmFwcGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRjb25zdCB4ID0gZXZ0LmNsaWVudFggLSBib3VuZHMubGVmdDtcblx0XHRcdFx0Y29uc3QgeSA9IGV2dC5jbGllbnRZIC0gYm91bmRzLnRvcCAtIDIwO1xuXHRcdFx0XHR0b29sdGlwLnNldFRleHQoYCR7c2VyaWVzW2luZGV4XS5kYXRlfSBcdTVCOENcdTYyMTBcdTczODcgJHtzZXJpZXNbaW5kZXhdLnJhdGUudG9GaXhlZCgxKX0lYCk7XG5cdFx0XHRcdHRvb2x0aXAuYWRkQ2xhc3MoXCJ2aXNpYmxlXCIpO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHt4fXB4YDtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS50b3AgPSBgJHt5fXB4YDtcblx0XHRcdH07XG5cdFx0XHRoaXRib3guYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0aGl0Ym94LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgc2hvd1Rvb2x0aXApO1xuXHRcdFx0aGl0Ym94LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGVUb29sdGlwKTtcblx0XHRcdHN2Zy5hcHBlbmRDaGlsZChoaXRib3gpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGFiZWxzID0gY2hhcnRXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1sYWJlbC1yb3dcIiB9KSBhcyBIVE1MRGl2RWxlbWVudDtcblx0XHRsYWJlbHMuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGByZXBlYXQoJHtNYXRoLm1heChzZXJpZXMubGVuZ3RoLCAxKX0sIG1pbm1heCgwLCAxZnIpKWA7XG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50KSA9PiB7XG5cdFx0XHRsYWJlbHMuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsXCIsIHRleHQ6IHBvaW50LmRhdGUuc2xpY2UoNSkgfSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGZpbHRlckNhcmRzKGNhcmRzOiBLYW5iYW5DYXJkW10sIHNlYXJjaDogc3RyaW5nKTogS2FuYmFuQ2FyZFtdIHtcblx0XHRpZiAoIXNlYXJjaC50cmltKCkpIHJldHVybiBjYXJkcztcblx0XHRyZXR1cm4gY2FyZHMuZmlsdGVyKChjYXJkKSA9PiB7XG5cdFx0XHRjb25zdCB0ZXh0ID0gW1xuXHRcdFx0XHRjYXJkLnRpdGxlLFxuXHRcdFx0XHRjYXJkLnJlbWFyayxcblx0XHRcdFx0Y2FyZC50YWdzLmpvaW4oXCIgXCIpLFxuXHRcdFx0XHQuLi4oQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpXG5cdFx0XHRcdFx0PyBjYXJkLmhpc3RvcnkubWFwKChoKSA9PiBoLnJlbWFyayB8fCBcIlwiKS5maWx0ZXIoQm9vbGVhbilcblx0XHRcdFx0XHQ6IFtdKSxcblx0XHRcdF0uam9pbihcIiBcIik7XG5cdFx0XHRyZXR1cm4gdGhpcy5tYXRjaGVzU2VhcmNoVGV4dChzZWFyY2gsIHRleHQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBtYXRjaGVzU2VhcmNoVGV4dChzZWFyY2g6IHN0cmluZywgdGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0aWYgKCFzZWFyY2gudHJpbSgpKSByZXR1cm4gdHJ1ZTtcblx0XHRyZXR1cm4gdGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaC50b0xvd2VyQ2FzZSgpKTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGVhZGxpbmVCcmVha2Rvd24oY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc3RhdHM6IFN0YXRzU25hcHNob3QpIHtcblx0XHRpZiAoIXN0YXRzLmRlYWRsaW5lQ291bnQpIHtcblx0XHRcdGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZW1wdHlcIiwgdGV4dDogXCJcdTY2ODJcdTY1RTBcdThCQkVcdTdGNkVcdTYyMkFcdTZCNjJcdTY1RjZcdTk1RjRcdTc2ODRcdTRFRkJcdTUyQTFcIiB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgaW5mbyA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZGVhZGxpbmUtaW5mb1wiIH0pO1xuXHRcdGluZm8uY3JlYXRlRGl2KHsgdGV4dDogYFx1NjcwOVx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVx1RkYxQSR7c3RhdHMuZGVhZGxpbmVDb3VudH1gLCBjbHM6IFwic2stZGVhZGxpbmUtbGluZVwiIH0pO1xuXHRcdGluZm8uY3JlYXRlRGl2KHtcblx0XHRcdHRleHQ6IGBcdTYyMkFcdTZCNjJcdTg5ODZcdTc2RDZcdTczODdcdUZGMUEke2Zvcm1hdFBlcmNlbnQoc3RhdHMuZGVhZGxpbmVDb3ZlcmFnZSl9YCxcblx0XHRcdGNsczogXCJzay1kZWFkbGluZS1saW5lXCIsXG5cdFx0fSk7XG5cblx0XHRjb25zdCBwcm9ncmVzcyA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stcHJvZ3Jlc3NcIiB9KTtcblx0XHRwcm9ncmVzcy5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBcInNrLXByb2dyZXNzLW9uLXRpbWVcIixcblx0XHRcdGF0dHI6IHsgc3R5bGU6IGB3aWR0aDoke2Zvcm1hdFBlcmNlbnRWYWx1ZShzdGF0cy5vblRpbWVSYXRlKX0lYCB9LFxuXHRcdH0pO1xuXHRcdHByb2dyZXNzLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFwic2stcHJvZ3Jlc3Mtb3ZlcmR1ZVwiLFxuXHRcdFx0YXR0cjogeyBzdHlsZTogYHdpZHRoOiR7Zm9ybWF0UGVyY2VudFZhbHVlKHN0YXRzLm92ZXJkdWVSYXRlKX0lYCB9LFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGVnZW5kID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1wcm9ncmVzcy1sZWdlbmRcIiB9KTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NjMwOVx1NjVGNlx1NUI4Q1x1NjIxMFwiLCBcInZhcigtLWNvbG9yLWdyZWVuLCAjNGNhZjUwKVwiKTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NURGMi9cdTVDMDZcdTkwM0VcdTY3MUZcIiwgXCJ2YXIoLS1jb2xvci1yZWQsICNmZjZiNmIpXCIpO1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZFN0YXRzU25hcHNob3QocmFuZ2U6IFN0YXRzUmFuZ2UpOiBTdGF0c1NuYXBzaG90IHtcblx0XHRjb25zdCBib2FyZCA9IHRoaXMucGx1Z2luLmdldEJvYXJkKCk7XG5cdFx0Y29uc3QgY2FyZHMgPSBib2FyZC5jb2x1bW5zLmZsYXRNYXAoKGNvbCkgPT4gY29sLmNhcmRzKTtcblx0XHRjb25zdCB0b3RhbFRhc2tzID0gY2FyZHMubGVuZ3RoO1xuXHRcdGNvbnN0IGNvbXBsZXRlZENhcmRzID0gY2FyZHMuZmlsdGVyKChjYXJkKSA9PiBjYXJkLmNvbXBsZXRlZCk7XG5cdFx0Y29uc3QgY29tcGxldGVkVGFza3MgPSBjb21wbGV0ZWRDYXJkcy5sZW5ndGg7XG5cdFx0Y29uc3Qgd2lwQ291bnQgPSB0b3RhbFRhc2tzIC0gY29tcGxldGVkVGFza3M7XG5cdFx0Y29uc3QgY29tcGxldGlvblJhdGUgPSB0b3RhbFRhc2tzID8gY29tcGxldGVkVGFza3MgLyB0b3RhbFRhc2tzIDogMDtcblx0XHRjb25zdCBkZWFkbGluZUNhcmRzID0gY2FyZHMuZmlsdGVyKChjYXJkKSA9PiAhIWNhcmQuZGVhZGxpbmUpO1xuXHRcdGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cdFx0Y29uc3Qgb3ZlcmR1ZUNvdW50ID0gZGVhZGxpbmVDYXJkcy5maWx0ZXIoKGNhcmQpID0+IHtcblx0XHRcdGlmICghY2FyZC5kZWFkbGluZSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKGNhcmQuY29tcGxldGVkKSB7XG5cdFx0XHRcdGNvbnN0IGRvbmVBdCA9IGNhcmQuY29tcGxldGVkQXQgPz8gY2FyZC51cGRhdGVkQXQ7XG5cdFx0XHRcdHJldHVybiAhIWRvbmVBdCAmJiBkb25lQXQgPiBjYXJkLmRlYWRsaW5lO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5vdyA+IGNhcmQuZGVhZGxpbmU7XG5cdFx0fSkubGVuZ3RoO1xuXHRcdGNvbnN0IG9uVGltZUNvdW50ID0gZGVhZGxpbmVDYXJkcy5maWx0ZXIoKGNhcmQpID0+IHtcblx0XHRcdGlmICghY2FyZC5kZWFkbGluZSB8fCAhY2FyZC5jb21wbGV0ZWQpIHJldHVybiBmYWxzZTtcblx0XHRcdGNvbnN0IGRvbmVBdCA9IGNhcmQuY29tcGxldGVkQXQgPz8gY2FyZC51cGRhdGVkQXQ7XG5cdFx0XHRyZXR1cm4gISFkb25lQXQgJiYgZG9uZUF0IDw9IGNhcmQuZGVhZGxpbmU7XG5cdFx0fSkubGVuZ3RoO1xuXHRcdGNvbnN0IGF2Z0N5Y2xlVGltZU1zID0gKCgpID0+IHtcblx0XHRcdGNvbnN0IGZpbmlzaGVkID0gY29tcGxldGVkQ2FyZHMuZmlsdGVyKChjYXJkKSA9PiBjYXJkLmNvbXBsZXRlZEF0KTtcblx0XHRcdGlmICghZmluaXNoZWQubGVuZ3RoKSByZXR1cm4gbnVsbDtcblx0XHRcdGNvbnN0IHRvdGFsID0gZmluaXNoZWQucmVkdWNlKFxuXHRcdFx0XHQoc3VtLCBjYXJkKSA9PiBzdW0gKyBNYXRoLm1heCgwLCAoY2FyZC5jb21wbGV0ZWRBdCEgLSBjYXJkLmNyZWF0ZWRBdCkpLFxuXHRcdFx0XHQwLFxuXHRcdFx0KTtcblx0XHRcdHJldHVybiB0b3RhbCAvIGZpbmlzaGVkLmxlbmd0aDtcblx0XHR9KSgpO1xuXG5cdFx0Y29uc3QgZGFpbHlDcmVhdGVkID0gdGhpcy5idWlsZERhaWx5U2VyaWVzKGNhcmRzLCBcImNyZWF0ZWRcIiwgcmFuZ2UpO1xuXHRcdGNvbnN0IGRhaWx5Q29tcGxldGVkID0gdGhpcy5idWlsZERhaWx5U2VyaWVzKGNhcmRzLCBcImNvbXBsZXRlZFwiLCByYW5nZSk7XG5cdFx0Y29uc3QgZGFpbHlTZXJpZXM6IERhaWx5U3RhdHNQb2ludFtdID0gZGFpbHlDcmVhdGVkLm1hcCgocG9pbnQsIGluZGV4KSA9PiAoe1xuXHRcdFx0ZGF0ZTogcG9pbnQuZGF0ZSxcblx0XHRcdGNyZWF0ZWQ6IHBvaW50LnZhbHVlLFxuXHRcdFx0Y29tcGxldGVkOiBkYWlseUNvbXBsZXRlZFtpbmRleF0/LnZhbHVlID8/IDAsXG5cdFx0fSkpO1xuXHRcdGNvbnN0IGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W10gPSBkYWlseVNlcmllcy5tYXAoKHBvaW50KSA9PiAoe1xuXHRcdFx0ZGF0ZTogcG9pbnQuZGF0ZSxcblx0XHRcdHJhdGU6XG5cdFx0XHRcdHBvaW50LmNyZWF0ZWQgfHwgcG9pbnQuY29tcGxldGVkXG5cdFx0XHRcdFx0PyBNYXRoLm1pbigxMDAsIChwb2ludC5jb21wbGV0ZWQgLyBNYXRoLm1heChwb2ludC5jcmVhdGVkLCBwb2ludC5jb21wbGV0ZWQsIDEpKSAqIDEwMClcblx0XHRcdFx0XHQ6IDAsXG5cdFx0fSkpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRvdGFsVGFza3MsXG5cdFx0XHRjb21wbGV0ZWRUYXNrcyxcblx0XHRcdHdpcENvdW50LFxuXHRcdFx0Y29tcGxldGlvblJhdGUsXG5cdFx0XHRkZWFkbGluZUNvdW50OiBkZWFkbGluZUNhcmRzLmxlbmd0aCxcblx0XHRcdGRlYWRsaW5lQ292ZXJhZ2U6IHRvdGFsVGFza3MgPyBkZWFkbGluZUNhcmRzLmxlbmd0aCAvIHRvdGFsVGFza3MgOiAwLFxuXHRcdFx0b3ZlcmR1ZUNvdW50LFxuXHRcdFx0b3ZlcmR1ZVJhdGU6IGRlYWRsaW5lQ2FyZHMubGVuZ3RoID8gb3ZlcmR1ZUNvdW50IC8gZGVhZGxpbmVDYXJkcy5sZW5ndGggOiAwLFxuXHRcdFx0b25UaW1lUmF0ZTogZGVhZGxpbmVDYXJkcy5sZW5ndGggPyBvblRpbWVDb3VudCAvIGRlYWRsaW5lQ2FyZHMubGVuZ3RoIDogMCxcblx0XHRcdGF2Z0N5Y2xlVGltZU1zLFxuXHRcdFx0ZGFpbHlTZXJpZXMsXG5cdFx0XHRkYWlseVJhdGVzLFxuXHRcdH07XG5cdH1cblxuXHRwcml2YXRlIGJ1aWxkRGFpbHlTZXJpZXMoY2FyZHM6IEthbmJhbkNhcmRbXSwga2luZDogXCJjcmVhdGVkXCIgfCBcImNvbXBsZXRlZFwiLCByYW5nZTogU3RhdHNSYW5nZSkge1xuXHRcdGNvbnN0IG1zUGVyRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMucmVzb2x2ZVJhbmdlKHJhbmdlKTtcblx0XHRjb25zdCBkYXlzID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZCgoZW5kIC0gc3RhcnQpIC8gbXNQZXJEYXkpICsgMSk7XG5cdFx0Y29uc3QgYnVja2V0cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cdFx0bGV0IHByb2Nlc3NlZCA9IDA7XG5cdFx0bGV0IG91dE9mUmFuZ2UgPSAwO1xuXHRcdGxldCBtaXNzaW5nID0gMDtcblxuXHRcdGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuXHRcdFx0Y29uc3QgdGltZXN0YW1wID1cblx0XHRcdFx0a2luZCA9PT0gXCJjcmVhdGVkXCJcblx0XHRcdFx0XHQ/IGNhcmQuY3JlYXRlZEF0XG5cdFx0XHRcdFx0OiBjYXJkLmNvbXBsZXRlZEF0ID8/IChjYXJkLmNvbXBsZXRlZCA/IGNhcmQudXBkYXRlZEF0IDogbnVsbCk7XG5cdFx0XHRpZiAoIXRpbWVzdGFtcCkge1xuXHRcdFx0XHRtaXNzaW5nKys7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRpbWVzdGFtcCA8IHN0YXJ0IHx8IHRpbWVzdGFtcCA+IGVuZCkge1xuXHRcdFx0XHRvdXRPZlJhbmdlKys7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qga2V5ID0gdGhpcy50b0RheUtleSh0aW1lc3RhbXApO1xuXHRcdFx0YnVja2V0cy5zZXQoa2V5LCAoYnVja2V0cy5nZXQoa2V5KSA/PyAwKSArIDEpO1xuXHRcdFx0cHJvY2Vzc2VkKys7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2VyaWVzOiBEYWlseUNvdW50UG9pbnRbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZGF5czsgaSsrKSB7XG5cdFx0XHRjb25zdCBkYXlUcyA9IHN0YXJ0ICsgaSAqIG1zUGVyRGF5O1xuXHRcdFx0Y29uc3Qga2V5ID0gdGhpcy50b0RheUtleShkYXlUcyk7XG5cdFx0XHRzZXJpZXMucHVzaCh7IGRhdGU6IGtleSwgdmFsdWU6IGJ1Y2tldHMuZ2V0KGtleSkgPz8gMCB9KTtcblx0XHR9XG5cdFx0Y29uc3QgbGFiZWwgPSBraW5kID09PSBcImNyZWF0ZWRcIiA/IFwiQ3JlYXRlZFwiIDogXCJDb21wbGV0ZWRcIjtcblx0XHRjb25zb2xlLmxvZyhgW1NpbXBsZUthbmJhbl1bU3RhdHNdICR7bGFiZWx9IHNlcmllcyBzdGF0c2AsIHtcblx0XHRcdHJhbmdlU3RhcnQ6IG5ldyBEYXRlKHN0YXJ0KS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKSxcblx0XHRcdHJhbmdlRW5kOiBuZXcgRGF0ZShlbmQpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApLFxuXHRcdFx0cG9pbnRzOiBzZXJpZXMubGVuZ3RoLFxuXHRcdFx0cHJvY2Vzc2VkLFxuXHRcdFx0b3V0T2ZSYW5nZSxcblx0XHRcdG1pc3NpbmcsXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHNlcmllcztcblx0fVxuXG5cdHByaXZhdGUgcmVzb2x2ZVJhbmdlKHJhbmdlOiBTdGF0c1JhbmdlKTogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9IHtcblx0XHRpZiAocmFuZ2UudHlwZSA9PT0gXCJjdXN0b21cIikge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c3RhcnQ6IHRoaXMuc3RhcnRPZkRheShyYW5nZS5zdGFydCksXG5cdFx0XHRcdGVuZDogdGhpcy5zdGFydE9mRGF5KHJhbmdlLmVuZCksXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRjb25zdCBtc1BlckRheSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cdFx0Y29uc3QgZW5kID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdGNvbnN0IHN0YXJ0ID0gZW5kIC0gKHJhbmdlLmRheXMgLSAxKSAqIG1zUGVyRGF5O1xuXHRcdHJldHVybiB7IHN0YXJ0LCBlbmQgfTtcblx0fVxuXG5cdHByaXZhdGUgdG9EYXlLZXkodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRcdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdFx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdFx0Y29uc3QgZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRcdHJldHVybiBgJHt5fS0ke219LSR7ZH1gO1xuXHR9XG5cblx0cHJpdmF0ZSBzdGFydE9mRGF5KHRpbWVzdGFtcDogbnVtYmVyKTogbnVtYmVyIHtcblx0XHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0XHRkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuXHRcdHJldHVybiBkYXRlLmdldFRpbWUoKTtcblx0fVxuXG5cdHByaXZhdGUgcmVzb2x2ZVRpbWVsaW5lUmFuZ2UoKTogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9IHtcblx0XHRpZiAodGhpcy50aW1lbGluZVByZXNldCA9PT0gXCJjdXN0b21cIiAmJiB0aGlzLnRpbWVsaW5lQ3VzdG9tKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50aW1lbGluZUN1c3RvbTtcblx0XHR9XG5cdFx0aWYgKHRoaXMudGltZWxpbmVQcmVzZXQgPT09IFwieWVzdGVyZGF5XCIpIHtcblx0XHRcdGNvbnN0IHRvZGF5ID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdFx0Y29uc3QgeWVzdGVyZGF5ID0gdG9kYXkgLSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdFx0cmV0dXJuIHsgc3RhcnQ6IHllc3RlcmRheSwgZW5kOiB5ZXN0ZXJkYXkgfTtcblx0XHR9XG5cdFx0Y29uc3QgdG9kYXkgPSB0aGlzLnN0YXJ0T2ZEYXkoRGF0ZS5ub3coKSk7XG5cdFx0cmV0dXJuIHsgc3RhcnQ6IHRvZGF5LCBlbmQ6IHRvZGF5IH07XG5cdH1cblxuXHRwcml2YXRlIGJ1aWxkVGltZWxpbmVFbnRyaWVzKHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKTogVGltZWxpbmVFbnRyeVtdIHtcblx0XHRjb25zdCBib2FyZCA9IHRoaXMucGx1Z2luLmdldEJvYXJkKCk7XG5cdFx0Y29uc3QgZW50cmllczogVGltZWxpbmVFbnRyeVtdID0gW107XG5cdFx0Y29uc3Qgc3RhcnRUcyA9IHRoaXMuc3RhcnRPZkRheShzdGFydCk7XG5cdFx0Y29uc3QgZW5kVHMgPSB0aGlzLnN0YXJ0T2ZEYXkoZW5kKSArIDI0ICogNjAgKiA2MCAqIDEwMDAgLSAxO1xuXHRcdGZvciAoY29uc3QgY29sdW1uIG9mIGJvYXJkLmNvbHVtbnMpIHtcblx0XHRcdGZvciAoY29uc3QgY2FyZCBvZiBjb2x1bW4uY2FyZHMpIHtcblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGNhcmQuaGlzdG9yeSkpIGNvbnRpbnVlO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGl0ZW0gb2YgY2FyZC5oaXN0b3J5KSB7XG5cdFx0XHRcdFx0aWYgKCFpdGVtLnRpbWVzdGFtcCkgY29udGludWU7XG5cdFx0XHRcdFx0aWYgKGl0ZW0udGltZXN0YW1wIDwgc3RhcnRUcyB8fCBpdGVtLnRpbWVzdGFtcCA+IGVuZFRzKSBjb250aW51ZTtcblx0XHRcdFx0XHRlbnRyaWVzLnB1c2goe1xuXHRcdFx0XHRcdFx0Y2FyZElkOiBjYXJkLmlkLFxuXHRcdFx0XHRcdFx0Y2FyZFRpdGxlOiBjYXJkLnRpdGxlLFxuXHRcdFx0XHRcdFx0Y29sdW1uTmFtZTogY29sdW1uLm5hbWUsXG5cdFx0XHRcdFx0XHR0aW1lc3RhbXA6IGl0ZW0udGltZXN0YW1wLFxuXHRcdFx0XHRcdFx0dGV4dDogaXRlbS5yZW1hcmsgfHwgXCJcdTY2RjRcdTY1QjBcIixcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZW50cmllcy5zb3J0KChhLCBiKSA9PiBhLnRpbWVzdGFtcCAtIGIudGltZXN0YW1wKTtcblx0fVxufVxuXG5jbGFzcyBDYXJkTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHByaXZhdGUgdGl0bGVWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgdGFnc1ZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSByZW1hcmtWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgaGlzdG9yeU5vdGUgPSBcIlwiO1xuXHRwcml2YXRlIGRlYWRsaW5lVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIHN1Ym1pdHRpbmcgPSBmYWxzZTtcblx0cHJpdmF0ZSBrZXlIYW5kbGVyID0gKGV2dDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuXHRcdGlmIChcblx0XHRcdGV2dC5rZXkgPT09IFwiRW50ZXJcIiAmJlxuXHRcdFx0IWV2dC5zaGlmdEtleSAmJlxuXHRcdFx0IWV2dC5tZXRhS2V5ICYmXG5cdFx0XHQhZXZ0LmN0cmxLZXkgJiZcblx0XHRcdCFldnQuYWx0S2V5ICYmXG5cdFx0XHQhZXZ0LmlzQ29tcG9zaW5nXG5cdFx0KSB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHZvaWQgdGhpcy5oYW5kbGVTdWJtaXQoKTtcblx0XHR9XG5cdH07XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0cHJpdmF0ZSBwbHVnaW46IFNpbXBsZUthbmJhblBsdWdpbixcblx0XHRwcml2YXRlIGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSBjYXJkPzogS2FuYmFuQ2FyZCxcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHR0aGlzLnBsdWdpbi5zZXRBY3RpdmVDb2x1bW4oY29sdW1uSWQpO1xuXHRcdGlmIChjYXJkKSB7XG5cdFx0XHR0aGlzLnRpdGxlVmFsdWUgPSBjYXJkLnRpdGxlO1xuXHRcdFx0dGhpcy50YWdzVmFsdWUgPSBjYXJkLnRhZ3Muam9pbihcIiwgXCIpO1xuXHRcdFx0dGhpcy5yZW1hcmtWYWx1ZSA9IGNhcmQucmVtYXJrO1xuXHRcdFx0dGhpcy5kZWFkbGluZVZhbHVlID0gZm9ybWF0RGF0ZVRpbWVJbnB1dChjYXJkLmRlYWRsaW5lKTtcblx0XHR9XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKFwic2stbW9kYWxcIik7XG5cdFx0Y29udGVudEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5SGFuZGxlcik7XG5cblx0XHRjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMuY2FyZCA/IFwiXHU3RjE2XHU4RjkxXHU1MzYxXHU3MjQ3XCIgOiBcIlx1NjVCMFx1NTg5RVx1NTM2MVx1NzI0N1wiIH0pO1xuXG5cdFx0dGhpcy50aXRsZVZhbHVlID0gdGhpcy50aXRsZVZhbHVlIHx8IFwiXCI7XG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MDdcdTk4OThcIiwgdGhpcy50aXRsZVZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMudGl0bGVWYWx1ZSA9IHZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MDdcdTdCN0VcdUZGMDhcdTkwMTdcdTUzRjdcdTUyMDZcdTk2OTRcdUZGMDlcIiwgdGhpcy50YWdzVmFsdWUsICh2YWx1ZSkgPT4ge1xuXHRcdFx0dGhpcy50YWdzVmFsdWUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdFx0Y3JlYXRlVGV4dEFyZWEoY29udGVudEVsLCBcIlx1NTkwN1x1NkNFOFwiLCB0aGlzLnJlbWFya1ZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdFx0dGhpcy5yZW1hcmtWYWx1ZSA9IHZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRcdGNyZWF0ZURhdGVUaW1lRmllbGQoY29udGVudEVsLCBcIlx1NjIyQVx1NkI2Mlx1NjVGNlx1OTVGNFwiLCB0aGlzLmRlYWRsaW5lVmFsdWUsICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLmRlYWRsaW5lVmFsdWUgPSB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEFyZWEoY29udGVudEVsLCBcIlx1NEZFRVx1NjUzOVx1OEJGNFx1NjYwRVx1RkYwOFx1NTE5OVx1NTE2NVx1NTM4Nlx1NTNGMlx1RkYwOVwiLCBcIlwiLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMuaGlzdG9yeU5vdGUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGZvb3RlciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stbW9kYWwtZm9vdGVyXCIgfSk7XG5cdFx0Y29uc3QgY2FuY2VsQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTUzRDZcdTZEODhcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3RcIiB9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG5cblx0XHRjb25zdCBzdWJtaXRCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogdGhpcy5jYXJkID8gXCJcdTRGRERcdTVCNThcIiA6IFwiXHU1MjFCXHU1RUZBXCIsXG5cdFx0XHRjbHM6IFwic2stYnRuXCIsXG5cdFx0fSk7XG5cdFx0c3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB2b2lkIHRoaXMuaGFuZGxlU3VibWl0KCkpO1xuXHR9XG5cblx0b25DbG9zZSgpIHtcblx0XHR0aGlzLmNvbnRlbnRFbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleUhhbmRsZXIpO1xuXHRcdHN1cGVyLm9uQ2xvc2UoKTtcblx0fVxuXG5cdGFzeW5jIGhhbmRsZVN1Ym1pdCgpIHtcblx0XHRpZiAodGhpcy5zdWJtaXR0aW5nKSByZXR1cm47XG5cdFx0aWYgKCF0aGlzLnRpdGxlVmFsdWUudHJpbSgpKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODA3XHU5ODk4XHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCB0YWdzID0gcGFyc2VUYWdzKHRoaXMudGFnc1ZhbHVlKTtcblx0XHRjb25zdCByZW1hcmsgPSB0aGlzLnJlbWFya1ZhbHVlLnRyaW0oKTtcblx0XHRjb25zdCBkZWFkbGluZSA9IHBhcnNlRGF0ZVRpbWVJbnB1dCh0aGlzLmRlYWRsaW5lVmFsdWUpO1xuXHRcdHRoaXMuc3VibWl0dGluZyA9IHRydWU7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmNhcmQpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4udXBkYXRlQ2FyZChcblx0XHRcdFx0XHR0aGlzLmNvbHVtbklkLFxuXHRcdFx0XHRcdHRoaXMuY2FyZC5pZCxcblx0XHRcdFx0XHR7IHRpdGxlOiB0aGlzLnRpdGxlVmFsdWUsIHRhZ3MsIHJlbWFyaywgZGVhZGxpbmUgfSxcblx0XHRcdFx0XHR0aGlzLmhpc3RvcnlOb3RlLnRyaW0oKSB8fCBcIlx1NTE4NVx1NUJCOVx1NjZGNFx1NjVCMFwiLFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uYWRkQ2FyZCh0aGlzLmNvbHVtbklkLCB7XG5cdFx0XHRcdFx0dGl0bGU6IHRoaXMudGl0bGVWYWx1ZSxcblx0XHRcdFx0XHR0YWdzLFxuXHRcdFx0XHRcdHJlbWFyayxcblx0XHRcdFx0XHRoaXN0b3J5Tm90ZTogdGhpcy5oaXN0b3J5Tm90ZS50cmltKCkgfHwgXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdFx0XHRkZWFkbGluZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJbU2ltcGxlS2FuYmFuXVtDYXJkTW9kYWxdIHN1Ym1pdCBmYWlsZWRcIiwgZXJyb3IpO1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NEZERFx1NUI1OFx1NTkzMVx1OEQyNVx1RkYwQ1x1OEJGN1x1OTFDRFx1OEJENVwiKTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0dGhpcy5zdWJtaXR0aW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG59XG5cbmludGVyZmFjZSBDb2x1bW5Nb2RhbE9wdGlvbnMge1xuXHR0aXRsZTogc3RyaW5nO1xuXHRpbml0aWFsVmFsdWU/OiBzdHJpbmc7XG5cdGNvbmZpcm1UZXh0Pzogc3RyaW5nO1xuXHRvblN1Ym1pdDogKHZhbHVlOiBzdHJpbmcpID0+IFByb21pc2U8dm9pZD47XG59XG5cbmNsYXNzIENvbHVtbk1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwcml2YXRlIHZhbHVlOiBzdHJpbmc7XG5cblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb3B0aW9uczogQ29sdW1uTW9kYWxPcHRpb25zKSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHR0aGlzLnZhbHVlID0gb3B0aW9ucy5pbml0aWFsVmFsdWUgPz8gXCJcIjtcblx0fVxuXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHRjb250ZW50RWwuYWRkQ2xhc3MoXCJzay1tb2RhbFwiKTtcblx0XHRjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMub3B0aW9ucy50aXRsZSB9KTtcblxuXHRcdGNyZWF0ZVRleHRGaWVsZChjb250ZW50RWwsIFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXCIsIHRoaXMudmFsdWUsICh2YWx1ZSkgPT4gKHRoaXMudmFsdWUgPSB2YWx1ZSkpO1xuXG5cdFx0Y29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1tb2RhbC1mb290ZXJcIiB9KTtcblx0XHRjb25zdCBjYW5jZWxCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1NTNENlx1NkQ4OFwiLCBjbHM6IFwic2stYnRuIHNrLWJ0bi1naG9zdFwiIH0pO1xuXHRcdGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcblxuXHRcdGNvbnN0IGNvbmZpcm1CdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogdGhpcy5vcHRpb25zLmNvbmZpcm1UZXh0IHx8IFwiXHU3ODZFXHU4QkE0XCIsXG5cdFx0XHRjbHM6IFwic2stYnRuXCIsXG5cdFx0fSk7XG5cdFx0Y29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuXHRcdFx0YXdhaXQgdGhpcy5vcHRpb25zLm9uU3VibWl0KHRoaXMudmFsdWUpO1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9XG59XG5cbmludGVyZmFjZSBDb25maXJtTW9kYWxPcHRpb25zIHtcblx0dGl0bGU6IHN0cmluZztcblx0bWVzc2FnZTogc3RyaW5nO1xuXHRjb25maXJtVGV4dD86IHN0cmluZztcblx0Y2FuY2VsVGV4dD86IHN0cmluZztcblx0b25Db25maXJtOiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcbn1cblxuY2xhc3MgQ29uZmlybU1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvcHRpb25zOiBDb25maXJtTW9kYWxPcHRpb25zKSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0fVxuXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHRjb250ZW50RWwuYWRkQ2xhc3MoXCJzay1tb2RhbFwiKTtcblx0XHRjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMub3B0aW9ucy50aXRsZSB9KTtcblx0XHRjb250ZW50RWwuY3JlYXRlRGl2KHsgdGV4dDogdGhpcy5vcHRpb25zLm1lc3NhZ2UsIGNsczogXCJzay1jb25maXJtLXRleHRcIiB9KTtcblxuXHRcdGNvbnN0IGZvb3RlciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stbW9kYWwtZm9vdGVyXCIgfSk7XG5cdFx0Y29uc3QgY2FuY2VsQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMub3B0aW9ucy5jYW5jZWxUZXh0IHx8IFwiXHU1M0Q2XHU2RDg4XCIsXG5cdFx0XHRjbHM6IFwic2stYnRuIHNrLWJ0bi1naG9zdFwiLFxuXHRcdH0pO1xuXHRcdGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcblxuXHRcdGNvbnN0IGNvbmZpcm1CdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogdGhpcy5vcHRpb25zLmNvbmZpcm1UZXh0IHx8IFwiXHU3ODZFXHU4QkE0XCIsXG5cdFx0XHRjbHM6IFwic2stYnRuXCIsXG5cdFx0fSk7XG5cdFx0Y29uZmlybUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuXHRcdFx0YXdhaXQgdGhpcy5vcHRpb25zLm9uQ29uZmlybSgpO1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGFncyhpbnB1dDogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRyZXR1cm4gaW5wdXRcblx0XHQuc3BsaXQoXCIsXCIpXG5cdFx0Lm1hcCgodGFnKSA9PiB0YWcudHJpbSgpKVxuXHRcdC5maWx0ZXIoKHRhZykgPT4gISF0YWcpO1xufVxuXG5mdW5jdGlvbiBwYXJzZURhdGVUaW1lSW5wdXQodmFsdWU6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuXHRpZiAoIXZhbHVlLnRyaW0oKSkgcmV0dXJuIG51bGw7XG5cdGNvbnN0IHBhcnNlZCA9IERhdGUucGFyc2UodmFsdWUpO1xuXHRyZXR1cm4gTnVtYmVyLmlzTmFOKHBhcnNlZCkgPyBudWxsIDogcGFyc2VkO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlVGltZUlucHV0KHZhbHVlPzogbnVtYmVyIHwgbnVsbCk6IHN0cmluZyB7XG5cdGlmICghdmFsdWUpIHJldHVybiBcIlwiO1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpO1xuXHRjb25zdCB5eXl5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXHRjb25zdCBtbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGRkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGhoID0gU3RyaW5nKGRhdGUuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBtaW4gPSBTdHJpbmcoZGF0ZS5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke3l5eXl9LSR7bW19LSR7ZGR9VCR7aGh9OiR7bWlufWA7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUlkKCkge1xuXHRyZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMikgKyBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZSh0aW1lc3RhbXA6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRjb25zdCB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXHRjb25zdCBtID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBoaCA9IFN0cmluZyhkYXRlLmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgbW0gPSBTdHJpbmcoZGF0ZS5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke3l9LSR7bX0tJHtkfSAke2hofToke21tfWA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFRpbWUodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgaGggPSBTdHJpbmcoZGF0ZS5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IG1tID0gU3RyaW5nKGRhdGUuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHtoaH06JHttbX1gO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlT25seSh0aW1lc3RhbXA6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRjb25zdCB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXHRjb25zdCBtID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UGVyY2VudCh2YWx1ZTogbnVtYmVyLCBkaWdpdHMgPSAwKTogc3RyaW5nIHtcblx0aWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gXCIwJVwiO1xuXHRyZXR1cm4gYCR7KE1hdGgubWF4KDAsIHZhbHVlKSAqIDEwMCkudG9GaXhlZChkaWdpdHMpfSVgO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQZXJjZW50VmFsdWUodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG5cdGlmICghTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIDA7XG5cdHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHZhbHVlICogMTAwKSk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdER1cmF0aW9uKG1zOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihtcyAvIDYwMDAwKTtcblx0Y29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XG5cdGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKGhvdXJzIC8gMjQpO1xuXHRpZiAoZGF5cyA+IDApIHtcblx0XHRjb25zdCByZW1Ib3VycyA9IGhvdXJzICUgMjQ7XG5cdFx0cmV0dXJuIHJlbUhvdXJzID8gYCR7ZGF5c31cdTU5Mjkke3JlbUhvdXJzfVx1NUMwRlx1NjVGNmAgOiBgJHtkYXlzfVx1NTkyOWA7XG5cdH1cblx0aWYgKGhvdXJzID4gMCkge1xuXHRcdGNvbnN0IHJlbU1pbnV0ZXMgPSBtaW51dGVzICUgNjA7XG5cdFx0cmV0dXJuIHJlbU1pbnV0ZXMgPyBgJHtob3Vyc31cdTVDMEZcdTY1RjYke3JlbU1pbnV0ZXN9XHU1MjA2YCA6IGAke2hvdXJzfVx1NUMwRlx1NjVGNmA7XG5cdH1cblx0cmV0dXJuIGAke01hdGgubWF4KG1pbnV0ZXMsIDEpfVx1NTIwNmA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVJbnB1dFZhbHVlKHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5fS0ke219LSR7ZH1gO1xufVxuXG5jb25zdCBTVkdfTlMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7XG5cbmZ1bmN0aW9uIGNyZWF0ZVN2Z0VsZW1lbnQ8VCBleHRlbmRzIGtleW9mIFNWR0VsZW1lbnRUYWdOYW1lTWFwPih0YWc6IFQpOiBTVkdFbGVtZW50VGFnTmFtZU1hcFtUXSB7XG5cdHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoU1ZHX05TLCB0YWcpO1xufVxuXG5mdW5jdGlvbiBzZXRTdmdBdHRycyhlbDogRWxlbWVudCwgYXR0cnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pIHtcblx0T2JqZWN0LmVudHJpZXMoYXR0cnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4gZWwuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dEZpZWxkKFxuXHRjb250YWluZXI6IEhUTUxFbGVtZW50LFxuXHRsYWJlbDogc3RyaW5nLFxuXHR2YWx1ZTogc3RyaW5nLFxuXHRvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQsXG4pIHtcblx0Y29uc3Qgd3JhcHBlciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZmllbGRcIiB9KTtcblx0d3JhcHBlci5jcmVhdGVFbChcImxhYmVsXCIsIHsgdGV4dDogbGFiZWwgfSk7XG5cdGNvbnN0IGlucHV0ID0gd3JhcHBlci5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIgfSk7XG5cdGlucHV0LnZhbHVlID0gdmFsdWU7XG5cdGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZ0KSA9PiBvbkNoYW5nZSgoZXZ0LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVEYXRlVGltZUZpZWxkKFxuXHRjb250YWluZXI6IEhUTUxFbGVtZW50LFxuXHRsYWJlbDogc3RyaW5nLFxuXHR2YWx1ZTogc3RyaW5nLFxuXHRvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQsXG4pIHtcblx0Y29uc3Qgd3JhcHBlciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZmllbGRcIiB9KTtcblx0d3JhcHBlci5jcmVhdGVFbChcImxhYmVsXCIsIHsgdGV4dDogbGFiZWwgfSk7XG5cdGNvbnN0IGlucHV0ID0gd3JhcHBlci5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJkYXRldGltZS1sb2NhbFwiIH0pO1xuXHRpbnB1dC52YWx1ZSA9IHZhbHVlO1xuXHRpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2dCkgPT4gb25DaGFuZ2UoKGV2dC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dEFyZWEoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgdGV4dGFyZWEgPSB3cmFwcGVyLmNyZWF0ZUVsKFwidGV4dGFyZWFcIik7XG5cdHRleHRhcmVhLnZhbHVlID0gdmFsdWU7XG5cdHRleHRhcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZ0KSA9PiBvbkNoYW5nZSgoZXZ0LnRhcmdldCBhcyBIVE1MVGV4dEFyZWFFbGVtZW50KS52YWx1ZSkpO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQTZFO0FBRTdFLElBQU0sWUFBWTtBQUNsQixJQUFNLFVBQVU7QUEyRWhCLElBQU0sa0JBQWtCLENBQUMsc0JBQU8sc0JBQU8sb0JBQUs7QUFHNUMsU0FBUyxxQkFBc0M7QUFDOUMsU0FBTztBQUFBLElBQ04sU0FBUyxnQkFBZ0IsSUFBSSxDQUFDLFVBQVU7QUFBQSxNQUN2QyxJ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
