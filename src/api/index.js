import { decryptId, encryptId } from "@/components/common/Encryption";
import apiClient from "./axios";
//DOTENV
export const DOT_ENV = `/panel-fetch-dotenv`;
//PANELCHECK
export const PANEL_CHECK = `/panelCheck`;
//PANEL_LOGIN
export const PANEL_LOGIN = `/login`;
//PANEL_FORGOT_PASSWORD
export const PANEL_FORGOT_PASSWORD = `/forgot-password`;
// //WEB_ENQUIRY
export const WEB_ENQUIRY = `/createEnquiry`;
//PROFILE
export const PROFILE = `/fetch-profile`;
export const EDIT_PROFILE = `/updateprofile`;
// PURCHASE
export const PURCHASE_LIST = `/purchases-list`;
export const PURCHASE_EDIT_LIST = `/purchases`;
export const PURCHASE_CREATE = `/purchases`;
export const PURCHASE_SUB_DELETE = `/purchases-sub`;
export const PURCHASE_STATUS = `/purchases-status`;
// PURCHASE -RETURN
export const PURCHASE_RETURN_LIST = `/purchases-return-list`;
export const PURCHASE_RETURN_EDIT_LIST = `/purchases-return`;
export const PURCHASE_RETURN_CREATE = `/purchases-return`;
export const PURCHASE_RETURN_SUB_DELETE = `/purchases-return-sub`;

//DISPATCH
export const PRE_BOOKING_LIST = `/pre-booking-list`;
export const PRE_BOOKING_CREATE = `/pre-booking`;
export const PRE_BOOKING_SUB_DELETE = `/pre-booking-sub`;
//DISPATCH
export const DISPATCH_LIST = `/dispatch-list`;
export const DISPATCH_EDIT_LIST = `/dispatch`;
export const DISPATCH_CREATE = `/dispatch`;
export const DISPATCH_SUB_DELETE = `/dispatch-sub`;
export const DISPATCH_STATUS = `/dispatch-status`;
//DISPATCH -RETURN
export const DISPATCH_RETURN_LIST = `/dispatch-return-list`;
export const DISPATCH_RETURN_EDIT_LIST = `/dispatch-return`;
export const DISPATCH_RETURN_CREATE = `/dispatch-return`;
export const DISPATCH_RETURN_SUB_DELETE = `/dispatch-return-sub`;
//ITEM-AVAIABLE
export const ITEM_AVAIABLEE = `/available-items`;

//DASHBOARD
export const DASHBOARD_LIST = `/dashboard`;
//MASTER-CATEGORY-ITEM-BUYER
export const CATEGORY_LIST = `/categorys-list`;
export const CATEGORY_CREATE = `/categorys`;
export const CATEGORY_DATA = `/categorys`;
export const CATEGORY_UPDATE = `/categorys`;
export const ITEM_LIST = `/items-list`;
export const ITEM_CREATE = `/items`;
export const ITEM_EDIT_GET = `/items`;
export const ITEM_EDIT_SUMBIT = `/items`;
export const BUYER_LIST = `/buyers-list`;
export const BUYER_EDIT_GET = `/buyers`;
export const BUYER_EDIT_SUMBIT = `/buyers`;
export const BUYER_CREATE = `/buyers`;
export const FETCH_STATE = `/fetch-state`;
//MASTER-BRANCH
export const BRANCH_LIST_FETCH = `/fetch-branch`;
export const BRANCH_LIST = `/branch-list`;
export const BRANCH_CREATE = `/createbranch`;
export const BRANCH_EDIT_GET = `/fetch-branch-by-id`;
export const BRANCH_EDIT_SUMBIT = `/updatebranch`;
//MASTER-TEAM
export const TEAM_LIST = `/fetch-team-list`;
export const CREATE_TEAM = `/createteam`;
export const UPDATE_TEAM_STATUS = `/updateteamstatus`;
//MASTER-GODOWN
export const GODOWN_LIST = `/godown-list`;
export const GODOWN_CREATE = `/godown`;
export const GODOWN_UPDATE = `/godown`;
//INVOICE
export const INVOICE = `/invoice-list`;
export const INVOICE_FORM = `/invoice`;
export const INVOICE_SUB = `/invoice-sub`;
export const DISPATCH_INVOICE = `/dispatch-invoice`;
export const DISPATCH_SUB_INVOICE = `/dispatchSub-invoice`;
//Quatiation
export const QUOTATION = `/quotation-list`;
export const QUOTATION_FORM = `/quotation`;
export const QUOTATION_SUB_DELETE = `/quotation-sub`;
export const QUOTATION_STATUS = `/quotation-status`;
//payment
export const PAYMENT_MODE = `/payment-mode`;
export const PAYMENT_LIST = `/payment-list`;
export const PAYMENT_FORM = `/payment`;

