import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'

import { scrapeUnifi } from './unifi_scrapper';

export default new bp.Integration({
  register: async () => {
    /**
     * This is called when an integration configuration is saved.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
    throw new sdk.RuntimeError('Invalid configuration') // replace this with your own validation logic
  },
  unregister: async () => {
    /**
     * This is called when a bot removes the integration.
     * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
     */
    throw new sdk.RuntimeError('Invalid configuration') // replace this with your own validation logic
  },
  actions: {
    helloWorld: async ()=>{
      return {'message': 'Hello World'}
    },

    validateAddress: async ({input}) => {
      console.log(`Validating address: ${input}`)
      const { address } = input
      console.log(`Validating address: ${address}`)
      const [error] = scrapeUnifi(address)
      console.log(`Error: ${error}`)
      if(error) {
        return {validatedAddress: address, portAvailable: false, error: error}
      }

      // Randomize between true and false
      const portAvailable = Math.random() >= 0.5

      return { validatedAddress: address, portAvailable: portAvailable, error: undefined }
      
    }
  },
  channels: {},
  handler: async () => {},
})
