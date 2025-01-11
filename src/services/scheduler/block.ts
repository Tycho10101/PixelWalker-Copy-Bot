import Scheduler from './base.js'

import { WorldBlockPlacedPacket } from 'pw-js-api/dist/gen/world_pb'
import { PWGameClient } from 'pw-js-api'
import { usePWClientStore } from '@/stores/PWClient.ts'

type Change = {
  x: number
  y: number
  layer: number
  blockId: number
  extraFields: Uint8Array
}

export default class BlockScheduler extends Scheduler<Change> {
  override LOOP_FREQUENCY = 25
  override ELEMENTS_PER_TICK = 200
  override INBETWEEN_DELAY = 5
  override RETRY_FREQUENCY = 500

  public BLOCKS_PER_TICK = 400

  PWClientStore = usePWClientStore()

  constructor(private pwGameClient: PWGameClient) {
    super(pwGameClient)

    pwGameClient.addCallback('worldBlockPlacedPacket', ({ positions, layer, blockId, extraFields }) => {
      for (const { x, y } of positions) {
        this.receive(
          this.createKey({
            x,
            y,
            layer,
            blockId,
            extraFields,
          }),
        )
      }
    })
  }

  protected override verify({ layer, x, y, blockId, extraFields }: Change): boolean {
    if (![0, 1].includes(layer)) throw new Error(`Layer expected to be 0 or 1, got ${layer}`)

    const world = this.PWClientStore.world!
    if (x < 0 || x >= world.width) throw new Error(`X out of bounds: 0 <= ${x} < ${world.width}`)
    if (y < 0 || y >= world.height) throw new Error(`Y out of bounds: 0 <= ${y} < ${world.height}`)

    return false
  }

  protected override createKey({ layer, x, y, blockId, extraFields }: Change): string {
    return `${layer}-${x}-${y}-${blockId}-${extraFields}`
  }

  public override trySend({ blockId, layer, extraFields, x, y }: Change): void {
    const args: WorldBlockPlacedPacket = {
      $typeName: 'WorldPackets.WorldBlockPlacedPacket',
      isFillOperation: false,
      blockId,
      layer,
      extraFields,
      positions: [
        {
          $typeName: 'WorldPackets.PointInteger',
          x,
          y,
        },
      ],
    }

    this.entries()
      .filter(([key, entry]) => {
        if (entry.value.blockId !== blockId || entry.value.layer !== layer) return false
        if (entry.value.extraFields.length !== extraFields.length) return false

        for (let i = 0; i < extraFields.length; i++) {
          if (entry.value.extraFields[i] !== extraFields[i]) return false
        }

        return true
      })
      .slice(0, this.BLOCKS_PER_TICK)
      .forEach(([_, entry]) => {
        entry.ignoreThisLoop = true
        args.positions.push({
          $typeName: 'WorldPackets.PointInteger',
          x: entry.value.x,
          y: entry.value.y,
        })
      })

    this.pwGameClient.send('worldBlockPlacedPacket', args)
  }
}
