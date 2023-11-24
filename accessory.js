import TuyAPI from "tuyapi"

const DATA_POINTS = {
  "on": "1",
  "speed": "3",
  "direction": "4",
  "light": "9"
}

export default class CeilingFanAccessory {
  constructor(platform, accessory, { key, id, ip, version}) {
    this.platform = platform
    this.accessory = accessory
    this.deviceKey = key
    this.deviceID = id
    this.deviceIP = ip ? ip : null
    this.deviceVersion = version ? version : null

    accessory.on("identify", () => {
      this.platform.log(`${accessory.displayName} identified!`)

      // Also trigger an update as a way to force-sync the device state
      this.tuyaClient.get()
    })

    const Service = platform.api.hap.Service
    const Characteristic = platform.api.hap.Characteristic

    const fanService = accessory.getService(Service.Fan) ||
      accessory.addService(Service.Fan)
    const lightService = accessory.getService(Service.Lightbulb) ||
      accessory.addService(Service.Lightbulb)

    fanService.setCharacteristic(Characteristic.Name, accessory.displayName)
    lightService.setCharacteristic(Characteristic.Name, `${accessory.displayName} Light`)

    fanService.getCharacteristic(Characteristic.On).
      onSet((value) => this.setFanOn(value))

    fanService.getCharacteristic(Characteristic.RotationDirection).
      onSet((value) => this.setFanRotationDirection(value))

    fanService.getCharacteristic(Characteristic.RotationSpeed).
      setProps({ minValue: 0, maxValue: 100, minStep: 20 }).
      onSet((value) => this.setFanRotationSpeed(value))

    lightService.getCharacteristic(Characteristic.On).
      onSet((value) => this.setLightOn(value))

    const handleData = (data) => {
      this.dps = { ...this.dps, ...data.dps }

      if (DATA_POINTS.on in data.dps) {
        fanService.getCharacteristic(Characteristic.On).
          updateValue(this.getFanOn())
      }

      if (DATA_POINTS.direction in data.dps) {
        fanService.getCharacteristic(Characteristic.RotationDirection).
          updateValue(this.getFanRotationDirection())
      }

      if (DATA_POINTS.speed in data.dps) {
        fanService.getCharacteristic(Characteristic.RotationSpeed).
          updateValue(this.getFanRotationSpeed())
      }

      if (DATA_POINTS.light in data.dps) {
        lightService.getCharacteristic(Characteristic.On).
          updateValue(this.getLightOn())
      }
    }

    const apiOpts = {
      key: this.deviceKey,
      id: this.deviceID
    }

    if (this.deviceIP) {
      apiOpts.ip = this.deviceIP
    }

    if (this.deviceVersion) {
      apiOpts.version = this.deviceVersion
    }

    this.tuyaClient = new TuyAPI(apiOpts)

    this.tuyaClient.on("connected", () => {
      this.platform.log.debug("Tuya Device Connected ->", this.accessory.displayName)
    })

    this.tuyaClient.on("disconnected", () => {
      this.platform.log.debug("Tuya Device Disconnected ->", this.accessory.displayName)
    })

    this.tuyaClient.on("error", (error) => {
      this.platform.log.debug("Tuya Device Error ->", this.accessory.displayName, error)
    })

    this.tuyaClient.on("data", (data) => {
      this.platform.log.debug("Tuya Device Data ->", this.accessory.displayName, data)

      handleData(data)
    })

    this.tuyaClient.on("dp-refresh", (data) => {
      this.platform.log.debug("Tuya Device Refresh ->", this.accessory.displayName, data)

      handleData(data)
    })

    this.tuyaClient.find().then(() => {
      this.tuyaClient.connect()
    })
  }

  setFanOn(value) {
    this.dps[DATA_POINTS.on] = value

    this.platform.log.debug("Set Fan Characteristic On ->", value)

    this.tuyaClient.set({ dps: DATA_POINTS.on, set: value, shouldWaitForResponse: false })
  }

  getFanOn() {
    const value = this.dps[DATA_POINTS.on]

    this.platform.log.debug("Get Fan Characteristic On ->", value)

    return value
  }

  setFanRotationDirection(value) {
    const coercedValue = value === 1 ? "forward" : "reverse"

    this.dps[DATA_POINTS.direction] = coercedValue

    this.platform.log.debug("Set Fan Characteristic Rotation Direction ->", value, coercedValue)

    this.tuyaClient.set({ dps: DATA_POINTS.direction, set: coercedValue, shouldWaitForResponse: false })
  }

  getFanRotationDirection() {
    const value = this.dps[DATA_POINTS.direction]
    const coercedValue = value === "forward" ? 1 : 0

    this.platform.log.debug("Get Fan Characteristic Rotation Direction ->", value, coercedValue)

    return coercedValue
  }

  setFanRotationSpeed(value) {
    const coercedValue = String(Number(value) / 20)

    this.dps[DATA_POINTS.speed] = coercedValue

    this.platform.log.debug("Set Fan Characteristic Rotation Speed ->", value, coercedValue)

    this.tuyaClient.set({ dps: DATA_POINTS.speed, set: coercedValue, shouldWaitForResponse: false })
  }

  getFanRotationSpeed() {
    const value = this.dps[DATA_POINTS.speed]
    const coercedValue = Number(value) * 20

    this.platform.log.debug("Get Fan Characteristic Rotation Speed ->", value, coercedValue)

    return coercedValue
  }

  setLightOn(value) {
    this.dps[DATA_POINTS.light] = value

    this.platform.log.debug("Set Lightbulb Characteristic On ->", value)

    this.tuyaClient.set({ dps: DATA_POINTS.light, set: value, shouldWaitForResponse: false })
  }

  getLightOn() {
    const value = this.dps[DATA_POINTS.light]

    this.platform.log.debug("Get Lightbulb Characteristic On ->", value)

    return value
  }
}
