import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  Lock,
  Unlock,
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/users?search=${encodeURIComponent(search)}&role=${roleFilter}`
      );
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'admin') {
      toast.error('Cannot deactivate admin accounts');
      return;
    }

    try {
      const res = await api.patch(`/admin/users/${user._id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, isActive: res.data.data.isActive } : u
          )
        );
      }
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role="admin" />

        <div className="flex-1 space-y-6 min-w-0">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Tourist Account Management
            </h1>
            <p className="text-xs text-slate-400">
              Inspect registered accounts, email verification states, and manage account access
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tourist name, email, mobile, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-10 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs text-slate-300 font-semibold">Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="glass-input text-xs"
              >
                <option value="All" className="bg-navy-950 text-white">All Roles</option>
                <option value="tourist" className="bg-navy-950 text-white">Tourists Only</option>
                <option value="admin" className="bg-navy-950 text-white">Administrators</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card overflow-hidden p-0">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No users found matching your query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-navy-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Demographics</th>
                      <th className="p-4">City & Address</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((item) => (
                      <tr key={item._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {item.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{item.name}</p>
                              <span className="text-[11px] text-slate-400 block">{item.email}</span>
                              <span className="text-[10px] text-amber-400 font-mono">{item.mobile}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span>
                            {item.age || 'N/A'} Yrs &bull; {item.gender}
                          </span>
                        </td>

                        <td className="p-4">
                          <p className="font-medium text-white">{item.city || 'Unknown'}</p>
                          <span className="text-[10px] text-slate-400 truncate block max-w-[180px]">
                            {item.address}
                          </span>
                        </td>

                        <td className="p-4">
                          {item.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Pending OTP</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              item.isActive
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          {item.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleStatus(item)}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                item.isActive
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}
                              title={item.isActive ? 'Block user account' : 'Reactivate user'}
                            >
                              {item.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
