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

//REPORT STOCK -BUYER
export const BUYER_REPORT = `/report-buyer-data`;
export const BUYER_DOWNLOAD = `/download-buyer-data`;
export const STOCK_REPORT = `/stock`;
export const STOCK_GODOWN_REPORT = `/stock-godown`;
export const SINGLE_ITEM_STOCK_REPORT = `/item-stock`;
export const PURCHASE_REPORT = `/report-purchases-data`;
export const DISPATCH_REPORT = `/report-dispatch-data`;

// ROUTE CONFIGURATION
export const ROUTES = {
  PURCHASE_EDIT: (id) => `/purchase/edit/${encryptId(id)}`,
  PURCHASE_RETURN_EDIT: (id) => `/purchase-return/edit/${encryptId(id)}`,
  DISPATCH_EDIT: (id) => `/dispatch/edit/${encryptId(id)}`,
  DISPATCH_RETURN_EDIT: (id) => `/dispatch-return/edit/${encryptId(id)}`,
  DISPATCH_VIEW: (id) => `/dispatch/view/${encryptId(id)}`,
  DISPATCH_RETURN_VIEW: (id) => `/dispatch-return/view/${encryptId(id)}`,
};
export const navigateToPurchaseEdit = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_EDIT(purchaseId));
};
export const navigateToPurchaseReturnEdit = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_RETURN_EDIT(purchaseId));
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
