export function getMaxLengthLineLength(...inputs: string[]): number {
  const lines = inputs.flatMap((input) => input.split('\n'));
  const lineLengths = lines.map((line) => line.length);
  return Math.max(...lineLengths);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry(
  operation: () => Promise<void>,
  options: {
    retries: number;
    onRetry: (error: any, attempt: number) => void;
    backoff?: number | ((attempts: number) => number);
  },
): Promise<void> {
  const { backoff = 1000 } = options;

  let attempts = 0;

  while (attempts < options.retries) {
    try {
      await operation();
      return; // Operation succeeded, exit the loop
    } catch (error) {
      attempts++;
      options.onRetry(error, attempts);

      const delayms = typeof backoff === 'number' ? backoff : backoff(attempts);

      await sleep(delayms);
    }
  }

  // If all retries failed, rethrow the last error
  throw new Error(`Operation failed after ${attempts} attempts.`);
}
