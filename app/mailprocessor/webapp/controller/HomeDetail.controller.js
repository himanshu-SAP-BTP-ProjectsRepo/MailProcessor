sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
],
function (Controller,MessageToast,Fragment) {
    "use strict";

    return Controller.extend("com.mailprocessor.controller.HomeDetail", {
        onInit: function () {

        },onPressRegister: function (){
         
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo('RouteOrgRegister');
        },handlePopoverPress: function (oEvent) {
			 var oButton = oEvent.getSource();
			 var oView = this.getView();
		

			
			

            // Check if the dialog is already created
            var oDialog = oView.byId("myPopover");
            if (!oDialog) {
                // Load the fragment
                oDialog = sap.ui.xmlfragment(oView.getId(), "com.mailprocessor.fragments.SignInChoice", this);

                if (!oDialog) {
                    // Handle the case where the fragment could not be loaded
                    MessageToast.show("The  fragment could not be loaded.");
                    return;
                }

                // Add the dialog to the view's dependent aggregation
                oView.addDependent(oDialog);
            }

            // Open the dialog
            oDialog.openBy(oButton);
		},onUserPress :function (oEvent){
			var oButton = oEvent.getSource();
			var oView = this.getView();
			var oDialog = oView.byId("myPopover");
			if (oDialog) {
                
                oDialog.close(oButton);
            }
		},onUserPress : function (oEvent){
            var oButton = oEvent.getSource();
            var oView = this.getView();
            var oDialog = oView.byId("myPopover");
            if (oDialog) {
                oDialog.close();
            }
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo('RouteConfiguredMail');

        },onAdminPress : function (oEvent){
            var oButton = oEvent.getSource();
            var oView = this.getView();
            var oDialog = oView.byId("myPopover");
            if (oDialog) {
                oDialog.close();
            }
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo('RouteOrgRegister');
        }

    });
});
