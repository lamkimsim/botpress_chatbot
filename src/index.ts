import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
const puppeteer = require('puppeteer');

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
    validateAddress: async ({input}) => {

    
      const { address } = input

  
      // Randomize between true and false
      const portAvailable = Math.random() >= 0.5

      return { validatedAddress: address, portAvailable: portAvailable }
      
    }
  },
  channels: {},
  handler: async () => {},
})
