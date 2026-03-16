import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSimulatorStore, FrameData, PaperData } from '../../store/useSimulatorStore';
import {
    Frame, FileText, Plus, Trash2, Upload, Edit2, X, Save,
    ChevronLeft, LayoutDashboard, Package, Tag, AlertCircle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'frames' | 'papers';

// ─── Small reusable field ─────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/5 transition-all";

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, label }: { value: string | null; onChange: (v: string) => void; label: string }) {
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onloadend = () => onChange(r.result as string);
        r.readAsDataURL(f);
    };
    return (
        <label className="relative block aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-zinc-400 transition-all cursor-pointer group">
            {value ? (
                <>
                    <img src={value} className="w-full h-full object-cover" alt={label} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white text-xs font-bold">Trocar imagem</p>
                    </div>
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Upload className="w-6 h-6 text-zinc-300" />
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-center px-2">{label}</p>
                </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
    );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ frames, papers, setTab }: { frames: FrameData[]; papers: PaperData[]; setTab: (t: Tab) => void }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button onClick={() => setTab('frames')} className="group bg-white rounded-3xl border border-zinc-100 p-8 text-left hover:border-zinc-900 hover:shadow-xl hover:shadow-zinc-900/5 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Frame className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-black text-zinc-900 mb-1">{frames.length}</div>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Molduras Cadastradas</div>
                    <div className="mt-4 text-[11px] text-zinc-400 font-medium">Clique para gerenciar →</div>
                </button>

                <button onClick={() => setTab('papers')} className="group bg-white rounded-3xl border border-zinc-100 p-8 text-left hover:border-zinc-900 hover:shadow-xl hover:shadow-zinc-900/5 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-black text-zinc-900 mb-1">{papers.length}</div>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Papéis Cadastrados</div>
                    <div className="mt-4 text-[11px] text-zinc-400 font-medium">Clique para gerenciar →</div>
                </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-bold text-amber-800">Os dados são salvos localmente</p>
                    <p className="text-xs text-amber-700/70 mt-0.5 leading-relaxed">
                        Todas as alterações são salvas no <code className="bg-amber-100 px-1 rounded">localStorage</code> do navegador atual. Para persistência em produção, conecte um banco de dados.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Frame Form ───────────────────────────────────────────────────────────────
function FrameForm({ editing, onSave, onCancel }: {
    editing: FrameData | null;
    onSave: (d: FrameData) => void;
    onCancel: () => void;
}) {
    const [f, setF] = useState<Partial<FrameData>>(editing ?? {
        name: '', id: '', category: 'Preta', frameWidth: 5.7, costPrice: 0, salePrice: 0, textureUrl: '', previewUrl: ''
    });
    const [texture, setTexture] = useState<string | null>(editing?.textureUrl ?? null);
    const [preview, setPreview] = useState<string | null>(editing?.previewUrl ?? null);

    const handleSave = () => {
        if (!f.name || !f.id) return alert('Preencha o nome e o código.');
        if (!texture) return alert('Adicione a imagem de textura.');
        onSave({ ...f, textureUrl: texture, previewUrl: preview ?? undefined } as FrameData);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Nome da Moldura">
                    <input className={inputCls} value={f.name ?? ''} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ex: Clássica Ouro" />
                </Field>
                <Field label="Código / SKU">
                    <input className={inputCls} value={f.id ?? ''} onChange={e => setF({ ...f, id: e.target.value })} placeholder="Ex: P149" disabled={!!editing} />
                </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Categoria">
                    <select className={inputCls} value={f.category} onChange={e => setF({ ...f, category: e.target.value as any })}>
                        {['Preta', 'Branca', 'Dourada', 'Prata', 'Madeira'].map(c => <option key={c}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Largura (cm)">
                    <input className={inputCls} type="number" step="0.1" value={f.frameWidth ?? ''} onChange={e => setF({ ...f, frameWidth: +e.target.value })} />
                </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Preço Custo (R$)">
                    <input className={inputCls} type="number" step="0.01" value={f.costPrice ?? ''} onChange={e => setF({ ...f, costPrice: +e.target.value })} />
                </Field>
                <Field label="Preço Venda (R$)">
                    <input className={inputCls} type="number" step="0.01" value={f.salePrice ?? ''} onChange={e => setF({ ...f, salePrice: +e.target.value })} />
                </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Textura (Simulador)">
                    <ImageUpload value={texture} onChange={setTexture} label="Envie a textura" />
                </Field>
                <Field label="Galeria (Menu)">
                    <ImageUpload value={preview} onChange={setPreview} label="Foto final" />
                </Field>
            </div>
            <div className="flex gap-3 pt-2">
                {editing && <button onClick={onCancel} className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-all"><X className="w-4 h-4" />Cancelar</button>}
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
                    <Save className="w-4 h-4" />{editing ? 'Atualizar' : 'Salvar Moldura'}
                </button>
            </div>
        </div>
    );
}

// ─── Paper Form ───────────────────────────────────────────────────────────────
function PaperForm({ editing, onSave, onCancel }: {
    editing: PaperData | null;
    onSave: (d: PaperData) => void;
    onCancel: () => void;
}) {
    const [p, setP] = useState<Partial<PaperData>>(editing ?? {
        name: '', description: '', category: '', costPrice: 0, salePrice: 0, imageUrl: ''
    });
    const [image, setImage] = useState<string | null>(editing?.imageUrl ?? null);

    const handleSave = () => {
        if (!p.name || !p.category) return alert('Preencha o nome e a categoria.');
        onSave({
            ...p,
            id: editing?.id ?? Date.now().toString(),
            imageUrl: image ?? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop'
        } as PaperData);
    };

    return (
        <div className="space-y-4">
            <Field label="Nome do Papel">
                <input className={inputCls} value={p.name ?? ''} onChange={e => setP({ ...p, name: e.target.value })} placeholder="Ex: Hahnemühle Photo Rag 310g" />
            </Field>
            <Field label="Categoria">
                <input className={inputCls} value={p.category ?? ''} onChange={e => setP({ ...p, category: e.target.value })} placeholder="Ex: Fine Art, Fotográfico, Canvas" list="paper-categories" />
                <datalist id="paper-categories">
                    <option value="Fotográfico" />
                    <option value="Fine Art" />
                    <option value="Canvas" />
                </datalist>
            </Field>
            <Field label="Descrição">
                <textarea className={inputCls + " resize-none"} rows={3} value={p.description ?? ''} onChange={e => setP({ ...p, description: e.target.value })} placeholder="Características técnicas, textura, uso ideal..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Custo/m² (R$)">
                    <input className={inputCls} type="number" step="0.01" value={p.costPrice ?? ''} onChange={e => setP({ ...p, costPrice: +e.target.value })} />
                </Field>
                <Field label="Venda/m² (R$)">
                    <input className={inputCls} type="number" step="0.01" value={p.salePrice ?? ''} onChange={e => setP({ ...p, salePrice: +e.target.value })} />
                </Field>
            </div>
            <Field label="Foto do Material">
                <ImageUpload value={image} onChange={setImage} label="Clique para enviar foto" />
            </Field>
            <div className="flex gap-3 pt-2">
                {editing && <button onClick={onCancel} className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-all"><X className="w-4 h-4" />Cancelar</button>}
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10">
                    <Save className="w-4 h-4" />{editing ? 'Atualizar' : 'Salvar Papel'}
                </button>
            </div>
        </div>
    );
}

// ─── Frames Tab ───────────────────────────────────────────────────────────────
function FramesTab() {
    const { availableFrames, addFrame, updateFrame, removeFrame } = useSimulatorStore();
    const [editing, setEditing] = useState<FrameData | null>(null);
    const [showForm, setShowForm] = useState(false);

    const handleSave = (data: FrameData) => {
        if (editing) { updateFrame(editing.id, data); } else { addFrame(data); }
        setEditing(null); setShowForm(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-300">
            {/* List */}
            <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-black text-zinc-900 uppercase tracking-widest">{availableFrames.length} Molduras</h2>
                    <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all">
                        <Plus className="w-3.5 h-3.5" />Nova moldura
                    </button>
                </div>
                {availableFrames.map(frame => (
                    <div key={frame.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4 group hover:border-zinc-300 hover:shadow-md transition-all">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                            <img src={frame.textureUrl} className="w-full h-full object-cover" alt={frame.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">{frame.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-black bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-500 uppercase tracking-widest">{frame.category}</span>
                                <span className="text-[9px] font-mono text-zinc-400">{frame.id}</span>
                                <span className="text-[9px] text-zinc-400">{frame.frameWidth}cm</span>
                            </div>
                        </div>
                        <div className="text-right mr-2">
                            <p className="text-xs font-black text-zinc-900">R$ {frame.salePrice.toFixed(2)}</p>
                            <p className="text-[9px] text-zinc-400">custo R$ {frame.costPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditing(frame); setShowForm(true); }} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all" title="Editar"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => confirm(`Remover "${frame.name}"?`) && removeFrame(frame.id)} className="p-2 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all" title="Remover"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
                {showForm ? (
                    <div className="bg-white rounded-3xl border border-zinc-100 p-6 sticky top-24">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-5">{editing ? 'Editar Moldura' : 'Nova Moldura'}</h3>
                        <FrameForm editing={editing} onSave={handleSave} onCancel={() => { setEditing(null); setShowForm(false); }} />
                    </div>
                ) : (
                    <button onClick={() => setShowForm(true)} className="w-full h-40 rounded-3xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-3 hover:border-zinc-900 hover:bg-zinc-50 transition-all group">
                        <Plus className="w-8 h-8 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-300 group-hover:text-zinc-900 transition-colors">Adicionar Moldura</p>
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Papers Tab ───────────────────────────────────────────────────────────────
function PapersTab() {
    const { availablePapers, addPaper, updatePaper, removePaper } = useSimulatorStore();
    const [editing, setEditing] = useState<PaperData | null>(null);
    const [showForm, setShowForm] = useState(false);
    const categories = Array.from(new Set(availablePapers.map(p => p.category ?? 'Outros')));

    const handleSave = (data: PaperData) => {
        if (editing) { updatePaper(editing.id, data); } else { addPaper(data); }
        setEditing(null); setShowForm(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-300">
            {/* List */}
            <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-black text-zinc-900 uppercase tracking-widest">{availablePapers.length} Papéis</h2>
                    <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all">
                        <Plus className="w-3.5 h-3.5" />Novo papel
                    </button>
                </div>
                {categories.map(cat => (
                    <div key={cat}>
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{cat}</span>
                        </div>
                        <div className="space-y-2">
                            {availablePapers.filter(p => (p.category ?? 'Outros') === cat).map(paper => (
                                <div key={paper.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4 group hover:border-zinc-300 hover:shadow-md transition-all">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                                        <img src={paper.imageUrl} className="w-full h-full object-cover" alt={paper.name} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-zinc-900 truncate">{paper.name}</p>
                                        <p className="text-[10px] text-zinc-400 truncate mt-0.5 italic">{paper.description}</p>
                                    </div>
                                    <div className="text-right mr-2">
                                        <p className="text-xs font-black text-zinc-900">R$ {paper.salePrice.toFixed(2)}/m²</p>
                                        <p className="text-[9px] text-zinc-400">custo R$ {paper.costPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditing(paper); setShowForm(true); }} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all" title="Editar"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => confirm(`Remover "${paper.name}"?`) && removePaper(paper.id)} className="p-2 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all" title="Remover"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
                {showForm ? (
                    <div className="bg-white rounded-3xl border border-zinc-100 p-6 sticky top-24">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-5">{editing ? 'Editar Papel' : 'Novo Papel'}</h3>
                        <PaperForm editing={editing} onSave={handleSave} onCancel={() => { setEditing(null); setShowForm(false); }} />
                    </div>
                ) : (
                    <button onClick={() => setShowForm(true)} className="w-full h-40 rounded-3xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-3 hover:border-zinc-900 hover:bg-zinc-50 transition-all group">
                        <Plus className="w-8 h-8 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-300 group-hover:text-zinc-900 transition-colors">Adicionar Papel</p>
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>('overview');
    const { availableFrames, availablePapers } = useSimulatorStore();

    const navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'frames', label: 'Molduras', icon: <Package className="w-4 h-4" />, count: availableFrames.length },
        { id: 'papers', label: 'Papéis', icon: <FileText className="w-4 h-4" />, count: availablePapers.length },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
            {/* Top bar */}
            <header className="bg-white border-b border-zinc-100 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/simulador" className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <img src="/logo_fuse.png" alt="Logo" className="w-7 h-7 object-contain" />
                            <div>
                                <h1 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none">Painel Admin</h1>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Fuse Galeria</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav tabs */}
                    <nav className="flex items-center gap-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === item.id
                                        ? 'bg-zinc-900 text-white'
                                        : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                                {item.count !== undefined && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tab === item.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
                {tab === 'overview' && <OverviewTab frames={availableFrames} papers={availablePapers} setTab={setTab} />}
                {tab === 'frames' && <FramesTab />}
                {tab === 'papers' && <PapersTab />}
            </main>
        </div>
    );
}
