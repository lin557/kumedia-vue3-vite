const volume = 'player.volume'

export default {
  setItem(key: string, val: string) {
    window.localStorage.setItem(key, val)
  },
  getItem(key: string) {
    return window.localStorage.getItem(key)
  },

  getVolume() {
    let value = this.getItem(volume)
    if (value === null) {
      value = '0.7'
    }
    return Number(value)
  },
  setVolume(vol: number) {
    this.setItem(volume, vol.toString())
  }
}
