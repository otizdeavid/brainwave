import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home";
import PricingPage from "./Pages/PricingPage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";


import AppLayout from "./components/AppLayout";

import DashBoard from "./Pages/app/DashBoard";
import Chat from "./Pages/app/Chat";

import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";




const App = () => {
  return (
    <>

      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/pricing" element={<PricingPage />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>

        {/* Application*/}

        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashBoard />}></Route>
          <Route path="chat" element={<Chat />}></Route>
        </Route>

      </Routes>

    </>
  );
};

export default App;
