export class NoiseMeasurement {
  constructor(value, measuredAt = new Date()) {
    this.value = value;
    this.measuredAt = measuredAt;
  }

  getTimeLabel() {
    return this.measuredAt.toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  toString() {
    return `${this.getTimeLabel()} -> ${this.value} dB`;
  }
}
