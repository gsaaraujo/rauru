import amqplib from 'amqplib';

import { QueueAdapter } from '@application/adapters/queue-adapter';

export class RabbitMQqueueAdapter implements QueueAdapter {
  public constructor(private readonly channel: amqplib.Channel) {}

  async publish(name: string, data: string): Promise<void> {
    await this.channel.assertQueue(name, { durable: true });
    this.channel.sendToQueue(name, Buffer.from(data), { persistent: true });
  }

  async subscribe(name: string, handler: (data: string) => Promise<boolean>): Promise<void> {
    await this.channel.assertQueue(name, { durable: true });
    await this.channel.consume(name, async (message) => {
      if (message) {
        const isSuccess: boolean = await handler(message.content.toString());

        if (isSuccess) {
          this.channel?.ack(message);
        }
      }
    });
  }
}
