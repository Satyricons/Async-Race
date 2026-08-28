// src/api/engineApi.ts
import { API_BASE_URL } from '../config';

export interface EngineResponse {
  velocity: number;
  distance: number;
}

export interface DriveResponse {
  success: boolean;
}

// Запустить двигатель
export async function startEngine(carId: number): Promise<EngineResponse> {
  const response = await fetch(
    `${API_BASE_URL}/engine?id=${carId}&status=started`,
    { method: 'PATCH' }
  );

  if (!response.ok) {
    throw new Error(`Failed to start engine: ${response.status}`);
  }

  return response.json();
}

// Остановить двигатель
export async function stopEngine(carId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/engine?id=${carId}&status=stopped`,
    { method: 'PATCH' }
  );

  if (!response.ok) {
    throw new Error(`Failed to stop engine: ${response.status}`);
  }
}

// Переключить в режим drive
export async function switchToDrive(carId: number): Promise<DriveResponse> {
  const response = await fetch(
    `${API_BASE_URL}/engine?id=${carId}&status=drive`,
    { method: 'PATCH' }
  );

  if (!response.ok) {
    // Если 500 - машина сломалась
    if (response.status === 500) {
      throw new Error('Car engine broken!');
    }
    throw new Error(`Failed to switch to drive: ${response.status}`);
  }

  return response.json();
}