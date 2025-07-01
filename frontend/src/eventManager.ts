export class EventManager {
	private listeners: Set<() => void> = new Set();

	addEventListener(callback: () => void): void {
		this.listeners.add(callback);
	}

	removeEventListener(callback: () => void): void {
		this.listeners.delete(callback);
	}

	dispatch(): void {
        // console.log("Dispatching events to", this.listeners.size, "listeners");
		for (const cb of this.listeners) {
			try {
				cb();
			} catch (e) {
				console.error("Erreur :", e);
			}
		}
	}
}
