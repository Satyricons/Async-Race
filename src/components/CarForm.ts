export function renderCarForm(): string {
  return `
    <div class="car-form">
      <h3>Create Car</h3>
      <input type="text" id="car-name" placeholder="Car name" />
      <input type="color" id="car-color" value="#007bff" />
      <button id="create-car-btn">Create</button>
    </div>
  `;
}

export function setupCarForm(onCreate: (name: string, color: string) => void): void {
  const nameInput = document.getElementById('car-name') as HTMLInputElement;
  const colorInput = document.getElementById('car-color') as HTMLInputElement;
  const createBtn = document.getElementById('create-car-btn');

  createBtn?.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const color = colorInput.value;
    if (name) {
      onCreate(name, color);
      nameInput.value = '';
    }
  });
}