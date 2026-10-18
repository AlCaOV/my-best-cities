import { NoiseSensor } from "./models/NoiseSensor.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

const sensorsData = [
  {
    id: "NS-01",
    district: "Галицький",
    location: "просп. Свободи, 1",
    noiseLevel: 52
  },
  {
    id: "NS-02",
    district: "Франківський",
    location: "вул. Наукова, 10",
    noiseLevel: 68
  },
  {
    id: "NS-03",
    district: "Шевченківський",
    location: "просп. Чорновола, 20",
    noiseLevel: 83
  },
  {
    id: "NS-04",
    district: "Галицький",
    location: "вул. Городоцька, 15",
    noiseLevel: 79
  }
];

const ALL_DISTRICTS = "all";
const CRITICAL_STATUS = "critical";

const system = new MonitoringSystem();
sensorsData.map(data => NoiseSensor.fromObject(data)).forEach(sensor => system.addSensor(sensor));

const sensorList = document.querySelector(".sensor-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");

function createSensorCard(sensor) {
  const status = sensor.getStatus();

  const card = document.createElement("article");
  card.classList.add("sensor-card", `sensor-card--${status}`);

  const title = document.createElement("h3");
  title.classList.add("sensor-card__title");
  title.textContent = sensor.id;

  const district = document.createElement("p");
  district.textContent = `Район: ${sensor.district}`;

  const location = document.createElement("p");
  location.textContent = `Локація: ${sensor.location}`;

  const level = document.createElement("p");
  level.classList.add("sensor-card__level");
  level.textContent = `Рівень шуму: ${sensor.noiseLevel} дБ`;

  const statusText = document.createElement("p");
  statusText.classList.add("sensor-card__status");
  statusText.textContent = `Статус: ${status}`;

  card.append(title, district, location, level, statusText);
  return card;
}

function renderSensors(sensorArray) {
  sensorList.replaceChildren();
  sensorArray.forEach(sensor => {
    const card = createSensorCard(sensor);
    sensorList.append(card);
  });
}

function applyFilters() {
  const selectedDistrict = districtFilter.value;
  const criticalOnly = criticalFilter.checked;

  const filteredSensors = system.sensors.filter(sensor => {
    const matchesDistrict = selectedDistrict === ALL_DISTRICTS || sensor.district === selectedDistrict;
    const matchesStatus = !criticalOnly || sensor.getStatus() === CRITICAL_STATUS;
    return matchesDistrict && matchesStatus;
  });

  renderSensors(filteredSensors);
}

renderSensors(system.sensors);
districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);
