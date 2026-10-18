const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];
const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

const limits = {
  warning: warningLevel,
  critical: criticalLevel,
  min: minValidLevel,
  max: maxValidLevel
};

const formatLevel = value => value === null ? "немає даних" : `${value} dB`;
const isAbove = (value, threshold) => value > threshold;
const criticalWord = count => {
  const lastTwo = count % 100;
  const last = count % 10;
  if (last === 1 && lastTwo !== 11) {
    return "критичне вимірювання";
  }
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return "критичні вимірювання";
  }
  return "критичних вимірювань";
};
const formatNumber = (value, digits) => value.toLocaleString("uk-UA", {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
});

function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

function isSafeLevel(level, settings) {
  return isValidLevel(level, settings.min, settings.max) && !isAbove(level, settings.warning);
}

function calculateAverage(data, min, max) {
  let sum = 0;
  let count = 0;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    sum += level;
    count++;
  }

  return count === 0 ? null : sum / count;
}

function findMinimum(data, min, max) {
  let result = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (result === null || level < result) {
      result = level;
    }
  }

  return result;
}

function findMaximum(data, min, max) {
  let result = null;

  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;
    }
    if (result === null || level > result) {
      result = level;
    }
  }

  return result;
}

const countByCategory = function (data, settings) {
  const counts = { safe: 0, warning: 0, critical: 0, valid: 0, invalid: 0 };

  for (const level of data) {
    if (!isValidLevel(level, settings.min, settings.max)) {
      counts.invalid++;
      continue;
    }

    counts.valid++;

    if (isAbove(level, settings.critical)) {
      counts.critical++;
    } else if (isAbove(level, settings.warning)) {
      counts.warning++;
    } else {
      counts.safe++;
    }
  }

  return counts;
};

function findFirstCritical(data, settings) {
  let result = null;

  for (let i = 0; i < data.length; i++) {
    const level = data[i];

    if (isValidLevel(level, settings.min, settings.max) && isAbove(level, settings.critical)) {
      result = { value: level, position: i + 1 };
      break;
    }
  }

  return result;
}

function findRecovery(data, settings, firstCritical) {
  if (firstCritical === null) {
    return null;
  }

  let index = firstCritical.position;
  let safeInRow = 0;

  while (index < data.length) {
    if (isSafeLevel(data[index], settings)) {
      safeInRow++;
    } else {
      safeInRow = 0;
    }

    index++;

    if (safeInRow === 3) {
      return index;
    }
  }

  return null;
}

function findFirstValid(data, min, max) {
  if (data.length === 0) {
    return null;
  }

  let index = 0;
  let level;

  do {
    level = data[index];
    if (isValidLevel(level, min, max)) {
      return { value: level, position: index + 1 };
    }
    index++;
  } while (index < data.length);

  return null;
}

function findInvalidEntries(data, min, max) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      result.push({ position: i + 1, value: data[i] });
    }
  }

  return result;
}

function analyzeLevels(data, settings, categoryCounter) {
  const firstCritical = findFirstCritical(data, settings);

  return {
    total: data.length,
    counts: categoryCounter(data, settings),
    average: calculateAverage(data, settings.min, settings.max),
    minimum: findMinimum(data, settings.min, settings.max),
    maximum: findMaximum(data, settings.min, settings.max),
    firstValid: findFirstValid(data, settings.min, settings.max),
    firstCritical: firstCritical,
    recovery: findRecovery(data, settings, firstCritical),
    invalidEntries: findInvalidEntries(data, settings.min, settings.max)
  };
}

function buildConclusion(result) {
  if (result.counts.valid === 0) {
    return "коректних вимірювань немає, аналіз неможливий.";
  }
  if (result.firstCritical === null) {
    return "критичних вимірювань не зафіксовано.";
  }
  if (result.recovery === null) {
    return `зафіксовано ${result.counts.critical} ${criticalWord(result.counts.critical)}; після першого з них стійкого відновлення не виявлено.`;
  }
  return `зафіксовано ${result.counts.critical} ${criticalWord(result.counts.critical)}; відновлення настало на позиції ${result.recovery}.`;
}

function printReport(title, data, settings) {
  const result = analyzeLevels(data, settings, countByCategory);
  const exceeded = result.counts.warning + result.counts.critical;
  const average = result.average === null ? "немає даних" : `${formatNumber(result.average, 2)} dB`;
  const firstCritical = result.firstCritical === null
    ? "не знайдено"
    : `${formatLevel(result.firstCritical.value)}, позиція ${result.firstCritical.position}`;
  const recovery = result.recovery === null ? "не знайдено" : `позиція ${result.recovery}`;
  const firstValid = result.firstValid === null
    ? "не знайдено"
    : `${formatLevel(result.firstValid.value)}, позиція ${result.firstValid.position}`;

  console.group(title);
  console.log(`Пороги: попередження > ${settings.warning} dB; критичний рівень > ${settings.critical} dB`);
  console.log(`Усього вимірювань: ${result.total}`);
  console.log(`Коректних: ${result.counts.valid}`);
  console.log(`Некоректних: ${result.counts.invalid}`);
  console.table({
    "Без перевищення": { "Кількість": result.counts.safe },
    "Попередження": { "Кількість": result.counts.warning },
    "Критичні": { "Кількість": result.counts.critical }
  });
  console.log(`Середній рівень: ${average}`);
  console.log(`Мінімальний рівень: ${formatLevel(result.minimum)}`);
  console.log(`Максимальний рівень: ${formatLevel(result.maximum)}`);
  console.log(`Перше коректне вимірювання: ${firstValid}`);
  console.log(`Перше критичне вимірювання: ${firstCritical}`);
  console.log(`Відновлення -- три безпечні вимірювання поспіль: ${recovery}`);

  if (exceeded > 0) {
    console.warn(`Поріг ${settings.warning} dB перевищено у ${exceeded} вимірюваннях.`);
  }

  if (result.invalidEntries.length > 0) {
    const list = result.invalidEntries
      .map(entry => `позиція ${entry.position} (${formatLevel(entry.value)})`)
      .join(", ");
    console.error(`Некоректні дані: ${list}.`);
  }

  console.log(`Висновок: ${buildConclusion(result)}`);
  console.groupEnd();
}

printReport("Акустична варта -- звіт моніторингу", noiseLevels, limits);

console.groupCollapsed("Перевірка алгоритмів на тестових наборах");
printReport("Тест 1: порожній набір []", [], limits);
printReport("Тест 2: лише некоректні [-1, 141]", [-1, 141], limits);
printReport("Тест 3: межі порогів [70, 85, 86]", [70, 85, 86], limits);
printReport("Тест 4: перервана безпечна серія", [90, 60, 65, 75, 50, -1, 55, 62, 48], limits);
console.groupEnd();
