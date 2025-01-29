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
        createTrackableLink: {
            title: 'Create Trackable Link',
            description: 'Takes a link as an input and returns a link that notifies the author when the link is clicked.',
            input: {
                schema: sdk_1.z.object({
                    conversationId: sdk_1.z.string().describe('ID of the conversation'),
                    originalLink: sdk_1.z.string().describe('URL of the link to be tracked'),
                }),
            },
            output: {
                schema: sdk_1.z.object({
                    trackableLink: sdk_1.z.string().describe('URL of the trackable link'),
                })
            },
        }
    },
    events: {
        clickedLink: {
            schema: sdk_1.z.object({
                conversationId: sdk_1.z.string().describe("ID of the conversation to notify the user"),
                originalLink: sdk_1.z.string(),
            })
        },
    }
});
