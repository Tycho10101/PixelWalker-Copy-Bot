import { defineComponent, onBeforeMount, ref } from 'vue'
import { usePWClientStore } from '@/stores/PWClient.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import { PlayerChatPacket, PointInteger, WorldBlockPlacedPacket } from 'pw-js-api/dist/gen/world_pb'
import World from '@/services/world/world.ts'
import BlockScheduler from '@/services/scheduler/block.ts'
import { BlockMappings } from '@/services/BlockMappings.ts'

export default defineComponent({
  setup() {
    const loading = ref(false)

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
    let botState: BotState = BotState.NONE
    let selectedFromPos: { x: number; y: number }
    let selectedToPos: { x: number; y: number }

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

        let selectedType: string
        if ([BotState.NONE, BotState.SELECTED_TO].includes(botState)) {
          selectedType = 'from'
          botState = BotState.SELECTED_FROM
          selectedFromPos = blockPos
        } else {
          selectedType = 'to'
          botState = BotState.SELECTED_TO
          selectedToPos = blockPos
        }

        sendChatMessage(`Selected ${selectedType} x: ${blockPos.x} y: ${blockPos.y}`)
      }

      if (data.blockId === BlockMappings['coin_blue']) {
        for (let x = 0; x <= Math.abs(selectedFromPos.x - selectedToPos.x); x++) {
          for (let y = 0; y <= Math.abs(selectedFromPos.y - selectedToPos.y); y++) {
            const copiedBlockId = getWorld().structure.foreground[selectedFromPos.x + x][selectedFromPos.y + y].id
            placeBlock(copiedBlockId, 1, { x: blockPos.x + x, y: blockPos.y + y })
          }
        }
      }
    }

    // TODO: use block scheduler instead
    function placeBlock(blockId: number, layer: number, position: { x: number; y: number }) {
      // TODO: fix this not working for more complex objects, like switches
      getPwGameClient().send('worldBlockPlacedPacket', {
        blockId: blockId,
        layer: layer,
        positions: [position as PointInteger],
        isFillOperation: false,
      })
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
