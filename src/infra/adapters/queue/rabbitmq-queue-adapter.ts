import amqplib from 'amqplib';

import { QueueAdapter } from '@infra/adapters/queue/queue-adapter';

export class RabbitMQqueueAdapter implements QueueAdapter {
  public constructor(private readonly channel: amqplib.Channel) {}

  async publish(name: string, data: string): Promise<void> {
    await this.channel.assertQueue(name);
    this.channel.sendToQueue(name, Buffer.from(data));
  }

  async subscribe(name: string, handler: (data: string) => void): Promise<void> {
    await this.channel.assertQueue(name);
    await this.channel.consume(name, (message) => {
      if (message) {
        handler(message.content.toString());
        this.channel?.ack(message);
      }
    });
  }
}
