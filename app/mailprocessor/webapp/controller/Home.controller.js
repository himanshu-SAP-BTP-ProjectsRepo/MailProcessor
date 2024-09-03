sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
function (Controller,MessageToast) {
    "use strict";

    return Controller.extend("com.mailprocessor.controller.Home", {
        onInit: function () {

        },
        
        onHomeSelect: function (oEvent) {
            this.getOwnerComponent().getRouter().navTo("RouteHomeDetail");
            
        },onOrgSelect: function (oEvent) {
           
            this.getOwnerComponent().getRouter().navTo("RouteOrgDetail");
            
        },   onEmailConfigSelect: function (oEvent) {
            // Show the terms dialog
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

            // Perform the navigation to the email account configuration route
            this.getOwnerComponent().getRouter().navTo("RouteEmailAccountConfiguration");
        },onCancelTermsPress: function () {
            var oDialog = this.getView().byId("termsDialog");
            if (oDialog) {
                oDialog.close();
            }

            // Optionally show a message or handle the cancel action
            MessageToast.show("You need to accept the terms to proceed.");
          
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHomeDetail");
        },onEmailReaderLog :function (){
            this.getOwnerComponent().getRouter().navTo("RouteEmailReaderLog");
        },onEmailProcessor : function (){
            this.getOwnerComponent().getRouter().navTo("RouteEmailProcessor");
        },
        onMailBox : function (){
            this.getOwnerComponent().getRouter().navTo("RouteMailBox");
        },onEmailReaderPress :function () {
            this.getOwnerComponent().getRouter().navTo("RouteConfiguredMail");
        }

        
    });
});
