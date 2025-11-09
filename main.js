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
    const stats = this.buildStatsSnapshot();
    body.createEl("h2", { text: "\u6548\u7387\u7EDF\u8BA1", cls: "sk-stats-title" });
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
    chartSection.createEl("h3", { text: "\u6BCF\u65E5\u4EFB\u52A1\u8D8B\u52BF\uFF08\u8FD114\u5929\uFF09" });
    this.renderDailyBarChart(chartSection, stats.dailySeries);
    const rateSection = body.createDiv({ cls: "sk-stats-section" });
    rateSection.createEl("h3", { text: "\u6BCF\u65E5\u5B8C\u6210\u7387\uFF08\u8FD114\u5929\uFF09" });
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
    const chart = container.createDiv({ cls: "sk-chart sk-chart-bars" });
    const maxValue = Math.max(
      1,
      ...series.map((point) => Math.max(point.created, point.completed))
    );
    series.forEach((point) => {
      const column = chart.createDiv({ cls: "sk-chart-col" });
      const bars = column.createDiv({ cls: "sk-chart-col-bars" });
      bars.createDiv({
        cls: "sk-chart-bar sk-chart-bar-created",
        attr: { style: `height:${point.created / maxValue * 100}%` }
      });
      bars.createDiv({
        cls: "sk-chart-bar sk-chart-bar-completed",
        attr: { style: `height:${point.completed / maxValue * 100}%` }
      });
      column.createDiv({ cls: "sk-chart-label", text: point.date.slice(5) });
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
    const chartWrapper = container.createDiv({ cls: "sk-chart sk-chart-line" });
    const width = Math.max(series.length - 1, 1) * 40;
    const height = 160;
    const svg = chartWrapper.createEl("svg", {
      attr: { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none" }
    });
    const points = series.map((point, index) => {
      const x = index / Math.max(series.length - 1, 1) * width;
      const y = height - Math.min(point.rate, 100) / 100 * height;
      return `${x},${y}`;
    }).join(" ");
    svg.createEl("polyline", {
      attr: {
        points,
        fill: "none",
        stroke: "var(--interactive-accent)",
        "stroke-width": "3"
      }
    });
    series.forEach((point, index) => {
      const dotX = index / Math.max(series.length - 1, 1) * width;
      const dotY = height - Math.min(point.rate, 100) / 100 * height;
      svg.createEl("circle", {
        attr: {
          cx: dotX,
          cy: dotY,
          r: 3,
          fill: "var(--interactive-accent)"
        }
      });
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
  buildStatsSnapshot() {
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
    const dailyCreated = this.buildDailySeries(cards, "created");
    const dailyCompleted = this.buildDailySeries(cards, "completed");
    const dailySeries = dailyCreated.map((point, index) => ({
      date: point.date,
      created: point.value,
      completed: dailyCompleted[index]?.value ?? 0
    }));
    const dailyRates = dailySeries.map((point) => ({
      date: point.date,
      rate: point.created ? Math.min(100, point.completed / point.created * 100) : 0
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
  buildDailySeries(cards, kind, days = 14) {
    const msPerDay = 24 * 60 * 60 * 1e3;
    const today = this.startOfDay(Date.now());
    const start = today - (days - 1) * msPerDay;
    const buckets = /* @__PURE__ */ new Map();
    for (const card of cards) {
      const timestamp = kind === "created" ? card.createdAt : card.completedAt ?? (card.completed ? card.updatedAt : null);
      if (!timestamp)
        continue;
      const key = this.toDayKey(timestamp);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const series = [];
    for (let i = 0; i < days; i++) {
      const dayTs = start + i * msPerDay;
      const key = this.toDayKey(dayTs);
      series.push({ date: key, value: buckets.get(key) ?? 0 });
    }
    return series;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7XG5cdEFwcCxcblx0SXRlbVZpZXcsXG5cdE1vZGFsLFxuXHROb3RpY2UsXG5cdFBsdWdpbixcblx0V29ya3NwYWNlTGVhZixcbn0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbmNvbnN0IFZJRVdfVFlQRSA9IFwic2ltcGxlLWthbmJhbi1zaWRlYmFyLXZpZXdcIjtcbmNvbnN0IElDT05fSUQgPSBcImxheW91dC1rYW5iYW5cIjtcblxuaW50ZXJmYWNlIEthbmJhbkhpc3RvcnlFbnRyeSB7XG5cdHRpbWVzdGFtcDogbnVtYmVyO1xuXHRyZW1hcms6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEthbmJhbkNhcmQge1xuXHRpZDogc3RyaW5nO1xuXHR0aXRsZTogc3RyaW5nO1xuXHR0YWdzOiBzdHJpbmdbXTtcblx0cmVtYXJrOiBzdHJpbmc7XG5cdGRlYWRsaW5lPzogbnVtYmVyIHwgbnVsbDtcblx0Y29tcGxldGVkOiBib29sZWFuO1xuXHRjb21wbGV0ZWRBdD86IG51bWJlciB8IG51bGw7XG5cdGNyZWF0ZWRBdDogbnVtYmVyO1xuXHR1cGRhdGVkQXQ6IG51bWJlcjtcblx0aGlzdG9yeTogS2FuYmFuSGlzdG9yeUVudHJ5W107XG59XG5cbmludGVyZmFjZSBLYW5iYW5Db2x1bW4ge1xuXHRpZDogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGNhcmRzOiBLYW5iYW5DYXJkW107XG59XG5cbmludGVyZmFjZSBLYW5iYW5Cb2FyZERhdGEge1xuXHRjb2x1bW5zOiBLYW5iYW5Db2x1bW5bXTtcbn1cblxuaW50ZXJmYWNlIERhaWx5Q291bnRQb2ludCB7XG5cdGRhdGU6IHN0cmluZztcblx0dmFsdWU6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIERhaWx5U3RhdHNQb2ludCB7XG5cdGRhdGU6IHN0cmluZztcblx0Y3JlYXRlZDogbnVtYmVyO1xuXHRjb21wbGV0ZWQ6IG51bWJlcjtcbn1cblxuaW50ZXJmYWNlIERhaWx5UmF0ZVBvaW50IHtcblx0ZGF0ZTogc3RyaW5nO1xuXHRyYXRlOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBTdGF0c1NuYXBzaG90IHtcblx0dG90YWxUYXNrczogbnVtYmVyO1xuXHRjb21wbGV0ZWRUYXNrczogbnVtYmVyO1xuXHR3aXBDb3VudDogbnVtYmVyO1xuXHRjb21wbGV0aW9uUmF0ZTogbnVtYmVyO1xuXHRkZWFkbGluZUNvdW50OiBudW1iZXI7XG5cdGRlYWRsaW5lQ292ZXJhZ2U6IG51bWJlcjtcblx0b3ZlcmR1ZUNvdW50OiBudW1iZXI7XG5cdG92ZXJkdWVSYXRlOiBudW1iZXI7XG5cdG9uVGltZVJhdGU6IG51bWJlcjtcblx0YXZnQ3ljbGVUaW1lTXM6IG51bWJlciB8IG51bGw7XG5cdGRhaWx5U2VyaWVzOiBEYWlseVN0YXRzUG9pbnRbXTtcblx0ZGFpbHlSYXRlczogRGFpbHlSYXRlUG9pbnRbXTtcbn1cblxuY29uc3QgREVGQVVMVF9DT0xVTU5TID0gW1wiXHU1Rjg1XHU1OTA0XHU3NDA2XCIsIFwiXHU4RkRCXHU4ODRDXHU0RTJEXCIsIFwiXHU1REYyXHU1QjhDXHU2MjEwXCJdO1xudHlwZSBOdWxsYWJsZVRpbWVvdXQgPSBudW1iZXIgfCBudWxsO1xuXG5mdW5jdGlvbiBjcmVhdGVEZWZhdWx0Qm9hcmQoKTogS2FuYmFuQm9hcmREYXRhIHtcblx0cmV0dXJuIHtcblx0XHRjb2x1bW5zOiBERUZBVUxUX0NPTFVNTlMubWFwKChuYW1lKSA9PiAoe1xuXHRcdFx0aWQ6IGNyZWF0ZUlkKCksXG5cdFx0XHRuYW1lLFxuXHRcdFx0Y2FyZHM6IFtdLFxuXHRcdH0pKSxcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltcGxlS2FuYmFuUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcblx0cHJpdmF0ZSBib2FyZDogS2FuYmFuQm9hcmREYXRhID0gY3JlYXRlRGVmYXVsdEJvYXJkKCk7XG5cdHByaXZhdGUgdmlld3MgPSBuZXcgU2V0PEthbmJhblZpZXc+KCk7XG5cdHByaXZhdGUgbGFzdENvbHVtbklkPzogc3RyaW5nO1xuXG5cdGFzeW5jIG9ubG9hZCgpIHtcblx0XHRhd2FpdCB0aGlzLmxvYWRCb2FyZCgpO1xuXG5cdFx0dGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFLCAobGVhZikgPT4ge1xuXHRcdFx0Y29uc3QgdmlldyA9IG5ldyBLYW5iYW5WaWV3KGxlYWYsIHRoaXMpO1xuXHRcdFx0dGhpcy5yZWdpc3RlckthbmJhblZpZXcodmlldyk7XG5cdFx0XHRyZXR1cm4gdmlldztcblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkUmliYm9uSWNvbihJQ09OX0lELCBcIlx1NjI1M1x1NUYwMFx1NTNGM1x1NEZBN1x1NzcwQlx1Njc3RlwiLCAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpKTtcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6IFwic2ltcGxlLWthbmJhbi1vcGVuXCIsXG5cdFx0XHRuYW1lOiBcIlx1NjI1M1x1NUYwMFx1NTNGM1x1NEZBN1x1NzcwQlx1Njc3RlwiLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuYWN0aXZhdGVWaWV3KCksXG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcInNpbXBsZS1rYW5iYW4tYWRkLWNhcmRcIixcblx0XHRcdG5hbWU6IFwiXHU2REZCXHU1MkEwXHU1MzYxXHU3MjQ3XCIsXG5cdFx0XHRob3RrZXlzOiBbeyBtb2RpZmllcnM6IFtcIk1vZFwiLCBcIlNoaWZ0XCJdLCBrZXk6IFwiTlwiIH1dLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMub3BlblF1aWNrQWRkQ2FyZCgpLFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdH1cblxuXHRvbnVubG9hZCgpIHtcblx0XHR0aGlzLnZpZXdzLmNsZWFyKCk7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRCb2FyZCgpIHtcblx0XHRjb25zdCBzdG9yZWQgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCk7XG5cdFx0aWYgKHN0b3JlZCAmJiBzdG9yZWQuY29sdW1ucykge1xuXHRcdFx0dGhpcy5ib2FyZCA9IHN0b3JlZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5ib2FyZCA9IGNyZWF0ZURlZmF1bHRCb2FyZCgpO1xuXHRcdH1cblx0XHR0aGlzLm5vcm1hbGl6ZUJvYXJkKCk7XG5cdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSB0aGlzLmJvYXJkLmNvbHVtbnNbMF0/LmlkO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBwZXJzaXN0KCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5ib2FyZCk7XG5cdFx0dGhpcy5ub3RpZnlWaWV3cygpO1xuXHR9XG5cblx0cmVnaXN0ZXJLYW5iYW5WaWV3KHZpZXc6IEthbmJhblZpZXcpIHtcblx0XHR0aGlzLnZpZXdzLmFkZCh2aWV3KTtcblx0XHR2aWV3LnJlZ2lzdGVyKCgpID0+IHRoaXMudmlld3MuZGVsZXRlKHZpZXcpKTtcblx0fVxuXG5cdG5vdGlmeVZpZXdzKCkge1xuXHRcdHRoaXMudmlld3MuZm9yRWFjaCgodmlldykgPT4gdmlldy5yZW5kZXIoKSk7XG5cdH1cblxuXHRnZXRCb2FyZCgpOiBLYW5iYW5Cb2FyZERhdGEge1xuXHRcdHJldHVybiB0aGlzLmJvYXJkO1xuXHR9XG5cblx0YXN5bmMgYWRkQ29sdW1uKG5hbWU6IHN0cmluZykge1xuXHRcdGlmICghbmFtZS50cmltKCkpIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdTY4MEZcdTc2RUVcdTU0MERcdTc5RjBcdTRFMERcdTgwRkRcdTRFM0FcdTdBN0FcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGNvbHVtbiA9IHsgaWQ6IGNyZWF0ZUlkKCksIG5hbWU6IG5hbWUudHJpbSgpLCBjYXJkczogW10gYXMgS2FuYmFuQ2FyZFtdIH07XG5cdFx0dGhpcy5ib2FyZC5jb2x1bW5zLnB1c2goY29sdW1uKTtcblx0XHRpZiAoIXRoaXMubGFzdENvbHVtbklkKSB7XG5cdFx0XHR0aGlzLmxhc3RDb2x1bW5JZCA9IGNvbHVtbi5pZDtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyByZW1vdmVDb2x1bW4oY29sdW1uSWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5ib2FyZC5jb2x1bW5zLmZpbmRJbmRleCgoY29sKSA9PiBjb2wuaWQgPT09IGNvbHVtbklkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2NzJBXHU2MjdFXHU1MjMwXHU2MzA3XHU1QjlBXHU2ODBGXHU3NkVFXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLmJvYXJkLmNvbHVtbnMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHRpZiAodGhpcy5sYXN0Q29sdW1uSWQgPT09IGNvbHVtbklkKSB7XG5cdFx0XHR0aGlzLmxhc3RDb2x1bW5JZCA9IHRoaXMuYm9hcmQuY29sdW1uc1swXT8uaWQ7XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgcmVuYW1lQ29sdW1uKGNvbHVtbklkOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBuZXh0TmFtZSA9IG5hbWUudHJpbSgpO1xuXHRcdGlmICghbmV4dE5hbWUpIHtcblx0XHRcdG5ldyBOb3RpY2UoXCJcdTY4MEZcdTc2RUVcdTU0MERcdTc5RjBcdTRFMERcdTgwRkRcdTRFM0FcdTdBN0FcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbHVtbi5uYW1lID0gbmV4dE5hbWU7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyBhZGRDYXJkKFxuXHRcdGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0cGF5bG9hZDoge1xuXHRcdFx0dGl0bGU6IHN0cmluZztcblx0XHRcdHRhZ3M6IHN0cmluZ1tdO1xuXHRcdFx0cmVtYXJrOiBzdHJpbmc7XG5cdFx0XHRoaXN0b3J5Tm90ZTogc3RyaW5nO1xuXHRcdFx0ZGVhZGxpbmU/OiBudW1iZXIgfCBudWxsO1xuXHRcdH0sXG5cdCkge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXHRcdGNvbnN0IGNhcmQ6IEthbmJhbkNhcmQgPSB7XG5cdFx0XHRpZDogY3JlYXRlSWQoKSxcblx0XHRcdHRpdGxlOiBwYXlsb2FkLnRpdGxlLnRyaW0oKSxcblx0XHRcdHRhZ3M6IHBheWxvYWQudGFncyxcblx0XHRcdHJlbWFyazogcGF5bG9hZC5yZW1hcmssXG5cdFx0XHRkZWFkbGluZTogcGF5bG9hZC5kZWFkbGluZSA/PyBudWxsLFxuXHRcdFx0Y29tcGxldGVkOiBmYWxzZSxcblx0XHRcdGNvbXBsZXRlZEF0OiBudWxsLFxuXHRcdFx0Y3JlYXRlZEF0OiBub3csXG5cdFx0XHR1cGRhdGVkQXQ6IG5vdyxcblx0XHRcdGhpc3Rvcnk6IFtdLFxuXHRcdH07XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIHBheWxvYWQuaGlzdG9yeU5vdGUgfHwgXCJcdTUyMUJcdTVFRkFcIik7XG5cdFx0Y29sdW1uLmNhcmRzLnVuc2hpZnQoY2FyZCk7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyB1cGRhdGVDYXJkKFxuXHRcdGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0Y2FyZElkOiBzdHJpbmcsXG5cdFx0dXBkYXRlczogUGFydGlhbDxQaWNrPEthbmJhbkNhcmQsIFwidGl0bGVcIiB8IFwidGFnc1wiIHwgXCJyZW1hcmtcIiB8IFwiZGVhZGxpbmVcIj4+LFxuXHRcdGhpc3RvcnlOb3RlPzogc3RyaW5nLFxuXHQpIHtcblx0XHRjb25zdCBjYXJkID0gdGhpcy5nZXRDYXJkKGNvbHVtbklkLCBjYXJkSWQpO1xuXHRcdGlmICghY2FyZCkgcmV0dXJuO1xuXHRcdGlmICh1cGRhdGVzLnRpdGxlICE9PSB1bmRlZmluZWQpIGNhcmQudGl0bGUgPSB1cGRhdGVzLnRpdGxlLnRyaW0oKTtcblx0XHRpZiAodXBkYXRlcy50YWdzICE9PSB1bmRlZmluZWQpIGNhcmQudGFncyA9IHVwZGF0ZXMudGFncztcblx0XHRpZiAodXBkYXRlcy5yZW1hcmsgIT09IHVuZGVmaW5lZCkgY2FyZC5yZW1hcmsgPSB1cGRhdGVzLnJlbWFyaztcblx0XHRpZiAodXBkYXRlcy5kZWFkbGluZSAhPT0gdW5kZWZpbmVkKSBjYXJkLmRlYWRsaW5lID0gdXBkYXRlcy5kZWFkbGluZTtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGhpc3RvcnlOb3RlIHx8IFwiXHU1MTg1XHU1QkI5XHU2NkY0XHU2NUIwXCIpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgbW92ZUNhcmQoXG5cdFx0Y2FyZElkOiBzdHJpbmcsXG5cdFx0ZnJvbUNvbHVtbklkOiBzdHJpbmcsXG5cdFx0dG9Db2x1bW5JZDogc3RyaW5nLFxuXHRcdGJlZm9yZUNhcmRJZD86IHN0cmluZyxcblx0KSB7XG5cdFx0Y29uc3QgZnJvbUNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGZyb21Db2x1bW5JZCk7XG5cdFx0Y29uc3QgdG9Db2x1bW4gPSB0aGlzLmdldENvbHVtbih0b0NvbHVtbklkKTtcblx0XHRjb25zdCBpbmRleCA9IGZyb21Db2x1bW4uY2FyZHMuZmluZEluZGV4KChjKSA9PiBjLmlkID09PSBjYXJkSWQpO1xuXHRcdGlmIChpbmRleCA9PT0gLTEpIHJldHVybjtcblx0XHRjb25zdCBbY2FyZF0gPSBmcm9tQ29sdW1uLmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0bGV0IHRhcmdldEluZGV4ID0gdG9Db2x1bW4uY2FyZHMubGVuZ3RoO1xuXHRcdGlmIChiZWZvcmVDYXJkSWQpIHtcblx0XHRcdGNvbnN0IGJlZm9yZUluZGV4ID0gdG9Db2x1bW4uY2FyZHMuZmluZEluZGV4KChjKSA9PiBjLmlkID09PSBiZWZvcmVDYXJkSWQpO1xuXHRcdFx0dGFyZ2V0SW5kZXggPSBiZWZvcmVJbmRleCA9PT0gLTEgPyB0b0NvbHVtbi5jYXJkcy5sZW5ndGggOiBiZWZvcmVJbmRleDtcblx0XHR9XG5cdFx0dG9Db2x1bW4uY2FyZHMuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBjYXJkKTtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0aWYgKGZyb21Db2x1bW5JZCAhPT0gdG9Db2x1bW5JZCkge1xuXHRcdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGBcdTc5RkJcdTUyQThcdTUyMzBcdTMwMEMke3RvQ29sdW1uLm5hbWV9XHUzMDBEYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBcIlx1OEMwM1x1NjU3NFx1OTg3QVx1NUU4RlwiKTtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyB0b2dnbGVDYXJkQ29tcGxldGlvbihjb2x1bW5JZDogc3RyaW5nLCBjYXJkSWQ6IHN0cmluZywgY29tcGxldGVkOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oY29sdW1uSWQpO1xuXHRcdGNvbnN0IGluZGV4ID0gY29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gY2FyZElkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG5cdFx0Y29uc3QgW2NhcmRdID0gY29sdW1uLmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0Y2FyZC5jb21wbGV0ZWQgPSBjb21wbGV0ZWQ7XG5cdFx0Y2FyZC5jb21wbGV0ZWRBdCA9IGNvbXBsZXRlZCA/IERhdGUubm93KCkgOiBudWxsO1xuXHRcdGNhcmQudXBkYXRlZEF0ID0gRGF0ZS5ub3coKTtcblx0XHR0aGlzLnJlY29yZEhpc3RvcnkoY2FyZCwgY29tcGxldGVkID8gXCJcdTY4MDdcdThCQjBcdTVCOENcdTYyMTBcIiA6IFwiXHU1M0Q2XHU2RDg4XHU1QjhDXHU2MjEwXCIpO1xuXHRcdGNvbnN0IGluc2VydEluZGV4ID0gY29tcGxldGVkID8gY29sdW1uLmNhcmRzLmxlbmd0aCA6IE1hdGgubWluKGluZGV4LCBjb2x1bW4uY2FyZHMubGVuZ3RoKTtcblx0XHRjb2x1bW4uY2FyZHMuc3BsaWNlKGluc2VydEluZGV4LCAwLCBjYXJkKTtcblx0XHRhd2FpdCB0aGlzLnBlcnNpc3QoKTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0Q29sdW1uKGNvbHVtbklkOiBzdHJpbmcpOiBLYW5iYW5Db2x1bW4ge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuYm9hcmQuY29sdW1ucy5maW5kKChjb2wpID0+IGNvbC5pZCA9PT0gY29sdW1uSWQpO1xuXHRcdGlmICghY29sdW1uKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJcdTY3MkFcdTYyN0VcdTUyMzBcdTYzMDdcdTVCOUFcdTc2ODRcdTY4MEZcdTc2RUVcIik7XG5cdFx0fVxuXHRcdHJldHVybiBjb2x1bW47XG5cdH1cblxuXHRwcml2YXRlIGdldENhcmQoY29sdW1uSWQ6IHN0cmluZywgY2FyZElkOiBzdHJpbmcpOiBLYW5iYW5DYXJkIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBjb2x1bW4gPSB0aGlzLmdldENvbHVtbihjb2x1bW5JZCk7XG5cdFx0cmV0dXJuIGNvbHVtbi5jYXJkcy5maW5kKChjYXJkKSA9PiBjYXJkLmlkID09PSBjYXJkSWQpO1xuXHR9XG5cblx0cHJpdmF0ZSByZWNvcmRIaXN0b3J5KGNhcmQ6IEthbmJhbkNhcmQsIHJlbWFyazogc3RyaW5nKSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGNhcmQuaGlzdG9yeSkpIHtcblx0XHRcdGNhcmQuaGlzdG9yeSA9IFtdO1xuXHRcdH1cblx0XHRjYXJkLmhpc3RvcnkudW5zaGlmdCh7XG5cdFx0XHR0aW1lc3RhbXA6IERhdGUubm93KCksXG5cdFx0XHRyZW1hcms6IHJlbWFyayB8fCBcIlx1NjZGNFx1NjVCMFwiLFxuXHRcdH0pO1xuXHRcdGNhcmQuaGlzdG9yeSA9IGNhcmQuaGlzdG9yeS5zbGljZSgwLCA1MCk7XG5cdH1cblxuXHRwcml2YXRlIG5vcm1hbGl6ZUJvYXJkKCkge1xuXHRcdGZvciAoY29uc3QgY29sdW1uIG9mIHRoaXMuYm9hcmQuY29sdW1ucykge1xuXHRcdFx0Y29sdW1uLmNhcmRzID0gY29sdW1uLmNhcmRzLm1hcCgoY2FyZCkgPT4gKHtcblx0XHRcdFx0Li4uY2FyZCxcblx0XHRcdFx0ZGVhZGxpbmU6IGNhcmQuZGVhZGxpbmUgPz8gbnVsbCxcblx0XHRcdFx0Y29tcGxldGVkQXQ6IGNhcmQuY29tcGxldGVkQXQgPz8gbnVsbCxcblx0XHRcdH0pKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBhY3RpdmF0ZVZpZXcoKSB7XG5cdFx0Y29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEUpO1xuXHRcdGlmIChsZWF2ZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLnJldmVhbExlYWYobGVhdmVzWzBdKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgcmlnaHRMZWFmID0gdGhpcy5hcHAud29ya3NwYWNlLmdldFJpZ2h0TGVhZihmYWxzZSk7XG5cdFx0YXdhaXQgcmlnaHRMZWFmPy5zZXRWaWV3U3RhdGUoeyB0eXBlOiBWSUVXX1RZUEUsIGFjdGl2ZTogdHJ1ZSB9KTtcblx0XHRpZiAocmlnaHRMZWFmKSB7XG5cdFx0XHR0aGlzLmFwcC53b3Jrc3BhY2UucmV2ZWFsTGVhZihyaWdodExlYWYpO1xuXHRcdH1cblx0fVxuXG5cdHNldEFjdGl2ZUNvbHVtbihjb2x1bW5JZDogc3RyaW5nKSB7XG5cdFx0dGhpcy5sYXN0Q29sdW1uSWQgPSBjb2x1bW5JZDtcblx0fVxuXG5cdHByaXZhdGUgcmVzb2x2ZUNvbHVtbkZvclF1aWNrQWRkKCk6IEthbmJhbkNvbHVtbiB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKCF0aGlzLmJvYXJkLmNvbHVtbnMubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHByZWZlcnJlZCA9XG5cdFx0XHR0aGlzLmxhc3RDb2x1bW5JZCAmJiB0aGlzLmJvYXJkLmNvbHVtbnMuZmluZCgoY29sKSA9PiBjb2wuaWQgPT09IHRoaXMubGFzdENvbHVtbklkKTtcblx0XHRyZXR1cm4gcHJlZmVycmVkID8/IHRoaXMuYm9hcmQuY29sdW1uc1swXTtcblx0fVxuXG5cdG9wZW5RdWlja0FkZENhcmQoKSB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5yZXNvbHZlQ29sdW1uRm9yUXVpY2tBZGQoKTtcblx0XHRpZiAoIWNvbHVtbikge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1OEJGN1x1NTE0OFx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5zZXRBY3RpdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRuZXcgQ2FyZE1vZGFsKHRoaXMuYXBwLCB0aGlzLCBjb2x1bW4uaWQpLm9wZW4oKTtcblx0fVxufVxuXG5jbGFzcyBLYW5iYW5WaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuXHRwcml2YXRlIGRyYWdTdGF0ZT86IHsgY29sdW1uSWQ6IHN0cmluZzsgY2FyZElkOiBzdHJpbmc7IGNhcmRIZWlnaHQ6IG51bWJlciB9O1xuXHRwcml2YXRlIHBsYWNlaG9sZGVyRWw/OiBIVE1MRWxlbWVudDtcblx0cHJpdmF0ZSBwbGFjZWhvbGRlclN0YXRlPzogeyBjb2x1bW5JZDogc3RyaW5nOyBiZWZvcmVJZD86IHN0cmluZyB9O1xuXHRwcml2YXRlIGRlYWRsaW5lRmlsdGVycyA9IG5ldyBNYXA8c3RyaW5nLCBib29sZWFuPigpO1xuXHRwcml2YXRlIGFjdGl2ZVRhYjogXCJib2FyZFwiIHwgXCJzdGF0c1wiID0gXCJib2FyZFwiO1xuXG5cdGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHByaXZhdGUgcGx1Z2luOiBTaW1wbGVLYW5iYW5QbHVnaW4pIHtcblx0XHRzdXBlcihsZWFmKTtcblx0fVxuXG5cdGdldFZpZXdUeXBlKCkge1xuXHRcdHJldHVybiBWSUVXX1RZUEU7XG5cdH1cblxuXHRnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIlx1NTNGM1x1NEZBN1x1NzcwQlx1Njc3RlwiO1xuXHR9XG5cblx0Z2V0SWNvbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiBJQ09OX0lEO1xuXHR9XG5cblx0YXN5bmMgb25PcGVuKCkge1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblxuXHRhc3luYyBvbkNsb3NlKCkge1xuXHRcdHRoaXMuZHJhZ1N0YXRlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGVudEVsO1xuXHRcdGNvbnRhaW5lci5lbXB0eSgpO1xuXHRcdGNvbnRhaW5lci5hZGRDbGFzcyhcInNrLWthbmJhblwiKTtcblxuXHRcdGNvbnN0IHRhYnMgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXRhYnNcIiB9KTtcblx0XHR0aGlzLnJlbmRlclRhYkJ1dHRvbih0YWJzLCBcImJvYXJkXCIsIFwiXHU0RUZCXHU1MkExXHU3NzBCXHU2NzdGXCIpO1xuXHRcdHRoaXMucmVuZGVyVGFiQnV0dG9uKHRhYnMsIFwic3RhdHNcIiwgXCJcdTY1NDhcdTczODdcdTdFREZcdThCQTFcIik7XG5cblx0XHRjb25zdCBib2R5ID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay10YWItcGFuZWxcIiB9KTtcblx0XHRpZiAodGhpcy5hY3RpdmVUYWIgPT09IFwiYm9hcmRcIikge1xuXHRcdFx0dGhpcy5yZW5kZXJCb2FyZChib2R5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5yZW5kZXJTdGF0cyhib2R5KTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRhYkJ1dHRvbihjb250YWluZXI6IEhUTUxFbGVtZW50LCB0YWI6IFwiYm9hcmRcIiB8IFwic3RhdHNcIiwgbGFiZWw6IHN0cmluZykge1xuXHRcdGNvbnN0IGJ1dHRvbiA9IGNvbnRhaW5lci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBsYWJlbCxcblx0XHRcdGNsczogW1wic2stdGFiXCIsIHRoaXMuYWN0aXZlVGFiID09PSB0YWIgPyBcInNrLXRhYi1hY3RpdmVcIiA6IFwiXCJdLmpvaW4oXCIgXCIpLnRyaW0oKSxcblx0XHR9KTtcblx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdGlmICh0aGlzLmFjdGl2ZVRhYiA9PT0gdGFiKSByZXR1cm47XG5cdFx0XHR0aGlzLmFjdGl2ZVRhYiA9IHRhYjtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckJvYXJkKGJvZHk6IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3QgYm9hcmQgPSB0aGlzLnBsdWdpbi5nZXRCb2FyZCgpO1xuXG5cdFx0Y29uc3QgaGVhZGVyID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2staGVhZGVyXCIgfSk7XG5cdFx0aGVhZGVyLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIlx1NEZBN1x1OEZCOVx1NzcwQlx1Njc3RlwiIH0pO1xuXHRcdGNvbnN0IGFkZENvbHVtbkJ0biA9IGhlYWRlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBcIlx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdGFkZENvbHVtbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0bmV3IENvbHVtbk1vZGFsKHRoaXMuYXBwLCB7XG5cdFx0XHRcdHRpdGxlOiBcIlx1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0XHRjb25maXJtVGV4dDogXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdFx0b25TdWJtaXQ6IGFzeW5jICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLmFkZENvbHVtbih2YWx1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjb2x1bW5zV3JhcHBlciA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbnNcIiB9KTtcblx0XHRpZiAoIWJvYXJkLmNvbHVtbnMubGVuZ3RoKSB7XG5cdFx0XHRjb2x1bW5zV3JhcHBlci5jcmVhdGVEaXYoeyB0ZXh0OiBcIlx1NjY4Mlx1NjVFMFx1NjgwRlx1NzZFRVx1RkYwQ1x1NzBCOVx1NTFGQlx1MjAxQ1x1NjVCMFx1NTg5RVx1NjgwRlx1NzZFRVx1MjAxRFx1MzAwMlwiLCBjbHM6IFwic2stZW1wdHlcIiB9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiBib2FyZC5jb2x1bW5zKSB7XG5cdFx0XHR0aGlzLnJlbmRlckNvbHVtbihjb2x1bW5zV3JhcHBlciwgY29sdW1uKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclN0YXRzKGJvZHk6IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3Qgc3RhdHMgPSB0aGlzLmJ1aWxkU3RhdHNTbmFwc2hvdCgpO1xuXG5cdFx0Ym9keS5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdTY1NDhcdTczODdcdTdFREZcdThCQTFcIiwgY2xzOiBcInNrLXN0YXRzLXRpdGxlXCIgfSk7XG5cblx0XHRjb25zdCBkYXNoYm9hcmQgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0cy1kYXNoYm9hcmRcIiB9KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKGRhc2hib2FyZCwgXCJcdTYwM0JcdTRFRkJcdTUyQTFcIiwgc3RhdHMudG90YWxUYXNrcy50b1N0cmluZygpLCBcIlx1N0QyRlx1OEJBMVx1NTIxQlx1NUVGQVwiKTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTVCOENcdTYyMTBcdTczODdcIixcblx0XHRcdGZvcm1hdFBlcmNlbnQoc3RhdHMuY29tcGxldGlvblJhdGUpLFxuXHRcdFx0YFx1NURGMlx1NUI4Q1x1NjIxMCAke3N0YXRzLmNvbXBsZXRlZFRhc2tzfS8ke3N0YXRzLnRvdGFsVGFza3MgfHwgMX1gLFxuXHRcdCk7XG5cdFx0dGhpcy5yZW5kZXJTdGF0Q2FyZChkYXNoYm9hcmQsIFwiXHU1RjUzXHU1MjREXHU4RkRCXHU4ODRDXHU0RTJEXCIsIHN0YXRzLndpcENvdW50LnRvU3RyaW5nKCksIFwiXHU0RUNEXHU2NzJBXHU1QjhDXHU2MjEwXCIpO1xuXHRcdHRoaXMucmVuZGVyU3RhdENhcmQoXG5cdFx0XHRkYXNoYm9hcmQsXG5cdFx0XHRcIlx1OTAzRVx1NjcxRlx1NzM4N1wiLFxuXHRcdFx0c3RhdHMuZGVhZGxpbmVDb3VudCA/IGZvcm1hdFBlcmNlbnQoc3RhdHMub3ZlcmR1ZVJhdGUpIDogXCJcdTIwMTRcIixcblx0XHRcdGAke3N0YXRzLm92ZXJkdWVDb3VudH0vJHtzdGF0cy5kZWFkbGluZUNvdW50IHx8IDF9IFx1NjIyQVx1NkI2Mlx1NEVGQlx1NTJBMWAsXG5cdFx0KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTBcdTczODdcIixcblx0XHRcdHN0YXRzLmRlYWRsaW5lQ291bnQgPyBmb3JtYXRQZXJjZW50KHN0YXRzLm9uVGltZVJhdGUpIDogXCJcdTIwMTRcIixcblx0XHRcdFwiXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXHU2MzA5XHU2NUY2XHU1QjhDXHU2MjEwXCIsXG5cdFx0KTtcblx0XHR0aGlzLnJlbmRlclN0YXRDYXJkKFxuXHRcdFx0ZGFzaGJvYXJkLFxuXHRcdFx0XCJcdTVFNzNcdTU3NDdcdTVCOENcdTYyMTBcdTU0NjhcdTY3MUZcIixcblx0XHRcdHN0YXRzLmF2Z0N5Y2xlVGltZU1zID8gZm9ybWF0RHVyYXRpb24oc3RhdHMuYXZnQ3ljbGVUaW1lTXMpIDogXCJcdTIwMTRcIixcblx0XHRcdFwiXHU0RUNFXHU1MjFCXHU1RUZBXHU1MjMwXHU1QjhDXHU2MjEwXCIsXG5cdFx0KTtcblxuXHRcdGNvbnN0IGNoYXJ0U2VjdGlvbiA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXRzLXNlY3Rpb25cIiB9KTtcblx0XHRjaGFydFNlY3Rpb24uY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiXHU2QkNGXHU2NUU1XHU0RUZCXHU1MkExXHU4RDhCXHU1MkJGXHVGRjA4XHU4RkQxMTRcdTU5MjlcdUZGMDlcIiB9KTtcblx0XHR0aGlzLnJlbmRlckRhaWx5QmFyQ2hhcnQoY2hhcnRTZWN0aW9uLCBzdGF0cy5kYWlseVNlcmllcyk7XG5cblx0XHRjb25zdCByYXRlU2VjdGlvbiA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXN0YXRzLXNlY3Rpb25cIiB9KTtcblx0XHRyYXRlU2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdTZCQ0ZcdTY1RTVcdTVCOENcdTYyMTBcdTczODdcdUZGMDhcdThGRDExNFx1NTkyOVx1RkYwOVwiIH0pO1xuXHRcdHRoaXMucmVuZGVyRGFpbHlSYXRlQ2hhcnQocmF0ZVNlY3Rpb24sIHN0YXRzLmRhaWx5UmF0ZXMpO1xuXG5cdFx0Y29uc3QgZGVhZGxpbmVTZWN0aW9uID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwic2stc3RhdHMtc2VjdGlvblwiIH0pO1xuXHRcdGRlYWRsaW5lU2VjdGlvbi5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcdTY5ODJcdTg5QzhcIiB9KTtcblx0XHR0aGlzLnJlbmRlckRlYWRsaW5lQnJlYWtkb3duKGRlYWRsaW5lU2VjdGlvbiwgc3RhdHMpO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDb2x1bW4od3JhcHBlcjogSFRNTEVsZW1lbnQsIGNvbHVtbjogS2FuYmFuQ29sdW1uKSB7XG5cdFx0Y29uc3QgY29sdW1uRWwgPSB3cmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW5cIiB9KTtcblxuXHRcdGNvbnN0IGNvbHVtbkhlYWRlciA9IGNvbHVtbkVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jb2x1bW4taGVhZGVyXCIgfSk7XG5cdFx0Y29uc3QgdGl0bGVFbCA9IGNvbHVtbkhlYWRlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uLXRpdGxlXCIsIGF0dHI6IHsgcm9sZTogXCJidXR0b25cIiB9IH0pO1xuXHRcdHRpdGxlRWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IGNvbHVtbi5uYW1lIH0pO1xuXHRcdHRpdGxlRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDb2x1bW5Nb2RhbCh0aGlzLmFwcCwge1xuXHRcdFx0XHR0aXRsZTogXCJcdTdGMTZcdThGOTFcdTY4MEZcdTc2RUVcIixcblx0XHRcdFx0aW5pdGlhbFZhbHVlOiBjb2x1bW4ubmFtZSxcblx0XHRcdFx0Y29uZmlybVRleHQ6IFwiXHU0RkREXHU1QjU4XCIsXG5cdFx0XHRcdG9uU3VibWl0OiBhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5yZW5hbWVDb2x1bW4oY29sdW1uLmlkLCB2YWx1ZSk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBhY3Rpb25zRWwgPSBjb2x1bW5IZWFkZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNvbHVtbi1hY3Rpb25zXCIgfSk7XG5cdFx0Y29uc3QgYWRkQnRuID0gYWN0aW9uc0VsLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTZERkJcdTUyQTBcdTUzNjFcdTcyNDdcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tc21hbGxcIiB9KTtcblx0XHRhZGRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdHRoaXMucGx1Z2luLnNldEFjdGl2ZUNvbHVtbihjb2x1bW4uaWQpO1xuXHRcdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGNvbHVtbi5pZCkub3BlbigpO1xuXHRcdH0pO1xuXHRcdGNvbnN0IGRlbGV0ZUJ0biA9IGFjdGlvbnNFbC5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiBcIlx1NTIyMFx1OTY2NFwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3Qgc2stYnRuLXNtYWxsXCIsXG5cdFx0XHRhdHRyOiB7IFwiYXJpYS1sYWJlbFwiOiBcIlx1NTIyMFx1OTY2NFx1NjgwRlx1NzZFRVwiIH0sXG5cdFx0fSk7XG5cdFx0ZGVsZXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHRuZXcgQ29uZmlybU1vZGFsKHRoaXMuYXBwLCB7XG5cdFx0XHRcdHRpdGxlOiBcIlx1NTIyMFx1OTY2NFx1NjgwRlx1NzZFRVwiLFxuXHRcdFx0XHRtZXNzYWdlOiBgXHU3ODZFXHU1QjlBXHU1MjIwXHU5NjY0XHUzMDBDJHtjb2x1bW4ubmFtZX1cdTMwMERcdTUzQ0FcdTUxNzZcdTYyNDBcdTY3MDlcdTUzNjFcdTcyNDdcdUZGMUZgLFxuXHRcdFx0XHRjb25maXJtVGV4dDogXCJcdTUyMjBcdTk2NjRcIixcblx0XHRcdFx0b25Db25maXJtOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4ucmVtb3ZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjYXJkc0NvbnRhaW5lciA9IGNvbHVtbkVsLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFwic2stY2FyZHNcIixcblx0XHRcdGF0dHI6IHsgXCJkYXRhLWNvbHVtblwiOiBjb2x1bW4uaWQgfSxcblx0XHR9KTtcblx0XHRjb25zdCBmaWx0ZXJXcmFwcGVyID0gYWN0aW9uc0VsLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyBjbHM6IFwic2stZmlsdGVyLXRvZ2dsZVwiIH0pO1xuXHRcdGNvbnN0IGRlYWRsaW5lT25seSA9IHRoaXMuZGVhZGxpbmVGaWx0ZXJzLmdldChjb2x1bW4uaWQpID8/IGZhbHNlO1xuXHRcdGNvbnN0IGZpbHRlckNoZWNrYm94ID0gZmlsdGVyV3JhcHBlci5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cdFx0ZmlsdGVyQ2hlY2tib3guY2hlY2tlZCA9IGRlYWRsaW5lT25seTtcblx0XHRmaWx0ZXJDaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcblx0XHRcdHRoaXMuZGVhZGxpbmVGaWx0ZXJzLnNldChjb2x1bW4uaWQsIGZpbHRlckNoZWNrYm94LmNoZWNrZWQpO1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9KTtcblx0XHRmaWx0ZXJXcmFwcGVyLmNyZWF0ZVNwYW4oeyB0ZXh0OiBcIlx1NEVDNVx1NjIyQVx1NkI2MlwiIH0pO1xuXG5cdFx0Y2FyZHNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0Y29uc3QgYmVmb3JlSWQgPSB0aGlzLmdldEJlZm9yZUNhcmRJZChjYXJkc0NvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY2FyZHNDb250YWluZXIsIGJlZm9yZUlkKTtcblx0XHR9KTtcblx0XHRjYXJkc0NvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IGJlZm9yZUlkID1cblx0XHRcdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlPy5jb2x1bW5JZCA9PT0gY29sdW1uLmlkXG5cdFx0XHRcdFx0PyB0aGlzLnBsYWNlaG9sZGVyU3RhdGUuYmVmb3JlSWRcblx0XHRcdFx0XHQ6IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNhcmRzQ29udGFpbmVyLCBldnQuY2xpZW50WSk7XG5cdFx0XHR2b2lkIHRoaXMuaGFuZGxlRHJvcChjb2x1bW4uaWQsIGJlZm9yZUlkKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGNhcmRzVG9SZW5kZXIgPSB0aGlzLmdldENhcmRzRm9yQ29sdW1uKGNvbHVtbiwgZGVhZGxpbmVPbmx5KTtcblxuXHRcdGlmICghY2FyZHNUb1JlbmRlci5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGVtcHR5VGV4dCA9IGRlYWRsaW5lT25seSA/IFwiXHU2NjgyXHU2NUUwXHU2MjJBXHU2QjYyXHU0RUZCXHU1MkExXCIgOiBcIlx1RDgzRFx1RENERCBcdTY2ODJcdTY1RTBcdTRFRkJcdTUyQTFcIjtcblx0XHRcdGNvbnN0IGVtcHR5ID0gY2FyZHNDb250YWluZXIuY3JlYXRlRGl2KHsgdGV4dDogZW1wdHlUZXh0LCBjbHM6IFwic2stZW1wdHlcIiB9KTtcblx0XHRcdGVtcHR5LmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpZiAoZXZ0LmRhdGFUcmFuc2ZlcikgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gXCJtb3ZlXCI7XG5cdFx0XHRcdGNvbnN0IGJlZm9yZUlkID0gdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY2FyZHNDb250YWluZXIsIGJlZm9yZUlkKTtcblx0XHRcdH0pO1xuXHRcdFx0ZW1wdHkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGV2dCkgPT4ge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0Y29uc3QgYmVmb3JlSWQgPVxuXHRcdFx0XHRcdHRoaXMucGxhY2Vob2xkZXJTdGF0ZT8uY29sdW1uSWQgPT09IGNvbHVtbi5pZFxuXHRcdFx0XHRcdFx0PyB0aGlzLnBsYWNlaG9sZGVyU3RhdGUuYmVmb3JlSWRcblx0XHRcdFx0XHRcdDogdGhpcy5nZXRCZWZvcmVDYXJkSWQoY2FyZHNDb250YWluZXIsIGV2dC5jbGllbnRZKTtcblx0XHRcdFx0dm9pZCB0aGlzLmhhbmRsZURyb3AoY29sdW1uLmlkLCBiZWZvcmVJZCk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjYXJkc1RvUmVuZGVyLmZvckVhY2goKGNhcmQpID0+IHtcblx0XHRcdHRoaXMucmVuZGVyQ2FyZChjYXJkc0NvbnRhaW5lciwgY29sdW1uLCBjYXJkKTtcblx0XHR9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ2FyZChjb250YWluZXI6IEhUTUxFbGVtZW50LCBjb2x1bW46IEthbmJhbkNvbHVtbiwgY2FyZDogS2FuYmFuQ2FyZCkge1xuXHRcdGNvbnN0IGNhcmRDbGFzc2VzID0gW1wic2stY2FyZFwiXTtcblx0XHRpZiAoY2FyZC5jb21wbGV0ZWQpIGNhcmRDbGFzc2VzLnB1c2goXCJzay1jYXJkLWNvbXBsZXRlZFwiKTtcblx0XHRpZiAoY2FyZC5kZWFkbGluZSkgY2FyZENsYXNzZXMucHVzaChcInNrLWNhcmQtZGVhZGxpbmVcIik7XG5cdFx0Y29uc3QgY2FyZEVsID0gY29udGFpbmVyLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IGNhcmRDbGFzc2VzLmpvaW4oXCIgXCIpLFxuXHRcdFx0YXR0cjogeyBkcmFnZ2FibGU6IFwidHJ1ZVwiLCBcImRhdGEtY2FyZFwiOiBjYXJkLmlkIH0sXG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmRhdGFzZXQuY2FyZElkID0gY2FyZC5pZDtcblxuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldnQpID0+IHtcblx0XHRcdHRoaXMuZHJhZ1N0YXRlID0geyBjYXJkSWQ6IGNhcmQuaWQsIGNvbHVtbklkOiBjb2x1bW4uaWQsIGNhcmRIZWlnaHQ6IGNhcmRFbC5vZmZzZXRIZWlnaHQgfTtcblx0XHRcdGNhcmRFbC5hZGRDbGFzcyhcInNrLWNhcmQtZHJhZ2dpbmdcIik7XG5cdFx0XHRldnQuZGF0YVRyYW5zZmVyPy5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBjYXJkLmlkKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbmRcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcmFnZ2luZ1wiKTtcblx0XHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIChldnQpID0+IHtcblx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibW92ZVwiO1xuXHRcdFx0Y2FyZEVsLmFkZENsYXNzKFwic2stY2FyZC1kcm9wXCIpO1xuXHRcdFx0Y29uc3QgY29udGFpbmVyID0gY2FyZEVsLnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRjb25zdCBiZWZvcmVJZCA9IHRoaXMuZ2V0QmVmb3JlQ2FyZElkKGNvbnRhaW5lciwgZXZ0LmNsaWVudFkpO1xuXHRcdFx0dGhpcy5tb3ZlUGxhY2Vob2xkZXIoY29udGFpbmVyLCBiZWZvcmVJZCk7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcm9wXCIpO1xuXHRcdH0pO1xuXG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG5cdFx0XHRjb25zdCB0YXJnZXQgPSBldnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdFx0aWYgKHRhcmdldC5jbG9zZXN0KFwiLnNrLWhpc3RvcnktaG9zdFwiKSkgcmV0dXJuO1xuXHRcdFx0dGhpcy5wbHVnaW4uc2V0QWN0aXZlQ29sdW1uKGNvbHVtbi5pZCk7XG5cdFx0XHRuZXcgQ2FyZE1vZGFsKHRoaXMuYXBwLCB0aGlzLnBsdWdpbiwgY29sdW1uLmlkLCBjYXJkKS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCB0b3BSb3cgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdG9wXCIgfSk7XG5cdFx0Y29uc3QgY2hlY2tib3ggPSB0b3BSb3cuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuXHRcdGNoZWNrYm94LmNoZWNrZWQgPSBjYXJkLmNvbXBsZXRlZDtcblx0XHRjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4udG9nZ2xlQ2FyZENvbXBsZXRpb24oY29sdW1uLmlkLCBjYXJkLmlkLCBjaGVja2JveC5jaGVja2VkKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IHRpdGxlRWwgPSB0b3BSb3cuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdGl0bGVcIiwgdGV4dDogY2FyZC50aXRsZSB9KTtcblx0XHR0aXRsZUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnBsdWdpbi5zZXRBY3RpdmVDb2x1bW4oY29sdW1uLmlkKTtcblx0XHRcdG5ldyBDYXJkTW9kYWwodGhpcy5hcHAsIHRoaXMucGx1Z2luLCBjb2x1bW4uaWQsIGNhcmQpLm9wZW4oKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGhpc3RvcnlIb3N0ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LWhvc3RcIiB9KTtcblx0XHRjb25zdCBoaXN0b3J5TWFya2VyID0gaGlzdG9yeUhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhpc3RvcnktbWFya2VyXCIsIHRleHQ6IFwiXHUyM0YxXCIgfSk7XG5cdFx0Y29uc3QgcG9wb3ZlciA9IGhpc3RvcnlIb3N0LmNyZWF0ZURpdih7IGNsczogXCJzay1oaXN0b3J5LXBvcG92ZXJcIiB9KTtcblx0XHRjb25zdCBoaXN0b3J5RW50cmllcyA9IEFycmF5LmlzQXJyYXkoY2FyZC5oaXN0b3J5KSA/IGNhcmQuaGlzdG9yeSA6IFtdO1xuXHRcdGhpc3RvcnlFbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiB7XG5cdFx0XHRwb3BvdmVyLmNyZWF0ZURpdih7XG5cdFx0XHRcdGNsczogXCJzay1oaXN0b3J5LWVudHJ5XCIsXG5cdFx0XHRcdHRleHQ6IGAke2Zvcm1hdERhdGUoZW50cnkudGltZXN0YW1wKX0gXHUwMEI3ICR7ZW50cnkucmVtYXJrIHx8IFwiXHU0RkVFXHU2NTM5XCJ9YCxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdGlmICghaGlzdG9yeUVudHJpZXMubGVuZ3RoKSB7XG5cdFx0XHRwb3BvdmVyLmNyZWF0ZURpdih7IHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU1Mzg2XHU1M0YyXCIsIGNsczogXCJzay1oaXN0b3J5LWVudHJ5XCIgfSk7XG5cdFx0fVxuXHRcdGxldCBoaWRlVGltZW91dDogTnVsbGFibGVUaW1lb3V0ID0gbnVsbDtcblx0XHRjb25zdCBjbGVhckhpZGVUaW1lb3V0ID0gKCkgPT4ge1xuXHRcdFx0aWYgKGhpZGVUaW1lb3V0ICE9PSBudWxsKSB7XG5cdFx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoaGlkZVRpbWVvdXQpO1xuXHRcdFx0XHRoaWRlVGltZW91dCA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBzaG93SGlzdG9yeSA9ICgpID0+IHtcblx0XHRcdGNsZWFySGlkZVRpbWVvdXQoKTtcblx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHR9O1xuXHRcdGNvbnN0IHNjaGVkdWxlSGlkZSA9ICgpID0+IHtcblx0XHRcdGNsZWFySGlkZVRpbWVvdXQoKTtcblx0XHRcdGhpZGVUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAoIWhpc3RvcnlIb3N0Lmhhc0NsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIikpIHtcblx0XHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDE1MCk7XG5cdFx0fTtcblx0XHRoaXN0b3J5SG9zdC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBzaG93SGlzdG9yeSk7XG5cdFx0aGlzdG9yeUhvc3QuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgc2NoZWR1bGVIaWRlKTtcblx0XHRoaXN0b3J5TWFya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRjbGVhckhpZGVUaW1lb3V0KCk7XG5cdFx0XHRpZiAoaGlzdG9yeUhvc3QuaGFzQ2xhc3MoXCJzay1oaXN0b3J5LXBpbm5lZFwiKSkge1xuXHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktcGlubmVkXCIpO1xuXHRcdFx0XHRpZiAoIWhpc3RvcnlIb3N0Lm1hdGNoZXMoXCI6aG92ZXJcIikpIHtcblx0XHRcdFx0XHRoaXN0b3J5SG9zdC5yZW1vdmVDbGFzcyhcInNrLWhpc3RvcnktaG92ZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1waW5uZWRcIik7XG5cdFx0XHRcdGhpc3RvcnlIb3N0LmFkZENsYXNzKFwic2staGlzdG9yeS1ob3ZlclwiKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmIChjYXJkLnRhZ3MubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCB0YWdSb3cgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtdGFnc1wiIH0pO1xuXHRcdFx0Y2FyZC50YWdzLmZvckVhY2goKHRhZykgPT4gdGFnUm93LmNyZWF0ZURpdih7IGNsczogXCJzay10YWdcIiwgdGV4dDogdGFnIH0pKTtcblx0XHR9XG5cblx0XHRpZiAoY2FyZC5yZW1hcmspIHtcblx0XHRcdGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC1yZW1hcmtcIiwgdGV4dDogY2FyZC5yZW1hcmsgfSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWV0YSA9IGNhcmRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2FyZC1tZXRhXCIgfSk7XG5cdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NTIxQlx1NUVGQVx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLmNyZWF0ZWRBdCl9YCB9KTtcblx0XHRtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBgXHU2NkY0XHU2NUIwXHVGRjFBJHtmb3JtYXREYXRlKGNhcmQudXBkYXRlZEF0KX1gIH0pO1xuXHRcdGlmIChjYXJkLmRlYWRsaW5lKSB7XG5cdFx0XHRtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBgXHU2MjJBXHU2QjYyXHVGRjFBJHtmb3JtYXREYXRlKGNhcmQuZGVhZGxpbmUpfWAsIGNsczogXCJzay1jYXJkLWRlYWRsaW5lLXRleHRcIiB9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FyZEVsO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVEcm9wKHRhcmdldENvbHVtbklkOiBzdHJpbmcsIGJlZm9yZUNhcmRJZD86IHN0cmluZykge1xuXHRcdGlmICghdGhpcy5kcmFnU3RhdGUpIHJldHVybjtcblx0XHRjb25zdCB7IGNvbHVtbklkLCBjYXJkSWQgfSA9IHRoaXMuZHJhZ1N0YXRlO1xuXHRcdGlmICh0YXJnZXRDb2x1bW5JZCA9PT0gY29sdW1uSWQgJiYgYmVmb3JlQ2FyZElkID09PSBjYXJkSWQpIHtcblx0XHRcdHRoaXMucmVzZXREcmFnU3RhdGUoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wbHVnaW4ubW92ZUNhcmQoY2FyZElkLCBjb2x1bW5JZCwgdGFyZ2V0Q29sdW1uSWQsIGJlZm9yZUNhcmRJZCk7XG5cdFx0dGhpcy5yZXNldERyYWdTdGF0ZSgpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRCZWZvcmVDYXJkSWQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY2xpZW50WTogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBjYXJkcyA9IEFycmF5LmZyb20oY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFwiLnNrLWNhcmRcIikpO1xuXHRcdGZvciAoY29uc3QgY2FyZCBvZiBjYXJkcykge1xuXHRcdFx0Y29uc3QgcmVjdCA9IGNhcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRjb25zdCBtaWRwb2ludCA9IHJlY3QudG9wICsgcmVjdC5oZWlnaHQgLyAyO1xuXHRcdFx0aWYgKGNsaWVudFkgPCBtaWRwb2ludCkge1xuXHRcdFx0XHRjb25zdCBpZCA9IGNhcmQuZGF0YXNldC5jYXJkSWQ7XG5cdFx0XHRcdHJldHVybiBpZCB8fCB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRwcml2YXRlIGdldENhcmRzRm9yQ29sdW1uKGNvbHVtbjogS2FuYmFuQ29sdW1uLCBkZWFkbGluZU9ubHk6IGJvb2xlYW4pOiBLYW5iYW5DYXJkW10ge1xuXHRcdGlmICghZGVhZGxpbmVPbmx5KSB7XG5cdFx0XHRyZXR1cm4gY29sdW1uLmNhcmRzO1xuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uLmNhcmRzXG5cdFx0XHQuZmlsdGVyKChjYXJkKSA9PiAhIWNhcmQuZGVhZGxpbmUpXG5cdFx0XHQuc2xpY2UoKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IHtcblx0XHRcdFx0Y29uc3QgYVRpbWUgPSBhLmRlYWRsaW5lID8/IDA7XG5cdFx0XHRcdGNvbnN0IGJUaW1lID0gYi5kZWFkbGluZSA/PyAwO1xuXHRcdFx0XHRyZXR1cm4gYVRpbWUgLSBiVGltZTtcblx0XHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBlbnN1cmVQbGFjZWhvbGRlcigpOiBIVE1MRWxlbWVudCB7XG5cdFx0aWYgKCF0aGlzLnBsYWNlaG9sZGVyRWwpIHtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXJFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyRWwuYWRkQ2xhc3MoXCJzay1jYXJkLXBsYWNlaG9sZGVyXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5wbGFjZWhvbGRlckVsO1xuXHR9XG5cblx0cHJpdmF0ZSBtb3ZlUGxhY2Vob2xkZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgYmVmb3JlSWQ/OiBzdHJpbmcpIHtcblx0XHRpZiAoIXRoaXMuZHJhZ1N0YXRlKSByZXR1cm47XG5cdFx0Y29uc3QgY29sdW1uSWQgPSBjb250YWluZXIuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2x1bW5cIik7XG5cdFx0aWYgKCFjb2x1bW5JZCkgcmV0dXJuO1xuXHRcdGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5lbnN1cmVQbGFjZWhvbGRlcigpO1xuXHRcdGNvbnN0IGRlc2lyZWRIZWlnaHQgPSBNYXRoLm1heCh0aGlzLmRyYWdTdGF0ZS5jYXJkSGVpZ2h0IHx8IDAsIDQ4KTtcblx0XHRwbGFjZWhvbGRlci5zdHlsZS5oZWlnaHQgPSBgJHtkZXNpcmVkSGVpZ2h0fXB4YDtcblx0XHRpZiAocGxhY2Vob2xkZXIucGFyZW50RWxlbWVudCAhPT0gY29udGFpbmVyKSB7XG5cdFx0XHR0aGlzLnJlc3RvcmVQbGFjZWhvbGRlclBhcmVudCgpO1xuXHRcdFx0Y29udGFpbmVyLmFkZENsYXNzKFwic2stY2FyZHMtcGxhY2Vob2xkZXJcIik7XG5cdFx0fVxuXHRcdGNvbnN0IHJlZmVyZW5jZSA9IGJlZm9yZUlkXG5cdFx0XHQ/IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihgLnNrLWNhcmRbZGF0YS1jYXJkLWlkPVwiJHtiZWZvcmVJZH1cIl1gKVxuXHRcdFx0OiBudWxsO1xuXHRcdGlmIChyZWZlcmVuY2UpIHtcblx0XHRcdGNvbnRhaW5lci5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIHJlZmVyZW5jZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG5cdFx0fVxuXHRcdHRoaXMuc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShjb250YWluZXIsIGZhbHNlKTtcblx0XHR0aGlzLnBsYWNlaG9sZGVyU3RhdGUgPSB7IGNvbHVtbklkLCBiZWZvcmVJZCB9O1xuXHR9XG5cblx0cHJpdmF0ZSByZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKSB7XG5cdFx0aWYgKHRoaXMucGxhY2Vob2xkZXJFbD8ucGFyZW50RWxlbWVudCkge1xuXHRcdFx0Y29uc3QgcGFyZW50ID0gdGhpcy5wbGFjZWhvbGRlckVsLnBhcmVudEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0XHRwYXJlbnQucmVtb3ZlQ2xhc3MoXCJzay1jYXJkcy1wbGFjZWhvbGRlclwiKTtcblx0XHRcdHRoaXMucGxhY2Vob2xkZXJFbC5yZW1vdmUoKTtcblx0XHRcdHRoaXMuc2V0RW1wdHlNZXNzYWdlVmlzaWJsZShwYXJlbnQsIHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVtb3ZlUGxhY2Vob2xkZXIoKSB7XG5cdFx0dGhpcy5yZXN0b3JlUGxhY2Vob2xkZXJQYXJlbnQoKTtcblx0XHR0aGlzLnBsYWNlaG9sZGVyRWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cHJpdmF0ZSBzZXRFbXB0eU1lc3NhZ2VWaXNpYmxlKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHZpc2libGU6IGJvb2xlYW4pIHtcblx0XHRjb25zdCBlbXB0eUVsID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiLnNrLWVtcHR5XCIpO1xuXHRcdGlmIChlbXB0eUVsKSB7XG5cdFx0XHRlbXB0eUVsLnN0eWxlLmRpc3BsYXkgPSB2aXNpYmxlID8gXCJcIiA6IFwibm9uZVwiO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVzZXREcmFnU3RhdGUoKSB7XG5cdFx0dGhpcy5kcmFnU3RhdGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5wbGFjZWhvbGRlclN0YXRlID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucmVtb3ZlUGxhY2Vob2xkZXIoKTtcblx0XHR0aGlzLmNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNrLWNhcmQtZHJvcFwiKS5mb3JFYWNoKChlbCkgPT4gKGVsIGFzIEhUTUxFbGVtZW50KS5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJvcFwiKSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclN0YXRDYXJkKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHRpdGxlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjYXJkID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1zdGF0LWNhcmRcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogdGl0bGUsIGNsczogXCJzay1zdGF0LWNhcmQtdGl0bGVcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogdmFsdWUsIGNsczogXCJzay1zdGF0LWNhcmQtdmFsdWVcIiB9KTtcblx0XHRjYXJkLmNyZWF0ZUVsKFwiZGl2XCIsIHsgdGV4dDogZGVzY3JpcHRpb24sIGNsczogXCJzay1zdGF0LWNhcmQtZGVzY1wiIH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEYWlseUJhckNoYXJ0KGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHNlcmllczogRGFpbHlTdGF0c1BvaW50W10pIHtcblx0XHRjb25zdCBjaGFydCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQgc2stY2hhcnQtYmFyc1wiIH0pO1xuXHRcdGNvbnN0IG1heFZhbHVlID0gTWF0aC5tYXgoXG5cdFx0XHQxLFxuXHRcdFx0Li4uc2VyaWVzLm1hcCgocG9pbnQpID0+IE1hdGgubWF4KHBvaW50LmNyZWF0ZWQsIHBvaW50LmNvbXBsZXRlZCkpLFxuXHRcdCk7XG5cblx0XHRzZXJpZXMuZm9yRWFjaCgocG9pbnQpID0+IHtcblx0XHRcdGNvbnN0IGNvbHVtbiA9IGNoYXJ0LmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1jb2xcIiB9KTtcblx0XHRcdGNvbnN0IGJhcnMgPSBjb2x1bW4uY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWNvbC1iYXJzXCIgfSk7XG5cdFx0XHRiYXJzLmNyZWF0ZURpdih7XG5cdFx0XHRcdGNsczogXCJzay1jaGFydC1iYXIgc2stY2hhcnQtYmFyLWNyZWF0ZWRcIixcblx0XHRcdFx0YXR0cjogeyBzdHlsZTogYGhlaWdodDokeyhwb2ludC5jcmVhdGVkIC8gbWF4VmFsdWUpICogMTAwfSVgIH0sXG5cdFx0XHR9KTtcblx0XHRcdGJhcnMuY3JlYXRlRGl2KHtcblx0XHRcdFx0Y2xzOiBcInNrLWNoYXJ0LWJhciBzay1jaGFydC1iYXItY29tcGxldGVkXCIsXG5cdFx0XHRcdGF0dHI6IHsgc3R5bGU6IGBoZWlnaHQ6JHsocG9pbnQuY29tcGxldGVkIC8gbWF4VmFsdWUpICogMTAwfSVgIH0sXG5cdFx0XHR9KTtcblx0XHRcdGNvbHVtbi5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtbGFiZWxcIiwgdGV4dDogcG9pbnQuZGF0ZS5zbGljZSg1KSB9KTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGxlZ2VuZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY2hhcnQtbGVnZW5kXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTY1QjBcdTVFRkFcIiwgXCJ2YXIoLS1jb2xvci1jeWFuLCAjNGVjZGM0KVwiKTtcblx0XHR0aGlzLnJlbmRlckxlZ2VuZEl0ZW0obGVnZW5kLCBcIlx1NUI4Q1x1NjIxMFwiLCBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIik7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckxlZ2VuZEl0ZW0oY29udGFpbmVyOiBIVE1MRWxlbWVudCwgbGFiZWw6IHN0cmluZywgY29sb3I6IHN0cmluZykge1xuXHRcdGNvbnN0IGl0ZW0gPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWxlZ2VuZC1pdGVtXCIgfSk7XG5cdFx0Y29uc3QgZG90ID0gaXRlbS5jcmVhdGVEaXYoeyBjbHM6IFwic2stbGVnZW5kLWRvdFwiIH0pO1xuXHRcdChkb3QgYXMgSFRNTERpdkVsZW1lbnQpLnN0eWxlLmJhY2tncm91bmQgPSBjb2xvcjtcblx0XHRpdGVtLmNyZWF0ZVNwYW4oeyB0ZXh0OiBsYWJlbCB9KTtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRGFpbHlSYXRlQ2hhcnQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2VyaWVzOiBEYWlseVJhdGVQb2ludFtdKSB7XG5cdFx0Y29uc3QgY2hhcnRXcmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydCBzay1jaGFydC1saW5lXCIgfSk7XG5cdFx0Y29uc3Qgd2lkdGggPSBNYXRoLm1heChzZXJpZXMubGVuZ3RoIC0gMSwgMSkgKiA0MDtcblx0XHRjb25zdCBoZWlnaHQgPSAxNjA7XG5cdFx0Y29uc3Qgc3ZnID0gY2hhcnRXcmFwcGVyLmNyZWF0ZUVsKFwic3ZnXCIsIHtcblx0XHRcdGF0dHI6IHsgdmlld0JveDogYDAgMCAke3dpZHRofSAke2hlaWdodH1gLCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcIm5vbmVcIiB9LFxuXHRcdH0pO1xuXHRcdGNvbnN0IHBvaW50cyA9IHNlcmllc1xuXHRcdFx0Lm1hcCgocG9pbnQsIGluZGV4KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHggPSAoaW5kZXggLyBNYXRoLm1heChzZXJpZXMubGVuZ3RoIC0gMSwgMSkpICogd2lkdGg7XG5cdFx0XHRcdGNvbnN0IHkgPSBoZWlnaHQgLSAoTWF0aC5taW4ocG9pbnQucmF0ZSwgMTAwKSAvIDEwMCkgKiBoZWlnaHQ7XG5cdFx0XHRcdHJldHVybiBgJHt4fSwke3l9YDtcblx0XHRcdH0pXG5cdFx0XHQuam9pbihcIiBcIik7XG5cdFx0c3ZnLmNyZWF0ZUVsKFwicG9seWxpbmVcIiwge1xuXHRcdFx0YXR0cjoge1xuXHRcdFx0XHRwb2ludHMsXG5cdFx0XHRcdGZpbGw6IFwibm9uZVwiLFxuXHRcdFx0XHRzdHJva2U6IFwidmFyKC0taW50ZXJhY3RpdmUtYWNjZW50KVwiLFxuXHRcdFx0XHRcInN0cm9rZS13aWR0aFwiOiBcIjNcIixcblx0XHRcdH0sXG5cdFx0fSk7XG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50LCBpbmRleCkgPT4ge1xuXHRcdFx0Y29uc3QgZG90WCA9IChpbmRleCAvIE1hdGgubWF4KHNlcmllcy5sZW5ndGggLSAxLCAxKSkgKiB3aWR0aDtcblx0XHRcdGNvbnN0IGRvdFkgPSBoZWlnaHQgLSAoTWF0aC5taW4ocG9pbnQucmF0ZSwgMTAwKSAvIDEwMCkgKiBoZWlnaHQ7XG5cdFx0XHRzdmcuY3JlYXRlRWwoXCJjaXJjbGVcIiwge1xuXHRcdFx0XHRhdHRyOiB7XG5cdFx0XHRcdFx0Y3g6IGRvdFgsXG5cdFx0XHRcdFx0Y3k6IGRvdFksXG5cdFx0XHRcdFx0cjogMyxcblx0XHRcdFx0XHRmaWxsOiBcInZhcigtLWludGVyYWN0aXZlLWFjY2VudClcIixcblx0XHRcdFx0fSxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgbGFiZWxzID0gY2hhcnRXcmFwcGVyLmNyZWF0ZURpdih7IGNsczogXCJzay1jaGFydC1sYWJlbC1yb3dcIiB9KSBhcyBIVE1MRGl2RWxlbWVudDtcblx0XHRsYWJlbHMuc3R5bGUuZ3JpZFRlbXBsYXRlQ29sdW1ucyA9IGByZXBlYXQoJHtNYXRoLm1heChzZXJpZXMubGVuZ3RoLCAxKX0sIG1pbm1heCgwLCAxZnIpKWA7XG5cdFx0c2VyaWVzLmZvckVhY2goKHBvaW50KSA9PiB7XG5cdFx0XHRsYWJlbHMuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNoYXJ0LWxhYmVsXCIsIHRleHQ6IHBvaW50LmRhdGUuc2xpY2UoNSkgfSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRlYWRsaW5lQnJlYWtkb3duKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHN0YXRzOiBTdGF0c1NuYXBzaG90KSB7XG5cdFx0aWYgKCFzdGF0cy5kZWFkbGluZUNvdW50KSB7XG5cdFx0XHRjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWVtcHR5XCIsIHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU4QkJFXHU3RjZFXHU2MjJBXHU2QjYyXHU2NUY2XHU5NUY0XHU3Njg0XHU0RUZCXHU1MkExXCIgfSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGluZm8gPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWRlYWRsaW5lLWluZm9cIiB9KTtcblx0XHRpbmZvLmNyZWF0ZURpdih7IHRleHQ6IGBcdTY3MDlcdTYyMkFcdTZCNjJcdTRFRkJcdTUyQTFcdUZGMUEke3N0YXRzLmRlYWRsaW5lQ291bnR9YCwgY2xzOiBcInNrLWRlYWRsaW5lLWxpbmVcIiB9KTtcblx0XHRpbmZvLmNyZWF0ZURpdih7XG5cdFx0XHR0ZXh0OiBgXHU2MjJBXHU2QjYyXHU4OTg2XHU3NkQ2XHU3Mzg3XHVGRjFBJHtmb3JtYXRQZXJjZW50KHN0YXRzLmRlYWRsaW5lQ292ZXJhZ2UpfWAsXG5cdFx0XHRjbHM6IFwic2stZGVhZGxpbmUtbGluZVwiLFxuXHRcdH0pO1xuXG5cdFx0Y29uc3QgcHJvZ3Jlc3MgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLXByb2dyZXNzXCIgfSk7XG5cdFx0cHJvZ3Jlc3MuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogXCJzay1wcm9ncmVzcy1vbi10aW1lXCIsXG5cdFx0XHRhdHRyOiB7IHN0eWxlOiBgd2lkdGg6JHtmb3JtYXRQZXJjZW50VmFsdWUoc3RhdHMub25UaW1lUmF0ZSl9JWAgfSxcblx0XHR9KTtcblx0XHRwcm9ncmVzcy5jcmVhdGVEaXYoe1xuXHRcdFx0Y2xzOiBcInNrLXByb2dyZXNzLW92ZXJkdWVcIixcblx0XHRcdGF0dHI6IHsgc3R5bGU6IGB3aWR0aDoke2Zvcm1hdFBlcmNlbnRWYWx1ZShzdGF0cy5vdmVyZHVlUmF0ZSl9JWAgfSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IGxlZ2VuZCA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stcHJvZ3Jlc3MtbGVnZW5kXCIgfSk7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTYzMDlcdTY1RjZcdTVCOENcdTYyMTBcIiwgXCJ2YXIoLS1jb2xvci1ncmVlbiwgIzRjYWY1MClcIik7XG5cdFx0dGhpcy5yZW5kZXJMZWdlbmRJdGVtKGxlZ2VuZCwgXCJcdTVERjIvXHU1QzA2XHU5MDNFXHU2NzFGXCIsIFwidmFyKC0tY29sb3ItcmVkLCAjZmY2YjZiKVwiKTtcblx0fVxuXG5cdHByaXZhdGUgYnVpbGRTdGF0c1NuYXBzaG90KCk6IFN0YXRzU25hcHNob3Qge1xuXHRcdGNvbnN0IGJvYXJkID0gdGhpcy5wbHVnaW4uZ2V0Qm9hcmQoKTtcblx0XHRjb25zdCBjYXJkcyA9IGJvYXJkLmNvbHVtbnMuZmxhdE1hcCgoY29sKSA9PiBjb2wuY2FyZHMpO1xuXHRcdGNvbnN0IHRvdGFsVGFza3MgPSBjYXJkcy5sZW5ndGg7XG5cdFx0Y29uc3QgY29tcGxldGVkQ2FyZHMgPSBjYXJkcy5maWx0ZXIoKGNhcmQpID0+IGNhcmQuY29tcGxldGVkKTtcblx0XHRjb25zdCBjb21wbGV0ZWRUYXNrcyA9IGNvbXBsZXRlZENhcmRzLmxlbmd0aDtcblx0XHRjb25zdCB3aXBDb3VudCA9IHRvdGFsVGFza3MgLSBjb21wbGV0ZWRUYXNrcztcblx0XHRjb25zdCBjb21wbGV0aW9uUmF0ZSA9IHRvdGFsVGFza3MgPyBjb21wbGV0ZWRUYXNrcyAvIHRvdGFsVGFza3MgOiAwO1xuXHRcdGNvbnN0IGRlYWRsaW5lQ2FyZHMgPSBjYXJkcy5maWx0ZXIoKGNhcmQpID0+ICEhY2FyZC5kZWFkbGluZSk7XG5cdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRjb25zdCBvdmVyZHVlQ291bnQgPSBkZWFkbGluZUNhcmRzLmZpbHRlcigoY2FyZCkgPT4ge1xuXHRcdFx0aWYgKCFjYXJkLmRlYWRsaW5lKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRpZiAoY2FyZC5jb21wbGV0ZWQpIHtcblx0XHRcdFx0Y29uc3QgZG9uZUF0ID0gY2FyZC5jb21wbGV0ZWRBdCA/PyBjYXJkLnVwZGF0ZWRBdDtcblx0XHRcdFx0cmV0dXJuICEhZG9uZUF0ICYmIGRvbmVBdCA+IGNhcmQuZGVhZGxpbmU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbm93ID4gY2FyZC5kZWFkbGluZTtcblx0XHR9KS5sZW5ndGg7XG5cdFx0Y29uc3Qgb25UaW1lQ291bnQgPSBkZWFkbGluZUNhcmRzLmZpbHRlcigoY2FyZCkgPT4ge1xuXHRcdFx0aWYgKCFjYXJkLmRlYWRsaW5lIHx8ICFjYXJkLmNvbXBsZXRlZCkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0Y29uc3QgZG9uZUF0ID0gY2FyZC5jb21wbGV0ZWRBdCA/PyBjYXJkLnVwZGF0ZWRBdDtcblx0XHRcdHJldHVybiAhIWRvbmVBdCAmJiBkb25lQXQgPD0gY2FyZC5kZWFkbGluZTtcblx0XHR9KS5sZW5ndGg7XG5cdFx0Y29uc3QgYXZnQ3ljbGVUaW1lTXMgPSAoKCkgPT4ge1xuXHRcdFx0Y29uc3QgZmluaXNoZWQgPSBjb21wbGV0ZWRDYXJkcy5maWx0ZXIoKGNhcmQpID0+IGNhcmQuY29tcGxldGVkQXQpO1xuXHRcdFx0aWYgKCFmaW5pc2hlZC5sZW5ndGgpIHJldHVybiBudWxsO1xuXHRcdFx0Y29uc3QgdG90YWwgPSBmaW5pc2hlZC5yZWR1Y2UoXG5cdFx0XHRcdChzdW0sIGNhcmQpID0+IHN1bSArIE1hdGgubWF4KDAsIChjYXJkLmNvbXBsZXRlZEF0ISAtIGNhcmQuY3JlYXRlZEF0KSksXG5cdFx0XHRcdDAsXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIHRvdGFsIC8gZmluaXNoZWQubGVuZ3RoO1xuXHRcdH0pKCk7XG5cblx0XHRjb25zdCBkYWlseUNyZWF0ZWQgPSB0aGlzLmJ1aWxkRGFpbHlTZXJpZXMoY2FyZHMsIFwiY3JlYXRlZFwiKTtcblx0XHRjb25zdCBkYWlseUNvbXBsZXRlZCA9IHRoaXMuYnVpbGREYWlseVNlcmllcyhjYXJkcywgXCJjb21wbGV0ZWRcIik7XG5cdFx0Y29uc3QgZGFpbHlTZXJpZXM6IERhaWx5U3RhdHNQb2ludFtdID0gZGFpbHlDcmVhdGVkLm1hcCgocG9pbnQsIGluZGV4KSA9PiAoe1xuXHRcdFx0ZGF0ZTogcG9pbnQuZGF0ZSxcblx0XHRcdGNyZWF0ZWQ6IHBvaW50LnZhbHVlLFxuXHRcdFx0Y29tcGxldGVkOiBkYWlseUNvbXBsZXRlZFtpbmRleF0/LnZhbHVlID8/IDAsXG5cdFx0fSkpO1xuXHRcdGNvbnN0IGRhaWx5UmF0ZXM6IERhaWx5UmF0ZVBvaW50W10gPSBkYWlseVNlcmllcy5tYXAoKHBvaW50KSA9PiAoe1xuXHRcdFx0ZGF0ZTogcG9pbnQuZGF0ZSxcblx0XHRcdHJhdGU6IHBvaW50LmNyZWF0ZWQgPyBNYXRoLm1pbigxMDAsIChwb2ludC5jb21wbGV0ZWQgLyBwb2ludC5jcmVhdGVkKSAqIDEwMCkgOiAwLFxuXHRcdH0pKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3RhbFRhc2tzLFxuXHRcdFx0Y29tcGxldGVkVGFza3MsXG5cdFx0XHR3aXBDb3VudCxcblx0XHRcdGNvbXBsZXRpb25SYXRlLFxuXHRcdFx0ZGVhZGxpbmVDb3VudDogZGVhZGxpbmVDYXJkcy5sZW5ndGgsXG5cdFx0XHRkZWFkbGluZUNvdmVyYWdlOiB0b3RhbFRhc2tzID8gZGVhZGxpbmVDYXJkcy5sZW5ndGggLyB0b3RhbFRhc2tzIDogMCxcblx0XHRcdG92ZXJkdWVDb3VudCxcblx0XHRcdG92ZXJkdWVSYXRlOiBkZWFkbGluZUNhcmRzLmxlbmd0aCA/IG92ZXJkdWVDb3VudCAvIGRlYWRsaW5lQ2FyZHMubGVuZ3RoIDogMCxcblx0XHRcdG9uVGltZVJhdGU6IGRlYWRsaW5lQ2FyZHMubGVuZ3RoID8gb25UaW1lQ291bnQgLyBkZWFkbGluZUNhcmRzLmxlbmd0aCA6IDAsXG5cdFx0XHRhdmdDeWNsZVRpbWVNcyxcblx0XHRcdGRhaWx5U2VyaWVzLFxuXHRcdFx0ZGFpbHlSYXRlcyxcblx0XHR9O1xuXHR9XG5cblx0cHJpdmF0ZSBidWlsZERhaWx5U2VyaWVzKGNhcmRzOiBLYW5iYW5DYXJkW10sIGtpbmQ6IFwiY3JlYXRlZFwiIHwgXCJjb21wbGV0ZWRcIiwgZGF5cyA9IDE0KSB7XG5cdFx0Y29uc3QgbXNQZXJEYXkgPSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXHRcdGNvbnN0IHRvZGF5ID0gdGhpcy5zdGFydE9mRGF5KERhdGUubm93KCkpO1xuXHRcdGNvbnN0IHN0YXJ0ID0gdG9kYXkgLSAoZGF5cyAtIDEpICogbXNQZXJEYXk7XG5cdFx0Y29uc3QgYnVja2V0cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cblx0XHRmb3IgKGNvbnN0IGNhcmQgb2YgY2FyZHMpIHtcblx0XHRcdGNvbnN0IHRpbWVzdGFtcCA9XG5cdFx0XHRcdGtpbmQgPT09IFwiY3JlYXRlZFwiXG5cdFx0XHRcdFx0PyBjYXJkLmNyZWF0ZWRBdFxuXHRcdFx0XHRcdDogY2FyZC5jb21wbGV0ZWRBdCA/PyAoY2FyZC5jb21wbGV0ZWQgPyBjYXJkLnVwZGF0ZWRBdCA6IG51bGwpO1xuXHRcdFx0aWYgKCF0aW1lc3RhbXApIGNvbnRpbnVlO1xuXHRcdFx0Y29uc3Qga2V5ID0gdGhpcy50b0RheUtleSh0aW1lc3RhbXApO1xuXHRcdFx0YnVja2V0cy5zZXQoa2V5LCAoYnVja2V0cy5nZXQoa2V5KSA/PyAwKSArIDEpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNlcmllczogRGFpbHlDb3VudFBvaW50W10gPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGRheXM7IGkrKykge1xuXHRcdFx0Y29uc3QgZGF5VHMgPSBzdGFydCArIGkgKiBtc1BlckRheTtcblx0XHRcdGNvbnN0IGtleSA9IHRoaXMudG9EYXlLZXkoZGF5VHMpO1xuXHRcdFx0c2VyaWVzLnB1c2goeyBkYXRlOiBrZXksIHZhbHVlOiBidWNrZXRzLmdldChrZXkpID8/IDAgfSk7XG5cdFx0fVxuXHRcdHJldHVybiBzZXJpZXM7XG5cdH1cblxuXHRwcml2YXRlIHRvRGF5S2V5KHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0XHRjb25zdCB5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXHRcdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRcdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0XHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9YDtcblx0fVxuXG5cdHByaXZhdGUgc3RhcnRPZkRheSh0aW1lc3RhbXA6IG51bWJlcik6IG51bWJlciB7XG5cdFx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdFx0ZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcblx0XHRyZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG5cdH1cbn1cblxuY2xhc3MgQ2FyZE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwcml2YXRlIHRpdGxlVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIHRhZ3NWYWx1ZSA9IFwiXCI7XG5cdHByaXZhdGUgcmVtYXJrVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIGhpc3RvcnlOb3RlID0gXCJcIjtcblx0cHJpdmF0ZSBkZWFkbGluZVZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSBzdWJtaXR0aW5nID0gZmFsc2U7XG5cdHByaXZhdGUga2V5SGFuZGxlciA9IChldnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRpZiAoXG5cdFx0XHRldnQua2V5ID09PSBcIkVudGVyXCIgJiZcblx0XHRcdCFldnQuc2hpZnRLZXkgJiZcblx0XHRcdCFldnQubWV0YUtleSAmJlxuXHRcdFx0IWV2dC5jdHJsS2V5ICYmXG5cdFx0XHQhZXZ0LmFsdEtleSAmJlxuXHRcdFx0IWV2dC5pc0NvbXBvc2luZ1xuXHRcdCkge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR2b2lkIHRoaXMuaGFuZGxlU3VibWl0KCk7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGFwcDogQXBwLFxuXHRcdHByaXZhdGUgcGx1Z2luOiBTaW1wbGVLYW5iYW5QbHVnaW4sXG5cdFx0cHJpdmF0ZSBjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHByaXZhdGUgY2FyZD86IEthbmJhbkNhcmQsXG5cdCkge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy5wbHVnaW4uc2V0QWN0aXZlQ29sdW1uKGNvbHVtbklkKTtcblx0XHRpZiAoY2FyZCkge1xuXHRcdFx0dGhpcy50aXRsZVZhbHVlID0gY2FyZC50aXRsZTtcblx0XHRcdHRoaXMudGFnc1ZhbHVlID0gY2FyZC50YWdzLmpvaW4oXCIsIFwiKTtcblx0XHRcdHRoaXMucmVtYXJrVmFsdWUgPSBjYXJkLnJlbWFyaztcblx0XHRcdHRoaXMuZGVhZGxpbmVWYWx1ZSA9IGZvcm1hdERhdGVUaW1lSW5wdXQoY2FyZC5kZWFkbGluZSk7XG5cdFx0fVxuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmtleUhhbmRsZXIpO1xuXG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLmNhcmQgPyBcIlx1N0YxNlx1OEY5MVx1NTM2MVx1NzI0N1wiIDogXCJcdTY1QjBcdTU4OUVcdTUzNjFcdTcyNDdcIiB9KTtcblxuXHRcdHRoaXMudGl0bGVWYWx1ZSA9IHRoaXMudGl0bGVWYWx1ZSB8fCBcIlwiO1xuXHRcdGNyZWF0ZVRleHRGaWVsZChjb250ZW50RWwsIFwiXHU2ODA3XHU5ODk4XCIsIHRoaXMudGl0bGVWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLnRpdGxlVmFsdWUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdGNyZWF0ZVRleHRGaWVsZChjb250ZW50RWwsIFwiXHU2ODA3XHU3QjdFXHVGRjA4XHU5MDE3XHU1M0Y3XHU1MjA2XHU5Njk0XHVGRjA5XCIsIHRoaXMudGFnc1ZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMudGFnc1ZhbHVlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRcdGNyZWF0ZVRleHRBcmVhKGNvbnRlbnRFbCwgXCJcdTU5MDdcdTZDRThcIiwgdGhpcy5yZW1hcmtWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdHRoaXMucmVtYXJrVmFsdWUgPSB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRjcmVhdGVEYXRlVGltZUZpZWxkKGNvbnRlbnRFbCwgXCJcdTYyMkFcdTZCNjJcdTY1RjZcdTk1RjRcIiwgdGhpcy5kZWFkbGluZVZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdFx0dGhpcy5kZWFkbGluZVZhbHVlID0gdmFsdWU7XG5cdFx0XHR9KTtcblxuXHRcdGNyZWF0ZVRleHRBcmVhKGNvbnRlbnRFbCwgXCJcdTRGRUVcdTY1MzlcdThCRjRcdTY2MEVcdUZGMDhcdTUxOTlcdTUxNjVcdTUzODZcdTUzRjJcdUZGMDlcIiwgXCJcIiwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLmhpc3RvcnlOb3RlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU1M0Q2XHU2RDg4XCIsIGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIgfSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3Qgc3VibWl0QnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcblx0XHRcdHRleHQ6IHRoaXMuY2FyZCA/IFwiXHU0RkREXHU1QjU4XCIgOiBcIlx1NTIxQlx1NUVGQVwiLFxuXHRcdFx0Y2xzOiBcInNrLWJ0blwiLFxuXHRcdH0pO1xuXHRcdHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdm9pZCB0aGlzLmhhbmRsZVN1Ym1pdCgpKTtcblx0fVxuXG5cdG9uQ2xvc2UoKSB7XG5cdFx0dGhpcy5jb250ZW50RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5rZXlIYW5kbGVyKTtcblx0XHRzdXBlci5vbkNsb3NlKCk7XG5cdH1cblxuXHRhc3luYyBoYW5kbGVTdWJtaXQoKSB7XG5cdFx0aWYgKHRoaXMuc3VibWl0dGluZykgcmV0dXJuO1xuXHRcdGlmICghdGhpcy50aXRsZVZhbHVlLnRyaW0oKSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjgwN1x1OTg5OFx1NEUwRFx1ODBGRFx1NEUzQVx1N0E3QVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5zdWJtaXR0aW5nID0gdHJ1ZTtcblx0XHRjb25zdCB0YWdzID0gcGFyc2VUYWdzKHRoaXMudGFnc1ZhbHVlKTtcblx0XHRjb25zdCByZW1hcmsgPSB0aGlzLnJlbWFya1ZhbHVlLnRyaW0oKTtcblx0XHRjb25zdCBkZWFkbGluZSA9IHBhcnNlRGF0ZVRpbWVJbnB1dCh0aGlzLmRlYWRsaW5lVmFsdWUpO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5jYXJkKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnVwZGF0ZUNhcmQoXG5cdFx0XHRcdFx0dGhpcy5jb2x1bW5JZCxcblx0XHRcdFx0XHR0aGlzLmNhcmQuaWQsXG5cdFx0XHRcdFx0eyB0aXRsZTogdGhpcy50aXRsZVZhbHVlLCB0YWdzLCByZW1hcmssIGRlYWRsaW5lIH0sXG5cdFx0XHRcdFx0dGhpcy5oaXN0b3J5Tm90ZS50cmltKCkgfHwgXCJcdTUxODVcdTVCQjlcdTY2RjRcdTY1QjBcIixcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLmFkZENhcmQodGhpcy5jb2x1bW5JZCwge1xuXHRcdFx0XHRcdHRpdGxlOiB0aGlzLnRpdGxlVmFsdWUsXG5cdFx0XHRcdFx0dGFncyxcblx0XHRcdFx0XHRyZW1hcmssXG5cdFx0XHRcdFx0aGlzdG9yeU5vdGU6IHRoaXMuaGlzdG9yeU5vdGUudHJpbSgpIHx8IFwiXHU1MjFCXHU1RUZBXCIsXG5cdFx0XHRcdFx0ZGVhZGxpbmUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLnN1Ym1pdHRpbmcgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn1cblxuaW50ZXJmYWNlIENvbHVtbk1vZGFsT3B0aW9ucyB7XG5cdHRpdGxlOiBzdHJpbmc7XG5cdGluaXRpYWxWYWx1ZT86IHN0cmluZztcblx0Y29uZmlybVRleHQ/OiBzdHJpbmc7XG5cdG9uU3VibWl0OiAodmFsdWU6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbn1cblxuY2xhc3MgQ29sdW1uTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHByaXZhdGUgdmFsdWU6IHN0cmluZztcblxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvcHRpb25zOiBDb2x1bW5Nb2RhbE9wdGlvbnMpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMudmFsdWUgPSBvcHRpb25zLmluaXRpYWxWYWx1ZSA/PyBcIlwiO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy5vcHRpb25zLnRpdGxlIH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MEZcdTc2RUVcdTU0MERcdTc5RjBcIiwgdGhpcy52YWx1ZSwgKHZhbHVlKSA9PiAodGhpcy52YWx1ZSA9IHZhbHVlKSk7XG5cblx0XHRjb25zdCBmb290ZXIgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLW1vZGFsLWZvb3RlclwiIH0pO1xuXHRcdGNvbnN0IGNhbmNlbEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IFwiXHU1M0Q2XHU2RDg4XCIsIGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIgfSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3QgY29uZmlybUJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY29uZmlybVRleHQgfHwgXCJcdTc4NkVcdThCQTRcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRhd2FpdCB0aGlzLm9wdGlvbnMub25TdWJtaXQodGhpcy52YWx1ZSk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH1cbn1cblxuaW50ZXJmYWNlIENvbmZpcm1Nb2RhbE9wdGlvbnMge1xuXHR0aXRsZTogc3RyaW5nO1xuXHRtZXNzYWdlOiBzdHJpbmc7XG5cdGNvbmZpcm1UZXh0Pzogc3RyaW5nO1xuXHRjYW5jZWxUZXh0Pzogc3RyaW5nO1xuXHRvbkNvbmZpcm06ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xufVxuXG5jbGFzcyBDb25maXJtTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9wdGlvbnM6IENvbmZpcm1Nb2RhbE9wdGlvbnMpIHtcblx0XHRzdXBlcihhcHApO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHRcdGNvbnRlbnRFbC5hZGRDbGFzcyhcInNrLW1vZGFsXCIpO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogdGhpcy5vcHRpb25zLnRpdGxlIH0pO1xuXHRcdGNvbnRlbnRFbC5jcmVhdGVEaXYoeyB0ZXh0OiB0aGlzLm9wdGlvbnMubWVzc2FnZSwgY2xzOiBcInNrLWNvbmZpcm0tdGV4dFwiIH0pO1xuXG5cdFx0Y29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1tb2RhbC1mb290ZXJcIiB9KTtcblx0XHRjb25zdCBjYW5jZWxCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogdGhpcy5vcHRpb25zLmNhbmNlbFRleHQgfHwgXCJcdTUzRDZcdTZEODhcIixcblx0XHRcdGNsczogXCJzay1idG4gc2stYnRuLWdob3N0XCIsXG5cdFx0fSk7XG5cdFx0Y2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuXG5cdFx0Y29uc3QgY29uZmlybUJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLm9wdGlvbnMuY29uZmlybVRleHQgfHwgXCJcdTc4NkVcdThCQTRcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRjb25maXJtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRhd2FpdCB0aGlzLm9wdGlvbnMub25Db25maXJtKCk7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUYWdzKGlucHV0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdHJldHVybiBpbnB1dFxuXHRcdC5zcGxpdChcIixcIilcblx0XHQubWFwKCh0YWcpID0+IHRhZy50cmltKCkpXG5cdFx0LmZpbHRlcigodGFnKSA9PiAhIXRhZyk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF0ZVRpbWVJbnB1dCh2YWx1ZTogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG5cdGlmICghdmFsdWUudHJpbSgpKSByZXR1cm4gbnVsbDtcblx0Y29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZSh2YWx1ZSk7XG5cdHJldHVybiBOdW1iZXIuaXNOYU4ocGFyc2VkKSA/IG51bGwgOiBwYXJzZWQ7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGVUaW1lSW5wdXQodmFsdWU/OiBudW1iZXIgfCBudWxsKTogc3RyaW5nIHtcblx0aWYgKCF2YWx1ZSkgcmV0dXJuIFwiXCI7XG5cdGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG5cdGNvbnN0IHl5eXkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG1tID0gU3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgZGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgaGggPSBTdHJpbmcoZGF0ZS5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IG1pbiA9IFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eXl5eX0tJHttbX0tJHtkZH1UJHtoaH06JHttaW59YDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSWQoKSB7XG5cdHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKSArIERhdGUubm93KCkudG9TdHJpbmcoMzYpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXRlKHRpbWVzdGFtcDogbnVtYmVyKTogc3RyaW5nIHtcblx0Y29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdGNvbnN0IHkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cdGNvbnN0IG0gPSBTdHJpbmcoZGF0ZS5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBkID0gU3RyaW5nKGRhdGUuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGhoID0gU3RyaW5nKGRhdGUuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRjb25zdCBtbSA9IFN0cmluZyhkYXRlLmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuXHRyZXR1cm4gYCR7eX0tJHttfS0ke2R9ICR7aGh9OiR7bW19YDtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UGVyY2VudCh2YWx1ZTogbnVtYmVyLCBkaWdpdHMgPSAwKTogc3RyaW5nIHtcblx0aWYgKCFOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZXR1cm4gXCIwJVwiO1xuXHRyZXR1cm4gYCR7KE1hdGgubWF4KDAsIHZhbHVlKSAqIDEwMCkudG9GaXhlZChkaWdpdHMpfSVgO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQZXJjZW50VmFsdWUodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG5cdGlmICghTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmV0dXJuIDA7XG5cdHJldHVybiBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHZhbHVlICogMTAwKSk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdER1cmF0aW9uKG1zOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihtcyAvIDYwMDAwKTtcblx0Y29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XG5cdGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKGhvdXJzIC8gMjQpO1xuXHRpZiAoZGF5cyA+IDApIHtcblx0XHRjb25zdCByZW1Ib3VycyA9IGhvdXJzICUgMjQ7XG5cdFx0cmV0dXJuIHJlbUhvdXJzID8gYCR7ZGF5c31cdTU5Mjkke3JlbUhvdXJzfVx1NUMwRlx1NjVGNmAgOiBgJHtkYXlzfVx1NTkyOWA7XG5cdH1cblx0aWYgKGhvdXJzID4gMCkge1xuXHRcdGNvbnN0IHJlbU1pbnV0ZXMgPSBtaW51dGVzICUgNjA7XG5cdFx0cmV0dXJuIHJlbU1pbnV0ZXMgPyBgJHtob3Vyc31cdTVDMEZcdTY1RjYke3JlbU1pbnV0ZXN9XHU1MjA2YCA6IGAke2hvdXJzfVx1NUMwRlx1NjVGNmA7XG5cdH1cblx0cmV0dXJuIGAke01hdGgubWF4KG1pbnV0ZXMsIDEpfVx1NTIwNmA7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRGaWVsZChcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0bGFiZWw6IHN0cmluZyxcblx0dmFsdWU6IHN0cmluZyxcblx0b25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG5cdGNvbnN0IHdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWZpZWxkXCIgfSk7XG5cdHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IHRleHQ6IGxhYmVsIH0pO1xuXHRjb25zdCBpbnB1dCA9IHdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiIH0pO1xuXHRpbnB1dC52YWx1ZSA9IHZhbHVlO1xuXHRpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2dCkgPT4gb25DaGFuZ2UoKGV2dC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGF0ZVRpbWVGaWVsZChcblx0Y29udGFpbmVyOiBIVE1MRWxlbWVudCxcblx0bGFiZWw6IHN0cmluZyxcblx0dmFsdWU6IHN0cmluZyxcblx0b25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkLFxuKSB7XG5cdGNvbnN0IHdyYXBwZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWZpZWxkXCIgfSk7XG5cdHdyYXBwZXIuY3JlYXRlRWwoXCJsYWJlbFwiLCB7IHRleHQ6IGxhYmVsIH0pO1xuXHRjb25zdCBpbnB1dCA9IHdyYXBwZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwiZGF0ZXRpbWUtbG9jYWxcIiB9KTtcblx0aW5wdXQudmFsdWUgPSB2YWx1ZTtcblx0aW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRBcmVhKFxuXHRjb250YWluZXI6IEhUTUxFbGVtZW50LFxuXHRsYWJlbDogc3RyaW5nLFxuXHR2YWx1ZTogc3RyaW5nLFxuXHRvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQsXG4pIHtcblx0Y29uc3Qgd3JhcHBlciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZmllbGRcIiB9KTtcblx0d3JhcHBlci5jcmVhdGVFbChcImxhYmVsXCIsIHsgdGV4dDogbGFiZWwgfSk7XG5cdGNvbnN0IHRleHRhcmVhID0gd3JhcHBlci5jcmVhdGVFbChcInRleHRhcmVhXCIpO1xuXHR0ZXh0YXJlYS52YWx1ZSA9IHZhbHVlO1xuXHR0ZXh0YXJlYS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2dCkgPT4gb25DaGFuZ2UoKGV2dC50YXJnZXQgYXMgSFRNTFRleHRBcmVhRWxlbWVudCkudmFsdWUpKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQU9PO0FBRVAsSUFBTSxZQUFZO0FBQ2xCLElBQU0sVUFBVTtBQTZEaEIsSUFBTSxrQkFBa0IsQ0FBQyxzQkFBTyxzQkFBTyxvQkFBSztBQUc1QyxTQUFTLHFCQUFzQztBQUM5QyxTQUFPO0FBQUEsSUFDTixTQUFTLGdCQUFnQixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQ3ZDLElBQUksU0FBUztBQUFBLE1BQ2I7QUFBQSxNQUNBLE9BQU8sQ0FBQztBQUFBLElBQ1QsRUFBRTtBQUFBLEVBQ0g7QUFDRDtBQUVBLElBQXFCLHFCQUFyQixjQUFnRCx1QkFBTztBQUFBLEVBQXZEO0FBQUE7QUFDQyxTQUFRLFFBQXlCLG1CQUFtQjtBQUNwRCxTQUFRLFFBQVEsb0JBQUksSUFBZ0I7QUFBQTtBQUFBLEVBR3BDLE1BQU0sU0FBUztBQUNkLFVBQU0sS0FBSyxVQUFV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
