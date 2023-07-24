import TuyAPI from "tuyapi"

const DATA_POINTS = {
  "on": "1",
  "speed": "3",
  "direction": "4",
  "light": "9"
}

export class CeilingFanAccessory {
  constructor(platform, accessory, deviceID) {
    this.platform = platform
    this.accessory = accessory
    this.deviceID = deviceID

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
      setProps({ minValue: 0, maxValue: 5, minStep: 1 }).
      onSet((value) => this.setFanRotationSpeed(value))

    lightService.getCharacteristic(Characteristic.On).
      onSet((value) => this.setLightOn(value))

    const handleData = (data) => {
      this.dps = { ...this.dps, ...data.dps }

      if (DATA_POINTS.on in data.dps) {
        fanService.setCharacteristic(
          Characteristic.On, this.getFanOn()
        )
      }

      if (DATA_POINTS.direction in data.dps) {
        fanService.setCharacteristic(
          Characteristic.RotationDirection, this.getFanRotationDirection()
        )
      }

      if (DATA_POINTS.speed in data.dps) {
        fanService.setCharacteristic(
          Characteristic.RotationSpeed, this.getFanRotationSpeed()
        )
      }

      if (DATA_POINTS.light in data.dps) {
        lightService.setCharacteristic(
          Characteristic.On, this.getLightOn()
        )
      }
    }

    this.tuyaClient = new TuyAPI({
      id: this.deviceID,
      key: this.platform.key
    })

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

    this.tuyaClient.set({ dps: DATA_POINTS.on, set: value })
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

    this.tuyaClient.set({ dps: DATA_POINTS.direction, set: coercedValue })
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

    this.tuyaClient.set({ dps: DATA_POINTS.speed, set: coercedValue })
  }

  getFanRotationSpeed() {
    const value = Number(this.dps[DATA_POINTS.speed])

    this.platform.log.debug("Get Fan Characteristic Rotation Speed ->", value)

    return value
  }

  setLightOn(value) {
    this.dps[DATA_POINTS.light] = value

    this.platform.log.debug("Set Lightbulb Characteristic On ->", value)

    this.tuyaClient.set({ dps: DATA_POINTS.light, set: value })
  }

  getLightOn() {
    const value = this.dps[DATA_POINTS.light]

    this.platform.log.debug("Get Lightbulb Characteristic On ->", value)

    return value
  }
}
