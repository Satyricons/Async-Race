// src/main.ts
import { getCars, createCar, deleteCar, updateCar, generateCars } from './api/garageApi';
import { startEngine, stopEngine, switchToDrive } from './api/engineApi';
import { getWinners, createWinner, updateWinner, getWinner } from './api/winnersApi';
import { RaceAnimation } from './animation/raceAnimation';
import { renderWinnersView, setupWinnersListeners } from './views/winnersView';
import type { Car } from './types';

// ===== ПЕРЕМЕННЫЕ =====
let currentCars: Car[] = [];
let totalCars = 0;
const pageSize = 7;
let currentPage = 1;
let currentView: 'garage' | 'winners' = 'garage';

// Переменные для Winners
let winnersCurrentPage = 1;
let winnersTotal = 0;
let winnersSortField: 'wins' | 'time' | null = null;
let winnersSortOrder: 'ASC' | 'DESC' = 'ASC';

// Переменные для гонки
let isRaceRunning = false;
let raceWinner: { id: number; name: string; time: number } | null = null;

// Анимация
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
        <h1>🏎️ Async Race</h1>
        <span class="stats">Total cars: <span id="total-cars">0</span></span>
      </header>

      <nav class="nav">
        <button class="active" data-view="garage">Garage</button>
        <button data-view="winners">Winners</button>
      </nav>

      <div id="view-container">
        ${renderGarageView()}
      </div>
    </div>
  `;

  setupEventListeners();
}

// ===== РЕНДЕР GARAGE VIEW =====
function renderGarageView(): string {
  return `
    <div id="garage-view">
      <div class="car-form">
        <h3>Create Car</h3>
        <input type="text" id="car-name" placeholder="Car name" />
        <input type="color" id="car-color" value="#007bff" />
        <button class="btn btn-primary" id="create-car-btn">Create</button>
        <button class="btn btn-secondary" id="cancel-edit-btn" style="display:none;">Cancel</button>
        <button class="btn btn-success" id="generate-cars-btn">🚀 Generate 100</button>
      </div>

      <!-- Кнопки для гонки -->
      <div class="race-controls">
        <button class="btn btn-race" id="start-race-btn">🏁 Start Race</button>
        <button class="btn btn-reset" id="reset-race-btn">🔄 Reset Race</button>
        <span id="race-status" class="race-status"></span>
      </div>

      <div id="car-list" class="car-list"></div>

      <div class="pagination">
        <button id="prev-page" disabled>◀ Previous</button>
        <span class="page-info" id="page-info">Page 1</span>
        <button id="next-page">Next ▶</button>
      </div>
    </div>
  `;
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ =====
function setupEventListeners() {
  // --- Навигация ---
  document.querySelectorAll('.nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      if (view === 'winners') {
        showWinners();
      } else {
        showGarage();
      }
    });
  });

  // --- Создание / Обновление ---
  const createBtn = document.getElementById('create-car-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const nameInput = document.getElementById('car-name') as HTMLInputElement;
  const colorInput = document.getElementById('car-color') as HTMLInputElement;

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
      if (currentView === 'garage') {
        await loadCars(currentPage);
      }
    } catch (error) {
      console.error('Error saving car:', error);
      alert('Failed to save car');
    }
  });

  // --- Отмена редактирования ---
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

  // --- Пагинация ---
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

  // --- Генерация 100 машин ---
  document.getElementById('generate-cars-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('generate-cars-btn') as HTMLButtonElement;
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = '⏳ Generating...';
    
    try {
      const createdCars = await generateCars(100);
      console.log(`✅ Generated ${createdCars.length} cars`);
      
      currentPage = 1;
      if (currentView === 'garage') {
        await loadCars(currentPage);
      }
      
      alert(`Successfully generated ${createdCars.length} cars!`);
    } catch (error) {
      console.error('Error generating cars:', error);
      alert('Failed to generate cars. Check console for details.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  // --- Кнопки гонки ---
  document.getElementById('start-race-btn')?.addEventListener('click', startRace);
  document.getElementById('reset-race-btn')?.addEventListener('click', resetRace);
}

// ===== ПОКАЗАТЬ GARAGE =====
async function showGarage() {
  currentView = 'garage';
  const viewContainer = document.getElementById('view-container');
  if (viewContainer) {
    viewContainer.innerHTML = renderGarageView();
    setupEventListeners();
    await loadCars(currentPage);
  }
}

// ===== ПОКАЗАТЬ WINNERS =====
async function showWinners() {
  currentView = 'winners';
  await loadWinners(winnersCurrentPage);
}

// ===== ЗАГРУЗКА МАШИН =====
async function loadCars(page: number) {
  if (currentView !== 'garage') return;
  
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

  // 3. Старт (для одной машины)
  document.querySelectorAll('.btn-start').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = Number((e.target as HTMLElement).getAttribute('data-id'));
      const startBtn = e.target as HTMLButtonElement;
      const stopBtn = document.querySelector(`.btn-stop[data-id="${id}"]`) as HTMLButtonElement;

      try {
        await startSingleCar(id);
      } catch (error) {
        console.error(`Error starting car ${id}:`, error);
        startBtn.textContent = '❌ Error';
        stopBtn.disabled = false;
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
        raceAnimation.stopAnimation(id);
        await stopEngine(id);
        console.log(`⏹️ Car #${id} engine stopped`);
        raceAnimation.resetCar(id);

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

  // Обновляем ширину трека
  setTimeout(() => {
    document.querySelectorAll('.race-track').forEach(track => {
      const width = track.clientWidth - 40;
      if (width > 50 && width > raceAnimation.getTrackWidth()) {
        raceAnimation.setTrackWidth(width);
      }
    });
  }, 100);
}

