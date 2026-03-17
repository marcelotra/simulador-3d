import React, { useState, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSimulatorStore, FrameData } from '../../store/useSimulatorStore';
import { Upload, ChevronLeft, Save, Edit2, Trash2, X, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PathEditorModal } from '../../components/admin/PathEditorModal';
import { FrameCornerGenerator, FrameCornerGeneratorRef } from '../../components/admin/FrameCornerGenerator';

const frameSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    sku: z.string().min(2, 'SKU/Código é obrigatório'),
    category: z.enum(['Preta', 'Branca', 'Dourada', 'Prata', 'Madeira']),
    frameWidth: z.number().min(0.1, 'Largura deve ser maior que 0'),
    frameDepth: z.number().min(0.1, 'A espessura (profundidade) deve ser maior que 0'),
    rabbetWidth: z.number().min(0, 'Aba do rebaixo não pode ser negativa'),
    rabbetDepth: z.number().min(0, 'Profundidade do rebaixo não pode ser negativa'),
    profileType: z.enum(['reto', 'caixa', 'canaleta', 'curvo']),
    profileSVG: z.string().optional(),
    invertTexture: z.boolean().optional(),
    costPrice: z.number().min(0, 'Custo não pode ser negativo'),
    salePrice: z.number().min(0, 'Valor de venda não pode ser negativo'),
});

type FrameFormValues = z.infer<typeof frameSchema>;

function ProfileSilhouette({ polygon, className = "" }: { polygon: string; className?: string }) {
    return (
        <div 
            className={`bg-zinc-900 shadow-inner ${className}`}
            style={{ 
                clipPath: polygon,
                width: '100%',
                height: '100%'
            }}
        />
    );
}

