// eventManager.ts
export class EventManager {
	private listeners: Map<string, Set<() => void>> = new Map();

	addEventListener(event: string, callback: () => void): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(callback);
	}

	removeEventListener(event: string, callback: () => void): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.delete(callback);
			if (callbacks.size === 0) {
				this.listeners.delete(event);
			}
		}
	}

	dispatch(event: string): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			for (const cb of callbacks) {
				try {
					cb();
				} catch (e) {
					console.error(`Erreur pendant l'exécution de '${event}' :`, e);
				}
			}
		}
	}

	dispatch_all(): void {
		for (const [event, callbacks] of this.listeners.entries()) {
			for (const cb of callbacks) {
				try {
					cb();
				} catch (e) {
					console.error(`Erreur pendant l'exécution de '${event}' :`, e);
				}
			}
		}
	}
}
