import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/app-layout'
import LoginPage from './pages/login'
import HomePage from './pages/home'
import { lazy, Suspense } from 'react'

const AccountsPage = lazy(() => import('./pages/accounts/index'))
const AccountDetailPage = lazy(() => import('./pages/accounts/detail'))
const AccountCreatePage = lazy(() => import('./pages/accounts/create'))
const DashboardPage = lazy(() => import('./pages/dashboard/index'))
const ImportPage = lazy(() => import('./pages/dashboard/import'))
const OrdersPage = lazy(() => import('./pages/workspace/orders'))
const OrderDetailPage = lazy(() => import('./pages/workspace/order-detail'))
const OrderCreatePage = lazy(() => import('./pages/workspace/order-create'))
const EditorPage = lazy(() => import('./pages/workspace/editor'))
const CopywriterPage = lazy(() => import('./pages/workspace/copywriter'))
const PromotionsPage = lazy(() => import('./pages/promotions/index'))
const PromotionCreatePage = lazy(() => import('./pages/promotions/create'))
const PromotionDetailPage = lazy(() => import('./pages/promotions/detail'))
const PromotionReportPage = lazy(() => import('./pages/promotions/report'))
const SettingsPage = lazy(() => import('./pages/settings/index'))
const IndustriesPage = lazy(() => import('./pages/settings/industries'))
const UsersPage = lazy(() => import('./pages/settings/users'))

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="accounts/new" element={<AccountCreatePage />} />
            <Route path="accounts/:id" element={<AccountDetailPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dashboard/import" element={<ImportPage />} />
            <Route path="workspace/orders" element={<OrdersPage />} />
            <Route path="workspace/orders/new" element={<OrderCreatePage />} />
            <Route path="workspace/orders/:id" element={<OrderDetailPage />} />
            <Route path="workspace/editor" element={<EditorPage />} />
            <Route path="workspace/copywriter" element={<CopywriterPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="promotions/new" element={<PromotionCreatePage />} />
            <Route path="promotions/report" element={<PromotionReportPage />} />
            <Route path="promotions/:id" element={<PromotionDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/industries" element={<IndustriesPage />} />
            <Route path="settings/users" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
