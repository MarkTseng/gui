var AbstractModel = require("core/model/abstract-model").AbstractModel;

exports.ReplicationLink = AbstractModel.specialize({
    _auto_recover: {
        value: null
    },
    auto_recover: {
        set: function (value) {
            if (this._auto_recover !== value) {
                this._auto_recover = value;
            }
        },
        get: function () {
            return this._auto_recover;
        }
    },
    _bidirectional: {
        value: null
    },
    bidirectional: {
        set: function (value) {
            if (this._bidirectional !== value) {
                this._bidirectional = value;
            }
        },
        get: function () {
            return this._bidirectional;
        }
    },
    _datasets: {
        value: null
    },
    datasets: {
        set: function (value) {
            if (this._datasets !== value) {
                this._datasets = value;
            }
        },
        get: function () {
            return this._datasets;
        }
    },
    _id: {
        value: null
    },
    id: {
        set: function (value) {
            if (this._id !== value) {
                this._id = value;
            }
        },
        get: function () {
            return this._id;
        }
    },
    _initial_master: {
        value: null
    },
    initial_master: {
        set: function (value) {
            if (this._initial_master !== value) {
                this._initial_master = value;
            }
        },
        get: function () {
            return this._initial_master;
        }
    },
    _master: {
        value: null
    },
    master: {
        set: function (value) {
            if (this._master !== value) {
                this._master = value;
            }
        },
        get: function () {
            return this._master;
        }
    },
    _name: {
        value: null
    },
    name: {
        set: function (value) {
            if (this._name !== value) {
                this._name = value;
            }
        },
        get: function () {
            return this._name;
        }
    },
    _partners: {
        value: null
    },
    partners: {
        set: function (value) {
            if (this._partners !== value) {
                this._partners = value;
            }
        },
        get: function () {
            return this._partners;
        }
    },
    _recursive: {
        value: null
    },
    recursive: {
        set: function (value) {
            if (this._recursive !== value) {
                this._recursive = value;
            }
        },
        get: function () {
            return this._recursive;
        }
    },
    _replicate_services: {
        value: null
    },
    replicate_services: {
        set: function (value) {
            if (this._replicate_services !== value) {
                this._replicate_services = value;
            }
        },
        get: function () {
            return this._replicate_services;
        }
    },
    _status: {
        value: null
    },
    status: {
        set: function (value) {
            if (this._status !== value) {
                this._status = value;
            }
        },
        get: function () {
            return this._status;
        }
    },
    _update_date: {
        value: null
    },
    update_date: {
        set: function (value) {
            if (this._update_date !== value) {
                this._update_date = value;
            }
        },
        get: function () {
            return this._update_date;
        }
    }
}, {
    propertyBlueprints: {
        value: [{
            mandatory: false,
            name: "auto_recover",
            valueType: "boolean"
        }, {
            mandatory: false,
            name: "bidirectional",
            valueType: "boolean"
        }, {
            mandatory: false,
            name: "datasets",
            valueType: "array"
        }, {
            mandatory: false,
            name: "id",
            valueType: "String"
        }, {
            mandatory: false,
            name: "initial_master",
            valueType: "String"
        }, {
            mandatory: false,
            name: "master",
            valueType: "String"
        }, {
            mandatory: false,
            name: "name",
            valueType: "String"
        }, {
            mandatory: false,
            name: "partners",
            valueType: "array"
        }, {
            mandatory: false,
            name: "recursive",
            valueType: "boolean"
        }, {
            mandatory: false,
            name: "replicate_services",
            valueType: "boolean"
        }, {
            mandatory: false,
            name: "status",
            valueObjectPrototypeName: "ReplicationStatus",
            valueType: "object"
        }, {
            mandatory: false,
            name: "update_date",
            valueType: "String"
        }]
    }
});