export default function FrameManager() {
    const { availableFrames, addFrame, updateFrame, removeFrame } = useSimulatorStore();
    const [textureImage, setTextureImage] = useState<string | null>(null);
    const [galleryImage, setGalleryImage] = useState<string | null>(null);
    const [profileSVGData, setProfileSVGData] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Path Editor State
    const [isPathEditorOpen, setIsPathEditorOpen] = useState(false);
    const [editorReferenceImage, setEditorReferenceImage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
        setValue
    } = useForm<FrameFormValues>({
        resolver: zodResolver(frameSchema),
        defaultValues: {
            name: '',
            sku: '',
            category: 'Preta',
            frameWidth: 5.7,
            frameDepth: 2.8,
            rabbetWidth: 0.8,
            rabbetDepth: 1.7,
            profileType: 'caixa',
            profileSVG: '',
            invertTexture: false,
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

    const handleSVGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Check if it's SVG to load directly, otherwise open editor
                if (file.type === 'image/svg+xml') {
                    setProfileSVGData(result);
                } else {
                    setEditorReferenceImage(result);
                    setIsPathEditorOpen(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePathSave = (generatedSvgPath: string) => {
        setProfileSVGData(generatedSvgPath);
        setValue('profileType', 'curvo');
    };

    const startEditing = (frame: FrameData) => {
        setEditingId(frame.id);
        reset({
            name: frame.name,
            sku: frame.id,
            category: frame.category,
            frameWidth: frame.frameWidth,
            frameDepth: frame.frameDepth,
            rabbetWidth: frame.rabbetWidth,
            rabbetDepth: frame.rabbetDepth,
            profileType: frame.profileType,
            invertTexture: frame.invertTexture || false,
            costPrice: frame.costPrice,
            salePrice: frame.salePrice
        });
        setTextureImage(frame.textureUrl);
        setGalleryImage(frame.previewUrl || null);
        setProfileSVGData(frame.profileSVG || null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        reset({
            name: '',
            sku: '',
            category: 'Preta',
            frameWidth: 5.7,
            frameDepth: 2.8,
            rabbetWidth: 0.8,
            rabbetDepth: 1.7,
            profileType: 'caixa',
            profileSVG: '',
            invertTexture: false,
            costPrice: 0,
            salePrice: 0
        });
        setTextureImage(null);
        setGalleryImage(null);
        setProfileSVGData(null);
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
            frameDepth: data.frameDepth,
            rabbetWidth: data.rabbetWidth,
            rabbetDepth: data.rabbetDepth,
            profileType: data.profileType,
            profileSVG: profileSVGData || undefined,
            invertTexture: data.invertTexture,
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

    const generatorRef = useRef<FrameCornerGeneratorRef>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const handleGeneratePreview = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!textureImage) {
            alert("Faça o upload da Textura Principal primeiro para gerar a foto 3D.");
            return;
        }

        if (generatorRef.current) {
            try {
                setIsGeneratingImage(true);
                // Pequeno delay pra garantir que texturas carregaram
                await new Promise(r => setTimeout(r, 200)); 
                const dataUrl = await generatorRef.current.generateImage();
                if (dataUrl) {
                    setGalleryImage(dataUrl);
                } else {
                    alert("Não foi possível capturar a imagem do 3D.");
                }
            } catch (err) {
                console.error(err);
                alert("Erro ao tentar gerar foto.");
            } finally {
                setIsGeneratingImage(false);
            }
        }
    };

    // Derived values for the generator
    const curValues = {
        ...watch(),
        textureUrl: textureImage,
        profileSVG: profileSVGData
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
                                    <h4 className="text-sm font-semibold text-zinc-800 mb-3 border-b border-zinc-200 pb-2">Geometria (Perfil Técnico 3D)</h4>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Largura Frontal (cm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register('frameWidth', { valueAsNumber: true })}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                                title="A largura da moldura visível de frente (ex: 5.7cm)"
                                            />
                                            {errors.frameWidth && <p className="text-red-500 text-[10px] mt-1">{errors.frameWidth.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Profundidade Física (cm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register('frameDepth', { valueAsNumber: true })}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                                title="A espessura total do taco de madeira encostado na parede (ex: 2.8cm)"
                                            />
                                            {errors.frameDepth && <p className="text-red-500 text-[10px] mt-1">{errors.frameDepth.message}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Rebaixo Interno: Largura (cm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register('rabbetWidth', { valueAsNumber: true })}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                                title="Aba de suporte interna que fica em cima do vidro/arte (ex: 0.8cm)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Rebaixo: Profundidade (cm)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                {...register('rabbetDepth', { valueAsNumber: true })}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                                title="Altura da cama da moldura desde o fundo até encostar no vidro (ex: 1.7cm)"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Tipo do Perfil / Silhueta</label>
                                            <select
                                                {...register('profileType')}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                            >
                                                <option value="caixa">Caixa (Reta c/ degrau)</option>
                                                <option value="reto">Plana Reta</option>
                                                <option value="canaleta">Canaleta Flutuante</option>
                                                <option value="curvo">Curva / Abaulada (Esculpida)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Inverter Lados da Textura</label>
                                            <div className="flex items-center h-[38px] px-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    {...register('invertTexture')}
                                                    className="w-4 h-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900"
                                                />
                                                <span className="ml-2 text-sm text-zinc-700">Inverter (Interior vira Exterior)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider flex items-center justify-between">
                                                <span>Desenho Técnico (Foto ou SVG)</span>
                                                {profileSVGData && (
                                                    <button type="button" onClick={() => setIsPathEditorOpen(true)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded transition-colors text-[9px] font-bold">
                                                        <PenTool className="w-2.5 h-2.5" /> Editar Traçado
                                                    </button>
                                                )}
                                            </label>
                                            <div className="relative h-[48px] rounded-lg border border-zinc-200 bg-zinc-50 flex items-center overflow-hidden group hover:border-zinc-300 transition-colors cursor-pointer">
                                                {profileSVGData ? (
                                                    <div className="flex w-full px-2 items-center gap-3">
                                                        <div className="w-10 h-8 flex-shrink-0 bg-white rounded border border-zinc-200 p-0.5">
                                                            <ProfileSilhouette polygon={profileSVGData} />
                                                        </div>
                                                        <div className="flex-1 flex flex-col min-w-0">
                                                            <span className="text-[10px] text-zinc-900 font-bold truncate leading-tight uppercase tracking-tight">Desenho Técnico Salvo</span>
                                                            <span className="text-[8px] text-zinc-500 font-mono truncate">Polígono Extraído ✓</span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { e.preventDefault(); setProfileSVGData(null); }} 
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors mr-1"
                                                            title="Remover Desenho SVG"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <Upload className="w-3 h-3 text-zinc-400 mr-2" />
                                                        <span className="text-[10px] text-zinc-500 font-medium">Enviar Foto da Planta (JPG/PNG)</span>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept=".svg, image/svg+xml, image/png, image/jpeg, image/jpg" 
                                                    onChange={handleSVGChange} 
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    title="Envie a foto do corte transversal ou desenho técnico" 
                                                />
                                            </div>
                                            <p className="text-[9px] text-zinc-500 mt-1 leading-tight">Envie sua foto da planta. O sistema abrirá uma ferramenta mágica de clique-a-clique.</p>
                                        </div>
                                    </div>
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
                                        <label className="relative block aspect-square rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center overflow-hidden group hover:border-zinc-300 transition-colors cursor-pointer">
                                            {galleryImage ? (
                                                <img src={galleryImage} className="w-full h-full object-cover" alt="Gallery Preview" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-zinc-400">
                                                    <Upload className="w-5 h-5 mb-1" />
                                                    <span className="text-[10px] font-medium px-2 text-center">Envie foto ou gere em 3D</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleGalleryChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Foto para o menu de escolha" />
                                        </label>
                                        <div className="mt-2">
                                            <button 
                                                type="button"
                                                onClick={handleGeneratePreview}
                                                disabled={isGeneratingImage || !textureImage}
                                                className="w-full px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                            >
                                                {isGeneratingImage ? "Gerando..." : "Gerar Foto 3D"}
                                            </button>
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
                            
                            {/* Generator isolado, mas recebe as props atuais do form react-hook-form */}
                            {(curValues.textureUrl && curValues.frameWidth && curValues.frameDepth) ? (
                                <FrameCornerGenerator 
                                    ref={generatorRef}
                                    frameWidth={curValues.frameWidth}
                                    frameDepth={curValues.frameDepth}
                                    rabbetDepth={curValues.rabbetDepth}
                                    profileType={curValues.profileType}
                                    profileSVG={curValues.profileSVG || undefined}
                                    textureUrl={curValues.textureUrl}
                                    invertTexture={curValues.invertTexture}
                                />
                            ) : null}
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
                                                        <div className="relative w-10 h-10 rounded border border-zinc-200 overflow-hidden bg-zinc-100 mr-3 flex-shrink-0">
                                                            <img src={frame.textureUrl} className="w-full h-full object-cover" alt={frame.name} />
                                                            {frame.profileSVG && (
                                                                <div className="absolute top-0 right-0 w-4 h-4 bg-white/90 border-l border-b border-zinc-200 p-0.5" title="Possui Perfil Curvo">
                                                                    <ProfileSilhouette polygon={frame.profileSVG} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-zinc-900 leading-tight">{frame.name}</span>
                                                            <span className="text-[10px] text-zinc-400 capitalize">{frame.profileType}</span>
                                                        </div>
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
            <PathEditorModal
                isOpen={isPathEditorOpen}
                onClose={() => setIsPathEditorOpen(false)}
                onSave={handlePathSave}
                initialReferenceImage={editorReferenceImage || undefined}
            />
        </div>
    );
}
