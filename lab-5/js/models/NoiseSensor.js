import { NOISE_LIMITS } from "../config.js";
import { NoiseMeasurement } from "./NoiseMeasurement.js";

export class NoiseSensor {
  constructor(id, district, location, noiseLevel) {
    if (!NoiseSensor.isValidNoiseLevel(noiseLevel)) {
      throw new RangeError(`Некоректний рівень шуму для ${id}: ${noiseLevel}`);
    }

    this.id = id;
    this.district = district;
    this.location = location;
    this.noiseLevel = noiseLevel;
    this.measurements = [];
  }

  getStatus() {
    if (this.noiseLevel <= NOISE_LIMITS.normalMax) {
      return "normal";
    }
    if (this.noiseLevel <= NOISE_LIMITS.warningMax) {
      return "warning";
    }
    return "critical";
  }

  updateNoiseLevel(value) {
    if (!NoiseSensor.isValidNoiseLevel(value)) {
      throw new RangeError(`Некоректний рівень шуму: ${value}`);
    }
    this.noiseLevel = value;
  }

  addMeasurement(measurement) {
    if (!(measurement instanceof NoiseMeasurement)) {
      throw new TypeError("Очікується об'єкт NoiseMeasurement");
    }
    this.updateNoiseLevel(measurement.value);
    this.measurements.push(measurement);
  }

  getLastMeasurement() {
    if (this.measurements.length === 0) {
      return null;
    }
    return this.measurements[this.measurements.length - 1];
  }

  static isValidNoiseLevel(value) {
    return Number.isFinite(value) && value >= NOISE_LIMITS.minValid && value <= NOISE_LIMITS.maxValid;
  }

  static fromObject(data) {
    const hasText = key => typeof data[key] === "string" && data[key].trim() !== "";

    if (data === null || typeof data !== "object") {
      throw new TypeError("Очікується об'єкт з даними сенсора");
    }
    if (!hasText("id") || !hasText("district") || !hasText("location")) {
      throw new TypeError("Об'єкт сенсора повинен містити id, district і location");
    }

    return new NoiseSensor(data.id, data.district, data.location, data.noiseLevel);
  }
}
