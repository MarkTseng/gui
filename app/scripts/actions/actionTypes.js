// ACTION TYPES
// ============
// Constant string identifiers used by action creators and reducers in Redux.

"use strict";

// WEBSOCKET
export const WS_TARGET_CHANGED = "WS_TARGET_CHANGED";
export const WS_CONNECTING = "WS_CONNECTING";
export const WS_OPEN = "WS_OPEN";
export const WS_CLOSING = "WS_CLOSING";
export const WS_CLOSED = "WS_CLOSED";
export const WS_ATTEMPT_CONNECTION = "WS_ATTEMPT_CONNECTION";
export const WS_RECONNECT_TICK = "WS_RECONNECT_TICK";



// RPC
export const RPC_ENQUEUE = "RPC_ENQUEUE";
export const RPC_DEQUEUE = "RPC_DEQUEUE";
export const RPC_REQUEST = "RPC_REQUEST";
export const RPC_SUCCESS = "RPC_SUCCESS";
export const RPC_FAILURE = "RPC_FAILURE";
export const RPC_TIMEOUT = "RPC_TIMEOUT";
export const RPC_RESOLVE = "RPC_RESOLVE";



// SUBSCRIPTION
export const SUBSCRIBE = "SUBSCRIBE";
export const UNSUBSCRIBE = "UNSUBSCRIBE";

export const ENTITY_CHANGED = "ENTITY_CHANGED";



// TASKS
export const TASK_SUBMIT_REQUEST = "TASK_SUBMIT_REQUEST";
export const TASK_SUBMIT_SUCCESS = "TASK_SUBMIT_SUCCESS";
export const TASK_SUBMIT_FAILURE = "TASK_SUBMIT_FAILURE";
export const TASK_SUBMIT_TIMEOUT = "TASK_SUBMIT_TIMEOUT";
export const TASK_SUBMIT_RESOLVE = "TASK_SUBMIT_RESOLVE";

export const TASK_CREATED = "TASK_CREATED";
export const TASK_UPDATED = "TASK_UPDATED";
export const TASK_PROGRESS = "TASK_PROGRESS";
export const TASK_FINISHED = "TASK_FINISHED";
export const TASK_FAILED = "TASK_FAILED";



// AUTHENTICATION
export const UPDATE_USERNAME = "UPDATE_USERNAME";
export const UPDATE_PASSWORD = "UPDATE_PASSWORD";
export const LOGIN_SUBMIT_REQUEST = "LOGIN_SUBMIT_REQUEST";
export const LOGOUT = "LOGOUT";
export const LOGOUT_FORCE = "LOGOUT_FORCE";



// ACTIONS
// disks
export const DISK_OVERVIEW_REQUEST = "DISK_OVERVIEW_REQUEST";

// volumes
export const VOLUMES_RPC_REQUEST = "VOLUMES_RPC_REQUEST";
export const AVAILABLE_DISKS_RPC_REQUEST = "AVAILABLE_DISKS_RPC_REQUEST";

export const CREATE_VOLUME_TASK_SUBMIT_REQUEST = "CREATE_VOLUME_TASK_SUBMIT_REQUEST";
export const UPDATE_VOLUME_TASK_SUBMIT_REQUEST = "UPDATE_VOLUME_TASK_SUBMIT_REQUEST";
export const DESTROY_VOLUME_TASK_SUBMIT_REQUEST = "DESTROY_VOLUME_TASK_SUBMIT_REQUEST";

export const CREATE_DATASET_TASK_SUBMIT_REQUEST = "CREATE_DATASET_TASK_SUBMIT_REQUEST";
export const UPDATE_DATASET_TASK_SUBMIT_REQUEST = "UPDATE_DATASET_TASK_SUBMIT_REQUEST";
export const DESTROY_DATASET_TASK_SUBMIT_REQUEST = "DESTROY_DATASET_TASK_SUBMIT_REQUEST";

export const UPDATE_VOLUME = "UPDATE_VOLUME";
export const REVERT_VOLUME = "REVERT_VOLUME";

export const UPDATE_VOLUME_TOPOLOGY = "UPDATE_VOLUME_TOPOLOGY";
export const REVERT_VOLUME_TOPOLOGY = "REVERT_VOLUME_TOPOLOGY";

export const FOCUS_VOLUME = "FOCUS_VOLUME";
export const BLUR_VOLUME = "BLUR_VOLUME";

