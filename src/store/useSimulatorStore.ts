import { create } from 'zustand';

export interface FrameData {
    id: string; // SKU or UUID
    name: string;
    category: 'Preta' | 'Branca' | 'Dourada' | 'Prata' | 'Madeira';
    textureUrl: string; // Used for simulation
    previewUrl?: string; // Used for gallery display (optional)
    frameWidth: number; // width in cm
    frameDepth: number; // thickness in cm
    rabbetWidth: number; // internal lip over art
    rabbetDepth: number; // depth down to art
    profileType: 'reto' | 'caixa' | 'canaleta' | 'curvo';
    profileSVG?: string; // Optional path data for clip-path
    elbowUrl?: string; // Imagem do cotovelo gerado em 3D
    profileImageUrl?: string; // Foto real do perfil técnico
    invertTexture?: boolean; // Inverter interno/externo da textura
    features?: string[]; // Bullet points for UI
    costPrice: number;
    salePrice: number;
}

export interface PaperData {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    costPrice: number; // per m2
    salePrice: number; // per m2
}

export interface CartItem {
    id: string;
    width: number;
    height: number;
    frameProfileId: string | null;
    passepartoutWidth: number;
    passepartoutColor: string;
    glassType: 'none' | 'standard' | 'anti-reflective';
    hasFrame: boolean;
    paperMargin: number;
    printType: string;
    backingType: string;
    userImage: string | null;
    quantity: number;
    price: number;
}

export type SplitType = 'single' | 'asymmetric' | 'vertical' | 'horizontal' | 'grid';

export type CameraAngle = 'center' | 'left' | 'right' | 'top-left' | 'bottom-right';

interface FrameState {
    // Available Data
    availableFrames: FrameData[];
    availablePapers: PaperData[];

    // Current Configuration (Active Item)
    width: number;
    height: number;
    quantity: number;
    frameProfileId: string;
    passepartoutWidth: number;
    passepartoutColor: string;
    glassType: 'none' | 'standard' | 'anti-reflective';
    hasFrame: boolean;
    paperMargin: number;
    printType: string;
    backingType: string;
    userImage: string | null;
    originalImage: string | null;
    imagePixels: { width: number; height: number } | null;

    // View Configuration
    cameraAngle: CameraAngle;

    // Split Configuration
    splitType: SplitType;
    splitColumns: number;
    splitRows: number;
    splitGap: number; // in cm
    splitHeightRatio: number; // 0.8 or 0.9 for asymmetric

    // Cart
    cart: CartItem[];

    // Actions
    addFrame: (frame: FrameData) => void;
    updateFrame: (id: string, data: Partial<FrameData>) => void;
    removeFrame: (id: string) => void;
    addPaper: (paper: PaperData) => void;
    updatePaper: (id: string, data: Partial<PaperData>) => void;
    removePaper: (id: string) => void;
    setWidth: (w: number) => void;
    setHeight: (h: number) => void;
    setQuantity: (q: number) => void;
    setFrameProfileId: (id: string) => void;
    setPassepartoutWidth: (w: number) => void;
    setPassepartoutColor: (color: string) => void;
    setGlassType: (type: 'none' | 'standard' | 'anti-reflective') => void;
    setHasFrame: (has: boolean) => void;
    setPaperMargin: (m: number) => void;
    setPrintType: (type: string) => void;
    setBackingType: (type: string) => void;
    setUserImage: (url: string | null) => void;
    setOriginalImage: (url: string | null) => void;
    setImagePixels: (pixels: { width: number; height: number } | null) => void;
    setCameraAngle: (angle: CameraAngle) => void;

    // Split Actions
    setSplitType: (type: SplitType) => void;
    setSplitColumns: (cols: number) => void;
    setSplitRows: (rows: number) => void;
    setSplitGap: (gap: number) => void;
    setSplitHeightRatio: (ratio: number) => void;

