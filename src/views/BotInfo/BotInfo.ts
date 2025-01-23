import { defineComponent, onBeforeMount, ref } from 'vue'
import { usePWClientStore } from '@/stores/PWClient.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'
import { BlockNames, PWApiClient, PWGameClient } from 'pw-js-api'
import { PlayerChatPacket, PointInteger, WorldBlockPlacedPacket } from 'pw-js-api/dist/gen/world_pb'
import { cloneDeep } from 'lodash-es'
import {
  Block,
  ComponentTypeHeader,
  LayerType,
  IPlayer,
  PWGameWorldHelper,
} from 'pw-js-world'
import { equals } from 'uint8arrays/equals'
import { Point, SendableBlockPacket } from 'pw-js-world/dist/types'

export default defineComponent({
  setup() {
    const loading = { loading: ref(false) }

    const PWClientStore = usePWClientStore()
    const router = useRouter()

    const pwGameWorldHelper = new PWGameWorldHelper()

    const getPwGameClient = (): PWGameClient => {
      return PWClientStore.pwGameClient!
    }
    const getPwApiClient = (): PWApiClient => {
      return PWClientStore.pwApiClient!
    }
    const getPwGameWorldHelper = (): PWGameWorldHelper => {
      return pwGameWorldHelper
    }

    enum BotState {
      NONE = 0,
      SELECTED_FROM = 1,
      SELECTED_TO = 2,
    }

    type BlockInfo = {
      x: number
      y: number
      layer: LayerType
      block: Block
    }

    // Bot data
    // TODO: move it later elsewhere
    // TODO: store this for each player independently
    let botState: BotState = BotState.NONE
    let selectedFromPos: Point
    let selectedToPos: Point
    let selectedAreaData: BlockInfo[] = []

    onBeforeMount(async () => {
      getPwGameClient()
        .addHook(getPwGameWorldHelper().receiveHook)
        .addCallback('playerChatPacket', playerChatPacketReceived)
        .addCallback('worldBlockPlacedPacket', worldBlockPlacedPacketReceived)
    })

    function playerChatPacketReceived(data: PlayerChatPacket) {
      const args = data.message.split(' ')

      switch (args[0].toLowerCase()) {
        case '.ping':
          getPwGameClient().send('playerChatPacket', {
            message: 'pong',
          })
          break
      }
    }

    function worldBlockPlacedPacketReceived(
      data: WorldBlockPlacedPacket,
      states?: { player: IPlayer | undefined; oldBlocks: Block[]; newBlocks: Block[] },
    ) {
      if (data.playerId === PWClientStore.selfPlayerId) {
        return
      }

      if(states === undefined){
        return
      }

      const blockPos = data.positions[0]

      if (data.blockId === BlockNames.COIN_GOLD) {
        const oldBlock = states.oldBlocks[0]
        const blockPacket = getPwGameWorldHelper().createBlockPacket(oldBlock, LayerType.Foreground, blockPos)

        placeBlock(blockPacket)

        let selectedTypeText: string
        if ([BotState.NONE, BotState.SELECTED_TO].includes(botState)) {
          selectedTypeText = 'from'
          botState = BotState.SELECTED_FROM
          selectedFromPos = blockPos
        } else {
          selectedTypeText = 'to'
          botState = BotState.SELECTED_TO
          selectedToPos = blockPos

          selectedAreaData = getSelectedAreaCopy(oldBlock)
        }

        sendChatMessage(`Selected ${selectedTypeText} x: ${blockPos.x} y: ${blockPos.y}`)
      }

      if (data.blockId === BlockNames.COIN_BLUE) {
        placeMultipleBlocks(blockPos, selectedAreaData)
      }
    }

    function getSelectedAreaCopy(oldBlock: Block) {
      let data: BlockInfo[] = []
      const dirX = selectedFromPos.x <= selectedToPos.x ? 1 : -1
      const dirY = selectedFromPos.y <= selectedToPos.y ? 1 : -1
      for (let x = 0; x <= Math.abs(selectedFromPos.x - selectedToPos.x); x++) {
        for (let y = 0; y <= Math.abs(selectedFromPos.y - selectedToPos.y); y++) {
          const sourcePosX = selectedFromPos.x + x * dirX
          const sourcePosY = selectedFromPos.y + y * dirY
          const dataPosX = x * dirX
          const dataPosY = y * dirY

          let foregroundBlock = getPwGameWorldHelper().getBlockAt(sourcePosX, sourcePosY, LayerType.Foreground)
          if(sourcePosX === selectedToPos.x && sourcePosY === selectedToPos.y){
            foregroundBlock = oldBlock
          }

          data.push({
            block: foregroundBlock,
            x: dataPosX,
            y: dataPosY,
            layer: LayerType.Foreground,
          })
          data.push({
            block: getPwGameWorldHelper().getBlockAt(sourcePosX, sourcePosY, LayerType.Background),
            x: dataPosX,
            y: dataPosY,
            layer: LayerType.Background,
          })
        }
      }
      return data
    }

    function placeBlock(blockPacket: SendableBlockPacket) {
      getPwGameClient().send('worldBlockPlacedPacket', blockPacket)
    }

    function placeMultipleBlocks(offsetPos: Point, blockData: BlockInfo[]) {
      let blocks = cloneDeep(blockData)

      // TODO: move this to pw-js-world
      const packets: SendableBlockPacket[] = []
      for (const block of blocks) {
        let found = false
        const placePos = {
          x: block.x + offsetPos.x,
          y: block.y + offsetPos.y,
        }
        const blockPacket: SendableBlockPacket = getPwGameWorldHelper().createBlockPacket(block.block, block.layer, placePos)
        for (const packet of packets) {
          // 200 arbitrary limit, preferably constant should be used
          const MAX_WORLD_BLOCK_PLACED_PACKET_POSITION_SIZE = 200
          if (packet.positions.length >= MAX_WORLD_BLOCK_PLACED_PACKET_POSITION_SIZE) {
            continue
          }
          if (packet.blockId !== block.block.bId) {
            continue
          }
          if (packet.layer !== block.layer) {
            continue
          }
          if (!equals(packet.extraFields!, blockPacket.extraFields!)) {
            continue
          }
          // TODO: filter identical positions
          packet.positions.push(placePos)
          found = true
        }
        if (!found) {
          packets.push(blockPacket)
        }
      }

      for (const packet of packets) {
        placeBlock(packet)
      }
    }

    function sendChatMessage(message: string) {
      getPwGameClient().send('playerChatPacket', {
        message: `[BOT] ${message}`,
      })
    }

    async function onDisconnectButtonClick() {
      getPwGameClient().disconnect(false)

      PWClientStore.pwGameClient = undefined
      PWClientStore.pwApiClient = undefined
      await router.push({ name: LoginRoute.name })
    }

    return {
      loading,
      onDisconnectButtonClick,
    }
  },
})
