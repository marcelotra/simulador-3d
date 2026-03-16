import { create } from 'zustand';

export interface FrameData {
    id: string; // SKU or UUID
    name: string;
    category: 'Preta' | 'Branca' | 'Dourada' | 'Prata' | 'Madeira';
    textureUrl: string; // Used for simulation
    previewUrl?: string; // Used for gallery display (optional)
    frameWidth: number; // width in cm
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
        costPrice: 45.00,
        salePrice: 120.00
    },
    {
        id: 'PB-01',
        name: 'Filete Preto 1.5cm',
        category: 'Preta',
        textureUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200&h=200&fit=crop',
        frameWidth: 1.5,
        costPrice: 20.00,
        salePrice: 65.00
    },
    {
        id: 'BR-02',
        name: 'Caixa Branca 3cm',
        category: 'Branca',
        textureUrl: 'https://images.unsplash.com/photo-1544207617-073bb33ad072?w=200&h=200&fit=crop',
        frameWidth: 3.0,
        costPrice: 25.00,
        salePrice: 85.00
    },
    {
        id: 'MD-03',
        name: 'Freijó Natural 2cm',
        category: 'Madeira',
        textureUrl: 'https://images.unsplash.com/photo-1587350859728-1176c2bc051c?w=200&h=200&fit=crop',
        frameWidth: 2.0,
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
    passepartoutWidth: 5,
    passepartoutColor: '#ffffff',
    glassType: 'standard' as const,
    hasFrame: false,
    paperMargin: 0,
    printType: 'photo-230',
    backingType: 'MDF 3mm',
    userImage: null,
    originalImage: null,
    imagePixels: null,
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
