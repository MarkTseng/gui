var DataService = require("montage-data/logic/service/data-service").DataService,
    BackEndBridgeModule = require("../backend/backend-bridge"),
    DataObjectDescriptor = require("montage-data/logic/model/data-object-descriptor").DataObjectDescriptor,
    NotificationCenterModule = require("../backend/notification-center"),
    NotificationCenter = NotificationCenterModule.NotificationCenter,
    Services = require("../model/services").Services,
    Montage = require("montage/core/core").Montage,
    Model = require("../model/model").Model;


/**
 * The interface to all services used by FreeNAS.
 *
 * @class
 * @extends external:DataService
 */
var FreeNASService = exports.FreeNASService = DataService.specialize({


/*----------------------------------------------------------------------------------------------------------------------
                                              Authorization/Authentication
----------------------------------------------------------------------------------------------------------------------*/


    constructor: {
        value: function FreeNASService() {
            this.backendBridge = BackEndBridgeModule.defaultBackendBridge;

            var info = Montage.getInfoForObject(this);
            this._authorizationServices = [info.moduleId];

            if (this.providesAuthorization) {
                DataService.authorizationManager.registerAuthorizationService(this);
            }

            if (this.authorizationPolicy === DataService.AuthorizationPolicyType.UpfrontAuthorizationPolicy) {
                DataService.authorizationManager.authorizeService(this).then(function (authorization) {
                    console.log("I'm Authorized!! ", authorization);
                });
            }


            //Fixme: temporary cache
            this.modelsCache = new Map();

            return this;
        }
    },


    authorizationPolicy: {
        value: DataService.AuthorizationPolicyType.UpfrontAuthorizationPolicy
    },


    providesAuthorization: {
        value: true
    },


    _authorizationServices: {
        value: null
    },


    authorizationServices: {
        get: function () {
            return this._authorizationServices || (this._authorizationServices = [this]);
        }
    },


    authorizationPanel: {
        value: "ui/sign-in.reel"
    },


    loginWithCredentials: {
        value: function (_username, _password) {
            var self = this;

            return this.backendBridge.send("rpc", "auth", {
                username : _username,
                password : _password
            }).then(function (response) {
                return self._startListenToBackendEvents().then(function () {
                    //FIXME:
                    //This is a response object. We need to extract data and turn it into
                    //a user objet using the User.objectDescriptor.
                    return response;
                });
            });
        }
    },


/*----------------------------------------------------------------------------------------------------------------------
                                                    DataService
----------------------------------------------------------------------------------------------------------------------*/


    types: {
        value: [
            //FIXME: ALL_TYPES doesn't seems to work
            //DataObjectDescriptor.ALL_TYPES,
            Model.Disk,
            Model.NetworkInterface,
            Model.NetworkRoute,
            Model.NetworkConfig,
            Model.Ipmi,
            Model.Volume,
            Model.VolumeSnapshot,
            Model.Share,
            Model.User,
            Model.Group
        ]
    },


    notificationCenter: {
        get: function () {
            return NotificationCenterModule.defaultNotificationCenter;
        }
    },


    fetchRawData: {
        value: function (stream) {
            var type = stream.selector.type;

            if (type.objectPrototype) {
                this._fetchRawDataWithType(stream, type);

            } else {
                var self = this;

                Model.getPrototypeForType(type).then(function () {
                    self._fetchRawDataWithType(stream, type);
                });
            }
        }
    },


    deleteRawData: {
        value: function (rawData, object) {
            var objectPrototype = Object.getPrototypeOf(object),
                type = objectPrototype.Type,
                deleteServiceDescriptor = Services.findDeleteServiceForType(type);

            if (deleteServiceDescriptor) {
                var self = this;

                return this.backendBridge.send(
                    deleteServiceDescriptor.namespace,
                    deleteServiceDescriptor.name, {
                        method: deleteServiceDescriptor.method,
                        args: [deleteServiceDescriptor.task, [object.id]]
                    }
                ).then(function (response) {
                    return self.notificationCenter.startTrackingTaskWithJobId(response.data);
                });
            }

            return Promise.reject(new Error("No delete service for the model object '" + type.typeName + "'"));
        }
    },


    mapToRawData: {
        value: function (object, data) {
            //fixme @charles how to reject the promise here?
            if (object.id !== void 0) {
                var objectPrototype = Object.getPrototypeOf(object),
                    type = objectPrototype.Type,
                    isUpdate = object.id !== null,
                    serviceDescriptor = isUpdate ?
                        Services.findUpdateServiceForType(type) : // -> update case (fixme: delete...)
                        Services.findCreateServiceForType(type); // -> create case

                // todo: switch to a validator field, schemas
                if (serviceDescriptor) {
                    var restrictions = serviceDescriptor.restrictions,
                        propertyDescriptors = objectPrototype.blueprint.propertyBlueprints,
                        hasRestrictions = !!restrictions, respectedRestrictionsCounter = 0,
                        requiredFields, isPropertyValueNullified, forbiddenFields, propertyDescriptor, propertyValue, key;

                    if (hasRestrictions) {
                        forbiddenFields = restrictions.forbiddenFields;
                        requiredFields = restrictions.requiredFields;
                    }

                    for (var i = 0, length = propertyDescriptors.length; i < length; i++) {
                        propertyDescriptor = propertyDescriptors[i];
                        key = propertyDescriptor.name;
                        propertyValue = object[key];
                        isPropertyValueNullified = propertyValue === null || propertyValue === void 0;

                        if (propertyDescriptor.mandatory && isPropertyValueNullified) {
                            throw new Error ("missing mandatory field '" + key + "' for type: '" + type.typeName + "'");
                        }

                        if (hasRestrictions) {
                            if (forbiddenFields && forbiddenFields.indexOf(key) === -1) {
                                if (requiredFields && requiredFields.indexOf(key) > -1 && !isPropertyValueNullified) {
                                    respectedRestrictionsCounter++;
                                }

                                this._mapPropertyToRawData(data, object, key, isUpdate);
                            }
                        } else {
                            this._mapPropertyToRawData(data, object, key, isUpdate);
                        }
                    }

                    if (requiredFields && requiredFields.length !== respectedRestrictionsCounter) {
                        //todo: improve this error message, with list of the missing fields ?
                        throw new Error ("missing required fields for type: '" + type.typeName + "'");
                    }
                } else {
                    //todo warning
                }
            } else {
                //todo warning
            }
        }
    },

    saveRawData: {
        value: function (rawData, object) {
            var type = Object.getPrototypeOf(object).Type;

            if (object.id !== void 0) { // id can be forbidden
                var isUpdate = object.id !== null,
                    serviceDescriptor = isUpdate ?
                        Services.findUpdateServiceForType(type) : Services.findCreateServiceForType(type);

                if (serviceDescriptor) {
                    var self = this;

                    return this.backendBridge.send(
                        serviceDescriptor.namespace,
                        serviceDescriptor.name, {
                            method: serviceDescriptor.method,
                            args: [serviceDescriptor.task, isUpdate ? [object.id, rawData] : [rawData]]
                        }

                    ).then(function (response) {
                        return self.notificationCenter.startTrackingTaskWithJobId(response.data);
                    });
                } else {
                    return Promise.reject(new Error(
                        "No '" + isUpdate ? "update" : "create" + "' service for the model object '" + type.typeName + "'"
                    ));
                }
            } else {
                return Promise.reject(new Error("Non supported model object '" + type.typeName + "', 'id' is missing"));
            }
        }
    },


    _fetchRawDataWithType: {
        value: function (stream, type) {
            if (this.modelsCache.has(type.typeName)) {
                stream._data = this.modelsCache.get(type.typeName);
                stream.dataDone();

            } else {
                var readServiceDescriptor = Services.findReadServiceForType(type);

                if (readServiceDescriptor) {
                    var self = this;

                    return this.backendBridge.send(
                        readServiceDescriptor.namespace,
                        readServiceDescriptor.name, {
                            method: readServiceDescriptor.method,
                            args: []
                        }
                    ).then(function (response) {
                        var data = response.data;

                        self.notificationCenter.startListenToChangesOnModelIfNeeded(type).then(function () {
                            self.addRawData(stream, Array.isArray(data) ? data : [data]);
                            self.rawDataDone(stream);

                            stream.then(function (data) {
                                self.modelsCache.set(type.typeName, data);

                                return data;
                            })
                        });
                    }, function (error) {
                        stream.dataError(error);
                    });
                } else {
                    stream.dataError(new Error("No fetch service for the model object '" + type.typeName + "'"));
                }
            }
        }
    },


    _mapPropertyToRawData: {
        value: function (rawData, object, propertyKey, update) {
            var propertyValue = object[propertyKey];

            if (update) {
                if (object.hasOwnProperty("_" + propertyKey)) { // filter unset values.
                    rawData[propertyKey] = propertyValue;
                }
            } else if (propertyValue !== null) {
                rawData[propertyKey] = propertyValue;
            }
        }
    },


    handleModelChange: {
        value: function (event) {
            var detail = event.detail;

            if (detail) {
                var modelCache = this._findModelCacheForType(detail.modelType);

                if (modelCache) {
                    var type = Model[detail.modelType],
                        data = detail.data,
                        length = data.length,
                        i = 0,
                        rawModel,
                        model;

                    if (detail.service === "create") {
                        for (rawModel = data[i]; i < length; i++) {
                            model = this.getDataObject(type);
                            this.mapFromRawData(model, rawModel);
                            modelCache.push(model);
                        }
                    } else if (detail.service === "delete") {
                        var modelIndex, id;

                        for (id = data[i]; i < length; i++) {
                            modelIndex = this._findModelIndexFromCacheWithTypeAndId(type, id);

                            if (modelIndex > -1) {
                                modelCache.splice(modelIndex, 1);
                            }
                        }
                    } else { // consider other operations as an update.
                        for (rawModel = data[i]; i < length; i++) {
                            model = this._findModelFromCacheWithTypeAndId(type, rawModel.id);

                            if (model) {
                                this.mapFromRawData(model, rawModel);
                            } else {
                                //todo: warning?
                            }
                        }
                    }
                }
            } else {
                //todo: throw an error/warning ?
            }
        }
    },


    _startListenToBackendEvents: {
        value: function () {
            var self = this;

            return this.notificationCenter.startListenToTaskEvents().then(function () {
                self.notificationCenter.addEventListener("modelChange", self);
            });
        }
    },


    _stopListenToBackendEvents: {
        value: function () {
            var self = this;

            return this.notificationCenter.stopListenToTaskEvents().then(function () {
                self.notificationCenter.removeEventListener("modelChange", self);
            });
        }
    },


    _findModelCacheForType: {
        value: function (type) {
            return this.modelsCache.get(type.typeName || type);
        }
    },


    _findModelFromCacheWithTypeAndId: {
        value: function (type, modelId) {
            var index = this._findModelIndexFromCacheWithTypeAndId(type, modelId);

            return index > -1 ? this._findModelCacheForType(type)[index] : null;
        }
    },


    _findModelIndexFromCacheWithTypeAndId: {
        value: function (type, modelId) {
            var modelCache = this._findModelCacheForType(type),
                index = -1,
                model;

            if (modelCache) {
                for (var i = 0, length = modelCache.length; i < length; i++) {
                    model = modelCache[i];

                    if (model.id === modelId) {
                        index = i;
                        break
                    }
                }
            }

            return index;
        }
    }


}, {


    instance: {
        get: function () {
            var instance = this._instance;

            if (!instance) {
                var freeNASService = new FreeNASService(),
                    notificationCenter = new NotificationCenter().initWithBackendBridge(freeNASService.backendBridge);

                instance = new DataService();
                DataService.mainService.addChildService(freeNASService);

                NotificationCenterModule.defaultNotificationCenter = notificationCenter;
            }

            return instance;
        }
    }


});
