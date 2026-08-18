// core/Component.js
export default class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.element = null;
        this.unsubscribers = [];
        this.store = null;
    }

    // Подключение к глобальному store
    connectStore(store) {
        this.store = store;
        
        // Если компонент определяет mapStoreToState
        if (this.mapStoreToState) {
            const mapping = this.mapStoreToState();
            
            Object.keys(mapping).forEach(storeKey => {
                const stateKey = mapping[storeKey];
                
                // Инициализируем локальное состояние из store
                this.state[stateKey] = this.store.get(storeKey);
                
                // Подписываемся на обновления store
                const unsubscribe = this.store.subscribe(storeKey, (newValue) => {
                    this.state[stateKey] = newValue;
                    this.update(); // Автоматическая перерисовка
                });
                
                this.unsubscribers.push(unsubscribe);
            });
        }
    }

    // Обновление состояния
    setState(newState) {
        // Если есть store, синхронизируем изменения с глобальным состоянием
        if (this.store && this.mapStoreToState) {
            const mapping = this.mapStoreToState();
            const storeUpdates = {};
            
            Object.keys(mapping).forEach(storeKey => {
                const stateKey = mapping[storeKey];
                if (newState[stateKey] !== undefined) {
                    storeUpdates[storeKey] = newState[stateKey];
                }
            });
            
            // Обновляем глобальный store
            if (Object.keys(storeUpdates).length > 0) {
                this.store.setMultiple(storeUpdates);
            }
        }
        
        // Обновляем локальное состояние
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Перерисовываем компонент
        this.update();
        
        // Вызываем хук после обновления
        this.afterStateUpdate(oldState, this.state);
    }

    // Хук жизненного цикла: вызывается после обновления состояния
    afterStateUpdate(oldState, newState) {
        // Можно переопределить в наследниках
    }

    // Рендеринг компонента (должен быть переопределен)
    render() {
        throw new Error('Метод render должен быть реализован');
    }

    // Обновление DOM
    update() {
        if (this.element) {
            // Сохраняем текущий HTML
            const currentHtml = this.element.innerHTML;
            const newHtml = this.render();
            
            // Обновляем только если изменился HTML
            if (currentHtml !== newHtml) {
                this.element.innerHTML = newHtml;
                this.afterRender();
            }
        }
    }

    // Хук жизненного цикла: вызывается после рендеринга
    afterRender() {
        // Можно переопределить для добавления обработчиков
    }

    // Хук жизненного цикла: вызывается перед удалением компонента
    beforeDestroy() {
        // Отписываемся от store
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
        this.unsubscribers = [];
    }

    // Монтирование компонента в DOM
    mount(parentSelector = '#app') {
        const parent = document.querySelector(parentSelector);
        if (!parent) {
            console.error(`Родительский элемент ${parentSelector} не найден`);
            return;
        }

        // Очищаем предыдущий компонент
        if (this.element) {
            this.beforeDestroy();
        }

        // Создаем и вставляем компонент
        this.element = document.createElement('div');
        this.element.innerHTML = this.render();
        
        // Извлекаем первый дочерний элемент (чтобы избежать лишней обертки)
        const child = this.element.firstElementChild;
        if (child) {
            parent.innerHTML = '';
            parent.appendChild(child);
            this.element = child;
        } else {
            // Если компонент возвращает несколько элементов, используем обертку
            parent.innerHTML = '';
            parent.appendChild(this.element);
        }
        
        // Вызываем хук после монтирования
        this.afterRender();
    }
}