import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, Mail, FileText, UserPlus, Trash2, Edit3 } from 'lucide-react';
import { useAppStore } from '@/store';
import { customerStorage } from '@/utils/storage';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Customer } from '@/types';

export default function CustomerList() {
  const { customers, orders, addCustomer, updateCustomer } = useAppStore();
  const searchCustomers = (keyword: string) => customerStorage.search(keyword);
  const deleteCustomer = (id: string) => {
    customerStorage.delete(id);
    // 刷新store中的customers
    const store = useAppStore.getState();
    store.loadData();
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', remark: '' });

  const displayedCustomers = searchTerm ? searchCustomers(searchTerm) : customers;

  const customerStats = (customerId: string) => {
    const customerOrders = orders.filter((o) => o.customerId === customerId);
    const totalSpent = customerOrders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'draft')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const lastOrder = customerOrders[0];
    return {
      orderCount: customerOrders.length,
      totalSpent,
      lastOrderDate: lastOrder ? formatDate(lastOrder.createdAt) : '-'
    };
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setShowAddModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '', remark: '' });
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      remark: customer.remark || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (customer: Customer) => {
    if (confirm(`确定要删除客户"${customer.name}"吗？`)) {
      deleteCustomer(customer.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">客户管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {customers.length} 位客户</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: '', phone: '', email: '', address: '', remark: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          新建客户
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索客户名称、电话、邮箱..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">客户</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">联系方式</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">订单数</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">累计消费</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">最近下单</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedCustomers.length > 0 ? (
                displayedCustomers.map((customer) => {
                  const stats = customerStats(customer.id);
                  const customerOrders = orders.filter((o) => o.customerId === customer.id);
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <Link to={`/customers/${customer.id}`} className="flex items-center gap-3 group">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                              {customer.name}
                            </div>
                            {customer.remark && (
                              <div className="text-xs text-amber-600 mt-0.5">{customer.remark}</div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {stats.orderCount} 笔
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-emerald-600">{formatCurrency(stats.totalSpent)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-500">{stats.lastOrderDate}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                    暂无客户数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCustomer ? '编辑客户' : '新建客户'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCustomer(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">客户名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">联系电话 *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">邮箱</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">地址</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none h-20"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCustomer(null);
                }}
                className="px-5 py-2 text-sm text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.phone}
                className="px-5 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                {editingCustomer ? '保存修改' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
