import { Global, Module } from '@nestjs/common';
import { GlobalContextService } from './global-context.service';

@Global()
@Module({
    providers: [GlobalContextService],
    exports: [GlobalContextService],
})
export class GlobalContextModule { }
