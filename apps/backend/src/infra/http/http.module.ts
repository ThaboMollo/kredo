import { Module } from '@nestjs/common';
import { LeadsController } from './controllers/leads.controller';
import { ConsumerController } from './controllers/consumer.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { RepaymentController } from './controllers/repayment.controller';
import { CreditController } from './controllers/credit.controller';

@Module({
  controllers: [LeadsController, ConsumerController, SubscriptionController, RepaymentController, CreditController],
})
export class HttpModule {}
