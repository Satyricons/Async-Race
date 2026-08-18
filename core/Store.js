// core/Store.js
export default class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = {}; // { key: [callback1, callback2, ...] }
    }

    // Получить значение по ключу
    get(key) {
        return this.state[key];
    }

    // Получить всё состояние
    getAll() {
        return { ...this.state };
    }

    // Установить значение и уведомить подписчиков
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        this.notify(key, value, oldValue);
    }

    // Обновить несколько полей сразу
    setMultiple(updates) {
        const changedKeys = [];
        Object.keys(updates).forEach(key => {
            const oldValue = this.state[key];
            this.state[key] = updates[key];
            changedKeys.push({ key, value: updates[key], oldValue });
        });
        
        // Уведомляем о всех изменениях
        changedKeys.forEach(({ key, value, oldValue }) => {
            this.notify(key, value, oldValue);
        });
    }

    // Подписаться на изменения конкретного ключа
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
        
        // Возвращаем функцию для отписки
        return () => {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        };
    }

    // Уведомить подписчиков конкретного ключа
    notify(key, value, oldValue) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => {
                callback(value, oldValue);
            });
        }
    }

    // Уведомить всех подписчиков
    notifyAll() {
        Object.keys(this.listeners).forEach(key => {
            this.listeners[key].forEach(callback => {
                callback(this.state[key], undefined);
            });
        });
    }

    // Очистить состояние
    clear() {
        this.state = {};
        Object.keys(this.listeners).forEach(key => {
            this.notify(key, undefined, undefined);
        });
    }
}

// Создаем и экспортируем единственный экземпляр (Singleton)
export const store = new Store({
    counter: 0,
    user: null,
    lastVisited: null,
});