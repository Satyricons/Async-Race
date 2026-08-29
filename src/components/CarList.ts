import type { Car } from '../types';

export function renderCarList(cars: Car[]): string {
  if (cars.length === 0) {
    return '<p>No cars in garage.</p>';
  }

  return `
    <div class="car-list">
      ${cars.map(car => `
        <div class="car-item" data-id="${car.id}">
          <span style="color: ${car.color}; font-weight: bold;">●</span>
          <span>${car.name}</span>
          <button class="delete-car-btn" data-id="${car.id}">Delete</button>
        </div>
      `).join('')}
    </div>
  `;
}

export function setupCarList(
  cars: Car[],
  onDelete: (id: number) => void
): void {
  document.querySelectorAll('.delete-car-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      if (confirm('Delete this car?')) {
        onDelete(id);
      }
    });
  });
}