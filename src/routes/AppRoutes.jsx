import { Route, Routes } from "react-router-dom";

import StockView from "@/app/stockView/StockView";

import Login from "@/app/auth/Login";
import ForgotPassword from "@/components/ForgotPassword/ForgotPassword";
import Maintenance from "@/components/common/Maintenance";
import AuthRoute from "./AuthRoute";
import ProtectedRoute from "./ProtectedRoute";

import CreateDispatch from "@/app/dispatch/CreateDispatch";
import DispatchList from "@/app/dispatch/DispatchList";
import DispatchView from "@/app/dispatch/DispatchView";
import CreateDispatchReturnForm from "@/app/dispatchreturn/CreateDispatchReturnForm";
import DispatchReturnList from "@/app/dispatchreturn/DispatchReturnList";
import DispatchReturnView from "@/app/dispatchreturn/DispatchReturnView";
import NotFound from "@/app/errors/NotFound";
import Home from "@/app/home/Home";
import BranchList from "@/app/master/branch/BranchList";
import BuyerList from "@/app/master/buyer/BuyerList";
import CategoryList from "@/app/master/category/CategoryList";
import GoDownList from "@/app/master/godown/GoDownList";
import ItemList from "@/app/master/item/ItemList";
import TeamList from "@/app/master/team/TeamList";
import CreatePurchase from "@/app/purchase/CreatePurchase";
import PurchaseList from "@/app/purchase/PurchaseList";
import CreatePurchaseReturn from "@/app/purchasereturn/CreatePurchaseReturn";
import PurchaseReturnList from "@/app/purchasereturn/PurchaseReturnList";
import BuyerReport from "@/app/report/BuyerReport";
import DispatchReport from "@/app/report/DispatchReport";
import PurchaseReport from "@/app/report/PurchaseReport";
import SingleItemStock from "@/app/report/SingleItemStock";
import Stock from "@/app/report/Stock";
import ValidationWrapper from "@/utils/ValidationWrapper";
import StockGoDown from "@/app/report/StockGoDown";

function AppRoutes() {
  return (
    <ValidationWrapper>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/master/buyer" element={<BuyerList />} />
          <Route path="/master/item" element={<ItemList />} />
          <Route path="/master/category" element={<CategoryList />} />
          <Route path="/master/branch" element={<BranchList />} />
          <Route path="/master/team" element={<TeamList />} />
          <Route path="/master/go-down" element={<GoDownList />} />
          <Route path="/stock-view" element={<StockView />} />
          <Route path="/purchase" element={<PurchaseList />} />
          <Route path="/purchase/create" element={<CreatePurchase />} />
          <Route path="/purchase/edit/:id" element={<CreatePurchase />} />
          <Route path="/purchase-return" element={<PurchaseReturnList />} />
          <Route
            path="/purchase-return/create"
            element={<CreatePurchaseReturn />}
          />
          <Route
            path="/purchase-return/edit/:id"
            element={<CreatePurchaseReturn />}
          />
          <Route path="/dispatch" element={<DispatchList />} />
          <Route path="/dispatch/create" element={<CreateDispatch />} />
          <Route path="/dispatch/edit/:id" element={<CreateDispatch />} />
          <Route path="/dispatch/view/:id" element={<DispatchView />} />

          <Route path="/dispatch-return" element={<DispatchReturnList />} />
          <Route
            path="/dispatch-return/create"
            element={<CreateDispatchReturnForm />}
          />
          <Route
            path="/dispatch-return/edit/:id"
            element={<CreateDispatchReturnForm />}
          />
          <Route
            path="/dispatch-return/view/:id"
            element={<DispatchReturnView />}
          />
          <Route path="/report/stock" element={<Stock />} />
          <Route path="/report/buyer" element={<BuyerReport />} />
          <Route
            path="/report/single-item-stock"
            element={<SingleItemStock />}
          />
          <Route path="/report/godown-stock" element={<StockGoDown />} />
          <Route path="/report/purchase" element={<PurchaseReport />} />
          <Route path="/report/dispatch" element={<DispatchReport />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ValidationWrapper>
  );
}

export default AppRoutes;
