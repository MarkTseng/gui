/*global require, exports, Error*/
require("./extras/string");

var FreeNASService = require("core/service/freenas-service").FreeNASService,
    TopologyService = require("core/service/topology-service").TopologyService,
    SelectionService = require("core/service/selection-service").SelectionService,
    BootEnvironmentService = require("core/service/boot-environment-service").BootEnvironmentService,
    CalendarService = require("core/service/calendar-service").CalendarService,
    StorageService = require("core/service/storage-service").StorageService,
    UpdateService = require("core/service/update-service").UpdateService,
    FilesystemService = require("core/service/filesystem-service").FilesystemService,
    StatisticsService = require("core/service/statistics-service").StatisticsService,
    MailService = require("core/service/mail-service").MailService,
    SystemService = require("core/service/system-service").SystemService,
    SystemDatasetService = require("core/service/system-dataset-service").SystemDatasetService,
    SystemUIService = require("core/service/system-ui-service").SystemUIService,
    SystemInfoService = require("core/service/system-info-service").SystemInfoService,
    SystemDeviceService = require("core/service/system-device-service").SystemDeviceService,
    SystemGeneralService = require("core/service/system-general-service").SystemGeneralService,
    SystemAdvancedService = require("core/service/system-advanced-service").SystemAdvancedService,
    NetworkInterfaceService = require("core/service/network-interface-service").NetworkInterfaceService,
    ApplicationContextService = require("core/service/application-context-service").ApplicationContextService,
    WidgetService = require("core/service/widget-service").WidgetService,
    ShareService = require("core/service/share-service").ShareService,
    AccountsService = require("core/service/accounts-service").AccountsService,
    Model = require("core/model/model").Model,
    VirtualMachineService = require("core/service/virtual-machine-service").VirtualMachineService,
    Montage = require("montage").Montage;


var UserInterfaceDescriptorPromisesMap = new Map(),
    EMPTY_ARRAY = [];


exports.ApplicationDelegate = Montage.specialize({


    /**
     * @function
     * @public
     *
     * @description todo
     *
     */
    willFinishLoading: {
        value: function (app) {
            app.dataService = FreeNASService.instance;
            app.topologyService = TopologyService.instance;
            app.selectionService = SelectionService.instance;
            app.bootEnvironmentService = BootEnvironmentService.instance;
            app.calendarService = CalendarService.instance;
            app.storageService = StorageService.instance;
            app.updateService = UpdateService.instance;
            app.filesystemService = FilesystemService.instance;
            app.statisticsService = StatisticsService.instance;
            app.mailService = MailService.instance;
            app.systemDatasetService = SystemDatasetService.instance;
            app.systemService = SystemService.instance;
            app.systemUIService = SystemUIService.instance;
            app.systemInfoService = SystemInfoService.instance;
            app.systemGeneralService = SystemGeneralService.instance;
            app.systemDeviceService = SystemDeviceService.instance;
            app.networkInterfacesSevice = NetworkInterfaceService.instance;
            app.shareService = ShareService.instance;
            app.systemAdvancedService = SystemAdvancedService.instance;
            app.accountsService = AccountsService.instance;
            app.virtualMachineService = VirtualMachineService.instance;
            app.applicationContextService = ApplicationContextService.instance;
            app.widgetService = WidgetService.instance;

            app.addOwnPropertyChangeListener("section", this);

            Object.defineProperties(app, {

                _alertService: {
                    value: null
                },

                alertServicePromise: {
                    get: function () {
                        var self = this;

                        if (this._alertService) {
                            return Promise.resolve(this._alertService);
                        }

                        return Model.populateObjectPrototypeForType(Model.Alert).then(function (Alert) {
                            return (self._alertService = Alert.constructor);
                        });
                    }
                }
            });

            app.isDrawerOpen = false;
        }
    },

    handleSectionChange: {
        value: function(section, propertyName, app) {
            if (!app.selectionService.getSectionSelection(section)) {
                app.selectionService.saveSectionSelection(section, EMPTY_ARRAY);
            }
        }
    },

    getUserInterfaceDescriptorForType: {
        value: function (modelType) {
            var key = modelType.typeName || modelType;

            var userInterfaceDescriptorPromise = UserInterfaceDescriptorPromisesMap.get(key);

            if (!userInterfaceDescriptorPromise) {
                userInterfaceDescriptorPromise = new Promise(function (resolve, reject) {
                    Model.populateObjectPrototypeForType(key).then(function (objectPrototype) {
                        resolve(objectPrototype.constructor.userInterfaceDescriptor)
                    });
                });

                UserInterfaceDescriptorPromisesMap.set(key, userInterfaceDescriptorPromise);
            }

            return userInterfaceDescriptorPromise;
        }
    },

    /**
     * @function
     * @public
     *
     * @description todo
     *
     * @return {Promise.<UserInterfaceDescriptor>}
     *
     */
    userInterfaceDescriptorForObject: {
        value: function (object) {
            var userInterfaceDescriptorPromise,
                modelType;

            if (Array.isArray(object)) {
                if (object._meta_data) {
                    modelType = object._meta_data.collectionModelType;
                }

                object = object[0];
            }

            modelType = modelType || (object ? object.constructor.Type : null);

            if (modelType) {
                userInterfaceDescriptorPromise = this.getUserInterfaceDescriptorForType(modelType, object);
            } else {
                return Promise.reject("no user interface descriptor for object: " + object);
            }

            return userInterfaceDescriptorPromise;
        }
    }

});
