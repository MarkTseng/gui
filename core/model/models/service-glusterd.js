var AbstractModel = require("core/model/abstract-model").AbstractModel;

exports.ServiceGlusterd = AbstractModel.specialize({
    _enable: {
        value: null
    },
    enable: {
        set: function (value) {
            if (this._enable !== value) {
                this._enable = value;
            }
        },
        get: function () {
            return this._enable;
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
    },
    _working_directory: {
        value: null
    },
    working_directory: {
        set: function (value) {
            if (this._working_directory !== value) {
                this._working_directory = value;
            }
        },
        get: function () {
            return this._working_directory;
        }
    }
}, {
    propertyBlueprints: {
        value: [{
            mandatory: false,
            name: "enable",
            valueType: "boolean"
        }, {
            mandatory: false,
            name: "type"
        }, {
            mandatory: false,
            name: "working_directory",
            valueType: "String"
        }]
    }
});
