"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const sdk = __importStar(require("@botpress/sdk"));
const bp = __importStar(require(".botpress"));
exports.default = new bp.Integration({
    register: async () => {
        /**
         * This is called when an integration configuration is saved.
         * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
         */
        throw new sdk.RuntimeError('Invalid configuration'); // replace this with your own validation logic
    },
    unregister: async () => {
        /**
         * This is called when a bot removes the integration.
         * You should use this handler to instanciate ressources in the external service and ensure that the configuration is valid.
         */
        throw new sdk.RuntimeError('Invalid configuration'); // replace this with your own validation logic
    },
    actions: {
        helloWorld: async (props) => {
            /**
             * This is called when a bot calls the action `helloWorld`.
             */
            props.logger.forBot().info('Hello World!'); // this log will be visible by the bots that use this integration
            let { name } = props.input;
            name = name || 'World';
            return { message: `Hello "${name}"! Nice to meet you ;)` };
        },
    },
    channels: {},
    handler: async () => { },
});
