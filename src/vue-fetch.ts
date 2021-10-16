import { EventEmitter } from '@andrewcaires/utils.js';
import Vue, { PluginObject } from 'vue';

export interface VueFetchOptions {
  url?: string;
  headers?: VueFetchHeaders;
  logging?: VueFetchLog;
  timeout?: number;
}

export interface VueFetchBody {
  json: boolean;
  parse: any;
}

export type VueFetchHeaders = { [key: string]: string }

export interface VueFetchInit {
  url?: string;
  path: string;
  query?: VueFetchQuery;
  method: string;
  body?: any;
  headers?: VueFetchHeaders;
  timeout?: number;
}

export type VueFetchLog = (data: any) => void

export type VueFetchQuery = { [key: string]: string }

export interface VueFetchRequest {
  url: string;
  method: string
  body: any
  signal: AbortSignal;
  headers: VueFetchHeaders;
}

export interface VueFetchResponse {
  data?: any;
  error?: string;
  raw?: Response;
}

const DefaultOptions: VueFetchOptions = {

  url: '',
  headers: {},
  timeout: 5000,
};

class Fetch extends EventEmitter {

  private options: VueFetchOptions;

  constructor(options: VueFetchOptions) {

    super();

    this.options = { ...DefaultOptions, ...options };
  }

  create(options: VueFetchOptions = {}) {
    return new Fetch({ ...this.options, ...options });
  }

  async del(path: string, query?: VueFetchQuery): Promise<VueFetchResponse> {
    return this.fetch({ method: 'delete', path, query });
  }

  async get(path: string, query?: VueFetchQuery): Promise<VueFetchResponse> {
    return this.fetch({ method: 'get', path, query });
  }

  async patch(path: string, body: any, query?: VueFetchQuery): Promise<VueFetchResponse> {
    return this.fetch({ method: 'patch', path, query, body });
  }

  async post(path: string, body: any, query?: VueFetchQuery): Promise<VueFetchResponse> {
    return this.fetch({ method: 'post', path, query, body });
  }

  async put(path: string, body: any, query: VueFetchQuery): Promise<VueFetchResponse> {
    return this.fetch({ method: 'put', path, query, body });
  }

  async fetch(init: VueFetchInit): Promise<VueFetchResponse> {

    const request = this.request(init);

    const response: VueFetchResponse = {};

    try {

      this.emit('before', request);

      response.raw = await fetch(request.url, request);

      response.data = await this.data(response.raw);

      this.emit('complete', response);

      this.options.logging && this.options.logging(response);

    } catch (e: any) {

      this.emit('error', e);

      response.error = e.message;

      this.options.logging && this.options.logging(e);
    }

    return response;
  }

  private data(response: Response) {

    const type = response.headers.get('Content-Type')?.toLowerCase() || '';

    const text = type.indexOf('text/html') >= 0;
    const json = type.indexOf('application/json') >= 0;

    return !type || text ? response.text() : json ? response.json() : response.blob();
  }

  private request({ url, path, query, method, body, headers, timeout }: VueFetchInit): VueFetchRequest {

    const params = this.query(query);

    url = this.url(url, path, params);

    method = method.toUpperCase();

    const { json, parse } = this.body(body);

    headers = this.headers(headers);

    if (json) {

      headers['Content-Type'] = 'application/json';
    }

    const signal = this.signal(timeout);

    return { url, method, body: parse, headers, signal };
  }

  private body(body: any): VueFetchBody {

    const raw = typeof body === 'string'
    const json = !(body instanceof Blob || body instanceof FormData || raw);

    return { json, parse: json ? body ? JSON.stringify(body) : null : body };
  }

  private headers(headers?: VueFetchHeaders) {

    return { ...this.options.headers, ...headers };
  }

  private query(query?: VueFetchQuery): string | undefined {

    const keys = Object.keys(query || {});

    const params = new URLSearchParams();

    if (query) {

      keys.forEach((key) => params.set(key, query[key]));
    }

    return keys.length ? '?' + params.toString() : undefined
  }

  private signal(timeout?: number): AbortSignal {

    const controller = new AbortController;

    if (timeout || this.options.timeout) {

      setTimeout(() => controller.abort(), timeout || this.options.timeout);
    }

    return controller.signal;
  }

  private url(url?: string, path?: string, query?: string): string {

    return [url, path, query].filter((value) => {

      return value !== undefined;

    }).map((value) => {

      return value?.toString().replace(/(^\/+|\/+$)/mg, '');

    }).join('/');
  }
}

export const VueFetch: PluginObject<VueFetchOptions> = {

  install(vue: any, options: VueFetchOptions = {}): void {

    Vue.$fetch =  new Fetch(options);
    Vue.prototype.$fetch = Vue.$fetch;
  },
};

declare module 'vue/types/vue' {
  interface Vue {
    $fetch: Fetch;
  }
  interface VueConstructor {
    $fetch: Fetch;
  }
}

export default VueFetch;
