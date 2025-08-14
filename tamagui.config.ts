import { createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config'

const tamaguiConfig = createTamagui({
    ...config,
    fontLanguages: ['en'],
})

export default tamaguiConfig