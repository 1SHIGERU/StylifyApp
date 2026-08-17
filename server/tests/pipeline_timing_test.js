const BASE_URL = process.env.BASE_URL || 'http://localhost:13000';
const ITERATIONS = Number(process.env.ITERATIONS || 20);

const messages = [
  'Moj numer telefonu to 501 234 567, zadzwon wieczorem.',
  'Wyslij pieniadze na konto PL61 1090 1014 0000 0712 1981 2874.',
  'Napisz do mnie na adres test@example.com.',
  'Czy przesylka moze dotrzec do paczkomatu w poniedzialek?',
  'Dziekuje za oferte, zastanowie sie i odpowiem jutro.',
  'Dogadajmy szczegoly poza platforma, bedzie taniej.',
  'Jestes oszustem i jeszcze tego pozalujesz.',
];

function percentile(sortedValues, percentileValue) {
  if (sortedValues.length === 0) return null;
  const index = Math.ceil((percentileValue / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

function summarize(values) {
  if (values.length === 0) {
    return { count: 0, avg: null, p95: null, p99: null };
  }

  const sorted = [...values].sort((a, b) => a - b);
  return {
    count: sorted.length,
    avg: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

function format(value) {
  return value === null ? 'n/a' : `${value.toFixed(2)} ms`;
}

function printRow(name, stats) {
  console.log(
    `${name.padEnd(18)} ${String(stats.count).padStart(7)} ` +
    `${format(stats.avg).padStart(14)} ${format(stats.p95).padStart(14)} ` +
    `${format(stats.p99).padStart(14)}`,
  );
}

async function classify(message) {
  const response = await fetch(`${BASE_URL}/chat/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const body = await response.json();
  if (body.devInfo?.fallback) {
    throw new Error('Serwis ML uzyl fallbacku, pomiar nie jest miarodajny.');
  }
  if (!body.devInfo?.timings) {
    throw new Error('Odpowiedz nie zawiera devInfo.timings.');
  }

  return body.devInfo.timings;
}

async function main() {
  const presidioTimes = [];
  const herbertTimes = [];
  const hybridTimes = [];
  const hybridPresidioOnlyTimes = [];
  const hybridPresidioHerbertTimes = [];

  // Warm-up modeli i polaczen HTTP. Wyniki rozgrzewki nie trafiaja do raportu.
  for (const message of messages) {
    await classify(message);
  }

  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    for (const message of messages) {
      const timings = await classify(message);
      presidioTimes.push(timings.presidioMs);
      hybridTimes.push(timings.totalMs);

      if (timings.herbertMs !== null) {
        herbertTimes.push(timings.herbertMs);
        hybridPresidioHerbertTimes.push(timings.totalMs);
      } else {
        hybridPresidioOnlyTimes.push(timings.totalMs);
      }
    }
  }

  console.log('\nCzasy wykonania potoku Modulu D');
  console.log(`URL: ${BASE_URL}/chat/classify, iteracje: ${ITERATIONS}`);
  console.log('');
  console.log(
    `${'Pomiar'.padEnd(18)} ${'Liczba'.padStart(7)} ` +
    `${'Srednia'.padStart(14)} ${'p95'.padStart(14)} ${'p99'.padStart(14)}`,
  );
  console.log('-'.repeat(71));
  printRow('B - Presidio', summarize(presidioTimes));
  printRow('C - HerBERT', summarize(herbertTimes));
  printRow('D - caly potok', summarize(hybridTimes));
  printRow('D - tylko B', summarize(hybridPresidioOnlyTimes));
  printRow('D - B + C', summarize(hybridPresidioHerbertTimes));
}

main().catch((error) => {
  console.error(`\nBlad pomiaru: ${error.message}`);
  process.exitCode = 1;
});