// ===== ЗАПУСК ОДНОЙ МАШИНЫ =====
// src/main.ts

// src/main.ts (обновлённый startSingleCar)

function startSingleCar(carId: number): Promise<{ id: number; time: number }> {
  return new Promise(async (resolve, reject) => {
    const startBtn = document.querySelector(`.btn-start[data-id="${carId}"]`) as HTMLButtonElement;
    const stopBtn = document.querySelector(`.btn-stop[data-id="${carId}"]`) as HTMLButtonElement;
    const carElement = document.querySelector(`.car-on-track[data-car-id="${carId}"]`) as HTMLElement;

    if (!carElement) {
      reject(new Error(`Car ${carId} not found`));
      return;
    }

    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = '⏳ Racing...';
    }
    if (stopBtn) stopBtn.disabled = true;

    try {
      const engineData = await startEngine(carId);
      console.log(`🚀 Car #${carId} engine started:`, engineData);

      // --- РАССЧИТЫВАЕМ ВРЕМЯ НА ОСНОВЕ ДАННЫХ СЕРВЕРА ---
      // Время = расстояние / скорость (в секундах)
      const estimatedTime = engineData.distance / engineData.velocity / 1000;
      console.log(`⏱️ Car #${carId} estimated time: ${estimatedTime.toFixed(2)}s`);

      const track = document.querySelector(`.race-track[data-car-id="${carId}"]`);
      if (track) {
        const width = track.clientWidth - 40;
        if (width > 50) {
          raceAnimation.setTrackWidth(width);
        }
      }

      const animationPromise = raceAnimation.startAnimation(
        carId,
        carElement,
        engineData.velocity,
        engineData.distance
      );

      const drivePromise = switchToDrive(carId);
      const results = await Promise.allSettled([drivePromise, animationPromise]);

      if (results[0].status === 'rejected') {
        console.log(`💥 Car #${carId} broken!`);
        raceAnimation.markAsBroken(carId);
        if (startBtn) startBtn.textContent = '💥 Broken';
        reject(new Error(`Car ${carId} broken`));
        return;
      }

      console.log(`🏁 Car #${carId} finished in ${estimatedTime.toFixed(2)}s`);
      raceAnimation.markAsFinished(carId);
      if (startBtn) startBtn.textContent = '✅ Finished';

      resolve({ id: carId, time: estimatedTime });

    } catch (error) {
      console.error(`Error with car ${carId}:`, error);
      if (startBtn) startBtn.textContent = '❌ Error';
      reject(error);
    } finally {
      if (stopBtn) stopBtn.disabled = false;
    }
  });
}

// ===== ЗАПУСК ГОНКИ =====
// src/main.ts