export const SELECT_PRESET_TOPOLOGY = "SELECT_PRESET_TOPOLOGY";

export const SELECT_DISK = "SELECT_DISK";
export const DESELECT_DISK = "DESELECT_DISK";


// shells
export const GET_SHELLS_REQUEST = "GET_SHELLS_REQUEST";
export const SPAWN_SHELL_REQUEST = "SPAWN_SHELL_REQUEST";

// ACCOUNTS

// users
export const QUERY_USERS_REQUEST = "QUERY_USERS_REQUEST";
export const GET_NEXT_UID_REQUEST = "GET_NEXT_UID_REQUEST";
export const UPDATE_USER_FORM = "UPDATE_USER_FORM";
export const RESET_USER_FORM = "RESET_USER_FORM";

// groups
export const QUERY_GROUPS_REQUEST = "QUERY_GROUPS_REQUEST";
export const GET_NEXT_GID_REQUEST = "GET_NEXT_GID_REQUEST";
export const UPDATE_GROUP_FORM = "UPDATE_GROUP_FORM";
export const RESET_GROUP_FORM = "RESET_GROUP_FORM";
export const GROUP_CREATE_TASK = "GROUP_CREATE_TASK";
export const GROUP_UPDATE_TASK = "GROUP_UPDATE_TASK";
export const GROUP_DELETE_TASK = "GROUP_DELETE_TASK";

// SERVICES

// SSH
export const UPDATE_SSH_FORM = "UPDATE_SSH_FORM";
export const RESET_SSH_FORM = "RESET_SSH_FORM";
export const SUBMIT_SSH_FORM = "SUBMIT_SSH_FORM";
export const DISABLE_SSH = "DISABLE_SSH";
export const ENABLE_SSH = "ENABLE_SSH";
export const SSH_CONFIG_REQUEST = "SSH_CONFIG_REQUEST";


// SYSTEM
// user actions
// OS FORM
export const UPDATE_OS_FORM = "UPDATE_OS_FORM";
export const RESET_OS_FORM = "RESET_OS_FORM";
export const SUBMIT_OS_FORM = "SUBMIT_OS_FORM";
// CONNECTION FORM
// export const UPDATE_CONNECTION_FORM = "UPDATE_CONNECTION_FORM";
// export const RESET_CONNECTION_FORM = "RESET_CONNECTION_FORM";
// export const SUBMIT_CONNECTION_FORM = "SUBMIT_CONNECTION_FORM";
// LOCALIZATION FORM
export const UPDATE_LOCALIZATION_FORM = "UPDATE_LOCALIZATION_FORM";
export const RESET_LOCALIZATION_FORM = "RESET_LOCALIZATION_FORM";
export const SUBMIT_LOCALIZATION_FORM = "SUBMIT_LOCALIZATION_FORM";
// CONSOLE FORM
export const UPDATE_CONSOLE_FORM = "UPDATE_CONSOLE_FORM";
export const RESET_CONSOLE_FORM = "RESET_CONSOLE_FORM";
export const SUBMIT_CONSOLE_FORM = "SUBMIT_CONSOLE_FORM";

// GENERAL
export const SYSTEM_GENERAL_CONFIG_REQUEST = "SYSTEM_GENERAL_CONFIG_REQUEST";
export const SYSTEM_GENERAL_TIMEZONES_REQUEST = "SYSTEM_GENERAL_TIMEZONES_REQUEST";
export const KEYMAPS_REQUEST = "KEYMAPS_REQUEST";

// ADVANCED
export const SYSTEM_ADVANCED_CONFIG_REQUEST = "SYSTEM_ADVANCED_CONFIG_REQUEST";
export const SERIAL_PORTS_REQUEST = "SERIAL_PORTS_REQUEST";

// INFO
export const SYSTEM_INFO_HARDWARE_REQUEST = "SYSTEM_INFO_HARDWARE_REQUEST";
export const SYSTEM_INFO_LOAD_AVG_REQUEST = "SYSTEM_INFO_LOAD_AVG_REQUEST";
export const SYSTEM_INFO_TIME_REQUEST = "SYSTEM_INFO_TIME_REQUEST";
export const SYSTEM_INFO_UNAME_FULL_REQUEST = "SYSTEM_INFO_UNAME_FULL_REQUEST";
export const SYSTEM_INFO_VERSION_REQUEST = "SYSTEM_INFO_VERSION_REQUEST";
