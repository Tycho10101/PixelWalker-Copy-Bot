import Structure from './structure.js'
import Block from './block.js'

import BlockScheduler from '../scheduler/block.js'
import { PWGameClient } from 'pw-js-api'
import { WorldMeta } from 'pw-js-api/dist/gen/world_pb'
import BufferReader from '@/services/BufferReader.ts'

// export type WorldEvents = {
//     Init: [Structure];
// };

/**
 * A World is a structure wrapper synchronized with a client.
 */
export default class World {
  /**
   * The metadata of the structure. This attribute can be used
   * to store additional information about the structure.
   */
  public get meta(): WorldMeta | undefined {
    return this.structure?.meta
  }

  /**
   * The internal reference to a structure instance. This attribute
   * is undefined, if the world did not process `PlayerInit` yet.
   */
  public structure!: Structure<WorldMeta>

  /**
   * The width of the world.
   */
  public get width(): number {
    return this.structure.width
  }

  /**
   * The height of the world.
   */
  public get height(): number {
    return this.structure.height
  }

  public constructor(
    private pwGameClient: PWGameClient,
    private scheduler: BlockScheduler,
  ) {
    pwGameClient.addCallback('playerInitPacket', (data) => {
      const buffer = BufferReader.from(data.worldData)

      this.structure = new Structure(data.worldWidth, data.worldHeight).deserialize(buffer) as Structure<WorldMeta>
      this.structure.meta = data.worldMeta!

      if (buffer.subarray().length) {
        console.error(`WorldSerializationFault: World data buffer has ${buffer.subarray().length} remaining bytes.`)
        return
      }
    })

    pwGameClient.addCallback('worldReloadedPacket', (data) => {
      const buffer = BufferReader.from(data.worldData)
      const width = this.structure.width
      const height = this.structure.height
      const oldMeta = this.structure.meta

      this.structure = new Structure(width, height).deserialize(buffer) as Structure<WorldMeta>
      this.structure.meta = oldMeta

      if (buffer.subarray().length) {
        console.error(`WorldSerializationFault: World data buffer has ${buffer.subarray().length} remaining bytes.`)
        return
      }
    })

    pwGameClient.addCallback('worldBlockPlacedPacket', (data) => {
      const block = new Block(data.blockId)
      block.deserialize_args(BufferReader.from(data.extraFields), true)

      for (const { x, y } of data.positions) {
        this.structure![data.layer][x][y] = block
      }
    })
  }

  //
  //
  // EVENTS
  //
  //

  /**
   * Adds the listener function to the end of the listeners array for the
   * event named `eventName`. No checks are made to see if the listener has
   * already been added. Multiple calls passing the same combination of
   * `eventNameand` listener will result in the listener being added, and called,
   * multiple times.
   */
  // public listen<Event extends keyof WorldEvents>(eventName: Event, cb: (...args: WorldEvents[Event]) => void): this {
  //     this.events.on(eventName, cb as any);
  //     return this;
  // }

  //
  //
  // METHODS
  //
  //

  public async paste(xt: number, yt: number, fragment: Structure) {
    const promises: Promise<boolean>[] = []

    for (let x = 0; x < fragment.width; x++) {
      if (x + xt < 0 && x + xt >= this.width) continue

      for (let y = 0; y < fragment.height; y++) {
        if (y + yt < 0 || y + yt >= this.height) continue

        for (let layer: any = 0; layer < Structure.LAYER_COUNT; layer++) {
          const block = fragment[layer][x][y] ?? new Block('empty')
          // if (block.id === 0 && !args.write_empty) continue;
          // to_be_placed.push([[layer, x + xt, y + yt], block]);

          await this.scheduler.send({
            // $typeName: 'WorldPackets.WorldBlockPlacedPacket',
            // playerId: 0,
            // isFillOperation: false,
            extraFields: block.serialize_args(),
            x: x + xt,
            y: y + yt,
            // positions: [{ $typeName: 'WorldPackets.PointInteger', x: x + xt, y:y + yt }],
            layer,
            blockId: block.id,
          })
        }
      }
    }

    return Promise.all(promises)
  }

  // public isInitialized(): this is World<true> {
  //     return this.structure !== undefined;
  // }
}
