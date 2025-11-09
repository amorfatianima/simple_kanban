import {
	App,
	ItemView,
	Modal,
	Notice,
	Plugin,
	WorkspaceLeaf,
} from "obsidian";

const VIEW_TYPE = "simple-kanban-sidebar-view";
const ICON_ID = "layout-kanban";

interface KanbanHistoryEntry {
	timestamp: number;
	remark: string;
}

interface KanbanCard {
	id: string;
	title: string;
	tags: string[];
	remark: string;
	completed: boolean;
	createdAt: number;
	updatedAt: number;
	history: KanbanHistoryEntry[];
}

interface KanbanColumn {
	id: string;
	name: string;
	cards: KanbanCard[];
}

interface KanbanBoardData {
	columns: KanbanColumn[];
}

const DEFAULT_COLUMNS = ["待处理", "进行中", "已完成"];

function createDefaultBoard(): KanbanBoardData {
	return {
		columns: DEFAULT_COLUMNS.map((name) => ({
			id: createId(),
			name,
			cards: [],
		})),
	};
}

export default class SimpleKanbanPlugin extends Plugin {
	private board: KanbanBoardData = createDefaultBoard();
	private views = new Set<KanbanView>();

	async onload() {
		await this.loadBoard();

		this.registerView(VIEW_TYPE, (leaf) => {
			const view = new KanbanView(leaf, this);
			this.registerKanbanView(view);
			return view;
		});

		this.addRibbonIcon(ICON_ID, "打开右侧看板", () => this.activateView());
		this.addCommand({
			id: "simple-kanban-open",
			name: "打开右侧看板",
			callback: () => this.activateView(),
		});

		this.app.workspace.onLayoutReady(() => this.activateView());
	}

	onunload() {
		this.views.clear();
	}

	private async loadBoard() {
		const stored = await this.loadData();
		if (stored && stored.columns) {
			this.board = stored;
		} else {
			this.board = createDefaultBoard();
		}
	}

	private async persist() {
		await this.saveData(this.board);
		this.notifyViews();
	}

	registerKanbanView(view: KanbanView) {
		this.views.add(view);
		view.register(() => this.views.delete(view));
	}

	notifyViews() {
		this.views.forEach((view) => view.render());
	}

	getBoard(): KanbanBoardData {
		return this.board;
	}

	async addColumn(name: string) {
		if (!name.trim()) {
			new Notice("栏目名称不能为空");
			return;
		}
		this.board.columns.push({ id: createId(), name: name.trim(), cards: [] });
		await this.persist();
	}

	async addCard(
		columnId: string,
		payload: { title: string; tags: string[]; remark: string; historyNote: string },
	) {
		const column = this.getColumn(columnId);
		const now = Date.now();
		const card: KanbanCard = {
			id: createId(),
			title: payload.title.trim(),
			tags: payload.tags,
			remark: payload.remark,
			completed: false,
			createdAt: now,
			updatedAt: now,
			history: [],
		};
		this.recordHistory(card, payload.historyNote || "创建");
		column.cards.unshift(card);
		await this.persist();
	}

	async updateCard(
		columnId: string,
		cardId: string,
		updates: Partial<Pick<KanbanCard, "title" | "tags" | "remark">>,
		historyNote?: string,
	) {
		const card = this.getCard(columnId, cardId);
		if (!card) return;
		if (updates.title !== undefined) card.title = updates.title.trim();
		if (updates.tags !== undefined) card.tags = updates.tags;
		if (updates.remark !== undefined) card.remark = updates.remark;
		card.updatedAt = Date.now();
		this.recordHistory(card, historyNote || "内容更新");
		await this.persist();
	}

	async moveCard(
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
		beforeCardId?: string,
	) {
		const fromColumn = this.getColumn(fromColumnId);
		const toColumn = this.getColumn(toColumnId);
		const index = fromColumn.cards.findIndex((c) => c.id === cardId);
		if (index === -1) return;
		const [card] = fromColumn.cards.splice(index, 1);
		let targetIndex = toColumn.cards.length;
		if (beforeCardId) {
			const beforeIndex = toColumn.cards.findIndex((c) => c.id === beforeCardId);
			targetIndex = beforeIndex === -1 ? toColumn.cards.length : beforeIndex;
		}
		toColumn.cards.splice(targetIndex, 0, card);
		card.updatedAt = Date.now();
		if (fromColumnId !== toColumnId) {
			this.recordHistory(card, `移动到「${toColumn.name}」`);
		} else {
			this.recordHistory(card, "调整顺序");
		}
		await this.persist();
	}

