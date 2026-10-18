import { NoiseSensor } from "./NoiseSensor.js";

export class MobileNoiseSensor extends NoiseSensor {
  static LOW_BATTERY_LEVEL = 20;

  constructor(id, district, location, noiseLevel, batteryLevel) {
    super(id, district, location, noiseLevel);
    this.batteryLevel = batteryLevel;
  }

  needsCharging() {
    return this.batteryLevel < MobileNoiseSensor.LOW_BATTERY_LEVEL;
  }

  moveTo(district, location) {
    this.district = district;
    this.location = location;
  }
}
