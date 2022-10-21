import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from "homebridge"

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings"
import { CeilingFanAccessory } from "./platformAccessory"

const IP_ADDRESS = "192.168.178.71"
const DEVICE_ID = "6010543010521cc0a0ac"
const LOCAL_KEY = "ad3dde5855e38a12"

export class CeilingFanPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic

  public readonly accessories: PlatformAccessory[] = []

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug("Finished initializing platform:", this.config.name)

    this.api.on("didFinishLaunching", () => {
      log.debug("Executed didFinishLaunching callback")

      this.addOrRestoreAccessory()
    })
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName)

    this.accessories.push(accessory)
  }

  addOrRestoreAccessory() {
    const uuid = this.api.hap.uuid.generate(IP_ADDRESS)
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid)

    if (existingAccessory) {
      this.log.info("Restoring existing accessory from cache:", existingAccessory.displayName)

      new CeilingFanAccessory(this, existingAccessory)
    } else {
      this.log.info("Adding new accessory:", "Ceiling fan")

      const accessory = new this.api.platformAccessory("Ceiling fan", uuid)

      accessory.context.deviceId = DEVICE_ID
      accessory.context.localKey = LOCAL_KEY

      new CeilingFanAccessory(this, accessory)

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
    }
  }
}
