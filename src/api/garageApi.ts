// src/api/garageApi.ts
import { API_BASE_URL } from '../config';
import type { Car } from '../types';

export async function getCars(page: number = 1, limit: number = 7): Promise<{ cars: Car[]; total: number }> {
  const url = new URL(`${API_BASE_URL}/garage`);
  url.searchParams.append('_page', String(page));
  url.searchParams.append('_limit', String(limit));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const cars: Car[] = await response.json();
  const total = Number(response.headers.get('X-Total-Count')) || 0;

  return { cars, total };
}

export async function createCar(name: string, color: string): Promise<Car> {
  const response = await fetch(`${API_BASE_URL}/garage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create car: ${response.status}`);
  }

  return response.json();
}

export async function deleteCar(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/garage/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete car: ${response.status}`);
  }
}

export async function updateCar(id: number, name: string, color: string): Promise<Car> {
  const response = await fetch(`${API_BASE_URL}/garage/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update car: ${response.status}`);
  }

  return response.json();
}

export async function generateCars(count: number = 100): Promise<Car[]> {
  const cars: Car[] = [];
  
  // Списки для генерации имён
  const brands = [
    'Tesla', 'BMW', 'Mercedes', 'Audi', 'Ford', 
    'Toyota', 'Honda', 'Nissan', 'Volkswagen', 'Porsche',
    'Ferrari', 'Lamborghini', 'Maserati', 'Jaguar', 'Bugatti',
    'Lexus', 'Volvo', 'Hyundai', 'Kia', 'Subaru'
  ];
  
  const models = [
    'Model S', 'X5', 'C-Class', 'A6', 'Mustang',
    'Camry', 'Civic', 'GT-R', 'Golf', '911',
    'F40', 'Aventador', 'GranTurismo', 'F-Type', 'Veyron',
    'RX', 'XC90', 'Sonata', 'Stinger', 'Outback'
  ];

  const createdCars: Car[] = [];

  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const name = `${brand} ${model}`;
    const color = generateRandomColor();
    
    try {
      const car = await createCar(name, color);
      createdCars.push(car);
    } catch (error) {
      console.error(`Failed to create car #${i + 1}:`, error);
    }
  }

  return createdCars;
}

function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}