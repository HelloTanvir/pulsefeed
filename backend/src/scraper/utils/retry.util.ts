import { RetryOptions } from '../decorators/retry.decorator';

export class RetryUtility {
    static async withRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
        let attemptCount = 0;
        let delay = options.delayMs;

        while (true) {
            try {
                return await operation();
            } catch (error) {
                attemptCount++;

                if (attemptCount >= options.maxAttempts) {
                    throw error;
                }

                await new Promise((resolve) => setTimeout(resolve, delay));

                if (options.exponentialBackoff) {
                    delay = Math.min(delay * 2, options.maxDelayMs || Number.POSITIVE_INFINITY);
                }
            }
        }
    }
}
