export interface QueueAdapter {
  publish(name: string, data: string): Promise<void>;
  subscribe(name: string, handler: (data: string) => Promise<boolean>): Promise<void>;
}
