import { NoiseSensor } from "./models/NoiseSensor.js";
import { MobileNoiseSensor } from "./models/MobileNoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

const sensorsData = [
  {
    id: "NS-01",
    district: "Галицький",
    location: "просп. Свободи",
    noiseLevel: 58
  },
  {
    id: "NS-02",
    district: "Франківський",
    location: "вул. Наукова",
    noiseLevel: 74
  },
  {
    id: "NS-03",
    district: "Шевченківський",
    location: "просп. Чорновола",
    noiseLevel: 83
  }
];

const STATUS_LABELS = Object.freeze({
  normal: "Норма",
  warning: "Попередження",
  critical: "Критичний"
});

const ALL_DISTRICTS = "all";

const system = new MonitoringSystem();
sensorsData.map(data => NoiseSensor.fromObject(data)).forEach(sensor => system.addSensor(sensor));
system.addSensor(new MobileNoiseSensor("MS-01", "Сихівський", "пересувна станція, вул. Зелена", 49, 15));

const elements = {
  summary: document.querySelector("#sensors-summary"),
  list: document.querySelector("#sensors-list"),
  filter: document.querySelector("#district-filter"),
  form: document.querySelector("#measurement-form"),
  sensorSelect: document.querySelector("#measurement-sensor"),
  valueInput: document.querySelector("#measurement-value"),
  message: document.querySelector("#measurement-message")
};

const formatLevel = value => `${value.toLocaleString("uk-UA", { maximumFractionDigits: 2 })} dB`;

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderSensorCard(sensor) {
  const status = sensor.getStatus();
  const card = document.createElement("article");
  card.className = `sensor-card ${status}`;

  const header = document.createElement("div");
  header.className = "sensor-card__header";
  header.append(
    createTextElement("h3", "sensor-card__id", sensor.id),
    createTextElement("span", "sensor-card__status", `${STATUS_LABELS[status]} · ${status}`)
  );

  card.append(
    header,
    createTextElement("p", "sensor-card__level", formatLevel(sensor.noiseLevel)),
    createTextElement("p", "sensor-card__text", `Район: ${sensor.district}`),
    createTextElement("p", "sensor-card__text", `Адреса: ${sensor.location}`)
  );

  const last = sensor.getLastMeasurement();
  const history = last === null
    ? "Нових вимірювань ще немає"
    : `Вимірювань: ${sensor.measurements.length}, останнє ${last.toString()}`;
  card.append(createTextElement("p", "sensor-card__note", history));

  if (sensor instanceof MobileNoiseSensor) {
    const battery = sensor.needsCharging()
      ? `Мобільний датчик, батарея ${sensor.batteryLevel}% — потрібне заряджання`
      : `Мобільний датчик, батарея ${sensor.batteryLevel}%`;
    card.append(createTextElement("p", "sensor-card__note", battery));
  }

  return card;
}

function renderSummary() {
  const average = system.getAverageNoiseLevel();
  const critical = system.getCriticalSensors();
  const criticalText = critical.length === 0
    ? "немає"
    : critical.map(sensor => sensor.id).join(", ");

  elements.summary.textContent =
    `Датчиків: ${system.sensors.length} · Середній рівень: ${average === null ? "немає даних" : formatLevel(average)} · Критичні: ${criticalText}`;
}

function renderSensors() {
  const district = elements.filter.value;
  const sensors = district === ALL_DISTRICTS ? system.sensors : system.getSensorsByDistrict(district);
  elements.list.replaceChildren(...sensors.map(renderSensorCard));
  renderSummary();
}

function fillOptions() {
  elements.filter.append(new Option("Усі райони", ALL_DISTRICTS));
  for (const district of system.getDistricts()) {
    elements.filter.append(new Option(district, district));
  }
  for (const sensor of system.sensors) {
    elements.sensorSelect.append(new Option(`${sensor.id} — ${sensor.district}`, sensor.id));
  }
}

function showMessage(text, isError) {
  elements.message.textContent = text;
  elements.message.className = isError ? "sensor-form__message sensor-form__message--error" : "sensor-form__message";
}

function handleMeasurementSubmit(event) {
  event.preventDefault();

  const sensor = system.findSensorById(elements.sensorSelect.value);
  const value = elements.valueInput.valueAsNumber;

  if (sensor === null) {
    showMessage("Датчик не знайдено", true);
    return;
  }

  try {
    sensor.addMeasurement(new NoiseMeasurement(value));
  } catch (error) {
    showMessage(error.message, true);
    return;
  }

  showMessage(`${sensor.id}: додано ${formatLevel(value)}, статус — ${STATUS_LABELS[sensor.getStatus()]}`, false);
  elements.valueInput.value = "";
  renderSensors();
}

fillOptions();
renderSensors();
elements.filter.addEventListener("change", renderSensors);
elements.form.addEventListener("submit", handleMeasurementSubmit);
