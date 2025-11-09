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
    this.board.columns.push({ id: createId(), name: name.trim(), cards: [] });
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
      completed: false,
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
};
var KanbanView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
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
    const board = this.plugin.getBoard();
    const container = this.contentEl;
    container.empty();
    container.addClass("sk-kanban");
    const header = container.createDiv({ cls: "sk-header" });
    header.createEl("h2", { text: "\u4FA7\u8FB9\u770B\u677F" });
    const addColumnBtn = header.createEl("button", {
      text: "\u65B0\u589E\u680F\u76EE",
      cls: "sk-btn"
    });
    addColumnBtn.addEventListener("click", () => {
      new ColumnModal(this.app, "\u65B0\u589E\u680F\u76EE", async (value) => {
        await this.plugin.addColumn(value);
      }).open();
    });
    const columnsWrapper = container.createDiv({ cls: "sk-columns" });
    if (!board.columns.length) {
      columnsWrapper.createDiv({ text: "\u6682\u65E0\u680F\u76EE\uFF0C\u70B9\u51FB\u201C\u65B0\u589E\u680F\u76EE\u201D\u3002", cls: "sk-empty" });
      return;
    }
    for (const column of board.columns) {
      this.renderColumn(columnsWrapper, column);
    }
  }
  renderColumn(wrapper, column) {
    const columnEl = wrapper.createDiv({ cls: "sk-column" });
    const columnHeader = columnEl.createDiv({ cls: "sk-column-header" });
    columnHeader.createEl("h3", { text: column.name });
    const addBtn = columnHeader.createEl("button", { text: "\u6DFB\u52A0\u5361\u7247", cls: "sk-btn sk-btn-small" });
    addBtn.addEventListener("click", () => {
      new CardModal(this.app, this.plugin, column.id).open();
    });
    const cardsContainer = columnEl.createDiv({
      cls: "sk-cards",
      attr: { "data-column": column.id }
    });
    cardsContainer.addEventListener("dragover", (evt) => evt.preventDefault());
    cardsContainer.addEventListener("drop", (evt) => {
      evt.preventDefault();
      this.handleDrop(column.id);
    });
    if (!column.cards.length) {
      const empty = cardsContainer.createDiv({ text: "\u{1F4DD} \u6682\u65E0\u4EFB\u52A1", cls: "sk-empty" });
      empty.addEventListener("dragover", (evt) => evt.preventDefault());
      empty.addEventListener("drop", (evt) => {
        evt.preventDefault();
        this.handleDrop(column.id);
      });
      return;
    }
    column.cards.forEach((card) => {
      this.renderCard(cardsContainer, column, card);
    });
  }
  renderCard(container, column, card) {
    const cardEl = container.createDiv({
      cls: ["sk-card", card.completed ? "sk-card-completed" : ""].join(" ").trim(),
      attr: { draggable: "true", "data-card": card.id }
    });
    cardEl.addEventListener("dragstart", (evt) => {
      this.dragState = { cardId: card.id, columnId: column.id };
      cardEl.addClass("sk-card-dragging");
      evt.dataTransfer?.setData("text/plain", card.id);
    });
    cardEl.addEventListener("dragend", () => {
      cardEl.removeClass("sk-card-dragging");
      this.dragState = void 0;
    });
    cardEl.addEventListener("dragover", (evt) => {
      evt.preventDefault();
      cardEl.addClass("sk-card-drop");
    });
    cardEl.addEventListener("dragleave", () => {
      cardEl.removeClass("sk-card-drop");
    });
    cardEl.addEventListener("drop", (evt) => {
      evt.preventDefault();
      cardEl.removeClass("sk-card-drop");
      this.handleDrop(column.id, card.id);
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
      new CardModal(this.app, this.plugin, column.id, card).open();
    });
    const historyHost = cardEl.createDiv({ cls: "sk-history-host" });
    const historyMarker = historyHost.createDiv({ cls: "sk-history-marker", text: "\u23F1" });
    const popover = historyHost.createDiv({ cls: "sk-history-popover" });
    const historyEntries = Array.isArray(card.history) ? card.history : [];
    historyEntries.slice(0, 5).forEach((entry) => {
      popover.createDiv({
        cls: "sk-history-entry",
        text: `${formatDate(entry.timestamp)} \xB7 ${entry.remark || "\u4FEE\u6539"}`
      });
    });
    if (!historyEntries.length) {
      popover.createDiv({ text: "\u6682\u65E0\u5386\u53F2", cls: "sk-history-entry" });
    }
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
    return cardEl;
  }
  async handleDrop(targetColumnId, beforeCardId) {
    if (!this.dragState)
      return;
    const { columnId, cardId } = this.dragState;
    if (targetColumnId === columnId && beforeCardId === cardId) {
      this.dragState = void 0;
      return;
    }
    await this.plugin.moveCard(cardId, columnId, targetColumnId, beforeCardId);
    this.dragState = void 0;
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
    if (card) {
      this.titleValue = card.title;
      this.tagsValue = card.tags.join(", ");
      this.remarkValue = card.remark;
    }
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sk-modal");
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
    submitBtn.addEventListener("click", () => this.handleSubmit());
  }
  async handleSubmit() {
    if (!this.titleValue.trim()) {
      new import_obsidian.Notice("\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A");
      return;
    }
    const tags = parseTags(this.tagsValue);
    const remark = this.remarkValue.trim();
    if (this.card) {
      await this.plugin.updateCard(this.columnId, this.card.id, { title: this.titleValue, tags, remark }, this.historyNote.trim() || "\u5185\u5BB9\u66F4\u65B0");
    } else {
      await this.plugin.addCard(this.columnId, {
        title: this.titleValue,
        tags,
        remark,
        historyNote: this.historyNote.trim() || "\u521B\u5EFA"
      });
    }
    this.close();
  }
};
var ColumnModal = class extends import_obsidian.Modal {
  constructor(app, title, onSubmit) {
    super(app);
    this.title = title;
    this.onSubmit = onSubmit;
    this.value = "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sk-modal");
    contentEl.createEl("h2", { text: this.title });
    createTextField(contentEl, "\u680F\u76EE\u540D\u79F0", this.value, (value) => this.value = value);
    const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
    const cancelBtn = footer.createEl("button", { text: "\u53D6\u6D88", cls: "sk-btn sk-btn-ghost" });
    cancelBtn.addEventListener("click", () => this.close());
    const createBtn = footer.createEl("button", { text: "\u786E\u8BA4", cls: "sk-btn" });
    createBtn.addEventListener("click", async () => {
      await this.onSubmit(this.value);
      this.close();
    });
  }
};
function parseTags(input) {
  return input.split(",").map((tag) => tag.trim()).filter((tag) => !!tag);
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
function createTextField(container, label, value, onChange) {
  const wrapper = container.createDiv({ cls: "sk-field" });
  wrapper.createEl("label", { text: label });
  const input = wrapper.createEl("input", { type: "text" });
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7XG5cdEFwcCxcblx0SXRlbVZpZXcsXG5cdE1vZGFsLFxuXHROb3RpY2UsXG5cdFBsdWdpbixcblx0V29ya3NwYWNlTGVhZixcbn0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbmNvbnN0IFZJRVdfVFlQRSA9IFwic2ltcGxlLWthbmJhbi1zaWRlYmFyLXZpZXdcIjtcbmNvbnN0IElDT05fSUQgPSBcImxheW91dC1rYW5iYW5cIjtcblxuaW50ZXJmYWNlIEthbmJhbkhpc3RvcnlFbnRyeSB7XG5cdHRpbWVzdGFtcDogbnVtYmVyO1xuXHRyZW1hcms6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIEthbmJhbkNhcmQge1xuXHRpZDogc3RyaW5nO1xuXHR0aXRsZTogc3RyaW5nO1xuXHR0YWdzOiBzdHJpbmdbXTtcblx0cmVtYXJrOiBzdHJpbmc7XG5cdGNvbXBsZXRlZDogYm9vbGVhbjtcblx0Y3JlYXRlZEF0OiBudW1iZXI7XG5cdHVwZGF0ZWRBdDogbnVtYmVyO1xuXHRoaXN0b3J5OiBLYW5iYW5IaXN0b3J5RW50cnlbXTtcbn1cblxuaW50ZXJmYWNlIEthbmJhbkNvbHVtbiB7XG5cdGlkOiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblx0Y2FyZHM6IEthbmJhbkNhcmRbXTtcbn1cblxuaW50ZXJmYWNlIEthbmJhbkJvYXJkRGF0YSB7XG5cdGNvbHVtbnM6IEthbmJhbkNvbHVtbltdO1xufVxuXG5jb25zdCBERUZBVUxUX0NPTFVNTlMgPSBbXCJcdTVGODVcdTU5MDRcdTc0MDZcIiwgXCJcdThGREJcdTg4NENcdTRFMkRcIiwgXCJcdTVERjJcdTVCOENcdTYyMTBcIl07XG5cbmZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRCb2FyZCgpOiBLYW5iYW5Cb2FyZERhdGEge1xuXHRyZXR1cm4ge1xuXHRcdGNvbHVtbnM6IERFRkFVTFRfQ09MVU1OUy5tYXAoKG5hbWUpID0+ICh7XG5cdFx0XHRpZDogY3JlYXRlSWQoKSxcblx0XHRcdG5hbWUsXG5cdFx0XHRjYXJkczogW10sXG5cdFx0fSkpLFxuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW1wbGVLYW5iYW5QbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuXHRwcml2YXRlIGJvYXJkOiBLYW5iYW5Cb2FyZERhdGEgPSBjcmVhdGVEZWZhdWx0Qm9hcmQoKTtcblx0cHJpdmF0ZSB2aWV3cyA9IG5ldyBTZXQ8S2FuYmFuVmlldz4oKTtcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkQm9hcmQoKTtcblxuXHRcdHRoaXMucmVnaXN0ZXJWaWV3KFZJRVdfVFlQRSwgKGxlYWYpID0+IHtcblx0XHRcdGNvbnN0IHZpZXcgPSBuZXcgS2FuYmFuVmlldyhsZWFmLCB0aGlzKTtcblx0XHRcdHRoaXMucmVnaXN0ZXJLYW5iYW5WaWV3KHZpZXcpO1xuXHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZFJpYmJvbkljb24oSUNPTl9JRCwgXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIiwgKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiBcInNpbXBsZS1rYW5iYW4tb3BlblwiLFxuXHRcdFx0bmFtZTogXCJcdTYyNTNcdTVGMDBcdTUzRjNcdTRGQTdcdTc3MEJcdTY3N0ZcIixcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4gdGhpcy5hY3RpdmF0ZVZpZXcoKSk7XG5cdH1cblxuXHRvbnVubG9hZCgpIHtcblx0XHR0aGlzLnZpZXdzLmNsZWFyKCk7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRCb2FyZCgpIHtcblx0XHRjb25zdCBzdG9yZWQgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCk7XG5cdFx0aWYgKHN0b3JlZCAmJiBzdG9yZWQuY29sdW1ucykge1xuXHRcdFx0dGhpcy5ib2FyZCA9IHN0b3JlZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5ib2FyZCA9IGNyZWF0ZURlZmF1bHRCb2FyZCgpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcGVyc2lzdCgpIHtcblx0XHRhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuYm9hcmQpO1xuXHRcdHRoaXMubm90aWZ5Vmlld3MoKTtcblx0fVxuXG5cdHJlZ2lzdGVyS2FuYmFuVmlldyh2aWV3OiBLYW5iYW5WaWV3KSB7XG5cdFx0dGhpcy52aWV3cy5hZGQodmlldyk7XG5cdFx0dmlldy5yZWdpc3RlcigoKSA9PiB0aGlzLnZpZXdzLmRlbGV0ZSh2aWV3KSk7XG5cdH1cblxuXHRub3RpZnlWaWV3cygpIHtcblx0XHR0aGlzLnZpZXdzLmZvckVhY2goKHZpZXcpID0+IHZpZXcucmVuZGVyKCkpO1xuXHR9XG5cblx0Z2V0Qm9hcmQoKTogS2FuYmFuQm9hcmREYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5ib2FyZDtcblx0fVxuXG5cdGFzeW5jIGFkZENvbHVtbihuYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIW5hbWUudHJpbSgpKSB7XG5cdFx0XHRuZXcgTm90aWNlKFwiXHU2ODBGXHU3NkVFXHU1NDBEXHU3OUYwXHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLmJvYXJkLmNvbHVtbnMucHVzaCh7IGlkOiBjcmVhdGVJZCgpLCBuYW1lOiBuYW1lLnRyaW0oKSwgY2FyZHM6IFtdIH0pO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgYWRkQ2FyZChcblx0XHRjb2x1bW5JZDogc3RyaW5nLFxuXHRcdHBheWxvYWQ6IHsgdGl0bGU6IHN0cmluZzsgdGFnczogc3RyaW5nW107IHJlbWFyazogc3RyaW5nOyBoaXN0b3J5Tm90ZTogc3RyaW5nIH0sXG5cdCkge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXHRcdGNvbnN0IGNhcmQ6IEthbmJhbkNhcmQgPSB7XG5cdFx0XHRpZDogY3JlYXRlSWQoKSxcblx0XHRcdHRpdGxlOiBwYXlsb2FkLnRpdGxlLnRyaW0oKSxcblx0XHRcdHRhZ3M6IHBheWxvYWQudGFncyxcblx0XHRcdHJlbWFyazogcGF5bG9hZC5yZW1hcmssXG5cdFx0XHRjb21wbGV0ZWQ6IGZhbHNlLFxuXHRcdFx0Y3JlYXRlZEF0OiBub3csXG5cdFx0XHR1cGRhdGVkQXQ6IG5vdyxcblx0XHRcdGhpc3Rvcnk6IFtdLFxuXHRcdH07XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIHBheWxvYWQuaGlzdG9yeU5vdGUgfHwgXCJcdTUyMUJcdTVFRkFcIik7XG5cdFx0Y29sdW1uLmNhcmRzLnVuc2hpZnQoY2FyZCk7XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyB1cGRhdGVDYXJkKFxuXHRcdGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0Y2FyZElkOiBzdHJpbmcsXG5cdFx0dXBkYXRlczogUGFydGlhbDxQaWNrPEthbmJhbkNhcmQsIFwidGl0bGVcIiB8IFwidGFnc1wiIHwgXCJyZW1hcmtcIj4+LFxuXHRcdGhpc3RvcnlOb3RlPzogc3RyaW5nLFxuXHQpIHtcblx0XHRjb25zdCBjYXJkID0gdGhpcy5nZXRDYXJkKGNvbHVtbklkLCBjYXJkSWQpO1xuXHRcdGlmICghY2FyZCkgcmV0dXJuO1xuXHRcdGlmICh1cGRhdGVzLnRpdGxlICE9PSB1bmRlZmluZWQpIGNhcmQudGl0bGUgPSB1cGRhdGVzLnRpdGxlLnRyaW0oKTtcblx0XHRpZiAodXBkYXRlcy50YWdzICE9PSB1bmRlZmluZWQpIGNhcmQudGFncyA9IHVwZGF0ZXMudGFncztcblx0XHRpZiAodXBkYXRlcy5yZW1hcmsgIT09IHVuZGVmaW5lZCkgY2FyZC5yZW1hcmsgPSB1cGRhdGVzLnJlbWFyaztcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGhpc3RvcnlOb3RlIHx8IFwiXHU1MTg1XHU1QkI5XHU2NkY0XHU2NUIwXCIpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0YXN5bmMgbW92ZUNhcmQoXG5cdFx0Y2FyZElkOiBzdHJpbmcsXG5cdFx0ZnJvbUNvbHVtbklkOiBzdHJpbmcsXG5cdFx0dG9Db2x1bW5JZDogc3RyaW5nLFxuXHRcdGJlZm9yZUNhcmRJZD86IHN0cmluZyxcblx0KSB7XG5cdFx0Y29uc3QgZnJvbUNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGZyb21Db2x1bW5JZCk7XG5cdFx0Y29uc3QgdG9Db2x1bW4gPSB0aGlzLmdldENvbHVtbih0b0NvbHVtbklkKTtcblx0XHRjb25zdCBpbmRleCA9IGZyb21Db2x1bW4uY2FyZHMuZmluZEluZGV4KChjKSA9PiBjLmlkID09PSBjYXJkSWQpO1xuXHRcdGlmIChpbmRleCA9PT0gLTEpIHJldHVybjtcblx0XHRjb25zdCBbY2FyZF0gPSBmcm9tQ29sdW1uLmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0bGV0IHRhcmdldEluZGV4ID0gdG9Db2x1bW4uY2FyZHMubGVuZ3RoO1xuXHRcdGlmIChiZWZvcmVDYXJkSWQpIHtcblx0XHRcdGNvbnN0IGJlZm9yZUluZGV4ID0gdG9Db2x1bW4uY2FyZHMuZmluZEluZGV4KChjKSA9PiBjLmlkID09PSBiZWZvcmVDYXJkSWQpO1xuXHRcdFx0dGFyZ2V0SW5kZXggPSBiZWZvcmVJbmRleCA9PT0gLTEgPyB0b0NvbHVtbi5jYXJkcy5sZW5ndGggOiBiZWZvcmVJbmRleDtcblx0XHR9XG5cdFx0dG9Db2x1bW4uY2FyZHMuc3BsaWNlKHRhcmdldEluZGV4LCAwLCBjYXJkKTtcblx0XHRjYXJkLnVwZGF0ZWRBdCA9IERhdGUubm93KCk7XG5cdFx0aWYgKGZyb21Db2x1bW5JZCAhPT0gdG9Db2x1bW5JZCkge1xuXHRcdFx0dGhpcy5yZWNvcmRIaXN0b3J5KGNhcmQsIGBcdTc5RkJcdTUyQThcdTUyMzBcdTMwMEMke3RvQ29sdW1uLm5hbWV9XHUzMDBEYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBcIlx1OEMwM1x1NjU3NFx1OTg3QVx1NUU4RlwiKTtcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5wZXJzaXN0KCk7XG5cdH1cblxuXHRhc3luYyB0b2dnbGVDYXJkQ29tcGxldGlvbihjb2x1bW5JZDogc3RyaW5nLCBjYXJkSWQ6IHN0cmluZywgY29tcGxldGVkOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5nZXRDb2x1bW4oY29sdW1uSWQpO1xuXHRcdGNvbnN0IGluZGV4ID0gY29sdW1uLmNhcmRzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gY2FyZElkKTtcblx0XHRpZiAoaW5kZXggPT09IC0xKSByZXR1cm47XG5cdFx0Y29uc3QgW2NhcmRdID0gY29sdW1uLmNhcmRzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0Y2FyZC5jb21wbGV0ZWQgPSBjb21wbGV0ZWQ7XG5cdFx0Y2FyZC51cGRhdGVkQXQgPSBEYXRlLm5vdygpO1xuXHRcdHRoaXMucmVjb3JkSGlzdG9yeShjYXJkLCBjb21wbGV0ZWQgPyBcIlx1NjgwN1x1OEJCMFx1NUI4Q1x1NjIxMFwiIDogXCJcdTUzRDZcdTZEODhcdTVCOENcdTYyMTBcIik7XG5cdFx0Y29uc3QgaW5zZXJ0SW5kZXggPSBjb21wbGV0ZWQgPyBjb2x1bW4uY2FyZHMubGVuZ3RoIDogTWF0aC5taW4oaW5kZXgsIGNvbHVtbi5jYXJkcy5sZW5ndGgpO1xuXHRcdGNvbHVtbi5jYXJkcy5zcGxpY2UoaW5zZXJ0SW5kZXgsIDAsIGNhcmQpO1xuXHRcdGF3YWl0IHRoaXMucGVyc2lzdCgpO1xuXHR9XG5cblx0cHJpdmF0ZSBnZXRDb2x1bW4oY29sdW1uSWQ6IHN0cmluZyk6IEthbmJhbkNvbHVtbiB7XG5cdFx0Y29uc3QgY29sdW1uID0gdGhpcy5ib2FyZC5jb2x1bW5zLmZpbmQoKGNvbCkgPT4gY29sLmlkID09PSBjb2x1bW5JZCk7XG5cdFx0aWYgKCFjb2x1bW4pIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlx1NjcyQVx1NjI3RVx1NTIzMFx1NjMwN1x1NUI5QVx1NzY4NFx1NjgwRlx1NzZFRVwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbHVtbjtcblx0fVxuXG5cdHByaXZhdGUgZ2V0Q2FyZChjb2x1bW5JZDogc3RyaW5nLCBjYXJkSWQ6IHN0cmluZyk6IEthbmJhbkNhcmQgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IGNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uKGNvbHVtbklkKTtcblx0XHRyZXR1cm4gY29sdW1uLmNhcmRzLmZpbmQoKGNhcmQpID0+IGNhcmQuaWQgPT09IGNhcmRJZCk7XG5cdH1cblxuXHRwcml2YXRlIHJlY29yZEhpc3RvcnkoY2FyZDogS2FuYmFuQ2FyZCwgcmVtYXJrOiBzdHJpbmcpIHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoY2FyZC5oaXN0b3J5KSkge1xuXHRcdFx0Y2FyZC5oaXN0b3J5ID0gW107XG5cdFx0fVxuXHRcdGNhcmQuaGlzdG9yeS51bnNoaWZ0KHtcblx0XHRcdHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcblx0XHRcdHJlbWFyazogcmVtYXJrIHx8IFwiXHU2NkY0XHU2NUIwXCIsXG5cdFx0fSk7XG5cdFx0Y2FyZC5oaXN0b3J5ID0gY2FyZC5oaXN0b3J5LnNsaWNlKDAsIDUwKTtcblx0fVxuXG5cdGFzeW5jIGFjdGl2YXRlVmlldygpIHtcblx0XHRjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRSk7XG5cdFx0aWYgKGxlYXZlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLmFwcC53b3Jrc3BhY2UucmV2ZWFsTGVhZihsZWF2ZXNbMF0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCByaWdodExlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0UmlnaHRMZWFmKGZhbHNlKTtcblx0XHRhd2FpdCByaWdodExlYWY/LnNldFZpZXdTdGF0ZSh7IHR5cGU6IFZJRVdfVFlQRSwgYWN0aXZlOiB0cnVlIH0pO1xuXHRcdGlmIChyaWdodExlYWYpIHtcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5yZXZlYWxMZWFmKHJpZ2h0TGVhZik7XG5cdFx0fVxuXHR9XG59XG5cbmNsYXNzIEthbmJhblZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG5cdHByaXZhdGUgZHJhZ1N0YXRlPzogeyBjb2x1bW5JZDogc3RyaW5nOyBjYXJkSWQ6IHN0cmluZyB9O1xuXG5cdGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHByaXZhdGUgcGx1Z2luOiBTaW1wbGVLYW5iYW5QbHVnaW4pIHtcblx0XHRzdXBlcihsZWFmKTtcblx0fVxuXG5cdGdldFZpZXdUeXBlKCkge1xuXHRcdHJldHVybiBWSUVXX1RZUEU7XG5cdH1cblxuXHRnZXREaXNwbGF5VGV4dCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiBcIlx1NTNGM1x1NEZBN1x1NzcwQlx1Njc3RlwiO1xuXHR9XG5cblx0Z2V0SWNvbigpOiBzdHJpbmcge1xuXHRcdHJldHVybiBJQ09OX0lEO1xuXHR9XG5cblx0YXN5bmMgb25PcGVuKCkge1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH1cblxuXHRhc3luYyBvbkNsb3NlKCkge1xuXHRcdHRoaXMuZHJhZ1N0YXRlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGNvbnN0IGJvYXJkID0gdGhpcy5wbHVnaW4uZ2V0Qm9hcmQoKTtcblx0XHRjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRlbnRFbDtcblx0XHRjb250YWluZXIuZW1wdHkoKTtcblx0XHRjb250YWluZXIuYWRkQ2xhc3MoXCJzay1rYW5iYW5cIik7XG5cblx0XHRjb25zdCBoZWFkZXIgPSBjb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhlYWRlclwiIH0pO1xuXHRcdGhlYWRlci5jcmVhdGVFbChcImgyXCIsIHsgdGV4dDogXCJcdTRGQTdcdThGQjlcdTc3MEJcdTY3N0ZcIiB9KTtcblx0XHRjb25zdCBhZGRDb2x1bW5CdG4gPSBoZWFkZXIuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuXHRcdFx0dGV4dDogXCJcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRhZGRDb2x1bW5CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDb2x1bW5Nb2RhbCh0aGlzLmFwcCwgXCJcdTY1QjBcdTU4OUVcdTY4MEZcdTc2RUVcIiwgYXN5bmMgKHZhbHVlKSA9PiB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLmFkZENvbHVtbih2YWx1ZSk7XG5cdFx0XHR9KS5vcGVuKCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBjb2x1bW5zV3JhcHBlciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uc1wiIH0pO1xuXHRcdGlmICghYm9hcmQuY29sdW1ucy5sZW5ndGgpIHtcblx0XHRcdGNvbHVtbnNXcmFwcGVyLmNyZWF0ZURpdih7IHRleHQ6IFwiXHU2NjgyXHU2NUUwXHU2ODBGXHU3NkVFXHVGRjBDXHU3MEI5XHU1MUZCXHUyMDFDXHU2NUIwXHU1ODlFXHU2ODBGXHU3NkVFXHUyMDFEXHUzMDAyXCIsIGNsczogXCJzay1lbXB0eVwiIH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgY29sdW1uIG9mIGJvYXJkLmNvbHVtbnMpIHtcblx0XHRcdHRoaXMucmVuZGVyQ29sdW1uKGNvbHVtbnNXcmFwcGVyLCBjb2x1bW4pO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ29sdW1uKHdyYXBwZXI6IEhUTUxFbGVtZW50LCBjb2x1bW46IEthbmJhbkNvbHVtbikge1xuXHRcdGNvbnN0IGNvbHVtbkVsID0gd3JhcHBlci5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uXCIgfSk7XG5cblx0XHRjb25zdCBjb2x1bW5IZWFkZXIgPSBjb2x1bW5FbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stY29sdW1uLWhlYWRlclwiIH0pO1xuXHRcdGNvbHVtbkhlYWRlci5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogY29sdW1uLm5hbWUgfSk7XG5cdFx0Y29uc3QgYWRkQnRuID0gY29sdW1uSGVhZGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTZERkJcdTUyQTBcdTUzNjFcdTcyNDdcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tc21hbGxcIiB9KTtcblx0XHRhZGRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcblx0XHRcdG5ldyBDYXJkTW9kYWwodGhpcy5hcHAsIHRoaXMucGx1Z2luLCBjb2x1bW4uaWQpLm9wZW4oKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGNhcmRzQ29udGFpbmVyID0gY29sdW1uRWwuY3JlYXRlRGl2KHtcblx0XHRcdGNsczogXCJzay1jYXJkc1wiLFxuXHRcdFx0YXR0cjogeyBcImRhdGEtY29sdW1uXCI6IGNvbHVtbi5pZCB9LFxuXHRcdH0pO1xuXHRcdGNhcmRzQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCAoZXZ0KSA9PiBldnQucHJldmVudERlZmF1bHQoKSk7XG5cdFx0Y2FyZHNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLmhhbmRsZURyb3AoY29sdW1uLmlkKTtcblx0XHR9KTtcblxuXHRcdGlmICghY29sdW1uLmNhcmRzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgZW1wdHkgPSBjYXJkc0NvbnRhaW5lci5jcmVhdGVEaXYoeyB0ZXh0OiBcIlx1RDgzRFx1RENERCBcdTY2ODJcdTY1RTBcdTRFRkJcdTUyQTFcIiwgY2xzOiBcInNrLWVtcHR5XCIgfSk7XG5cdFx0XHRlbXB0eS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2dCkgPT4gZXZ0LnByZXZlbnREZWZhdWx0KCkpO1xuXHRcdFx0ZW1wdHkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgKGV2dCkgPT4ge1xuXHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0dGhpcy5oYW5kbGVEcm9wKGNvbHVtbi5pZCk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb2x1bW4uY2FyZHMuZm9yRWFjaCgoY2FyZCkgPT4ge1xuXHRcdFx0dGhpcy5yZW5kZXJDYXJkKGNhcmRzQ29udGFpbmVyLCBjb2x1bW4sIGNhcmQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDYXJkKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGNvbHVtbjogS2FuYmFuQ29sdW1uLCBjYXJkOiBLYW5iYW5DYXJkKSB7XG5cdFx0Y29uc3QgY2FyZEVsID0gY29udGFpbmVyLmNyZWF0ZURpdih7XG5cdFx0XHRjbHM6IFtcInNrLWNhcmRcIiwgY2FyZC5jb21wbGV0ZWQgPyBcInNrLWNhcmQtY29tcGxldGVkXCIgOiBcIlwiXS5qb2luKFwiIFwiKS50cmltKCksXG5cdFx0XHRhdHRyOiB7IGRyYWdnYWJsZTogXCJ0cnVlXCIsIFwiZGF0YS1jYXJkXCI6IGNhcmQuaWQgfSxcblx0XHR9KTtcblxuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldnQpID0+IHtcblx0XHRcdHRoaXMuZHJhZ1N0YXRlID0geyBjYXJkSWQ6IGNhcmQuaWQsIGNvbHVtbklkOiBjb2x1bW4uaWQgfTtcblx0XHRcdGNhcmRFbC5hZGRDbGFzcyhcInNrLWNhcmQtZHJhZ2dpbmdcIik7XG5cdFx0XHRldnQuZGF0YVRyYW5zZmVyPy5zZXREYXRhKFwidGV4dC9wbGFpblwiLCBjYXJkLmlkKTtcblx0XHR9KTtcblx0XHRjYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbmRcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcmFnZ2luZ1wiKTtcblx0XHRcdHRoaXMuZHJhZ1N0YXRlID0gdW5kZWZpbmVkO1xuXHRcdH0pO1xuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgKGV2dCkgPT4ge1xuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRjYXJkRWwuYWRkQ2xhc3MoXCJzay1jYXJkLWRyb3BcIik7XG5cdFx0fSk7XG5cdFx0Y2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgKCkgPT4ge1xuXHRcdFx0Y2FyZEVsLnJlbW92ZUNsYXNzKFwic2stY2FyZC1kcm9wXCIpO1xuXHRcdH0pO1xuXHRcdGNhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCAoZXZ0KSA9PiB7XG5cdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNhcmRFbC5yZW1vdmVDbGFzcyhcInNrLWNhcmQtZHJvcFwiKTtcblx0XHRcdHRoaXMuaGFuZGxlRHJvcChjb2x1bW4uaWQsIGNhcmQuaWQpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgdG9wUm93ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRvcFwiIH0pO1xuXHRcdGNvbnN0IGNoZWNrYm94ID0gdG9wUm93LmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcblx0XHRjaGVja2JveC5jaGVja2VkID0gY2FyZC5jb21wbGV0ZWQ7XG5cdFx0Y2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChldnQpID0+IHtcblx0XHRcdGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnRvZ2dsZUNhcmRDb21wbGV0aW9uKGNvbHVtbi5pZCwgY2FyZC5pZCwgY2hlY2tib3guY2hlY2tlZCk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCB0aXRsZUVsID0gdG9wUm93LmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRpdGxlXCIsIHRleHQ6IGNhcmQudGl0bGUgfSk7XG5cdFx0dGl0bGVFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRcdFx0bmV3IENhcmRNb2RhbCh0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGNvbHVtbi5pZCwgY2FyZCkub3BlbigpO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgaGlzdG9yeUhvc3QgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhpc3RvcnktaG9zdFwiIH0pO1xuXHRcdGNvbnN0IGhpc3RvcnlNYXJrZXIgPSBoaXN0b3J5SG9zdC5jcmVhdGVEaXYoeyBjbHM6IFwic2staGlzdG9yeS1tYXJrZXJcIiwgdGV4dDogXCJcdTIzRjFcIiB9KTtcblx0XHRjb25zdCBwb3BvdmVyID0gaGlzdG9yeUhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWhpc3RvcnktcG9wb3ZlclwiIH0pO1xuXHRcdGNvbnN0IGhpc3RvcnlFbnRyaWVzID0gQXJyYXkuaXNBcnJheShjYXJkLmhpc3RvcnkpID8gY2FyZC5oaXN0b3J5IDogW107XG5cdFx0aGlzdG9yeUVudHJpZXMuc2xpY2UoMCwgNSkuZm9yRWFjaCgoZW50cnkpID0+IHtcblx0XHRcdHBvcG92ZXIuY3JlYXRlRGl2KHtcblx0XHRcdFx0Y2xzOiBcInNrLWhpc3RvcnktZW50cnlcIixcblx0XHRcdFx0dGV4dDogYCR7Zm9ybWF0RGF0ZShlbnRyeS50aW1lc3RhbXApfSBcdTAwQjcgJHtlbnRyeS5yZW1hcmsgfHwgXCJcdTRGRUVcdTY1MzlcIn1gLFxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0aWYgKCFoaXN0b3J5RW50cmllcy5sZW5ndGgpIHtcblx0XHRcdHBvcG92ZXIuY3JlYXRlRGl2KHsgdGV4dDogXCJcdTY2ODJcdTY1RTBcdTUzODZcdTUzRjJcIiwgY2xzOiBcInNrLWhpc3RvcnktZW50cnlcIiB9KTtcblx0XHR9XG5cblx0XHRpZiAoY2FyZC50YWdzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgdGFnUm93ID0gY2FyZEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1jYXJkLXRhZ3NcIiB9KTtcblx0XHRcdGNhcmQudGFncy5mb3JFYWNoKCh0YWcpID0+IHRhZ1Jvdy5jcmVhdGVEaXYoeyBjbHM6IFwic2stdGFnXCIsIHRleHQ6IHRhZyB9KSk7XG5cdFx0fVxuXG5cdFx0aWYgKGNhcmQucmVtYXJrKSB7XG5cdFx0XHRjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtcmVtYXJrXCIsIHRleHQ6IGNhcmQucmVtYXJrIH0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1ldGEgPSBjYXJkRWwuY3JlYXRlRGl2KHsgY2xzOiBcInNrLWNhcmQtbWV0YVwiIH0pO1xuXHRcdG1ldGEuY3JlYXRlU3Bhbih7IHRleHQ6IGBcdTUyMUJcdTVFRkFcdUZGMUEke2Zvcm1hdERhdGUoY2FyZC5jcmVhdGVkQXQpfWAgfSk7XG5cdFx0bWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogYFx1NjZGNFx1NjVCMFx1RkYxQSR7Zm9ybWF0RGF0ZShjYXJkLnVwZGF0ZWRBdCl9YCB9KTtcblxuXHRcdHJldHVybiBjYXJkRWw7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGhhbmRsZURyb3AodGFyZ2V0Q29sdW1uSWQ6IHN0cmluZywgYmVmb3JlQ2FyZElkPzogc3RyaW5nKSB7XG5cdFx0aWYgKCF0aGlzLmRyYWdTdGF0ZSkgcmV0dXJuO1xuXHRcdGNvbnN0IHsgY29sdW1uSWQsIGNhcmRJZCB9ID0gdGhpcy5kcmFnU3RhdGU7XG5cdFx0aWYgKHRhcmdldENvbHVtbklkID09PSBjb2x1bW5JZCAmJiBiZWZvcmVDYXJkSWQgPT09IGNhcmRJZCkge1xuXHRcdFx0dGhpcy5kcmFnU3RhdGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMucGx1Z2luLm1vdmVDYXJkKGNhcmRJZCwgY29sdW1uSWQsIHRhcmdldENvbHVtbklkLCBiZWZvcmVDYXJkSWQpO1xuXHRcdHRoaXMuZHJhZ1N0YXRlID0gdW5kZWZpbmVkO1xuXHR9XG59XG5cbmNsYXNzIENhcmRNb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cHJpdmF0ZSB0aXRsZVZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSB0YWdzVmFsdWUgPSBcIlwiO1xuXHRwcml2YXRlIHJlbWFya1ZhbHVlID0gXCJcIjtcblx0cHJpdmF0ZSBoaXN0b3J5Tm90ZSA9IFwiXCI7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0YXBwOiBBcHAsXG5cdFx0cHJpdmF0ZSBwbHVnaW46IFNpbXBsZUthbmJhblBsdWdpbixcblx0XHRwcml2YXRlIGNvbHVtbklkOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSBjYXJkPzogS2FuYmFuQ2FyZCxcblx0KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0XHRpZiAoY2FyZCkge1xuXHRcdFx0dGhpcy50aXRsZVZhbHVlID0gY2FyZC50aXRsZTtcblx0XHRcdHRoaXMudGFnc1ZhbHVlID0gY2FyZC50YWdzLmpvaW4oXCIsIFwiKTtcblx0XHRcdHRoaXMucmVtYXJrVmFsdWUgPSBjYXJkLnJlbWFyaztcblx0XHR9XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdFx0Y29udGVudEVsLmFkZENsYXNzKFwic2stbW9kYWxcIik7XG5cblx0XHRjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMuY2FyZCA/IFwiXHU3RjE2XHU4RjkxXHU1MzYxXHU3MjQ3XCIgOiBcIlx1NjVCMFx1NTg5RVx1NTM2MVx1NzI0N1wiIH0pO1xuXG5cdFx0dGhpcy50aXRsZVZhbHVlID0gdGhpcy50aXRsZVZhbHVlIHx8IFwiXCI7XG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MDdcdTk4OThcIiwgdGhpcy50aXRsZVZhbHVlLCAodmFsdWUpID0+IHtcblx0XHRcdHRoaXMudGl0bGVWYWx1ZSA9IHZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0Y3JlYXRlVGV4dEZpZWxkKGNvbnRlbnRFbCwgXCJcdTY4MDdcdTdCN0VcdUZGMDhcdTkwMTdcdTUzRjdcdTUyMDZcdTk2OTRcdUZGMDlcIiwgdGhpcy50YWdzVmFsdWUsICh2YWx1ZSkgPT4ge1xuXHRcdFx0dGhpcy50YWdzVmFsdWUgPSB2YWx1ZTtcblx0XHR9KTtcblxuXHRcdGNyZWF0ZVRleHRBcmVhKGNvbnRlbnRFbCwgXCJcdTU5MDdcdTZDRThcIiwgdGhpcy5yZW1hcmtWYWx1ZSwgKHZhbHVlKSA9PiB7XG5cdFx0XHR0aGlzLnJlbWFya1ZhbHVlID0gdmFsdWU7XG5cdFx0fSk7XG5cblx0XHRjcmVhdGVUZXh0QXJlYShjb250ZW50RWwsIFwiXHU0RkVFXHU2NTM5XHU4QkY0XHU2NjBFXHVGRjA4XHU1MTk5XHU1MTY1XHU1Mzg2XHU1M0YyXHVGRjA5XCIsIFwiXCIsICh2YWx1ZSkgPT4ge1xuXHRcdFx0dGhpcy5oaXN0b3J5Tm90ZSA9IHZhbHVlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgZm9vdGVyID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJzay1tb2RhbC1mb290ZXJcIiB9KTtcblx0XHRjb25zdCBjYW5jZWxCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1NTNENlx1NkQ4OFwiLCBjbHM6IFwic2stYnRuIHNrLWJ0bi1naG9zdFwiIH0pO1xuXHRcdGNhbmNlbEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5jbG9zZSgpKTtcblxuXHRcdGNvbnN0IHN1Ym1pdEJ0biA9IGZvb3Rlci5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG5cdFx0XHR0ZXh0OiB0aGlzLmNhcmQgPyBcIlx1NEZERFx1NUI1OFwiIDogXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdGNsczogXCJzay1idG5cIixcblx0XHR9KTtcblx0XHRzdWJtaXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuaGFuZGxlU3VibWl0KCkpO1xuXHR9XG5cblx0YXN5bmMgaGFuZGxlU3VibWl0KCkge1xuXHRcdGlmICghdGhpcy50aXRsZVZhbHVlLnRyaW0oKSkge1xuXHRcdFx0bmV3IE5vdGljZShcIlx1NjgwN1x1OTg5OFx1NEUwRFx1ODBGRFx1NEUzQVx1N0E3QVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgdGFncyA9IHBhcnNlVGFncyh0aGlzLnRhZ3NWYWx1ZSk7XG5cdFx0Y29uc3QgcmVtYXJrID0gdGhpcy5yZW1hcmtWYWx1ZS50cmltKCk7XG5cdFx0aWYgKHRoaXMuY2FyZCkge1xuXHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4udXBkYXRlQ2FyZCh0aGlzLmNvbHVtbklkLCB0aGlzLmNhcmQuaWQsIHsgdGl0bGU6IHRoaXMudGl0bGVWYWx1ZSwgdGFncywgcmVtYXJrIH0sIHRoaXMuaGlzdG9yeU5vdGUudHJpbSgpIHx8IFwiXHU1MTg1XHU1QkI5XHU2NkY0XHU2NUIwXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5hZGRDYXJkKHRoaXMuY29sdW1uSWQsIHtcblx0XHRcdFx0dGl0bGU6IHRoaXMudGl0bGVWYWx1ZSxcblx0XHRcdFx0dGFncyxcblx0XHRcdFx0cmVtYXJrLFxuXHRcdFx0XHRoaXN0b3J5Tm90ZTogdGhpcy5oaXN0b3J5Tm90ZS50cmltKCkgfHwgXCJcdTUyMUJcdTVFRkFcIixcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR0aGlzLmNsb3NlKCk7XG5cdH1cbn1cblxuY2xhc3MgQ29sdW1uTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG5cdHByaXZhdGUgdmFsdWUgPSBcIlwiO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHRpdGxlOiBzdHJpbmcsIHByaXZhdGUgb25TdWJtaXQ6ICh2YWx1ZTogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+KSB7XG5cdFx0c3VwZXIoYXBwKTtcblx0fVxuXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0XHRjb250ZW50RWwuYWRkQ2xhc3MoXCJzay1tb2RhbFwiKTtcblx0XHRjb250ZW50RWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IHRoaXMudGl0bGUgfSk7XG5cblx0XHRjcmVhdGVUZXh0RmllbGQoY29udGVudEVsLCBcIlx1NjgwRlx1NzZFRVx1NTQwRFx1NzlGMFwiLCB0aGlzLnZhbHVlLCAodmFsdWUpID0+ICh0aGlzLnZhbHVlID0gdmFsdWUpKTtcblxuXHRcdGNvbnN0IGZvb3RlciA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwic2stbW9kYWwtZm9vdGVyXCIgfSk7XG5cdFx0Y29uc3QgY2FuY2VsQnRuID0gZm9vdGVyLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogXCJcdTUzRDZcdTZEODhcIiwgY2xzOiBcInNrLWJ0biBzay1idG4tZ2hvc3RcIiB9KTtcblx0XHRjYW5jZWxCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMuY2xvc2UoKSk7XG5cblx0XHRjb25zdCBjcmVhdGVCdG4gPSBmb290ZXIuY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBcIlx1Nzg2RVx1OEJBNFwiLCBjbHM6IFwic2stYnRuXCIgfSk7XG5cdFx0Y3JlYXRlQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG5cdFx0XHRhd2FpdCB0aGlzLm9uU3VibWl0KHRoaXMudmFsdWUpO1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGFncyhpbnB1dDogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRyZXR1cm4gaW5wdXRcblx0XHQuc3BsaXQoXCIsXCIpXG5cdFx0Lm1hcCgodGFnKSA9PiB0YWcudHJpbSgpKVxuXHRcdC5maWx0ZXIoKHRhZykgPT4gISF0YWcpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVJZCgpIHtcblx0cmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpICsgRGF0ZS5ub3coKS50b1N0cmluZygzNik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERhdGUodGltZXN0YW1wOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcblx0Y29uc3QgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblx0Y29uc3QgbSA9IFN0cmluZyhkYXRlLmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IGQgPSBTdHJpbmcoZGF0ZS5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblx0Y29uc3QgaGggPSBTdHJpbmcoZGF0ZS5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdGNvbnN0IG1tID0gU3RyaW5nKGRhdGUuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cdHJldHVybiBgJHt5fS0ke219LSR7ZH0gJHtoaH06JHttbX1gO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0RmllbGQoXG5cdGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsXG5cdGxhYmVsOiBzdHJpbmcsXG5cdHZhbHVlOiBzdHJpbmcsXG5cdG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZCxcbikge1xuXHRjb25zdCB3cmFwcGVyID0gY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJzay1maWVsZFwiIH0pO1xuXHR3cmFwcGVyLmNyZWF0ZUVsKFwibGFiZWxcIiwgeyB0ZXh0OiBsYWJlbCB9KTtcblx0Y29uc3QgaW5wdXQgPSB3cmFwcGVyLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiB9KTtcblx0aW5wdXQudmFsdWUgPSB2YWx1ZTtcblx0aW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldnQpID0+IG9uQ2hhbmdlKChldnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRBcmVhKFxuXHRjb250YWluZXI6IEhUTUxFbGVtZW50LFxuXHRsYWJlbDogc3RyaW5nLFxuXHR2YWx1ZTogc3RyaW5nLFxuXHRvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWQsXG4pIHtcblx0Y29uc3Qgd3JhcHBlciA9IGNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwic2stZmllbGRcIiB9KTtcblx0d3JhcHBlci5jcmVhdGVFbChcImxhYmVsXCIsIHsgdGV4dDogbGFiZWwgfSk7XG5cdGNvbnN0IHRleHRhcmVhID0gd3JhcHBlci5jcmVhdGVFbChcInRleHRhcmVhXCIpO1xuXHR0ZXh0YXJlYS52YWx1ZSA9IHZhbHVlO1xuXHR0ZXh0YXJlYS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2dCkgPT4gb25DaGFuZ2UoKGV2dC50YXJnZXQgYXMgSFRNTFRleHRBcmVhRWxlbWVudCkudmFsdWUpKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQU9PO0FBRVAsSUFBTSxZQUFZO0FBQ2xCLElBQU0sVUFBVTtBQTRCaEIsSUFBTSxrQkFBa0IsQ0FBQyxzQkFBTyxzQkFBTyxvQkFBSztBQUU1QyxTQUFTLHFCQUFzQztBQUM5QyxTQUFPO0FBQUEsSUFDTixTQUFTLGdCQUFnQixJQUFJLENBQUMsVUFBVTtBQUFBLE1BQ3ZDLElBQUksU0FBUztBQUFBLE1BQ2I7QUFBQSxNQUNBLE9BQU8sQ0FBQztBQUFBLElBQ1QsRUFBRTtBQUFBLEVBQ0g7QUFDRDtBQUVBLElBQXFCLHFCQUFyQixjQUFnRCx1QkFBTztBQUFBLEVBQXZE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
