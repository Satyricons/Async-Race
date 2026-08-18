// pages/UserPage.js
import Component from '../core/Component.js';
import { store } from '../core/Store.js';

export default class UserPage extends Component {
    constructor(props) {
        super(props);
        
        // Подписываемся на счетчик
        this.mapStoreToState = () => ({
            counter: 'globalCounter',   // store.counter -> this.state.globalCounter
            lastVisited: 'last'
        });
        
        this.connectStore(store);
        
        // Локальное состояние
        this.state = {
            ...this.state,
            userMessage: 'Добро пожаловать в профиль!'
        };
        
        // Обновляем информацию о пользователе в store
        store.set('user', {
            id: this.props.id,
            name: `User ${this.props.id}`,
            visitedAt: new Date().toISOString()
        });
    }

    // Обработчик для увеличения счетчика
    handleIncrement = () => {
        const currentCount = this.state.globalCounter || 0;
        this.setState({ globalCounter: currentCount + 1 });
    }

    afterRender() {
        const btn = this.element.querySelector('#user-increment-btn');
        if (btn) {
            btn.addEventListener('click', this.handleIncrement);
        }
        
        console.log(`👤 UserPage отрендерена, ID: ${this.props.id}`);
    }

    render() {
        const userId = this.props.id || 'неизвестен';
        const userData = store.get('user');
        
        return `
            <section class="page">
                <h1>👤 Профиль пользователя</h1>
                
                <div style="background: #f8f0ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #764ba2;">
                    <p style="font-size: 20px;">
                        ID: <span class="user-id">${userId}</span>
                    </p>
                    ${userData ? `<p>Имя: <strong>${userData.name}</strong></p>` : ''}
                    <p style="font-size: 14px; color: #888;">
                        ${this.state.userMessage}
                    </p>
                </div>
                
                <div class="counter-box" style="border-left-color: #764ba2;">
                    <p>Глобальный счетчик: <strong>${this.state.globalCounter}</strong></p>
                    <p style="font-size: 14px; color: #888;">
                        Последний визит на сайт: ${this.state.last || 'неизвестно'}
                    </p>
                    <button id="user-increment-btn" style="background: #764ba2;">
                        ➕ Увеличить счетчик
                    </button>
                </div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px;">
                    <a href="#/" class="page-link">🏠 На главную</a>
                    <a href="#/about" class="page-link">📖 О нас</a>
                </div>
            </section>
        `;
    }
}