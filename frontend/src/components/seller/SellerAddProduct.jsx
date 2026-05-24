import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const SellerAddProduct = ({ setActiveTab }) => {
    const location = useLocation();
    const editProduct = location.state?.editProduct;
    const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [selectedParentId, setSelectedParentId] = useState('');
    const [filteredChildCategories, setFilteredChildCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        sku: '',
        mrp_price: '',
        selling_price: '',
        description: '',
        media: []
    });

    const [variants, setVariants] = useState([
        { attributes: { color: '', size: '' }, sku: '', stock_quantity: 0, additional_price: 0 }
    ]);
    const [skuRandomSuffix] = useState(() => Math.floor(100 + Math.random() * 900));

    const fileInputRef = React.useRef(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const uploadFiles = async (files) => {
        if (files.length === 0) return;
        if (formData.media.length + files.length > 10) {
            return toast.error('You can upload a maximum of 10 images');
        }

        setUploading(true);
        const uploadToast = toast.loading('Uploading images...');
        try {
            const uploadData = new FormData();
            files.forEach(file => {
                uploadData.append('images', file);
            });

            const res = await axios.post('http://localhost:5000/api/seller/products/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (res.data.success) {
                toast.success('Images uploaded successfully', { id: uploadToast });
                setFormData(prev => ({
                    ...prev,
                    media: [...prev.media, ...res.data.data]
                }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload images', { id: uploadToast });
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            await uploadFiles(files);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        await uploadFiles(files);
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleSetThumbnail = (idx) => {
        if (idx === 0) return;
        const newMedia = [...formData.media];
        const [targetImage] = newMedia.splice(idx, 1);
        newMedia.unshift(targetImage);
        setFormData(prev => ({ ...prev, media: newMedia }));
        toast.success('Set as thumbnail successfully');
    };

    const handleFormat = (command, val = null) => {
        document.execCommand(command, false, val);
    };


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/public/categories');
                if (res.data.success) {
                    const allCats = res.data.data;
                    setCategories(allCats);
                    
                    // Filter parent categories (parentId is null/undefined)
                    const parents = allCats.filter(c => !c.parentId);
                    setParentCategories(parents);
                }
            } catch (error) {
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    // Sync categories selection when categories list or editProduct updates
    useEffect(() => {
        if (categories.length > 0) {
            if (editProduct) {
                const catId = editProduct.category_id?._id || editProduct.category_id || '';
                const matchedCat = categories.find(c => c.id === catId || c._id === catId);
                if (matchedCat) {
                    if (matchedCat.parentId) {
                        setSelectedParentId(matchedCat.parentId);
                        setFormData(prev => ({ ...prev, category_id: matchedCat.id }));
                    } else {
                        setSelectedParentId(matchedCat.id);
                        setFormData(prev => ({ ...prev, category_id: matchedCat.id }));
                    }
                }
            } else {
                // If creating, select the first parent category by default
                const parents = categories.filter(c => !c.parentId);
                if (parents.length > 0 && !selectedParentId) {
                    const firstParentId = parents[0].id;
                    setSelectedParentId(firstParentId);
                    const children = categories.filter(c => c.parentId === firstParentId);
                    if (children.length > 0) {
                        setFormData(prev => ({ ...prev, category_id: children[0].id }));
                    } else {
                        setFormData(prev => ({ ...prev, category_id: firstParentId }));
                    }
                }
            }
        }
    }, [categories, editProduct]);

    // Update filtered child categories list when selectedParentId changes
    useEffect(() => {
        if (selectedParentId && categories.length > 0) {
            const children = categories.filter(c => c.parentId === selectedParentId);
            setFilteredChildCategories(children);
        } else {
            setFilteredChildCategories([]);
        }
    }, [selectedParentId, categories]);

    const handleParentCategoryChange = (e) => {
        const parentId = e.target.value;
        setSelectedParentId(parentId);
        
        const children = categories.filter(c => c.parentId === parentId);
        if (children.length > 0) {
            setFormData(prev => ({ ...prev, category_id: children[0].id }));
        } else {
            setFormData(prev => ({ ...prev, category_id: parentId }));
        }
    };

    const handleChildCategoryChange = (e) => {
        setFormData(prev => ({ ...prev, category_id: e.target.value }));
    };

    useEffect(() => {
        if (!editProduct && formData.name && formData.category_id && categories.length > 0) {
            const cat = categories.find(c => c.id === formData.category_id || c._id === formData.category_id);
            const catCode = cat ? cat.name.split(/\s+/).map(w => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '') : 'PRD';
            const nameCode = formData.name.split(/\s+/).map(w => w[0]).join('').toUpperCase().replace(/[^A-Z0-9]/g, '');
            const cleanNameCode = nameCode.substring(0, 4);
            const generated = `SKU-${catCode || 'GEN'}-${cleanNameCode || 'ITEM'}-${skuRandomSuffix}`;
            setFormData(prev => ({ ...prev, sku: generated }));
        }
    }, [formData.name, formData.category_id, categories, skuRandomSuffix, editProduct]);

    useEffect(() => {
        if (editProduct) {
            setFormData({
                name: editProduct.name || '',
                category_id: editProduct.category_id?._id || editProduct.category_id || '',
                sku: editProduct.sku || '',
                mrp_price: editProduct.mrp_price || '',
                selling_price: editProduct.selling_price || '',
                description: editProduct.description || '',
                media: editProduct.media?.map(m => m.media_url) || []
            });
            if (editProduct.variants && editProduct.variants.length > 0) {
                setVariants(editProduct.variants.map(v => ({
                    attributes: v.attributes || { color: '', size: '' },
                    sku: v.sku || '',
                    stock_quantity: v.stock_quantity || 0,
                    additional_price: v.additional_price || 0
                })));
            }
        }
    }, [editProduct]);

    const handleAddVariant = () => {
        setVariants([...variants, { attributes: { color: '', size: '' }, sku: '', stock_quantity: 0, additional_price: 0 }]);
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        if (field === 'color' || field === 'size') {
            newVariants[index].attributes[field] = value;
        } else {
            newVariants[index][field] = value;
        }
        setVariants(newVariants);
    };



    const handleSubmit = async () => {
        if (!formData.name || !formData.selling_price) {
            return toast.error('Name and Selling Price are required');
        }
        try {
            const payload = {
                ...formData,
                mrp_price: Number(formData.mrp_price) || Number(formData.selling_price),
                selling_price: Number(formData.selling_price),
                variants: variants.map(v => ({
                    ...v,
                    stock_quantity: Number(v.stock_quantity),
                    additional_price: Number(v.additional_price)
                }))
            };

            const res = editProduct
                ? await axios.put(`http://localhost:5000/api/seller/products/${editProduct._id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`
                    }
                  })
                : await axios.post('http://localhost:5000/api/seller/products', payload, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`
                    }
                  });

            if (res.data.success) {
                toast.success(editProduct ? 'Product updated successfully' : 'Product created successfully');
                setActiveTab('products');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || (editProduct ? 'Failed to update product' : 'Failed to create product'));
        }
    };

    useEffect(() => {
        const handleSaveEvent = () => {
            handleSubmit();
        };
        window.addEventListener('submit-add-product', handleSaveEvent);
        return () => window.removeEventListener('submit-add-product', handleSaveEvent);
    }, [formData, variants]);

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8FAFC]">
            {/* Form Content */}
            <div className="p-10 max-w-[1400px] mx-auto w-full grid grid-cols-12 gap-8">
                {/* Left Column (8/12) */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Section: Basic Information */}
                    <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/30 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 700" }}>info</span>
                            <h3 className="text-base font-black uppercase tracking-widest">Basic Information</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Product Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Premium Academic Leather Satchel"
                                    className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-secondary/40 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Parent Category</label>
                                    <select
                                        className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                                        value={selectedParentId}
                                        onChange={handleParentCategoryChange}
                                    >
                                        {parentCategories.map(cat => (
                                            <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Child Category</label>
                                    <select
                                        className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                                        value={formData.category_id}
                                        onChange={handleChildCategoryChange}
                                        disabled={!selectedParentId}
                                    >
                                        {filteredChildCategories.length === 0 ? (
                                            <option value="">No subcategories</option>
                                        ) : (
                                            filteredChildCategories.map(cat => (
                                                <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Product SKU</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SKU-SHIRT-001"
                                        className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Selling Price (VND)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 150000"
                                        className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={formData.selling_price}
                                        onChange={e => setFormData({ ...formData, selling_price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Original Price (VND)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 200000"
                                        className="w-full px-5 py-3.5 bg-surface-container-low border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={formData.mrp_price}
                                        onChange={e => setFormData({ ...formData, mrp_price: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* Section: Variations */}
                    <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/30 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 700" }}>layers</span>
                                <h3 className="text-base font-black uppercase tracking-widest">Variations Table</h3>
                            </div>
                            <button onClick={handleAddVariant} className="text-primary text-xs font-bold hover:underline cursor-pointer">
                                + Add Variant
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-outline-variant/30 rounded-2xl bg-surface-container-low/30">
                            <table className="w-full text-left border-collapse min-w-max">
                                <thead>
                                    <tr className="bg-surface-container-low">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/70">Color</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/70">Size</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/70">SKU ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/70">Stock</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary/70">Add. Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                    {variants.map((variant, index) => (
                                        <tr key={index} className="hover:bg-white transition-colors">
                                            <td className="px-6 py-4">
                                                <input type="text" placeholder="e.g. Blue" value={variant.attributes.color || ''} onChange={e => handleVariantChange(index, 'color', e.target.value)} className="w-24 bg-transparent border-none p-0 text-xs font-bold text-on-surface focus:ring-0 outline-none" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="text" placeholder="e.g. M" value={variant.attributes.size || ''} onChange={e => handleVariantChange(index, 'size', e.target.value)} className="w-16 bg-transparent border-none p-0 text-xs font-bold text-on-surface focus:ring-0 outline-none" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="text" placeholder="SKU-001" value={variant.sku || ''} onChange={e => handleVariantChange(index, 'sku', e.target.value)} className="w-24 bg-transparent border-none p-0 text-xs font-bold text-secondary focus:ring-0 outline-none" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="number" placeholder="10" value={variant.stock_quantity} onChange={e => handleVariantChange(index, 'stock_quantity', e.target.value)} className="w-16 bg-transparent border-none p-0 text-xs font-bold text-on-surface focus:ring-0 outline-none" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="number" placeholder="0" value={variant.additional_price} onChange={e => handleVariantChange(index, 'additional_price', e.target.value)} className="w-20 bg-transparent border-none p-0 text-xs font-black text-primary focus:ring-0 outline-none" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section: Media Gallery */}
                    <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/30 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 700" }}>image</span>
                                <h3 className="text-base font-black uppercase tracking-widest">Media Gallery</h3>
                            </div>
                            <span className="text-[10px] font-bold text-secondary/60">MAX 10 IMAGES</span>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div
                                onClick={triggerFileSelect}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                className={`col-span-2 md:col-span-4 border-4 border-dashed rounded-[2.5rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                                    dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-outline-variant/30 bg-surface-container-low/20 hover:bg-surface-container-low/50'
                                }`}
                            >
                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {uploading ? (
                                        <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                                    )}
                                </div>
                                <p className="text-sm font-black mb-1">
                                    {uploading ? 'Uploading images...' : 'Drag & drop product images'}
                                </p>
                                <p className="text-[11px] font-bold text-secondary/60 uppercase tracking-wider mb-6">Support JPG, PNG, WEBP. Max 10MB</p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        triggerFileSelect();
                                    }}
                                    disabled={uploading}
                                    className="px-8 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Browse Files
                                </button>
                            </div>

                            {formData.media.map((url, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-outline-variant/30 relative group shadow-sm">
                                    <img src={url} className="w-full h-full object-cover" alt={`preview-${idx}`} />
                                    
                                    {/* Thumbnail and Detail Badges */}
                                    {idx === 0 ? (
                                        <span className="absolute top-3 left-3 bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md z-10 select-none">
                                            Thumbnail
                                        </span>
                                    ) : (
                                        <span className="absolute top-3 left-3 bg-secondary/80 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm z-10 select-none">
                                            Detail Image
                                        </span>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white rounded-lg text-primary hover:scale-110 transition-transform shadow-lg cursor-pointer"
                                            title="View Full Image"
                                        >
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                        </a>
                                        {idx > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetThumbnail(idx)}
                                                className="p-2 bg-white rounded-lg text-primary hover:scale-110 transition-transform shadow-lg cursor-pointer"
                                                title="Set as Thumbnail (Ảnh đại diện)"
                                            >
                                                <span className="material-symbols-outlined text-sm">star</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, media: formData.media.filter((_, i) => i !== idx) })}
                                            className="p-2 bg-error rounded-lg text-white hover:scale-110 transition-transform shadow-lg cursor-pointer"
                                            title="Delete Image"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formData.media.length < 10 && (
                                <div
                                    onClick={triggerFileSelect}
                                    className="aspect-square rounded-2xl bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-secondary/40 text-4xl">add</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section: Description */}
                    <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/30 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 700" }}>description</span>
                            <h3 className="text-base font-black uppercase tracking-widest">Product Description</h3>
                        </div>

                        <div className="border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-surface-container-low p-3 border-b border-outline-variant/30 flex gap-1 overflow-x-auto">
                                <button type="button" onClick={() => handleFormat('bold')} className="p-2 hover:bg-white rounded-lg transition-all text-secondary cursor-pointer"><span className="material-symbols-outlined text-lg">format_bold</span></button>
                                <button type="button" onClick={() => handleFormat('italic')} className="p-2 hover:bg-white rounded-lg transition-all text-secondary cursor-pointer"><span className="material-symbols-outlined text-lg">format_italic</span></button>
                                <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg transition-all text-secondary cursor-pointer"><span className="material-symbols-outlined text-lg">format_list_bulleted</span></button>
                                <div className="w-px h-6 bg-outline-variant/30 mx-2 self-center"></div>
                                <button type="button" onClick={() => { const url = prompt('Enter link URL:'); if (url) handleFormat('createLink', url); }} className="p-2 hover:bg-white rounded-lg transition-all text-secondary cursor-pointer"><span className="material-symbols-outlined text-lg">link</span></button>
                                <button type="button" onClick={() => { const url = prompt('Enter image URL:'); if (url) handleFormat('insertImage', url); }} className="p-2 hover:bg-white rounded-lg transition-all text-secondary cursor-pointer"><span className="material-symbols-outlined text-lg">image</span></button>
                            </div>
                            <div
                                className="w-full p-6 text-sm font-bold text-secondary border-none focus:ring-0 outline-none resize-none bg-white min-h-[300px] empty:before:content-['Tell_your_customers_about_the_academic_precision_and_premium_quality_of_this_item...'] empty:before:text-secondary/40 empty:before:pointer-events-none prose prose-sm max-w-none"
                                contentEditable
                                dangerouslySetInnerHTML={{ __html: formData.description }}
                                onBlur={(e) => setFormData({ ...formData, description: e.currentTarget.innerHTML })}
                            ></div>
                        </div>
                    </section>
                </div>

                {/* Right Column (4/12) */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Section: Approval History */}
                    <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-level-1 border border-outline-variant/30 space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'wght' 700" }}>history</span>
                            <h3 className="text-base font-black uppercase tracking-widest">Approval History</h3>
                        </div>

                        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
                            {/* Submitted Item */}
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 size-[24px] bg-white border-2 border-primary rounded-full flex items-center justify-center z-10 shadow-sm">
                                    <div className="size-2 bg-primary rounded-full"></div>
                                </div>
                                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Draft Created</span>
                                        <span className="text-[9px] font-bold text-secondary/60">JUST NOW</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-secondary leading-relaxed">Initial product listing creation.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Seller Tips */}
                    <section className="bg-primary rounded-3xl p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            <span className="material-symbols-outlined text-[120px]">lightbulb</span>
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'wght' 700" }}>auto_awesome</span>
                                <h3 className="text-base font-black uppercase tracking-widest">Seller Tips</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="material-symbols-outlined text-green-300 text-lg shrink-0">check_circle</span>
                                    <p className="text-xs font-bold text-white/90 leading-relaxed">Include keywords like 'durable' or 'premium' in your description to boost search relevance.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="material-symbols-outlined text-green-300 text-lg shrink-0">check_circle</span>
                                    <p className="text-xs font-bold text-white/90 leading-relaxed">List at least 3 variations to increase buyer conversion by up to 15%.</p>
                                </li>
                            </ul>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                                Learn More
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer Spacing */}
            <div className="h-24"></div>
        </div>
    );
};

export default SellerAddProduct;
