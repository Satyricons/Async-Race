// main.js
import Router from './core/Router.js';
import HomePage from './pages/HomePage.js';
import AboutPage from './pages/AboutPage.js';
import UserPage from './pages/UserPage.js';
import { store } from './core/Store.js';

// Делаем store доступным глобально для отладки и кнопки сброса
window.__store = store;

// Определяем маршруты
const routes = {
    '/': HomePage,
    '/about': AboutPage,
    '/user/:id': UserPage,
    // Если не найден роут, показываем главную
    '/404': HomePage,
};

// Инициализируем роутер
const router = new Router(routes);
window.__router = router;

// Для удобства навигации из консоли
window.navigate = (path) => router.navigate(path);

// Выводим информацию в консоль
console.log('🚀 SPA с Global Store запущено!');
console.log('📦 Глобальный store:', store.getAll());
console.log('💡 Используйте window.__store для доступа к store');
console.log('💡 Используйте window.navigate("/path") для навигации');
console.log('💡 Или просто кликайте по ссылкам в навигации');

// Слушаем изменения store для отладки
store.subscribe('counter', (newValue, oldValue) => {
    console.log(`📊 Счетчик изменен: ${oldValue} -> ${newValue}`);
});

// Добавляем горячие клавиши для демонстрации
document.addEventListener('keydown', (e) => {
    // Нажатие "C" - увеличить счетчик
    if (e.key === 'c' || e.key === 'C') {
        const current = store.get('counter') || 0;
        store.set('counter', current + 1);
        console.log('⌨️ Счетчик увеличен горячей клавишей C');
    }
    // Нажатие "R" - сбросить счетчик
    if (e.key === 'r' || e.key === 'R') {
        store.set('counter', 0);
        console.log('⌨️ Счетчик сброшен горячей клавишей R');
    }
});

console.log('⌨️ Горячие клавиши: C - увеличить, R - сбросить');