import { NoiseSensor } from "../models/NoiseSensor.js";

export class MonitoringSystem {
  constructor() {
    this.sensors = [];
  }

  addSensor(sensor) {
    if (!(sensor instanceof NoiseSensor)) {
      throw new TypeError("Можна додавати лише об'єкти NoiseSensor");
    }
    if (this.findSensorById(sensor.id) !== null) {
      throw new Error(`Датчик ${sensor.id} вже існує`);
    }
    this.sensors.push(sensor);
    return sensor;
  }

  findSensorById(id) {
    return this.sensors.find(sensor => sensor.id === id) ?? null;
  }

  getSensorsByDistrict(district) {
    return this.sensors.filter(sensor => sensor.district === district);
  }

  getDistricts() {
    const districts = [];
    for (const sensor of this.sensors) {
      if (!districts.includes(sensor.district)) {
        districts.push(sensor.district);
      }
    }
    return districts;
  }

  getCriticalSensors() {
    return this.sensors.filter(sensor => sensor.getStatus() === "critical");
  }

  getAverageNoiseLevel() {
    if (this.sensors.length === 0) {
      return null;
    }
    const total = this.sensors.reduce((sum, sensor) => sum + sensor.noiseLevel, 0);
    return total / this.sensors.length;
  }
}
