import { PLATFORM_NAME } from "./settings.js"
import CeilingFanPlatform from "./platform.js"

export default (api) => {
  api.registerPlatform(PLATFORM_NAME, CeilingFanPlatform)
}
