// src/main.ts
import { getCars, createCar, deleteCar, updateCar, generateCars } from './api/garageApi';
import { startEngine, stopEngine, switchToDrive } from './api/engineApi';
import { RaceAnimation } from './animation/raceAnimation';
import type { Car } from './types';

let currentCars: Car[] = [];
let totalCars = 0;
const pageSize = 7;
let currentPage = 1;

// Создаём экземпляр анимации
const raceAnimation = new RaceAnimation(600);

// Обновляем ширину трека при ресайзе
window.addEventListener('resize', () => {
  const track = document.querySelector('.race-track');
  if (track) {
    const width = track.clientWidth - 40;
    if (width > 50) {
      raceAnimation.setTrackWidth(width);
    }
  }
});

// ===== ИНИЦИАЛИЗАЦИЯ =====
async function init() {
  const app = document.getElementById('app');
  if (!app) return;

  renderApp(app);
  await loadCars(currentPage);
}

// ===== РЕНДЕР ИНТЕРФЕЙСА =====
function renderApp(container: HTMLElement) {
  container.innerHTML = `
    <div class="container">
      <header class="app-header">
        <h1>🏎️ Garage</h1>
        <span class="stats">Total cars: <span id="total-cars">0</span></span>
      </header>

      <nav class="nav">
        <button class="active" data-view="garage">Garage</button>
        <button data-view="winners">Winners</button>
      </nav>

      <div class="car-form">
        <h3>Create Car</h3>
        <input type="text" id="car-name" placeholder="Car name" />
        <input type="color" id="car-color" value="#007bff" />
        <button class="btn btn-primary" id="create-car-btn">Create</button>
        <button class="btn btn-secondary" id="cancel-edit-btn" style="display:none;">Cancel</button>
        <button class="btn btn-success" id="generate-cars-btn">🚀 Generate 100</button>
      </div>

      <div id="car-list" class="car-list"></div>

      <div class="pagination">
        <button id="prev-page" disabled>◀ Previous</button>
        <span class="page-info" id="page-info">Page 1</span>
        <button id="next-page">Next ▶</button>
      </div>
    </div>
  `;

  setupEventListeners();
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ =====
function setupEventListeners() {
  const createBtn = document.getElementById('create-car-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const nameInput = document.getElementById('car-name') as HTMLInputElement;
  const colorInput = document.getElementById('car-color') as HTMLInputElement;

  // Создание / Обновление
  createBtn?.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const color = colorInput.value;
    
    if (!name) {
      alert('Please enter a car name');
      return;
    }

    try {
      const editId = createBtn.dataset.editId;
      if (editId) {
        await updateCar(Number(editId), name, color);
        delete createBtn.dataset.editId;
        createBtn.textContent = 'Create';
        if (cancelBtn) cancelBtn.style.display = 'none';
      } else {
        await createCar(name, color);
      }
      
      nameInput.value = '';
      await loadCars(currentPage);
    } catch (error) {
      console.error('Error saving car:', error);
      alert('Failed to save car');
    }
  });

  // Отмена редактирования
  cancelBtn?.addEventListener('click', () => {
    const createBtn = document.getElementById('create-car-btn');
    if (createBtn) {
      delete createBtn.dataset.editId;
      createBtn.textContent = 'Create';
    }
    nameInput.value = '';
    colorInput.value = '#007bff';
    cancelBtn.style.display = 'none';
  });

  // Пагинация
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadCars(currentPage);
    }
  });

  document.getElementById('next-page')?.addEventListener('click', () => {
    if (currentPage * pageSize < totalCars) {
      currentPage++;
      loadCars(currentPage);
    }
  });

  // Генерация 100 машин
  document.getElementById('generate-cars-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('generate-cars-btn') as HTMLButtonElement;
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = '⏳ Generating...';
    
    try {
      const createdCars = await generateCars(100);
      console.log(`✅ Generated ${createdCars.length} cars`);
      
      currentPage = 1;
      await loadCars(currentPage);
      
      alert(`Successfully generated ${createdCars.length} cars!`);
    } catch (error) {
      console.error('Error generating cars:', error);
      alert('Failed to generate cars. Check console for details.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // Переключение между Garage и Winners
  document.querySelectorAll('.nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      if (view === 'winners') {
        alert('Winners view coming soon!');
      }
    });
  });
}

