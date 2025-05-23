import { decryptId, encryptId } from "@/components/common/Encryption";
import axios from "axios";
import usetoken from "./usetoken";
import apiClient from "./axios";
//DOTENV
export const DOT_ENV = `/panel-fetch-dotenv`;
//PANELCHECK
export const PANEL_CHECK = `/panelCheck`;
//PANELCHECK
export const PANEL_LOGIN = `/login`;
//PANELCHECK
export const PANEL_FORGOT_PASSWORD = `/forgot-password`;

//PROFILE
export const PROFILE = `/fetch-profile`;
export const EDIT_PROFILE = `/updateprofile`;
// PURCHASE
export const PURCHASE_LIST = `/purchases-list`;
export const PURCHASE_EDIT_LIST = `/purchases`;
export const PURCHASE_CREATE = `/purchases`;
// PURCHASE -RETURN
export const PURCHASE_RETURN_LIST = `/purchases-return-list`;
export const PURCHASE_RETURN_EDIT_LIST = `/purchases-return`;
export const PURCHASE_RETURN_CREATE = `/purchases-return`;
//SALES
export const SALES_LIST = `/sales-list`;
export const SALES_EDIT_LIST = `/sales`;
export const SALES_CREATE = `/sales`;
//SALES -RETURN
export const SALES_RETURN_LIST = `/sales-return-list`;
export const SALES_RETURN_EDIT_LIST = `/sales-return`;
export const SALES_RETURN_CREATE = `/sales-return`;
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
export const SINGLE_ITEM_STOCK_REPORT = `/item-stock`;
export const PURCHASE_REPORT = `/report-purchases-data`;
export const SALES_REPORT = `/report-sales-data`;

// ROUTE CONFIGURATION
export const ROUTES = {
  PURCHASE_EDIT: (id) => `/purchase/edit/${encryptId(id)}`,
  PURCHASE_RETURN_EDIT: (id) => `/purchase-return/edit/${encryptId(id)}`,
  SALES_EDIT: (id) => `/dispatch/edit/${encryptId(id)}`,
  SALES_RETURN_EDIT: (id) => `/dispatch-return/edit/${encryptId(id)}`,
  SALES_VIEW: (id) => `/dispatch/view/${encryptId(id)}`,
  SALES_RETURN_VIEW: (id) => `/dispatch-return/view/${encryptId(id)}`,
};
export const navigateToPurchaseEdit = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_EDIT(purchaseId));
};
export const navigateToPurchaseReturnEdit = (navigate, purchaseId) => {
  navigate(ROUTES.PURCHASE_RETURN_EDIT(purchaseId));
};
export const navigateTOSalesEdit = (navigate, salesId) => {
  navigate(ROUTES.SALES_EDIT(salesId));
};
export const navigateTOSalesView = (navigate, salesId) => {
  navigate(ROUTES.SALES_VIEW(salesId));
};
export const navigateTOSalesReturnEdit = (navigate, salesId) => {
  navigate(ROUTES.SALES_RETURN_EDIT(salesId));
};
export const navigateTOSalesReturnView = (navigate, salesId) => {
  navigate(ROUTES.SALES_RETURN_VIEW(salesId));
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
export const fetchPurchaseReturnById = async (encryptedId) => {
  try {
    const token = usetoken();
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await axios.get(`${PURCHASE_RETURN_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("res data", response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const fetchSalesById = async (encryptedId) => {
  try {
    const token = usetoken();

    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await axios.get(`${SALES_EDIT_LIST}/${id}`, {
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
export const fetchSalesReturnById = async (encryptedId) => {
  try {
    const token = usetoken();
    if (!token) throw new Error("No authentication token found");

    const id = decryptId(encryptedId);
    const response = await axios.get(`${SALES_RETURN_EDIT_LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("res data", response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch purchase details"
    );
  }
};
export const updatePurchaseEdit = async (encryptedId, data) => {
  try {
    const token = usetoken();
    if (!token) throw new Error("No authentication token found");
    const id = decryptId(encryptedId);
    const requestData = data.data || data;
    const response = await axios.put(
      `${PURCHASE_EDIT_LIST}/${id}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const updatePurchaseReturnEdit = async (encryptedId, data) => {
  try {
    const token = usetoken();
    if (!token) throw new Error("No authentication token found");

    // const id = encryptedId;
    const id = decryptId(encryptedId);

    const requestData = data.data || data;

    const response = await axios.put(
      `${SALES_RETURN_EDIT_LIST}/${id}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const updateSalesEdit = async (encryptedId, data) => {
  try {
    const token = usetoken();
    if (!token) throw new Error("No authentication token found");
    const id = decryptId(encryptedId);
    const requestData = data.data || data;
    const response = await axios.put(`${SALES_EDIT_LIST}/${id}`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const updateSalesReturnEdit = async (encryptedId, data) => {
  try {
    const token = usetoken();
    if (!token) throw new Error("No authentication token found");

    // const id = encryptedId;
    const id = decryptId(encryptedId);

    const requestData = data.data || data;

    const response = await axios.put(`${SALES_EDIT_LIST}/${id}`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