    // Cart Actions
    addToCart: (price: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    resetConfiguration: () => void;
}

const defaultInitialFrames: FrameData[] = [
    {
        id: '149',
        name: 'Perfil 149 (Clássica Ouro)',
        category: 'Dourada',
        textureUrl: '/texture_frame.png',
        previewUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop',
        frameWidth: 5.7,
        frameDepth: 3.8,
        rabbetWidth: 0.8,
        rabbetDepth: 1.2,
        profileType: 'curvo',
        // Representação fiel do desenho técnico (57x38mm) em formato polygon
        profileSVG: 'polygon(0% 100%, 0% 40%, 15% 35%, 25% 15%, 45% 5%, 65% 0%, 80% 5%, 85% 15%, 85% 35%, 100% 35%, 100% 100%)', 
        invertTexture: true,
        features: ['Moldura larga dourada', 'Estilo clássico com entalhes', 'Acabamento premium'],
        costPrice: 45.00,
        salePrice: 120.00
    },
    {
        id: 'PB-01',
        name: 'Filete Preto 1.5cm',
        category: 'Preta',
        textureUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200&h=200&fit=crop',
        frameWidth: 1.5,
        frameDepth: 3.0,
        rabbetWidth: 0.5,
        rabbetDepth: 2.5,
        profileType: 'reto',
        profileSVG: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        features: ['Alumínio preto fosco', 'Perfil fino e elegante', 'Ideal para fotos P&B'],
        costPrice: 20.00,
        salePrice: 65.00
    },
    {
        id: 'BR-02',
        name: 'Caixa Branca 3cm',
        category: 'Branca',
        textureUrl: 'https://images.unsplash.com/photo-1544207617-073bb33ad072?w=200&h=200&fit=crop',
        frameWidth: 3.0,
        frameDepth: 1.5,
        rabbetWidth: 0.6,
        rabbetDepth: 1.0,
        profileType: 'reto',
        profileSVG: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        features: ['Madeira laqueada branca', 'Design minimalista', 'Fácil de limpar'],
        costPrice: 25.00,
        salePrice: 85.00
    },
    {
        id: 'MD-03',
        name: 'Freijó Natural 2cm',
        category: 'Madeira',
        textureUrl: 'https://images.unsplash.com/photo-1587350859728-1176c2bc051c?w=200&h=200&fit=crop',
        frameWidth: 2.0,
        frameDepth: 2.0,
        rabbetWidth: 0.6,
        rabbetDepth: 1.5,
        profileType: 'caixa',
        profileSVG: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        features: ['Madeira maciça freijó', 'Textura natural única', 'Acabamento encerado'],
        costPrice: 35.00,
        salePrice: 110.00
    }
];

const defaultInitialPapers: PaperData[] = [
    {
        id: 'photo-230',
        name: 'Papel Fotográfico Luster 230g',
        description: 'Papel com brilho perolado, ideal para fotografias de alta resolução com pretos profundos e cores vibrantes.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
        category: 'Fotográfico',
        costPrice: 45.00,
        salePrice: 110.00
    },
    {
        id: 'cotton-310',
        name: 'Hahnemühle Photo Rag 310g',
        description: 'Papel 100% algodão com acabamento matte suave. O padrão ouro para reproduções Fine Art e museus.',
        imageUrl: 'https://images.unsplash.com/photo-1541462608141-ad60397d5873?w=400&h=300&fit=crop',
        category: 'Fine Art',
        costPrice: 95.00,
        salePrice: 280.00
    },
    {
        id: 'canvas-fine',
        name: 'Canvas Fine Art 380g',
        description: 'Tecido de algodão e poliéster com textura de tela de pintura. Ideal para obras contemporâneas.',
        imageUrl: 'https://images.unsplash.com/photo-1541462608141-ad60397d5873?w=400&h=300&fit=crop',
        category: 'Canvas',
        costPrice: 85.00,
        salePrice: 220.00
    }
];

const getStoredFrames = (): FrameData[] => {
    try {
        const stored = localStorage.getItem('sim_custom_frames');
        if (stored) return JSON.parse(stored);
    } catch (e) { }
    return defaultInitialFrames;
};

const getStoredPapers = (): PaperData[] => {
    try {
        const stored = localStorage.getItem('sim_custom_papers');
        if (stored) return JSON.parse(stored);
    } catch (e) { }
    return defaultInitialPapers;
};

const INITIAL_STATE = {
    width: 40,
    height: 60,
    quantity: 1,
    frameProfileId: '149',
    passepartoutWidth: 0,
    passepartoutColor: '#ffffff',
    glassType: 'standard' as const,
    hasFrame: false,
    paperMargin: 0,
    printType: 'photo-230',
    backingType: 'MDF 3mm',
    userImage: null,
    originalImage: null,
    imagePixels: null,
    splitType: 'single' as SplitType,
    splitColumns: 3,
    splitRows: 1,
    splitGap: 2,
    splitHeightRatio: 0.8,
    cameraAngle: 'center' as CameraAngle,
};

export const useSimulatorStore = create<FrameState>((set) => ({
    ...INITIAL_STATE,
    availableFrames: getStoredFrames(),
    availablePapers: getStoredPapers(),
    cart: [],

    addFrame: (frame) => set((state) => {
        const newFrames = [...state.availableFrames, frame];
        localStorage.setItem('sim_custom_frames', JSON.stringify(newFrames));
        return { availableFrames: newFrames };
    }),
    updateFrame: (id, data) => set((state) => {
        const newFrames = state.availableFrames.map(f => f.id === id ? { ...f, ...data } : f);
        localStorage.setItem('sim_custom_frames', JSON.stringify(newFrames));
        return { availableFrames: newFrames };
    }),
    removeFrame: (id) => set((state) => {
        const newFrames = state.availableFrames.filter(f => f.id !== id);
        localStorage.setItem('sim_custom_frames', JSON.stringify(newFrames));
        return { availableFrames: newFrames };
    }),
    addPaper: (paper) => set((state) => {
        const newPapers = [...state.availablePapers, paper];
        localStorage.setItem('sim_custom_papers', JSON.stringify(newPapers));
        return { availablePapers: newPapers };
    }),
    updatePaper: (id, data) => set((state) => {
        const newPapers = state.availablePapers.map(p => p.id === id ? { ...p, ...data } : p);
        localStorage.setItem('sim_custom_papers', JSON.stringify(newPapers));
        return { availablePapers: newPapers };
    }),
    removePaper: (id) => set((state) => {
        const newPapers = state.availablePapers.filter(p => p.id !== id);
        localStorage.setItem('sim_custom_papers', JSON.stringify(newPapers));
        return { availablePapers: newPapers };
    }),
    setWidth: (w) => set({ width: w }),
    setHeight: (h) => set({ height: h }),
    setQuantity: (q) => set({ quantity: Math.max(1, q) }),
    setFrameProfileId: (id) => set({ frameProfileId: id }),
    setPassepartoutWidth: (w) => set({ passepartoutWidth: w }),
    setPassepartoutColor: (color) => set({ passepartoutColor: color }),
    setGlassType: (type) => set({ glassType: type }),
    setHasFrame: (has) => set({ hasFrame: has }),
    setPaperMargin: (m) => set({ paperMargin: m }),
    setPrintType: (type) => set({ printType: type }),
    setBackingType: (type) => set({ backingType: type }),
    setUserImage: (url) => set({ userImage: url }),
    setOriginalImage: (url) => set({ originalImage: url }),
    setImagePixels: (pixels) => set({ imagePixels: pixels }),
    setCameraAngle: (angle) => set({ cameraAngle: angle }),

    setSplitType: (type) => set({ splitType: type }),
    setSplitColumns: (cols) => set({ splitColumns: cols }),
    setSplitRows: (rows) => set({ splitRows: rows }),
    setSplitGap: (gap) => set({ splitGap: gap }),
    setSplitHeightRatio: (ratio) => set({ splitHeightRatio: ratio }),

    addToCart: (price: number) => set((state) => {
        const newItem: CartItem = {
            id: Math.random().toString(36).substring(7),
            width: state.width,
            height: state.height,
            frameProfileId: state.hasFrame ? state.frameProfileId : null,
            passepartoutWidth: state.hasFrame ? state.passepartoutWidth : 0,
            passepartoutColor: state.passepartoutColor,
            glassType: state.hasFrame ? state.glassType : 'none',
            hasFrame: state.hasFrame,
            paperMargin: state.paperMargin,
            printType: state.printType,
            backingType: state.backingType,
            userImage: state.userImage,
            quantity: state.quantity,
            price: price
        };
        return { cart: [...state.cart, newItem] };
    }),
    removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id)
    })),
    clearCart: () => set({ cart: [] }),
    resetConfiguration: () => set(INITIAL_STATE),
}));
