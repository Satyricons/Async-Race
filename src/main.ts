// src/main.ts
import { getCars } from './api/garageApi';

async function init() {
  console.log('🏁 Приложение Async Race запущено!');

  try {
    const { cars, total } = await getCars();
    console.log(`📦 Получено машин: ${total}`);
    console.log('🚗 Первые 7 машин:', cars);
    
    // Просто выведем имена машин на страницу для проверки
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `<h1>Гараж (${total} машин)</h1>` +
        cars.map(car => `<p>🚘 ${car.name} (${car.color})</p>`).join('');
    }
  } catch (error) {
    console.error('Ошибка при загрузке машин:', error);
  }
}

init();