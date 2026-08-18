// pages/HomePage.js
import Component from '../core/Component.js';
import { store } from '../core/Store.js';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        
        // Маппинг: ключ в store -> ключ в локальном state
        this.mapStoreToState = () => ({
            counter: 'count',      // store.counter -> this.state.count
            lastVisited: 'last'    // store.lastVisited -> this.state.last
        });
        
        // Подключаемся к store
        this.connectStore(store);
        
        // Добавляем локальное состояние
        this.state = {
            ...this.state,
            localMessage: 'Добро пожаловать!',
            clickCount: 0
        };
        
        // Обновляем lastVisited при создании
        store.set('lastVisited', new Date().toLocaleTimeString());
    }

    // Обработчик клика на кнопку
    handleIncrement = () => {
        const currentCount = this.state.count || 0;
        this.setState({ 
            count: currentCount + 1,
            clickCount: (this.state.clickCount || 0) + 1
        });
    }

    // Обработчик для сброса
    handleReset = (e) => {
        e.stopPropagation();
        this.setState({ count: 0 });
    }

    // Хук после рендеринга: вешаем обработчики
    afterRender() {
        const incrementBtn = this.element.querySelector('#increment-btn');
        if (incrementBtn) {
            incrementBtn.addEventListener('click', this.handleIncrement);
        }
        
        const resetBtn = this.element.querySelector('#reset-local-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.handleReset);
        }
        
        // Показываем в консоли для отладки
        console.log('🏠 HomePage отрендерена, счетчик:', this.state.count);
    }

    // Хук после обновления состояния
    afterStateUpdate(oldState, newState) {
        if (oldState.count !== newState.count) {
            console.log(`🔄 Счетчик изменен: ${oldState.count} -> ${newState.count}`);
        }
    }

    render() {
        const isEven = this.state.count % 2 === 0;
        
        return `
            <section class="page">
                <h1>🏠 Главная страница</h1>
                
                <div class="counter-box">
                    <p style="font-size: 18px; font-weight: 500;">
                        Счетчик: <strong>${this.state.count}</strong>
                        ${isEven ? '✅' : '❌'}
                        <span style="font-size: 14px; color: #888;">
                            (${isEven ? 'четное' : 'нечетное'})
                        </span>
                    </p>
                    
                    <p style="color: #666;">
                        Локальный клик #${this.state.clickCount || 0}
                    </p>
                    
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                        <button id="increment-btn">➕ Увеличить</button>
                        <button id="reset-local-btn" style="background: #ff6b6b;">
                            🔄 Сбросить
                        </button>
                    </div>
                </div>
                
                <div class="info-text">
                    💡 Счетчик сохраняется между переходами на другие страницы!
                    <br>
                    Последний визит: ${this.state.last || 'неизвестно'}
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <a href="#/about" class="page-link">📖 О нас</a>
                    <a href="#/user/123" class="page-link">👤 Профиль</a>
                </div>
            </section>
        `;
    }
}