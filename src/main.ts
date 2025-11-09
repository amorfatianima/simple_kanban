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
	deadline?: number | null;
	completed: boolean;
	completedAt?: number | null;
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

interface DailyCountPoint {
	date: string;
	value: number;
}

interface DailyStatsPoint {
	date: string;
	created: number;
	completed: number;
}

interface DailyRatePoint {
	date: string;
	rate: number;
}

interface StatsSnapshot {
	totalTasks: number;
	completedTasks: number;
	wipCount: number;
	completionRate: number;
	deadlineCount: number;
	deadlineCoverage: number;
	overdueCount: number;
	overdueRate: number;
	onTimeRate: number;
	avgCycleTimeMs: number | null;
	dailySeries: DailyStatsPoint[];
	dailyRates: DailyRatePoint[];
}

const DEFAULT_COLUMNS = ["待处理", "进行中", "已完成"];
type NullableTimeout = number | null;

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
	private lastColumnId?: string;

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
		this.addCommand({
			id: "simple-kanban-add-card",
			name: "添加卡片",
			hotkeys: [{ modifiers: ["Mod", "Shift"], key: "N" }],
			callback: () => this.openQuickAddCard(),
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
		this.normalizeBoard();
		this.lastColumnId = this.board.columns[0]?.id;
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
		const column = { id: createId(), name: name.trim(), cards: [] as KanbanCard[] };
		this.board.columns.push(column);
		if (!this.lastColumnId) {
			this.lastColumnId = column.id;
		}
		await this.persist();
	}

	async removeColumn(columnId: string) {
		const index = this.board.columns.findIndex((col) => col.id === columnId);
		if (index === -1) {
			new Notice("未找到指定栏目");
			return;
		}
		this.board.columns.splice(index, 1);
		if (this.lastColumnId === columnId) {
			this.lastColumnId = this.board.columns[0]?.id;
		}
		await this.persist();
	}

	async renameColumn(columnId: string, name: string) {
		const column = this.getColumn(columnId);
		const nextName = name.trim();
		if (!nextName) {
			new Notice("栏目名称不能为空");
			return;
		}
		column.name = nextName;
		await this.persist();
	}

	async addCard(
		columnId: string,
		payload: {
			title: string;
			tags: string[];
			remark: string;
			historyNote: string;
			deadline?: number | null;
		},
	) {
		const column = this.getColumn(columnId);
		const now = Date.now();
		const card: KanbanCard = {
			id: createId(),
			title: payload.title.trim(),
			tags: payload.tags,
			remark: payload.remark,
			deadline: payload.deadline ?? null,
			completed: false,
			completedAt: null,
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
		updates: Partial<Pick<KanbanCard, "title" | "tags" | "remark" | "deadline">>,
		historyNote?: string,
	) {
		const card = this.getCard(columnId, cardId);
		if (!card) return;
		if (updates.title !== undefined) card.title = updates.title.trim();
		if (updates.tags !== undefined) card.tags = updates.tags;
		if (updates.remark !== undefined) card.remark = updates.remark;
		if (updates.deadline !== undefined) card.deadline = updates.deadline;
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
		card.completedAt = completed ? Date.now() : null;
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

	private normalizeBoard() {
		for (const column of this.board.columns) {
			column.cards = column.cards.map((card) => ({
				...card,
				deadline: card.deadline ?? null,
				completedAt: card.completedAt ?? null,
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

	setActiveColumn(columnId: string) {
		this.lastColumnId = columnId;
	}

	private resolveColumnForQuickAdd(): KanbanColumn | undefined {
		if (!this.board.columns.length) return undefined;
		const preferred =
			this.lastColumnId && this.board.columns.find((col) => col.id === this.lastColumnId);
		return preferred ?? this.board.columns[0];
	}

	openQuickAddCard() {
		const column = this.resolveColumnForQuickAdd();
		if (!column) {
			new Notice("请先新增栏目");
			return;
		}
		this.setActiveColumn(column.id);
		new CardModal(this.app, this, column.id).open();
	}
}

class KanbanView extends ItemView {
	private dragState?: { columnId: string; cardId: string; cardHeight: number };
	private placeholderEl?: HTMLElement;
	private placeholderState?: { columnId: string; beforeId?: string };
	private deadlineFilters = new Map<string, boolean>();
	private activeTab: "board" | "stats" = "board";

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
		const container = this.contentEl;
		container.empty();
		container.addClass("sk-kanban");

		const tabs = container.createDiv({ cls: "sk-tabs" });
		this.renderTabButton(tabs, "board", "任务看板");
		this.renderTabButton(tabs, "stats", "效率统计");

		const body = container.createDiv({ cls: "sk-tab-panel" });
		if (this.activeTab === "board") {
			this.renderBoard(body);
		} else {
			this.renderStats(body);
		}
	}

	private renderTabButton(container: HTMLElement, tab: "board" | "stats", label: string) {
		const button = container.createEl("button", {
			text: label,
			cls: ["sk-tab", this.activeTab === tab ? "sk-tab-active" : ""].join(" ").trim(),
		});
		button.addEventListener("click", () => {
			if (this.activeTab === tab) return;
			this.activeTab = tab;
			this.render();
		});
	}

	private renderBoard(body: HTMLElement) {
		const board = this.plugin.getBoard();

		const header = body.createDiv({ cls: "sk-header" });
		header.createEl("h2", { text: "侧边看板" });
		const addColumnBtn = header.createEl("button", {
			text: "新增栏目",
			cls: "sk-btn",
		});
		addColumnBtn.addEventListener("click", () => {
			new ColumnModal(this.app, {
				title: "新增栏目",
				confirmText: "创建",
				onSubmit: async (value) => {
					await this.plugin.addColumn(value);
				},
			}).open();
		});

		const columnsWrapper = body.createDiv({ cls: "sk-columns" });
		if (!board.columns.length) {
			columnsWrapper.createDiv({ text: "暂无栏目，点击“新增栏目”。", cls: "sk-empty" });
			return;
		}

		for (const column of board.columns) {
			this.renderColumn(columnsWrapper, column);
		}
	}

	private renderStats(body: HTMLElement) {
		const stats = this.buildStatsSnapshot();

		body.createEl("h2", { text: "效率统计", cls: "sk-stats-title" });

		const dashboard = body.createDiv({ cls: "sk-stats-dashboard" });
		this.renderStatCard(dashboard, "总任务", stats.totalTasks.toString(), "累计创建");
		this.renderStatCard(
			dashboard,
			"完成率",
			formatPercent(stats.completionRate),
			`已完成 ${stats.completedTasks}/${stats.totalTasks || 1}`,
		);
		this.renderStatCard(dashboard, "当前进行中", stats.wipCount.toString(), "仍未完成");
		this.renderStatCard(
			dashboard,
			"逾期率",
			stats.deadlineCount ? formatPercent(stats.overdueRate) : "—",
			`${stats.overdueCount}/${stats.deadlineCount || 1} 截止任务`,
		);
		this.renderStatCard(
			dashboard,
			"按时完成率",
			stats.deadlineCount ? formatPercent(stats.onTimeRate) : "—",
			"截止任务按时完成",
		);
		this.renderStatCard(
			dashboard,
			"平均完成周期",
			stats.avgCycleTimeMs ? formatDuration(stats.avgCycleTimeMs) : "—",
			"从创建到完成",
		);

		const chartSection = body.createDiv({ cls: "sk-stats-section" });
		chartSection.createEl("h3", { text: "每日任务趋势（近14天）" });
		this.renderDailyBarChart(chartSection, stats.dailySeries);

		const rateSection = body.createDiv({ cls: "sk-stats-section" });
		rateSection.createEl("h3", { text: "每日完成率（近14天）" });
		this.renderDailyRateChart(rateSection, stats.dailyRates);

		const deadlineSection = body.createDiv({ cls: "sk-stats-section" });
		deadlineSection.createEl("h3", { text: "截止任务概览" });
		this.renderDeadlineBreakdown(deadlineSection, stats);
	}

	private renderColumn(wrapper: HTMLElement, column: KanbanColumn) {
		const columnEl = wrapper.createDiv({ cls: "sk-column" });

		const columnHeader = columnEl.createDiv({ cls: "sk-column-header" });
		const titleEl = columnHeader.createDiv({ cls: "sk-column-title", attr: { role: "button" } });
		titleEl.createEl("h3", { text: column.name });
		titleEl.addEventListener("click", () => {
			new ColumnModal(this.app, {
				title: "编辑栏目",
				initialValue: column.name,
				confirmText: "保存",
				onSubmit: async (value) => {
					await this.plugin.renameColumn(column.id, value);
				},
			}).open();
		});

		const actionsEl = columnHeader.createDiv({ cls: "sk-column-actions" });
		const addBtn = actionsEl.createEl("button", { text: "添加卡片", cls: "sk-btn sk-btn-small" });
		addBtn.addEventListener("click", () => {
			this.plugin.setActiveColumn(column.id);
			new CardModal(this.app, this.plugin, column.id).open();
		});
		const deleteBtn = actionsEl.createEl("button", {
			text: "删除",
			cls: "sk-btn sk-btn-ghost sk-btn-small",
			attr: { "aria-label": "删除栏目" },
		});
		deleteBtn.addEventListener("click", () => {
			new ConfirmModal(this.app, {
				title: "删除栏目",
				message: `确定删除「${column.name}」及其所有卡片？`,
				confirmText: "删除",
				onConfirm: async () => {
					await this.plugin.removeColumn(column.id);
				},
			}).open();
		});

		const cardsContainer = columnEl.createDiv({
			cls: "sk-cards",
			attr: { "data-column": column.id },
		});
		const filterWrapper = actionsEl.createEl("label", { cls: "sk-filter-toggle" });
		const deadlineOnly = this.deadlineFilters.get(column.id) ?? false;
		const filterCheckbox = filterWrapper.createEl("input", { type: "checkbox" }) as HTMLInputElement;
		filterCheckbox.checked = deadlineOnly;
		filterCheckbox.addEventListener("change", () => {
			this.deadlineFilters.set(column.id, filterCheckbox.checked);
			this.render();
		});
		filterWrapper.createSpan({ text: "仅截止" });

		cardsContainer.addEventListener("dragover", (evt) => {
			evt.preventDefault();
			if (evt.dataTransfer) evt.dataTransfer.dropEffect = "move";
			const beforeId = this.getBeforeCardId(cardsContainer, evt.clientY);
			this.movePlaceholder(cardsContainer, beforeId);
		});
		cardsContainer.addEventListener("drop", (evt) => {
			evt.preventDefault();
			const beforeId =
				this.placeholderState?.columnId === column.id
					? this.placeholderState.beforeId
					: this.getBeforeCardId(cardsContainer, evt.clientY);
			void this.handleDrop(column.id, beforeId);
		});

		const cardsToRender = this.getCardsForColumn(column, deadlineOnly);

		if (!cardsToRender.length) {
			const emptyText = deadlineOnly ? "暂无截止任务" : "📝 暂无任务";
			const empty = cardsContainer.createDiv({ text: emptyText, cls: "sk-empty" });
			empty.addEventListener("dragover", (evt) => {
				evt.preventDefault();
				if (evt.dataTransfer) evt.dataTransfer.dropEffect = "move";
				const beforeId = this.getBeforeCardId(cardsContainer, evt.clientY);
				this.movePlaceholder(cardsContainer, beforeId);
			});
			empty.addEventListener("drop", (evt) => {
				evt.preventDefault();
				const beforeId =
					this.placeholderState?.columnId === column.id
						? this.placeholderState.beforeId
						: this.getBeforeCardId(cardsContainer, evt.clientY);
				void this.handleDrop(column.id, beforeId);
			});
			return;
		}

		cardsToRender.forEach((card) => {
			this.renderCard(cardsContainer, column, card);
		});
	}

	private renderCard(container: HTMLElement, column: KanbanColumn, card: KanbanCard) {
		const cardClasses = ["sk-card"];
		if (card.completed) cardClasses.push("sk-card-completed");
		if (card.deadline) cardClasses.push("sk-card-deadline");
		const cardEl = container.createDiv({
			cls: cardClasses.join(" "),
			attr: { draggable: "true", "data-card": card.id },
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
			if (evt.dataTransfer) evt.dataTransfer.dropEffect = "move";
			cardEl.addClass("sk-card-drop");
			const container = cardEl.parentElement as HTMLElement;
			const beforeId = this.getBeforeCardId(container, evt.clientY);
			this.movePlaceholder(container, beforeId);
		});
		cardEl.addEventListener("dragleave", () => {
			cardEl.removeClass("sk-card-drop");
		});

		cardEl.addEventListener("click", (evt) => {
			const target = evt.target as HTMLElement;
			if (target.closest(".sk-history-host")) return;
			this.plugin.setActiveColumn(column.id);
			new CardModal(this.app, this.plugin, column.id, card).open();
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
			this.plugin.setActiveColumn(column.id);
			new CardModal(this.app, this.plugin, column.id, card).open();
		});

		const historyHost = cardEl.createDiv({ cls: "sk-history-host" });
		const historyMarker = historyHost.createDiv({ cls: "sk-history-marker", text: "⏱" });
		const popover = historyHost.createDiv({ cls: "sk-history-popover" });
		const historyEntries = Array.isArray(card.history) ? card.history : [];
		historyEntries.forEach((entry) => {
			popover.createDiv({
				cls: "sk-history-entry",
				text: `${formatDate(entry.timestamp)} · ${entry.remark || "修改"}`,
			});
		});
		if (!historyEntries.length) {
			popover.createDiv({ text: "暂无历史", cls: "sk-history-entry" });
		}
		let hideTimeout: NullableTimeout = null;
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
		meta.createSpan({ text: `创建：${formatDate(card.createdAt)}` });
		meta.createSpan({ text: `更新：${formatDate(card.updatedAt)}` });
		if (card.deadline) {
			meta.createSpan({ text: `截止：${formatDate(card.deadline)}`, cls: "sk-card-deadline-text" });
		}

		return cardEl;
	}

	private async handleDrop(targetColumnId: string, beforeCardId?: string) {
		if (!this.dragState) return;
		const { columnId, cardId } = this.dragState;
		if (targetColumnId === columnId && beforeCardId === cardId) {
			this.resetDragState();
			return;
		}
		await this.plugin.moveCard(cardId, columnId, targetColumnId, beforeCardId);
		this.resetDragState();
	}

	private getBeforeCardId(container: HTMLElement, clientY: number): string | undefined {
		const cards = Array.from(container.querySelectorAll<HTMLElement>(".sk-card"));
		for (const card of cards) {
			const rect = card.getBoundingClientRect();
			const midpoint = rect.top + rect.height / 2;
			if (clientY < midpoint) {
				const id = card.dataset.cardId;
				return id || undefined;
			}
		}
		return undefined;
	}

	private getCardsForColumn(column: KanbanColumn, deadlineOnly: boolean): KanbanCard[] {
		if (!deadlineOnly) {
			return column.cards;
		}
		return column.cards
			.filter((card) => !!card.deadline)
			.slice()
			.sort((a, b) => {
				const aTime = a.deadline ?? 0;
				const bTime = b.deadline ?? 0;
				return aTime - bTime;
			});
	}

	private ensurePlaceholder(): HTMLElement {
		if (!this.placeholderEl) {
			this.placeholderEl = document.createElement("div");
			this.placeholderEl.addClass("sk-card-placeholder");
		}
		return this.placeholderEl;
	}

	private movePlaceholder(container: HTMLElement, beforeId?: string) {
		if (!this.dragState) return;
		const columnId = container.getAttribute("data-column");
		if (!columnId) return;
		const placeholder = this.ensurePlaceholder();
		const desiredHeight = Math.max(this.dragState.cardHeight || 0, 48);
		placeholder.style.height = `${desiredHeight}px`;
		if (placeholder.parentElement !== container) {
			this.restorePlaceholderParent();
			container.addClass("sk-cards-placeholder");
		}
		const reference = beforeId
			? container.querySelector<HTMLElement>(`.sk-card[data-card-id="${beforeId}"]`)
			: null;
		if (reference) {
			container.insertBefore(placeholder, reference);
		} else {
			container.appendChild(placeholder);
		}
		this.setEmptyMessageVisible(container, false);
		this.placeholderState = { columnId, beforeId };
	}

	private restorePlaceholderParent() {
		if (this.placeholderEl?.parentElement) {
			const parent = this.placeholderEl.parentElement as HTMLElement;
			parent.removeClass("sk-cards-placeholder");
			this.placeholderEl.remove();
			this.setEmptyMessageVisible(parent, true);
		}
	}

	private removePlaceholder() {
		this.restorePlaceholderParent();
		this.placeholderEl = undefined;
		this.placeholderState = undefined;
	}

	private setEmptyMessageVisible(container: HTMLElement, visible: boolean) {
		const emptyEl = container.querySelector<HTMLElement>(".sk-empty");
		if (emptyEl) {
			emptyEl.style.display = visible ? "" : "none";
		}
	}

	private resetDragState() {
		this.dragState = undefined;
		this.placeholderState = undefined;
		this.removePlaceholder();
		this.contentEl.querySelectorAll(".sk-card-drop").forEach((el) => (el as HTMLElement).removeClass("sk-card-drop"));
	}

	private renderStatCard(container: HTMLElement, title: string, value: string, description: string) {
		const card = container.createDiv({ cls: "sk-stat-card" });
		card.createEl("div", { text: title, cls: "sk-stat-card-title" });
		card.createEl("div", { text: value, cls: "sk-stat-card-value" });
		card.createEl("div", { text: description, cls: "sk-stat-card-desc" });
	}

	private renderDailyBarChart(container: HTMLElement, series: DailyStatsPoint[]) {
		const chart = container.createDiv({ cls: "sk-chart sk-chart-bars" });
		const maxValue = Math.max(
			1,
			...series.map((point) => Math.max(point.created, point.completed)),
		);

		series.forEach((point) => {
			const column = chart.createDiv({ cls: "sk-chart-col" });
			const bars = column.createDiv({ cls: "sk-chart-col-bars" });
			bars.createDiv({
				cls: "sk-chart-bar sk-chart-bar-created",
				attr: { style: `height:${(point.created / maxValue) * 100}%` },
			});
			bars.createDiv({
				cls: "sk-chart-bar sk-chart-bar-completed",
				attr: { style: `height:${(point.completed / maxValue) * 100}%` },
			});
			column.createDiv({ cls: "sk-chart-label", text: point.date.slice(5) });
		});

		const legend = container.createDiv({ cls: "sk-chart-legend" });
		this.renderLegendItem(legend, "新建", "var(--color-cyan, #4ecdc4)");
		this.renderLegendItem(legend, "完成", "var(--interactive-accent)");
	}

	private renderLegendItem(container: HTMLElement, label: string, color: string) {
		const item = container.createDiv({ cls: "sk-legend-item" });
		const dot = item.createDiv({ cls: "sk-legend-dot" });
		(dot as HTMLDivElement).style.background = color;
		item.createSpan({ text: label });
	}

	private renderDailyRateChart(container: HTMLElement, series: DailyRatePoint[]) {
		const chartWrapper = container.createDiv({ cls: "sk-chart sk-chart-line" });
		const width = Math.max(series.length - 1, 1) * 40;
		const height = 160;
		const svg = chartWrapper.createEl("svg", {
			attr: { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none" },
		});
		const points = series
			.map((point, index) => {
				const x = (index / Math.max(series.length - 1, 1)) * width;
				const y = height - (Math.min(point.rate, 100) / 100) * height;
				return `${x},${y}`;
			})
			.join(" ");
		svg.createEl("polyline", {
			attr: {
				points,
				fill: "none",
				stroke: "var(--interactive-accent)",
				"stroke-width": "3",
			},
		});
		series.forEach((point, index) => {
			const dotX = (index / Math.max(series.length - 1, 1)) * width;
			const dotY = height - (Math.min(point.rate, 100) / 100) * height;
			svg.createEl("circle", {
				attr: {
					cx: dotX,
					cy: dotY,
					r: 3,
					fill: "var(--interactive-accent)",
				},
			});
		});

		const labels = chartWrapper.createDiv({ cls: "sk-chart-label-row" }) as HTMLDivElement;
		labels.style.gridTemplateColumns = `repeat(${Math.max(series.length, 1)}, minmax(0, 1fr))`;
		series.forEach((point) => {
			labels.createDiv({ cls: "sk-chart-label", text: point.date.slice(5) });
		});
	}

	private renderDeadlineBreakdown(container: HTMLElement, stats: StatsSnapshot) {
		if (!stats.deadlineCount) {
			container.createDiv({ cls: "sk-empty", text: "暂无设置截止时间的任务" });
			return;
		}
		const info = container.createDiv({ cls: "sk-deadline-info" });
		info.createDiv({ text: `有截止任务：${stats.deadlineCount}`, cls: "sk-deadline-line" });
		info.createDiv({
			text: `截止覆盖率：${formatPercent(stats.deadlineCoverage)}`,
			cls: "sk-deadline-line",
		});

		const progress = container.createDiv({ cls: "sk-progress" });
		progress.createDiv({
			cls: "sk-progress-on-time",
			attr: { style: `width:${formatPercentValue(stats.onTimeRate)}%` },
		});
		progress.createDiv({
			cls: "sk-progress-overdue",
			attr: { style: `width:${formatPercentValue(stats.overdueRate)}%` },
		});

		const legend = container.createDiv({ cls: "sk-progress-legend" });
		this.renderLegendItem(legend, "按时完成", "var(--color-green, #4caf50)");
		this.renderLegendItem(legend, "已/将逾期", "var(--color-red, #ff6b6b)");
	}

	private buildStatsSnapshot(): StatsSnapshot {
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
			if (!card.deadline) return false;
			if (card.completed) {
				const doneAt = card.completedAt ?? card.updatedAt;
				return !!doneAt && doneAt > card.deadline;
			}
			return now > card.deadline;
		}).length;
		const onTimeCount = deadlineCards.filter((card) => {
			if (!card.deadline || !card.completed) return false;
			const doneAt = card.completedAt ?? card.updatedAt;
			return !!doneAt && doneAt <= card.deadline;
		}).length;
		const avgCycleTimeMs = (() => {
			const finished = completedCards.filter((card) => card.completedAt);
			if (!finished.length) return null;
			const total = finished.reduce(
				(sum, card) => sum + Math.max(0, (card.completedAt! - card.createdAt)),
				0,
			);
			return total / finished.length;
		})();

		const dailyCreated = this.buildDailySeries(cards, "created");
		const dailyCompleted = this.buildDailySeries(cards, "completed");
		const dailySeries: DailyStatsPoint[] = dailyCreated.map((point, index) => ({
			date: point.date,
			created: point.value,
			completed: dailyCompleted[index]?.value ?? 0,
		}));
		const dailyRates: DailyRatePoint[] = dailySeries.map((point) => ({
			date: point.date,
			rate: point.created ? Math.min(100, (point.completed / point.created) * 100) : 0,
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
			dailyRates,
		};
	}

	private buildDailySeries(cards: KanbanCard[], kind: "created" | "completed", days = 14) {
		const msPerDay = 24 * 60 * 60 * 1000;
		const today = this.startOfDay(Date.now());
		const start = today - (days - 1) * msPerDay;
		const buckets = new Map<string, number>();

		for (const card of cards) {
			const timestamp =
				kind === "created"
					? card.createdAt
					: card.completedAt ?? (card.completed ? card.updatedAt : null);
			if (!timestamp) continue;
			const key = this.toDayKey(timestamp);
			buckets.set(key, (buckets.get(key) ?? 0) + 1);
		}

		const series: DailyCountPoint[] = [];
		for (let i = 0; i < days; i++) {
			const dayTs = start + i * msPerDay;
			const key = this.toDayKey(dayTs);
			series.push({ date: key, value: buckets.get(key) ?? 0 });
		}
		return series;
	}

	private toDayKey(timestamp: number): string {
		const date = new Date(timestamp);
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}

	private startOfDay(timestamp: number): number {
		const date = new Date(timestamp);
		date.setHours(0, 0, 0, 0);
		return date.getTime();
	}
}

class CardModal extends Modal {
	private titleValue = "";
	private tagsValue = "";
	private remarkValue = "";
	private historyNote = "";
	private deadlineValue = "";
	private submitting = false;
	private keyHandler = (evt: KeyboardEvent) => {
		if (
			evt.key === "Enter" &&
			!evt.shiftKey &&
			!evt.metaKey &&
			!evt.ctrlKey &&
			!evt.altKey &&
			!evt.isComposing
		) {
			evt.preventDefault();
			void this.handleSubmit();
		}
	};

	constructor(
		app: App,
		private plugin: SimpleKanbanPlugin,
		private columnId: string,
		private card?: KanbanCard,
	) {
		super(app);
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

			createDateTimeField(contentEl, "截止时间", this.deadlineValue, (value) => {
				this.deadlineValue = value;
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
		submitBtn.addEventListener("click", () => void this.handleSubmit());
	}

	onClose() {
		this.contentEl.removeEventListener("keydown", this.keyHandler);
		super.onClose();
	}

	async handleSubmit() {
		if (this.submitting) return;
		if (!this.titleValue.trim()) {
			new Notice("标题不能为空");
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
					this.historyNote.trim() || "内容更新",
				);
			} else {
				await this.plugin.addCard(this.columnId, {
					title: this.titleValue,
					tags,
					remark,
					historyNote: this.historyNote.trim() || "创建",
					deadline,
				});
			}
			this.close();
		} finally {
			this.submitting = false;
		}
	}
}

interface ColumnModalOptions {
	title: string;
	initialValue?: string;
	confirmText?: string;
	onSubmit: (value: string) => Promise<void>;
}

class ColumnModal extends Modal {
	private value: string;

	constructor(app: App, private options: ColumnModalOptions) {
		super(app);
		this.value = options.initialValue ?? "";
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("sk-modal");
		contentEl.createEl("h2", { text: this.options.title });

		createTextField(contentEl, "栏目名称", this.value, (value) => (this.value = value));

		const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
		const cancelBtn = footer.createEl("button", { text: "取消", cls: "sk-btn sk-btn-ghost" });
		cancelBtn.addEventListener("click", () => this.close());

		const confirmBtn = footer.createEl("button", {
			text: this.options.confirmText || "确认",
			cls: "sk-btn",
		});
		confirmBtn.addEventListener("click", async () => {
			await this.options.onSubmit(this.value);
			this.close();
		});
	}
}

interface ConfirmModalOptions {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void | Promise<void>;
}

class ConfirmModal extends Modal {
	constructor(app: App, private options: ConfirmModalOptions) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("sk-modal");
		contentEl.createEl("h2", { text: this.options.title });
		contentEl.createDiv({ text: this.options.message, cls: "sk-confirm-text" });

		const footer = contentEl.createDiv({ cls: "sk-modal-footer" });
		const cancelBtn = footer.createEl("button", {
			text: this.options.cancelText || "取消",
			cls: "sk-btn sk-btn-ghost",
		});
		cancelBtn.addEventListener("click", () => this.close());

		const confirmBtn = footer.createEl("button", {
			text: this.options.confirmText || "确认",
			cls: "sk-btn",
		});
		confirmBtn.addEventListener("click", async () => {
			await this.options.onConfirm();
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

function parseDateTimeInput(value: string): number | null {
	if (!value.trim()) return null;
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? null : parsed;
}

function formatDateTimeInput(value?: number | null): string {
	if (!value) return "";
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

function formatDate(timestamp: number): string {
	const date = new Date(timestamp);
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	return `${y}-${m}-${d} ${hh}:${mm}`;
}

function formatPercent(value: number, digits = 0): string {
	if (!Number.isFinite(value)) return "0%";
	return `${(Math.max(0, value) * 100).toFixed(digits)}%`;
}

function formatPercentValue(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(100, value * 100));
}

function formatDuration(ms: number): string {
	const minutes = Math.floor(ms / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	if (days > 0) {
		const remHours = hours % 24;
		return remHours ? `${days}天${remHours}小时` : `${days}天`;
	}
	if (hours > 0) {
		const remMinutes = minutes % 60;
		return remMinutes ? `${hours}小时${remMinutes}分` : `${hours}小时`;
	}
	return `${Math.max(minutes, 1)}分`;
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

function createDateTimeField(
	container: HTMLElement,
	label: string,
	value: string,
	onChange: (value: string) => void,
) {
	const wrapper = container.createDiv({ cls: "sk-field" });
	wrapper.createEl("label", { text: label });
	const input = wrapper.createEl("input", { type: "datetime-local" });
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
