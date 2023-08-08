import { PLUGIN_VERSION, PLUGIN_NAME, PLATFORM_NAME } from "./settings.js"
import CeilingFanAccessory from "./accessory.js"

export default class CeilingFanPlatform {
  constructor(log, config, api) {
    this.log = log
    this.api = api
    this.devices = config.devices
    this.accessories = []

    log.debug(`Version: ${PLUGIN_VERSION}`)

    api.on("didFinishLaunching", () => {
      this.addOrRestoreAccessories()
    })
  }

  configureAccessory(accessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName)

    this.accessories.push(accessory)
  }

  addOrRestoreAccessories() {
    for (const device of this.devices) {
      const uuid = this.api.hap.uuid.generate(device.id)
      const existingAccessory = this.accessories.find((accessory) => {
        return accessory.UUID === uuid
      })

      if (existingAccessory) {
        this.log.info("Restoring existing accessory from cache:", existingAccessory.displayName)

        new CeilingFanAccessory(this, existingAccessory, device)
      } else {
        const displayName = `Ceiling Fan ${device.id}`

        this.log.info("Adding new accessory:", displayName)

        const accessory = new this.api.platformAccessory(displayName, uuid)

        this.accessories.push(accessory)

        new CeilingFanAccessory(this, accessory, device)

        this.api.registerPlatformAccessories(
          PLUGIN_NAME, PLATFORM_NAME, [accessory]
        )
      }
    }
  }
}
