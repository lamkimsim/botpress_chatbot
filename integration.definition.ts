import { z, IntegrationDefinition } from '@botpress/sdk'
import { integrationName } from './package.json'

export default new IntegrationDefinition({
  name: integrationName,
  version: '0.0.1',
  readme: 'hub.md',
  icon: 'icon.svg',
  actions: {
    helloWorld: {
      title: 'Hello World',
      description: 'A simple hello world action',
      input: {
        schema: z.object({
          name: z.string().optional(),
        }),
      },
      output: {
        schema: z.object({
          message: z.string(),
        }),
      },
    },
    validateAddress: {
      title: 'Validate Address',
      description: 'Check user address from unifi portal',
      input: {
        schema: z.object({
          conversationId: z.string().describe('ID of the conversation'),
          address: z.string().describe('Address to be validated'),
        }),
      },
      output: {
        schema: z.object({
          validatedAddress: z.string().describe('Validated address'),
          portAvailable: z.boolean().describe('Is port available'),
        }),
      },
    },
  },
})
