import { Logger } from '@nestjs/common';

export interface RetryOptions {
    maxAttempts: number;
    delayMs: number;
    exponentialBackoff?: boolean;
    maxDelayMs?: number;
}

export function Retry(options: RetryOptions) {
    const logger = new Logger('RetryDecorator');

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let attemptCount = 0;
            let delay = options.delayMs;

            while (attemptCount < options.maxAttempts) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    attemptCount++;

                    if (attemptCount === options.maxAttempts) {
                        logger.error(
                            `Failed after ${options.maxAttempts} attempts for ${propertyKey}. Last error: ${error.message}`
                        );
                        throw error;
                    }

                    logger.warn(
                        `Attempt ${attemptCount}/${options.maxAttempts} failed for ${propertyKey}. Retrying in ${delay}ms...`
                    );

                    await new Promise((resolve) => setTimeout(resolve, delay));

                    if (options.exponentialBackoff) {
                        delay = Math.min(delay * 2, options.maxDelayMs || Number.POSITIVE_INFINITY);
                    }
                }
            }
        };

        return descriptor;
    };
}
