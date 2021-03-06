var Montage = require("montage").Montage,
    ShareTargettype = require("core/model/enumerations/share-targettype").ShareTargettype,
    application = require("montage/core/application").application,
    FreeNASService = require("core/service/freenas-service").FreeNASService,
    StorageService = require("core/service/storage-service").StorageService,
    Promise = require("montage/core/promise").Promise,
    Model = require("core/model/model").Model;

var ShareService = exports.ShareService = Montage.specialize({

    _instance: {
        value: null
    },

    _dataService: {
        value: null
    },

    createSmbShare: {
        value: function (volume) {
            return this._createNewShare(this.constructor.SHARE_TYPES.SMB, volume);
        }
    },

    createAfpShare: {
        value: function (volume) {
            return this._createNewShare(this.constructor.SHARE_TYPES.AFP, volume);
        }
    },

    createNfsShare: {
        value: function (volume) {
            return this._createNewShare(this.constructor.SHARE_TYPES.NFS, volume);
        }
    },

    createIscsiShare: {
        value: function (volume) {
            return this._createNewShare(this.constructor.SHARE_TYPES.ISCSI, volume);
        }
    },

    populateShareObjectIfNeeded: {
        value: function (shareObject) {
            var self = this,
                populatedSharePromise;
            if (!shareObject.properties) {
                var shareTypes = this.constructor.SHARE_TYPES,
                    propertiesModel;

                //Don't use a switch because it is slower.
                if (shareTypes.AFP === shareObject.type) {
                    propertiesModel = Model.ShareAfp;
                } else if (shareTypes.NFS === shareObject.type) {
                    propertiesModel = Model.ShareNfs;
                } else if (shareTypes.SMB === shareObject.type) {
                    propertiesModel = Model.ShareSmb;
                } else if (shareTypes.ISCSI === shareObject.type) {
                    propertiesModel = Model.ShareIscsi;
                } else {
                    return Promise.reject("unknown share type");
                }

                populatedSharePromise = this._dataService.getNewInstanceForType(propertiesModel).then(function(properties) {
                    shareObject.properties = properties;
                    shareObject.properties.type = 'share-' + shareObject.type;
                    return self._dataService.getNewInstanceForType(Model.Permissions);

                }).then(function(permissions) {
                    shareObject.permissions = permissions;

                    if (shareTypes.SMB === shareObject.type) {
                        shareObject.properties.vfs_objects = [];
                        shareObject.properties._browseable = true;
                        shareObject.properties.hosts_allow = [];
                        shareObject.properties.hosts_deny = [];
                    } else if (shareTypes.NFS === shareObject.type) {
                        shareObject.properties.hosts = [];
                        shareObject.properties.security = [];
                    } else if (shareTypes.ISCSI === shareObject.type) {
                        shareObject.properties.block_size = 512;
                        shareObject.properties.size = 0;

                        return (shareObject.__extent = {
                            id: null,
                            lun: 0
                        });
                    }

                    return shareObject;
                });

            } else {
                populatedSharePromise = Promise.resolve(shareObject);
            }

            return populatedSharePromise.then(function(populatedShareObject) {
                return self.ensureDefaultPermissionsAreSet(populatedShareObject);
            });
        }
    },

    ensureDefaultPermissionsAreSet: {
        value: function(share) {
            if (!share.permissions || !share.permissions.user || !share.permissions.group) {
                var permissionsPromise = share.permissions ?
                    Promise.resolve(share.permissions) : this._dataService.getNewInstanceForType(Model.Permissions);

                return permissionsPromise.then(function (permissions) {
                    if (!permissions.user) {
                        permissions.user = 'root';
                    }
                    if (!permissions.group) {
                        permissions.group = 'wheel';
                    }

                    share.permissions = permissions;
                    return share;
                });
            }
            return Promise.resolve(share);
        }
    },

    save: {
        value: function (shareObject) {
            //FIXME: workaround for the SELECT component. Future dead code.
            if (shareObject.type === this.constructor.SHARE_TYPES.NFS) {
                var properties = shareObject.properties;

                properties.maproot_user = properties.maproot_user != ' - ' ? properties.maproot_user : null;
                properties.maproot_group = properties.maproot_group != ' - ' ? properties.maproot_group : null;
                properties.mapall_user = properties.mapall_user != ' - ' ? properties.mapall_user : null;
                properties.mapall_group = properties.mapall_group != ' - ' ? properties.mapall_group : null;
            }

            var targetTypes = this.constructor.TARGET_TYPES;

            if (shareObject._isNewObject && (
                shareObject.target_type === targetTypes.DATASET || shareObject.target_type === targetTypes.ZVOL)
            ) {
                shareObject.target_path += '/' + shareObject.name;
            }

            if (shareObject.type === this.constructor.SHARE_TYPES.ISCSI) {
                return this._saveIscsiShareObject(shareObject);
            }

            return this._dataService.saveDataObject(shareObject)
        }
    },

    _saveIscsiShareObject: {
        value: function (shareObject) {
            var self = this,
                isNewShareObject = shareObject._isNewObject,
                blockSize = shareObject.properties.block_size,
                size = shareObject.properties.size;

            //FIXME: add to the tool a way to override default setter.
            if (typeof blockSize === "string") {
                shareObject.properties.block_size = this._storageService._convertVolumeDatasetSizeProperty(blockSize);
            }

            if (typeof size === "string") {
                shareObject.properties.size = this._storageService._convertVolumeDatasetSizeProperty(size);
            }

            return self._dataService.saveDataObject(shareObject).then(function () { // share + share-iscsi (share.properties)
                if (isNewShareObject) {
                    return self._dataService.getNewInstanceForType(Model.ShareIscsiTarget);
                }
                //TODO: Need to update extent object when the share name change?
                // IF so maybe we should add the snapshoting!!
            }).then(function (target) {
                var extentObject = {
                        name: shareObject.name,
                        number: shareObject.__extent.lun
                    };

                target.id = shareObject.__extent.id;

                if (Array.isArray(target.extents)) {
                    target.extents.push(extentObject);
                } else {
                    target.extents = [extentObject];
                }

                return self._dataService.saveDataObject(target); // save share-iscsi-target
            });
        }
    },

    _createNewShare: {
        value: function (shareType, volume) {
            return this._dataService.getNewInstanceForType(Model.Share).then(function(share) {
                share._isNewObject = true;
                share.type = shareType;
                share.enabled = true;
                share.description = '';
                share.volume = volume;

                return share;
            });
        }
    },

    fetchShareIscsiTarget: {
        value: function () {
            var self = this;

            return this._dataService.fetchData(Model.ShareIscsiTarget).then(function (shareIscsiTargetCollection) {
                return (self.shareIscsiTargetCollection = shareIscsiTargetCollection);
            });
        }
    }

}, {

    //FIXME: could probably be an enum
    SHARE_TYPES: {
        value: {
            AFP: "afp",
            SMB: "smb",
            NFS: "nfs",
            ISCSI: "iscsi"
        }
    },

    TARGET_TYPES: {
        get: function () {
            return ShareTargettype;
        }
    },

    instance: {
        get: function() {
            if (!this._instance) {
                this._instance = new ShareService();
                this._instance._dataService = FreeNASService.instance;
                this._instance._storageService = StorageService.instance;
            }

            return this._instance;
        }
    }
});
