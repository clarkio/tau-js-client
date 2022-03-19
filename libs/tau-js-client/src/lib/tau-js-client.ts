import { merge, NEVER, Observable } from 'rxjs';
import { createEventWebSocket } from './events/event-socket';
import { TauEvent } from './events/tau-event';
import { createMessageWebSocket } from './messages/message-socket';
import { TauMessage } from './messages/message.model';
import { createStatusWebSocket } from './status/status-socket';
import { TauStatus } from './status/status.model';
import { TauSocketMessage } from './tau-js-client.model';

export { postMessage } from './messages/message-socket';

export interface TauConfig {
  /* The url where TAU is hosted. */
  domain: string;
  /* The port number where TAU is hosted. */
  port: number;
  /** Token to authenticate with TAU */
  token: string;
  /* Flag to indicate whether event messages should be emitted. */
  events?: boolean;
  /* Flag to indicate whether chat messages should be emitted. */
  messages?: boolean;
  /* Flag to indicate whether status messages should be emitted. */
  statuses?: boolean;
  /**
   * A WebSocket constructor to use. This is necessary for usage in Node,
   * because WebSocket is a DOM API.
   */
  WebSocketCtor?: {
    new (url: string, protocols?: string | string[]): WebSocket;
  };
}

let obs: Observable<TauSocketMessage> | null = null;
export function getTauClient(config: TauConfig): Observable<TauSocketMessage> {
  if (obs === null) {
    obs = buildWsObservable(config);
  }
  return obs;
}

function buildWsObservable(config: TauConfig): Observable<TauSocketMessage> {
  const event$ = config.events
    ? createEventWebSocket(config)
    : (NEVER as Observable<TauEvent>);

  const message$ = config.messages
    ? createMessageWebSocket(config)
    : (NEVER as Observable<TauMessage>);

  const status$ = config.statuses
    ? createStatusWebSocket(config)
    : (NEVER as Observable<TauStatus>);

  return merge(event$, message$, status$);
}
