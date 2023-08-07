import packageJson from "./package.json" assert { type: "json" }

/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = "TuyaCeilingFan"

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = "homebridge-tuya-ceiling-fan"

export const PLUGIN_VERSION = packageJson.version
