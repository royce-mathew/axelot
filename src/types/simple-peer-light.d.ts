// simple-peer.d.ts
// TypeScript typings for simple-peer (Feross Aboukhadijeh)
declare module "simple-peer-light"

declare const MAX_BUFFERED_AMOUNT: number
declare const ICECOMPLETE_TIMEOUT: number
declare const CHANNEL_CLOSING_TIMEOUT: number

/**
 * Generate random bytes.
 */
declare function randombytes(size: number): Uint8Array

/**
 * Detects WebRTC implementation (browser or custom wrtc).
 */
declare function getBrowserRTC(): {
  RTCPeerConnection: typeof RTCPeerConnection
  RTCSessionDescription: typeof RTCSessionDescription
  RTCIceCandidate: typeof RTCIceCandidate
} | null

/**
 * Adds a `.code` property to an Error object.
 */
declare function errCode<T extends Error>(
  err: T,
  code: string
): T & { code: string }

/**
 * Remove trickle ICE options from SDP when disabled.
 */
declare function filterTrickle(sdp: string): string

/**
 * Log a warning message.
 */
declare function warn(message: string): void

/**
 * Configuration options for Peer constructor.
 */
interface PeerOptions {
  initiator?: boolean
  channelName?: string
  channelConfig?: RTCDataChannelInit
  config?: RTCConfiguration
  offerOptions?: RTCOfferOptions
  answerOptions?: RTCAnswerOptions
  sdpTransform?: (sdp: string) => string
  streams?: MediaStream[]
  stream?: MediaStream
  trickle?: boolean
  allowHalfTrickle?: boolean
  iceCompleteTimeout?: number
  debug?: boolean
  wrtc?: {
    RTCPeerConnection: typeof RTCPeerConnection
    RTCSessionDescription: typeof RTCSessionDescription
    RTCIceCandidate: typeof RTCIceCandidate
  }
}

/**
 * Peer signal data (offer, answer, candidate, renegotiation, etc.)
 */
interface PeerSignalData {
  type?: "offer" | "answer" | "candidate" | "renegotiate" | "transceiverRequest"
  sdp?: string
  candidate?: RTCIceCandidateInit
  renegotiate?: boolean
  transceiverRequest?: {
    kind: string
    init?: RTCRtpTransceiverInit
  }
}

/**
 * Event map for Peer events.
 */
interface PeerEventMap {
  connect: () => void
  close: () => void
  error: (err: Error) => void
  signal: (data: PeerSignalData) => void
  iceTimeout: () => void
  iceStateChange: (
    iceConnectionState: RTCIceConnectionState,
    iceGatheringState: RTCIceGatheringState
  ) => void
  signalingStateChange: (state: RTCSignalingState) => void
  negotiated: () => void
  data: (data: ArrayBuffer | string) => void
  stream: (stream: MediaStream) => void
  track: (track: MediaStreamTrack, stream: MediaStream) => void
}

/**
 * Simplified event emitter interface used by Peer.
 */
interface EventEmitter {
  on<K extends keyof PeerEventMap>(event: K, listener: PeerEventMap[K]): this
  once<K extends keyof PeerEventMap>(event: K, listener: PeerEventMap[K]): this
  off<K extends keyof PeerEventMap>(event: K, listener: PeerEventMap[K]): this
  emit<K extends keyof PeerEventMap>(
    event: K,
    ...args: Parameters<PeerEventMap[K]>
  ): boolean
}

/**
 * WebRTC peer connection wrapper.
 */
declare class Peer implements EventEmitter {
  constructor(opts?: PeerOptions)

  /** Whether this peer is the initiator */
  initiator: boolean

  /** Local connection info */
  localAddress?: string
  localFamily?: "IPv4" | "IPv6"
  localPort?: number

  /** Remote connection info */
  remoteAddress?: string
  remoteFamily?: "IPv4" | "IPv6"
  remotePort?: number

  /** Whether the peer is connected */
  readonly connected: boolean

  /** Buffered amount for data channel */
  readonly bufferSize: number

  /** Send data over the data channel */
  send(chunk: ArrayBufferView | ArrayBuffer | string | Blob): void

  /** Signal data to/from the remote peer */
  signal(data: PeerSignalData | string): void

  /** Add a MediaStream to the connection */
  addStream(stream: MediaStream): void

  /** Remove a MediaStream from the connection */
  removeStream(stream: MediaStream): void

  /** Add a MediaStreamTrack */
  addTrack(track: MediaStreamTrack, stream: MediaStream): void

  /** Remove a MediaStreamTrack */
  removeTrack(track: MediaStreamTrack, stream: MediaStream): void

  /** Replace a MediaStreamTrack */
  replaceTrack(
    oldTrack: MediaStreamTrack,
    newTrack: MediaStreamTrack,
    stream: MediaStream
  ): void

  /** Manually start negotiation */
  negotiate(): void

  /** Close and clean up */
  destroy(err?: Error): void

  /** Return address info */
  address(): { port?: number; family?: string; address?: string }

  /** Get connection statistics */
  getStats(
    cb: (err: Error | null, reports: RTCStatsReport | RTCStatsReport[]) => void
  ): void

  // EventEmitter interface
  on<K extends keyof PeerEventMap>(event: K, listener: PeerEventMap[K]): this
  once<K extends keyof PeerEventMap>(event: K, listener: PeerEventMap[K]): this
  off<K extends keyof PeerEventMap>(event: K, listener: PeerEventMap[K]): this
  emit<K extends keyof PeerEventMap>(
    event: K,
    ...args: Parameters<PeerEventMap[K]>
  ): boolean
}

/**
 * Default exports
 */
export {
  Peer,
  PeerOptions,
  PeerSignalData,
  PeerEventMap,
  randombytes,
  getBrowserRTC,
  errCode,
  filterTrickle,
  warn,
  MAX_BUFFERED_AMOUNT,
  ICECOMPLETE_TIMEOUT,
  CHANNEL_CLOSING_TIMEOUT,
}

export default Peer
