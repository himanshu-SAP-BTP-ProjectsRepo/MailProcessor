sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/Button",
    "sap/ui/core/Item",
    "sap/m/Select",
    "sap/ui/core/Fragment"

], function (Controller, MessageToast, Input, VBox, Button, Fragment, Item, Select) {
    "use strict";
    var oMarkRead;
    return Controller.extend("com.mailprocessor.controller.EmailAccountConfiguration", {

        onInit: function () {
            // Initialize the controller
        },

        onAfterRendering: function () {
            // Show the dialog after the view has been rendered
            this._showTermsDialog();
        },

        _showTermsDialog: function () {
            var oView = this.getView();

            // Check if the dialog is already created
            var oDialog = oView.byId("termsDialog");
            if (!oDialog) {
                // Load the fragment
                oDialog = sap.ui.xmlfragment(oView.getId(), "com.mailprocessor.fragments.TermsDialog", this);

                if (!oDialog) {
                    // Handle the case where the fragment could not be loaded
                    MessageToast.show("The TermsDialog fragment could not be loaded.");
                    return;
                }

                // Add the dialog to the view's dependent aggregation
                oView.addDependent(oDialog);
            }

            // Open the dialog
            oDialog.open();
        },

        onAcceptTermsPress: function () {
            var oView = this.getView();
            var oDialog = oView.byId("termsDialog");
            if (oDialog) {
                oDialog.close();
            }

            // Show the main content
            var oMainContentVBox = oView.byId("mainContentVBox");
            if (oMainContentVBox) {
                oMainContentVBox.setVisible(true);
            }
        },

        onCancelTermsPress: function () {
            var oDialog = this.getView().byId("termsDialog");
            if (oDialog) {
                oDialog.close();
            }

            // Optionally show a message or handle the cancel action
            MessageToast.show("You need to accept the terms to proceed.");

            setTimeout(function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteHomeDetail");
            }.bind(this), 600000);
        },

        onAddInput: function () {
            // Get the VBox container
            var oVBox = this.byId("inputContainer");

            // Create a new VBox to hold the Input and Remove Button
            var oInputVBox = new VBox({
                width: "100%",
                items: [
                    new Input({
                        placeholder: "Enter keyword to be searched",
                        width: "15rem"
                    }),
                    new Button({
                        text: "Remove",
                        press: this.onRemoveInput.bind(this)
                    })
                ]
            });

            // Add the new VBox to the container
            oVBox.addItem(oInputVBox);
        },

        onRemoveInput: function (oEvent) {
            var oButton = oEvent.getSource();
            var oInputVBox = oButton.getParent(); // This will be the VBox containing the Input and Remove Button

            // Remove the VBox (and its children) from the container
            oInputVBox.getParent().removeItem(oInputVBox);
        },

        onSwitchChange: function (oEvent) {
            var oSwitch = oEvent.getSource();
            oMarkRead = oSwitch.getState();




            // Do something with the state if needed
        },

        getKeywords: function () {
            var oVBox = this.byId("inputContainer");
            var aKeywords = [];

            // Ensure inputContainer is a VBox
            if (oVBox instanceof sap.m.VBox) {
                // Iterate through all items in the VBox
                oVBox.getItems().forEach(function (oItem) {
                    // Check if the item is a VBox
                    if (oItem instanceof sap.m.VBox) {
                        // Get the Input control within the VBox
                        var aInnerItems = oItem.getItems();
                        if (aInnerItems.length > 0) {
                            var oInput = aInnerItems[0]; // Assuming the Input is the first item
                            if (oInput instanceof sap.m.Input) {
                                var sValue = oInput.getValue(); // Get the value of the Input
                                if (sValue) {
                                    aKeywords.push(sValue);
                                }
                            }
                        }
                    }
                });
            } else {
                // Log an error or handle the case where inputContainer is not a VBox
                console.error("Expected inputContainer to be an instance of sap.m.VBox, but found: ", oVBox);
            }

            return aKeywords;
        },

        onSubmit: function () {
            var oView = this.getView();
            var oName = oView.byId("fullNameInput");
            var oEmail = oView.byId("emailInput");
            var oPassword = oView.byId("passwordInput");
            var oProtocol = oView.byId("protocolSelect");
            var oAuth = oView.byId("authSelect");
            var oPort = oView.byId("portInput");
            var oConnectionSecurity = oView.byId("securitySelect");

            var oHostName = oView.byId("hostnameInput");
            var oPollingFrequency = oView.byId("pollingFrequencyInput");

            const namePattern = /^[A-Za-zÀ-ÖØ-ÿ' \-]+$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Collect all keywords
            var aKeywords = this.getKeywords();



            if (oName.getValue()) {
                if (namePattern.test(oName.getValue())) {
                    oName.setValueState("None");
                    if (oEmail.getValue()) {
                        if (emailPattern.test(oEmail.getValue())) {
                            oEmail.setValueState("None");
                            if (oPassword.getValue()) {
                                oPassword.setValueState("None");
                                if (oProtocol.getSelectedKey()) {
                                    oProtocol.setValueState("None");
                                    if (oAuth.getSelectedKey()) {
                                        oAuth.setValueState("None")
                                        if (oPort.getValue()) {
                                            oPort.setValueState("None");
                                            if (oPort.getValue() >= 0 && oPort.getValue() <= 65535) {
                                                oPort.setValueState("None");
                                                if (oConnectionSecurity.getSelectedKey()) {
                                                    oConnectionSecurity.setValueState("None");

                                                    if (oHostName.getValue()) {
                                                        oHostName.setValueState("None");
                                                        if (oPollingFrequency.getValue()) {
                                                            oPollingFrequency.setValueState("None");
                                                            if (oPollingFrequency.getValue() >= 0) {
                                                                oPollingFrequency.setValueState("None");
                                                                let oModel = this.getView().getModel();
                                                                let oBindList = oModel.bindList("/EmailConfiguration");
                                                                var portValue = parseInt(this.getView().byId("portInput").getValue(), 10);
                                                                var pollingFrequency = parseInt(this.getView().byId("pollingFrequencyInput").getValue(), 10);
                                                                var oContext = oBindList.create({

                                                                    fullName: oName.getValue(),
                                                                    emailId: oEmail.getValue(),
                                                                    password: oPassword.getValue(),
                                                                    protocol: oProtocol.getSelectedKey(),
                                                                    authenticationMethod: oAuth.getSelectedKey(),
                                                                    port: portValue,
                                                                    connectionSecurity: oConnectionSecurity.getSelectedKey(),
                                                                    hostName: oHostName.getValue(),
                                                                    pollingFrequency: pollingFrequency,
                                                                    keywords: aKeywords,
                                                                    markRead: oMarkRead

                                                                });
                                                                oContext.created().then(() => {
                                                                    MessageToast.show("Submited ");
                                                                }).catch((error) => {
                                                                    MessageToast.show(error);
                                                                })

                                                            } else {
                                                                oPollingFrequency.setValueStateText("polling frequency is not valid");
                                                                oPollingFrequency.setValueState("Error")
                                                            }
                                                        } else {
                                                            oPollingFrequency.setValueStateText("polling frequency is mandatory");
                                                            oPollingFrequency.setValueState("Error")
                                                        }
                                                    } else {
                                                        oHostName.setValueStateText("host is mandatory");
                                                        oHostName.setValueState("Error")
                                                    }

                                                } else {
                                                    oConnectionSecurity.setValueStateText("port no is invalid");
                                                    oConnectionSecurity.setValueState("Error")
                                                }
                                            } else {
                                                oPort.setValueStateText("port no is invalid");
                                                oPort.setValueState("Error")
                                            }
                                        } else {
                                            oPort.setValueStateText("port no is mandatory");
                                            oPort.setValueState("Error")
                                        }
                                    } else {
                                        oAuth.setValueStateText("authentication is mandatory");
                                        oAuth.setValueState("Error")
                                    }
                                } else {
                                    oProtocol.setValueStateText("protocol is mandatory");
                                    oProtocol.setValueState("Error")
                                }

                            } else {
                                oPassword.setValueStateText("password is mandatory");
                                oPassword.setValueState("Error")
                            }

                        } else {
                            oEmail.setValueStateText("please enter valid email");
                            oEmail.setValueState("Error")
                        }

                    } else {
                        oEmail.setValueStateText("email is mandatory");
                        oEmail.setValueState("Error")
                    }

                } else {
                    oName.setValueStateText("please enter valid name");
                    oName.setValueState("Error")
                }

            } else {
                oName.setValueStateText("name is mandatory");
                oName.setValueState("Error")
            }


        },
        onPressCheckPrevious: function () {
            var oView = this.getView();

            // Check if the dialog is already created
            var oDialog = oView.byId("panelDialog1");
            if (!oDialog) {
                // Load the fragment
                oDialog = sap.ui.xmlfragment(oView.getId(), "com.mailprocessor.fragments.PanelFragment", this);

                // Check if fragment was loaded correctly
                if (!oDialog) {
                    sap.m.MessageToast.show("The PanelFragment could not be loaded.");
                    return;
                }

                // Add the dialog to the view's dependent aggregation
                // Ensure oDialog is an instance of sap.ui.core.Control
                if (oDialog instanceof sap.ui.core.Control) {
                    oView.addDependent(oDialog);
                } else {
                    sap.m.MessageToast.show("The loaded fragment is not a valid UI control.");
                    return;
                }
            }

            // Open the dialog
            oDialog.open();
        }, onClosePanelDialog: function () {
            var oView = this.getView();
            var oDialog = oView.byId("panelDialog1");
            oDialog.close();
        }


    });
});
