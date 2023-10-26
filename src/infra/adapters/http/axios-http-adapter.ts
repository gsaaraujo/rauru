import axios from 'axios';

import { HttpAdapter } from '@infra/adapters/http/http-adapter';

export class AxiosHttpAdapter implements HttpAdapter {
  async get<T>(url: string): Promise<T> {
    const response = await axios.get(url);
    return response.data;
  }

  async post<T>(url: string, body: T): Promise<void> {
    await axios.post(url, body);
  }

  async put<T>(url: string, body: T): Promise<void> {
    await axios.put(url, body);
  }

  async delete(url: string): Promise<void> {
    await axios.delete(url);
  }
}
