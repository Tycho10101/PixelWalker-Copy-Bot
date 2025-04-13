import { writeFile } from 'fs/promises'
import { EELVL_BLOCKS } from '../eelvl/EelvlBlocks.ts'
import { ListBlockResult } from 'pw-js-api'

await generateBlockEnumFiles()

async function generateBlockEnumFiles() {
  await generatePwBlockNameEnum()
  await generateEelvlBlockIdEnum()
}

async function generatePwBlockNameEnum() {
  const blocks: ListBlockResult[] = await fetch('https://game.pixelwalker.net/listblocks').then((res) => res.json())
  const blocksSorted = blocks.sort((a, b) => a.Id - b.Id)

  let tsOutput = 'export enum PwBlockName {\n'

  for (let i = 0, len = blocksSorted.length; i < len; i++) {
    tsOutput += `  ${blocksSorted[i].PaletteId.toUpperCase()} = "${blocksSorted[i].PaletteId.toUpperCase()}",\n`
  }

  tsOutput += `}
export type PwBlockNameKeys = keyof typeof PwBlockName;`

  await writeFile('./src/gen/PwBlockName.ts', tsOutput)
}

async function generateEelvlBlockIdEnum() {
  const blocks = EELVL_BLOCKS

  let tsOutput = 'export enum EelvlBlockId {\n'

  for (let i = 0, len = blocks.length; i < len; i++) {
    tsOutput += `  ${blocks[i].name} = ${blocks[i].id},\n`
  }

  tsOutput += `}
export type EelvlBlockIdKeys = keyof typeof EelvlBlockId;`

  await writeFile('./src/gen/EelvlBlockId.ts', tsOutput)
}
