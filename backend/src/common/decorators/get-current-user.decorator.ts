import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
    (key: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        if (!key) return request.user;

        return request.user ? request.user[key] : null;
    }
);
