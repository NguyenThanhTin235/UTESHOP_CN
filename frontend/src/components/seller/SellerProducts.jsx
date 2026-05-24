import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const SellerProducts = ({ setActiveTab }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Selling');
    const [loading, setLoading] = useState(false);

    // Sorting and Filtering states
    const [sortBy, setSortBy] = useState('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });

    const { user } = useSelector(state => state.auth);
    const { unreadCount } = useNotifications();

    const statusTabs = ['Selling', 'Pending', 'Violated', 'Out of Stock'];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/seller/products`, {
                params: {
                    page: meta.page,
                    limit: meta.limit,
                    search,
                    status: statusFilter,
                    sortBy
                },
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setProducts(res.data.data);
                setMeta(res.data.meta);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await axios.delete(`http://localhost:5000/api/seller/products/${deleteModal.productId}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                toast.success('Product deleted successfully');
                setDeleteModal({ isOpen: false, productId: null });
                fetchProducts();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [meta.page, meta.limit, search, statusFilter, sortBy]);

    const handleExport = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/seller/products/export`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to export products');
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8FAFC]">


            {/* Main Content */}
            <div className="p-10 max-w-[1400px] mx-auto w-full">
                <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant/30 overflow-hidden flex flex-col">
                    {/* Tabs */}
                    <div className="border-b border-outline-variant/30 flex px-6 overflow-x-auto custom-scrollbar">
                        {statusTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setStatusFilter(tab); setMeta({ ...meta, page: 1 }); }}
                                className={`px-6 py-5 text-sm whitespace-nowrap tracking-tight flex items-center gap-2 transition-colors ${statusFilter === tab ? 'font-black text-primary border-b-[3px] border-primary' : 'font-bold text-secondary hover:text-primary'}`}
                            >
                                {tab}
                                {tab === 'Violated' && <span className={`size-2 bg-error rounded-full ${statusFilter === tab ? 'animate-pulse' : ''}`}></span>}
                            </button>
                        ))}
                    </div>

                    {/* Search and Actions */}
                    <div className="p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-[450px] group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Search product name, SKU, or category..."
                                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-secondary/60 outline-none"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setMeta({ ...meta, page: 1 }); }}
                            />
                        </div>
                        <div className="flex gap-3">
                            {/* Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className={`flex items-center gap-2 px-5 py-3 border rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer ${sortBy !== 'newest'
                                        ? 'bg-primary/5 border-primary/30 text-primary'
                                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                    {sortBy === 'newest' && 'Filter'}
                                    {sortBy === 'oldest' && 'Oldest First'}
                                    {sortBy === 'priceAsc' && 'Price: Low to High'}
                                    {sortBy === 'priceDesc' && 'Price: High to Low'}
                                    <span className="material-symbols-outlined text-secondary text-sm ml-1">expand_more</span>
                                </button>
                                {showSortDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)}></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-level-1 z-50 p-2 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <button
                                                onClick={() => { setSortBy('newest'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'newest' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Newest First
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('oldest'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'oldest' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Oldest First
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('priceAsc'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'priceAsc' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Price: Low to High
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('priceDesc'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'priceDesc' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Price: High to Low
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70">Product</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 text-right">Price (VND)</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 text-center">Stock</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-secondary font-bold">Loading products...</td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-10 text-secondary font-bold">No products found.</td></tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product._id} className="hover:bg-surface-container-low/30 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container shadow-sm border border-outline-variant/30 group-hover:scale-105 transition-transform">
                                                        <img src={product.media && product.media.length > 0 ? product.media[0].media_url : "https://placehold.co/100x100?text=No+Image"} alt="Product" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 max-w-[250px]">
                                                        <span 
                                                            onClick={() => navigate('/seller/add-product', { state: { editProduct: product } })}
                                                            className="text-sm font-black text-on-surface line-clamp-2 group-hover:text-primary transition-colors cursor-pointer hover:underline"
                                                        >
                                                            {product.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{product.category_id?.name || 'Category'}</span>
                                                        <span className="text-[10px] font-mono font-bold text-secondary/60 bg-surface-container-low px-1.5 py-0.5 rounded w-fit mt-1">{product.sku || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-sm text-primary">{product.selling_price.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-center font-black text-sm text-on-surface">{product.totalStock || 0}</td>
                                            <td className="px-6 py-5 text-center">
                                                {product.currentStatus === 'Selling' && <span className="px-3 py-1.5 bg-[#e6f4ea] text-[#1e7e34] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#1e7e34]/10 shadow-sm inline-block">Selling</span>}
                                                {product.currentStatus === 'Pending' && <span className="px-3 py-1.5 bg-[#fef3c7] text-[#b45309] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#b45309]/10 shadow-sm inline-block">Pending</span>}
                                                {product.currentStatus === 'Violated' && <span className="px-3 py-1.5 bg-[#fdecea] text-[#c62828] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#c62828]/10 shadow-sm inline-block">Violated</span>}
                                                {product.currentStatus === 'Out of Stock' && <span className="px-3 py-1.5 bg-surface-container-high text-secondary rounded-lg text-[10px] font-black uppercase tracking-wider border border-outline-variant/30 shadow-sm inline-block">Out of Stock</span>}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => navigate('/seller/add-product', { state: { editProduct: product } })}
                                                        className="p-2.5 text-secondary hover:text-primary hover:bg-primary/5 transition-all rounded-xl cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteModal({ isOpen: true, productId: product._id })}
                                                        className="p-2.5 text-secondary hover:text-error hover:bg-error/5 transition-all rounded-xl cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 pr-40 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/20">
                        <div className="flex items-center gap-4">
                            <p className="text-[11px] font-black text-secondary uppercase tracking-widest">Showing <span className="text-primary font-black">{(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-on-surface font-black">{meta.total}</span> products</p>
                            <div className="h-4 w-[1px] bg-outline-variant/50"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">Rows per page:</span>
                                <select
                                    className="bg-transparent border-none text-[11px] font-black text-on-surface focus:ring-0 cursor-pointer outline-none"
                                    value={meta.limit}
                                    onChange={(e) => setMeta({ ...meta, limit: Number(e.target.value), page: 1 })}
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={meta.page <= 1}
                                onClick={() => setMeta({ ...meta, page: 1 })}
                                className="size-10 flex items-center justify-center border border-outline-variant rounded-xl text-secondary hover:bg-surface-container-low transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                title="First Page"
                            >
                                <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_left</span>
                            </button>
                            <button
                                disabled={meta.page <= 1}
                                onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                                className="size-10 flex items-center justify-center border border-outline-variant rounded-xl text-secondary hover:bg-surface-container-low transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Previous Page"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(meta.totalPages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMeta({ ...meta, page: idx + 1 })}
                                        className={`size-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${meta.page === idx + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-secondary hover:bg-surface-container-low'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={meta.page >= meta.totalPages}
                                onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                                className="size-10 flex items-center justify-center border border-outline-variant rounded-xl text-secondary hover:bg-surface-container-low transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Next Page"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                            <button
                                disabled={meta.page >= meta.totalPages}
                                onClick={() => setMeta({ ...meta, page: meta.totalPages })}
                                className="size-10 flex items-center justify-center border border-outline-variant rounded-xl text-secondary hover:bg-surface-container-low transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                title="Last Page"
                            >
                                <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Product Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full border border-outline-variant/30 text-center space-y-6 shadow-level-3">
                        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error">
                            <span className="material-symbols-outlined text-[36px]">delete</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-on-surface">Delete Product</h3>
                            <p className="text-secondary text-sm font-medium leading-relaxed">
                                Are you sure you want to delete this product? This action cannot be undone and will permanently remove all variants and media.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, productId: null })}
                                className="flex-1 py-3 rounded-xl border border-outline-variant text-secondary font-bold hover:bg-surface-container-low transition-all text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 py-3 rounded-xl bg-error text-white font-bold hover:opacity-90 transition-all text-sm shadow-md shadow-error/20 cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerProducts;
