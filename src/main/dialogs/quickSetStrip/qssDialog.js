/**
 * The Quick Set Strip pop-up
 *
 * Introduces a component that uses an Electron BrowserWindow to represent the QSS.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");

require("../basic/dialog.js");
require("../basic/blurrable.js");
require("../../../common/channelUtils.js");


/**
 * Component that represents the Quick Set strip.
 */
fluid.defaults("gpii.app.qss", {
    gradeNames: ["gpii.app.dialog", "gpii.app.blurrable"],

    config: {
        closable: false,

        attrs: {
            width: 984,
            height: 95,
            alwaysOnTop: true,
            transparent: false
        },
        params: {
            settings: null
        },
        fileSuffixPath: "qss/index.html"
    },

    events: {
        onQssOpen: null,
        onQssWidgetToggled: null,
        onQssSettingAltered: null,
        onSettingUpdated: null,

        onUndoIndicatorChanged: null
    },

    linkedWindowsGrades: ["gpii.app.psp", "gpii.app.qssWidget",  "gpii.app.qssNotification", "gpii.app.qssMorePanel", "gpii.app.qss"],

    components: {
        channelNotifier: {
            type: "gpii.app.channelNotifier",
            options: {
                events: {
                    onQssOpen: "{qss}.events.onQssOpen",
                    onQssWidgetToggled: "{qss}.events.onQssWidgetToggled",
                    onSettingUpdated: "{qss}.events.onSettingUpdated",
                    onUndoIndicatorChanged: "{qss}.events.onUndoIndicatorChanged",
                    onIsKeyedInChanged: null
                },
                listeners: {
                    onSettingUpdated: {
                        "funcName": "console.log",
                        args: ["Sending Updated QSS: ", "{arguments}.0"]
                    }
                },
                modelListeners: {
                    "{qss}.model.isKeyedIn": {
                        this: "{that}.events.onIsKeyedInChanged",
                        method: "fire",
                        args: ["{change}.value"],
                        excludeSource: "init"
                    }
                }
            }
        },
        channelListener: {
            type: "gpii.app.channelListener",
            options: {
                events: {
                    onQssClosed: null,
                    onQssButtonFocused: null,
                    onQssButtonsFocusLost: null,
                    onQssButtonActivated: null,
                    onQssButtonMouseEnter: null,
                    onQssButtonMouseLeave: null,

                    onQssSettingAltered: "{qss}.events.onQssSettingAltered",
                    onQssNotificationRequired: null,
                    onQssMorePanelRequired: null,
                    onQssUndoRequired: null,
                    onQssSaveRequired: null,
                    onQssPspOpen: null
                },

                listeners: {
                    onQssClosed: {
                        func: "{qss}.hide"
                    },
                    // XXX DEV
                    onQssSettingAltered: {
                        funcName: "console.log",
                        args: ["Setting altered QSS:", "{arguments}.0.path", "{arguments}.0.value"]
                    }
                }
            }
        }
    },
    listeners: {
        "onCreate.initBlurrable": {
            func: "{that}.initBlurrable",
            args: ["{that}.dialog"]
        }
    },
    invokers: {
        show: {
            funcName: "gpii.app.qss.show",
            args: [
                "{that}",
                "{arguments}.0" // params
            ]
        },
        handleBlur: {
            funcName: "fluid.identity"
        },
        updateUndoIndicator: {
            func: "{that}.events.onUndoIndicatorChanged.fire",
            args: [
                "{arguments}.0" // state
            ]
        }
    }
});

/**
 * Shows the QSS or focuses it in case it is already shown.
 * @param {Component} that - The `gpii.app.qss` instance.
 * @param {Object} params - The parameters which should be passed to the renderer
 * part of the QSS. These may, for example, inform the renderer if the QSS was
 * opened via an ArrowLeft/ArrowRight key or using the global shortcut.
 */
gpii.app.qss.show = function (that, params) {
    gpii.app.dialog.show(that);

    that.events.onQssOpen.fire(params);
};