	async toggleCardCompletion(columnId: string, cardId: string, completed: boolean) {
		const column = this.getColumn(columnId);
		const index = column.cards.findIndex((c) => c.id === cardId);
		if (index === -1) return;
		const [card] = column.cards.splice(index, 1);
		card.completed = completed;
		card.updatedAt = Date.now();
		this.recordHistory(card, completed ? "标记完成" : "取消完成");
		const insertIndex = completed ? column.cards.length : Math.min(index, column.cards.length);
		column.cards.splice(insertIndex, 0, card);
		await this.persist();
	}

	private getColumn(columnId: string): KanbanColumn {
		const column = this.board.columns.find((col) => col.id === columnId);
		if (!column) {
			throw new Error("未找到指定的栏目");
		}
		return column;
	}

	private getCard(columnId: string, cardId: string): KanbanCard | undefined {
		const column = this.getColumn(columnId);
		return column.cards.find((card) => card.id === cardId);
	}

	private recordHistory(card: KanbanCard, remark: string) {
		if (!Array.isArray(card.history)) {
			card.history = [];
		}
		card.history.unshift({
			timestamp: Date.now(),
			remark: remark || "更新",
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
}

class KanbanView extends ItemView {
	private dragState?: { columnId: string; cardId: string };

	constructor(leaf: WorkspaceLeaf, private plugin: SimpleKanbanPlugin) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "右侧看板";
	}

	getIcon(): string {
		return ICON_ID;
	}

	async onOpen() {
		this.render();
	}

	async onClose() {
		this.dragState = undefined;
	}

	render() {
		const board = this.plugin.getBoard();
		const container = this.contentEl;
		container.empty();
		container.addClass("sk-kanban");

		const header = container.createDiv({ cls: "sk-header" });
		header.createEl("h2", { text: "侧边看板" });
		const addColumnBtn = header.createEl("button", {
			text: "新增栏目",
			cls: "sk-btn",
		});
		addColumnBtn.addEventListener("click", () => {
			new ColumnModal(this.app, "新增栏目", async (value) => {
				await this.plugin.addColumn(value);
			}).open();
		});

		const columnsWrapper = container.createDiv({ cls: "sk-columns" });
		if (!board.columns.length) {
			columnsWrapper.createDiv({ text: "暂无栏目，点击“新增栏目”。", cls: "sk-empty" });
			return;
		}

		for (const column of board.columns) {
			this.renderColumn(columnsWrapper, column);
		}
	}

	private renderColumn(wrapper: HTMLElement, column: KanbanColumn) {
		const columnEl = wrapper.createDiv({ cls: "sk-column" });

		const columnHeader = columnEl.createDiv({ cls: "sk-column-header" });
		columnHeader.createEl("h3", { text: column.name });
		const addBtn = columnHeader.createEl("button", { text: "添加卡片", cls: "sk-btn sk-btn-small" });
		addBtn.addEventListener("click", () => {
			new CardModal(this.app, this.plugin, column.id).open();
		});

		const cardsContainer = columnEl.createDiv({
			cls: "sk-cards",
			attr: { "data-column": column.id },
		});
		cardsContainer.addEventListener("dragover", (evt) => evt.preventDefault());
		cardsContainer.addEventListener("drop", (evt) => {
			evt.preventDefault();
			this.handleDrop(column.id);
		});

		if (!column.cards.length) {
			const empty = cardsContainer.createDiv({ text: "📝 暂无任务", cls: "sk-empty" });
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

	private renderCard(container: HTMLElement, column: KanbanColumn, card: KanbanCard) {
		const cardEl = container.createDiv({
			cls: ["sk-card", card.completed ? "sk-card-completed" : ""].join(" ").trim(),
			attr: { draggable: "true", "data-card": card.id },
		});

		cardEl.addEventListener("dragstart", (evt) => {
			this.dragState = { cardId: card.id, columnId: column.id };
			cardEl.addClass("sk-card-dragging");
			evt.dataTransfer?.setData("text/plain", card.id);
		});
		cardEl.addEventListener("dragend", () => {
			cardEl.removeClass("sk-card-dragging");
			this.dragState = undefined;
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
		const checkbox = topRow.createEl("input", { type: "checkbox" }) as HTMLInputElement;
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
		const historyMarker = historyHost.createDiv({ cls: "sk-history-marker", text: "⏱" });
		const popover = historyHost.createDiv({ cls: "sk-history-popover" });
		const historyEntries = Array.isArray(card.history) ? card.history : [];
		historyEntries.slice(0, 5).forEach((entry) => {
			popover.createDiv({
				cls: "sk-history-entry",
				text: `${formatDate(entry.timestamp)} · ${entry.remark || "修改"}`,
			});
		});
		if (!historyEntries.length) {
			popover.createDiv({ text: "暂无历史", cls: "sk-history-entry" });
		}

		if (card.tags.length) {
			const tagRow = cardEl.createDiv({ cls: "sk-card-tags" });
			card.tags.forEach((tag) => tagRow.createDiv({ cls: "sk-tag", text: tag }));
		}

		if (card.remark) {
			cardEl.createDiv({ cls: "sk-card-remark", text: card.remark });
		}

		const meta = cardEl.createDiv({ cls: "sk-card-meta" });
		meta.createSpan({ text: `创建：${formatDate(card.createdAt)}` });
		meta.createSpan({ text: `更新：${formatDate(card.updatedAt)}` });

		return cardEl;
	}

	private async handleDrop(targetColumnId: string, beforeCardId?: string) {
		if (!this.dragState) return;
		const { columnId, cardId } = this.dragState;
		if (targetColumnId === columnId && beforeCardId === cardId) {
			this.dragState = undefined;
			return;
		}
		await this.plugin.moveCard(cardId, columnId, targetColumnId, beforeCardId);
		this.dragState = undefined;
	}
}

class CardModal extends Modal {
	private titleValue = "";
	private tagsValue = "";
	private remarkValue = "";
	private historyNote = "";

	constructor(
		app: App,
		private plugin: SimpleKanbanPlugin,
		private columnId: string,
		private card?: KanbanCard,
	) {
		super(app);
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

		contentEl.createEl("h2", { text: this.card ? "编辑卡片" : "新增卡片" });

		this.titleValue = this.titleValue || "";
		createTextField(contentEl, "标题", this.titleValue, (value) => {
			this.titleValue = value;
		});

		createTextField(contentEl, "标签（逗号分隔）", this.tagsValue, (value) => {
			this.tagsValue = value;
		});

		createTextArea(contentEl, "备注", this.remarkValue, (value) => {
			this.remarkValue = value;
		});

		createTextArea(contentEl, "修改说明（写入历史）", "", (value) => {
			this.historyNote = value;
		});

		const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
		const cancelBtn = footer.createEl("button", { text: "取消", cls: "sk-btn sk-btn-ghost" });
		cancelBtn.addEventListener("click", () => this.close());

		const submitBtn = footer.createEl("button", {
			text: this.card ? "保存" : "创建",
			cls: "sk-btn",
		});
		submitBtn.addEventListener("click", () => this.handleSubmit());
	}

	async handleSubmit() {
		if (!this.titleValue.trim()) {
			new Notice("标题不能为空");
			return;
		}
		const tags = parseTags(this.tagsValue);
		const remark = this.remarkValue.trim();
		if (this.card) {
			await this.plugin.updateCard(this.columnId, this.card.id, { title: this.titleValue, tags, remark }, this.historyNote.trim() || "内容更新");
		} else {
			await this.plugin.addCard(this.columnId, {
				title: this.titleValue,
				tags,
				remark,
				historyNote: this.historyNote.trim() || "创建",
			});
		}
		this.close();
	}
}

class ColumnModal extends Modal {
	private value = "";

	constructor(app: App, private title: string, private onSubmit: (value: string) => Promise<void>) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("sk-modal");
		contentEl.createEl("h2", { text: this.title });

		createTextField(contentEl, "栏目名称", this.value, (value) => (this.value = value));

		const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
		const cancelBtn = footer.createEl("button", { text: "取消", cls: "sk-btn sk-btn-ghost" });
		cancelBtn.addEventListener("click", () => this.close());

		const createBtn = footer.createEl("button", { text: "确认", cls: "sk-btn" });
		createBtn.addEventListener("click", async () => {
			await this.onSubmit(this.value);
			this.close();
		});
	}
}

function parseTags(input: string): string[] {
	return input
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => !!tag);
}

function createId() {
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatDate(timestamp: number): string {
	const date = new Date(timestamp);
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	return `${y}-${m}-${d} ${hh}:${mm}`;
}

function createTextField(
	container: HTMLElement,
	label: string,
	value: string,
	onChange: (value: string) => void,
) {
	const wrapper = container.createDiv({ cls: "sk-field" });
	wrapper.createEl("label", { text: label });
	const input = wrapper.createEl("input", { type: "text" });
	input.value = value;
	input.addEventListener("input", (evt) => onChange((evt.target as HTMLInputElement).value));
}

function createTextArea(
	container: HTMLElement,
	label: string,
	value: string,
	onChange: (value: string) => void,
) {
	const wrapper = container.createDiv({ cls: "sk-field" });
	wrapper.createEl("label", { text: label });
	const textarea = wrapper.createEl("textarea");
	textarea.value = value;
	textarea.addEventListener("input", (evt) => onChange((evt.target as HTMLTextAreaElement).value));
}
