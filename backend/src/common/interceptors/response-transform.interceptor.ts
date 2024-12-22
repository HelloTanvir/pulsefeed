import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
    error: null;
}

@Injectable()
export class ResponseTransformInterceptor<T extends { message?: string }>
    implements NestInterceptor<T, Response<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>
    ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
        return next.handle().pipe(
            map((data) => {
                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message: data.message || '',
                    data: data,
                    error: null,
                };
            })
        );
    }
}
