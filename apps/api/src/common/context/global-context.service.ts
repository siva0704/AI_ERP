import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface IGlobalContext {
  branchId: string;
  userId?: string;
  role?: string;
}

@Injectable()
export class GlobalContextService {
  private readonly als = new AsyncLocalStorage<IGlobalContext>();

  runWith(context: IGlobalContext, callback: () => any) {
    return this.als.run(context, callback);
  }

  get branchId(): string | undefined {
    return this.als.getStore()?.branchId;
  }

  get userId(): string | undefined {
    return this.als.getStore()?.userId;
  }

  get role(): string | undefined {
    return this.als.getStore()?.role;
  }
}
