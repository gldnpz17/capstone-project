interface KeyValueService {
  set(key: string, value: string): void
  get(key: string): string
  delete(key: string): void
}

class TransientKeyValueService implements KeyValueService {
  _values = {}
  _valueTimeouts = {}
  _duration: number

  constructor(timeoutDuration: number) {
    this._duration = timeoutDuration
  }

  _clearTimeout(key: string) {
    if (this._valueTimeouts[key]) {
      clearTimeout(this._valueTimeouts[key])
      delete this._valueTimeouts[key]
    }
  }

  _startTimeout(key: string) {
    this._valueTimeouts[key] = setTimeout(() => {
      delete this._values[key]
      delete this._valueTimeouts[key]
    }, this._duration)
  }

  set = (key: string, value: string): void => {
    this._clearTimeout(key)
    this._values[key] = value
    this._startTimeout(key)
  }

  get = (key: string): string => this._values[key]

  delete = (key: string): void => {
    delete this._values[key]
    this._clearTimeout(key)
  }
}

class InMemoryKeyValueService implements KeyValueService {
  _values = {}
  _defaultValue = null

  constructor(options: { default: any }) {
    this._defaultValue = options.default
  }

  set = (key: string, value: string): void => {
    this._values[key] = value
  }

  get = (key: string): string => this._values[key] ?? this._defaultValue

  delete = (key: string): void => {
    delete this._values[key]
  }
}

export { KeyValueService, TransientKeyValueService, InMemoryKeyValueService }