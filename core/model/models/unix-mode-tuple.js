var Montage = require("montage/core/core").Montage;

exports.UnixModeTuple = Montage.specialize({
    _execute: {
        value: null
    },
    execute: {
        set: function (value) {
            if (this._execute !== value) {
                this._execute = value;
            }
        },
        get: function () {
            return this._execute;
        }
    },
    _read: {
        value: null
    },
    read: {
        set: function (value) {
            if (this._read !== value) {
                this._read = value;
            }
        },
        get: function () {
            return this._read;
        }
    },
    _write: {
        value: null
    },
    write: {
        set: function (value) {
            if (this._write !== value) {
                this._write = value;
            }
        },
        get: function () {
            return this._write;
        }
    }
});