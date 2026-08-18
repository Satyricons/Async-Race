// pages/AboutPage.js
import Component from '../core/Component.js';
import { store } from '../core/Store.js';

export default class AboutPage extends Component {
    constructor(props) {
        super(props);
        
        // Подписываемся на counter из store
        this.mapStoreToState = () => ({
            counter: 'globalCounter',   // store.counter -> this.state.globalCounter
            lastVisited: 'last'
        });
        
        this.connectStore(store);
        
        // Локальное состояние
        this.state = {
            ...this.state,
            message: 'Мы используем глобальный store!'
        };
    }

    // Обработчик для увеличения счетчика прямо со страницы "О нас"
    handleIncrement = () => {
        const currentCount = this.state.globalCounter || 0;
        // Обновляем через setState, который синхронизируется с store
        this.setState({ globalCounter: currentCount + 1 });
    }

    afterRender() {
        const btn = this.element.querySelector('#about-increment-btn');
        if (btn) {
            btn.addEventListener('click', this.handleIncrement);
        }
        
        console.log('📖 AboutPage отрендерена, счетчик:', this.state.globalCounter);
    }

    render() {
        return `
            <section class="page">
                <h1>📖 О нас</h1>
                
                <div class="counter-box" style="border-left-color: #764ba2;">
                    <p style="font-size: 18px;">
                        Глобальный счетчик: <strong>${this.state.globalCounter}</strong>
                    </p>
                    <p style="font-size: 14px; color: #666;">
                        Последний визит: ${this.state.last || 'неизвестно'}
                    </p>
                    <p style="font-size: 14px; color: #888; margin-top: 10px;">
                        ${this.state.message}
                    </p>
                    <button id="about-increment-btn" style="margin-top: 15px; background: #764ba2;">
                        ➕ Увеличить со страницы "О нас"
                    </button>
                </div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px;">
                    <a href="#/" class="page-link">🏠 На главную</a>
                    <a href="#/user/123" class="page-link">👤 Профиль</a>
                </div>
            </section>
        `;
    }
}