sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/odata/v4/ODataModel",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/Button"
], function (Controller, ODataModel, JSONModel, MessageToast, Dialog, List, StandardListItem, Button) {
  "use strict";

  return Controller.extend("com.mailprocessor.controller.MailBox", {
      onInit: function () {
         
      }, onEmailDataPress: function (oEvent) {
        var oSelectedItem = oEvent.getSource();
        var oContext = oSelectedItem.getBindingContext();

        // Load attachments for the selected email
        var sEmailId = oContext.getProperty("ID");
        var oAttachmentsModel = this.getView().byId("attachmentsTable").getModel();
        oAttachmentsModel.read("/Attachments?$filter=email_Id eq '" + sEmailId + "'", {
            success: function (oData) {
                this.getView().byId("attachmentsTable").getBinding("items").refresh();
            }.bind(this),
            error: function (oError) {
                sap.m.MessageToast.show("Error loading attachments");
            }
        });
    },

    onAttachmentPress: function (oEvent) {
        var oSelectedItem = oEvent.getSource();
        var sFileName = oSelectedItem.getBindingContext().getProperty("fileName");
        var sFileData = oSelectedItem.getBindingContext().getProperty("file");

        var oBlob = new Blob([sFileData], { type: "application/octet-stream" });
        var oUrl = URL.createObjectURL(oBlob);

        window.open(oUrl, "_blank");
    }
   
    
  });
});
