"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@botpress/sdk");
const package_json_1 = require("./package.json");
exports.default = new sdk_1.IntegrationDefinition({
    name: package_json_1.integrationName,
    version: '0.0.1',
    readme: 'hub.md',
    icon: 'icon.svg',
    actions: {
        helloWorld: {
            title: 'Hello World',
            description: 'A simple hello world action',
            input: {
                schema: sdk_1.z.object({
                    name: sdk_1.z.string().optional(),
                }),
            },
            output: {
                schema: sdk_1.z.object({
                    message: sdk_1.z.string(),
                }),
            },
        },
        validateAddress: {
            title: 'Validate Address',
            description: 'Check user address from unifi portal',
            input: {
                schema: sdk_1.z.object({
                    conversationId: sdk_1.z.string().describe('ID of the conversation'),
                    address: sdk_1.z.string().describe('Address to be validated'),
                }),
            },
            output: {
                schema: sdk_1.z.object({
                    validatedAddress: sdk_1.z.string().describe('Validated address'),
                    portAvailable: sdk_1.z.boolean().describe('Is port available'),
                }),
            },
        },
    },
});