async function startRace() {
  if (isRaceRunning) return;
  if (currentCars.length === 0) {
    alert('No cars to race! Please add some cars first.');
    return;
  }

  const startBtn = document.getElementById('start-race-btn') as HTMLButtonElement;
  const resetBtn = document.getElementById('reset-race-btn') as HTMLButtonElement;
  const statusEl = document.getElementById('race-status');

  isRaceRunning = true;
  raceWinner = null;
  startBtn.disabled = true;
  resetBtn.disabled = true;
  if (statusEl) statusEl.textContent = '🏁 Race in progress...';

  try {
    // Запускаем все машины и ждём первую завершённую
    const racePromises = currentCars.map((car) => {
      return startSingleCar(car.id)
        .then((result) => ({ ...result, name: car.name }))
        .catch(() => null);
    });

    // Ждём все результаты
    const results = await Promise.all(racePromises);
    
    // Находим победителя (первая завершённая машина с наименьшим временем)
    const validResults = results.filter(r => r !== null) as { id: number; name: string; time: number }[];
    
    if (validResults.length === 0) {
      if (statusEl) statusEl.textContent = '❌ No car finished the race!';
      alert('❌ No car finished the race! All cars broken?');
      return;
    }

    // Сортируем по времени и берём первого
    const winner = validResults.sort((a, b) => a.time - b.time)[0];
    raceWinner = winner;

    // Сохраняем победителя в БД
    await handleRaceWinner(winner.id, winner.time);

    if (statusEl) {
      statusEl.textContent = `🏆 Winner: ${winner.name} (${winner.time.toFixed(2)}s)!`;
    }
    alert(`🏆 Race finished! Winner: ${winner.name}! (${winner.time.toFixed(2)}s)`);

  } catch (error) {
    console.error('Race error:', error);
    if (statusEl) statusEl.textContent = '❌ Race failed!';
  } finally {
    isRaceRunning = false;
    startBtn.disabled = false;
    resetBtn.disabled = false;
  }
}

// ===== СБРОС ГОНКИ =====
async function resetRace() {
  if (isRaceRunning) {
    alert('Race is still running! Please wait.');
    return;
  }

  const resetBtn = document.getElementById('reset-race-btn') as HTMLButtonElement;
  const statusEl = document.getElementById('race-status');

  resetBtn.disabled = true;
  if (statusEl) statusEl.textContent = '🔄 Resetting...';

  try {
    for (const car of currentCars) {
      try {
        raceAnimation.resetCar(car.id);
        await stopEngine(car.id);
        
        const startBtn = document.querySelector(`.btn-start[data-id="${car.id}"]`) as HTMLButtonElement;
        const stopBtn = document.querySelector(`.btn-stop[data-id="${car.id}"]`) as HTMLButtonElement;
        
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.textContent = '▶️ Start';
        }
        if (stopBtn) {
          stopBtn.disabled = true;
          stopBtn.textContent = '⏹️ Stop';
        }
        
        const carElement = document.querySelector(`.car-on-track[data-car-id="${car.id}"]`) as HTMLElement;
        if (carElement) {
          carElement.style.transform = 'translateX(0px)';
          carElement.classList.remove('broken', 'finished');
        }
      } catch (error) {
        console.error(`Error resetting car ${car.id}:`, error);
      }
    }

    raceWinner = null;
    if (statusEl) statusEl.textContent = '✅ All cars reset';

  } catch (error) {
    console.error('Error resetting race:', error);
    if (statusEl) statusEl.textContent = '❌ Reset failed!';
  } finally {
    resetBtn.disabled = false;
  }
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

// ===== ОБРАБОТКА ПОБЕДИТЕЛЯ =====
async function handleRaceWinner(winnerId: number, winnerTime: number) {
  try {
    const existingWinner = await getWinner(winnerId);
    
    if (existingWinner) {
      const newWins = existingWinner.wins + 1;
      const newTime = Math.min(existingWinner.time, winnerTime);
      await updateWinner(winnerId, newWins, newTime);
      console.log(`🏆 Updated winner #${winnerId}: ${newWins} wins, best time ${newTime}s`);
    } else {
      await createWinner(winnerId, 1, winnerTime);
      console.log(`🏆 New winner #${winnerId} with time ${winnerTime}s`);
    }
  } catch (error) {
    console.error('Error saving winner:', error);
  }
}

// ===== ЗАГРУЗКА ПОБЕДИТЕЛЕЙ =====
async function loadWinners(page: number = winnersCurrentPage) {
  try {
    const { winners, total } = await getWinners(
      page,
      10,
      winnersSortField || undefined,
      winnersSortOrder
    );
    winnersTotal = total;
    winnersCurrentPage = page;

    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;

    viewContainer.innerHTML = renderWinnersView(
      winners,
      total,
      page,
      winnersSortField,
      winnersSortOrder
    );

    setupWinnersListeners(
      (newPage) => loadWinners(newPage),
      (field, order) => {
        winnersSortField = field;
        winnersSortOrder = order;
        loadWinners(1);
      },
      winnersSortField,
      winnersSortOrder
    );
  } catch (error) {
    console.error('Error loading winners:', error);
  }
}

// ===== ЗАПУСК =====
init();

// Экспортируем для отладки
export { raceAnimation, currentCars, totalCars, currentPage };