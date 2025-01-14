import { defineComponent, onBeforeMount, ref } from 'vue'
import { usePWClientStore } from '@/stores/PWClient.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import { PlayerChatPacket, PointInteger, WorldBlockPlacedPacket } from 'pw-js-api/dist/gen/world_pb'
import World from '@/services/world/world.ts'
import BlockScheduler from '@/services/scheduler/block.ts'
import { BlockMappings } from '@/services/BlockMappings.ts'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
  setup() {
    const loading = { loading: ref(false) }

    const PWClientStore = usePWClientStore()
    const router = useRouter()

    const getPwGameClient = (): PWGameClient => {
      return PWClientStore.pwGameClient!
    }
    const getPwApiClient = (): PWApiClient => {
      return PWClientStore.pwApiClient!
    }
    const getWorld = (): World => {
      return PWClientStore.world!
    }

    enum BotState {
      NONE = 0,
      SELECTED_FROM = 1,
      SELECTED_TO = 3,
    }

    // Bot data
    // TODO: move it later elsewhere
    // TODO: store this for each player independently
    let botState: BotState = BotState.NONE
    let selectedFromPos: { x: number; y: number }
    let selectedToPos: { x: number; y: number }
    let selectedAreaData: { x: number; y: number; blockId: number }[] = []

    onBeforeMount(async () => {
      getPwGameClient().addCallback('playerChatPacket', playerChatPacketReceived)
      getPwGameClient().addCallback('worldBlockPlacedPacket', worldBlockPlacedPacketReceived)

      // A hack! We should not depend on the order that calls get registered!
      // However, we want to see old map data in worldBlockPlacedPacketReceived
      PWClientStore.world = new World(getPwGameClient(), new BlockScheduler(getPwGameClient()))
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

    function worldBlockPlacedPacketReceived(data: WorldBlockPlacedPacket) {
      if (data.playerId === PWClientStore.selfPlayerId) {
        return
      }

      const blockPos = data.positions[0]

      if (data.blockId === BlockMappings['coin_gold']) {
        const oldBlockId = getWorld().structure.foreground[blockPos.x][blockPos.y].id

        placeBlock(oldBlockId, 1, { x: blockPos.x, y: blockPos.y })

        let selectedTypeText: string
        if ([BotState.NONE, BotState.SELECTED_TO].includes(botState)) {
          selectedTypeText = 'from'
          botState = BotState.SELECTED_FROM
          selectedFromPos = blockPos
        } else {
          selectedTypeText = 'to'
          botState = BotState.SELECTED_TO
          selectedToPos = blockPos

          selectedAreaData = getSelectedAreaCopy()
        }

        sendChatMessage(`Selected ${selectedTypeText} x: ${blockPos.x} y: ${blockPos.y}`)
      }

      if (data.blockId === BlockMappings['coin_blue']) {
        placeMultipleBlocks(blockPos, selectedAreaData, 1)
      }
    }

    function getSelectedAreaCopy() {
      let data = []
      const dirX = selectedFromPos.x <= selectedToPos.x ? 1 : -1
      const dirY = selectedFromPos.y <= selectedToPos.y ? 1 : -1
      for (let x = 0; x <= Math.abs(selectedFromPos.x - selectedToPos.x); x++) {
        for (let y = 0; y <= Math.abs(selectedFromPos.y - selectedToPos.y); y++) {
          const sourcePosX = selectedFromPos.x + x * dirX
          const sourcePosY = selectedFromPos.y + y * dirY
          const dataPosX = x * dirX
          const dataPosY = y * dirY
          const copiedBlockId = getWorld().structure.foreground[sourcePosX][sourcePosY].id
          data.push({ blockId: copiedBlockId, x: dataPosX, y: dataPosY })
        }
      }
      return data
    }

    // TODO: fix this not working for more complex objects, like switches
    function placeBlock(blockId: number, layer: number, position: { x: number; y: number }) {
      getPwGameClient().send('worldBlockPlacedPacket', {
        blockId: blockId,
        layer: layer,
        positions: [position as PointInteger],
        isFillOperation: false,
      })
    }

    function placeMultipleBlocks(
      startPos: { x: number; y: number },
      blockData: { blockId: number; x: number; y: number }[],
      layer: number,
    ) {
      let data = cloneDeep(blockData)

      const mergedData = Object.values(
        data.reduce(
          (acc, { blockId, x, y }) => {
            const position = { x: x + startPos.x, y: y + startPos.y }
            if (!acc[blockId]) {
              acc[blockId] = { blockId, positions: [position] }
            } else {
              acc[blockId].positions.push(position)
            }
            return acc
          },
          {} as Record<number, { blockId: number; positions: { x: number; y: number }[] }>,
        ),
      )

      for (const block of mergedData) {
        getPwGameClient().send('worldBlockPlacedPacket', {
          blockId: block.blockId,
          layer: layer,
          positions: block.positions,
          isFillOperation: false,
        })
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
