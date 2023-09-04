export interface QueueAdapter {
  connect(): Promise<void>;
  publish(name: string, data: string): Promise<void>;
  subscribe(name: string, handler: (data: string) => void): Promise<void>;
}
