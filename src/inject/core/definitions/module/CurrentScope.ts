import { Injectify } from '../core'
import { Module } from './Module'

export interface CurrentScope {
  injectify: typeof Injectify
  Module: Module
}
