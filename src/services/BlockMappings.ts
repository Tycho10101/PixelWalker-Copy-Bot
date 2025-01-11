import { PWApiClient } from 'pw-js-api'
import { Endpoint } from '@/constants/Endpoints.ts'

const data = await PWApiClient.request<Record<string, number>>(`${Endpoint.GameHTTP}/mappings`)

export const BlockMappings: { [keys: string]: number } = data
export const BlockMappingsReverse: { [keys: number]: string } = Object.fromEntries(
  Object.entries(data).map((a) => a.reverse()),
)
