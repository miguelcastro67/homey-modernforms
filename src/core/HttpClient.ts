import Logger from './Logger';

export default class HttpClient {
  constructor(private readonly logger: Logger) {}

  async postJson<TResponse>(url: string, body: object): Promise<TResponse> {
    this.logger.info(`POST ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} from ${url}`);
    }

    return (await response.json()) as TResponse;
  }
}

