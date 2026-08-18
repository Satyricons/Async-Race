// core/Router.js
export default class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentComponent = null;
        this.currentPath = window.location.hash.substring(1) || '/';

        // Слушаем изменение хеша
        window.addEventListener('hashchange', () => this.handleRoute());
        // Обрабатываем первый заход
        window.addEventListener('load', () => this.handleRoute());
        // Обрабатываем нажатие кнопки "Назад/Вперед"
        window.addEventListener('popstate', () => this.handleRoute());
    }

    handleRoute() {
        // Получаем путь из хеша
        let path = window.location.hash.substring(1) || '/';
        this.currentPath = path;
        
        let ComponentClass = null;
        let params = {};

        // Ищем подходящий маршрут
        for (const [routePath, handler] of Object.entries(this.routes)) {
            const routeSegments = routePath.split('/').filter(Boolean);
            const pathSegments = path.split('/').filter(Boolean);

            // Проверяем на совпадение по длине
            if (routeSegments.length === pathSegments.length) {
                let match = true;
                const localParams = {};
                
                for (let i = 0; i < routeSegments.length; i++) {
                    if (routeSegments[i].startsWith(':')) {
                        // Это динамический параметр (например, :id)
                        const paramName = routeSegments[i].slice(1);
                        localParams[paramName] = pathSegments[i] || '';
                    } else if (routeSegments[i] !== pathSegments[i]) {
                        match = false;
                        break;
                    }
                }
                
                if (match) {
                    ComponentClass = handler;
                    params = localParams;
                    break;
                }
            }
        }

        // Если ничего не найдено - 404
        if (!ComponentClass) {
            console.warn(`Маршрут ${path} не найден, показываем 404`);
            ComponentClass = this.routes['/404'] || this.routes['/'] || null;
        }

        if (ComponentClass) {
            // Уничтожаем текущий компонент
            if (this.currentComponent && this.currentComponent.beforeDestroy) {
                this.currentComponent.beforeDestroy();
            }
            
            // Создаем новый компонент
            this.currentComponent = new ComponentClass(params);
            this.currentComponent.mount('#app');
            
            // Обновляем заголовок страницы
            document.title = this.getPageTitle(path);
        } else {
            console.error('Нет компонента для отображения');
        }
    }

    // Вспомогательный метод для навигации
    navigate(path) {
        window.location.hash = path;
    }

    // Получение заголовка страницы
    getPageTitle(path) {
        const titles = {
            '/': 'Главная',
            '/about': 'О нас',
        };
        
        if (path.startsWith('/user/')) {
            const id = path.split('/')[2];
            return `Профиль пользователя ${id}`;
        }
        
        return titles[path] || 'SPA приложение';
    }

    // Получить текущий путь
    getCurrentPath() {
        return this.currentPath;
    }
}