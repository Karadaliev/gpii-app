/**
 * PSP Messages Distributor Integration Test Definitions
 *
 * Test message bundles loading and distribution.
 *
 * Test definitions for survey related functionalities. Check whether a trigger message
 * is interpreted correctly as well as whether a survey is shown when necessary.
 * Copyright 2017 Raising the Floor - International
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

fluid.require("node-jqunit", require, "jqUnit");

require("../src/common/messageBundles.js");

fluid.registerNamespace("gpii.tests.messageBundles.testDefs");


fluid.defaults("gpii.tests.messageBundles.deepTranslatableComp", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        messages: {
            eat: null // expected to be passed by the distribution
        }
    }
});

fluid.defaults("gpii.tests.messageBundles.translatableComp", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        messages: {
            greet: null // expected to be passed by the distribution
        }
    },

    components: {
        deeper: {
            type: "gpii.tests.messageBundles.deepTranslatableComp"
        }
    }
});

fluid.defaults("gpii.tests.messageBundles.mainComp", {
    gradeNames: ["fluid.component", "gpii.app.messageBundles"],

    model: {
        locale: "en"
    },

    messageBundlesPath: "./testData/messageBundles/test-message-bundles.json",

    events: {
        onPostponed: null
    },

    components: {
        simple: {
            type: "gpii.tests.messageBundles.translatableComp"
        },
        postponed: {
            type: "gpii.tests.messageBundles.translatableComp",
            // simply ensure that the distribution component has been created
            createOnEvent: "{mainComp}.events.onPostponed"
        }
    }
});

fluid.defaults("gpii.tests.messageBundles", {
    gradeNames: "fluid.test.testEnvironment",
    components: {
        messageBundleTester: {
            type: "gpii.tests.psp.messageBundleTester"
        }
    }
});

fluid.defaults("gpii.tests.psp.messageBundleTester", {
    gradeNames: "fluid.test.testCaseHolder",

    components: {
        mainComp: {
            type: "gpii.tests.messageBundles.mainComp"
        }
    },

    modules: [{
        name: "Messages Distribution tests",
        tests: [{
            name: "Distribution to normal subcomponent",
            expect: 5,
            sequence: [
                { // Check distribution is proper using default message bundle
                    funcName: "jqUnit.assertEquals",
                    args: [
                        "MessageBundles: simple component have message distributed",
                        "{mainComp}.model.messages.gpii_tests_messageBundles_translatableComp.greet",
                        "{mainComp}.simple.model.messages.greet"
                    ]
                },

                [ // check whether the dependent component's model was updated properly (the binding works)
                    {
                        func: "{mainComp}.applier.change",
                        args: ["locale", "it"]
                    }, {
                        funcName: "jqUnit.assertEquals",
                        args: [
                            "MessageBundles: A proper binding is set for component messages",
                            "{mainComp}.options.messageBundles.it.gpii_tests_messageBundles_translatableComp_greet",
                            "{mainComp}.simple.model.messages.greet"
                        ]
                    }, { // and a subcomponent
                        funcName: "jqUnit.assertEquals",
                        args: [
                            "MessageBundles: A proper binding is set for component messages",
                            "{mainComp}.options.messageBundles.it.gpii_tests_messageBundles_deepTranslatableComp_eat",
                            "{mainComp}.simple.deeper.model.messages.eat"
                        ]
                    }
                ], [ // use missing bundle, check whether default is set
                    {
                        func: "{mainComp}.applier.change",
                        args: ["locale", "bg"]
                    }, {
                        funcName: "jqUnit.assertEquals",
                        args: [
                            "MessageBundles: A proper binding is set for component messages",
                            "{mainComp}.options.messageBundles.en.gpii_tests_messageBundles_translatableComp_greet",
                            "{mainComp}.simple.model.messages.greet"
                        ]
                    }, { // same behaviour for invalid locale
                        func: "{mainComp}.applier.change",
                        args: ["locale", "invalid locale"]
                    }, {
                        funcName: "jqUnit.assertEquals",
                        args: [
                            "MessageBundles: A proper binding is set for component messages",
                            "{mainComp}.options.messageBundles.en.gpii_tests_messageBundles_translatableComp_greet",
                            "{mainComp}.simple.model.messages.greet"
                        ]
                    }
                ]
            ]
        }, {
            name: "Distribution to components with postponed creation",
            expect: 2,
            sequence: [
                // create the subcomponent
                {
                    funcName: "{mainComp}.events.onPostponed.fire"
                }, {
                    func: "{mainComp}.applier.change",
                    args: ["locale", "en"]
                },

                [ // check if it has proper bindings
                    {
                        funcName: "jqUnit.assertEquals",
                        args: [
                            "MessageBundles: A proper binding is set for component messages",
                            "{mainComp}.options.messageBundles.en.gpii_tests_messageBundles_translatableComp_greet",
                            "{mainComp}.postponed.model.messages.greet"
                        ]
                    }, {
                        func: "{mainComp}.applier.change",
                        args: ["locale", "it"]
                    }, {
                        funcName: "jqUnit.assertEquals",
                        args: [
                            "MessageBundles: A proper binding is set for component messages",
                            "{mainComp}.options.messageBundles.it.gpii_tests_messageBundles_translatableComp_greet",
                            "{mainComp}.postponed.model.messages.greet"
                        ]
                    }
                ]
            ]
        }]
    }]
});

fluid.test.runTests(["gpii.tests.messageBundles"]);