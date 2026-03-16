import { Link } from 'react-router-dom';
import { ChevronLeft, Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-8 text-center">
            <Construction className="w-16 h-16 text-zinc-300 mb-6" />
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">{title}</h1>
            <p className="text-zinc-500 mb-8 max-w-sm">Esta página está em desenvolvimento e será integrada em breve ao sistema.</p>
            <Link to="/" className="flex items-center text-sm font-bold uppercase tracking-widest text-zinc-900 hover:gap-2 transition-all">
                <ChevronLeft className="w-4 h-4" />
                Voltar para Início
            </Link>
        </div>
    );
}

export function Partners() { return <PlaceholderPage title="Cadastro de Parceiros" />; }
export function Contact() { return <PlaceholderPage title="Central de Contato" />; }
