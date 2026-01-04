const SPINNER_FRAMES = ['|', '/', '-', '\\'];

export function startSpinner(message) {
  if (!process.stdout.isTTY) {
    return () => {};
  }

  let index = 0;
  process.stdout.write(`${SPINNER_FRAMES[index]} ${message}`);
  const interval = setInterval(() => {
    index = (index + 1) % SPINNER_FRAMES.length;
    process.stdout.write(`\r${SPINNER_FRAMES[index]} ${message}`);
  }, 120);

  return () => {
    clearInterval(interval);
    process.stdout.write(`\r✓ ${message}\n`);
  };
}
