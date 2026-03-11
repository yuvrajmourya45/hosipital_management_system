// Unified Design System - Use across all pages
export const COLORS = {
  primary: 'from-blue-600 to-indigo-600',
  primaryBg: 'bg-blue-600',
  success: 'from-emerald-500 to-emerald-600',
  warning: 'from-orange-500 to-orange-600',
  danger: 'from-red-500 to-red-600',
  info: 'from-violet-500 to-violet-600',
};

export const COMPONENTS = {
  card: 'bg-white rounded-2xl shadow-lg border border-slate-100',
  btnPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all',
  input: 'w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500',
  sidebarActive: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl',
  avatar: 'bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white font-black',
};

export const getStatusBadge = (status) => {
  const badges = {
    pending: 'bg-blue-100 text-blue-600',
    confirmed: 'bg-yellow-100 text-yellow-600',
    completed: 'bg-emerald-100 text-emerald-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  return `${badges[status] || badges.pending} px-3 py-1 rounded-full text-xs font-bold`;
};
