import { Link } from 'react-router-dom';
import { LayoutGrid, Calculator, Users, MessageSquare, ChevronRight, FileText, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
    const menuItems = [
        {
            title: 'Molduras',
            description: 'Gerencie perfis, cores e categorias.',
            icon: LayoutGrid,
            path: '/admin/molduras',
            color: 'bg-zinc-100 text-zinc-900'
        },
        {
            title: 'Papéis',
            description: 'Cadastre mídias, texturas e valores.',
            icon: FileText,
            path: '/admin/papeis',
            color: 'bg-zinc-100 text-zinc-900'
        },
        {
            title: 'Orçamentos',
            description: 'Simulador 3D para análise técnica e orçamentária.',
            icon: Calculator,
            path: '/simulador',
            color: 'bg-zinc-900 text-white'
        },
        {
            title: 'Cadastro Parceiro',
            description: 'Área dedicada para arquitetos e fotógrafos.',
            icon: Users,
            path: '/parceiros',
            color: 'bg-zinc-100 text-zinc-900'
        },
        {
            title: 'Contato',
            description: 'Fale com nossos especialistas em Fine Art.',
            icon: MessageSquare,
            path: '/contato',
            color: 'bg-zinc-100 text-zinc-900'
        }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header */}
            <header className="px-8 py-4 border-b border-zinc-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo_fuse.png" alt="Fuse Galeria Logo" className="h-12 w-auto object-contain" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tighter text-zinc-900 uppercase leading-none">Fuse Galeria</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Fine Art Specialist</span>
                    </div>
                </Link>
                <nav className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    <Link to="/simulador" className="hover:text-zinc-900 transition-colors">Simulador</Link>
                    <Link to="/admin/molduras" className="hover:text-zinc-900 transition-colors">Admin</Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-medium text-zinc-900 mb-6 tracking-tight leading-tight">
                        Sistema de Gestão &amp; <br />
                        <span className="font-serif italic text-zinc-400">Simulação Fine Art</span>
                    </h1>
                    <p className="text-zinc-500 max-w-lg mx-auto text-sm leading-relaxed">
                        Bem-vindo ao painel técnico operacional. Selecione uma das opções abaixo para gerenciar materiais ou iniciar um novo projeto.
                    </p>
                </div>

                {/* CTA Cliente */}
                <div className="w-full mb-6">
                    <Link
                        to="/orcamento"
                        className="group relative w-full overflow-hidden rounded-3xl bg-zinc-900 p-10 flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-2xl shadow-zinc-900/20 active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Novo Orçamento</p>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Fazer um Orçamento</h2>
                                <p className="text-sm text-white/50 mt-1">Guia interativo passo a passo para seu cliente.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/60 group-hover:text-white group-hover:gap-4 transition-all">
                            <span className="text-xs font-black uppercase tracking-widest hidden md:block">Começar</span>
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </Link>
                </div>

                {/* Divider */}
                <div className="w-full flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Administração</span>
                    <div className="flex-1 h-px bg-zinc-100" />
                </div>

                {/* Grid Menu Admin */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {menuItems.map((item) => (
                        <Link
                            key={item.title}
                            to={item.path}
                            className={`${item.color} group p-8 rounded-2xl flex flex-col justify-between aspect-square transition-all hover:scale-[1.02] hover:shadow-2xl shadow-zinc-900/10 active:scale-[0.98]`}
                        >
                            <item.icon className="w-8 h-8 mb-4 opacity-80" />
                            <div>
                                <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    {item.title}
                                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </h2>
                                <p className="text-xs opacity-60 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Fuse Galeria • Todos os direitos reservados
            </footer>
        </div>
    );
}
