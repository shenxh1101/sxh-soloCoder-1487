import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard';
import OrderList from '@/pages/OrderList';
import OrderNew from '@/pages/OrderNew';
import OrderDetail from '@/pages/OrderDetail';
import ProductionList from '@/pages/ProductionList';
import ProductionDetail from '@/pages/ProductionDetail';
import CustomerList from '@/pages/CustomerList';
import CustomerDetail from '@/pages/CustomerDetail';
import { useAppStore } from '@/store';

function AppRoutes() {
  const loadData = useAppStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/new" element={<OrderNew />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/production" element={<ProductionList />} />
        <Route path="/production/:id" element={<ProductionDetail />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
