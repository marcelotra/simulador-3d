import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSimulatorStore, FrameData } from '../../store/useSimulatorStore';
import { Upload, ChevronLeft, Save, Edit2, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const frameSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    sku: z.string().min(2, 'SKU/Código é obrigatório'),
    category: z.enum(['Preta', 'Branca', 'Dourada', 'Prata', 'Madeira']),
    frameWidth: z.number().min(0.1, 'Largura deve ser maior que 0'),
    costPrice: z.number().min(0, 'Custo não pode ser negativo'),
    salePrice: z.number().min(0, 'Valor de venda não pode ser negativo'),
});

type FrameFormValues = z.infer<typeof frameSchema>;

export default function FrameManager() {
    const { availableFrames, addFrame, updateFrame, removeFrame } = useSimulatorStore();
    const [textureImage, setTextureImage] = useState<string | null>(null);
    const [galleryImage, setGalleryImage] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FrameFormValues>({
        resolver: zodResolver(frameSchema),
        defaultValues: {
            name: '',
            sku: '',
            category: 'Preta',
            frameWidth: 5.7,
            costPrice: 0,
            salePrice: 0
        }
    });

    const handleTextureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setTextureImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setGalleryImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const startEditing = (frame: FrameData) => {
        setEditingId(frame.id);
        reset({
            name: frame.name,
            sku: frame.id,
            category: frame.category,
            frameWidth: frame.frameWidth,
            costPrice: frame.costPrice,
            salePrice: frame.salePrice
        });
        setTextureImage(frame.textureUrl);
        setGalleryImage(frame.previewUrl || null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        reset({
            name: '',
            sku: '',
            category: 'Preta',
            frameWidth: 5.7,
            costPrice: 0,
            salePrice: 0
        });
        setTextureImage(null);
        setGalleryImage(null);
    };

    const onSubmit: SubmitHandler<FrameFormValues> = (data) => {
        if (!textureImage) {
            alert('Por favor, adicione uma imagem da textura da moldura (uso técnico).');
            return;
        }

        const frameData: FrameData = {
            id: data.sku,
            name: data.name,
            category: data.category as any,
            textureUrl: textureImage,
            previewUrl: galleryImage || undefined,
            frameWidth: data.frameWidth,
            costPrice: data.costPrice,
            salePrice: data.salePrice,
        };

        if (editingId) {
            updateFrame(editingId, frameData);
            alert('Moldura atualizada com sucesso!');
        } else {
            addFrame(frameData);
            alert('Moldura cadastrada com sucesso!');
        }

        cancelEditing();
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <Link to="/" className="flex items-center text-zinc-500 hover:text-zinc-900 transition-colors mb-2 text-sm">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Voltar ao Simulador
                        </Link>
                        <h1 className="text-2xl font-bold text-zinc-900">Gestão de Molduras</h1>
                        <p className="text-zinc-500 text-sm">Cadastre e gerencie as molduras disponíveis no sistema.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulário de Cadastro */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center">
                                <Upload className="w-5 h-5 mr-2 text-zinc-400" />
                                {editingId ? 'Editar Moldura' : 'Nova Moldura'}
                            </h2>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Nome da Moldura</label>
                                    <input
                                        {...register('name')}
                                        placeholder="Ex: Clássica Ouro"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Código / SKU</label>
                                    <input
                                        {...register('sku')}
                                        placeholder="Ex: P149"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                    />
                                    {errors.sku && <p className="text-red-500 text-[10px] mt-1">{errors.sku.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Categoria</label>
                                    <select
                                        {...register('category')}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                    >
                                        <option value="Preta">Preta</option>
                                        <option value="Branca">Branca</option>
                                        <option value="Dourada">Dourada</option>
                                        <option value="Prata">Prata</option>
                                        <option value="Madeira">Madeira</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-[10px] mt-1">{errors.category.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Largura (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register('frameWidth', { valueAsNumber: true })}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                    />
                                    {errors.frameWidth && <p className="text-red-500 text-[10px] mt-1">{errors.frameWidth.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Preço Custo (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('costPrice', { valueAsNumber: true })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Preço Venda (R$)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('salePrice', { valueAsNumber: true })}
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Textura (Simulador)</label>
                                        <div className="relative aspect-square rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center overflow-hidden group hover:border-zinc-300 transition-colors">
                                            {textureImage ? (
                                                <>
                                                    <img src={textureImage} className="w-full h-full object-cover" alt="Texture Preview" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <p className="text-white text-[10px] font-medium">Trocar</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                                                    <p className="text-[9px] text-zinc-500 font-medium text-center px-2 leading-tight">Envie a textura</p>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleTextureChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Textura para o simulador" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Galeria (Menu)</label>
                                        <div className="relative aspect-square rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center overflow-hidden group hover:border-zinc-300 transition-colors">
                                            {galleryImage ? (
                                                <>
                                                    <img src={galleryImage} className="w-full h-full object-cover" alt="Gallery Preview" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <p className="text-white text-[10px] font-medium">Trocar</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                                                    <p className="text-[9px] text-zinc-500 font-medium text-center px-2 leading-tight">Envie a foto final</p>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleGalleryChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Foto para o menu de escolha" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="flex-1 bg-zinc-100 text-zinc-600 py-3 rounded-lg font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center active:scale-[0.98]"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Cancelar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`${editingId ? 'flex-[2]' : 'w-full'} bg-zinc-900 text-white py-3 rounded-lg font-semibold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center shadow-lg shadow-zinc-900/10 active:scale-[0.98]`}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingId ? 'Atualizar Moldura' : 'Salvar Moldura'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Listagem de Molduras */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                <h3 className="font-semibold text-zinc-900">Molduras Ativas</h3>
                                <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{availableFrames.length}</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50/30 border-b border-zinc-100">
                                            <th className="px-6 py-4 font-bold">Moldura</th>
                                            <th className="px-6 py-4 font-bold">Código</th>
                                            <th className="px-6 py-4 font-bold">Largura</th>
                                            <th className="px-6 py-4 font-bold text-right">Preços</th>
                                            <th className="px-6 py-4 font-bold text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {availableFrames.map((frame) => (
                                            <tr key={frame.id} className="group hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded border border-zinc-200 overflow-hidden bg-zinc-100 mr-3 flex-shrink-0">
                                                            <img src={frame.textureUrl} className="w-full h-full object-cover" alt={frame.name} />
                                                        </div>
                                                        <span className="text-sm font-medium text-zinc-900 leading-tight">{frame.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-600">{frame.id}</span>
                                                    <div className="text-[9px] text-zinc-400 mt-1 uppercase font-bold">{frame.category}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                                                    {frame.frameWidth} cm
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-xs font-bold text-zinc-900">Venda: R$ {frame.salePrice.toFixed(2)}</div>
                                                    <div className="text-[10px] text-zinc-400">Custo: R$ {frame.costPrice.toFixed(2)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => startEditing(frame)}
                                                            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                                                            title="Editar moldura"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Deseja remover a moldura ${frame.name}?`)) {
                                                                    removeFrame(frame.id);
                                                                }
                                                            }}
                                                            className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Remover moldura"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