// ===== ЗАГРУЗКА МАШИН =====
async function loadCars(page: number) {
  try {
    const { cars, total } = await getCars(page, pageSize);
    currentCars = cars;
    totalCars = total;

    renderCarList(cars);
    updatePagination(page, total);
    updateStats(total);
  } catch (error) {
    console.error('Error loading cars:', error);
  }
}

// ===== РЕНДЕР СПИСКА МАШИН =====
function renderCarList(cars: Car[]) {
  const listContainer = document.getElementById('car-list');
  if (!listContainer) return;

  if (cars.length === 0) {
    listContainer.innerHTML = '<p class="empty">No cars in garage. Create one!</p>';
    return;
  }

  listContainer.innerHTML = `
    <div class="car-grid">
      ${cars.map(car => `
        <div class="car-card" data-id="${car.id}">
          <div class="car-info">
            <span class="car-color" style="background-color: ${car.color}"></span>
            <span class="car-name">${car.name}</span>
            <span class="car-id">#${car.id}</span>
          </div>
          <div class="car-actions">
            <button class="btn-delete" data-id="${car.id}">🗑️ Delete</button>
            <button class="btn-edit" data-id="${car.id}">✏️ Edit</button>
            <button class="btn-start" data-id="${car.id}">▶️ Start</button>
            <button class="btn-stop" data-id="${car.id}" disabled>⏹️ Stop</button>
          </div>
          <!-- Трек для анимации -->
          <div class="race-track" data-car-id="${car.id}">
            <div class="track-road">
              <div class="car-on-track" data-car-id="${car.id}" style="transform: translateX(0px);">
                🏎️
              </div>
              <div class="finish-line"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // ===== ОБРАБОТЧИКИ ДЛЯ КНОПОК =====

  // 1. Удаление
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number((e.target as HTMLElement).getAttribute('data-id'));
      if (confirm(`Delete car #${id}?`)) {
        try {
          // Сначала останавливаем анимацию, если есть
          raceAnimation.resetCar(id);
          await deleteCar(id);
          await loadCars(currentPage);
        } catch (error) {
          console.error('Error deleting car:', error);
          alert('Failed to delete car');
        }
      }
    });
  });

  // 2. Редактирование
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number((e.target as HTMLElement).getAttribute('data-id'));
      const car = currentCars.find(c => c.id === id);
      if (car) {
        const nameInput = document.getElementById('car-name') as HTMLInputElement;
        const colorInput = document.getElementById('car-color') as HTMLInputElement;
        const createBtn = document.getElementById('create-car-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        
        if (nameInput) nameInput.value = car.name;
        if (colorInput) colorInput.value = car.color;
        if (createBtn) {
          createBtn.textContent = 'Update';
          createBtn.dataset.editId = String(car.id);
        }
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
      }
    });
  });

  // 3. Старт
  document.querySelectorAll('.btn-start').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number((e.target as HTMLElement).getAttribute('data-id'));
      const startBtn = e.target as HTMLButtonElement;
      const stopBtn = document.querySelector(`.btn-stop[data-id="${id}"]`) as HTMLButtonElement;
      const carElement = document.querySelector(`.car-on-track[data-car-id="${id}"]`) as HTMLElement;

      // Блокируем кнопки
      startBtn.disabled = true;
      startBtn.textContent = '⏳ Starting...';
      stopBtn.disabled = true;

      try {
        // 1. Запускаем двигатель
        const engineData = await startEngine(id);
        console.log(`🚀 Car #${id} engine started:`, engineData);

        // Обновляем ширину трека перед стартом
        const track = document.querySelector(`.race-track[data-car-id="${id}"]`);
        if (track) {
          const width = track.clientWidth - 40;
          if (width > 50) {
            raceAnimation.setTrackWidth(width);
          }
        }

        // 2. Запускаем анимацию
        const animationPromise = raceAnimation.startAnimation(
          id,
          carElement,
          engineData.velocity,
          engineData.distance
        );

        // 3. Отправляем запрос drive (параллельно с анимацией)
        const drivePromise = switchToDrive(id);

        // Ждём оба промиса
        const results = await Promise.allSettled([drivePromise, animationPromise]);

        // Проверяем результат drive (первый промис)
        if (results[0].status === 'rejected') {
          // Машина сломалась
          console.log(`💥 Car #${id} broken!`);
          raceAnimation.markAsBroken(id);
          startBtn.textContent = '💥 Broken';
          // Разблокируем stop
          stopBtn.disabled = false;
          stopBtn.textContent = '⏹️ Stop';
          return;
        }

        // Машина успешно доехала
        console.log(`🏁 Car #${id} finished!`);
        raceAnimation.markAsFinished(id);
        startBtn.textContent = '✅ Finished';
        stopBtn.disabled = true;

      } catch (error) {
        console.error(`Error with car #${id}:`, error);
        startBtn.textContent = '❌ Error';
        // Разблокируем stop на случай ошибки
        stopBtn.disabled = false;
      } finally {
        // Если не сломалась и не финишировала, разблокируем stop
        if (startBtn.textContent !== '💥 Broken' && startBtn.textContent !== '✅ Finished') {
          stopBtn.disabled = false;
        }
      }
    });
  });

  // 4. Стоп
  document.querySelectorAll('.btn-stop').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number((e.target as HTMLElement).getAttribute('data-id'));
      const startBtn = document.querySelector(`.btn-start[data-id="${id}"]`) as HTMLButtonElement;
      const stopBtn = e.target as HTMLButtonElement;

      stopBtn.disabled = true;
      stopBtn.textContent = '⏳ Stopping...';

      try {
        // 1. Останавливаем анимацию
        raceAnimation.stopAnimation(id);
        
        // 2. Отправляем запрос на остановку двигателя
        await stopEngine(id);
        console.log(`⏹️ Car #${id} engine stopped`);

        // 3. Возвращаем машину на старт
        raceAnimation.resetCar(id);

        // 4. Обновляем кнопки
        startBtn.disabled = false;
        startBtn.textContent = '▶️ Start';
        stopBtn.textContent = '⏹️ Stop';

      } catch (error) {
        console.error(`Error stopping car #${id}:`, error);
        alert('Failed to stop car');
      } finally {
        stopBtn.disabled = false;
        stopBtn.textContent = '⏹️ Stop';
      }
    });
  });

  // Обновляем ширину трека для каждой машины
  setTimeout(() => {
    document.querySelectorAll('.race-track').forEach(track => {
      const width = track.clientWidth - 40;
      if (width > 50 && width > raceAnimation.getTrackWidth()) {
        raceAnimation.setTrackWidth(width);
      }
    });
  }, 100);
}

// ===== ОБНОВЛЕНИЕ ПАГИНАЦИИ =====
function updatePagination(page: number, total: number) {
  const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
  const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
  const pageInfo = document.getElementById('page-info');

  if (prevBtn) prevBtn.disabled = page <= 1;
  if (nextBtn) nextBtn.disabled = page * pageSize >= total;
  if (pageInfo) pageInfo.textContent = `Page ${page}`;
}

// ===== ОБНОВЛЕНИЕ СТАТИСТИКИ =====
function updateStats(total: number) {
  const totalEl = document.getElementById('total-cars');
  if (totalEl) totalEl.textContent = String(total);
}

// ===== ЗАПУСК =====
init();

// Экспортируем для отладки в консоли
export { raceAnimation, currentCars, totalCars, currentPage };