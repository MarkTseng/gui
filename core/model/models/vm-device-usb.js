var AbstractModel = require("core/model/abstract-model").AbstractModel;

exports.VmDeviceUsb = AbstractModel.specialize({
    _config: {
        value: null
    },
    config: {
        set: function (value) {
            if (this._config !== value) {
                this._config = value;
            }
        },
        get: function () {
            return this._config;
        }
    },
    _device: {
        value: null
    },
    device: {
        set: function (value) {
            if (this._device !== value) {
                this._device = value;
            }
        },
        get: function () {
            return this._device;
        }
    }
}, {
    propertyBlueprints: {
        value: [{
            mandatory: false,
            name: "config",
            valueType: "object"
        }, {
            mandatory: false,
            name: "device",
            valueObjectPrototypeName: "VmDeviceUsbDevice",
            valueType: "object"
        }]
    }
});
