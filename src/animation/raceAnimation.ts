// src/animation/raceAnimation.ts

export interface CarAnimation {
  id: number;
  element: HTMLElement;
  startPosition: number;
  finishPosition: number;
  duration: number; // в миллисекундах
  startTime: number | null;
  animationId: number | null;
  isFinished: boolean;
  isBroken: boolean;
}

export class RaceAnimation {
  private animations: Map<number, CarAnimation> = new Map();
  private trackWidth: number;

  constructor(trackWidth: number = 600) {
    this.trackWidth = trackWidth;
  }

  // Обновить ширину трека (для responsive)
  setTrackWidth(width: number): void {
    if (width > 50) { // Минимальная ширина
      this.trackWidth = width;
    }
  }

  // Получить текущую ширину трека
  getTrackWidth(): number {
    return this.trackWidth;
  }

  // Запустить анимацию для машины
  startAnimation(
    carId: number,
    element: HTMLElement,
    velocity: number,
    distance: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Проверяем, не запущена ли уже анимация
      if (this.animations.has(carId)) {
        reject(new Error(`Car ${carId} is already animating`));
        return;
      }

      // Рассчитываем длительность анимации в миллисекундах
      const duration = (distance / velocity); // Уже в миллисекундах

      const animation: CarAnimation = {
        id: carId,
        element,
        startPosition: 0,
        finishPosition: this.trackWidth,
        duration,
        startTime: null,
        animationId: null,
        isFinished: false,
        isBroken: false,
      };

      this.animations.set(carId, animation);

      // Запускаем анимацию
      const startTime = performance.now();
      animation.startTime = startTime;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Позиция от 0 до trackWidth
        const position = progress * this.trackWidth;
        element.style.transform = `translateX(${position}px)`;

        if (progress < 1 && !animation.isBroken) {
          // Продолжаем анимацию
          animation.animationId = requestAnimationFrame(animate);
        } else {
          // Анимация завершена или остановлена
          animation.isFinished = true;
          animation.animationId = null;
          resolve();
        }
      };

      animation.animationId = requestAnimationFrame(animate);
    });
  }

  // Остановить анимацию (поломка или остановка)
  stopAnimation(carId: number): void {
    const animation = this.animations.get(carId);
    if (!animation) return;

    // Отменяем requestAnimationFrame
    if (animation.animationId !== null) {
      cancelAnimationFrame(animation.animationId);
      animation.animationId = null;
    }

    // Если анимация не завершена, помечаем как сломанную
    if (!animation.isFinished) {
      animation.isBroken = true;
    }

    // Оставляем машину в текущей позиции
  }

  // Вернуть машину на старт
  resetCar(carId: number): void {
    const animation = this.animations.get(carId);
    if (animation) {
      // Отменяем анимацию
      if (animation.animationId !== null) {
        cancelAnimationFrame(animation.animationId);
        animation.animationId = null;
      }
      // Удаляем из карты
      this.animations.delete(carId);
    }
    
    // Возвращаем элемент на старт
    const element = document.querySelector(`.car-on-track[data-car-id="${carId}"]`) as HTMLElement;
    if (element) {
      element.style.transform = 'translateX(0px)';
      element.classList.remove('broken', 'finished');
    }
  }

  // Проверить, финишировала ли машина
  isCarFinished(carId: number): boolean {
    const animation = this.animations.get(carId);
    return animation ? animation.isFinished : false;
  }

  // Проверить, сломалась ли машина
  isCarBroken(carId: number): boolean {
    const animation = this.animations.get(carId);
    return animation ? animation.isBroken : false;
  }

  // Очистить все анимации
  resetAll(): void {
    for (const [carId, animation] of this.animations) {
      if (animation.animationId !== null) {
        cancelAnimationFrame(animation.animationId);
      }
      // Возвращаем на старт
      const element = document.querySelector(`.car-on-track[data-car-id="${carId}"]`) as HTMLElement;
      if (element) {
        element.style.transform = 'translateX(0px)';
        element.classList.remove('broken', 'finished');
      }
    }
    this.animations.clear();
  }

  // Получить все активные анимации
  getActiveAnimations(): number[] {
    return Array.from(this.animations.keys());
  }

  // Получить прогресс анимации (0-1)
  getProgress(carId: number): number | null {
    const animation = this.animations.get(carId);
    if (!animation || animation.startTime === null) return null;
    
    const elapsed = performance.now() - animation.startTime;
    return Math.min(elapsed / animation.duration, 1);
  }

  // Пометить машину как сломанную
  markAsBroken(carId: number): void {
    const animation = this.animations.get(carId);
    if (animation) {
      animation.isBroken = true;
      const element = animation.element;
      element.classList.add('broken');
    }
  }

  // Пометить машину как финишировавшую
  markAsFinished(carId: number): void {
    const animation = this.animations.get(carId);
    if (animation) {
      animation.isFinished = true;
      const element = animation.element;
      element.classList.add('finished');
    }
  }
}