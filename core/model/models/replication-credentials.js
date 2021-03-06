var AbstractModel = require("core/model/abstract-model").AbstractModel;

exports.ReplicationCredentials = AbstractModel.specialize({
    _hostkey: {
        value: null
    },
    hostkey: {
        set: function (value) {
            if (this._hostkey !== value) {
                this._hostkey = value;
            }
        },
        get: function () {
            return this._hostkey;
        }
    },
    _port: {
        value: null
    },
    port: {
        set: function (value) {
            if (this._port !== value) {
                this._port = value;
            }
        },
        get: function () {
            return this._port;
        }
    },
    _pubkey: {
        value: null
    },
    pubkey: {
        set: function (value) {
            if (this._pubkey !== value) {
                this._pubkey = value;
            }
        },
        get: function () {
            return this._pubkey;
        }
    },
    _type: {
        value: null
    },
    type: {
        set: function (value) {
            if (this._type !== value) {
                this._type = value;
            }
        },
        get: function () {
            return this._type;
        }
    }
}, {
    propertyBlueprints: {
        value: [{
            mandatory: false,
            name: "hostkey",
            valueType: "String"
        }, {
            mandatory: false,
            name: "port",
            valueType: "number"
        }, {
            mandatory: false,
            name: "pubkey",
            valueType: "String"
        }, {
            mandatory: false,
            name: "type"
        }]
    }
});
