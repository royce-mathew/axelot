// import { type Node } from "unist-builder/lib"
import { Node } from "unist"

export interface UnistNode extends Node {
  type: string
  name?: string
  tagName?: string
  __raw__?: string
  value?: string
  properties?: {
    __raw__?: string
    className?: string
    [key: string]: unknown
  }
  attributes?: {
    name: string
    value: unknown
    type?: string
  }[]
  children?: UnistNode[]
}

export interface UnistTree extends Node {
  children: UnistNode[]
}
