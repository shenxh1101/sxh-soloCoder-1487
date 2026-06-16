import { useState } from 'react';
import { Search, Plus, UserPlus, Phone, Mail, MapPin } from 'lucide-react';
import type { Customer } from '@/types';
import { useAppStore } from '@/store';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
}

export default function CustomerSelector({ selectedCustomer, onSelect }: CustomerSelectorProps) {
  const { customers, addCustomer } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

  const filteredCustomers = customers.filter((c) =>
    c.name.includes(searchTerm) || c.phone.includes(searchTerm)
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    const customer = addCustomer(newCustomer);
    onSelect(customer);
    setShowAddModal(false);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
          客户信息
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          新建客户
        </button>
      </div>

      {selectedCustomer ? (
        <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-lg">{selectedCustomer.name}</div>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedCustomer.phone}
                  </span>
                  {selectedCustomer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedCustomer.email}
                    </span>
                  )}
                </div>
                {selectedCustomer.remark && (
                  <div className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-2 py-1 rounded-md inline-block">
                    备注：{selectedCustomer.remark}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelect(null as unknown as Customer)}
              className="text-sm text-slate-400 hover:text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              更换
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="输入客户姓名或电话搜索..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>

          {showDropdown && (searchTerm || filteredCustomers.length > 0) && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-lg max-h-64 overflow-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onMouseDown={() => onSelect(customer)}
                    className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{customer.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                  未找到匹配的客户
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">新建客户</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">客户名称 *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  placeholder="请输入客户名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">联系电话 *</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  placeholder="请输入联系电话"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">邮箱</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  placeholder="选填"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">地址</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  placeholder="选填"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 text-sm text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name || !newCustomer.phone}
                className="px-5 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