//REPORT STOCK -BUYER
export const BUYER_REPORT = `/report-buyer-data`;
export const BUYER_DOWNLOAD = `/download-buyer-data`;
export const STOCK_REPORT = `/stock`;
export const STOCK_CATEGORY_REPORT = `/item-category-stock`;
export const STOCK_GODOWN_REPORT = `/stock-godown`;
export const SINGLE_ITEM_STOCK_REPORT = `/item-stock`;
export const PURCHASE_REPORT = `/report-purchases-data`;
export const DISPATCH_REPORT = `/report-dispatch-data`;
export const PAYMENT_SUMMARY_REPORT = `/payment-summary`;
export const PAYMENT_LEDGER_REPORT = `/payment-ledger`;
// ROUTE CONFIGURATION
export const ROUTES = {
  PURCHASE_EDIT: (id) => `/purchase/edit/${encryptId(id)}`,
  PURCHASE_VIEW: (id) => `/purchase/view/${encryptId(id)}`,
  PURCHASE_RETURN_EDIT: (id) => `/purchase-return/edit/${encryptId(id)}`,
  PURCHASE_RETURN_VIEW: (id) => `/purchase-return/view/${encryptId(id)}`,
  PREBOOKING_EDIT: (id) => `/pre-booking/edit/${encryptId(id)}`,
  PREBOOKING_VIEW: (id) => `/pre-booking/view/${encryptId(id)}`,
  QUOTATION_EDIT: (id) => `/quotation/form/${encryptId(id)}`,
  INVOICE_EDIT: (id) => `/invoice-form/${encryptId(id)}`,
  DISPATCH_EDIT: (id) => `/dispatch/edit/${encryptId(id)}`,
  DISPATCH_RETURN_EDIT: (id) => `/dispatch-return/edit/${encryptId(id)}`,
  DISPATCH_VIEW: (id) => `/dispatch/view/${encryptId(id)}`,
  DISPATCH_RETURN_VIEW: (id) => `/dispatch-return/view/${encryptId(id)}`,
};
export const navigateToPurchaseEdit = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_EDIT(purchaseId));
};
export const navigateTOPurchaseView = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_VIEW(purchaseId));
};
export const navigateToPurchaseReturnEdit = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_RETURN_EDIT(purchaseId));
};
export const navigateToPurchaseReturnView = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_RETURN_VIEW(purchaseId));
};
export const navigateToPreBookingEdit = (navigate, prebookingId) => {
  navigate(ROUTES.PREBOOKING_EDIT(prebookingId));
};
export const navigateToPreBookingView = (navigate, dispatchId) => {
  navigate(ROUTES.PREBOOKING_VIEW(dispatchId));
};
export const navigateToQuotationEdit = (navigate, dispatchId) => {
  navigate(ROUTES.QUOTATION_EDIT(dispatchId));
};
export const navigateToInvoiceEdit = (navigate, dispatchId) => {
  navigate(ROUTES.INVOICE_EDIT(dispatchId));
};
export const navigateTODispatchEdit = (navigate, dispatchId) => {
  navigate(ROUTES.DISPATCH_EDIT(dispatchId));
};
export const navigateTODispatchView = (navigate, dispatchId) => {
  navigate(ROUTES.DISPATCH_VIEW(dispatchId));
};
export const navigateTODispatchReturnEdit = (navigate, dispatchId) => {
  navigate(ROUTES.DISPATCH_RETURN_EDIT(dispatchId));
};
export const navigateTODispatchReturnView = (navigate, dispatchId) => {
  navigate(ROUTES.DISPATCH_RETURN_VIEW(dispatchId));
};
export const fetchInvoiceById = async (encryptedId, token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await apiClient.get(`${INVOICE_FORM}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error, "error");

    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchPurchaseById = async (encryptedId, token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await apiClient.get(`${PURCHASE_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error, "error");

    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchPurchaseReturnById = async (encryptedId, token) => {
  try {
    const id = decryptId(encryptedId);
    const response = await apiClient.get(`${PURCHASE_RETURN_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchDispatchInvoiceById = async (id, token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const response = await apiClient.get(`${DISPATCH_INVOICE}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error, "error");

    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchDispatchInvoiceSubById = async (id, token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const response = await apiClient.get(`${DISPATCH_SUB_INVOICE}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error, "error");

    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchPreBookingById = async (encryptedId, token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await apiClient.get(`${PRE_BOOKING_CREATE}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchQuotationById = async (encryptedId, token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await apiClient.get(`${QUOTATION_FORM}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchDispatchById = async (encryptedId, token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await apiClient.get(`${DISPATCH_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchDispatchReturnById = async (encryptedId, token) => {
  try {
    const id = decryptId(encryptedId);
    const response = await apiClient.get(`${DISPATCH_RETURN_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("res data", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchAvaiableItem = async (itemid, godown, token) => {
  try {
    const response = await apiClient.get(
      `${ITEM_AVAIABLEE}/${itemid}/${godown}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
