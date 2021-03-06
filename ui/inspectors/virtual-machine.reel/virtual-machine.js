var Component = require("montage/ui/component").Component,
    Model = require("core/model/model").Model,
    VmGuestType = require("core/model/enumerations/vm-guest-type").VmGuestType,
    Dict = require("collections/dict").Dict;

/**
 * @class VirtualMachine
 * @extends Component
 */
exports.VirtualMachine = Component.specialize({
    editMode: {
        value: null
    },

    templates: {
        value: null
    },

    _guestOptionLabels: {
        value: null
    },

    guestTypeOptions: {
        value: null
    },

    volumes: {
        value: null
    },

    webvncConsole: {
        value: null
    },

    _memorySetting: {
        value: null
    },

    memorySetting: {
        get: function() {
            if (typeof this._memorySetting === "string") {
                return this._memorySetting;
            } else if (!!this.object.config && !!this.object.config.memsize) {
                return this.object.config.memsize + "MiB";
            }
            return "";
        },

        set: function(memorySetting) {
            this._memorySetting = memorySetting;
        }
    },

    _object: {
        value: null
    },

    object: {
        get: function() {
            return this._object;
        },
        set: function(object) {
            if (this._object !== object) {
                this._object = object;
                if (object) {
                    if (object.template) {
                        this.templateName = object.template.name;
                    }
                    if (object.config) {
                        this.memorySize = object.config.memsize;
                    }
                }
            }
        }
    },

    _memorySize: {
        value: null
    },

    memorySize: {
        get: function() {
            return this._memorySize;
        },
        set: function(memorySize) {
            if (this._memorySize !== memorySize) {
                this._memorySize = memorySize;
            }
        }
    },
    _templateName: {
        value: null
    },

    templateName: {
        get: function() {
            return this._templateName;
        },
        set: function(templateName) {
            var self = this;
            if (this._templateName !== templateName) {
                this._templateName = templateName;
                this._loadTemplates().then(function(templates) {
                    for (var i = 0, length = templates.length; i<length; i++) {
                        template = templates[i];
                        if (template.template.name === templateName) {
                            self._populateObjectWithTemplate(template);
                            break;
                        }
                    }
                });
            }
        }
    },

    constructor: {
        value: function() {
            this._guestOptionLabels = new Dict({
                "linux32":      "Linux (32-bit)",
                "linux64":      "Linux (64-bit)",
                "freebsd32":    "FreeBSD (32-bit)",
                "freebsd64":    "FreeBSD (64-bit)",
                "netbsd32":     "NetBSD (32-bit)",
                "netbsd64":     "NetBSD (64-bit)",
                "openbsd32":    "OpenBSD (32-bit)",
                "openbsd64":    "OpenBSD (64-bit)",
                "windows64":    "Windows (64-bit)",
                "solaris64":    "Solaris (64-bit)",
                "other":        "Other",
                "other32":      "Other (32-bit)",
                "other64":      "Other (64-bit)"
            });
            this._initializeGuestTypeOptions();
        }
    },

    templateDidLoad: {
        value: function() {
            this._loadTemplates();
        }
    },

    enterDocument: {
        value: function(isFirstTime) {
            var self = this,
                loadingPromises = [],
                devicesPromise;
            this.isLoading = true;
            this.editMode = this.object._isNew ? "edit" : "display";
            if (isFirstTime) {
                loadingPromises.push(this._loadTemplates(), this._loadVolumes());
            }
            if (!this.object.config) {
                this.object.config = {ncpus: ""};
            }
            if (!this.object.guest_type) {
                this.object.guest_type = "other";
            }
            if (!this.object._isNew){
                loadingPromises.push(this._loadWebvncConsole());
            }
            Promise.all(loadingPromises).then(function() {
                self.isLoading = false;
            });
        }
    },

    exitDocument: {
        value: function() {
            this.templateName = null;
            this.memorySize = null;
            this.webvncConsole = null;
        }
    },

    _populateObjectWithTemplate: {
        value: function(template) {
            this.object.config = {};
            this.memorySize = this.object.config.memsize = template.config.memsize;
            this.object.config.ncpus = template.config.ncpus;
            this.object.template = {name: template.template.name};
            this.object.guest_type = template.guest_type;
            this.object.devices = template.devices;
        }
    },

    _loadTemplates: {
        value: function() {
            var self = this;
            if (!this._templatesPromise) {
                this._templatesPromise = this.application.virtualMachineService.getTemplates().then(function(templates) {
                    return self.templates = templates;
                });
            }
            return this._templatesPromise;
        }
    },

    _loadVolumes: {
        value: function() {
            var self = this;

            return this.application.dataService.fetchData(Model.Volume).then(function(volumes) {
                self.volumes = volumes;
            });
        }
    },

    _loadWebvncConsole: {
        value: function () {
            var self = this;
            Model.populateObjectPrototypeForType(Model.Vm).then(function(Vm) {
                return Vm.constructor.services.requestWebvncConsole(self.object.id);
            }).then(function(webvncConsole) {
                self.webvncConsole = webvncConsole;
            });
        }
    },

    save: {
        value: function() {
            var parsedMemsize = this._memorySize.toString().match(this.application.storageService.SCALED_NUMERIC_RE_),
                memsize,
                memsizePrefix,
                memsizeMultiplier = 1;

            if (!!parsedMemsize) {
                memsize = parseInt(parsedMemsize[1]);
                if (!!parsedMemsize[2]) {
                    memsizePrefix = parsedMemsize[2].charAt(0).toUpperCase();
                    // We're going with 1024 no matter what. This is not up for
                    // further discussion.
                    memsizeMultiplier = Math.pow(1024, this.application.storageService.SIZE_PREFIX_EXPONENTS[memsizePrefix] - 2);
                }
            }

            this.object.config.memsize = memsize * memsizeMultiplier;
            this.object.template = this.templateName === "---" ? null : this.object.template;
            this.object.target = this.object.target === "---" ? null : this.object.target;
            this.application.dataService.saveDataObject(this.object);
        }
    },

    _initializeGuestTypeOptions: {
        value: function() {
            var guestTypeOptions = [],
                optionValues = VmGuestType.members,
                label;
            for (var i = 0, length = optionValues.length; i < length; i++) {
                label = this._guestOptionLabels.get(optionValues[i], optionValues[i]);
                guestTypeOptions.push({value: optionValues[i], label: label});
            }
            this.guestTypeOptions = guestTypeOptions;
        }
    },

    handleStartAction: {
        value: function() {
            this.object.services.start(this.object.id);
        }
    },

    handleStopAction: {
        value: function() {
            this.object.services.stop(this.object.id);
        }
    },

    handleRebootAction: {
        value: function() {
            this.object.services.reboot(this.object.id);
        }
    },

    handleWebvncConsoleAction: {
        value: function() {
            window.open(this.webvncConsole, this.object.name + " VM Console");
        }
    }
});
