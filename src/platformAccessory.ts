import { Service, PlatformAccessory, CharacteristicValue } from "homebridge"
import TuyAPI from "tuyapi"

import { CeilingFanPlatform } from "./platform"

const DATA_POINTS = {
  "on": "1",
  "speed": "3",
  "direction": "4",
  "light": "9"
}

export class CeilingFanAccessory {
  private fanService: Service
  private lightService: Service
  private tuyaClient
  private dps = {}

  constructor(
    private readonly platform: CeilingFanPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly deviceID,
    private readonly localKey
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Brilliant Smart")
      .setCharacteristic(this.platform.Characteristic.Model, "DC Ceiling Fan BAHAMA")
      .setCharacteristic(this.platform.Characteristic.SerialNumber, "20918")

    this.fanService = this.accessory.getService(this.platform.Service.Fan) ||
      this.accessory.addService(this.platform.Service.Fan)

    this.lightService = this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb)

    this.fanService.setCharacteristic(this.platform.Characteristic.Name, "Ceiling Fan")
    this.lightService.setCharacteristic(this.platform.Characteristic.Name, "Ceiling Fan Light")

    this.fanService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setFanOn.bind(this))

    this.fanService.getCharacteristic(this.platform.Characteristic.RotationDirection)
      .onSet(this.setFanRotationDirection.bind(this))

    this.fanService.getCharacteristic(this.platform.Characteristic.RotationSpeed)
      .setProps({ minStep: 20 })
      .onSet(this.setFanRotationSpeed.bind(this))

    this.lightService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setLightOn.bind(this))

    this.tuyaClient = new TuyAPI({
      id: this.deviceID,
      key: this.localKey
    })

    this.tuyaClient.on("connected", () => {
      this.platform.log.debug("Tuya Device Connected ->", this.accessory.displayName)

      this.tuyaClient.get()
    })

    this.tuyaClient.on("disconnected", () => {
      this.platform.log.debug("Tuya Device Disconnected ->", this.accessory.displayName)
    })

    this.tuyaClient.on("error", error => {
      this.platform.log.debug("Tuya Device Error ->", this.accessory.displayName, error)
    })

    const handleData = data => {
      this.dps = { ...this.dps, ...data.dps }

      Object.keys(data.dps).forEach(key => {
        switch (key) {
          case DATA_POINTS["on"]:
            this.updateFanOn()
            break
          case DATA_POINTS["direction"]:
            this.updateFanRotationDirection()
            break
          case DATA_POINTS["speed"]:
            this.updateFanRotationSpeed()
            break
          case DATA_POINTS["light"]:
            this.updateLightOn()
            break
        }
      })
    }

    this.tuyaClient.on("data", data => {
      this.platform.log.debug("Tuya Device Data ->", this.accessory.displayName, data)

      handleData(data)
    })

    this.tuyaClient.on("dp-refresh", data => {
      this.platform.log.debug("Tuya Device Refresh ->", this.accessory.displayName, data)

      handleData(data)
    })

    this.tuyaClient.find().then(() => {
      this.tuyaClient.connect()
    })
  }

  updateFanOn() {
    this.fanService.getCharacteristic(this.platform.Characteristic.On).updateValue(this.currentFanOn())
  }

  updateFanRotationDirection() {
    this.fanService.getCharacteristic(this.platform.Characteristic.RotationDirection).updateValue(this.currentFanRotationDirection())
  }

  updateFanRotationSpeed() {
    console.log("updateFanRotationSpeed")
    this.fanService.getCharacteristic(this.platform.Characteristic.RotationSpeed).updateValue(this.currentFanRotationSpeed())
  }

  updateLightOn() {
    this.lightService.getCharacteristic(this.platform.Characteristic.On).updateValue(this.currentLightOn())
  }

  setFanOn(value: CharacteristicValue) {
    this.platform.log.debug("Set Fan Characteristic On ->", value)

    this.dps[DATA_POINTS["on"]] = value

    this.tuyaClient.set({ dps: DATA_POINTS["on"], set: value })
  }

  async getFanOn(): Promise<CharacteristicValue> {
    return this.tuyaClient.get().then(() => this.currentFanOn())
  }

  currentFanOn(): CharacteristicValue {
    return this.dps[DATA_POINTS["on"]]
  }

  setFanRotationDirection(value: CharacteristicValue) {
    this.platform.log.debug("Set Fan Characteristic Rotation Direction ->", value)

    const coercedValue = value === 1 ? "forward" : "reverse"

    this.dps[DATA_POINTS["direction"]] = coercedValue

    this.tuyaClient.set({ dps: DATA_POINTS["direction"], set: coercedValue })
  }

  async getFanRotationDirection(): Promise<CharacteristicValue> {
    return this.tuyaClient.get().then(() => this.currentFanRotationDirection())
  }

  currentFanRotationDirection(): CharacteristicValue {
    const value = this.dps[DATA_POINTS["direction"]]

    return value === "forward" ? 1 : 0
  }

  setFanRotationSpeed(value: CharacteristicValue) {
    this.platform.log.debug("Set Fan Characteristic Rotation Speed ->", value)

    const coercedValue = String(Number(value) / 20)

    this.dps[DATA_POINTS["speed"]] = coercedValue

    console.log(`setFanRotationSpeed`, value, Number(value) / 20)

    this.tuyaClient.set({ dps: DATA_POINTS["speed"], set: coercedValue })
  }

  async getFanRotationSpeed(): Promise<CharacteristicValue> {
    console.log("getFanRotationSpeed")
    return this.tuyaClient.get().then(() => this.currentFanRotationSpeed())
  }

  currentFanRotationSpeed(): CharacteristicValue {
    const value = this.dps[DATA_POINTS["speed"]]

    console.log(`currentFanRotationSpeed`, value, Number(value) * 20)

    return Number(value) * 20
  }

  setLightOn(value: CharacteristicValue) {
    this.platform.log.debug("Set Lightbulb Characteristic On ->", value)

    this.dps[DATA_POINTS["light"]] = value

    this.tuyaClient.set({ dps: DATA_POINTS["light"], set: value })
  }

  async getLightOn(): Promise<CharacteristicValue> {
    return this.tuyaClient.get().then(() => this.currentLightOn())
  }

  currentLightOn(): CharacteristicValue {
    return this.dps[DATA_POINTS["light"]]
  }
}
