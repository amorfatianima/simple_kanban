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
    const body = container.createDiv({ cls: "sk-tab-panel" });
    if (this.activeTab === "board") {
      this.renderBoard(body);
    } else {
      this.renderStats(body);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgSXRlbVZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5jb25zdCBWSUVXX1RZUEUgPSBcInNpbXBsZS1rYW5iYW4tc2lkZWJhci12aWV3XCI7XG5jb25zdCBJQ09OX0lEID0gXCJsYXlvdXQta2FuYmFuXCI7XG5cbmludGVyZmFjZSBLYW5iYW5IaXN0b3J5RW50cnkge1xuXHR0aW1lc3RhbXA6IG51bWJlcjtcblx0cmVtYXJrOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBLYW5iYW5DYXJkIHtcblx0aWQ6IHN0cmluZztcblx0dGl0bGU6IHN0cmluZztcblx0dGFnczogc3RyaW5nW107XG5cdHJlbWFyazogc3RyaW5nO1xuXHRkZWFkbGluZT86IG51bWJlciB8IG51bGw7XG5cdGNvbXBsZXRlZDogYm9vbGVhbjtcblx0Y29tcGxldGVkQXQ/OiBudW1iZXIgfCBudWxsO1xuXHRjcmVhdGVkQXQ6IG51bWJlcjtcblx0dXBkYXRlZEF0OiBudW1iZXI7XG5cdGhpc3Rvcnk6IEthbmJhbkhpc3RvcnlFbnRyeVtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQ29sdW1uIHtcblx0aWQ6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHRjYXJkczogS2FuYmFuQ2FyZFtdO1xufVxuXG5pbnRlcmZhY2UgS2FuYmFuQm9hcmREYXRhIHtcblx0Y29sdW1uczogS2FuYmFuQ29sdW1uW107XG59XG5cbmludGVyZmFjZSBEYWlseUNvdW50UG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdHZhbHVlOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVN0YXRzUG9pbnQge1xuXHRkYXRlOiBzdHJpbmc7XG5cdGNyZWF0ZWQ6IG51bWJlcjtcblx0Y29tcGxldGVkOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBEYWlseVJhdGVQb2ludCB7XG5cdGRhdGU6IHN0cmluZztcblx0cmF0ZTogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgU3RhdHNTbmFwc2hvdCB7XG5cdHRvdGFsVGFza3M6IG51bWJlcjtcblx0Y29tcGxldGVkVGFza3M6IG51bWJlcjtcblx0d2lwQ291bnQ6IG51bWJlcjtcblx0Y29tcGxldGlvblJhdGU6IG51bWJlcjtcblx0ZGVhZGxpbmVDb3VudDogbnVtYmVyO1xuXHRkZWFkbGluZUNvdmVyYWdlOiBudW1iZXI7XG5cdG92ZXJkdWVDb3VudDogbnVtYmVyO1xuXHRvdmVyZHVlUmF0ZTogbnVtYmVyO1xuXHRvblRpbWVSYXRlOiBudW1iZXI7XG5cdGF2Z0N5Y2xlVGltZU1zOiBudW1iZXIgfCBudWxsO1xuXHRkYWlseVNlcmllczogRGFpbHlTdGF0c1BvaW50W107XG5cdGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W107XG59XG5cbnR5cGUgU3RhdHNSYW5nZSA9XG5cdHwgeyB0eXBlOiBcInByZXNldFwiOyBkYXlzOiBudW1iZXIgfVxuXHR8IHsgdHlwZTogXCJjdXN0b21cIjsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfTtcblxuY29uc3QgREVGQVVMVF9DT0xVTU5TID0gW1wiXHU1Rjg1XHU1OTA0XHU3NDA2XCIsIFwiXHU4RkRCXHU4ODRDXHU0RTJEXCIsIFwiXHU1REYyXHU1QjhDXHU2MjEwXCJdO1xudHlwZSBOdWxsYWJsZVRpbWVvdXQgPSBudW1iZXIgfCBudWxsO1xuXG5mdW5jdGlvbiBjcmVhdGVEZWZhdWx0Qm9hcmQoKTogS2FuYmFuQm9hcmREYXRhIHtcblx0cmV0dXJuIHtcblx0XHRjb2x1bW5zOiBERUZBVUxUX0NPTFVNTlMubWFwKChuYW1lKSA9PiAoe1xuXHRcdFx0aWQ6IGNyZWF0ZUlkKCksXG5cdFx0XHRuYW1lLFxuXHRcdFx0Y2FyZHM6IFtdLFxuXHRcdH0pKSxcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltcGxlS2FuYmFuUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcblx0cHJpdmF0ZSBib2FyZDogS2FuYmFuQm9hcmREYXRhID0gY3JlYXRlRGVmYXVsdEJvYXJkKCk7XG5cdHByaXZhdGUgdmlld3MgPSBuZXcgU2V0PEthbmJhblZpZXc+KCk7XG5cdHByaXZhdGUgbGFzdENvbHVtbklkPzogc3RyaW5nO1xuXG5cdGFzeW5jIG9ubG9hZCgpIHtcblx0XHRhd2FpdCB0aGlzLmxvYWRCb2FyZCgpO1xuXG5cdFx0dGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFLCAobGVhZikgPT4ge1xuXHRcdFx0Y29uc3QgdmlldyA9IG5ldyBLYW5iYW5WaWV3KGxlYWYsIHRoaXMpO1xuXHRcdFx0dGhpcy5yZWdpc3RlckthbmJhblZpZXcodmlldyk7XG5cdFx0XHRyZXR1cm4gdmlldztcblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkUmliYm9uSWNvbihJQ09OX0lELCBcIlx1NjI1M1x1NUYwMFx1NTNGM1x1NEZBN1x1NzcwQlx1Njc3RlwiLCAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpKTtcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6IFwic2ltcGxlLWthbmJhbi1vcGVuXCIsXG5cdFx0XHRuYW1lOiBcIlx1NjI1M1x1NUYwMFx1NTNGM1x1NEZBN1x1NzcwQlx1Njc3RlwiLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcInNpbXBsZS1rYW5iYW4tYWRkLWNhcmRcIixcblx0XHRcdG5hbWU6IFwiXHU2REZCXHU1MkEwXHU1MzYxXHU3MjQ3XCIsXG5cdFx0XHRob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIk1vZFwiLCBcIlNoaWZ0XCJdLCBrZXk6IFwiTlwiIH1dLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMub3BlblF1aWNrQWRkQ2FyZCgpLFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdH1cblxuXHRvbnVubG9hZCgpIHtcblx0XHR0aGlzLnZpZXdzLmNsZWFyKCk7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRCb2FyZCgpIHtcblx0XHRjb25zdCBzdG9yZWQgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCk7XG5cdFx0aWYgKHN0b3JlZCAmJiBzdG9yZWQuY29sdW1ucykge1xuXHRcdFx0dGhpcy5ib2FyZCA9IHN0b3JlZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5ib2FyZCA9IGNyZWF0ZURlZmF1bHRCb2FyZCgpO1xuXHRcdH1cblx0XHR0aGlzLm5vcm1hbGl6ZUJvYXJkKCk7XG5cdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSB0aGlzLmJvYXJkLmNvbHVtbnNbMF0/LmlkO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBwZXJzaXN0KCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5ib2FyZCk7XG5cdFx0dGhpcy5ub3RpZnlWaWV3cygpO1xuXHR9XG5cblx0cmVnaXN0ZXJLYW5iYW5WaWV3KHZpZXc6IEthbmJhblZpZXcpIHtcblx0XHR0aGlzLnZpZXdzLmFkZCh2aWV3KTtcblx0XHR2aWV3LnJlZ2lzdGVyKCgpID0+IHRoaXMudmlld3MuZGVsZXRlKHZpZXcpKTtcblx0fVxuXG5cdG5vdGlmeVZpZXdzKCkge1xuXHRcdHRoaXMudmlld3MuZm9yRWFjaCgodmlldykgPT4gdmlldy5yZW5kZXIoKSk7XG5cdH1cblxuXHRnZXRCb2FyZCgpOiBLYW5iYW5Cb2FyZERhdGEge1xuXHRcdHJldHVybiB0aGlzLmJvYXJkO1xuXHR9XG5cblx0YXN5bmMgYWRkQ29sdW1uKG5hbWU6IHN0cmluZykge1xuXHRcdGlmICghbmFtZS50cmltKCkpIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdTY4MEZcdTc2RUVcdTU0MERcdTc5RjBcdTRFMERcdTgwRkRcdTRFM0FcdTdBN0FcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGNvbHVtbiA9IHsgaWQ6IGNyZWF0ZUlkKCksIG5hbWU6IG5hbWUudHJpbSgpLCBjYXJkczogW10gYXMgS2FuYmFuQ2FyZFtdIH07XG5cdFx0dGhpcy5ib2FyZC5jb2x1bW5zLnB1c2goY29sdW1uKTtcblx0XHRpZiAoIXRoaXMubGFzdENvbHVtbklkKSB7XG5cdFx0XHR0aGlzLmxhc3RDb2x1bW5JZCA9IGNvbHVtbi5pZDtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyByZW1vdmVDb2x1bW4oY29sdW1uSWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5ib2FyZC5jb2x1bW5zLmZpbmRJbmRleCgoY29sKSA9PiBjb2wuaWQgPT09IGNvbHVtbklkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2NzJBXHU2MjdFXHU1MjMwXHU2MzA3XHU1QjlBXHU2ODBGXHU3NkVFXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLmJvYXJkLmNvbHVtbnMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRpZiAodGhpcy5sYXN0Q29sdW1uSWQgPT09IGNvbHVtbklkKSB7XG5cdFx0XHR0aGlzLmxhc3RDb2x1bW5JZCA9IHRoaXMuYm9hcmQuY29sdW1uc1swXT8uaWQ7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgcmVuYW1lQ29sdW1uKGNvbHVtbklkOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBuZXh0TmFtZSA9IG5hbWUudHJpbSgpO1xuXHRcdGlmICghbmV4dE5hbWUpIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdTY4MEZcdTc2RUVcdTU0MERcdTc5RjBcdTRFMERcdTgwRkRcdTRFM0FcdTdBN0FcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbHVtbi5uYW1lID0gbmV4dE5hbWU7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyBhZGRDYXJkKFxuXHRcdGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0cGF5bG9hZDoge1xuXHRcdFx0dGl0bGU6IHN0cmluZztcblx0XHRcdHRhZ3M6IHN0cmluZ1tdO1xuXHRcdFx0cmVtYXJrOiBzdHJpbmc7XG5cdFx0XHRoaXN0b3J5Tm90ZTogc3RyaW5nO1xuXHRcdFx0ZGVhZGxpbmU/OiBudW1iZXIgfCBudWxsO1xuXHRcdH0sXG5cdCkge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXHRcdGNvbnN0IGNhcmQ6IEthbmJhbkNhcmQgPSB7XG5cdFx0XHRpZDogY3JlYXRlSWQoKSxcblx0XHRcdHRpdGxlOiBwYXlsb2FkLnRpdGxlLnRyaW0oKSxcblx0XHRcdHRhZ3M6IHBheWxvYWQudGFncyxcblx0XHRcdHJlbWFyazogcGF5bG9hZC5yZW1hcmssXG5cdFx0XHRkZWFkbGluZTogcGF5bG9hZC5kZWFkbGluZSA/PyBudWxsLFxuXHRcdFx0Y29tcGxldGVkOiBmYWxzZSxcblx0XHRcdGNvbXBsZXRlZEF0OiBudWxsLFxuXHRcdFx0Y3JlYXRlZEF0OiBub3csXG5cdFx0XHR1cGRhdGVkQXQ6IG5vdyxcblx0XHRcdGhpc3Rvcnk6IFtdLFxuXHRcdH07XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIHBheWxvYWQuaGlzdG9yeU5vdGUgfHwgXCJcdTUyMUJcdTVFRkFcIik7XG5cdFx0Y29sdW1uLmNhcmRzLnVuc2hpZnQoY2FyZCk7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyB1cGRhdGVDYXJkKFxuXHRcdGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0Y2FyZElkOiBzdHJpbmcsXG5cdFx0dXBkYXRlczogUGFydGlhbDxQaWNrPEthbmJhbkNhcmQsIFwidGl0bGVcIiB8IFwidGFnc1wiIHwgXCJyZW1hcmtcIiB8IFwiZGVhZGxpbmVcIj4+LFxuXHRcdGhpc3RvcnlOb3RlPzogc3RyaW5nLFxuXHQpIHtcblx0XHRjb25zdCBjYXJkID0gdGhpcy5nZXRDYXJkKGNvbHVtbklkLCBjYXJkSWQpO1xuXHRcdGlmICghY2FyZCkgcmV0dXJuO1xuXHRcdGlmICh1cGRhdGVzLnRpdGxlICE9PSB1bmRlZmluZWQpIGNhcmQudGl0bGUgPSB1cGRhdGVzLnRpdGxlLnRyaW0oKTtcblx0XHRpZiAodXBkYXRlcy50YWdzICE9PSB1bmRlZmluZWQpIGNhcmQudGFncyA9IHVwZGF0ZXMudGFncztcblx0XHRpZiAodXBkYXRlcy5yZW1hcmsgIT09IHVuZGVmaW5lZCkgY2FyZC5yZW1hcmsgPSB1cGRhdGVzLnJlbWFyaztcblx0XHRpZiAodXBkYXRlcy5kZWFkbGluZSAhPT0gdW5kZWZpbmVkKSBjYXJkLmRlYWRsaW5lID0gdXBkYXRlcy5kZWFkbGluZTtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGhpc3RvcnlOb3RlIHx8IFwiXHU1MTg1XHU1QkI5XHU2NkY0XHU2NUIwXCIpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgbW92ZUNhcmQoXG5cdFx0Y2FyZElkOiBzdHJpbmcsXG5cdFx0ZnJvbUNvbHVtbklkOiBzdHJpbmcsXG5cdFx0dG9Db2x1bW5JZDogc3RyaW5nLFxuXHRcdGJlZm9yZUNhcmRJZD86IHN0cmluZyxcblx0KSB7XG5cdFx0Y29uc3QgZnJvbUNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGZyb21Db2x1bW5JZCk7XG5cdFx0Y29uc3QgdG9Db2x1bW4gPSB0aGlzLmdldENvbHVtbih0b0NvbHVtbklkKTtcblx0XHRjb25zdCBpbmRleCA9IGZyb21Db2x1bW4uY2FyZHMuZmluZEluZGV4KChjKSA9PiBjLmlkID09PSBjYXJkSWQpO1xuXHRcdGlmIChpbmRleCA9PT0gLTEpIHJldHVybjtcblx0XHRjb25zdCBbY2FyZF0gPSBmcm9tQ29sdW1uLmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0bGV0IHRhcmdldEluZGV4ID0gdG9Db2x1bW4uY2FyZHMubGVuZ3RoO1xuXHRcdGlmIChiZWZvcmVDYXJkSWQpIHtcblx0XHRcdGNvbnN0IGJlZm9yZUluZGV4ID0gdG9Db2x1bW4uY2FyZHMuZmluZEluZGV4KChjKSA9PiBjLmlkID09PSBiZWZvcmVDYXJkSWQpO1xuXHRcdFx0dGFyZ2V0SW5kZXggPSBiZWZvcmVJbmRleCA9PT0gLTEgPyB0b0NvbHVtbi5jYXJkcy5sZW5ndGggOiBiZWZvcmVJbmRleDtcblx0XHR9XG5cdFx0dG9Db2x1bW4uY2FyZHMuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBjYXJkKTtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0aWYgKGZyb21Db2x1bW5JZCAhPT0gdG9Db2x1bW5JZCkge1xuXHRcdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGBcdTc5RkJcdTUyQThcdTUyMzBcdTMwMEMke3RvQ29sdW1uLm5hbWV9XHUzMDBEYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBcIlx1OEMwM1x1NjU3NFx1OTg3QVx1NUU4RlwiKTtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyB0b2dnbGVDYXJkQ29tcGxldGlvbihjb2x1bW5JZDogc3RyaW5nLCBjYXJkSWQ6IHN0cmluZywgY29tcGxldGVkOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oY29sdW1uSWQpO1xuXHRcdGNvbnN0IGluZGV4ID0gY29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gY2FyZElkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG5cdFx0Y29uc3QgW2NhcmRdID0gY29sdW1uLmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0Y2FyZC5jb21wbGV0ZWQgPSBjb21wbGV0ZWQ7XG5cdFx0Y2FyZC5jb21wbGV0ZWRBdCA9IGNvbXBsZXRlZCA/IERhdGUubm93KCkgOiBudWxsO1xuXHRcdGNhcmQudXBkYXRlZEF0ID0gRGF0ZS5ub3coKTtcblx0XHR0aGlzLnJlY29yZEhpc3RvcnkoY2FyZCwgY29tcGxldGVkID8gXCJcdTY4MDdcdThCQjBcdTVCOENcdTYyMTBcIiA6IFwiXHU1M0Q2XHU2RDg4XHU1QjhDXHU2MjEwXCIpO1xuXHRcdGNvbnN0IGluc2VydEluZGV4ID0gY29tcGxldGVkID8gY29sdW1uLmNhcmRzLmxlbmd0aCA6IE1hdGgubWluKGluZGV4LCBjb2x1bW4uY2FyZHMubGVuZ3RoKTtcblx0XHRjb2x1bW4uY2FyZHMuc3BsaWNlKGluc2VydEluZGV4LCAwLCBjYXJkKTtcblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0Q29sdW1uKGNvbHVtbklkOiBzdHJpbmcpOiBLYW5iYW5Db2x1bW4ge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuYm9hcmQuY29sdW1ucy5maW5kKChjb2wpID0+IGNvbC5pZCA9PT0gY29sdW1uSWQpO1xuXHRcdGlmICghY29sdW1uKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJcdTY3MkFcdTYyN0VcdTUyMzBcdTYzMDdcdTVCOUFcdTc2ODRcdTY4MEZcdTc2RUVcIik7XG5cdFx0fVxuXHRcdHJldHVybiBjb2x1bW47XG5cdH1cblxuXHRwcml2YXRlIGdldENhcmQoY29sdW1uSWQ6IHN0cmluZywgY2FyZElkOiBzdHJpbmcpOiBLYW5iYW5DYXJkIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0cmV0dXJuIGNvbHVtbi5jYXJkcy5maW5kKChjYXJkKSA9PiBjYXJkLmlkID09PSBjYXJkSWQpO1xuXHR9XG5cblx0cHJpdmF0ZSByZWNvcmRIaXN0b3J5KGNhcmQ6IEthbmJhbkNhcmQsIHJlbWFyazogc3RyaW5nKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGNhcmQuaGlzdG9yeSkpIHtcblx0XHRcdGNhcmQuaGlzdG9yeSA9IFtdO1xuXHRcdH1cblx0XHRjYXJkLmhpc3RvcnkudW5zaGlmdCh7XG5cdFx0XHR0aW1lc3RhbXA6IERhdGUubm93KCksXG5cdFx0XHRyZW1hcms6IHJlbWFyayB8fCBcIlx1NjZGNFx1NjVCMFwiLFxuXHRcdH0pO1xuXHRcdGNhcmQuaGlzdG9yeSA9IGNhcmQuaGlzdG9yeS5zbGljZSgwLCA1MCk7XG5cdH1cblxuXHRwcml2YXRlIG5vcm1hbGl6ZUJvYXJkKCkge1xuXHRcdGZvciAoY29uc3QgY29sdW1uIG9mIHRoaXMuYm9hcmQuY29sdW1ucykge1xuXHRcdFx0Y29sdW1uLmNhcmRzID0gY29sdW1uLmNhcmRzLm1hcCgoY2FyZCkgPT4gKHtcblx0XHRcdFx0Li4uY2FyZCxcblx0XHRcdFx0ZGVhZGxpbmU6IGNhcmQuZGVhZGxpbmUgPz8gbnVsbCxcblx0XHRcdFx0Y29tcGxldGVkQXQ6IGNhcmQuY29tcGxldGVkQXQgPz8gbnVsbCxcblx0XHRcdH0pKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBhY3RpdmF0ZVZpZXcoKSB7XG5cdFx0Y29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEUpO1xuXHRcdGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYobGVhdmVzWzBdKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgcmlnaHRMZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmdldFJpZ2h0TGVhZihmYWxzZSk7XG5cdFx0YXdhaXQgcmlnaHRMZWFmPy5zZXRWaWV3U3RhdGUoeyB0eXBlOiBWSUVXX1RZUEUsIGFjdGl2ZTogdHJ1ZSB9KTtcblx0XHRpZiAocmlnaHRMZWFmKSB7XG5cdFx0XHR0aGlzLmFwcC53b3Jrc3BhY2UucmV2ZWFsTGVhZihyaWdodExlYWYpO1xuXHRcdH1cblx0fVxuXG5cdHNldEFjdGl2ZUNvbHVtbihjb2x1bW5JZDogc3RyaW5nKSB7XG5cdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSBjb2x1bW5JZDtcblx0fVxuXG5cdHByaXZhdGUgcmVzb2x2ZUNvbHVtbkZvclF1aWNrQWRkKCk6IEthbmJhbkNvbHVtbiB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKCF0aGlzLmJvYXJkLmNvbHVtbnMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHByZWZlcnJlZCA9XG5cdFx0XHR0aGlzLmxhc3RDb2x1bW5JZCAmJiB0aGlzLmJvYXJkLmNvbHVtbnMuZmluZCgoY29sKSA9PiBjb2wuaWQgPT09IHRoaXMubGFzdENvbHVtbklkKTtcblx0XHRyZXR1cm4gcHJlZmVycmVkID8/IHRoaXMuYm9hcmQuY29sdW1uc1swXTtcblx0fVxuXG5cdG9wZW5RdWlja0FkZENhcmQoKSB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5yZXNvbHZlQ29sdW1uRm9yUXVpY2tBZGQoKTtcblx0XHRpZiAoIWNvbHVtbikge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1OEJGN1x1NTE0OFx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5zZXRBY3RpdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRuZXcgQ2FyZE1vZGFsKHRoaXMuYXBwLCB0aGlzLCBjb2x1bW4uaWQpLm9wZW4oKTtcblx0fVxufVxuXG5jbGFzcyBLYW5iYW5WaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuXHRwcml2YXRlIGRyYWdTdGF0ZT86IHsgY29sdW1uSWQ6IHN0cmluZzsgY2FyZElkOiBzdHJpbmc7IGNhcmRIZWlnaHQ6IG51bWJlciB9O1xuXHRwcml2YXRlIHBsYWNlaG9sZGVyRWw/OiBIVE1MRWxlbWVudDtcblx0cHJpdmF0ZSBwbGFjZWhvbGRlclN0YXRlPzogeyBjb2x1bW5JZDogc3RyaW5nOyBiZWZvcmVJZD86IHN0cmluZyB9O1xuXHRwcml2YXRlIGRlYWRsaW5lRmlsdGVycyA9IG5ldyBNYXA8c3RyaW5nLCBib29sZWFuPigpO1xuXHRwcml2YXRlIGFjdGl2ZVRhYjogXCJib2FyZFwiIHwgXCJzdGF0c1wiID0gXCJib2FyZFwiO1xuXHRwcml2YXRlIHN0YXRzUmFuZ2U6IFN0YXRzUmFuZ2UgPSB7IHR5cGU6IFwicHJlc2V0XCIsIGRheXM6IDE0IH07XG5cblx0Y29uc3RydWN0b3IobGVhZjogV29ya3NwYWNlTGVhZiwgcHJpdmF0ZSBwbHVnaW46IFNpbXBsZUthbmJhblBsdWdpbikge1xuXHRcdHN1cGVyKGxlYWYpO1xuXHR9XG5cblx0Z2V0Vmlld1R5cGUoKSB7XG5cdFx0cmV0dXJuIFZJRVdfVFlQRTtcblx0fVxuXG5cdGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIFwiXHU1M0YzXHU0RkE3XHU3NzBCXHU2NzdGXCI7XG5cdH1cblxuXHRnZXRJY29uKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIElDT05fSUQ7XG5cdH1cblxuXHRhc3luYyBvbk9wZW4oKSB7XG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fVxuXG5cdGFzeW5jIG9uQ2xvc2UoKSB7XG5cdFx0dGhpcy5kcmFnU3RhdGUgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgY29udGFpbmVyID0gdGhpcy5jb250ZW50RWw7XG5cdFx0Y29udGFpbmVyLmVtcHR5KCk7XG5cdFx0Y29udGFpbmVyLmFkZENsYXNzKFwic2sta2FuYmFuXCIpO1xuXG5cdFx0Y29uc3QgdGFicyA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFic1wiIH0pO1xuXHRcdHRoaXMucmVuZGVyVGFiQnV0dG9uKHRhYnMsIFwiYm9hcmRcIiwgXCJcdTRFRkJcdTUyQTFcdTc3MEJcdTY3N0ZcIik7XG5cdFx0dGhpcy5yZW5kZXJUYWJCdXR0b24odGFicywgXCJzdGF0c1wiLCBcIlx1NjU0OFx1NzM4N1x1N0VERlx1OEJBMVwiKTtcblxuXHRcdGNvbnN0IGJvZHkgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRhYi1wYW5lbFwiIH0pO1xuXHRcdGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gXCJib2FyZFwiKSB7XG5cdFx0XHR0aGlzLnJlbmRlckJvYXJkKGJvZHkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlbmRlclN0YXRzKGJvZHkpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVGFiQnV0dG9uKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHRhYjogXCJib2FyZFwiIHwgXCJzdGF0c1wiLCBsYWJlbDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYnV0dG9uID0gY29udGFpbmVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IGxhYmVsLFxuXHRcdFx0Y2xzOiBbXCJzay10YWJcIiwgdGhpcy5hY3RpdmVUYWIgPT09IHRhYiA/IFwic2stdGFiLWFjdGl2ZVwiIDogXCJcIl0uam9pbihcIiBcIikudHJpbSgpLFxuXHRcdH0pO1xuXHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuYWN0aXZlVGFiID09PSB0YWIpIHJldHVybjtcblx0XHRcdHRoaXMuYWN0aXZlVGFiID0gdGFiO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQm9hcmQoYm9keTogSFRNTEVsZW1lbnQpIHtcblx0XHRjb25zdCBib2FyZCA9IHRoaXMucGx1Z2luLmdldEJvYXJkKCk7XG5cblx0XHRjb25zdCBoZWFkZXIgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1oZWFkZXJcIiB9KTtcblx0XHRoZWFkZXIuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiXHU0RkE3XHU4RkI5XHU3NzBCXHU2NzdGXCIgfSk7XG5cdFx0Y29uc3QgYWRkQ29sdW1uQnRuID0gaGVhZGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IFwiXHU2NUIwXHU1ODlFXHU2ODBGXHU3NkVFXCIsXG5cdFx0XHRjbHM6IFwic2stYnRuXCIsXG5cdFx0fSk7XG5cdFx0YWRkQ29sdW1uQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHRuZXcgQ29sdW1uTW9kYWwodGhpcy5hcHAsIHtcblx0XHRcdFx0dGl0bGU6IFwiXHU2NUIwXHU1ODlFXHU2ODBGXHU3NkVFXCIsXG5cdFx0XHRcdGNvbmZpcm1UZXh0OiBcIlx1NTIxQlx1NUVGQVwiLFxuXHRcdFx0XHRvblN1Ym1pdDogYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uYWRkQ29sdW1uKHZhbHVlKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pLm9wZW4oKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGNvbHVtbnNXcmFwcGVyID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uc1wiIH0pO1xuXHRcdGlmICghYm9hcmQuY29sdW1ucy5sZW5ndGgpIHtcblx0XHRcdGNvbHVtbnNXcmFwcGVyLmNyZWF0ZURpdih7IHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU2ODBGXHU3NkVFXHVGRjBDXHU3MEI5XHU1MUZCXHUyMDFDXHU2NUIwXHU1ODlFXHU2ODBGXHU3NkVFXHUyMDFEXHUzMDAyXCIsIGNsczogXCJzay1lbXB0eVwiIH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgY29sdW1uIG9mIGJvYXJkLmNvbHVtbnMpIHtcblx0XHRcdHRoaXMucmVuZGVyQ29sdW1uKGNvbHVtbnNXcmFwcGVyLCBjb2x1bW4pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU3RhdHMoYm9keTogSFRNTEVsZW1lbnQpIHtcblx0XHRjb25zdCBzdGF0cyA9IHRoaXMuYnVpbGRTdGF0c1NuYXBzaG90KHRoaXMuc3RhdHNSYW5nZSk7XG5cdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gU25hcHNob3RcIiwge1xuXHRcdFx0cmFuZ2U6IHRoaXMuc3RhdHNSYW5nZSxcblx0XHRcdGRhaWx5U2VyaWVzOiBzdGF0cy5kYWlseVNlcmllcyxcblx0XHRcdGRhaWx5UmF0ZXM6IHN0YXRzLmRhaWx5UmF0ZXMsXG5cdFx0fSk7XG5cblx0XHRib2R5LmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIlx1NjU0OFx1NzM4N1x1N0VERlx1OEJBMVwiLCBjbHM6IFwic2stc3RhdHMtdGl0bGVcIiB9KTtcblx0XHRjb25zdCByYW5nZUNvbnRyb2xzID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stcmFuZ2UtY29udHJvbHNcIiB9KTtcblx0XHRyYW5nZUNvbnRyb2xzLmNyZWF0ZVNwYW4oeyB0ZXh0OiBcIlx1NjVGNlx1OTVGNFx1ODMwM1x1NTZGNFx1RkYxQVwiIH0pO1xuXHRcdGNvbnN0IHNlbGVjdCA9IHJhbmdlQ29udHJvbHMuY3JlYXRlRWwoXCJzZWxlY3RcIiwgeyBjbHM6IFwic2stcmFuZ2Utc2VsZWN0XCIgfSkgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG5cdFx0Y29uc3QgcHJlc2V0T3B0aW9uczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHsgXCI3XHU1OTI5XCI6IDcsIFwiMTRcdTU5MjlcIjogMTQsIFwiMzBcdTU5MjlcIjogMzAsIFwiOTBcdTU5MjlcIjogOTAgfTtcblx0XHRPYmplY3QuZW50cmllcyhwcmVzZXRPcHRpb25zKS5mb3JFYWNoKChbbGFiZWwsIGRheXNdKSA9PiB7XG5cdFx0XHRjb25zdCBvcHRpb24gPSBzZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBsYWJlbCwgdmFsdWU6IGRheXMudG9TdHJpbmcoKSB9KTtcblx0XHRcdGlmICh0aGlzLnN0YXRzUmFuZ2UudHlwZSA9PT0gXCJwcmVzZXRcIiAmJiB0aGlzLnN0YXRzUmFuZ2UuZGF5cyA9PT0gZGF5cykgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRjb25zdCBjdXN0b21PcHRpb24gPSBzZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBcIlx1ODFFQVx1NUI5QVx1NEU0OVwiLCB2YWx1ZTogXCJjdXN0b21cIiB9KTtcblx0XHRpZiAodGhpcy5zdGF0c1JhbmdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIGN1c3RvbU9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG5cblx0XHRjb25zdCBjdXN0b21GaWVsZHMgPSByYW5nZUNvbnRyb2xzLmNyZWF0ZURpdih7IGNsczogXCJzay1yYW5nZS1jdXN0b21cIiB9KTtcblx0XHRjb25zdCBzdGFydElucHV0ID0gY3VzdG9tRmllbGRzLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGVcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGNvbnN0IGVuZElucHV0ID0gY3VzdG9tRmllbGRzLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGVcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGNvbnN0IHVwZGF0ZUN1c3RvbUlucHV0cyA9ICgpID0+IHtcblx0XHRcdGlmICh0aGlzLnN0YXRzUmFuZ2UudHlwZSA9PT0gXCJjdXN0b21cIikge1xuXHRcdFx0XHRzdGFydElucHV0LnZhbHVlID0gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGhpcy5zdGF0c1JhbmdlLnN0YXJ0KTtcblx0XHRcdFx0ZW5kSW5wdXQudmFsdWUgPSBmb3JtYXREYXRlSW5wdXRWYWx1ZSh0aGlzLnN0YXRzUmFuZ2UuZW5kKTtcblx0XHRcdFx0Y3VzdG9tRmllbGRzLmFkZENsYXNzKFwic2stcmFuZ2UtY3VzdG9tLXZpc2libGVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjdXN0b21GaWVsZHMucmVtb3ZlQ2xhc3MoXCJzay1yYW5nZS1jdXN0b20tdmlzaWJsZVwiKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdHVwZGF0ZUN1c3RvbUlucHV0cygpO1xuXG5cdFx0c2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHNlbGVjdC52YWx1ZSA9PT0gXCJjdXN0b21cIikge1xuXHRcdFx0XHRjb25zdCB0b2RheSA9IHRoaXMuc3RhcnRPZkRheShEYXRlLm5vdygpKTtcblx0XHRcdFx0Y29uc3QgZGVmYXVsdFN0YXJ0ID0gdG9kYXkgLSAxMyAqIDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cdFx0XHRcdHRoaXMuc3RhdHNSYW5nZSA9IHsgdHlwZTogXCJjdXN0b21cIiwgc3RhcnQ6IGRlZmF1bHRTdGFydCwgZW5kOiB0b2RheSB9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zdGF0c1JhbmdlID0geyB0eXBlOiBcInByZXNldFwiLCBkYXlzOiBOdW1iZXIoc2VsZWN0LnZhbHVlKSB9O1xuXHRcdFx0fVxuXHRcdFx0dXBkYXRlQ3VzdG9tSW5wdXRzKCk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgaGFuZGxlQ3VzdG9tQ2hhbmdlID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuc3RhdHNSYW5nZS50eXBlICE9PSBcImN1c3RvbVwiKSByZXR1cm47XG5cdFx0XHRjb25zdCBzdGFydFRzID0gc3RhcnRJbnB1dC52YWx1ZSA/IHRoaXMuc3RhcnRPZkRheShuZXcgRGF0ZShzdGFydElucHV0LnZhbHVlKS5nZXRUaW1lKCkpIDogbnVsbDtcblx0XHRcdGNvbnN0IGVuZFRzID0gZW5kSW5wdXQudmFsdWUgPyB0aGlzLnN0YXJ0T2ZEYXkobmV3IERhdGUoZW5kSW5wdXQudmFsdWUpLmdldFRpbWUoKSkgOiBudWxsO1xuXHRcdFx0aWYgKHN0YXJ0VHMgJiYgZW5kVHMgJiYgc3RhcnRUcyA8PSBlbmRUcykge1xuXHRcdFx0XHR0aGlzLnN0YXRzUmFuZ2UgPSB7IHR5cGU6IFwiY3VzdG9tXCIsIHN0YXJ0OiBzdGFydFRzLCBlbmQ6IGVuZFRzIH07XG5cdFx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRzdGFydElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgaGFuZGxlQ3VzdG9tQ2hhbmdlKTtcblx0XHRlbmRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGhhbmRsZUN1c3RvbUNoYW5nZSk7XG5cblx0XHRjb25zdCBkYXNoYm9hcmQgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1kYXNoYm9hcmRcIiB9KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKGRhc2hib2FyZCwgXCJcdTYwM0JcdTRFRkJcdTUyQTFcIiwgc3RhdHMudG90YWxUYXNrcy50b1N0cmluZygpLCBcIlx1N0QyRlx1OEJBMVx1NTIxQlx1NUVGQVwiKTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTVCOENcdTYyMTBcdTczODdcIixcblx0XHRcdGZvcm1hdFBlcmNlbnQoc3RhdHMuY29tcGxldGlvblJhdGUpLFxuXHRcdFx0YFx1NURGMlx1NUI4Q1x1NjIxMCAke3N0YXRzLmNvbXBsZXRlZFRhc2tzfS8ke3N0YXRzLnRvdGFsVGFza3MgfHwgMX1gLFxuXHRcdCk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChkYXNoYm9hcmQsIFwiXHU1RjUzXHU1MjREXHU4RkRCXHU4ODRDXHU0RTJEXCIsIHN0YXRzLndpcENvdW50LnRvU3RyaW5nKCksIFwiXHU0RUNEXHU2NzJBXHU1QjhDXHU2MjEwXCIpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoXG5cdFx0XHRkYXNoYm9hcmQsXG5cdFx0XHRcIlx1OTAzRVx1NjcxRlx1NzM4N1wiLFxuXHRcdFx0c3RhdHMuZGVhZGxpbmVDb3VudCA/IGZvcm1hdFBlcmNlbnQoc3RhdHMub3ZlcmR1ZVJhdGUpIDogXCJcdTIwMTRcIixcblx0XHRcdGAke3N0YXRzLm92ZXJkdWVDb3VudH0vJHtzdGF0cy5kZWFkbGluZUNvdW50IHx8IDF9IFx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMWAsXG5cdFx0KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTBcdTczODdcIixcblx0XHRcdHN0YXRzLmRlYWRsaW5lQ291bnQgPyBmb3JtYXRQZXJjZW50KHN0YXRzLm9uVGltZVJhdGUpIDogXCJcdTIwMTRcIixcblx0XHRcdFwiXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwXCIsXG5cdFx0KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTU0NjhcdTY3MUZcIixcblx0XHRcdHN0YXRzLmF2Z0N5Y2xlVGltZU1zID8gZm9ybWF0RHVyYXRpb24oc3RhdHMuYXZnQ3ljbGVUaW1lTXMpIDogXCJcdTIwMTRcIixcblx0XHRcdFwiXHU0RUNFXHU1MjFCXHU1RUZBXHU1MjMwXHU1QjhDXHU2MjEwXCIsXG5cdFx0KTtcblxuXHRcdGNvbnN0IGNoYXJ0U2VjdGlvbiA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXRzLXNlY3Rpb25cIiB9KTtcblx0XHRjaGFydFNlY3Rpb24uY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU2QkNGXHU2NUU1XHU0RUZCXHU1MkExXHU4RDhCXHU1MkJGXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJEYWlseUJhckNoYXJ0KGNoYXJ0U2VjdGlvbiwgc3RhdHMuZGFpbHlTZXJpZXMpO1xuXG5cdFx0Y29uc3QgcmF0ZVNlY3Rpb24gPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1zZWN0aW9uXCIgfSk7XG5cdFx0cmF0ZVNlY3Rpb24uY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU2QkNGXHU2NUU1XHU1QjhDXHU2MjEwXHU3Mzg3XCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJEYWlseVJhdGVDaGFydChyYXRlU2VjdGlvbiwgc3RhdHMuZGFpbHlSYXRlcyk7XG5cblx0XHRjb25zdCBkZWFkbGluZVNlY3Rpb24gPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1zZWN0aW9uXCIgfSk7XG5cdFx0ZGVhZGxpbmVTZWN0aW9uLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIlx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVx1Njk4Mlx1ODlDOFwiIH0pO1xuXHRcdHRoaXMucmVuZGVyRGVhZGxpbmVCcmVha2Rvd24oZGVhZGxpbmVTZWN0aW9uLCBzdGF0cyk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckNvbHVtbih3cmFwcGVyOiBIVE1MRWxlbWVudCwgY29sdW1uOiBLYW5iYW5Db2x1bW4pIHtcblx0XHRjb25zdCBjb2x1bW5FbCA9IHdyYXBwZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtblwiIH0pO1xuXG5cdFx0Y29uc3QgY29sdW1uSGVhZGVyID0gY29sdW1uRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbi1oZWFkZXJcIiB9KTtcblx0XHRjb25zdCB0aXRsZUVsID0gY29sdW1uSGVhZGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW4tdGl0bGVcIiwgYXR0cjogeyByb2xlOiBcImJ1dHRvblwiIH0gfSk7XG5cdFx0dGl0bGVFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogY29sdW1uLm5hbWUgfSk7XG5cdFx0dGl0bGVFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0bmV3IENvbHVtbk1vZGFsKHRoaXMuYXBwLCB7XG5cdFx0XHRcdHRpdGxlOiBcIlx1N0YxNlx1OEY5MVx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0XHRpbml0aWFsVmFsdWU6IGNvbHVtbi5uYW1lLFxuXHRcdFx0XHRjb25maXJtVGV4dDogXCJcdTRGRERcdTVCNThcIixcblx0XHRcdFx0b25TdWJtaXQ6IGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnJlbmFtZUNvbHVtbihjb2x1bW4uaWQsIHZhbHVlKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pLm9wZW4oKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGFjdGlvbnNFbCA9IGNvbHVtbkhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uLWFjdGlvbnNcIiB9KTtcblx0XHRjb25zdCBhZGRCdG4gPSBhY3Rpb25zRWwuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1NkRGQlx1NTJBMFx1NTM2MVx1NzI0N1wiLCBjbHM6IFwic2stYnRuIHNrLWJ0bi1zbWFsbFwiIH0pO1xuXHRcdGFkZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0dGhpcy5wbHVnaW4uc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0XHRuZXcgQ2FyZE1vZGFsKHRoaXMuYXBwLCB0aGlzLnBsdWdpbiwgY29sdW1uLmlkKS5vcGVuKCk7XG5cdFx0fSk7XG5cdFx0Y29uc3QgZGVsZXRlQnRuID0gYWN0aW9uc0VsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IFwiXHU1MjIwXHU5NjY0XCIsXG5cdFx0XHRjbHM6IFwic2stYnRuIHNrLWJ0bi1naG9zdCBzay1idG4tc21hbGxcIixcblx0XHRcdGF0dHI6IHsgXCJhcmlhLWxhYmVsXCI6IFwiXHU1MjIwXHU5NjY0XHU2ODBGXHU3NkVFXCIgfSxcblx0XHR9KTtcblx0XHRkZWxldGVCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDb25maXJtTW9kYWwodGhpcy5hcHAsIHtcblx0XHRcdFx0dGl0bGU6IFwiXHU1MjIwXHU5NjY0XHU2ODBGXHU3NkVFXCIsXG5cdFx0XHRcdG1lc3NhZ2U6IGBcdTc4NkVcdTVCOUFcdTUyMjBcdTk2NjRcdTMwMEMke2NvbHVtbi5uYW1lfVx1MzAwRFx1NTNDQVx1NTE3Nlx1NjI0MFx1NjcwOVx1NTM2MVx1NzI0N1x1RkYxRmAsXG5cdFx0XHRcdGNvbmZpcm1UZXh0OiBcIlx1NTIyMFx1OTY2NFwiLFxuXHRcdFx0XHRvbkNvbmZpcm06IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5yZW1vdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pLm9wZW4oKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGNhcmRzQ29udGFpbmVyID0gY29sdW1uRWwuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogXCJzay1jYXJkc1wiLFxuXHRcdFx0YXR0cjogeyBcImRhdGEtY29sdW1uXCI6IGNvbHVtbi5pZCB9LFxuXHRcdH0pO1xuXHRcdGNvbnN0IGZpbHRlcldyYXBwZXIgPSBhY3Rpb25zRWwuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IGNsczogXCJzay1maWx0ZXItdG9nZ2xlXCIgfSk7XG5cdFx0Y29uc3QgZGVhZGxpbmVPbmx5ID0gdGhpcy5kZWFkbGluZUZpbHRlcnMuZ2V0KGNvbHVtbi5pZCkgPz8gZmFsc2U7XG5cdFx0Y29uc3QgZmlsdGVyQ2hlY2tib3ggPSBmaWx0ZXJXcmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRmaWx0ZXJDaGVja2JveC5jaGVja2VkID0gZGVhZGxpbmVPbmx5O1xuXHRcdGZpbHRlckNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuXHRcdFx0dGhpcy5kZWFkbGluZUZpbHRlcnMuc2V0KGNvbHVtbi5pZCwgZmlsdGVyQ2hlY2tib3guY2hlY2tlZCk7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH0pO1xuXHRcdGZpbHRlcldyYXBwZXIuY3JlYXRlU3Bhbih7IHRleHQ6IFwiXHU0RUM1XHU2MjJBXHU2QjYyXCIgfSk7XG5cblx0XHRjYXJkc0NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoZXZ0LmRhdGFUcmFuc2ZlcikgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJtb3ZlXCI7XG5cdFx0XHRjb25zdCBiZWZvcmVJZCA9IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHR0aGlzLm1vdmVQbGFjZWhvbGRlcihjYXJkc0NvbnRhaW5lciwgYmVmb3JlSWQpO1xuXHRcdH0pO1xuXHRcdGNhcmRzQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Y29uc3QgYmVmb3JlSWQgPVxuXHRcdFx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGU/LmNvbHVtbklkID09PSBjb2x1bW4uaWRcblx0XHRcdFx0XHQ/IHRoaXMucGxhY2Vob2xkZXJTdGF0ZS5iZWZvcmVJZFxuXHRcdFx0XHRcdDogdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdHZvaWQgdGhpcy5oYW5kbGVEcm9wKGNvbHVtbi5pZCwgYmVmb3JlSWQpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgY2FyZHNUb1JlbmRlciA9IHRoaXMuZ2V0Q2FyZHNGb3JDb2x1bW4oY29sdW1uLCBkZWFkbGluZU9ubHkpO1xuXG5cdFx0aWYgKCFjYXJkc1RvUmVuZGVyLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgZW1wdHlUZXh0ID0gZGVhZGxpbmVPbmx5ID8gXCJcdTY2ODJcdTY1RTBcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcIiA6IFwiXHVEODNEXHVEQ0REIFx1NjY4Mlx1NjVFMFx1NEVGQlx1NTJBMVwiO1xuXHRcdFx0Y29uc3QgZW1wdHkgPSBjYXJkc0NvbnRhaW5lci5jcmVhdGVEaXYoeyB0ZXh0OiBlbXB0eVRleHQsIGNsczogXCJzay1lbXB0eVwiIH0pO1xuXHRcdFx0ZW1wdHkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldnQpID0+IHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGlmIChldnQuZGF0YVRyYW5zZmVyKSBldnQuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcIm1vdmVcIjtcblx0XHRcdFx0Y29uc3QgYmVmb3JlSWQgPSB0aGlzLmdldEJlZm9yZUNhcmRJZChjYXJkc0NvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0XHR0aGlzLm1vdmVQbGFjZWhvbGRlcihjYXJkc0NvbnRhaW5lciwgYmVmb3JlSWQpO1xuXHRcdFx0fSk7XG5cdFx0XHRlbXB0eS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRjb25zdCBiZWZvcmVJZCA9XG5cdFx0XHRcdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlPy5jb2x1bW5JZCA9PT0gY29sdW1uLmlkXG5cdFx0XHRcdFx0XHQ/IHRoaXMucGxhY2Vob2xkZXJTdGF0ZS5iZWZvcmVJZFxuXHRcdFx0XHRcdFx0OiB0aGlzLmdldEJlZm9yZUNhcmRJZChjYXJkc0NvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0XHR2b2lkIHRoaXMuaGFuZGxlRHJvcChjb2x1bW4uaWQsIGJlZm9yZUlkKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNhcmRzVG9SZW5kZXIuZm9yRWFjaCgoY2FyZCkgPT4ge1xuXHRcdFx0dGhpcy5yZW5kZXJDYXJkKGNhcmRzQ29udGFpbmVyLCBjb2x1bW4sIGNhcmQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDYXJkKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNvbHVtbjogS2FuYmFuQ29sdW1uLCBjYXJkOiBLYW5iYW5DYXJkKSB7XG5cdFx0Y29uc3QgY2FyZENsYXNzZXMgPSBbXCJzay1jYXJkXCJdO1xuXHRcdGlmIChjYXJkLmNvbXBsZXRlZCkgY2FyZENsYXNzZXMucHVzaChcInNrLWNhcmQtY29tcGxldGVkXCIpO1xuXHRcdGlmIChjYXJkLmRlYWRsaW5lKSBjYXJkQ2xhc3Nlcy5wdXNoKFwic2stY2FyZC1kZWFkbGluZVwiKTtcblx0XHRjb25zdCBjYXJkRWwgPSBjb250YWluZXIuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogY2FyZENsYXNzZXMuam9pbihcIiBcIiksXG5cdFx0XHRhdHRyOiB7IGRyYWdnYWJsZTogXCJ0cnVlXCIsIFwiZGF0YS1jYXJkXCI6IGNhcmQuaWQgfSxcblx0XHR9KTtcblx0XHRjYXJkRWwuZGF0YXNldC5jYXJkSWQgPSBjYXJkLmlkO1xuXG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgKGV2dCkgPT4ge1xuXHRcdFx0dGhpcy5kcmFnU3RhdGUgPSB7IGNhcmRJZDogY2FyZC5pZCwgY29sdW1uSWQ6IGNvbHVtbi5pZCwgY2FyZEhlaWdodDogY2FyZEVsLm9mZnNldEhlaWdodCB9O1xuXHRcdFx0Y2FyZEVsLmFkZENsYXNzKFwic2stY2FyZC1kcmFnZ2luZ1wiKTtcblx0XHRcdGV2dC5kYXRhVHJhbnNmZXI/LnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIGNhcmQuaWQpO1xuXHRcdH0pO1xuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VuZFwiLCAoKSA9PiB7XG5cdFx0XHRjYXJkRWwucmVtb3ZlQ2xhc3MoXCJzay1jYXJkLWRyYWdnaW5nXCIpO1xuXHRcdFx0dGhpcy5yZXNldERyYWdTdGF0ZSgpO1xuXHRcdH0pO1xuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoZXZ0LmRhdGFUcmFuc2ZlcikgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJtb3ZlXCI7XG5cdFx0XHRjYXJkRWwuYWRkQ2xhc3MoXCJzay1jYXJkLWRyb3BcIik7XG5cdFx0XHRjb25zdCBjb250YWluZXIgPSBjYXJkRWwucGFyZW50RWxlbWVudCBhcyBIVE1MRWxlbWVudDtcblx0XHRcdGNvbnN0IGJlZm9yZUlkID0gdGhpcy5nZXRCZWZvcmVDYXJkSWQoY29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHR0aGlzLm1vdmVQbGFjZWhvbGRlcihjb250YWluZXIsIGJlZm9yZUlkKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCAoKSA9PiB7XG5cdFx0XHRjYXJkRWwucmVtb3ZlQ2xhc3MoXCJzay1jYXJkLWRyb3BcIik7XG5cdFx0fSk7XG5cblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldnQpID0+IHtcblx0XHRcdGNvbnN0IHRhcmdldCA9IGV2dC50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRpZiAodGFyZ2V0LmNsb3Nlc3QoXCIuc2staGlzdG9yeS1ob3N0XCIpKSByZXR1cm47XG5cdFx0XHR0aGlzLnBsdWdpbi5zZXRBY3RpdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRcdG5ldyBDYXJkTW9kYWwodGhpcy5hcHAsIHRoaXMucGx1Z2luLCBjb2x1bW4uaWQsIGNhcmQpLm9wZW4oKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IHRvcFJvdyA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC10b3BcIiB9KTtcblx0XHRjb25zdCBjaGVja2JveCA9IHRvcFJvdy5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0Y2hlY2tib3guY2hlY2tlZCA9IGNhcmQuY29tcGxldGVkO1xuXHRcdGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoZXZ0KSA9PiB7XG5cdFx0XHRldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi50b2dnbGVDYXJkQ29tcGxldGlvbihjb2x1bW4uaWQsIGNhcmQuaWQsIGNoZWNrYm94LmNoZWNrZWQpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgdGl0bGVFbCA9IHRvcFJvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC10aXRsZVwiLCB0ZXh0OiBjYXJkLnRpdGxlIH0pO1xuXHRcdHRpdGxlRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdHRoaXMucGx1Z2luLnNldEFjdGl2ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGNvbHVtbi5pZCwgY2FyZCkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgaGlzdG9yeUhvc3QgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhpc3RvcnktaG9zdFwiIH0pO1xuXHRcdGNvbnN0IGhpc3RvcnlNYXJrZXIgPSBoaXN0b3J5SG9zdC5jcmVhdGVEaXYoeyBjbHM6IFwic2staGlzdG9yeS1tYXJrZXJcIiwgdGV4dDogXCJcdTIzRjFcIiB9KTtcblx0XHRjb25zdCBwb3BvdmVyID0gaGlzdG9yeUhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhpc3RvcnktcG9wb3ZlclwiIH0pO1xuXHRcdGNvbnN0IGhpc3RvcnlFbnRyaWVzID0gQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpID8gY2FyZC5oaXN0b3J5IDogW107XG5cdFx0aGlzdG9yeUVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+IHtcblx0XHRcdHBvcG92ZXIuY3JlYXRlRGl2KHtcblx0XHRcdFx0Y2xzOiBcInNrLWhpc3RvcnktZW50cnlcIixcblx0XHRcdFx0dGV4dDogYCR7Zm9ybWF0RGF0ZShlbnRyeS50aW1lc3RhbXApfSBcdTAwQjcgJHtlbnRyeS5yZW1hcmsgfHwgXCJcdTRGRUVcdTY1MzlcIn1gLFxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0aWYgKCFoaXN0b3J5RW50cmllcy5sZW5ndGgpIHtcblx0XHRcdHBvcG92ZXIuY3JlYXRlRGl2KHsgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTUzODZcdTUzRjJcIiwgY2xzOiBcInNrLWhpc3RvcnktZW50cnlcIiB9KTtcblx0XHR9XG5cdFx0bGV0IGhpZGVUaW1lb3V0OiBOdWxsYWJsZVRpbWVvdXQgPSBudWxsO1xuXHRcdGNvbnN0IGNsZWFySGlkZVRpbWVvdXQgPSAoKSA9PiB7XG5cdFx0XHRpZiAoaGlkZVRpbWVvdXQgIT09IG51bGwpIHtcblx0XHRcdFx0d2luZG93LmNsZWFyVGltZW91dChoaWRlVGltZW91dCk7XG5cdFx0XHRcdGhpZGVUaW1lb3V0ID0gbnVsbDtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGNvbnN0IHNob3dIaXN0b3J5ID0gKCkgPT4ge1xuXHRcdFx0Y2xlYXJIaWRlVGltZW91dCgpO1xuXHRcdFx0aGlzdG9yeUhvc3QuYWRkQ2xhc3MoXCJzay1oaXN0b3J5LWhvdmVyXCIpO1xuXHRcdH07XG5cdFx0Y29uc3Qgc2NoZWR1bGVIaWRlID0gKCkgPT4ge1xuXHRcdFx0Y2xlYXJIaWRlVGltZW91dCgpO1xuXHRcdFx0aGlkZVRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdGlmICghaGlzdG9yeUhvc3QuaGFzQ2xhc3MoXCJzay1oaXN0b3J5LXBpbm5lZFwiKSkge1xuXHRcdFx0XHRcdGhpc3RvcnlIb3N0LnJlbW92ZUNsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgMTUwKTtcblx0XHR9O1xuXHRcdGhpc3RvcnlIb3N0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHNob3dIaXN0b3J5KTtcblx0XHRoaXN0b3J5SG9zdC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBzY2hlZHVsZUhpZGUpO1xuXHRcdGhpc3RvcnlNYXJrZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGNsZWFySGlkZVRpbWVvdXQoKTtcblx0XHRcdGlmIChoaXN0b3J5SG9zdC5oYXNDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpKSB7XG5cdFx0XHRcdGhpc3RvcnlIb3N0LnJlbW92ZUNsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIik7XG5cdFx0XHRcdGlmICghaGlzdG9yeUhvc3QubWF0Y2hlcyhcIjpob3ZlclwiKSkge1xuXHRcdFx0XHRcdGhpc3RvcnlIb3N0LnJlbW92ZUNsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aGlzdG9yeUhvc3QuYWRkQ2xhc3MoXCJzay1oaXN0b3J5LXBpbm5lZFwiKTtcblx0XHRcdFx0aGlzdG9yeUhvc3QuYWRkQ2xhc3MoXCJzay1oaXN0b3J5LWhvdmVyXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGNhcmQudGFncy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHRhZ1JvdyA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC10YWdzXCIgfSk7XG5cdFx0XHRjYXJkLnRhZ3MuZm9yRWFjaCgodGFnKSA9PiB0YWdSb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRhZ1wiLCB0ZXh0OiB0YWcgfSkpO1xuXHRcdH1cblxuXHRcdGlmIChjYXJkLnJlbWFyaykge1xuXHRcdFx0Y2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXJlbWFya1wiLCB0ZXh0OiBjYXJkLnJlbWFyayB9KTtcblx0XHR9XG5cblx0XHRjb25zdCBtZXRhID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLW1ldGFcIiB9KTtcblx0XHRtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBgXHU1MjFCXHU1RUZBXHVGRjFBJHtmb3JtYXREYXRlKGNhcmQuY3JlYXRlZEF0KX1gIH0pO1xuXHRcdG1ldGEuY3JlYXRlU3Bhbih7IHRleHQ6IGBcdTY2RjRcdTY1QjBcdUZGMUEke2Zvcm1hdERhdGUoY2FyZC51cGRhdGVkQXQpfWAgfSk7XG5cdFx0aWYgKGNhcmQuZGVhZGxpbmUpIHtcblx0XHRcdG1ldGEuY3JlYXRlU3Bhbih7IHRleHQ6IGBcdTYyMkFcdTZCNjJcdUZGMUEke2Zvcm1hdERhdGUoY2FyZC5kZWFkbGluZSl9YCwgY2xzOiBcInNrLWNhcmQtZGVhZGxpbmUtdGV4dFwiIH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYXJkRWw7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGhhbmRsZURyb3AodGFyZ2V0Q29sdW1uSWQ6IHN0cmluZywgYmVmb3JlQ2FyZElkPzogc3RyaW5nKSB7XG5cdFx0aWYgKCF0aGlzLmRyYWdTdGF0ZSkgcmV0dXJuO1xuXHRcdGNvbnN0IHsgY29sdW1uSWQsIGNhcmRJZCB9ID0gdGhpcy5kcmFnU3RhdGU7XG5cdFx0aWYgKHRhcmdldENvbHVtbklkID09PSBjb2x1bW5JZCAmJiBiZWZvcmVDYXJkSWQgPT09IGNhcmRJZCkge1xuXHRcdFx0dGhpcy5yZXNldERyYWdTdGF0ZSgpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRhd2FpdCB0aGlzLnBsdWdpbi5tb3ZlQ2FyZChjYXJkSWQsIGNvbHVtbklkLCB0YXJnZXRDb2x1bW5JZCwgYmVmb3JlQ2FyZElkKTtcblx0XHR0aGlzLnJlc2V0RHJhZ1N0YXRlKCk7XG5cdH1cblxuXHRwcml2YXRlIGdldEJlZm9yZUNhcmRJZChjb250YWluZXI6IEhUTUxFbGVtZW50LCBjbGllbnRZOiBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IGNhcmRzID0gQXJyYXkuZnJvbShjb250YWluZXIucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oXCIuc2stY2FyZFwiKSk7XG5cdFx0Zm9yIChjb25zdCBjYXJkIG9mIGNhcmRzKSB7XG5cdFx0XHRjb25zdCByZWN0ID0gY2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdGNvbnN0IG1pZHBvaW50ID0gcmVjdC50b3AgKyByZWN0LmhlaWdodCAvIDI7XG5cdFx0XHRpZiAoY2xpZW50WSA8IG1pZHBvaW50KSB7XG5cdFx0XHRcdGNvbnN0IGlkID0gY2FyZC5kYXRhc2V0LmNhcmRJZDtcblx0XHRcdFx0cmV0dXJuIGlkIHx8IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdHByaXZhdGUgZ2V0Q2FyZHNGb3JDb2x1bW4oY29sdW1uOiBLYW5iYW5Db2x1bW4sIGRlYWRsaW5lT25seTogYm9vbGVhbik6IEthbmJhbkNhcmRbXSB7XG5cdFx0aWYgKCFkZWFkbGluZU9ubHkpIHtcblx0XHRcdHJldHVybiBjb2x1bW4uY2FyZHM7XG5cdFx0fVxuXHRcdHJldHVybiBjb2x1bW4uY2FyZHNcblx0XHRcdC5maWx0ZXIoKGNhcmQpID0+ICEhY2FyZC5kZWFkbGluZSlcblx0XHRcdC5zbGljZSgpXG5cdFx0XHQuc29ydCgoYSwgYikgPT4ge1xuXHRcdFx0XHRjb25zdCBhVGltZSA9IGEuZGVhZGxpbmUgPz8gMDtcblx0XHRcdFx0Y29uc3QgYlRpbWUgPSBiLmRlYWRsaW5lID8/IDA7XG5cdFx0XHRcdHJldHVybiBhVGltZSAtIGJUaW1lO1xuXHRcdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIGVuc3VyZVBsYWNlaG9sZGVyKCk6IEhUTUxFbGVtZW50IHtcblx0XHRpZiAoIXRoaXMucGxhY2Vob2xkZXJFbCkge1xuXHRcdFx0dGhpcy5wbGFjZWhvbGRlckVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXJFbC5hZGRDbGFzcyhcInNrLWNhcmQtcGxhY2Vob2xkZXJcIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnBsYWNlaG9sZGVyRWw7XG5cdH1cblxuXHRwcml2YXRlIG1vdmVQbGFjZWhvbGRlcihjb250YWluZXI6IEhUTUxFbGVtZW50LCBiZWZvcmVJZD86IHN0cmluZykge1xuXHRcdGlmICghdGhpcy5kcmFnU3RhdGUpIHJldHVybjtcblx0XHRjb25zdCBjb2x1bW5JZCA9IGNvbnRhaW5lci5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbHVtblwiKTtcblx0XHRpZiAoIWNvbHVtbklkKSByZXR1cm47XG5cdFx0Y29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLmVuc3VyZVBsYWNlaG9sZGVyKCk7XG5cdFx0Y29uc3QgZGVzaXJlZEhlaWdodCA9IE1hdGgubWF4KHRoaXMuZHJhZ1N0YXRlLmNhcmRIZWlnaHQgfHwgMCwgNDgpO1xuXHRcdHBsYWNlaG9sZGVyLnN0eWxlLmhlaWdodCA9IGAke2Rlc2lyZWRIZWlnaHR9cHhgO1xuXHRcdGlmIChwbGFjZWhvbGRlci5wYXJlbnRFbGVtZW50ICE9PSBjb250YWluZXIpIHtcblx0XHRcdHRoaXMucmVzdG9yZVBsYWNlaG9sZGVyUGFyZW50KCk7XG5cdFx0XHRjb250YWluZXIuYWRkQ2xhc3MoXCJzay1jYXJkcy1wbGFjZWhvbGRlclwiKTtcblx0XHR9XG5cdFx0Y29uc3QgcmVmZXJlbmNlID0gYmVmb3JlSWRcblx0XHRcdD8gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KGAuc2stY2FyZFtkYXRhLWNhcmQtaWQ9XCIke2JlZm9yZUlkfVwiXWApXG5cdFx0XHQ6IG51bGw7XG5cdFx0aWYgKHJlZmVyZW5jZSkge1xuXHRcdFx0Y29udGFpbmVyLmluc2VydEJlZm9yZShwbGFjZWhvbGRlciwgcmVmZXJlbmNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHBsYWNlaG9sZGVyKTtcblx0XHR9XG5cdFx0dGhpcy5zZXRFbXB0eU1lc3NhZ2VWaXNpYmxlKGNvbnRhaW5lciwgZmFsc2UpO1xuXHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZSA9IHsgY29sdW1uSWQsIGJlZm9yZUlkIH07XG5cdH1cblxuXHRwcml2YXRlIHJlc3RvcmVQbGFjZWhvbGRlclBhcmVudCgpIHtcblx0XHRpZiAodGhpcy5wbGFjZWhvbGRlckVsPy5wYXJlbnRFbGVtZW50KSB7XG5cdFx0XHRjb25zdCBwYXJlbnQgPSB0aGlzLnBsYWNlaG9sZGVyRWwucGFyZW50RWxlbWVudCBhcyBIVE1MRWxlbWVudDtcblx0XHRcdHBhcmVudC5yZW1vdmVDbGFzcyhcInNrLWNhcmRzLXBsYWNlaG9sZGVyXCIpO1xuXHRcdFx0dGhpcy5wbGFjZWhvbGRlckVsLnJlbW92ZSgpO1xuXHRcdFx0dGhpcy5zZXRFbXB0eU1lc3NhZ2VWaXNpYmxlKHBhcmVudCwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSByZW1vdmVQbGFjZWhvbGRlcigpIHtcblx0XHR0aGlzLnJlc3RvcmVQbGFjZWhvbGRlclBhcmVudCgpO1xuXHRcdHRoaXMucGxhY2Vob2xkZXJFbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGUgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRwcml2YXRlIHNldEVtcHR5TWVzc2FnZVZpc2libGUoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdmlzaWJsZTogYm9vbGVhbikge1xuXHRcdGNvbnN0IGVtcHR5RWwgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIuc2stZW1wdHlcIik7XG5cdFx0aWYgKGVtcHR5RWwpIHtcblx0XHRcdGVtcHR5RWwuc3R5bGUuZGlzcGxheSA9IHZpc2libGUgPyBcIlwiIDogXCJub25lXCI7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSByZXNldERyYWdTdGF0ZSgpIHtcblx0XHR0aGlzLmRyYWdTdGF0ZSA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5yZW1vdmVQbGFjZWhvbGRlcigpO1xuXHRcdHRoaXMuY29udGVudEVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2stY2FyZC1kcm9wXCIpLmZvckVhY2goKGVsKSA9PiAoZWwgYXMgSFRNTEVsZW1lbnQpLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcm9wXCIpKTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU3RhdENhcmQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdGl0bGU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZykge1xuXHRcdGNvbnN0IGNhcmQgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXQtY2FyZFwiIH0pO1xuXHRcdGNhcmQuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiB0aXRsZSwgY2xzOiBcInNrLXN0YXQtY2FyZC10aXRsZVwiIH0pO1xuXHRcdGNhcmQuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiB2YWx1ZSwgY2xzOiBcInNrLXN0YXQtY2FyZC12YWx1ZVwiIH0pO1xuXHRcdGNhcmQuY3JlYXRlRWwoXCJkaXZcIiwgeyB0ZXh0OiBkZXNjcmlwdGlvbiwgY2xzOiBcInNrLXN0YXQtY2FyZC1kZXNjXCIgfSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRhaWx5QmFyQ2hhcnQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2VyaWVzOiBEYWlseVN0YXRzUG9pbnRbXSkge1xuXHRcdGlmICghc2VyaWVzLmxlbmd0aCkge1xuXHRcdFx0Y29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1lbXB0eVwiLCB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1NjU3MFx1NjM2RVwiIH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzY3JvbGwgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LXNjcm9sbFwiIH0pO1xuXHRcdGNvbnN0IGNoYXJ0ID0gc2Nyb2xsLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydCBzay1jaGFydC1iYXJzXCIgfSk7XG5cdFx0Y29uc3QgdG9vbHRpcCA9IGNoYXJ0LmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC10b29sdGlwXCIgfSk7XG5cdFx0Y29uc3QgbWF4VmFsdWUgPSBNYXRoLm1heChcblx0XHRcdDEsXG5cdFx0XHQuLi5zZXJpZXMubWFwKChwb2ludCkgPT4gTWF0aC5tYXgocG9pbnQuY3JlYXRlZCwgcG9pbnQuY29tcGxldGVkKSksXG5cdFx0KTtcblxuXHRcdGNvbnN0IGNvbHVtbldpZHRoID0gMzY7XG5cdFx0Y2hhcnQuc3R5bGUubWluV2lkdGggPSBgJHtzZXJpZXMubGVuZ3RoICogY29sdW1uV2lkdGh9cHhgO1xuXG5cdFx0Y29uc3QgaGlkZVRvb2x0aXAgPSAoKSA9PiB0b29sdGlwLnJlbW92ZUNsYXNzKFwidmlzaWJsZVwiKTtcblxuXHRcdHNlcmllcy5mb3JFYWNoKChwb2ludCkgPT4ge1xuXHRcdFx0Y29uc3QgY29sdW1uID0gY2hhcnQuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWNvbFwiIH0pO1xuXHRcdFx0Y29uc3QgYmFycyA9IGNvbHVtbi5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtY29sLWJhcnNcIiB9KTtcblx0XHRcdGNvbnN0IGNyZWF0ZWRCYXIgPSBiYXJzLmNyZWF0ZURpdih7XG5cdFx0XHRcdGNsczogXCJzay1jaGFydC1iYXIgc2stY2hhcnQtYmFyLWNyZWF0ZWRcIixcblx0XHRcdFx0YXR0cjogeyBzdHlsZTogYGhlaWdodDokeyhwb2ludC5jcmVhdGVkIC8gbWF4VmFsdWUpICogMTAwfSVgIH0sXG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGNvbXBsZXRlZEJhciA9IGJhcnMuY3JlYXRlRGl2KHtcblx0XHRcdFx0Y2xzOiBcInNrLWNoYXJ0LWJhciBzay1jaGFydC1iYXItY29tcGxldGVkXCIsXG5cdFx0XHRcdGF0dHI6IHsgc3R5bGU6IGBoZWlnaHQ6JHsocG9pbnQuY29tcGxldGVkIC8gbWF4VmFsdWUpICogMTAwfSVgIH0sXG5cdFx0XHR9KTtcblx0XHRcdGNvbHVtbi5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtbGFiZWxcIiwgdGV4dDogcG9pbnQuZGF0ZS5zbGljZSg1KSB9KTtcblxuXHRcdFx0Y29uc3Qgc2hvd1Rvb2x0aXAgPSAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldCA9IGV2dC5jdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0XHR0b29sdGlwLnNldFRleHQoYCR7cG9pbnQuZGF0ZX0gXHU2NUIwXHU1RUZBICR7cG9pbnQuY3JlYXRlZH0gXHUwMEI3IFx1NUI4Q1x1NjIxMCAke3BvaW50LmNvbXBsZXRlZH1gKTtcblx0XHRcdFx0dG9vbHRpcC5hZGRDbGFzcyhcInZpc2libGVcIik7XG5cdFx0XHRcdGNvbnN0IGJvdW5kcyA9IGNoYXJ0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRjb25zdCB4ID0gZXZ0LmNsaWVudFggLSBib3VuZHMubGVmdDtcblx0XHRcdFx0Y29uc3QgeSA9IGV2dC5jbGllbnRZIC0gYm91bmRzLnRvcCAtIDIwO1xuXHRcdFx0XHR0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHt4fXB4YDtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS50b3AgPSBgJHt5fXB4YDtcblx0XHRcdH07XG5cdFx0XHRbY3JlYXRlZEJhciwgY29tcGxldGVkQmFyLCBjb2x1bW5dLmZvckVhY2goKGVsKSA9PiB7XG5cdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHNob3dUb29sdGlwKTtcblx0XHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBzaG93VG9vbHRpcCk7XG5cdFx0XHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIGhpZGVUb29sdGlwKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGVnZW5kID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1sZWdlbmRcIiB9KTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NjVCMFx1NUVGQVwiLCBcInZhcigtLWNvbG9yLWN5YW4sICM0ZWNkYzQpXCIpO1xuXHRcdHRoaXMucmVuZGVyTGVnZW5kSXRlbShsZWdlbmQsIFwiXHU1QjhDXHU2MjEwXCIsIFwidmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KVwiKTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyTGVnZW5kSXRlbShjb250YWluZXI6IEhUTUxFbGVtZW50LCBsYWJlbDogc3RyaW5nLCBjb2xvcjogc3RyaW5nKSB7XG5cdFx0Y29uc3QgaXRlbSA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stbGVnZW5kLWl0ZW1cIiB9KTtcblx0XHRjb25zdCBkb3QgPSBpdGVtLmNyZWF0ZURpdih7IGNsczogXCJzay1sZWdlbmQtZG90XCIgfSk7XG5cdFx0KGRvdCBhcyBIVE1MRGl2RWxlbWVudCkuc3R5bGUuYmFja2dyb3VuZCA9IGNvbG9yO1xuXHRcdGl0ZW0uY3JlYXRlU3Bhbih7IHRleHQ6IGxhYmVsIH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEYWlseVJhdGVDaGFydChjb250YWluZXI6IEhUTUxFbGVtZW50LCBzZXJpZXM6IERhaWx5UmF0ZVBvaW50W10pIHtcblx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1N0YXRzXSBSZW5kZXJpbmcgZGFpbHkgcmF0ZSBjaGFydCB3aXRoXCIsIHNlcmllcy5sZW5ndGgsIFwicG9pbnRzXCIpO1xuXHRcdGlmICghc2VyaWVzLmxlbmd0aCkge1xuXHRcdFx0Y29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1lbXB0eVwiLCB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1NUI4Q1x1NjIxMFx1NzM4N1x1NjU3MFx1NjM2RVwiIH0pO1xuXHRcdFx0Y29uc29sZS5sb2coXCJbU2ltcGxlS2FuYmFuXVtTdGF0c10gRGFpbHkgcmF0ZSBjaGFydCBoYXMgbm8gZGF0YS5cIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnNvbGUubG9nKFwiW1NpbXBsZUthbmJhbl1bU3RhdHNdIERhaWx5IHJhdGUgc2FtcGxlc1wiLCBzZXJpZXMpO1xuXG5cdFx0Y29uc3Qgc2Nyb2xsID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1zY3JvbGxcIiB9KTtcblx0XHRjb25zdCBjaGFydFdyYXBwZXIgPSBzY3JvbGwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0IHNrLWNoYXJ0LWxpbmVcIiB9KTtcblx0XHRjb25zdCBtaW5Db2x1bW5zID0gTWF0aC5tYXgoc2VyaWVzLmxlbmd0aCwgNyk7XG5cdFx0Y29uc3Qgc3ZnV2lkdGggPSBtaW5Db2x1bW5zICogMzY7XG5cdFx0Y29uc3QgZWZmZWN0aXZlQ291bnQgPSBNYXRoLm1heChzZXJpZXMubGVuZ3RoLCAyKTtcblx0XHRjb25zdCBjb2x1bW5XaWR0aCA9IDM2O1xuXHRcdGNvbnN0IHdpZHRoID0gKGVmZmVjdGl2ZUNvdW50IC0gMSkgKiBjb2x1bW5XaWR0aDtcblx0XHRjb25zdCBtaW5XaWR0aCA9IE1hdGgubWF4KHNlcmllcy5sZW5ndGggKiBjb2x1bW5XaWR0aCwgd2lkdGggKyAyNCk7XG5cdFx0Y2hhcnRXcmFwcGVyLnN0eWxlLm1pbldpZHRoID0gYCR7bWluV2lkdGh9cHhgO1xuXHRcdGNvbnN0IGhlaWdodCA9IDE2MDtcblx0XHRjb25zdCBsZWZ0UGFkID0gMTI7XG5cdFx0Y29uc3QgcmlnaHRQYWQgPSAxMjtcblx0XHRjb25zdCB0b3RhbFdpZHRoID0gd2lkdGggKyBsZWZ0UGFkICsgcmlnaHRQYWQ7XG5cdFx0Y29uc3Qgc3ZnID0gY3JlYXRlU3ZnRWxlbWVudChcInN2Z1wiKSBhcyBTVkdTVkdFbGVtZW50O1xuXHRcdHNldFN2Z0F0dHJzKHN2Zywge1xuXHRcdFx0dmlld0JveDogYDAgMCAke3RvdGFsV2lkdGh9ICR7aGVpZ2h0fWAsXG5cdFx0XHRwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcIm5vbmVcIixcblx0XHRcdHdpZHRoOiBTdHJpbmcodG90YWxXaWR0aCksXG5cdFx0XHRoZWlnaHQ6IFN0cmluZyhoZWlnaHQpLFxuXHRcdH0pO1xuXHRcdGNoYXJ0V3JhcHBlci5hcHBlbmRDaGlsZChzdmcpO1xuXG5cdFx0Y29uc3QgYmFzZWxpbmUgPSBjcmVhdGVTdmdFbGVtZW50KFwibGluZVwiKTtcblx0XHRzZXRTdmdBdHRycyhiYXNlbGluZSwge1xuXHRcdFx0eDE6IFN0cmluZyhsZWZ0UGFkKSxcblx0XHRcdHkxOiBTdHJpbmcoaGVpZ2h0IC0gMSksXG5cdFx0XHR4MjogU3RyaW5nKHRvdGFsV2lkdGggLSByaWdodFBhZCksXG5cdFx0XHR5MjogU3RyaW5nKGhlaWdodCAtIDEpLFxuXHRcdFx0c3Ryb2tlOiBcInZhcigtLWJhY2tncm91bmQtbW9kaWZpZXItYm9yZGVyKVwiLFxuXHRcdFx0XCJzdHJva2Utd2lkdGhcIjogXCIxXCIsXG5cdFx0fSk7XG5cdFx0c3ZnLmFwcGVuZENoaWxkKGJhc2VsaW5lKTtcblxuXHRcdGNvbnN0IHBvaW50c0RhdGEgPSBzZXJpZXMubWFwKChwb2ludCwgaW5kZXgpID0+IHtcblx0XHRcdGNvbnN0IHggPVxuXHRcdFx0XHRzZXJpZXMubGVuZ3RoID09PSAxXG5cdFx0XHRcdFx0PyBsZWZ0UGFkICsgd2lkdGggLyAyXG5cdFx0XHRcdFx0OiBsZWZ0UGFkICsgKGluZGV4IC8gKHNlcmllcy5sZW5ndGggLSAxIHx8IDEpKSAqIHdpZHRoO1xuXHRcdFx0Y29uc3QgY2xhbXBlZFJhdGUgPSBNYXRoLm1pbihNYXRoLm1heChwb2ludC5yYXRlLCAwKSwgMTAwKTtcblx0XHRcdGNvbnN0IHkgPSBoZWlnaHQgLSAoY2xhbXBlZFJhdGUgLyAxMDApICogKGhlaWdodCAtIDIwKSAtIDEwO1xuXHRcdFx0cmV0dXJuIHsgeCwgeSwgcmF0ZTogY2xhbXBlZFJhdGUgfTtcblx0XHR9KTtcblx0XHRjb25zb2xlLmxvZyhcIltTaW1wbGVLYW5iYW5dW1N0YXRzXSBEYWlseSByYXRlIGNvb3JkaW5hdGVzXCIsIHBvaW50c0RhdGEpO1xuXHRcdGNvbnN0IHBvaW50cyA9IHBvaW50c0RhdGEubWFwKChwKSA9PiBgJHtwLnh9LCR7cC55fWApLmpvaW4oXCIgXCIpO1xuXHRcdGNvbnN0IHBvbHlsaW5lID0gY3JlYXRlU3ZnRWxlbWVudChcInBvbHlsaW5lXCIpO1xuXHRcdHNldFN2Z0F0dHJzKHBvbHlsaW5lLCB7XG5cdFx0XHRwb2ludHMsXG5cdFx0XHRmaWxsOiBcIm5vbmVcIixcblx0XHRcdHN0cm9rZTogXCJ2YXIoLS1pbnRlcmFjdGl2ZS1hY2NlbnQpXCIsXG5cdFx0XHRcInN0cm9rZS13aWR0aFwiOiBcIjNcIixcblx0XHRcdFwic3Ryb2tlLWxpbmVjYXBcIjogXCJyb3VuZFwiLFxuXHRcdFx0XCJzdHJva2UtbGluZWpvaW5cIjogXCJyb3VuZFwiLFxuXHRcdH0pO1xuXHRcdHN2Zy5hcHBlbmRDaGlsZChwb2x5bGluZSk7XG5cdFx0Y29uc3QgdG9vbHRpcCA9IGNoYXJ0V3JhcHBlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtdG9vbHRpcFwiIH0pO1xuXHRcdGNvbnN0IGhpZGVUb29sdGlwID0gKCkgPT4gdG9vbHRpcC5yZW1vdmVDbGFzcyhcInZpc2libGVcIik7XG5cblx0XHRzZXJpZXMuZm9yRWFjaCgocG9pbnQsIGluZGV4KSA9PiB7XG5cdFx0XHRjb25zdCBkb3RYID1cblx0XHRcdFx0c2VyaWVzLmxlbmd0aCA9PT0gMVxuXHRcdFx0XHRcdD8gbGVmdFBhZCArIHdpZHRoIC8gMlxuXHRcdFx0XHRcdDogbGVmdFBhZCArIChpbmRleCAvIChzZXJpZXMubGVuZ3RoIC0gMSB8fCAxKSkgKiB3aWR0aDtcblx0XHRcdGNvbnN0IGNsYW1wZWRSYXRlID0gTWF0aC5taW4oTWF0aC5tYXgocG9pbnQucmF0ZSwgMCksIDEwMCk7XG5cdFx0XHRjb25zdCBkb3RZID0gaGVpZ2h0IC0gKGNsYW1wZWRSYXRlIC8gMTAwKSAqIChoZWlnaHQgLSAyMCkgLSAxMDtcblx0XHRcdGNvbnN0IGNpcmNsZSA9IGNyZWF0ZVN2Z0VsZW1lbnQoXCJjaXJjbGVcIik7XG5cdFx0XHRzZXRTdmdBdHRycyhjaXJjbGUsIHtcblx0XHRcdFx0Y3g6IFN0cmluZyhkb3RYKSxcblx0XHRcdFx0Y3k6IFN0cmluZyhkb3RZKSxcblx0XHRcdFx0cjogXCIzXCIsXG5cdFx0XHRcdGZpbGw6IFwidmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KVwiLFxuXHRcdFx0fSk7XG5cdFx0XHRzdmcuYXBwZW5kQ2hpbGQoY2lyY2xlKTtcblx0XHRcdGNvbnN0IHNob3dUb29sdGlwID0gKGV2dDogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRjb25zdCBib3VuZHMgPSBjaGFydFdyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdGNvbnN0IHggPSBldnQuY2xpZW50WCAtIGJvdW5kcy5sZWZ0O1xuXHRcdFx0XHRjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSBib3VuZHMudG9wIC0gMjA7XG5cdFx0XHRcdHRvb2x0aXAuc2V0VGV4dChgJHtwb2ludC5kYXRlfSBcdTVCOENcdTYyMTBcdTczODcgJHtwb2ludC5yYXRlLnRvRml4ZWQoMSl9JWApO1xuXHRcdFx0XHR0b29sdGlwLmFkZENsYXNzKFwidmlzaWJsZVwiKTtcblx0XHRcdFx0dG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7eH1weGA7XG5cdFx0XHRcdHRvb2x0aXAuc3R5bGUudG9wID0gYCR7eX1weGA7XG5cdFx0XHR9O1xuXHRcdFx0Y2lyY2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHNob3dUb29sdGlwKTtcblx0XHRcdGNpcmNsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHNob3dUb29sdGlwKTtcblx0XHRcdGNpcmNsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCBoaWRlVG9vbHRpcCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBsYWJlbHMgPSBjaGFydFdyYXBwZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsLXJvd1wiIH0pIGFzIEhUTUxEaXZFbGVtZW50O1xuXHRcdGxhYmVscy5zdHlsZS5ncmlkVGVtcGxhdGVDb2x1bW5zID0gYHJlcGVhdCgke01hdGgubWF4KHNlcmllcy5sZW5ndGgsIDEpfSwgbWlubWF4KDAsIDFmcikpYDtcblx0XHRzZXJpZXMuZm9yRWFjaCgocG9pbnQpID0+IHtcblx0XHRcdGxhYmVscy5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtbGFiZWxcIiwgdGV4dDogcG9pbnQuZGF0ZS5zbGljZSg1KSB9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGVhZGxpbmVCcmVha2Rvd24oY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc3RhdHM6IFN0YXRzU25hcHNob3QpIHtcblx0XHRpZiAoIXN0YXRzLmRlYWRsaW5lQ291bnQpIHtcblx0XHRcdGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZW1wdHlcIiwgdGV4dDogXCJcdTY2ODJcdTY1RTBcdThCQkVcdTdGNkVcdTYyMkFcdTZCNjJcdTY1RjZcdTk1RjRcdTc2ODRcdTRFRkJcdTUyQTFcIiB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgaW5mbyA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZGVhZGxpbmUtaW5mb1wiIH0pO1xuXHRcdGluZm8uY3JlYXRlRGl2KHsgdGV4dDogYFx1NjcwOVx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMVx1RkYxQSR7c3RhdHMuZGVhZGxpbmVDb3VudH1gLCBjbHM6IFwic2stZGVhZGxpbmUtbGluZVwiIH0pO1xuXHRcdGluZm8uY3JlYXRlRGl2KHtcblx0XHRcdHRleHQ6IGBcdTYyMkFcdTZCNjJcdTg5ODZcdTc2RDZcdTczODdcdUZGMUEke2Zvcm1hdFBlcmNlbnQoc3RhdHMuZGVhZGxpbmVDb3ZlcmFnZSl9YCxcblx0XHRcdGNsczogXCJzay1kZWFkbGluZS1saW5lXCIsXG5cdFx0fSk7XG5cblx0XHRjb25zdCBwcm9ncmVzcyA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stcHJvZ3Jlc3NcIiB9KTtcblx0XHRwcm9ncmVzcy5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBcInNrLXByb2dyZXNzLW9uLXRpbWVcIixcblx0XHRcdGF0dHI6IHsgc3R5bGU6IGB3aWR0aDoke2Zvcm1hdFBlcmNlbnRWYWx1ZShzdGF0cy5vblRpbWVSYXRlKX0lYCB9LFxuXHRcdH0pO1xuXHRcdHByb2dyZXNzLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFwic2stcHJvZ3Jlc3Mtb3ZlcmR1ZVwiLFxuXHRcdFx0YXR0cjogeyBzdHlsZTogYHdpZHRoOiR7Zm9ybWF0UGVyY2VudFZhbHVlKHN0YXRzLm92ZXJkdWVSYXRlKX0lYCB9LFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGVnZW5kID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1wcm9ncmVzcy1sZWdlbmRcIiB9KTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NjMwOVx1NjVGNlx1NUI4Q1x1NjIxMFwiLCBcInZhcigtLWNvbG9yLWdyZWVuLCAjNGNhZjUwKVwiKTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NURGMi9cdTVDMDZcdTkwM0VcdTY3MUZcIiwgXCJ2YXIoLS1jb2xvci1yZWQsICNmZjZiNmIpXCIpO1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZFN0YXRzU25hcHNob3QocmFuZ2U6IFN0YXRzUmFuZ2UpOiBTdGF0c1NuYXBzaG90IHtcblx0XHRjb25zdCBib2FyZCA9IHRoaXMucGx1Z2luLmdldEJvYXJkKCk7XG5cdFx0Y29uc3QgY2FyZHMgPSBib2FyZC5jb2x1bW5zLmZsYXRNYXAoKGNvbCkgPT4gY29sLmNhcmRzKTtcblx0XHRjb25zdCB0b3RhbFRhc2tzID0gY2FyZHMubGVuZ3RoO1xuXHRcdGNvbnN0IGNvbXBsZXRlZENhcmRzID0gY2FyZHMuZmlsdGVyKChjYXJkKSA9PiBjYXJkLmNvbXBsZXRlZCk7XG5cdFx0Y29uc3QgY29tcGxldGVkVGFza3MgPSBjb21wbGV0ZWRDYXJkcy5sZW5ndGg7XG5cdFx0Y29uc3Qgd2lwQ291bnQgPSB0b3RhbFRhc2tzIC0gY29tcGxldGVkVGFza3M7XG5cdFx0Y29uc3QgY29tcGxldGlvblJhdGUgPSB0b3RhbFRhc2tzID8gY29tcGxldGVkVGFza3MgLyB0b3RhbFRhc2tzIDogMDtcblx0XHRjb25zdCBkZWFkbGluZUNhcmRzID0gY2FyZHMuZmlsdGVyKChjYXJkKSA9PiAhIWNhcmQuZGVhZGxpbmUpO1xuXHRcdGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cdFx0Y29uc3Qgb3ZlcmR1ZUNvdW50ID0gZGVhZGxpbmVDYXJkcy5maWx0ZXIoKGNhcmQpID0+IHtcblx0XHRcdGlmICghY2FyZC5kZWFkbGluZSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0aWYgKGNhcmQuY29tcGxldGVkKSB7XG5cdFx0XHRcdGNvbnN0IGRvbmVBdCA9IGNhcmQuY29tcGxldGVkQXQgPz8gY2FyZC51cGRhdGVkQXQ7XG5cdFx0XHRcdHJldHVybiAhIWRvbmVBdCAmJiBkb25lQXQgPiBjYXJkLmRlYWRsaW5lO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5vdyA+IGNhcmQuZGVhZGxpbmU7XG5cdFx0fSkubGVuZ3RoO1xuXHRcdGNvbnN0IG9uVGltZUNvdW50ID0gZGVhZGxpbmVDYXJkcy5maWx0ZXIoKGNhcmQpID0+IHtcblx0XHRcdGlmICghY2FyZC5kZWFkbGluZSB8fCAhY2FyZC5jb21wbGV0ZWQpIHJldHVybiBmYWxzZTtcblx0XHRcdGNvbnN0IGRvbmVBdCA9IGNhcmQuY29tcGxldGVkQXQgPz8gY2FyZC51cGRhdGVkQXQ7XG5cdFx0XHRyZXR1cm4gISFkb25lQXQgJiYgZG9uZUF0IDw9IGNhcmQuZGVhZGxpbmU7XG5cdFx0fSkubGVuZ3RoO1xuXHRcdGNvbnN0IGF2Z0N5Y2xlVGltZU1zID0gKCgpID0+IHtcblx0XHRcdGNvbnN0IGZpbmlzaGVkID0gY29tcGxldGVkQ2FyZHMuZmlsdGVyKChjYXJkKSA9PiBjYXJkLmNvbXBsZXRlZEF0KTtcblx0XHRcdGlmICghZmluaXNoZWQubGVuZ3RoKSByZXR1cm4gbnVsbDtcblx0XHRcdGNvbnN0IHRvdGFsID0gZmluaXNoZWQucmVkdWNlKFxuXHRcdFx0XHQoc3VtLCBjYXJkKSA9PiBzdW0gKyBNYXRoLm1heCgwLCAoY2FyZC5jb21wbGV0ZWRBdCEgLSBjYXJkLmNyZWF0ZWRBdCkpLFxuXHRcdFx0XHQwLFxuXHRcdFx0KTtcblx0XHRcdHJldHVybiB0b3RhbCAvIGZpbmlzaGVkLmxlbmd0aDtcblx0XHR9KSgpO1xuXG5cdFx0Y29uc3QgZGFpbHlDcmVhdGVkID0gdGhpcy5idWlsZERhaWx5U2VyaWVzKGNhcmRzLCBcImNyZWF0ZWRcIiwgcmFuZ2UpO1xuXHRcdGNvbnN0IGRhaWx5Q29tcGxldGVkID0gdGhpcy5idWlsZERhaWx5U2VyaWVzKGNhcmRzLCBcImNvbXBsZXRlZFwiLCByYW5nZSk7XG5cdFx0Y29uc3QgZGFpbHlTZXJpZXM6IERhaWx5U3RhdHNQb2ludFtdID0gZGFpbHlDcmVhdGVkLm1hcCgocG9pbnQsIGluZGV4KSA9PiAoe1xuXHRcdFx0ZGF0ZTogcG9pbnQuZGF0ZSxcblx0XHRcdGNyZWF0ZWQ6IHBvaW50LnZhbHVlLFxuXHRcdFx0Y29tcGxldGVkOiBkYWlseUNvbXBsZXRlZFtpbmRleF0/LnZhbHVlID8/IDAsXG5cdFx0fSkpO1xuXHRcdGNvbnN0IGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W10gPSBkYWlseVNlcmllcy5tYXAoKHBvaW50KSA9PiAoe1xuXHRcdFx0ZGF0ZTogcG9pbnQuZGF0ZSxcblx0XHRcdHJhdGU6XG5cdFx0XHRcdHBvaW50LmNyZWF0ZWQgfHwgcG9pbnQuY29tcGxldGVkXG5cdFx0XHRcdFx0PyBNYXRoLm1pbigxMDAsIChwb2ludC5jb21wbGV0ZWQgLyBNYXRoLm1heChwb2ludC5jcmVhdGVkLCBwb2ludC5jb21wbGV0ZWQsIDEpKSAqIDEwMClcblx0XHRcdFx0XHQ6IDAsXG5cdFx0fSkpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRvdGFsVGFza3MsXG5cdFx0XHRjb21wbGV0ZWRUYXNrcyxcblx0XHRcdHdpcENvdW50LFxuXHRcdFx0Y29tcGxldGlvblJhdGUsXG5cdFx0XHRkZWFkbGluZUNvdW50OiBkZWFkbGluZUNhcmRzLmxlbmd0aCxcblx0XHRcdGRlYWRsaW5lQ292ZXJhZ2U6IHRvdGFsVGFza3MgPyBkZWFkbGluZUNhcmRzLmxlbmd0aCAvIHRvdGFsVGFza3MgOiAwLFxuXHRcdFx0b3ZlcmR1ZUNvdW50LFxuXHRcdFx0b3ZlcmR1ZVJhdGU6IGRlYWRsaW5lQ2FyZHMubGVuZ3RoID8gb3ZlcmR1ZUNvdW50IC8gZGVhZGxpbmVDYXJkcy5sZW5ndGggOiAwLFxuXHRcdFx0b25UaW1lUmF0ZTogZGVhZGxpbmVDYXJkcy5sZW5ndGggPyBvblRpbWVDb3VudCAvIGRlYWRsaW5lQ2FyZHMubGVuZ3RoIDogMCxcblx0XHRcdGF2Z0N5Y2xlVGltZU1zLFxuXHRcdFx0ZGFpbHlTZXJpZXMsXG5cdFx0XHRkYWlseVJhdGVzLFxuXHRcdH07XG5cdH1cblxuXHRwcml2YXRlIGJ1aWxkRGFpbHlTZXJpZXMoY2FyZHM6IEthbmJhbkNhcmRbXSwga2luZDogXCJjcmVhdGVkXCIgfCBcImNvbXBsZXRlZFwiLCByYW5nZTogU3RhdHNSYW5nZSkge1xuXHRcdGNvbnN0IG1zUGVyRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMDtcblx0XHRjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IHRoaXMucmVzb2x2ZVJhbmdlKHJhbmdlKTtcblx0XHRjb25zdCBkYXlzID0gTWF0aC5tYXgoMSwgTWF0aC5yb3VuZCgoZW5kIC0gc3RhcnQpIC8gbXNQZXJEYXkpICsgMSk7XG5cdFx0Y29uc3QgYnVja2V0cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cdFx0bGV0IHByb2Nlc3NlZCA9IDA7XG5cdFx0bGV0IG91dE9mUmFuZ2UgPSAwO1xuXHRcdGxldCBtaXNzaW5nID0gMDtcblxuXHRcdGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuXHRcdFx0Y29uc3QgdGltZXN0YW1wID1cblx0XHRcdFx0a2luZCA9PT0gXCJjcmVhdGVkXCJcblx0XHRcdFx0XHQ/IGNhcmQuY3JlYXRlZEF0XG5cdFx0XHRcdFx0OiBjYXJkLmNvbXBsZXRlZEF0ID8/IChjYXJkLmNvbXBsZXRlZCA/IGNhcmQudXBkYXRlZEF0IDogbnVsbCk7XG5cdFx0XHRpZiAoIXRpbWVzdGFtcCkge1xuXHRcdFx0XHRtaXNzaW5nKys7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRpbWVzdGFtcCA8IHN0YXJ0IHx8IHRpbWVzdGFtcCA+IGVuZCkge1xuXHRcdFx0XHRvdXRPZlJhbmdlKys7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qga2V5ID0gdGhpcy50b0RheUtleSh0aW1lc3RhbXApO1xuXHRcdFx0YnVja2V0cy5zZXQoa2V5LCAoYnVja2V0cy5nZXQoa2V5KSA/PyAwKSArIDEpO1xuXHRcdFx0cHJvY2Vzc2VkKys7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2VyaWVzOiBEYWlseUNvdW50UG9pbnRbXSA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZGF5czsgaSsrKSB7XG5cdFx0XHRjb25zdCBkYXlUcyA9IHN0YXJ0ICsgaSAqIG1zUGVyRGF5O1xuXHRcdFx0Y29uc3Qga2V5ID0gdGhpcy50b0RheUtleShkYXlUcyk7XG5cdFx0XHRzZXJpZXMucHVzaCh7IGRhdGU6IGtleSwgdmFsdWU6IGJ1Y2tldHMuZ2V0KGtleSkgPz8gMCB9KTtcblx0XHR9XG5cdFx0Y29uc3QgbGFiZWwgPSBraW5kID09PSBcImNyZWF0ZWRcIiA/IFwiQ3JlYXRlZFwiIDogXCJDb21wbGV0ZWRcIjtcblx0XHRjb25zb2xlLmxvZyhgW1NpbXBsZUthbmJhbl1bU3RhdHNdICR7bGFiZWx9IHNlcmllcyBzdGF0c2AsIHtcblx0XHRcdHJhbmdlU3RhcnQ6IG5ldyBEYXRlKHN0YXJ0KS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKSxcblx0XHRcdHJhbmdlRW5kOiBuZXcgRGF0ZShlbmQpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApLFxuXHRcdFx0cG9pbnRzOiBzZXJpZXMubGVuZ3RoLFxuXHRcdFx0cHJvY2Vzc2VkLFxuXHRcdFx0b3V0T2ZSYW5nZSxcblx0XHRcdG1pc3NpbmcsXG5cdFx0fSk7XG5cdFx0cmV0dXJuIHNlcmllcztcblx0fVxuXG5cdHByaXZhdGUgcmVzb2x2ZVJhbmdlKHJhbmdlOiBTdGF0c1JhbmdlKTogeyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9IHtcblx0XHRpZiAocmFuZ2UudHlwZSA9PT0gXCJjdXN0b21cIikge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c3RhcnQ6IHRoaXMuc3RhcnRPZkRheShyYW5nZS5zdGFydCksXG5cdFx0XHRcdGVuZDogdGhpcy5zdGFydE9mRGF5KHJhbmdlLmVuZCksXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRjb25zdCBtc1BlckRheSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cdFx0Y29uc3QgZW5kID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdGNvbnN0IHN0YXJ0ID0gZW5kIC0gKHJhbmdlLmRheXMgLSAxKSAqIG1zUGVyRGF5O1xuXHRcdHJldHVybiB7IHN0YXJ0LCBlbmQgfTtcblx0fVxuXG5cdHByaXZhdGUgdG9EYXlLZXkodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRcdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdFx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdFx0Y29uc3QgZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRcdHJldHVybiBgJHt5fS0ke219LSR7ZH1gO1xuXHR9XG5cblx0cHJpdmF0ZSBzdGFydE9mRGF5KHRpbWVzdGFtcDogbnVtYmVyKTogbnVtYmVyIHtcblx0XHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0XHRkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuXHRcdHJldHVybiBkYXRlLmdldFRpbWUoKTtcblx0fVxufVxuXG5jbGFzcyBDYXJkTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHByaXZhdGUgdGl0bGVWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgdGFnc1ZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSByZW1hcmtWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgaGlzdG9yeU5vdGUgPSBcIlwiO1xuXHRwcml2YXRlIGRlYWRsaW5lVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIHN1Ym1pdHRpbmcgPSBmYWxzZTtcblx0cHJpdmF0ZSBrZXlIYW5kbGVyID0gKGV2dDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuXHRcdGlmIChcblx0XHRcdGV2dC5rZXkgPT09IFwiRW50ZXJcIiAmJlxuXHRcdFx0IWV2dC5zaGlmdEtleSAmJlxuXHRcdFx0IWV2dC5tZXRhS2V5ICYmXG5cdFx0XHQhZXZ0LmN0cmxLZXkgJiZcblx0XHRcdCFldnQuYWx0S2V5ICYmXG5cdFx0XHQhZXZ0LmlzQ29tcG9zaW5nXG5cdFx0KSB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHZvaWQgdGhpcy5oYW5kbGVTdWJtaXQoKTtcblx0XHR9XG5cdH07XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0cHJpdmF0ZSBwbHVnaW46IFNpbXBsZUthbmJhblBsdWdpbixcblx0XHRwcml2YXRlIGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSBjYXJkPzogS2FuYmFuQ2FyZCxcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHR0aGlzLnBsdWdpbi5zZXRBY3RpdmVDb2x1bW4oY29sdW1uSWQpO1xuXHRcdGlmIChjYXJkKSB7XG5cdFx0XHR0aGlzLnRpdGxlVmFsdWUgPSBjYXJkLnRpdGxlO1xuXHRcdFx0dGhpcy50YWdzVmFsdWUgPSBjYXJkLnRhZ3Muam9pbihcIiwgXCIpO1xuXHRcdFx0dGhpcy5yZW1hcmtWYWx1ZSA9IGNhcmQucmVtYXJrO1xuXHRcdFx0dGhpcy5kZWFkbGluZVZhbHVlID0gZm9ybWF0RGF0ZVRpbWVJbnB1dChjYXJkLmRlYWRsaW5lKTtcblx0XHR9XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKFwic2stbW9kYWxcIik7XG5cdFx0Y29udGVudEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5SGFuZGxlcik7XG5cblx0XHRjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMuY2FyZCA/IFwiXHU3RjE2XHU4RjkxXHU1MzYxXHU3MjQ3XCIgOiBcIlx1NjVCMFx1NTg5RVx1NTM2MVx1NzI0N1wiIH0pO1xuXG5cdFx0dGhpcy50aXRsZVZhbHVlID0gdGhpcy50aXRsZVZhbHVlIHx8IFwiXCI7XG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MDdcdTk4OThcIiwgdGhpcy50aXRsZVZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMudGl0bGVWYWx1ZSA9IHZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MDdcdTdCN0VcdUZGMDhcdTkwMTdcdTUzRjdcdTUyMDZcdTk2OTRcdUZGMDlcIiwgdGhpcy50YWdzVmFsdWUsICh2YWx1ZSkgPT4ge1xuXHRcdFx0dGhpcy50YWdzVmFsdWUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdFx0Y3JlYXRlVGV4dEFyZWEoY29udGVudEVsLCBcIlx1NTkwN1x1NkNFOFwiLCB0aGlzLnJlbWFya1ZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdFx0dGhpcy5yZW1hcmtWYWx1ZSA9IHZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRcdGNyZWF0ZURhdGVUaW1lRmllbGQoY29udGVudEVsLCBcIlx1NjIyQVx1NkI2Mlx1NjVGNlx1OTVGNFwiLCB0aGlzLmRlYWRsaW5lVmFsdWUsICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHR0aGlzLmRlYWRsaW5lVmFsdWUgPSB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEFyZWEoY29udGVudEVsLCBcIlx1NEZFRVx1NjUzOVx1OEJGNFx1NjYwRVx1RkYwOFx1NTE5OVx1NTE2NVx1NTM4Nlx1NTNGMlx1RkYwOVwiLCBcIlwiLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMuaGlzdG9yeU5vdGUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGZvb3RlciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stbW9kYWwtZm9vdGVyXCIgfSk7XG5cdFx0Y29uc3QgY2FuY2VsQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTUzRDZcdTZEODhcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3RcIiB9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG5cblx0XHRjb25zdCBzdWJtaXRCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogdGhpcy5jYXJkID8gXCJcdTRGRERcdTVCNThcIiA6IFwiXHU1MjFCXHU1RUZBXCIsXG5cdFx0XHRjbHM6IFwic2stYnRuXCIsXG5cdFx0fSk7XG5cdFx0c3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB2b2lkIHRoaXMuaGFuZGxlU3VibWl0KCkpO1xuXHR9XG5cblx0b25DbG9zZSgpIHtcblx0XHR0aGlzLmNvbnRlbnRFbC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleUhhbmRsZXIpO1xuXHRcdHN1cGVyLm9uQ2xvc2UoKTtcblx0fVxuXG5cdGFzeW5jIGhhbmRsZVN1Ym1pdCgpIHtcblx0XHRpZiAodGhpcy5zdWJtaXR0aW5nKSByZXR1cm47XG5cdFx0aWYgKCF0aGlzLnRpdGxlVmFsdWUudHJpbSgpKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODA3XHU5ODk4XHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLnN1Ym1pdHRpbmcgPSB0cnVlO1xuXHRcdGNvbnN0IHRhZ3MgPSBwYXJzZVRhZ3ModGhpcy50YWdzVmFsdWUpO1xuXHRcdGNvbnN0IHJlbWFyayA9IHRoaXMucmVtYXJrVmFsdWUudHJpbSgpO1xuXHRcdGNvbnN0IGRlYWRsaW5lID0gcGFyc2VEYXRlVGltZUlucHV0KHRoaXMuZGVhZGxpbmVWYWx1ZSk7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmNhcmQpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4udXBkYXRlQ2FyZChcblx0XHRcdFx0XHR0aGlzLmNvbHVtbklkLFxuXHRcdFx0XHRcdHRoaXMuY2FyZC5pZCxcblx0XHRcdFx0XHR7IHRpdGxlOiB0aGlzLnRpdGxlVmFsdWUsIHRhZ3MsIHJlbWFyaywgZGVhZGxpbmUgfSxcblx0XHRcdFx0XHR0aGlzLmhpc3RvcnlOb3RlLnRyaW0oKSB8fCBcIlx1NTE4NVx1NUJCOVx1NjZGNFx1NjVCMFwiLFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uYWRkQ2FyZCh0aGlzLmNvbHVtbklkLCB7XG5cdFx0XHRcdFx0dGl0bGU6IHRoaXMudGl0bGVWYWx1ZSxcblx0XHRcdFx0XHR0YWdzLFxuXHRcdFx0XHRcdHJlbWFyayxcblx0XHRcdFx0XHRoaXN0b3J5Tm90ZTogdGhpcy5oaXN0b3J5Tm90ZS50cmltKCkgfHwgXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdFx0XHRkZWFkbGluZSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuc3VibWl0dGluZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxufVxuXG5pbnRlcmZhY2UgQ29sdW1uTW9kYWxPcHRpb25zIHtcblx0dGl0bGU6IHN0cmluZztcblx0aW5pdGlhbFZhbHVlPzogc3RyaW5nO1xuXHRjb25maXJtVGV4dD86IHN0cmluZztcblx0b25TdWJtaXQ6ICh2YWx1ZTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+O1xufVxuXG5jbGFzcyBDb2x1bW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSB2YWx1ZTogc3RyaW5nO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9wdGlvbnM6IENvbHVtbk1vZGFsT3B0aW9ucykge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy52YWx1ZSA9IG9wdGlvbnMuaW5pdGlhbFZhbHVlID8/IFwiXCI7XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKFwic2stbW9kYWxcIik7XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLm9wdGlvbnMudGl0bGUgfSk7XG5cblx0XHRjcmVhdGVUZXh0RmllbGQoY29udGVudEVsLCBcIlx1NjgwRlx1NzZFRVx1NTQwRFx1NzlGMFwiLCB0aGlzLnZhbHVlLCAodmFsdWUpID0+ICh0aGlzLnZhbHVlID0gdmFsdWUpKTtcblxuXHRcdGNvbnN0IGZvb3RlciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stbW9kYWwtZm9vdGVyXCIgfSk7XG5cdFx0Y29uc3QgY2FuY2VsQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTUzRDZcdTZEODhcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3RcIiB9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG5cblx0XHRjb25zdCBjb25maXJtQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMub3B0aW9ucy5jb25maXJtVGV4dCB8fCBcIlx1Nzg2RVx1OEJBNFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcblx0XHRcdGF3YWl0IHRoaXMub3B0aW9ucy5vblN1Ym1pdCh0aGlzLnZhbHVlKTtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9KTtcblx0fVxufVxuXG5pbnRlcmZhY2UgQ29uZmlybU1vZGFsT3B0aW9ucyB7XG5cdHRpdGxlOiBzdHJpbmc7XG5cdG1lc3NhZ2U6IHN0cmluZztcblx0Y29uZmlybVRleHQ/OiBzdHJpbmc7XG5cdGNhbmNlbFRleHQ/OiBzdHJpbmc7XG5cdG9uQ29uZmlybTogKCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG59XG5cbmNsYXNzIENvbmZpcm1Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb3B0aW9uczogQ29uZmlybU1vZGFsT3B0aW9ucykge1xuXHRcdHN1cGVyKGFwcCk7XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKFwic2stbW9kYWxcIik7XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLm9wdGlvbnMudGl0bGUgfSk7XG5cdFx0Y29udGVudEVsLmNyZWF0ZURpdih7IHRleHQ6IHRoaXMub3B0aW9ucy5tZXNzYWdlLCBjbHM6IFwic2stY29uZmlybS10ZXh0XCIgfSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY2FuY2VsVGV4dCB8fCBcIlx1NTNENlx1NkQ4OFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3RcIixcblx0XHR9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG5cblx0XHRjb25zdCBjb25maXJtQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMub3B0aW9ucy5jb25maXJtVGV4dCB8fCBcIlx1Nzg2RVx1OEJBNFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcblx0XHRcdGF3YWl0IHRoaXMub3B0aW9ucy5vbkNvbmZpcm0oKTtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVRhZ3MoaW5wdXQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcblx0cmV0dXJuIGlucHV0XG5cdFx0LnNwbGl0KFwiLFwiKVxuXHRcdC5tYXAoKHRhZykgPT4gdGFnLnRyaW0oKSlcblx0XHQuZmlsdGVyKCh0YWcpID0+ICEhdGFnKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXRlVGltZUlucHV0KHZhbHVlOiBzdHJpbmcpOiBudW1iZXIgfCBudWxsIHtcblx0aWYgKCF2YWx1ZS50cmltKCkpIHJldHVybiBudWxsO1xuXHRjb25zdCBwYXJzZWQgPSBEYXRlLnBhcnNlKHZhbHVlKTtcblx0cmV0dXJuIE51bWJlci5pc05hTihwYXJzZWQpID8gbnVsbCA6IHBhcnNlZDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWVJbnB1dCh2YWx1ZT86IG51bWJlciB8IG51bGwpOiBzdHJpbmcge1xuXHRpZiAoIXZhbHVlKSByZXR1cm4gXCJcIjtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKTtcblx0Y29uc3QgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbW0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkZCA9IFN0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBoaCA9IFN0cmluZyhkYXRlLmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgbWluID0gU3RyaW5nKGRhdGUuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5eXl5fS0ke21tfS0ke2RkfVQke2hofToke21pbn1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJZCgpIHtcblx0cmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpICsgRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgaGggPSBTdHJpbmcoZGF0ZS5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IG1tID0gU3RyaW5nKGRhdGUuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5fS0ke219LSR7ZH0gJHtoaH06JHttbX1gO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQZXJjZW50KHZhbHVlOiBudW1iZXIsIGRpZ2l0cyA9IDApOiBzdHJpbmcge1xuXHRpZiAoIU51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJldHVybiBcIjAlXCI7XG5cdHJldHVybiBgJHsoTWF0aC5tYXgoMCwgdmFsdWUpICogMTAwKS50b0ZpeGVkKGRpZ2l0cyl9JWA7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFBlcmNlbnRWYWx1ZSh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcblx0aWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gMDtcblx0cmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgdmFsdWUgKiAxMDApKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RHVyYXRpb24obXM6IG51bWJlcik6IHN0cmluZyB7XG5cdGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKG1zIC8gNjAwMDApO1xuXHRjb25zdCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKTtcblx0Y29uc3QgZGF5cyA9IE1hdGguZmxvb3IoaG91cnMgLyAyNCk7XG5cdGlmIChkYXlzID4gMCkge1xuXHRcdGNvbnN0IHJlbUhvdXJzID0gaG91cnMgJSAyNDtcblx0XHRyZXR1cm4gcmVtSG91cnMgPyBgJHtkYXlzfVx1NTkyOSR7cmVtSG91cnN9XHU1QzBGXHU2NUY2YCA6IGAke2RheXN9XHU1OTI5YDtcblx0fVxuXHRpZiAoaG91cnMgPiAwKSB7XG5cdFx0Y29uc3QgcmVtTWludXRlcyA9IG1pbnV0ZXMgJSA2MDtcblx0XHRyZXR1cm4gcmVtTWludXRlcyA/IGAke2hvdXJzfVx1NUMwRlx1NjVGNiR7cmVtTWludXRlc31cdTUyMDZgIDogYCR7aG91cnN9XHU1QzBGXHU2NUY2YDtcblx0fVxuXHRyZXR1cm4gYCR7TWF0aC5tYXgobWludXRlcywgMSl9XHU1MjA2YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZUlucHV0VmFsdWUodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0cmV0dXJuIGAke3l9LSR7bX0tJHtkfWA7XG59XG5cbmNvbnN0IFNWR19OUyA9IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtcblxuZnVuY3Rpb24gY3JlYXRlU3ZnRWxlbWVudDxUIGV4dGVuZHMga2V5b2YgU1ZHRWxlbWVudFRhZ05hbWVNYXA+KHRhZzogVCk6IFNWR0VsZW1lbnRUYWdOYW1lTWFwW1RdIHtcblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhTVkdfTlMsIHRhZyk7XG59XG5cbmZ1bmN0aW9uIHNldFN2Z0F0dHJzKGVsOiBFbGVtZW50LCBhdHRyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuXHRPYmplY3QuZW50cmllcyhhdHRycykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiBlbC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0RmllbGQoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgaW5wdXQgPSB3cmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiB9KTtcblx0aW5wdXQudmFsdWUgPSB2YWx1ZTtcblx0aW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGVUaW1lRmllbGQoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgaW5wdXQgPSB3cmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImRhdGV0aW1lLWxvY2FsXCIgfSk7XG5cdGlucHV0LnZhbHVlID0gdmFsdWU7XG5cdGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZ0KSA9PiBvbkNoYW5nZSgoZXZ0LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSkpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0QXJlYShcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0bGFiZWw6IHN0cmluZyxcblx0dmFsdWU6IHN0cmluZyxcblx0b25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG5cdGNvbnN0IHdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWZpZWxkXCIgfSk7XG5cdHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IHRleHQ6IGxhYmVsIH0pO1xuXHRjb25zdCB0ZXh0YXJlYSA9IHdyYXBwZXIuY3JlYXRlRWwoXCJ0ZXh0YXJlYVwiKTtcblx0dGV4dGFyZWEudmFsdWUgPSB2YWx1ZTtcblx0dGV4dGFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQpLnZhbHVlKSk7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFBb0U7QUFFcEUsSUFBTSxZQUFZO0FBQ2xCLElBQU0sVUFBVTtBQWlFaEIsSUFBTSxrQkFBa0IsQ0FBQyxzQkFBTyxzQkFBTyxvQkFBSztBQUc1QyxTQUFTLHFCQUFzQztBQUM5QyxTQUFPO0FBQUEsSUFDTixTQUFTLGdCQUFnQixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQ3ZDLElBQUksU0FBUztBQUFBLE1BQ2I7QUFBQSxNQUNBLE9BQU8sQ0FBQztBQUFBLElBQ1QsRUFBRTtBQUFBLEVBQ0g7QUFDRDtBQUVBLElBQXFCLHFCQUFyQixjQUFnRCx1QkFBTztBQUFBLEVBQXZEO0FBQUE7QUFDQyxTQUFRLFFBQXlCLG1CQUFtQjtBQUNwRCxTQUFRLFFBQVEsb0JBQUksSUFBZ0I7QUFBQTtBQUFBLEVBR3BDLE1BQU0sU0FBUztBQUNkLFVBQU0sS0FBSyxVQUFVO0FBRXJCLFNBQUssYUFBYSxXQUFXLENBQUMsU0FBUztBQUN0QyxZQUFNLE9BQU8sSUFBSSxXQUFXLE1BQU0sSUFBSTtBQUN0QyxXQUFLLG1CQUFtQixJQUFJO0FBQzVCLGFBQU87QUFBQSxJQUNSLENBQUM7QUFFRCxTQUFLLGNBQWMsU0FBUyx3Q0FBVSxNQUFNLEtBQUssYUFBYSxDQUFDO0FBQy9ELFNBQUssV0FBVztBQUFBLE1BQ2YsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLEtBQUssYUFBYTtBQUFBLElBQ25DLENBQUM7QUFDRCxTQUFLLFdBQVc7QUFBQSxNQUNmLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxPQUFPLE9BQU8sR0FBRyxLQUFLLElBQUksQ0FBQztBQUFBLE1BQ25ELFVBQVUsTUFBTSxLQUFLLGlCQUFpQjtBQUFBLElBQ3ZDLENBQUM7QUFFRCxTQUFLLElBQUksVUFBVSxjQUFjLE1BQU0sS0FBSyxhQUFhLENBQUM7QUFBQSxFQUMzRDtBQUFBLEVBRUEsV0FBVztBQUNWLFNBQUssTUFBTSxNQUFNO0FBQUEsRUFDbEI7QUFBQSxFQUVBLE1BQWMsWUFBWTtBQUN6QixVQUFNLFNBQVMsTUFBTSxLQUFLLFNBQVM7QUFDbkMsUUFBSSxVQUFVLE9BQU8sU0FBUztBQUM3QixXQUFLLFFBQVE7QUFBQSxJQUNkLE9BQU87QUFDTixXQUFLLFFBQVEsbUJBQW1CO0FBQUEsSUFDakM7QUFDQSxTQUFLLGVBQWU7QUFDcEIsU0FBSyxlQUFlLEtBQUssTUFBTSxRQUFRLENBQUMsR0FBRztBQUFBLEVBQzVDO0FBQUEsRUFFQSxNQUFjLFVBQVU7QUFDdkIsVUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQzlCLFNBQUssWUFBWTtBQUFBLEVBQ2xCO0FBQUEsRUFFQSxtQkFBbUIsTUFBa0I7QUFDcEMsU0FBSyxNQUFNLElBQUksSUFBSTtBQUNuQixTQUFLLFNBQVMsTUFBTSxLQUFLLE1BQU0sT0FBTyxJQUFJLENBQUM7QUFBQSxFQUM1QztBQUFBLEVBRUEsY0FBYztBQUNiLFNBQUssTUFBTSxRQUFRLENBQUMsU0FBUyxLQUFLLE9BQU8sQ0FBQztBQUFBLEVBQzNDO0FBQUEsRUFFQSxXQUE0QjtBQUMzQixXQUFPLEtBQUs7QUFBQSxFQUNiO0FBQUEsRUFFQSxNQUFNLFVBQVUsTUFBYztBQUM3QixRQUFJLENBQUMsS0FBSyxLQUFLLEdBQUc7QUFDakIsVUFBSSx1QkFBTyxrREFBVTtBQUNyQjtBQUFBLElBQ0Q7QUFDQSxVQUFNLFNBQVMsRUFBRSxJQUFJLFNBQVMsR0FBRyxNQUFNLEtBQUssS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFrQjtBQUM5RSxTQUFLLE1BQU0sUUFBUSxLQUFLLE1BQU07QUFDOUIsUUFBSSxDQUFDLEtBQUssY0FBYztBQUN2QixXQUFLLGVBQWUsT0FBTztBQUFBLElBQzVCO0FBQ0EsVUFBTSxLQUFLLFFBQVE7QUFBQSxFQUNwQjtBQUFBLEVBRUEsTUFBTSxhQUFhLFVBQWtCO0FBQ3BDLFVBQU0sUUFBUSxLQUFLLE1BQU0sUUFBUSxVQUFVLENBQUMsUUFBUSxJQUFJLE9BQU8sUUFBUTtBQUN2RSxRQUFJLFVBQVUsSUFBSTtBQUNqQixVQUFJLHVCQUFPLDRDQUFTO0FBQ3BCO0FBQUEsSUFDRDtBQUNBLFNBQUssTUFBTSxRQUFRLE9BQU8sT0FBTyxDQUFDO0FBQ2xDLFFBQUksS0FBSyxpQkFBaUIsVUFBVTtBQUNuQyxXQUFLLGVBQWUsS0FBSyxNQUFNLFFBQVEsQ0FBQyxHQUFHO0FBQUEsSUFDNUM7QUFDQSxVQUFNLEtBQUssUUFBUTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxNQUFNLGFBQWEsVUFBa0IsTUFBYztBQUNsRCxVQUFNLFNBQVMsS0FBSyxVQUFVLFFBQVE7QUFDdEMsVUFBTSxXQUFXLEtBQUssS0FBSztBQUMzQixRQUFJLENBQUMsVUFBVTtBQUNkLFVBQUksdUJBQU8sa0RBQVU7QUFDckI7QUFBQSxJQUNEO0FBQ0EsV0FBTyxPQUFPO0FBQ2QsVUFBTSxLQUFLLFFBQVE7QUFBQSxFQUNwQjtBQUFBLEVBRUEsTUFBTSxRQUNMLFVBQ0EsU0FPQztBQUNELFVBQU0sU0FBUyxLQUFLLFVBQVUsUUFBUTtBQUN0QyxVQUFNLE1BQU0sS0FBSyxJQUFJO0FBQ3JCLFVBQU0sT0FBbUI7QUFBQSxNQUN4QixJQUFJLFNBQVM7QUFBQSxNQUNiLE9BQU8sUUFBUSxNQUFNLEtBQUs7QUFBQSxNQUMxQixNQUFNLFFBQVE7QUFBQSxNQUNkLFFBQVEsUUFBUTtBQUFBLE1BQ2hCLFVBQVUsUUFBUSxZQUFZO0FBQUEsTUFDOUIsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsV0FBVztBQUFBLE1BQ1gsU0FBUyxDQUFDO0FBQUEsSUFDWDtBQUNBLFNBQUssY0FBYyxNQUFNLFFBQVEsZUFBZSxjQUFJO0FBQ3BELFdBQU8sTUFBTSxRQUFRLElBQUk7QUFDekIsVUFBTSxLQUFLLFFBQVE7QUFBQSxFQUNwQjtBQUFBLEVBRUEsTUFBTSxXQUNMLFVBQ0EsUUFDQSxTQUNBLGFBQ0M7QUFDRCxVQUFNLE9BQU8sS0FBSyxRQUFRLFVBQVUsTUFBTTtBQUMxQyxRQUFJLENBQUM7QUFBTTtBQUNYLFFBQUksUUFBUSxVQUFVO0FBQVcsV0FBSyxRQUFRLFFBQVEsTUFBTSxLQUFLO0FBQ2pFLFFBQUksUUFBUSxTQUFTO0FBQVcsV0FBSyxPQUFPLFFBQVE7QUFDcEQsUUFBSSxRQUFRLFdBQVc7QUFBVyxXQUFLLFNBQVMsUUFBUTtBQUN4RCxRQUFJLFFBQVEsYUFBYTtBQUFXLFdBQUssV0FBVyxRQUFRO0FBQzVELFNBQUssWUFBWSxLQUFLLElBQUk7QUFDMUIsU0FBSyxjQUFjLE1BQU0sZUFBZSwwQkFBTTtBQUM5QyxVQUFNLEtBQUssUUFBUTtBQUFBLEVBQ3BCO0FBQUEsRUFFQSxNQUFNLFNBQ0wsUUFDQSxjQUNBLFlBQ0EsY0FDQztBQUNELFVBQU0sYUFBYSxLQUFLLFVBQVUsWUFBWTtBQUM5QyxVQUFNLFdBQVcsS0FBSyxVQUFVLFVBQVU7QUFDMUMsVUFBTSxRQUFRLFdBQVcsTUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sTUFBTTtBQUMvRCxRQUFJLFVBQVU7QUFBSTtBQUNsQixVQUFNLENBQUMsSUFBSSxJQUFJLFdBQVcsTUFBTSxPQUFPLE9BQU8sQ0FBQztBQUMvQyxRQUFJLGNBQWMsU0FBUyxNQUFNO0FBQ2pDLFFBQUksY0FBYztBQUNqQixZQUFNLGNBQWMsU0FBUyxNQUFNLFVBQVUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxZQUFZO0FBQ3pFLG9CQUFjLGdCQUFnQixLQUFLLFNBQVMsTUFBTSxTQUFTO0FBQUEsSUFDNUQ7QUFDQSxhQUFTLE1BQU0sT0FBTyxhQUFhLEdBQUcsSUFBSTtBQUMxQyxTQUFLLFlBQVksS0FBSyxJQUFJO0FBQzFCLFFBQUksaUJBQWlCLFlBQVk7QUFDaEMsV0FBSyxjQUFjLE1BQU0sMkJBQU8sU0FBUyxJQUFJLFFBQUc7QUFBQSxJQUNqRCxPQUFPO0FBQ04sV0FBSyxjQUFjLE1BQU0sMEJBQU07QUFBQSxJQUNoQztBQUNBLFVBQU0sS0FBSyxRQUFRO0FBQUEsRUFDcEI7QUFBQSxFQUVBLE1BQU0scUJBQXFCLFVBQWtCLFFBQWdCLFdBQW9CO0FBQ2hGLFVBQU0sU0FBUyxLQUFLLFVBQVUsUUFBUTtBQUN0QyxVQUFNLFFBQVEsT0FBTyxNQUFNLFVBQVUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxNQUFNO0FBQzNELFFBQUksVUFBVTtBQUFJO0FBQ2xCLFVBQU0sQ0FBQyxJQUFJLElBQUksT0FBTyxNQUFNLE9BQU8sT0FBTyxDQUFDO0FBQzNDLFNBQUssWUFBWTtBQUNqQixTQUFLLGNBQWMsWUFBWSxLQUFLLElBQUksSUFBSTtBQUM1QyxTQUFLLFlBQVksS0FBSyxJQUFJO0FBQzFCLFNBQUssY0FBYyxNQUFNLFlBQVksNkJBQVMsMEJBQU07QUFDcEQsVUFBTSxjQUFjLFlBQVksT0FBTyxNQUFNLFNBQVMsS0FBSyxJQUFJLE9BQU8sT0FBTyxNQUFNLE1BQU07QUFDekYsV0FBTyxNQUFNLE9BQU8sYUFBYSxHQUFHLElBQUk7QUFDeEMsVUFBTSxLQUFLLFFBQVE7QUFBQSxFQUNwQjtBQUFBLEVBRVEsVUFBVSxVQUFnQztBQUNqRCxVQUFNLFNBQVMsS0FBSyxNQUFNLFFBQVEsS0FBSyxDQUFDLFFBQVEsSUFBSSxPQUFPLFFBQVE7QUFDbkUsUUFBSSxDQUFDLFFBQVE7QUFDWixZQUFNLElBQUksTUFBTSxrREFBVTtBQUFBLElBQzNCO0FBQ0EsV0FBTztBQUFBLEVBQ1I7QUFBQSxFQUVRLFFBQVEsVUFBa0IsUUFBd0M7QUFDekUsVUFBTSxTQUFTLEtBQUssVUFBVSxRQUFRO0FBQ3RDLFdBQU8sT0FBTyxNQUFNLEtBQUssQ0FBQyxTQUFTLEtBQUssT0FBTyxNQUFNO0FBQUEsRUFDdEQ7QUFBQSxFQUVRLGNBQWMsTUFBa0IsUUFBZ0I7QUFDdkQsUUFBSSxDQUFDLE1BQU0sUUFBUSxLQUFLLE9BQU8sR0FBRztBQUNqQyxXQUFLLFVBQVUsQ0FBQztBQUFBLElBQ2pCO0FBQ0EsU0FBSyxRQUFRLFFBQVE7QUFBQSxNQUNwQixXQUFXLEtBQUssSUFBSTtBQUFBLE1BQ3BCLFFBQVEsVUFBVTtBQUFBLElBQ25CLENBQUM7QUFDRCxTQUFLLFVBQVUsS0FBSyxRQUFRLE1BQU0sR0FBRyxFQUFFO0FBQUEsRUFDeEM7QUFBQSxFQUVRLGlCQUFpQjtBQUN4QixlQUFXLFVBQVUsS0FBSyxNQUFNLFNBQVM7QUFDeEMsYUFBTyxRQUFRLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVTtBQUFBLFFBQzFDLEdBQUc7QUFBQSxRQUNILFVBQVUsS0FBSyxZQUFZO0FBQUEsUUFDM0IsYUFBYSxLQUFLLGVBQWU7QUFBQSxNQUNsQyxFQUFFO0FBQUEsSUFDSDtBQUFBLEVBQ0Q7QUFBQSxFQUVBLE1BQU0sZUFBZTtBQUNwQixVQUFNLFNBQVMsS0FBSyxJQUFJLFVBQVUsZ0JBQWdCLFNBQVM7QUFDM0QsUUFBSSxPQUFPLFNBQVMsR0FBRztBQUN0QixXQUFLLElBQUksVUFBVSxXQUFXLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZDO0FBQUEsSUFDRDtBQUNBLFVBQU0sWUFBWSxLQUFLLElBQUksVUFBVSxhQUFhLEtBQUs7QUFDdkQsVUFBTSxXQUFXLGFBQWEsRUFBRSxNQUFNLFdBQVcsUUFBUSxLQUFLLENBQUM7QUFDL0QsUUFBSSxXQUFXO0FBQ2QsV0FBSyxJQUFJLFVBQVUsV0FBVyxTQUFTO0FBQUEsSUFDeEM7QUFBQSxFQUNEO0FBQUEsRUFFQSxnQkFBZ0IsVUFBa0I7QUFDakMsU0FBSyxlQUFlO0FBQUEsRUFDckI7QUFBQSxFQUVRLDJCQUFxRDtBQUM1RCxRQUFJLENBQUMsS0FBSyxNQUFNLFFBQVE7QUFBUSxhQUFPO0FBQ3ZDLFVBQU0sWUFDTCxLQUFLLGdCQUFnQixLQUFLLE1BQU0sUUFBUSxLQUFLLENBQUMsUUFBUSxJQUFJLE9BQU8sS0FBSyxZQUFZO0FBQ25GLFdBQU8sYUFBYSxLQUFLLE1BQU0sUUFBUSxDQUFDO0FBQUEsRUFDekM7QUFBQSxFQUVBLG1CQUFtQjtBQUNsQixVQUFNLFNBQVMsS0FBSyx5QkFBeUI7QUFDN0MsUUFBSSxDQUFDLFFBQVE7QUFDWixVQUFJLHVCQUFPLHNDQUFRO0FBQ25CO0FBQUEsSUFDRDtBQUNBLFNBQUssZ0JBQWdCLE9BQU8sRUFBRTtBQUM5QixRQUFJLFVBQVUsS0FBSyxLQUFLLE1BQU0sT0FBTyxFQUFFLEVBQUUsS0FBSztBQUFBLEVBQy9DO0FBQ0Q7QUFFQSxJQUFNLGFBQU4sY0FBeUIseUJBQVM7QUFBQSxFQVFqQyxZQUFZLE1BQTZCLFFBQTRCO0FBQ3BFLFVBQU0sSUFBSTtBQUQ4QjtBQUp6QyxTQUFRLGtCQUFrQixvQkFBSSxJQUFxQjtBQUNuRCxTQUFRLFlBQStCO0FBQ3ZDLFNBQVEsYUFBeUIsRUFBRSxNQUFNLFVBQVUsTUFBTSxHQUFHO0FBQUEsRUFJNUQ7QUFBQSxFQUVBLGNBQWM7QUFDYixXQUFPO0FBQUEsRUFDUjtBQUFBLEVBRUEsaUJBQXlCO0FBQ3hCLFdBQU87QUFBQSxFQUNSO0FBQUEsRUFFQSxVQUFrQjtBQUNqQixXQUFPO0FBQUEsRUFDUjtBQUFBLEVBRUEsTUFBTSxTQUFTO0FBQ2QsU0FBSyxPQUFPO0FBQUEsRUFDYjtBQUFBLEVBRUEsTUFBTSxVQUFVO0FBQ2YsU0FBSyxZQUFZO0FBQUEsRUFDbEI7QUFBQSxFQUVBLFNBQVM7QUFDUixVQUFNLFlBQVksS0FBSztBQUN2QixjQUFVLE1BQU07QUFDaEIsY0FBVSxTQUFTLFdBQVc7QUFFOUIsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssVUFBVSxDQUFDO0FBQ25ELFNBQUssZ0JBQWdCLE1BQU0sU0FBUywwQkFBTTtBQUMxQyxTQUFLLGdCQUFnQixNQUFNLFNBQVMsMEJBQU07QUFFMUMsVUFBTSxPQUFPLFVBQVUsVUFBVSxFQUFFLEtBQUssZUFBZSxDQUFDO0FBQ3hELFFBQUksS0FBSyxjQUFjLFNBQVM7QUFDL0IsV0FBSyxZQUFZLElBQUk7QUFBQSxJQUN0QixPQUFPO0FBQ04sV0FBSyxZQUFZLElBQUk7QUFBQSxJQUN0QjtBQUFBLEVBQ0Q7QUFBQSxFQUVRLGdCQUFnQixXQUF3QixLQUF3QixPQUFlO0FBQ3RGLFVBQU0sU0FBUyxVQUFVLFNBQVMsVUFBVTtBQUFBLE1BQzNDLE1BQU07QUFBQSxNQUNOLEtBQUssQ0FBQyxVQUFVLEtBQUssY0FBYyxNQUFNLGtCQUFrQixFQUFFLEVBQUUsS0FBSyxHQUFHLEVBQUUsS0FBSztBQUFBLElBQy9FLENBQUM7QUFDRCxXQUFPLGlCQUFpQixTQUFTLE1BQU07QUFDdEMsVUFBSSxLQUFLLGNBQWM7QUFBSztBQUM1QixXQUFLLFlBQVk7QUFDakIsV0FBSyxPQUFPO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRVEsWUFBWSxNQUFtQjtBQUN0QyxVQUFNLFFBQVEsS0FBSyxPQUFPLFNBQVM7QUFFbkMsVUFBTSxTQUFTLEtBQUssVUFBVSxFQUFFLEtBQUssWUFBWSxDQUFDO0FBQ2xELFdBQU8sU0FBUyxNQUFNLEVBQUUsTUFBTSwyQkFBTyxDQUFDO0FBQ3RDLFVBQU0sZUFBZSxPQUFPLFNBQVMsVUFBVTtBQUFBLE1BQzlDLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxJQUNOLENBQUM7QUFDRCxpQkFBYSxpQkFBaUIsU0FBUyxNQUFNO0FBQzVDLFVBQUksWUFBWSxLQUFLLEtBQUs7QUFBQSxRQUN6QixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixVQUFVLE9BQU8sVUFBVTtBQUMxQixnQkFBTSxLQUFLLE9BQU8sVUFBVSxLQUFLO0FBQUEsUUFDbEM7QUFBQSxNQUNELENBQUMsRUFBRSxLQUFLO0FBQUEsSUFDVCxDQUFDO0FBRUQsVUFBTSxpQkFBaUIsS0FBSyxVQUFVLEVBQUUsS0FBSyxhQUFhLENBQUM7QUFDM0QsUUFBSSxDQUFDLE1BQU0sUUFBUSxRQUFRO0FBQzFCLHFCQUFlLFVBQVUsRUFBRSxNQUFNLHdGQUFrQixLQUFLLFdBQVcsQ0FBQztBQUNwRTtBQUFBLElBQ0Q7QUFFQSxlQUFXLFVBQVUsTUFBTSxTQUFTO0FBQ25DLFdBQUssYUFBYSxnQkFBZ0IsTUFBTTtBQUFBLElBQ3pDO0FBQUEsRUFDRDtBQUFBLEVBRVEsWUFBWSxNQUFtQjtBQUN0QyxVQUFNLFFBQVEsS0FBSyxtQkFBbUIsS0FBSyxVQUFVO0FBQ3JELFlBQVEsSUFBSSxrQ0FBa0M7QUFBQSxNQUM3QyxPQUFPLEtBQUs7QUFBQSxNQUNaLGFBQWEsTUFBTTtBQUFBLE1BQ25CLFlBQVksTUFBTTtBQUFBLElBQ25CLENBQUM7QUFFRCxTQUFLLFNBQVMsTUFBTSxFQUFFLE1BQU0sNEJBQVEsS0FBSyxpQkFBaUIsQ0FBQztBQUMzRCxVQUFNLGdCQUFnQixLQUFLLFVBQVUsRUFBRSxLQUFLLG9CQUFvQixDQUFDO0FBQ2pFLGtCQUFjLFdBQVcsRUFBRSxNQUFNLGlDQUFRLENBQUM7QUFDMUMsVUFBTSxTQUFTLGNBQWMsU0FBUyxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUMxRSxVQUFNLGdCQUF3QyxFQUFFLFdBQU0sR0FBRyxZQUFPLElBQUksWUFBTyxJQUFJLFlBQU8sR0FBRztBQUN6RixXQUFPLFFBQVEsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDLE9BQU8sSUFBSSxNQUFNO0FBQ3hELFlBQU0sU0FBUyxPQUFPLFNBQVMsVUFBVSxFQUFFLE1BQU0sT0FBTyxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7QUFDaEYsVUFBSSxLQUFLLFdBQVcsU0FBUyxZQUFZLEtBQUssV0FBVyxTQUFTO0FBQU0sZUFBTyxXQUFXO0FBQUEsSUFDM0YsQ0FBQztBQUNELFVBQU0sZUFBZSxPQUFPLFNBQVMsVUFBVSxFQUFFLE1BQU0sc0JBQU8sT0FBTyxTQUFTLENBQUM7QUFDL0UsUUFBSSxLQUFLLFdBQVcsU0FBUztBQUFVLG1CQUFhLFdBQVc7QUFFL0QsVUFBTSxlQUFlLGNBQWMsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDdkUsVUFBTSxhQUFhLGFBQWEsU0FBUyxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDbEUsVUFBTSxXQUFXLGFBQWEsU0FBUyxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDaEUsVUFBTSxxQkFBcUIsTUFBTTtBQUNoQyxVQUFJLEtBQUssV0FBVyxTQUFTLFVBQVU7QUFDdEMsbUJBQVcsUUFBUSxxQkFBcUIsS0FBSyxXQUFXLEtBQUs7QUFDN0QsaUJBQVMsUUFBUSxxQkFBcUIsS0FBSyxXQUFXLEdBQUc7QUFDekQscUJBQWEsU0FBUyx5QkFBeUI7QUFBQSxNQUNoRCxPQUFPO0FBQ04scUJBQWEsWUFBWSx5QkFBeUI7QUFBQSxNQUNuRDtBQUFBLElBQ0Q7QUFDQSx1QkFBbUI7QUFFbkIsV0FBTyxpQkFBaUIsVUFBVSxNQUFNO0FBQ3ZDLFVBQUksT0FBTyxVQUFVLFVBQVU7QUFDOUIsY0FBTSxRQUFRLEtBQUssV0FBVyxLQUFLLElBQUksQ0FBQztBQUN4QyxjQUFNLGVBQWUsUUFBUSxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQ2pELGFBQUssYUFBYSxFQUFFLE1BQU0sVUFBVSxPQUFPLGNBQWMsS0FBSyxNQUFNO0FBQUEsTUFDckUsT0FBTztBQUNOLGFBQUssYUFBYSxFQUFFLE1BQU0sVUFBVSxNQUFNLE9BQU8sT0FBTyxLQUFLLEVBQUU7QUFBQSxNQUNoRTtBQUNBLHlCQUFtQjtBQUNuQixXQUFLLE9BQU87QUFBQSxJQUNiLENBQUM7QUFFRCxVQUFNLHFCQUFxQixNQUFNO0FBQ2hDLFVBQUksS0FBSyxXQUFXLFNBQVM7QUFBVTtBQUN2QyxZQUFNLFVBQVUsV0FBVyxRQUFRLEtBQUssV0FBVyxJQUFJLEtBQUssV0FBVyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUk7QUFDM0YsWUFBTSxRQUFRLFNBQVMsUUFBUSxLQUFLLFdBQVcsSUFBSSxLQUFLLFNBQVMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJO0FBQ3JGLFVBQUksV0FBVyxTQUFTLFdBQVcsT0FBTztBQUN6QyxhQUFLLGFBQWEsRUFBRSxNQUFNLFVBQVUsT0FBTyxTQUFTLEtBQUssTUFBTTtBQUMvRCxhQUFLLE9BQU87QUFBQSxNQUNiO0FBQUEsSUFDRDtBQUNBLGVBQVcsaUJBQWlCLFVBQVUsa0JBQWtCO0FBQ3hELGFBQVMsaUJBQWlCLFVBQVUsa0JBQWtCO0FBRXRELFVBQU0sWUFBWSxLQUFLLFVBQVUsRUFBRSxLQUFLLHFCQUFxQixDQUFDO0FBQzlELFNBQUssZUFBZSxXQUFXLHNCQUFPLE1BQU0sV0FBVyxTQUFTLEdBQUcsMEJBQU07QUFDekUsU0FBSztBQUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsTUFDQSxjQUFjLE1BQU0sY0FBYztBQUFBLE1BQ2xDLHNCQUFPLE1BQU0sY0FBYyxJQUFJLE1BQU0sY0FBYyxDQUFDO0FBQUEsSUFDckQ7QUFDQSxTQUFLLGVBQWUsV0FBVyxrQ0FBUyxNQUFNLFNBQVMsU0FBUyxHQUFHLDBCQUFNO0FBQ3pFLFNBQUs7QUFBQSxNQUNKO0FBQUEsTUFDQTtBQUFBLE1BQ0EsTUFBTSxnQkFBZ0IsY0FBYyxNQUFNLFdBQVcsSUFBSTtBQUFBLE1BQ3pELEdBQUcsTUFBTSxZQUFZLElBQUksTUFBTSxpQkFBaUIsQ0FBQztBQUFBLElBQ2xEO0FBQ0EsU0FBSztBQUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsTUFDQSxNQUFNLGdCQUFnQixjQUFjLE1BQU0sVUFBVSxJQUFJO0FBQUEsTUFDeEQ7QUFBQSxJQUNEO0FBQ0EsU0FBSztBQUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsTUFDQSxNQUFNLGlCQUFpQixlQUFlLE1BQU0sY0FBYyxJQUFJO0FBQUEsTUFDOUQ7QUFBQSxJQUNEO0FBRUEsVUFBTSxlQUFlLEtBQUssVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDL0QsaUJBQWEsU0FBUyxNQUFNLEVBQUUsTUFBTSx1Q0FBUyxDQUFDO0FBQzlDLFNBQUssb0JBQW9CLGNBQWMsTUFBTSxXQUFXO0FBRXhELFVBQU0sY0FBYyxLQUFLLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQzlELGdCQUFZLFNBQVMsTUFBTSxFQUFFLE1BQU0saUNBQVEsQ0FBQztBQUM1QyxTQUFLLHFCQUFxQixhQUFhLE1BQU0sVUFBVTtBQUV2RCxVQUFNLGtCQUFrQixLQUFLLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQ2xFLG9CQUFnQixTQUFTLE1BQU0sRUFBRSxNQUFNLHVDQUFTLENBQUM7QUFDakQsU0FBSyx3QkFBd0IsaUJBQWlCLEtBQUs7QUFBQSxFQUNwRDtBQUFBLEVBRVEsYUFBYSxTQUFzQixRQUFzQjtBQUNoRSxVQUFNLFdBQVcsUUFBUSxVQUFVLEVBQUUsS0FBSyxZQUFZLENBQUM7QUFFdkQsVUFBTSxlQUFlLFNBQVMsVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDbkUsVUFBTSxVQUFVLGFBQWEsVUFBVSxFQUFFLEtBQUssbUJBQW1CLE1BQU0sRUFBRSxNQUFNLFNBQVMsRUFBRSxDQUFDO0FBQzNGLFlBQVEsU0FBUyxNQUFNLEVBQUUsTUFBTSxPQUFPLEtBQUssQ0FBQztBQUM1QyxZQUFRLGlCQUFpQixTQUFTLE1BQU07QUFDdkMsVUFBSSxZQUFZLEtBQUssS0FBSztBQUFBLFFBQ3pCLE9BQU87QUFBQSxRQUNQLGNBQWMsT0FBTztBQUFBLFFBQ3JCLGFBQWE7QUFBQSxRQUNiLFVBQVUsT0FBTyxVQUFVO0FBQzFCLGdCQUFNLEtBQUssT0FBTyxhQUFhLE9BQU8sSUFBSSxLQUFLO0FBQUEsUUFDaEQ7QUFBQSxNQUNELENBQUMsRUFBRSxLQUFLO0FBQUEsSUFDVCxDQUFDO0FBRUQsVUFBTSxZQUFZLGFBQWEsVUFBVSxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDckUsVUFBTSxTQUFTLFVBQVUsU0FBUyxVQUFVLEVBQUUsTUFBTSw0QkFBUSxLQUFLLHNCQUFzQixDQUFDO0FBQ3hGLFdBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUN0QyxXQUFLLE9BQU8sZ0JBQWdCLE9BQU8sRUFBRTtBQUNyQyxVQUFJLFVBQVUsS0FBSyxLQUFLLEtBQUssUUFBUSxPQUFPLEVBQUUsRUFBRSxLQUFLO0FBQUEsSUFDdEQsQ0FBQztBQUNELFVBQU0sWUFBWSxVQUFVLFNBQVMsVUFBVTtBQUFBLE1BQzlDLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLE1BQU0sRUFBRSxjQUFjLDJCQUFPO0FBQUEsSUFDOUIsQ0FBQztBQUNELGNBQVUsaUJBQWlCLFNBQVMsTUFBTTtBQUN6QyxVQUFJLGFBQWEsS0FBSyxLQUFLO0FBQUEsUUFDMUIsT0FBTztBQUFBLFFBQ1AsU0FBUyxpQ0FBUSxPQUFPLElBQUk7QUFBQSxRQUM1QixhQUFhO0FBQUEsUUFDYixXQUFXLFlBQVk7QUFDdEIsZ0JBQU0sS0FBSyxPQUFPLGFBQWEsT0FBTyxFQUFFO0FBQUEsUUFDekM7QUFBQSxNQUNELENBQUMsRUFBRSxLQUFLO0FBQUEsSUFDVCxDQUFDO0FBRUQsVUFBTSxpQkFBaUIsU0FBUyxVQUFVO0FBQUEsTUFDekMsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLGVBQWUsT0FBTyxHQUFHO0FBQUEsSUFDbEMsQ0FBQztBQUNELFVBQU0sZ0JBQWdCLFVBQVUsU0FBUyxTQUFTLEVBQUUsS0FBSyxtQkFBbUIsQ0FBQztBQUM3RSxVQUFNLGVBQWUsS0FBSyxnQkFBZ0IsSUFBSSxPQUFPLEVBQUUsS0FBSztBQUM1RCxVQUFNLGlCQUFpQixjQUFjLFNBQVMsU0FBUyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzNFLG1CQUFlLFVBQVU7QUFDekIsbUJBQWUsaUJBQWlCLFVBQVUsTUFBTTtBQUMvQyxXQUFLLGdCQUFnQixJQUFJLE9BQU8sSUFBSSxlQUFlLE9BQU87QUFDMUQsV0FBSyxPQUFPO0FBQUEsSUFDYixDQUFDO0FBQ0Qsa0JBQWMsV0FBVyxFQUFFLE1BQU0scUJBQU0sQ0FBQztBQUV4QyxtQkFBZSxpQkFBaUIsWUFBWSxDQUFDLFFBQVE7QUFDcEQsVUFBSSxlQUFlO0FBQ25CLFVBQUksSUFBSTtBQUFjLFlBQUksYUFBYSxhQUFhO0FBQ3BELFlBQU0sV0FBVyxLQUFLLGdCQUFnQixnQkFBZ0IsSUFBSSxPQUFPO0FBQ2pFLFdBQUssZ0JBQWdCLGdCQUFnQixRQUFRO0FBQUEsSUFDOUMsQ0FBQztBQUNELG1CQUFlLGlCQUFpQixRQUFRLENBQUMsUUFBUTtBQUNoRCxVQUFJLGVBQWU7QUFDbkIsWUFBTSxXQUNMLEtBQUssa0JBQWtCLGFBQWEsT0FBTyxLQUN4QyxLQUFLLGlCQUFpQixXQUN0QixLQUFLLGdCQUFnQixnQkFBZ0IsSUFBSSxPQUFPO0FBQ3BELFdBQUssS0FBSyxXQUFXLE9BQU8sSUFBSSxRQUFRO0FBQUEsSUFDekMsQ0FBQztBQUVELFVBQU0sZ0JBQWdCLEtBQUssa0JBQWtCLFFBQVEsWUFBWTtBQUVqRSxRQUFJLENBQUMsY0FBYyxRQUFRO0FBQzFCLFlBQU0sWUFBWSxlQUFlLHlDQUFXO0FBQzVDLFlBQU0sUUFBUSxlQUFlLFVBQVUsRUFBRSxNQUFNLFdBQVcsS0FBSyxXQUFXLENBQUM7QUFDM0UsWUFBTSxpQkFBaUIsWUFBWSxDQUFDLFFBQVE7QUFDM0MsWUFBSSxlQUFlO0FBQ25CLFlBQUksSUFBSTtBQUFjLGNBQUksYUFBYSxhQUFhO0FBQ3BELGNBQU0sV0FBVyxLQUFLLGdCQUFnQixnQkFBZ0IsSUFBSSxPQUFPO0FBQ2pFLGFBQUssZ0JBQWdCLGdCQUFnQixRQUFRO0FBQUEsTUFDOUMsQ0FBQztBQUNELFlBQU0saUJBQWlCLFFBQVEsQ0FBQyxRQUFRO0FBQ3ZDLFlBQUksZUFBZTtBQUNuQixjQUFNLFdBQ0wsS0FBSyxrQkFBa0IsYUFBYSxPQUFPLEtBQ3hDLEtBQUssaUJBQWlCLFdBQ3RCLEtBQUssZ0JBQWdCLGdCQUFnQixJQUFJLE9BQU87QUFDcEQsYUFBSyxLQUFLLFdBQVcsT0FBTyxJQUFJLFFBQVE7QUFBQSxNQUN6QyxDQUFDO0FBQ0Q7QUFBQSxJQUNEO0FBRUEsa0JBQWMsUUFBUSxDQUFDLFNBQVM7QUFDL0IsV0FBSyxXQUFXLGdCQUFnQixRQUFRLElBQUk7QUFBQSxJQUM3QyxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRVEsV0FBVyxXQUF3QixRQUFzQixNQUFrQjtBQUNsRixVQUFNLGNBQWMsQ0FBQyxTQUFTO0FBQzlCLFFBQUksS0FBSztBQUFXLGtCQUFZLEtBQUssbUJBQW1CO0FBQ3hELFFBQUksS0FBSztBQUFVLGtCQUFZLEtBQUssa0JBQWtCO0FBQ3RELFVBQU0sU0FBUyxVQUFVLFVBQVU7QUFBQSxNQUNsQyxLQUFLLFlBQVksS0FBSyxHQUFHO0FBQUEsTUFDekIsTUFBTSxFQUFFLFdBQVcsUUFBUSxhQUFhLEtBQUssR0FBRztBQUFBLElBQ2pELENBQUM7QUFDRCxXQUFPLFFBQVEsU0FBUyxLQUFLO0FBRTdCLFdBQU8saUJBQWlCLGFBQWEsQ0FBQyxRQUFRO0FBQzdDLFdBQUssWUFBWSxFQUFFLFFBQVEsS0FBSyxJQUFJLFVBQVUsT0FBTyxJQUFJLFlBQVksT0FBTyxhQUFhO0FBQ3pGLGFBQU8sU0FBUyxrQkFBa0I7QUFDbEMsVUFBSSxjQUFjLFFBQVEsY0FBYyxLQUFLLEVBQUU7QUFBQSxJQUNoRCxDQUFDO0FBQ0QsV0FBTyxpQkFBaUIsV0FBVyxNQUFNO0FBQ3hDLGFBQU8sWUFBWSxrQkFBa0I7QUFDckMsV0FBSyxlQUFlO0FBQUEsSUFDckIsQ0FBQztBQUNELFdBQU8saUJBQWlCLFlBQVksQ0FBQyxRQUFRO0FBQzVDLFVBQUksZUFBZTtBQUNuQixVQUFJLElBQUk7QUFBYyxZQUFJLGFBQWEsYUFBYTtBQUNwRCxhQUFPLFNBQVMsY0FBYztBQUM5QixZQUFNQSxhQUFZLE9BQU87QUFDekIsWUFBTSxXQUFXLEtBQUssZ0JBQWdCQSxZQUFXLElBQUksT0FBTztBQUM1RCxXQUFLLGdCQUFnQkEsWUFBVyxRQUFRO0FBQUEsSUFDekMsQ0FBQztBQUNELFdBQU8saUJBQWlCLGFBQWEsTUFBTTtBQUMxQyxhQUFPLFlBQVksY0FBYztBQUFBLElBQ2xDLENBQUM7QUFFRCxXQUFPLGlCQUFpQixTQUFTLENBQUMsUUFBUTtBQUN6QyxZQUFNLFNBQVMsSUFBSTtBQUNuQixVQUFJLE9BQU8sUUFBUSxrQkFBa0I7QUFBRztBQUN4QyxXQUFLLE9BQU8sZ0JBQWdCLE9BQU8sRUFBRTtBQUNyQyxVQUFJLFVBQVUsS0FBSyxLQUFLLEtBQUssUUFBUSxPQUFPLElBQUksSUFBSSxFQUFFLEtBQUs7QUFBQSxJQUM1RCxDQUFDO0FBRUQsVUFBTSxTQUFTLE9BQU8sVUFBVSxFQUFFLEtBQUssY0FBYyxDQUFDO0FBQ3RELFVBQU0sV0FBVyxPQUFPLFNBQVMsU0FBUyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQzlELGFBQVMsVUFBVSxLQUFLO0FBQ3hCLGFBQVMsaUJBQWlCLFNBQVMsT0FBTyxRQUFRO0FBQ2pELFVBQUksZ0JBQWdCO0FBQ3BCLFlBQU0sS0FBSyxPQUFPLHFCQUFxQixPQUFPLElBQUksS0FBSyxJQUFJLFNBQVMsT0FBTztBQUFBLElBQzVFLENBQUM7QUFFRCxVQUFNLFVBQVUsT0FBTyxVQUFVLEVBQUUsS0FBSyxpQkFBaUIsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUMzRSxZQUFRLGlCQUFpQixTQUFTLE1BQU07QUFDdkMsV0FBSyxPQUFPLGdCQUFnQixPQUFPLEVBQUU7QUFDckMsVUFBSSxVQUFVLEtBQUssS0FBSyxLQUFLLFFBQVEsT0FBTyxJQUFJLElBQUksRUFBRSxLQUFLO0FBQUEsSUFDNUQsQ0FBQztBQUVELFVBQU0sY0FBYyxPQUFPLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQy9ELFVBQU0sZ0JBQWdCLFlBQVksVUFBVSxFQUFFLEtBQUsscUJBQXFCLE1BQU0sU0FBSSxDQUFDO0FBQ25GLFVBQU0sVUFBVSxZQUFZLFVBQVUsRUFBRSxLQUFLLHFCQUFxQixDQUFDO0FBQ25FLFVBQU0saUJBQWlCLE1BQU0sUUFBUSxLQUFLLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQztBQUNyRSxtQkFBZSxRQUFRLENBQUMsVUFBVTtBQUNqQyxjQUFRLFVBQVU7QUFBQSxRQUNqQixLQUFLO0FBQUEsUUFDTCxNQUFNLEdBQUcsV0FBVyxNQUFNLFNBQVMsQ0FBQyxTQUFNLE1BQU0sVUFBVSxjQUFJO0FBQUEsTUFDL0QsQ0FBQztBQUFBLElBQ0YsQ0FBQztBQUNELFFBQUksQ0FBQyxlQUFlLFFBQVE7QUFDM0IsY0FBUSxVQUFVLEVBQUUsTUFBTSw0QkFBUSxLQUFLLG1CQUFtQixDQUFDO0FBQUEsSUFDNUQ7QUFDQSxRQUFJLGNBQStCO0FBQ25DLFVBQU0sbUJBQW1CLE1BQU07QUFDOUIsVUFBSSxnQkFBZ0IsTUFBTTtBQUN6QixlQUFPLGFBQWEsV0FBVztBQUMvQixzQkFBYztBQUFBLE1BQ2Y7QUFBQSxJQUNEO0FBQ0EsVUFBTSxjQUFjLE1BQU07QUFDekIsdUJBQWlCO0FBQ2pCLGtCQUFZLFNBQVMsa0JBQWtCO0FBQUEsSUFDeEM7QUFDQSxVQUFNLGVBQWUsTUFBTTtBQUMxQix1QkFBaUI7QUFDakIsb0JBQWMsT0FBTyxXQUFXLE1BQU07QUFDckMsWUFBSSxDQUFDLFlBQVksU0FBUyxtQkFBbUIsR0FBRztBQUMvQyxzQkFBWSxZQUFZLGtCQUFrQjtBQUFBLFFBQzNDO0FBQUEsTUFDRCxHQUFHLEdBQUc7QUFBQSxJQUNQO0FBQ0EsZ0JBQVksaUJBQWlCLGNBQWMsV0FBVztBQUN0RCxnQkFBWSxpQkFBaUIsY0FBYyxZQUFZO0FBQ3ZELGtCQUFjLGlCQUFpQixTQUFTLENBQUMsUUFBUTtBQUNoRCxVQUFJLGdCQUFnQjtBQUNwQix1QkFBaUI7QUFDakIsVUFBSSxZQUFZLFNBQVMsbUJBQW1CLEdBQUc7QUFDOUMsb0JBQVksWUFBWSxtQkFBbUI7QUFDM0MsWUFBSSxDQUFDLFlBQVksUUFBUSxRQUFRLEdBQUc7QUFDbkMsc0JBQVksWUFBWSxrQkFBa0I7QUFBQSxRQUMzQztBQUFBLE1BQ0QsT0FBTztBQUNOLG9CQUFZLFNBQVMsbUJBQW1CO0FBQ3hDLG9CQUFZLFNBQVMsa0JBQWtCO0FBQUEsTUFDeEM7QUFBQSxJQUNELENBQUM7QUFFRCxRQUFJLEtBQUssS0FBSyxRQUFRO0FBQ3JCLFlBQU0sU0FBUyxPQUFPLFVBQVUsRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUN2RCxXQUFLLEtBQUssUUFBUSxDQUFDLFFBQVEsT0FBTyxVQUFVLEVBQUUsS0FBSyxVQUFVLE1BQU0sSUFBSSxDQUFDLENBQUM7QUFBQSxJQUMxRTtBQUVBLFFBQUksS0FBSyxRQUFRO0FBQ2hCLGFBQU8sVUFBVSxFQUFFLEtBQUssa0JBQWtCLE1BQU0sS0FBSyxPQUFPLENBQUM7QUFBQSxJQUM5RDtBQUVBLFVBQU0sT0FBTyxPQUFPLFVBQVUsRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUNyRCxTQUFLLFdBQVcsRUFBRSxNQUFNLHFCQUFNLFdBQVcsS0FBSyxTQUFTLENBQUMsR0FBRyxDQUFDO0FBQzVELFNBQUssV0FBVyxFQUFFLE1BQU0scUJBQU0sV0FBVyxLQUFLLFNBQVMsQ0FBQyxHQUFHLENBQUM7QUFDNUQsUUFBSSxLQUFLLFVBQVU7QUFDbEIsV0FBSyxXQUFXLEVBQUUsTUFBTSxxQkFBTSxXQUFXLEtBQUssUUFBUSxDQUFDLElBQUksS0FBSyx3QkFBd0IsQ0FBQztBQUFBLElBQzFGO0FBRUEsV0FBTztBQUFBLEVBQ1I7QUFBQSxFQUVBLE1BQWMsV0FBVyxnQkFBd0IsY0FBdUI7QUFDdkUsUUFBSSxDQUFDLEtBQUs7QUFBVztBQUNyQixVQUFNLEVBQUUsVUFBVSxPQUFPLElBQUksS0FBSztBQUNsQyxRQUFJLG1CQUFtQixZQUFZLGlCQUFpQixRQUFRO0FBQzNELFdBQUssZUFBZTtBQUNwQjtBQUFBLElBQ0Q7QUFDQSxVQUFNLEtBQUssT0FBTyxTQUFTLFFBQVEsVUFBVSxnQkFBZ0IsWUFBWTtBQUN6RSxTQUFLLGVBQWU7QUFBQSxFQUNyQjtBQUFBLEVBRVEsZ0JBQWdCLFdBQXdCLFNBQXFDO0FBQ3BGLFVBQU0sUUFBUSxNQUFNLEtBQUssVUFBVSxpQkFBOEIsVUFBVSxDQUFDO0FBQzVFLGVBQVcsUUFBUSxPQUFPO0FBQ3pCLFlBQU0sT0FBTyxLQUFLLHNCQUFzQjtBQUN4QyxZQUFNLFdBQVcsS0FBSyxNQUFNLEtBQUssU0FBUztBQUMxQyxVQUFJLFVBQVUsVUFBVTtBQUN2QixjQUFNLEtBQUssS0FBSyxRQUFRO0FBQ3hCLGVBQU8sTUFBTTtBQUFBLE1BQ2Q7QUFBQSxJQUNEO0FBQ0EsV0FBTztBQUFBLEVBQ1I7QUFBQSxFQUVRLGtCQUFrQixRQUFzQixjQUFxQztBQUNwRixRQUFJLENBQUMsY0FBYztBQUNsQixhQUFPLE9BQU87QUFBQSxJQUNmO0FBQ0EsV0FBTyxPQUFPLE1BQ1osT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUNoQyxNQUFNLEVBQ04sS0FBSyxDQUFDLEdBQUcsTUFBTTtBQUNmLFlBQU0sUUFBUSxFQUFFLFlBQVk7QUFDNUIsWUFBTSxRQUFRLEVBQUUsWUFBWTtBQUM1QixhQUFPLFFBQVE7QUFBQSxJQUNoQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRVEsb0JBQWlDO0FBQ3hDLFFBQUksQ0FBQyxLQUFLLGVBQWU7QUFDeEIsV0FBSyxnQkFBZ0IsU0FBUyxjQUFjLEtBQUs7QUFDakQsV0FBSyxjQUFjLFNBQVMscUJBQXFCO0FBQUEsSUFDbEQ7QUFDQSxXQUFPLEtBQUs7QUFBQSxFQUNiO0FBQUEsRUFFUSxnQkFBZ0IsV0FBd0IsVUFBbUI7QUFDbEUsUUFBSSxDQUFDLEtBQUs7QUFBVztBQUNyQixVQUFNLFdBQVcsVUFBVSxhQUFhLGFBQWE7QUFDckQsUUFBSSxDQUFDO0FBQVU7QUFDZixVQUFNLGNBQWMsS0FBSyxrQkFBa0I7QUFDM0MsVUFBTSxnQkFBZ0IsS0FBSyxJQUFJLEtBQUssVUFBVSxjQUFjLEdBQUcsRUFBRTtBQUNqRSxnQkFBWSxNQUFNLFNBQVMsR0FBRyxhQUFhO0FBQzNDLFFBQUksWUFBWSxrQkFBa0IsV0FBVztBQUM1QyxXQUFLLHlCQUF5QjtBQUM5QixnQkFBVSxTQUFTLHNCQUFzQjtBQUFBLElBQzFDO0FBQ0EsVUFBTSxZQUFZLFdBQ2YsVUFBVSxjQUEyQiwwQkFBMEIsUUFBUSxJQUFJLElBQzNFO0FBQ0gsUUFBSSxXQUFXO0FBQ2QsZ0JBQVUsYUFBYSxhQUFhLFNBQVM7QUFBQSxJQUM5QyxPQUFPO0FBQ04sZ0JBQVUsWUFBWSxXQUFXO0FBQUEsSUFDbEM7QUFDQSxTQUFLLHVCQUF1QixXQUFXLEtBQUs7QUFDNUMsU0FBSyxtQkFBbUIsRUFBRSxVQUFVLFNBQVM7QUFBQSxFQUM5QztBQUFBLEVBRVEsMkJBQTJCO0FBQ2xDLFFBQUksS0FBSyxlQUFlLGVBQWU7QUFDdEMsWUFBTSxTQUFTLEtBQUssY0FBYztBQUNsQyxhQUFPLFlBQVksc0JBQXNCO0FBQ3pDLFdBQUssY0FBYyxPQUFPO0FBQzFCLFdBQUssdUJBQXVCLFFBQVEsSUFBSTtBQUFBLElBQ3pDO0FBQUEsRUFDRDtBQUFBLEVBRVEsb0JBQW9CO0FBQzNCLFNBQUsseUJBQXlCO0FBQzlCLFNBQUssZ0JBQWdCO0FBQ3JCLFNBQUssbUJBQW1CO0FBQUEsRUFDekI7QUFBQSxFQUVRLHVCQUF1QixXQUF3QixTQUFrQjtBQUN4RSxVQUFNLFVBQVUsVUFBVSxjQUEyQixXQUFXO0FBQ2hFLFFBQUksU0FBUztBQUNaLGNBQVEsTUFBTSxVQUFVLFVBQVUsS0FBSztBQUFBLElBQ3hDO0FBQUEsRUFDRDtBQUFBLEVBRVEsaUJBQWlCO0FBQ3hCLFNBQUssWUFBWTtBQUNqQixTQUFLLG1CQUFtQjtBQUN4QixTQUFLLGtCQUFrQjtBQUN2QixTQUFLLFVBQVUsaUJBQWlCLGVBQWUsRUFBRSxRQUFRLENBQUMsT0FBUSxHQUFtQixZQUFZLGNBQWMsQ0FBQztBQUFBLEVBQ2pIO0FBQUEsRUFFUSxlQUFlLFdBQXdCLE9BQWUsT0FBZSxhQUFxQjtBQUNqRyxVQUFNLE9BQU8sVUFBVSxVQUFVLEVBQUUsS0FBSyxlQUFlLENBQUM7QUFDeEQsU0FBSyxTQUFTLE9BQU8sRUFBRSxNQUFNLE9BQU8sS0FBSyxxQkFBcUIsQ0FBQztBQUMvRCxTQUFLLFNBQVMsT0FBTyxFQUFFLE1BQU0sT0FBTyxLQUFLLHFCQUFxQixDQUFDO0FBQy9ELFNBQUssU0FBUyxPQUFPLEVBQUUsTUFBTSxhQUFhLEtBQUssb0JBQW9CLENBQUM7QUFBQSxFQUNyRTtBQUFBLEVBRVEsb0JBQW9CLFdBQXdCLFFBQTJCO0FBQzlFLFFBQUksQ0FBQyxPQUFPLFFBQVE7QUFDbkIsZ0JBQVUsVUFBVSxFQUFFLEtBQUssWUFBWSxNQUFNLDJCQUFPLENBQUM7QUFDckQ7QUFBQSxJQUNEO0FBQ0EsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDN0QsVUFBTSxRQUFRLE9BQU8sVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFDaEUsVUFBTSxVQUFVLE1BQU0sVUFBVSxFQUFFLEtBQUssbUJBQW1CLENBQUM7QUFDM0QsVUFBTSxXQUFXLEtBQUs7QUFBQSxNQUNyQjtBQUFBLE1BQ0EsR0FBRyxPQUFPLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxNQUFNLFNBQVMsTUFBTSxTQUFTLENBQUM7QUFBQSxJQUNsRTtBQUVBLFVBQU0sY0FBYztBQUNwQixVQUFNLE1BQU0sV0FBVyxHQUFHLE9BQU8sU0FBUyxXQUFXO0FBRXJELFVBQU0sY0FBYyxNQUFNLFFBQVEsWUFBWSxTQUFTO0FBRXZELFdBQU8sUUFBUSxDQUFDLFVBQVU7QUFDekIsWUFBTSxTQUFTLE1BQU0sVUFBVSxFQUFFLEtBQUssZUFBZSxDQUFDO0FBQ3RELFlBQU0sT0FBTyxPQUFPLFVBQVUsRUFBRSxLQUFLLG9CQUFvQixDQUFDO0FBQzFELFlBQU0sYUFBYSxLQUFLLFVBQVU7QUFBQSxRQUNqQyxLQUFLO0FBQUEsUUFDTCxNQUFNLEVBQUUsT0FBTyxVQUFXLE1BQU0sVUFBVSxXQUFZLEdBQUcsSUFBSTtBQUFBLE1BQzlELENBQUM7QUFDRCxZQUFNLGVBQWUsS0FBSyxVQUFVO0FBQUEsUUFDbkMsS0FBSztBQUFBLFFBQ0wsTUFBTSxFQUFFLE9BQU8sVUFBVyxNQUFNLFlBQVksV0FBWSxHQUFHLElBQUk7QUFBQSxNQUNoRSxDQUFDO0FBQ0QsYUFBTyxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsTUFBTSxNQUFNLEtBQUssTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUVyRSxZQUFNLGNBQWMsQ0FBQyxRQUFvQjtBQUN4QyxjQUFNLFNBQVMsSUFBSTtBQUNuQixnQkFBUSxRQUFRLEdBQUcsTUFBTSxJQUFJLGlCQUFPLE1BQU0sT0FBTyxzQkFBUyxNQUFNLFNBQVMsRUFBRTtBQUMzRSxnQkFBUSxTQUFTLFNBQVM7QUFDMUIsY0FBTSxTQUFTLE1BQU0sc0JBQXNCO0FBQzNDLGNBQU0sSUFBSSxJQUFJLFVBQVUsT0FBTztBQUMvQixjQUFNLElBQUksSUFBSSxVQUFVLE9BQU8sTUFBTTtBQUNyQyxnQkFBUSxNQUFNLE9BQU8sR0FBRyxDQUFDO0FBQ3pCLGdCQUFRLE1BQU0sTUFBTSxHQUFHLENBQUM7QUFBQSxNQUN6QjtBQUNBLE9BQUMsWUFBWSxjQUFjLE1BQU0sRUFBRSxRQUFRLENBQUMsT0FBTztBQUNsRCxXQUFHLGlCQUFpQixjQUFjLFdBQVc7QUFDN0MsV0FBRyxpQkFBaUIsYUFBYSxXQUFXO0FBQzVDLFdBQUcsaUJBQWlCLGNBQWMsV0FBVztBQUFBLE1BQzlDLENBQUM7QUFBQSxJQUNGLENBQUM7QUFFRCxVQUFNLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUM3RCxTQUFLLGlCQUFpQixRQUFRLGdCQUFNLDRCQUE0QjtBQUNoRSxTQUFLLGlCQUFpQixRQUFRLGdCQUFNLDJCQUEyQjtBQUFBLEVBQ2hFO0FBQUEsRUFFUSxpQkFBaUIsV0FBd0IsT0FBZSxPQUFlO0FBQzlFLFVBQU0sT0FBTyxVQUFVLFVBQVUsRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQzFELFVBQU0sTUFBTSxLQUFLLFVBQVUsRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQ25ELElBQUMsSUFBdUIsTUFBTSxhQUFhO0FBQzNDLFNBQUssV0FBVyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQUEsRUFDaEM7QUFBQSxFQUVRLHFCQUFxQixXQUF3QixRQUEwQjtBQUM5RSxZQUFRLElBQUkseURBQXlELE9BQU8sUUFBUSxRQUFRO0FBQzVGLFFBQUksQ0FBQyxPQUFPLFFBQVE7QUFDbkIsZ0JBQVUsVUFBVSxFQUFFLEtBQUssWUFBWSxNQUFNLDZDQUFVLENBQUM7QUFDeEQsY0FBUSxJQUFJLHFEQUFxRDtBQUNqRTtBQUFBLElBQ0Q7QUFDQSxZQUFRLElBQUksNENBQTRDLE1BQU07QUFFOUQsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDN0QsVUFBTSxlQUFlLE9BQU8sVUFBVSxFQUFFLEtBQUsseUJBQXlCLENBQUM7QUFDdkUsVUFBTSxhQUFhLEtBQUssSUFBSSxPQUFPLFFBQVEsQ0FBQztBQUM1QyxVQUFNLFdBQVcsYUFBYTtBQUM5QixVQUFNLGlCQUFpQixLQUFLLElBQUksT0FBTyxRQUFRLENBQUM7QUFDaEQsVUFBTSxjQUFjO0FBQ3BCLFVBQU0sU0FBUyxpQkFBaUIsS0FBSztBQUNyQyxVQUFNLFdBQVcsS0FBSyxJQUFJLE9BQU8sU0FBUyxhQUFhLFFBQVEsRUFBRTtBQUNqRSxpQkFBYSxNQUFNLFdBQVcsR0FBRyxRQUFRO0FBQ3pDLFVBQU0sU0FBUztBQUNmLFVBQU0sVUFBVTtBQUNoQixVQUFNLFdBQVc7QUFDakIsVUFBTSxhQUFhLFFBQVEsVUFBVTtBQUNyQyxVQUFNLE1BQU0saUJBQWlCLEtBQUs7QUFDbEMsZ0JBQVksS0FBSztBQUFBLE1BQ2hCLFNBQVMsT0FBTyxVQUFVLElBQUksTUFBTTtBQUFBLE1BQ3BDLHFCQUFxQjtBQUFBLE1BQ3JCLE9BQU8sT0FBTyxVQUFVO0FBQUEsTUFDeEIsUUFBUSxPQUFPLE1BQU07QUFBQSxJQUN0QixDQUFDO0FBQ0QsaUJBQWEsWUFBWSxHQUFHO0FBRTVCLFVBQU0sV0FBVyxpQkFBaUIsTUFBTTtBQUN4QyxnQkFBWSxVQUFVO0FBQUEsTUFDckIsSUFBSSxPQUFPLE9BQU87QUFBQSxNQUNsQixJQUFJLE9BQU8sU0FBUyxDQUFDO0FBQUEsTUFDckIsSUFBSSxPQUFPLGFBQWEsUUFBUTtBQUFBLE1BQ2hDLElBQUksT0FBTyxTQUFTLENBQUM7QUFBQSxNQUNyQixRQUFRO0FBQUEsTUFDUixnQkFBZ0I7QUFBQSxJQUNqQixDQUFDO0FBQ0QsUUFBSSxZQUFZLFFBQVE7QUFFeEIsVUFBTSxhQUFhLE9BQU8sSUFBSSxDQUFDLE9BQU8sVUFBVTtBQUMvQyxZQUFNLElBQ0wsT0FBTyxXQUFXLElBQ2YsVUFBVSxRQUFRLElBQ2xCLFVBQVcsU0FBUyxPQUFPLFNBQVMsS0FBSyxLQUFNO0FBQ25ELFlBQU0sY0FBYyxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFDLEdBQUcsR0FBRztBQUN6RCxZQUFNLElBQUksU0FBVSxjQUFjLE9BQVEsU0FBUyxNQUFNO0FBQ3pELGFBQU8sRUFBRSxHQUFHLEdBQUcsTUFBTSxZQUFZO0FBQUEsSUFDbEMsQ0FBQztBQUNELFlBQVEsSUFBSSxnREFBZ0QsVUFBVTtBQUN0RSxVQUFNLFNBQVMsV0FBVyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxHQUFHO0FBQzlELFVBQU0sV0FBVyxpQkFBaUIsVUFBVTtBQUM1QyxnQkFBWSxVQUFVO0FBQUEsTUFDckI7QUFBQSxNQUNBLE1BQU07QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLGdCQUFnQjtBQUFBLE1BQ2hCLGtCQUFrQjtBQUFBLE1BQ2xCLG1CQUFtQjtBQUFBLElBQ3BCLENBQUM7QUFDRCxRQUFJLFlBQVksUUFBUTtBQUN4QixVQUFNLFVBQVUsYUFBYSxVQUFVLEVBQUUsS0FBSyxtQkFBbUIsQ0FBQztBQUNsRSxVQUFNLGNBQWMsTUFBTSxRQUFRLFlBQVksU0FBUztBQUV2RCxXQUFPLFFBQVEsQ0FBQyxPQUFPLFVBQVU7QUFDaEMsWUFBTSxPQUNMLE9BQU8sV0FBVyxJQUNmLFVBQVUsUUFBUSxJQUNsQixVQUFXLFNBQVMsT0FBTyxTQUFTLEtBQUssS0FBTTtBQUNuRCxZQUFNLGNBQWMsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUc7QUFDekQsWUFBTSxPQUFPLFNBQVUsY0FBYyxPQUFRLFNBQVMsTUFBTTtBQUM1RCxZQUFNLFNBQVMsaUJBQWlCLFFBQVE7QUFDeEMsa0JBQVksUUFBUTtBQUFBLFFBQ25CLElBQUksT0FBTyxJQUFJO0FBQUEsUUFDZixJQUFJLE9BQU8sSUFBSTtBQUFBLFFBQ2YsR0FBRztBQUFBLFFBQ0gsTUFBTTtBQUFBLE1BQ1AsQ0FBQztBQUNELFVBQUksWUFBWSxNQUFNO0FBQ3RCLFlBQU0sY0FBYyxDQUFDLFFBQW9CO0FBQ3hDLGNBQU0sU0FBUyxhQUFhLHNCQUFzQjtBQUNsRCxjQUFNLElBQUksSUFBSSxVQUFVLE9BQU87QUFDL0IsY0FBTSxJQUFJLElBQUksVUFBVSxPQUFPLE1BQU07QUFDckMsZ0JBQVEsUUFBUSxHQUFHLE1BQU0sSUFBSSx1QkFBUSxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsR0FBRztBQUM3RCxnQkFBUSxTQUFTLFNBQVM7QUFDMUIsZ0JBQVEsTUFBTSxPQUFPLEdBQUcsQ0FBQztBQUN6QixnQkFBUSxNQUFNLE1BQU0sR0FBRyxDQUFDO0FBQUEsTUFDekI7QUFDQSxhQUFPLGlCQUFpQixjQUFjLFdBQVc7QUFDakQsYUFBTyxpQkFBaUIsYUFBYSxXQUFXO0FBQ2hELGFBQU8saUJBQWlCLGNBQWMsV0FBVztBQUFBLElBQ2xELENBQUM7QUFFRCxVQUFNLFNBQVMsYUFBYSxVQUFVLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUNuRSxXQUFPLE1BQU0sc0JBQXNCLFVBQVUsS0FBSyxJQUFJLE9BQU8sUUFBUSxDQUFDLENBQUM7QUFDdkUsV0FBTyxRQUFRLENBQUMsVUFBVTtBQUN6QixhQUFPLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixNQUFNLE1BQU0sS0FBSyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQUEsSUFDdEUsQ0FBQztBQUFBLEVBQ0Y7QUFBQSxFQUVRLHdCQUF3QixXQUF3QixPQUFzQjtBQUM3RSxRQUFJLENBQUMsTUFBTSxlQUFlO0FBQ3pCLGdCQUFVLFVBQVUsRUFBRSxLQUFLLFlBQVksTUFBTSxxRUFBYyxDQUFDO0FBQzVEO0FBQUEsSUFDRDtBQUNBLFVBQU0sT0FBTyxVQUFVLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQzVELFNBQUssVUFBVSxFQUFFLE1BQU0sdUNBQVMsTUFBTSxhQUFhLElBQUksS0FBSyxtQkFBbUIsQ0FBQztBQUNoRixTQUFLLFVBQVU7QUFBQSxNQUNkLE1BQU0sdUNBQVMsY0FBYyxNQUFNLGdCQUFnQixDQUFDO0FBQUEsTUFDcEQsS0FBSztBQUFBLElBQ04sQ0FBQztBQUVELFVBQU0sV0FBVyxVQUFVLFVBQVUsRUFBRSxLQUFLLGNBQWMsQ0FBQztBQUMzRCxhQUFTLFVBQVU7QUFBQSxNQUNsQixLQUFLO0FBQUEsTUFDTCxNQUFNLEVBQUUsT0FBTyxTQUFTLG1CQUFtQixNQUFNLFVBQVUsQ0FBQyxJQUFJO0FBQUEsSUFDakUsQ0FBQztBQUNELGFBQVMsVUFBVTtBQUFBLE1BQ2xCLEtBQUs7QUFBQSxNQUNMLE1BQU0sRUFBRSxPQUFPLFNBQVMsbUJBQW1CLE1BQU0sV0FBVyxDQUFDLElBQUk7QUFBQSxJQUNsRSxDQUFDO0FBRUQsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUsscUJBQXFCLENBQUM7QUFDaEUsU0FBSyxpQkFBaUIsUUFBUSw0QkFBUSw2QkFBNkI7QUFDbkUsU0FBSyxpQkFBaUIsUUFBUSw2QkFBUywyQkFBMkI7QUFBQSxFQUNuRTtBQUFBLEVBRVEsbUJBQW1CLE9BQWtDO0FBQzVELFVBQU0sUUFBUSxLQUFLLE9BQU8sU0FBUztBQUNuQyxVQUFNLFFBQVEsTUFBTSxRQUFRLFFBQVEsQ0FBQyxRQUFRLElBQUksS0FBSztBQUN0RCxVQUFNLGFBQWEsTUFBTTtBQUN6QixVQUFNLGlCQUFpQixNQUFNLE9BQU8sQ0FBQyxTQUFTLEtBQUssU0FBUztBQUM1RCxVQUFNLGlCQUFpQixlQUFlO0FBQ3RDLFVBQU0sV0FBVyxhQUFhO0FBQzlCLFVBQU0saUJBQWlCLGFBQWEsaUJBQWlCLGFBQWE7QUFDbEUsVUFBTSxnQkFBZ0IsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQzVELFVBQU0sTUFBTSxLQUFLLElBQUk7QUFDckIsVUFBTSxlQUFlLGNBQWMsT0FBTyxDQUFDLFNBQVM7QUFDbkQsVUFBSSxDQUFDLEtBQUs7QUFBVSxlQUFPO0FBQzNCLFVBQUksS0FBSyxXQUFXO0FBQ25CLGNBQU0sU0FBUyxLQUFLLGVBQWUsS0FBSztBQUN4QyxlQUFPLENBQUMsQ0FBQyxVQUFVLFNBQVMsS0FBSztBQUFBLE1BQ2xDO0FBQ0EsYUFBTyxNQUFNLEtBQUs7QUFBQSxJQUNuQixDQUFDLEVBQUU7QUFDSCxVQUFNLGNBQWMsY0FBYyxPQUFPLENBQUMsU0FBUztBQUNsRCxVQUFJLENBQUMsS0FBSyxZQUFZLENBQUMsS0FBSztBQUFXLGVBQU87QUFDOUMsWUFBTSxTQUFTLEtBQUssZUFBZSxLQUFLO0FBQ3hDLGFBQU8sQ0FBQyxDQUFDLFVBQVUsVUFBVSxLQUFLO0FBQUEsSUFDbkMsQ0FBQyxFQUFFO0FBQ0gsVUFBTSxrQkFBa0IsTUFBTTtBQUM3QixZQUFNLFdBQVcsZUFBZSxPQUFPLENBQUMsU0FBUyxLQUFLLFdBQVc7QUFDakUsVUFBSSxDQUFDLFNBQVM7QUFBUSxlQUFPO0FBQzdCLFlBQU0sUUFBUSxTQUFTO0FBQUEsUUFDdEIsQ0FBQyxLQUFLLFNBQVMsTUFBTSxLQUFLLElBQUksR0FBSSxLQUFLLGNBQWUsS0FBSyxTQUFVO0FBQUEsUUFDckU7QUFBQSxNQUNEO0FBQ0EsYUFBTyxRQUFRLFNBQVM7QUFBQSxJQUN6QixHQUFHO0FBRUgsVUFBTSxlQUFlLEtBQUssaUJBQWlCLE9BQU8sV0FBVyxLQUFLO0FBQ2xFLFVBQU0saUJBQWlCLEtBQUssaUJBQWlCLE9BQU8sYUFBYSxLQUFLO0FBQ3RFLFVBQU0sY0FBaUMsYUFBYSxJQUFJLENBQUMsT0FBTyxXQUFXO0FBQUEsTUFDMUUsTUFBTSxNQUFNO0FBQUEsTUFDWixTQUFTLE1BQU07QUFBQSxNQUNmLFdBQVcsZUFBZSxLQUFLLEdBQUcsU0FBUztBQUFBLElBQzVDLEVBQUU7QUFDRixVQUFNLGFBQStCLFlBQVksSUFBSSxDQUFDLFdBQVc7QUFBQSxNQUNoRSxNQUFNLE1BQU07QUFBQSxNQUNaLE1BQ0MsTUFBTSxXQUFXLE1BQU0sWUFDcEIsS0FBSyxJQUFJLEtBQU0sTUFBTSxZQUFZLEtBQUssSUFBSSxNQUFNLFNBQVMsTUFBTSxXQUFXLENBQUMsSUFBSyxHQUFHLElBQ25GO0FBQUEsSUFDTCxFQUFFO0FBRUYsV0FBTztBQUFBLE1BQ047QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLGVBQWUsY0FBYztBQUFBLE1BQzdCLGtCQUFrQixhQUFhLGNBQWMsU0FBUyxhQUFhO0FBQUEsTUFDbkU7QUFBQSxNQUNBLGFBQWEsY0FBYyxTQUFTLGVBQWUsY0FBYyxTQUFTO0FBQUEsTUFDMUUsWUFBWSxjQUFjLFNBQVMsY0FBYyxjQUFjLFNBQVM7QUFBQSxNQUN4RTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUVRLGlCQUFpQixPQUFxQixNQUErQixPQUFtQjtBQUMvRixVQUFNLFdBQVcsS0FBSyxLQUFLLEtBQUs7QUFDaEMsVUFBTSxFQUFFLE9BQU8sSUFBSSxJQUFJLEtBQUssYUFBYSxLQUFLO0FBQzlDLFVBQU0sT0FBTyxLQUFLLElBQUksR0FBRyxLQUFLLE9BQU8sTUFBTSxTQUFTLFFBQVEsSUFBSSxDQUFDO0FBQ2pFLFVBQU0sVUFBVSxvQkFBSSxJQUFvQjtBQUN4QyxRQUFJLFlBQVk7QUFDaEIsUUFBSSxhQUFhO0FBQ2pCLFFBQUksVUFBVTtBQUVkLGVBQVcsUUFBUSxPQUFPO0FBQ3pCLFlBQU0sWUFDTCxTQUFTLFlBQ04sS0FBSyxZQUNMLEtBQUssZ0JBQWdCLEtBQUssWUFBWSxLQUFLLFlBQVk7QUFDM0QsVUFBSSxDQUFDLFdBQVc7QUFDZjtBQUNBO0FBQUEsTUFDRDtBQUNBLFVBQUksWUFBWSxTQUFTLFlBQVksS0FBSztBQUN6QztBQUNBO0FBQUEsTUFDRDtBQUNBLFlBQU0sTUFBTSxLQUFLLFNBQVMsU0FBUztBQUNuQyxjQUFRLElBQUksTUFBTSxRQUFRLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztBQUM1QztBQUFBLElBQ0Q7QUFFQSxVQUFNLFNBQTRCLENBQUM7QUFDbkMsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLEtBQUs7QUFDOUIsWUFBTSxRQUFRLFFBQVEsSUFBSTtBQUMxQixZQUFNLE1BQU0sS0FBSyxTQUFTLEtBQUs7QUFDL0IsYUFBTyxLQUFLLEVBQUUsTUFBTSxLQUFLLE9BQU8sUUFBUSxJQUFJLEdBQUcsS0FBSyxFQUFFLENBQUM7QUFBQSxJQUN4RDtBQUNBLFVBQU0sUUFBUSxTQUFTLFlBQVksWUFBWTtBQUMvQyxZQUFRLElBQUkseUJBQXlCLEtBQUssaUJBQWlCO0FBQUEsTUFDMUQsWUFBWSxJQUFJLEtBQUssS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUFBLE1BQ3JELFVBQVUsSUFBSSxLQUFLLEdBQUcsRUFBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFBQSxNQUNqRCxRQUFRLE9BQU87QUFBQSxNQUNmO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNELENBQUM7QUFDRCxXQUFPO0FBQUEsRUFDUjtBQUFBLEVBRVEsYUFBYSxPQUFtRDtBQUN2RSxRQUFJLE1BQU0sU0FBUyxVQUFVO0FBQzVCLGFBQU87QUFBQSxRQUNOLE9BQU8sS0FBSyxXQUFXLE1BQU0sS0FBSztBQUFBLFFBQ2xDLEtBQUssS0FBSyxXQUFXLE1BQU0sR0FBRztBQUFBLE1BQy9CO0FBQUEsSUFDRDtBQUNBLFVBQU0sV0FBVyxLQUFLLEtBQUssS0FBSztBQUNoQyxVQUFNLE1BQU0sS0FBSyxXQUFXLEtBQUssSUFBSSxDQUFDO0FBQ3RDLFVBQU0sUUFBUSxPQUFPLE1BQU0sT0FBTyxLQUFLO0FBQ3ZDLFdBQU8sRUFBRSxPQUFPLElBQUk7QUFBQSxFQUNyQjtBQUFBLEVBRVEsU0FBUyxXQUEyQjtBQUMzQyxVQUFNLE9BQU8sSUFBSSxLQUFLLFNBQVM7QUFDL0IsVUFBTSxJQUFJLEtBQUssWUFBWTtBQUMzQixVQUFNLElBQUksT0FBTyxLQUFLLFNBQVMsSUFBSSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDckQsVUFBTSxJQUFJLE9BQU8sS0FBSyxRQUFRLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNoRCxXQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDdEI7QUFBQSxFQUVRLFdBQVcsV0FBMkI7QUFDN0MsVUFBTSxPQUFPLElBQUksS0FBSyxTQUFTO0FBQy9CLFNBQUssU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLFdBQU8sS0FBSyxRQUFRO0FBQUEsRUFDckI7QUFDRDtBQUVBLElBQU0sWUFBTixjQUF3QixzQkFBTTtBQUFBLEVBcUI3QixZQUNDLEtBQ1EsUUFDQSxVQUNBLE1BQ1A7QUFDRCxVQUFNLEdBQUc7QUFKRDtBQUNBO0FBQ0E7QUF4QlQsU0FBUSxhQUFhO0FBQ3JCLFNBQVEsWUFBWTtBQUNwQixTQUFRLGNBQWM7QUFDdEIsU0FBUSxjQUFjO0FBQ3RCLFNBQVEsZ0JBQWdCO0FBQ3hCLFNBQVEsYUFBYTtBQUNyQixTQUFRLGFBQWEsQ0FBQyxRQUF1QjtBQUM1QyxVQUNDLElBQUksUUFBUSxXQUNaLENBQUMsSUFBSSxZQUNMLENBQUMsSUFBSSxXQUNMLENBQUMsSUFBSSxXQUNMLENBQUMsSUFBSSxVQUNMLENBQUMsSUFBSSxhQUNKO0FBQ0QsWUFBSSxlQUFlO0FBQ25CLGFBQUssS0FBSyxhQUFhO0FBQUEsTUFDeEI7QUFBQSxJQUNEO0FBU0MsU0FBSyxPQUFPLGdCQUFnQixRQUFRO0FBQ3BDLFFBQUksTUFBTTtBQUNULFdBQUssYUFBYSxLQUFLO0FBQ3ZCLFdBQUssWUFBWSxLQUFLLEtBQUssS0FBSyxJQUFJO0FBQ3BDLFdBQUssY0FBYyxLQUFLO0FBQ3hCLFdBQUssZ0JBQWdCLG9CQUFvQixLQUFLLFFBQVE7QUFBQSxJQUN2RDtBQUFBLEVBQ0Q7QUFBQSxFQUVBLFNBQVM7QUFDUixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMsVUFBVTtBQUM3QixjQUFVLGlCQUFpQixXQUFXLEtBQUssVUFBVTtBQUVyRCxjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sS0FBSyxPQUFPLDZCQUFTLDJCQUFPLENBQUM7QUFFOUQsU0FBSyxhQUFhLEtBQUssY0FBYztBQUNyQyxvQkFBZ0IsV0FBVyxnQkFBTSxLQUFLLFlBQVksQ0FBQyxVQUFVO0FBQzVELFdBQUssYUFBYTtBQUFBLElBQ25CLENBQUM7QUFFRCxvQkFBZ0IsV0FBVyxvREFBWSxLQUFLLFdBQVcsQ0FBQyxVQUFVO0FBQ2pFLFdBQUssWUFBWTtBQUFBLElBQ2xCLENBQUM7QUFFQSxtQkFBZSxXQUFXLGdCQUFNLEtBQUssYUFBYSxDQUFDLFVBQVU7QUFDNUQsV0FBSyxjQUFjO0FBQUEsSUFDcEIsQ0FBQztBQUVELHdCQUFvQixXQUFXLDRCQUFRLEtBQUssZUFBZSxDQUFDLFVBQVU7QUFDckUsV0FBSyxnQkFBZ0I7QUFBQSxJQUN0QixDQUFDO0FBRUYsbUJBQWUsV0FBVyxnRUFBYyxJQUFJLENBQUMsVUFBVTtBQUN0RCxXQUFLLGNBQWM7QUFBQSxJQUNwQixDQUFDO0FBRUQsVUFBTSxTQUFTLFVBQVUsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDN0QsVUFBTSxZQUFZLE9BQU8sU0FBUyxVQUFVLEVBQUUsTUFBTSxnQkFBTSxLQUFLLHNCQUFzQixDQUFDO0FBQ3RGLGNBQVUsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUV0RCxVQUFNLFlBQVksT0FBTyxTQUFTLFVBQVU7QUFBQSxNQUMzQyxNQUFNLEtBQUssT0FBTyxpQkFBTztBQUFBLE1BQ3pCLEtBQUs7QUFBQSxJQUNOLENBQUM7QUFDRCxjQUFVLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxLQUFLLGFBQWEsQ0FBQztBQUFBLEVBQ25FO0FBQUEsRUFFQSxVQUFVO0FBQ1QsU0FBSyxVQUFVLG9CQUFvQixXQUFXLEtBQUssVUFBVTtBQUM3RCxVQUFNLFFBQVE7QUFBQSxFQUNmO0FBQUEsRUFFQSxNQUFNLGVBQWU7QUFDcEIsUUFBSSxLQUFLO0FBQVk7QUFDckIsUUFBSSxDQUFDLEtBQUssV0FBVyxLQUFLLEdBQUc7QUFDNUIsVUFBSSx1QkFBTyxzQ0FBUTtBQUNuQjtBQUFBLElBQ0Q7QUFDQSxTQUFLLGFBQWE7QUFDbEIsVUFBTSxPQUFPLFVBQVUsS0FBSyxTQUFTO0FBQ3JDLFVBQU0sU0FBUyxLQUFLLFlBQVksS0FBSztBQUNyQyxVQUFNLFdBQVcsbUJBQW1CLEtBQUssYUFBYTtBQUN0RCxRQUFJO0FBQ0gsVUFBSSxLQUFLLE1BQU07QUFDZCxjQUFNLEtBQUssT0FBTztBQUFBLFVBQ2pCLEtBQUs7QUFBQSxVQUNMLEtBQUssS0FBSztBQUFBLFVBQ1YsRUFBRSxPQUFPLEtBQUssWUFBWSxNQUFNLFFBQVEsU0FBUztBQUFBLFVBQ2pELEtBQUssWUFBWSxLQUFLLEtBQUs7QUFBQSxRQUM1QjtBQUFBLE1BQ0QsT0FBTztBQUNOLGNBQU0sS0FBSyxPQUFPLFFBQVEsS0FBSyxVQUFVO0FBQUEsVUFDeEMsT0FBTyxLQUFLO0FBQUEsVUFDWjtBQUFBLFVBQ0E7QUFBQSxVQUNBLGFBQWEsS0FBSyxZQUFZLEtBQUssS0FBSztBQUFBLFVBQ3hDO0FBQUEsUUFDRCxDQUFDO0FBQUEsTUFDRjtBQUNBLFdBQUssTUFBTTtBQUFBLElBQ1osVUFBRTtBQUNELFdBQUssYUFBYTtBQUFBLElBQ25CO0FBQUEsRUFDRDtBQUNEO0FBU0EsSUFBTSxjQUFOLGNBQTBCLHNCQUFNO0FBQUEsRUFHL0IsWUFBWSxLQUFrQixTQUE2QjtBQUMxRCxVQUFNLEdBQUc7QUFEb0I7QUFFN0IsU0FBSyxRQUFRLFFBQVEsZ0JBQWdCO0FBQUEsRUFDdEM7QUFBQSxFQUVBLFNBQVM7QUFDUixVQUFNLEVBQUUsVUFBVSxJQUFJO0FBQ3RCLGNBQVUsTUFBTTtBQUNoQixjQUFVLFNBQVMsVUFBVTtBQUM3QixjQUFVLFNBQVMsTUFBTSxFQUFFLE1BQU0sS0FBSyxRQUFRLE1BQU0sQ0FBQztBQUVyRCxvQkFBZ0IsV0FBVyw0QkFBUSxLQUFLLE9BQU8sQ0FBQyxVQUFXLEtBQUssUUFBUSxLQUFNO0FBRTlFLFVBQU0sU0FBUyxVQUFVLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQzdELFVBQU0sWUFBWSxPQUFPLFNBQVMsVUFBVSxFQUFFLE1BQU0sZ0JBQU0sS0FBSyxzQkFBc0IsQ0FBQztBQUN0RixjQUFVLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFFdEQsVUFBTSxhQUFhLE9BQU8sU0FBUyxVQUFVO0FBQUEsTUFDNUMsTUFBTSxLQUFLLFFBQVEsZUFBZTtBQUFBLE1BQ2xDLEtBQUs7QUFBQSxJQUNOLENBQUM7QUFDRCxlQUFXLGlCQUFpQixTQUFTLFlBQVk7QUFDaEQsWUFBTSxLQUFLLFFBQVEsU0FBUyxLQUFLLEtBQUs7QUFDdEMsV0FBSyxNQUFNO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDRjtBQUNEO0FBVUEsSUFBTSxlQUFOLGNBQTJCLHNCQUFNO0FBQUEsRUFDaEMsWUFBWSxLQUFrQixTQUE4QjtBQUMzRCxVQUFNLEdBQUc7QUFEb0I7QUFBQSxFQUU5QjtBQUFBLEVBRUEsU0FBUztBQUNSLFVBQU0sRUFBRSxVQUFVLElBQUk7QUFDdEIsY0FBVSxNQUFNO0FBQ2hCLGNBQVUsU0FBUyxVQUFVO0FBQzdCLGNBQVUsU0FBUyxNQUFNLEVBQUUsTUFBTSxLQUFLLFFBQVEsTUFBTSxDQUFDO0FBQ3JELGNBQVUsVUFBVSxFQUFFLE1BQU0sS0FBSyxRQUFRLFNBQVMsS0FBSyxrQkFBa0IsQ0FBQztBQUUxRSxVQUFNLFNBQVMsVUFBVSxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUM3RCxVQUFNLFlBQVksT0FBTyxTQUFTLFVBQVU7QUFBQSxNQUMzQyxNQUFNLEtBQUssUUFBUSxjQUFjO0FBQUEsTUFDakMsS0FBSztBQUFBLElBQ04sQ0FBQztBQUNELGNBQVUsaUJBQWlCLFNBQVMsTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUV0RCxVQUFNLGFBQWEsT0FBTyxTQUFTLFVBQVU7QUFBQSxNQUM1QyxNQUFNLEtBQUssUUFBUSxlQUFlO0FBQUEsTUFDbEMsS0FBSztBQUFBLElBQ04sQ0FBQztBQUNELGVBQVcsaUJBQWlCLFNBQVMsWUFBWTtBQUNoRCxZQUFNLEtBQUssUUFBUSxVQUFVO0FBQzdCLFdBQUssTUFBTTtBQUFBLElBQ1osQ0FBQztBQUFBLEVBQ0Y7QUFDRDtBQUVBLFNBQVMsVUFBVSxPQUF5QjtBQUMzQyxTQUFPLE1BQ0wsTUFBTSxHQUFHLEVBQ1QsSUFBSSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsRUFDdkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUc7QUFDeEI7QUFFQSxTQUFTLG1CQUFtQixPQUE4QjtBQUN6RCxNQUFJLENBQUMsTUFBTSxLQUFLO0FBQUcsV0FBTztBQUMxQixRQUFNLFNBQVMsS0FBSyxNQUFNLEtBQUs7QUFDL0IsU0FBTyxPQUFPLE1BQU0sTUFBTSxJQUFJLE9BQU87QUFDdEM7QUFFQSxTQUFTLG9CQUFvQixPQUErQjtBQUMzRCxNQUFJLENBQUM7QUFBTyxXQUFPO0FBQ25CLFFBQU0sT0FBTyxJQUFJLEtBQUssS0FBSztBQUMzQixRQUFNLE9BQU8sS0FBSyxZQUFZO0FBQzlCLFFBQU0sS0FBSyxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUN0RCxRQUFNLEtBQUssT0FBTyxLQUFLLFFBQVEsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ2pELFFBQU0sS0FBSyxPQUFPLEtBQUssU0FBUyxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDbEQsUUFBTSxNQUFNLE9BQU8sS0FBSyxXQUFXLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNyRCxTQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUc7QUFDeEM7QUFFQSxTQUFTLFdBQVc7QUFDbkIsU0FBTyxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDcEU7QUFFQSxTQUFTLFdBQVcsV0FBMkI7QUFDOUMsUUFBTSxPQUFPLElBQUksS0FBSyxTQUFTO0FBQy9CLFFBQU0sSUFBSSxLQUFLLFlBQVk7QUFDM0IsUUFBTSxJQUFJLE9BQU8sS0FBSyxTQUFTLElBQUksQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ3JELFFBQU0sSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFDaEQsUUFBTSxLQUFLLE9BQU8sS0FBSyxTQUFTLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNsRCxRQUFNLEtBQUssT0FBTyxLQUFLLFdBQVcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ3BELFNBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUNsQztBQUVBLFNBQVMsY0FBYyxPQUFlLFNBQVMsR0FBVztBQUN6RCxNQUFJLENBQUMsT0FBTyxTQUFTLEtBQUs7QUFBRyxXQUFPO0FBQ3BDLFNBQU8sSUFBSSxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksS0FBSyxRQUFRLE1BQU0sQ0FBQztBQUNyRDtBQUVBLFNBQVMsbUJBQW1CLE9BQXVCO0FBQ2xELE1BQUksQ0FBQyxPQUFPLFNBQVMsS0FBSztBQUFHLFdBQU87QUFDcEMsU0FBTyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksS0FBSyxRQUFRLEdBQUcsQ0FBQztBQUM5QztBQUVBLFNBQVMsZUFBZSxJQUFvQjtBQUMzQyxRQUFNLFVBQVUsS0FBSyxNQUFNLEtBQUssR0FBSztBQUNyQyxRQUFNLFFBQVEsS0FBSyxNQUFNLFVBQVUsRUFBRTtBQUNyQyxRQUFNLE9BQU8sS0FBSyxNQUFNLFFBQVEsRUFBRTtBQUNsQyxNQUFJLE9BQU8sR0FBRztBQUNiLFVBQU0sV0FBVyxRQUFRO0FBQ3pCLFdBQU8sV0FBVyxHQUFHLElBQUksU0FBSSxRQUFRLGlCQUFPLEdBQUcsSUFBSTtBQUFBLEVBQ3BEO0FBQ0EsTUFBSSxRQUFRLEdBQUc7QUFDZCxVQUFNLGFBQWEsVUFBVTtBQUM3QixXQUFPLGFBQWEsR0FBRyxLQUFLLGVBQUssVUFBVSxXQUFNLEdBQUcsS0FBSztBQUFBLEVBQzFEO0FBQ0EsU0FBTyxHQUFHLEtBQUssSUFBSSxTQUFTLENBQUMsQ0FBQztBQUMvQjtBQUVBLFNBQVMscUJBQXFCLFdBQTJCO0FBQ3hELFFBQU0sT0FBTyxJQUFJLEtBQUssU0FBUztBQUMvQixRQUFNLElBQUksS0FBSyxZQUFZO0FBQzNCLFFBQU0sSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNyRCxRQUFNLElBQUksT0FBTyxLQUFLLFFBQVEsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ2hELFNBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdEI7QUFFQSxJQUFNLFNBQVM7QUFFZixTQUFTLGlCQUF1RCxLQUFpQztBQUNoRyxTQUFPLFNBQVMsZ0JBQWdCLFFBQVEsR0FBRztBQUM1QztBQUVBLFNBQVMsWUFBWSxJQUFhLE9BQStCO0FBQ2hFLFNBQU8sUUFBUSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsS0FBSyxLQUFLLE1BQU0sR0FBRyxhQUFhLEtBQUssS0FBSyxDQUFDO0FBQzVFO0FBRUEsU0FBUyxnQkFDUixXQUNBLE9BQ0EsT0FDQSxVQUNDO0FBQ0QsUUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUssV0FBVyxDQUFDO0FBQ3ZELFVBQVEsU0FBUyxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDekMsUUFBTSxRQUFRLFFBQVEsU0FBUyxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDeEQsUUFBTSxRQUFRO0FBQ2QsUUFBTSxpQkFBaUIsU0FBUyxDQUFDLFFBQVEsU0FBVSxJQUFJLE9BQTRCLEtBQUssQ0FBQztBQUMxRjtBQUVBLFNBQVMsb0JBQ1IsV0FDQSxPQUNBLE9BQ0EsVUFDQztBQUNELFFBQU0sVUFBVSxVQUFVLFVBQVUsRUFBRSxLQUFLLFdBQVcsQ0FBQztBQUN2RCxVQUFRLFNBQVMsU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLFFBQU0sUUFBUSxRQUFRLFNBQVMsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDbEUsUUFBTSxRQUFRO0FBQ2QsUUFBTSxpQkFBaUIsU0FBUyxDQUFDLFFBQVEsU0FBVSxJQUFJLE9BQTRCLEtBQUssQ0FBQztBQUMxRjtBQUVBLFNBQVMsZUFDUixXQUNBLE9BQ0EsT0FDQSxVQUNDO0FBQ0QsUUFBTSxVQUFVLFVBQVUsVUFBVSxFQUFFLEtBQUssV0FBVyxDQUFDO0FBQ3ZELFVBQVEsU0FBUyxTQUFTLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDekMsUUFBTSxXQUFXLFFBQVEsU0FBUyxVQUFVO0FBQzVDLFdBQVMsUUFBUTtBQUNqQixXQUFTLGlCQUFpQixTQUFTLENBQUMsUUFBUSxTQUFVLElBQUksT0FBK0IsS0FBSyxDQUFDO0FBQ2hHOyIsCiAgIm5hbWVzIjogWyJjb250YWluZXIiXQp9Cg==
