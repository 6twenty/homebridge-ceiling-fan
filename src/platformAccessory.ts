import { Service, PlatformAccessory, CharacteristicValue } from "homebridge"

import { CeilingFanPlatform } from "./platform"

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class CeilingFanAccessory {
  private fanService: Service
  private lightService: Service

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  }

  constructor(
    private readonly platform: CeilingFanPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Brilliant")
      .setCharacteristic(this.platform.Characteristic.Model, "WiFi DC Ceiling Fan")
      .setCharacteristic(this.platform.Characteristic.SerialNumber, "20918")

    this.fanService = this.accessory.getService(this.platform.Service.Fan) ||
      this.accessory.addService(this.platform.Service.Fan)

    this.lightService = this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb)

    this.fanService.setCharacteristic(this.platform.Characteristic.Name, "Ceiling Fan")
    this.lightService.setCharacteristic(this.platform.Characteristic.Name, "Ceiling Fan Light")

    this.fanService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setFanOn.bind(this))
      .onGet(this.getFanOn.bind(this))

    this.fanService.getCharacteristic(this.platform.Characteristic.RotationDirection)
      .onSet(this.setFanRotationDirection.bind(this))
      .onGet(this.getFanRotationDirection.bind(this))

    this.fanService.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .setProps({ minStep: 20 })
      .onSet(this.setFanRotationSpeed.bind(this))
      .onGet(this.getFanRotationSpeed.bind(this))

    this.lightService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setLightOn.bind(this))
      .onGet(this.getLightOn.bind(this))

    // /**
    //  * Updating characteristics values asynchronously.
    //  *
    //  * Example showing how to update the state of a Characteristic asynchronously instead
    //  * of using the `on("get")` handlers.
    //  * Here we change update the motion sensor trigger states on and off every 10 seconds
    //  * the `updateCharacteristic` method.
    //  *
    //  */
    // let motionDetected = false
    // setInterval(() => {
    //   // EXAMPLE - inverse the trigger
    //   motionDetected = !motionDetected

    //   // push the new value to HomeKit
    //   motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, motionDetected)
    //   motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, !motionDetected)

    //   this.platform.log.debug("Triggering motionSensorOneService:", motionDetected)
    //   this.platform.log.debug("Triggering motionSensorTwoService:", !motionDetected)
    // }, 10000)
  }

  async setFanOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    // this.exampleStates.On = value as boolean

    this.platform.log.debug("Set Fan Characteristic On ->", value)
  }

  async getFanOn(): Promise<CharacteristicValue> {
    // const isOn = this.exampleStates.On

    // this.platform.log.debug("Get Fan Characteristic On ->", isOn)

    // // if you need to return an error to show the device as "Not Responding" in the Home app:
    // // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE)

    // return isOn
    return false
  }

  async setFanRotationDirection(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    // this.exampleStates.On = value as boolean

    this.platform.log.debug("Set Fan Characteristic Rotation Direction ->", value)
  }

  async getFanRotationDirection(): Promise<CharacteristicValue> {
    // const isOn = this.exampleStates.On

    // this.platform.log.debug("Get Fan Characteristic On ->", isOn)

    // // if you need to return an error to show the device as "Not Responding" in the Home app:
    // // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE)

    // return isOn
    return false
  }

  async setFanRotationSpeed(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    // this.exampleStates.On = value as boolean

    this.platform.log.debug("Set Fan Characteristic Rotation Speed ->", value)
  }

  async getFanRotationSpeed(): Promise<CharacteristicValue> {
    // const isOn = this.exampleStates.On

    // this.platform.log.debug("Get Fan Characteristic On ->", isOn)

    // // if you need to return an error to show the device as "Not Responding" in the Home app:
    // // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE)

    // return isOn
    return false
  }

  async setLightOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    // this.exampleStates.On = value as boolean

    this.platform.log.debug("Set Lightbulb Characteristic On ->", value)
  }

  async getLightOn(): Promise<CharacteristicValue> {
    // const isOn = this.exampleStates.On

    // this.platform.log.debug("Get Fan Characteristic On ->", isOn)

    // // if you need to return an error to show the device as "Not Responding" in the Home app:
    // // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE)

    // return isOn
    return false
  }

}
