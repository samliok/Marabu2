import { Literal, Record, String, Array, Union, Static, Dictionary } from 'runtypes'

export const HelloMessage = Record({
  type: Literal('hello'),
  version: String,
  agent: String
})
export type HelloMessageType = Static<typeof HelloMessage>

export const GetPeersMessage = Record({
  type: Literal('getpeers')
})
export type GetPeersMessageType = Static<typeof GetPeersMessage>

export const PeersMessage = Record({
  type: Literal('peers'),
  peers: Array(String)
})
export type PeersMessageType = Static<typeof PeersMessage>

export const IHaveObjectMessage = Record({
  type: Literal('ihaveobject'),
  objectid: String
})
export type IHaveObjectMessageType = Static<typeof IHaveObjectMessage>

export const GetObjectMessage = Record({
  type: Literal('getobject'),
  objectid: String
})
export type GetObjectMessageType = Static<typeof GetObjectMessage>

export const ObjectMessage = Record({
  type: Literal('object'),
  object: Record({
    type: Literal('block'),
    txids: Array(String),
    nonce: String,
    previd: String,
    created: String,
    T: String
  })
})
export type ObjectMessageType = Static<typeof ObjectMessage>



export const ErrorMessage = Record({
  type: Literal('error'),
  error: String
})
export type ErrorMessageType = Static<typeof ErrorMessage>

export const Message = Union(HelloMessage, GetPeersMessage, PeersMessage, IHaveObjectMessage, GetObjectMessage, ObjectMessage, ErrorMessage)
export type MessageType = Static<typeof Message>

export const Messages = [HelloMessage, GetPeersMessage, PeersMessage, IHaveObjectMessage, GetObjectMessage, ObjectMessage, ErrorMessage]
