const API_URL = "https://6ad50a0048476c0785d9635e.mockapi.io/api/v1/sensors";

const container = document.querySelector("#sensors-list");

async function loadSensors() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const sensors = await response.json();
    renderSensors(sensors);
  } catch (error) {
    console.error("Не вдалося завантажити сенсори:", error);
    showMessage("Не вдалося завантажити дані.");
  }
}

function showMessage(text) {
  const message = document.createElement("p");
  message.classList.add("sensor-list__message");
  message.textContent = text;
  container.replaceChildren(message);
}

function createSensorCard(sensor) {
  const card = document.createElement("article");
  card.classList.add("sensor-card", `sensor-card--${sensor.status}`);

  const title = document.createElement("h3");
  title.classList.add("sensor-card__title");
  title.textContent = sensor.name;

  const district = document.createElement("p");
  district.textContent = `Район: ${sensor.district}`;

  const level = document.createElement("p");
  level.classList.add("sensor-card__level");
  level.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;

  const status = document.createElement("p");
  status.classList.add("sensor-card__status");
  status.textContent = `Статус: ${sensor.status}`;

  card.append(title, district, level, status);
  return card;
}

function renderSensors(sensors) {
  container.replaceChildren();

  if (sensors.length === 0) {
    showMessage("Сенсорів поки немає.");
    return;
  }

  sensors.forEach(sensor => {
    container.append(createSensorCard(sensor));
  });
}

loadSensors();
