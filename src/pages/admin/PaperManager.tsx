import { useState } from 'react';
import { useSimulatorStore, PaperData } from '../../store/useSimulatorStore';
import { Plus, Trash2, Upload, FileText, DollarSign, ChevronLeft, Edit2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PaperManager() {
    const { availablePapers, addPaper, updatePaper, removePaper } = useSimulatorStore();
    const [image, setImage] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState({ name: '', description: '', category: 'Fotográfico', costPrice: '', salePrice: '' });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const paperData: PaperData = {
            id: editingId || Date.now().toString(),
            name: formValues.name,
            description: formValues.description,
            category: formValues.category,
            costPrice: Number(formValues.costPrice),
            salePrice: Number(formValues.salePrice),
            imageUrl: image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop'
        };

        if (editingId) {
            updatePaper(editingId, paperData);
            alert('Papel atualizado com sucesso!');
        } else {
            addPaper(paperData);
            alert('Papel cadastrado com sucesso!');
        }

        handleCancel();
    };

    const handleEdit = (paper: PaperData) => {
        setEditingId(paper.id);
        setFormValues({
            name: paper.name,
            description: paper.description,
            category: paper.category,
            costPrice: paper.costPrice.toString(),
            salePrice: paper.salePrice.toString()
        });
        setImage(paper.imageUrl);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormValues({ name: '', description: '', category: 'Fotográfico', costPrice: '', salePrice: '' });
        setImage(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900">Gestão de Papéis</h1>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Fuse Galeria • Administração</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Form Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-zinc-900 rounded-xl text-white">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-900">Novo Papel</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Nome do Papel</label>
                                    <input
                                        name="name"
                                        value={formValues.name}
                                        onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                                        placeholder="Ex: Hahnemühle Photo Rag 310g"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Descrição</label>
                                    <textarea
                                        name="description"
                                        value={formValues.description}
                                        onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                        required
                                        rows={3}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Categoria</label>
                                    <select
                                        name="category"
                                        value={formValues.category}
                                        onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                                    >
                                        <option value="Fotográfico">Fotográfico</option>
                                        <option value="Fine Art">Fine Art</option>
                                        <option value="Canvas">Canvas</option>
                                        <option value="Especial">Especial</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="costPrice" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-1">
                                            Custo/m² <DollarSign className="w-3 h-3" />
                                        </label>
                                        <input
                                            id="costPrice"
                                            name="costPrice"
                                            type="number"
                                            step="0.01"
                                            value={formValues.costPrice}
                                            onChange={(e) => setFormValues({ ...formValues, costPrice: e.target.value })}
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="salePrice" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-1">
                                            Venda/m² <DollarSign className="w-3 h-3 text-zinc-900" />
                                        </label>
                                        <input
                                            id="salePrice"
                                            name="salePrice"
                                            type="number"
                                            step="0.01"
                                            value={formValues.salePrice}
                                            onChange={(e) => setFormValues({ ...formValues, salePrice: e.target.value })}
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Foto do Material</label>
                                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-zinc-200 border-dashed rounded-2xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all group overflow-hidden">
                                        {image ? (
                                            <img src={image} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-6 h-6 mb-3 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                                                <p className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">Clique para enviar foto</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className={`${editingId ? 'flex-[2]' : 'w-full'} bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        {editingId ? 'Atualizar Papel' : 'Salvar Papel'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white rounded-xl text-zinc-900 border border-zinc-200">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900">Papéis Cadastrados ({availablePapers.length})</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availablePapers.map((paper) => (
                                <div key={paper.id} className="bg-white rounded-3xl border border-zinc-200 p-6 flex flex-col group hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 shadow-inner">
                                            <img src={paper.imageUrl} className="w-full h-full object-cover" alt={paper.name} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-zinc-900 leading-tight mb-1">{paper.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{paper.category}</span>
                                                <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Custo: R$ {paper.costPrice}</span>
                                                <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                                                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Venda: R$ {paper.salePrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed mb-6 flex-1 line-clamp-2 italic">
                                        "{paper.description}"
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">ID: {paper.id}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(paper)}
                                                className="p-2 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                                                title="Editar papel"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Deseja remover o papel ${paper.name}?`)) {
                                                        removePaper(paper.id);
                                                    }
                                                }}
                                                className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remover papel"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
