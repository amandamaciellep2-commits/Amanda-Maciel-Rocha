import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  Plus,
  AlertTriangle,
  Package,
  Users,
  Activity,
  Layers,
  Thermometer,
  BoxSelect,
  MoreVertical,
  Calendar,
  LayoutDashboard,
  FileText,
  Link,
  ExternalLink,
  Trash2,
  Database,
  RefreshCw,
  Code,
  Copy,
  Check,
  Settings,
  X,
  Sparkles,
  Lock,
  Mail,
  Key,
  LogOut,
  Printer,
  Shield,
  Brain
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from '@google/genai';
import {
  getSupabaseClient,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  SUPABASE_SQL_SETUP
} from './lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EQUIPE = [
  { id: 1, nome: 'Amanda Maciel', funcao: 'Enfermeira Chefe', escala: 'Plantão Diurno' },
  { id: 2, nome: 'Higo', funcao: 'Técnico CME', escala: 'Plantão Diurno' },
  { id: 3, nome: 'Renata', funcao: 'Técnico CME', escala: 'Plantão Diurno' },
  { id: 4, nome: 'Laysa', funcao: 'Técnica CME', escala: 'Plantão Diurno' },
  { id: 5, nome: 'Suely', funcao: 'Técnico CME', escala: 'Plantão Noturno' },
  { id: 6, nome: 'Ávila', funcao: 'Técnica CMe', escala: 'Plantão Noturno' },
  { id: 7, nome: 'Bia', funcao: 'Técnica CME', escala: 'Horário Comercial' },
  { id: 8, nome: 'Mariana', funcao: 'Técnico CME', escala: 'Plantão Noturno' },
  { id: 9, nome: 'Anízia', funcao: 'Técnica CME', escala: 'Horário Comercial' },
  { id: 10, nome: 'Laísa', funcao: 'Auxiliar CME', escala: 'Plantão Diurno' },
];

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white p-6 md:p-8 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)]", className)}>
      {children}
    </div>
  );
}

function AestheticTaskItem({ 
  title, 
  metadata, 
  checked: initialChecked = false,
  onClick
}: { 
  title: string, 
  metadata: string, 
  checked?: boolean,
  onClick?: () => void,
  key?: string | number
}) {
  const [localChecked, setLocalChecked] = useState(initialChecked);

  React.useEffect(() => {
    setLocalChecked(initialChecked);
  }, [initialChecked]);

  const handleToggle = () => {
    if (onClick) {
      onClick();
    } else {
      setLocalChecked(!localChecked);
    }
  };

  const isChecked = onClick ? initialChecked : localChecked;

  return (
    <div 
      onClick={handleToggle}
      className={cn(
        "flex items-start gap-4 group transition-all p-2 -m-2 rounded-xl cursor-pointer hover:bg-black/[0.02] select-none",
        isChecked && "opacity-60"
      )}
    >
      <button 
        type="button"
        className={cn(
          "w-5 h-5 rounded flex items-center justify-center border transition-all mt-0.5 pointer-events-none",
          isChecked ? "bg-[#A855F7] border-[#A855F7] text-white" : "border-gray-300 group-hover:border-[#A855F7]"
        )}
      >
        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
      </button>
      <div className="flex-1">
        <p className={cn("text-sm font-medium transition-all text-left", isChecked ? "line-through text-gray-400" : "text-[#1A1A1A]")}>
          {title}
        </p>
        <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold text-left">{metadata}</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, percentage }: { label: string, percentage: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2.5">
        <span className="text-sm font-semibold text-[#1A1A1A]">{label}</span>
        <span className="text-xs font-semibold text-gray-400">{percentage}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gray-500 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function HeaderBanner({ title, subtitle, description, image }: { title: string, subtitle?: string, description?: string, image: string }) {
  return (
    <div className="relative w-full h-56 md:h-64 rounded-2xl md:rounded-[32px] overflow-hidden mb-8 shadow-sm">
      <img src={image} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent mix-blend-normal" />
      <div className="absolute inset-0 p-8 flex flex-col justify-center">
        {subtitle && <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A855F7] mb-3">{subtitle}</span>}
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1A1A1A] max-w-lg leading-[1.1]">
          {title}
        </h2>
        {description && <p className="mt-4 text-sm md:text-base font-medium text-[#1A1A1A]/80 italic max-w-lg border-l-2 border-[#A855F7] pl-3">{description}</p>}
      </div>
    </div>
  );
}

function StatsCard({ label, value, total, alert }: { label: string, value: string, total?: string, alert?: boolean }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] flex flex-col justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-6">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-4xl font-serif font-bold tracking-tight", alert ? "text-red-400" : "text-[#1A1A1A]")}>{value}</span>
        {total && <span className="text-sm font-medium text-gray-400">/ {total}</span>}
      </div>
    </div>
  );
}

function CounterCard({ label, initialValue }: { label: string, initialValue: number }) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] flex flex-col justify-between">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">{label}</span>
      <div className="flex items-center justify-between mt-auto">
        <button onClick={() => setValue(v => Math.max(0, v - 1))} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#F3E8FF] hover:border-[#A855F7] hover:text-[#A855F7] transition-colors">-</button>
        <span className="text-3xl font-serif font-bold tracking-tight text-[#1A1A1A]">{value}</span>
        <button onClick={() => setValue(v => v + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#F3E8FF] hover:border-[#A855F7] hover:text-[#A855F7] transition-colors">+</button>
      </div>
    </div>
  );
}

interface DashboardViewProps {
  tasks: Array<{ id: number; title: string; metadata: string; checked: boolean }>;
  toggleTask: (id: number) => void;
  notes: string;
  setNotes: (val: string) => void;
  escalaTexto: string;
  setEscalaTexto: (val: string) => void;
  pendencias: Array<{ id: string; label: string; checked: boolean }>;
  addPendencia: (text: string) => void;
  togglePendencia: (id: string) => void;
  removePendencia: (id: string) => void;
  key?: string | number;
}

function PendenciasCard({ 
  pendencias, 
  addPendencia, 
  togglePendencia, 
  removePendencia 
}: { 
  pendencias: Array<{ id: string; label: string; checked: boolean }>;
  addPendencia: (text: string) => void;
  togglePendencia: (id: string) => void;
  removePendencia: (id: string) => void;
}) {
  const [text, setText] = useState('');
  const activeCount = pendencias.filter(p => !p.checked).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addPendencia(text.trim());
    setText('');
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] flex flex-col justify-between md:col-span-1 col-span-2 min-h-[160px]">
      <div className="space-y-1 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">PENDÊNCIAS ADM.</span>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-bold",
            activeCount > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
          )}>
            {activeCount === 0 ? "OK" : `${activeCount} pendentes`}
          </span>
        </div>
        
        {/* List of items */}
        <div className="flex-1 max-h-[85px] overflow-y-auto no-scrollbar space-y-1.5 my-1.5 pr-1">
          {pendencias.length > 0 ? (
            pendencias.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-1 border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                <button 
                  type="button"
                  onClick={() => togglePendencia(p.id)}
                  className="flex items-center gap-1.5 text-left text-[11px] text-[#1A1A1A] font-semibold flex-1 truncate cursor-pointer"
                >
                  <span className={cn(
                    "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all",
                    p.checked ? "bg-[#A855F7] border-[#A855F7]" : "border-gray-200 bg-white"
                  )}>
                    {p.checked && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </span>
                  <span className={cn("truncate max-w-[125px] tracking-tight", p.checked && "line-through text-gray-400 font-medium")}>
                    {p.label}
                  </span>
                </button>
                <button 
                  type="button"
                  onClick={() => removePendencia(p.id)} 
                  className="text-gray-300 hover:text-red-500 p-0.5 shrink-0 transition-colors"
                  title="Remover pendência"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-gray-400 italic py-2">Sem pendências registradas</p>
          )}
        </div>
      </div>

      {/* Space digitavel for adding */}
      <form onSubmit={handleSubmit} className="flex gap-1 border-t border-gray-100 pt-2 shrink-0">
        <input 
          type="text" 
          placeholder="Nova pendência..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-[#FAF9F7] border border-gray-150 text-[10px] font-semibold px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] placeholder:text-gray-400 transition-colors"
        />
        <button 
          type="submit"
          className="bg-[#F3E8FF] hover:bg-[#A855F7] text-[#A855F7] hover:text-white p-1.5 rounded-lg border border-transparent shadow-sm shrink-0 transition-colors flex items-center justify-center cursor-pointer"
          title="Salvar pendência"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

function DashboardView({
  tasks,
  toggleTask,
  notes,
  setNotes,
  escalaTexto,
  setEscalaTexto,
  pendencias,
  addPendencia,
  togglePendencia,
  removePendencia,
}: DashboardViewProps) {

  const completedCount = tasks.filter(t => t.checked).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-12 space-y-8">
      <HeaderBanner 
        title="Plantão do Dia" 
        subtitle="Dashboard Inicial" 
        description='"Tudo posso naquele que me fortalece." - Filipenses 4:13'
        image="https://images.unsplash.com/photo-1509803874385-db7c23652552?auto=format&fit=crop&q=80&w=2000" 
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] flex flex-col justify-between">
           <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">Ciclos hoje</span>
           <div className="grid grid-cols-4 gap-2">
             <div className="flex flex-col items-center">
               <span className="text-xs font-bold text-[#1A1A1A] mb-1.5">A1</span>
               <input type="number" min="0" placeholder="0" className="w-full px-1 py-1.5 text-center bg-[#FAF9F7] border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all text-[#1A1A1A]" />
             </div>
             <div className="flex flex-col items-center">
               <span className="text-xs font-bold text-[#1A1A1A] mb-1.5">A2</span>
               <input type="number" min="0" placeholder="0" className="w-full px-1 py-1.5 text-center bg-[#FAF9F7] border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all text-[#1A1A1A]" />
             </div>
             <div className="flex flex-col items-center">
               <span className="text-xs font-bold text-[#1A1A1A] mb-1.5">A3</span>
               <input type="number" min="0" placeholder="0" className="w-full px-1 py-1.5 text-center bg-[#FAF9F7] border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all text-[#1A1A1A]" />
             </div>
             <div className="flex flex-col items-center">
               <span className="text-xs font-bold text-[#1A1A1A] mb-1.5 truncate w-full text-center" title="Peróxido">Peróx.</span>
               <input type="number" min="0" placeholder="0" className="w-full px-1 py-1.5 text-center bg-[#FAF9F7] border border-gray-100 rounded-lg text-sm focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all text-[#1A1A1A]" />
             </div>
           </div>
        </div>
        <CounterCard label="OPME verificada" initialValue={4} />
        <CounterCard label="Ópticas verificadas" initialValue={10} />
        <PendenciasCard 
          pendencias={pendencias} 
          addPendencia={addPendencia} 
          togglePendencia={togglePendencia} 
          removePendencia={removePendencia} 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
         <Card>
           <h3 className="font-serif text-2xl font-bold mb-8 text-[#1A1A1A]">Comece por aqui</h3>
           <div className="space-y-6">
             {tasks.map(task => (
               <AestheticTaskItem 
                 key={task.id}
                 title={task.title}
                 metadata={task.metadata}
                 checked={task.checked}
                 onClick={() => toggleTask(task.id)}
               />
             ))}
           </div>
         </Card>

         <div className="space-y-6 md:space-y-8 flex flex-col justify-between">
           <Card className="bg-[#FAF9F7] border border-gray-100 shadow-none flex flex-col h-full">
             <h3 className="font-serif text-xl font-bold mb-1 flex items-center gap-2 text-[#A855F7]">
               <FileText className="w-5 h-5" strokeWidth={2} /> Mapa Cirúrgico do Plantão
             </h3>
             <p className="text-[11px] text-gray-400 mb-4 font-semibold uppercase tracking-wider">Espaço livre para colar o mapa diário</p>
             
             <textarea 
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Cole ou digite aqui o mapa cirúrgico completo do plantão (ex: Salas, Horários, Cirurgias, Pacientes)..." 
               className="w-full flex-1 min-h-[320px] p-4 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] resize-y transition-shadow text-[#1A1A1A] placeholder:text-gray-400 font-medium font-mono leading-relaxed"
             />
           </Card>

           <Card>
             <h3 className="font-serif text-xl font-bold mb-6">Check Rápido</h3>
             <div className="space-y-6">
               <ProgressBar label="Progresso do Turno" percentage={progressPercentage} />
               <ProgressBar label="Metas Diárias" percentage={Math.max(60, progressPercentage)} />
             </div>
           </Card>

           <Card className="bg-white border border-gray-200 rounded-2xl">
              <h3 className="font-serif text-lg font-bold mb-1.5 flex items-center gap-2 text-[#A855F7]">
                <Users className="w-4 h-4" /> Escala da Equipe (Turno)
              </h3>
              <p className="text-[11px] text-gray-400 mb-3 font-semibold uppercase tracking-wider">CME Escala Diária Configurável</p>
              <textarea
                value={escalaTexto}
                onChange={(e) => setEscalaTexto(e.target.value)}
                placeholder="Exemplo: &#10;• Expurgo: Renata&#10;• Preparo: Higo&#10;• Esterilização: Laysa..."
                className="w-full min-h-[140px] p-3 text-xs bg-[#FAF9F7] border border-gray-150 rounded-xl focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] resize-none transition-shadow text-[#1A1A1A] placeholder:text-gray-400 font-medium leading-relaxed font-mono"
              />
           </Card>
         </div>
      </div>
    </motion.div>
  );
}

function SetoresView() {
  const [activeSub, setActiveSub] = useState<'Expurgo' | 'Química' | 'Esterilização' | 'Armazenamento'>('Expurgo');
  const subs = ['Expurgo', 'Química', 'Esterilização', 'Armazenamento'] as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-12 space-y-8">
      <HeaderBanner 
        title="Fluxo do Setor" 
        subtitle="Sub-setores Operacionais" 
        image="https://images.unsplash.com/photo-1495422964237-27a37bf7e174?auto=format&fit=crop&q=80&w=2000" 
      />

      <div className="flex gap-8 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
        {subs.map(sub => (
          <button
            key={sub}
            onClick={() => setActiveSub(sub)}
            className={cn(
              "pb-4 text-sm font-semibold transition-all whitespace-nowrap border-b-2 tracking-wide",
              activeSub === sub 
                ? "border-[#A855F7] text-[#A855F7]" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {sub}
          </button>
        ))}
      </div>

      <div className="pt-4">
         {activeSub === 'Expurgo' && (
           <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <h3 className="font-serif text-2xl font-bold mb-8">Checklist de Limpeza</h3>
                <div className="space-y-6">
                  <AestheticTaskItem title="Conferência da temperatura" metadata="Controle de Ambiente" checked={false} />
                  <AestheticTaskItem title="Carimbar ocorrência" metadata="Registro" checked={false} />
                  <AestheticTaskItem title="Pendência rota suja" metadata="Aviso/Logística" checked={false} />
                </div>
              </Card>

              <Card className="bg-[#FAF9F7] shadow-none border border-gray-100">
                <h3 className="font-serif text-xl font-bold mb-6 text-[#1A1A1A]">Materiais Críticos</h3>
                <div className="space-y-4 text-sm text-[#1A1A1A]/70 leading-relaxed font-medium">
                  <p className="flex items-start gap-2"><span className="text-[#A855F7]">•</span> Caixas de neurocirurgia na fila prioritária.</p>
                  <p className="flex items-start gap-2"><span className="text-[#A855F7]">•</span> Pinças videolaparoscópicas requerem inspeção extra.</p>
                  <p className="flex items-start gap-2"><span className="text-[#A855F7]">•</span> Veja os pinos de schanz.</p>
                </div>
              </Card>
           </div>
         )}
         
         {activeSub === 'Química' && (
           <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <h3 className="font-serif text-2xl font-bold mb-8">Check de Rotina</h3>
                <div className="space-y-6">
                  <AestheticTaskItem title="Teve SAMU?" metadata="Ocorrência" checked={false} />
                  <AestheticTaskItem title="Teve entrega?" metadata="Recebimento" checked={false} />
                  <AestheticTaskItem title="Teve pendência?" metadata="Status" checked={false} />
                </div>
              </Card>
              <Card>
                <h3 className="font-serif text-xl font-bold mb-4 text-[#A855F7]">Não Conformidades</h3>
                <div className="bg-white border rounded-xl p-4 shadow-sm border-gray-100">
                  <p className="text-sm font-semibold text-[#1A1A1A]">Pinça de dissecção com ranhura</p>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-2">Caixa 102 - Retirada</p>
                </div>
              </Card>
           </div>
         )}

         {activeSub === 'Esterilização' && (
           <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <h3 className="font-serif text-2xl font-bold mb-8">Liberação de Carga</h3>
                <div className="space-y-6">
                  <AestheticTaskItem title="Revisão Controle Biológico (Incubadora)" metadata="Leitura às 16h" checked={false} />
                  <AestheticTaskItem title="Teste Bowie & Dick aprovado" metadata="08:00 AM" checked={true} />
                  <AestheticTaskItem title="Retirada Ciclo 3 (Cargas em geral)" metadata="Pendente" checked={false} />
                </div>
              </Card>
              <div className="grid grid-rows-2 gap-8">
                <StatsCard label="Ciclos Finalizados" value="5" />
                <StatsCard label="Pendências Reais" value="2" alert />
              </div>
           </div>
         )}

         {activeSub === 'Armazenamento' && (
           <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <h3 className="font-serif text-2xl font-bold mb-8">Checklist de Fim de Plantão</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-sm font-medium text-[#1A1A1A]">Ópticas no setor</span>
                    <input type="number" min="0" placeholder="Qtd" className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] bg-white transition-colors" />
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-sm font-medium text-[#1A1A1A]">Perfuradores no setor</span>
                    <input type="number" min="0" placeholder="Qtd" className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] bg-white transition-colors" />
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <span className="text-sm font-medium text-[#1A1A1A]">Mat. Vídeolaparoscopia (Entregue)</span>
                    <input type="number" min="0" placeholder="Qtd" className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] bg-white transition-colors" />
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-medium text-[#1A1A1A]">Pinos de Schanz (Entregue)</span>
                    <input type="number" min="0" placeholder="Qtd" className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] bg-white transition-colors" />
                  </div>
                  <button className="w-full mt-2 bg-[#F3E8FF] text-[#A855F7] font-semibold py-3 rounded-xl hover:bg-[#A855F7] hover:text-white transition-colors text-sm shadow-sm">
                    Salvar Checklist
                  </button>
                </div>
              </Card>

              <div className="space-y-8 flex flex-col justify-between">
                <Card>
                  <h3 className="font-serif text-xl font-bold mb-6">Distribuição Atual</h3>
                  <div className="space-y-4">
                    <AestheticTaskItem title="Organização de Prateleiras (Kits PE)" metadata="Concluído" checked={true} />
                    <AestheticTaskItem title="Validades (Corredor B)" metadata="Urgente" checked={false} />
                  </div>
                </Card>
                <Card className="bg-[#FAF9F7] shadow-none border border-gray-100 flex flex-col h-full">
                  <h3 className="font-serif text-xl font-bold mb-4 text-[#1A1A1A]">Solicitações Diárias CC</h3>
                  <div className="flex-1 flex flex-col">
                    <textarea 
                      placeholder="Registre aqui os materiais solicitados pelo CC, faltas ou urgências de hoje..." 
                      className="w-full flex-1 min-h-[120px] p-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] resize-none transition-shadow text-[#1A1A1A] placeholder:text-gray-400 font-medium"
                    />
                    <button className="mt-4 w-full bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:border-[#A855F7] hover:text-[#A855F7] transition-colors text-sm shadow-sm flex justify-center items-center gap-2">
                       <Plus className="w-4 h-4" /> Registrar Solicitação
                    </button>
                  </div>
                </Card>
              </div>
           </div>
         )}
      </div>
    </motion.div>
  );
}

function OPMEView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-12 space-y-8">
      <HeaderBanner 
        title="Controle OPME" 
        subtitle="Entrada e Saída" 
        image="https://images.unsplash.com/photo-1542617300-3ebb68fc17f3?auto=format&fit=crop&q=80&w=2000" 
      />

      <div className="flex justify-start mb-4">
        <button className="flex items-center gap-2 bg-transparent border-2 border-gray-200 text-[#1A1A1A] hover:border-[#A855F7] hover:text-[#A855F7] px-6 py-2.5 rounded-full font-semibold text-sm transition-all">
          <Plus className="w-4 h-4" /> Registro Rápido
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <h3 className="font-serif text-2xl font-bold mb-8">Materiais Consignados</h3>
          <div className="space-y-6">
            <AestheticTaskItem title="Recebimento Kit Joelho (MedCorp)" metadata="Prioridade Máxima" checked={false} />
            <AestheticTaskItem title="Devolução Placas e Parafusos CC" metadata="Concluído 10:30" checked={true} />
            <AestheticTaskItem title="Conferência Notas Fiscais" metadata="Pendente Documentação" checked={false} />
          </div>
        </Card>

        <Card className="bg-[#FAF9F7] shadow-none border border-gray-100 flex flex-col justify-center">
          <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2">
            Observações Importantes
          </h3>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">
              Dr. Marcos agendou revisão de artroplastia para amanhã.
              Confirmar com a MedCorp o envio dos kits complementares até às 18h de hoje.
            </p>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function EquipeView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-12 space-y-8">
      <HeaderBanner 
        title="Gestão de Equipe" 
        subtitle="Escala e Responsabilidades" 
        image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=2000" 
      />

      <Card>
        <h3 className="font-serif text-2xl font-bold mb-8 flex justify-between items-center">
          Profissionais Escalados
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Turno Diurno</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EQUIPE.map(membro => (
            <div key={membro.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] transition-shadow bg-white">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F7] flex items-center justify-center text-[#A855F7] font-serif font-bold italic text-lg border border-gray-200">
                {membro.nome.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A1A1A] mb-0.5">{membro.nome}</p>
                <p className="text-xs font-semibold text-gray-400">{membro.funcao}</p>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                {membro.escala.replace('Plantão ', '')}
              </span>
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="bg-[#FAF9F7] border border-gray-100 shadow-none">
        <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
          Observações Rápidas
        </h3>
        <p className="text-sm text-[#1A1A1A]/80 leading-relaxed font-medium">
          O turno noturno cobrirá o horário de descanso da supervisora Ana das 02:00 às 03:00. Priorização de ortopedia no setor de preparo hoje, equipe realocada.
        </p>
      </Card>
    </motion.div>
  );
}

function AnotacoesView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-12 space-y-8">
      <HeaderBanner 
        title="Log do Plantão" 
        subtitle="Anotações & Fluxo" 
        image="https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=2000" 
      />

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <h3 className="font-serif text-2xl font-bold mb-8">Intercorrências do Turno</h3>
          <div className="space-y-6">
            <AestheticTaskItem title="Pendências para o próximo plantão" metadata="Repassar autoclave 2" checked={false} />
            <AestheticTaskItem title="Comunicação entre turnos" metadata="Log preenchido" checked={true} />
            
            <div className="p-5 bg-[#FAF9F7] border border-gray-100 rounded-xl mt-6">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Observação Rápida</span>
              <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed italic">
                "Notificado pequeno vazamento na tubulação da área de expurgo. Manutenção avisada, OS aberta 4902."
              </p>
            </div>
          </div>
        </Card>

        {/* Visual Flowchart - Minimalist Style */}
        <Card className="flex flex-col items-center">
          <h3 className="font-serif text-2xl font-bold mb-8 w-full text-left">Fluxograma Visual</h3>
          
          <div className="flex flex-col items-center py-6 w-full max-w-sm">
            {/* Start */}
            <div className="px-6 py-3 border border-gray-200 rounded-full font-semibold text-[13px] tracking-wide bg-white shadow-sm hover:shadow-md transition-shadow">
              Início do Fluxo
            </div>
            
            <div className="h-10 border-l border-dashed border-gray-300" />
            
            {/* Decision */}
            <div className="px-8 py-4 border-2 border-[#A855F7]/30 bg-[#F3E8FF] rounded-2xl font-serif font-bold text-[#A855F7] shadow-sm italic text-center w-4/5">
              Decisão Critica
            </div>
            
            <div className="h-10 border-l border-dashed border-gray-300" />
            
            {/* Action */}
            <div className="px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-semibold text-sm shadow-md">
              Próxima Ação
            </div>
            
            <div className="h-10 border-l border-dashed border-gray-300" />
            
            {/* End */}
            <div className="px-6 py-3 border border-gray-200 rounded-full font-semibold text-[13px] tracking-wide bg-[#FAF9F7] text-gray-400">
              Encerramento
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// -- MAIN LAYOUT -- //

type Tab = 'Dashboard' | 'Setores' | 'OPME';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  // Supabase Auth and User States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // AI Insights states
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Supabase Sync States
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'checking' | 'connected' | 'error' | 'table-missing'>('idle');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Connection configurations
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');

  // Interactive Checklist State (preserved across tab switching)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Rounds', metadata: 'Visita Técnica', checked: false },
    { id: 2, title: 'Iniciar ocorrências', metadata: 'Abertura de Chamados', checked: false },
    { id: 3, title: 'Visualizar mapa cirúrgico', metadata: 'Planejamento do Dia', checked: false },
    { id: 4, title: 'Avaliação de temperatura', metadata: 'Controle de Ambiente', checked: false },
    { id: 5, title: 'Teste de limpeza', metadata: 'Qualidade Visual', checked: false },
    { id: 6, title: 'Preenchimento da planilha', metadata: 'Fechamento/Rotina', checked: false },
    { id: 7, title: 'Organização da ocorrência', metadata: 'Triagem & Fluxo', checked: false },
    { id: 8, title: 'Fechar ocorrência', metadata: 'Resolução de Desvios', checked: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  // State for Shift occurrence notes
  const [notes, setNotes] = useState('');

  // State for daily staff roster (escala da equipe) - configurable daily
  const [escalaTexto, setEscalaTexto] = useState<string>(
    `• Amanda Maciel - Enfermeira Chefe (Plantão Diurno)\n• Higo - Técnico CME (Plantão Diurno)\n• Renata - Técnico CME (Plantão Diurno)\n• Laysa - Técnica CME (Plantão Diurno)\n• Bia - Técnica CME (Horário Comercial)\n• Laísa - Auxiliar CME (Plantão Diurno)`
  );

  // State for administrative pendencies
  const [pendencias, setPendencias] = useState<Array<{ id: string; label: string; checked: boolean }>>([
    { id: '1', label: 'Entregar relatório administrativo do dia', checked: false },
    { id: '2', label: 'Revisar controle físico de autoclave', checked: true }
  ]);

  const addPendencia = (label: string) => {
    setPendencias(prev => [...prev, { id: Date.now().toString(), label, checked: false }]);
  };

  const removePendencia = (id: string) => {
    setPendencias(prev => prev.filter(p => p.id !== id));
  };

  const togglePendencia = (id: string) => {
    setPendencias(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  };

  // Helper to safely extract column name from schema cache errors
  const extractMissingColumnName = (errorMessage: string): string | null => {
    if (!errorMessage) return null;
    const match = errorMessage.match(/Could not find the '([^']+)' column/i);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Load today's data from Supabase and test connection
  const checkConnectionAndLoad = async (forceLoad = false) => {
    setSupabaseStatus('checking');
    setSupabaseErrorMsg(null);
    const client = getSupabaseClient();
    if (!client) {
      setSupabaseStatus('error');
      setSupabaseErrorMsg('Não foi possível obter o cliente Supabase. Verifique suas credenciais.');
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      
      let data: any = null;
      let error: any = null;

      // Try full select first
      const firstRes = await client
        .from('plantao_cme')
        .select('*')
        .eq('data_plantao', todayStr)
        .maybeSingle();

      data = firstRes.data;
      error = firstRes.error;

      // If full select fails due to stale cache for newly added columns (PGRST204 / 42703)
      if (error && (error.code === 'PGRST204' || error.code === '42703' || (error.message && error.message.includes('column')))) {
        console.warn("Full SELECT failed due to schema cache mismatch, running fallback SELECT...");
        // Fallback 1: select everything EXCEPT 'insights'
        const secondRes = await client
          .from('plantao_cme')
          .select('id, data_plantao, tasks, notes, links, opme_count, opticas_count, alertas_count')
          .eq('data_plantao', todayStr)
          .maybeSingle();

        if (secondRes.error) {
          console.warn("Fallback 1 SELECT failed, running ultra-failsafe SELECT...");
          // Fallback 2: select only core columns
          const thirdRes = await client
            .from('plantao_cme')
            .select('id, data_plantao, tasks, notes')
            .eq('data_plantao', todayStr)
            .maybeSingle();

          if (!thirdRes.error) {
            data = thirdRes.data;
            error = null;
            console.log("Core SELECT succeeded!");
          } else {
            error = thirdRes.error;
          }
        } else {
          data = secondRes.data;
          error = null;
          console.log("Fallback 1 SELECT succeeded!");
        }
      }

      if (error) {
        console.error('Supabase load error:', error);
        if (error.code === '42P01') {
          setSupabaseStatus('table-missing');
          setSupabaseErrorMsg('A tabela "plantao_cme" não existe no seu banco de dados.');
        } else {
          setSupabaseStatus('error');
          setSupabaseErrorMsg(`Erro de Carregamento [${error.code || 'HTTP 400'}]: ${error.message}`);
        }
        return;
      }

      setSupabaseStatus('connected');
      setSupabaseErrorMsg(null);

      // Even if load data is blank or empty, we will merge the default checklist to make sure they are visible 
      // This solves "últimos tópicos do comece por aqui não estão aparecendo no site" completely!
      const defaultChecklist = [
        { title: 'Rounds', metadata: 'Visita Técnica' },
        { title: 'Iniciar ocorrências', metadata: 'Abertura de Chamados' },
        { title: 'Visualizar mapa cirúrgico', metadata: 'Planejamento do Dia' },
        { title: 'Avaliação de temperatura', metadata: 'Controle de Ambiente' },
        { title: 'Teste de limpeza', metadata: 'Qualidade Visual' },
        { title: 'Preenchimento da planilha', metadata: 'Fechamento/Rotina' },
        { title: 'Organização da ocorrência', metadata: 'Triagem & Fluxo' },
        { title: 'Fechar ocorrência', metadata: 'Resolução de Desvios' }
      ];

      const loadedTasks = data && data.tasks ? (typeof data.tasks === 'string' ? JSON.parse(data.tasks) : data.tasks) : null;
      const taskList = Array.isArray(loadedTasks) ? loadedTasks : [];
      let maxId = Math.max(...taskList.map((t: any) => t.id || 0), 0);
      const mergedTasks = [...taskList];

      defaultChecklist.forEach(defItem => {
        const itemExists = taskList.some(
          (t: any) => t.title && t.title.toLowerCase().trim() === defItem.title.toLowerCase().trim()
        );
        if (!itemExists) {
          maxId++;
          mergedTasks.push({
            id: maxId,
            title: defItem.title,
            metadata: defItem.metadata,
            checked: false
          });
        }
      });

      // Ensure stable ordering based on ID
      mergedTasks.sort((a, b) => (a.id || 0) - (b.id || 0));
      setTasks(mergedTasks);

      if (data) {
        if (data.notes !== undefined) {
          setNotes(data.notes || '');
        }
        if (data.insights !== undefined) {
          setEscalaTexto(data.insights || '');
        }
        if (data.links) {
          const parsedLinks = typeof data.links === 'string' ? JSON.parse(data.links) : data.links;
          if (Array.isArray(parsedLinks)) {
            const mapped = parsedLinks.map((item: any) => ({
              id: item.id || Date.now().toString(),
              label: item.label || item.title || '',
              checked: item.checked !== undefined ? item.checked : false
            }));
            setPendencias(mapped);
          }
        }
      }
    } catch (err) {
      console.error('Connection check failed:', err);
      setSupabaseStatus('error');
    }
  };

  // Save current states to Supabase with insights
  const saveToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setSupabaseStatus('error');
      setSupabaseErrorMsg('Não foi possível se conectar ao cliente Supabase. Verifique suas credenciais.');
      return;
    }

    setIsSaving(true);
    setSupabaseErrorMsg(null);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const payload: any = {
        data_plantao: todayStr,
        notes: notes,
        tasks: tasks,
        links: pendencias,
        insights: escalaTexto,
        opme_count: 4,
        opticas_count: 10,
        alertas_count: 1,
        ciclos: { A1: 0, A2: 0, A3: 0, perox: 0 }
      };

      let currentPayload = { ...payload };
      let attempt = 0;
      let success = false;
      let lastError: any = null;

      while (attempt < 5 && !success) {
        attempt++;
        const { error } = await client
          .from('plantao_cme')
          .upsert(currentPayload, { onConflict: 'data_plantao' });

        if (error) {
          lastError = error;
          console.error(`Attempt ${attempt} saving failed:`, error);

          if (error.code === 'PGRST204' || error.code === '42703' || (error.message && error.message.includes('column'))) {
            const missingCol = extractMissingColumnName(error.message);
            if (missingCol && missingCol in currentPayload) {
              console.warn(`Removing missing column '${missingCol}' from save payload and retrying...`);
              delete currentPayload[missingCol];
              continue;
            } else if (error.message.includes("Could not find the 'insights' column")) {
              console.warn("Removing 'insights' column as a fallback...");
              delete currentPayload.insights;
              continue;
            } else {
              // Try removing insights or ciclos or links if unknown
              console.warn("Attempting generic payload pruning...");
              if ('insights' in currentPayload) {
                delete currentPayload.insights;
                continue;
              }
              if ('ciclos' in currentPayload) {
                delete currentPayload.ciclos;
                continue;
              }
            }
          }
          break; // Don't loop endlessly for non-schema errors
        } else {
          success = true;
          setSupabaseStatus('connected');
          setSupabaseErrorMsg(null);
          const prunes = Object.keys(payload).filter(k => !(k in currentPayload));
          setLastSaved(new Date().toLocaleTimeString() + (prunes.length > 0 ? ` (sem colunas: ${prunes.join(', ')})` : ''));
        }
      }

      if (!success && lastError) {
        const isConflictError = 
          (lastError.code === '42P10') || 
          (lastError.message && (
            lastError.message.toLowerCase().includes('unique') || 
            lastError.message.toLowerCase().includes('on conflict') || 
            lastError.message.toLowerCase().includes('constraint')
          ));

        if (lastError.code === '42P01') {
          setSupabaseStatus('table-missing');
          setSupabaseErrorMsg('A tabela "plantao_cme" não existe no seu banco de dados.');
        } else if (isConflictError) {
          setSupabaseStatus('error');
          setSupabaseErrorMsg(
            'Falta Chave Única: Sua tabela "plantao_cme" existe, mas a coluna "data_plantao" não tem um índice UNIQUE (tipo UNIQUE ou PRIMARY KEY), o que impede o salvamento. Para corrigir, no SQL Editor do Supabase, execute: ALTER TABLE plantao_cme ADD CONSTRAINT plantao_cme_data_plantao_key UNIQUE (data_plantao);'
          );
        } else {
          setSupabaseStatus('error');
          setSupabaseErrorMsg(`Erro [${lastError.code || 'HTTP 400'}]: ${lastError.message}. ${lastError.details || ''}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to save to Supabase:', err);
      setSupabaseStatus('error');
      setSupabaseErrorMsg(`Falha de Conexão: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick helper to auto-save generated IA insights specifically 
  const saveWithAiInsight = async (insightText: string) => {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const payload: any = {
        data_plantao: todayStr,
        notes: notes,
        tasks: tasks,
        links: pendencias,
        insights: insightText,
        opme_count: 4,
        opticas_count: 10,
        alertas_count: 1,
        ciclos: { A1: 0, A2: 0, A3: 0, perox: 0 }
      };

      let attempt = 0;
      let success = false;
      let currentPayload = { ...payload };

      while (attempt < 5 && !success) {
        attempt++;
        const { error } = await client
          .from('plantao_cme')
          .upsert(currentPayload, { onConflict: 'data_plantao' });

        if (error) {
          if (error.code === 'PGRST204' || error.code === '42703' || (error.message && error.message.includes('column'))) {
            const missingCol = extractMissingColumnName(error.message);
            if (missingCol && missingCol in currentPayload) {
              delete currentPayload[missingCol];
              continue;
            } else if (error.message.includes("Could not find the 'insights' column")) {
              delete currentPayload.insights;
              continue;
            }
          }
          break;
        } else {
          success = true;
        }
      }
    } catch (err) {
      console.error('Auto-saving insight failed:', err);
    }
  };

  // Setup / reset Supabase Auth listener
  const setupAuthListener = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setCurrentUser(null);
      return;
    }
    try {
      const { data: { session } } = await client.auth.getSession();
      setCurrentUser(session?.user ?? null);

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
      });
      return subscription;
    } catch (err) {
      console.error("Error setting up auth listener:", err);
      setCurrentUser(null);
    }
  };

  // Auth Submit signup / login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsAuthLoading(true);

    const client = getSupabaseClient();
    if (!client) {
      setAuthError("Banco de dados local desconectado. Introduza as chaves do Supabase nas configurações.");
      setIsAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setAuthSuccessMsg("Cadastro feito com sucesso! Confirme em seu e-mail (ou faça login se a confirmação estiver desativa).");
        } else if (data.session) {
          setCurrentUser(data.user);
          setAuthSuccessMsg("Registrado e conectado com sucesso!");
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser(data.user);
          setAuthSuccessMsg("Login realizado com sucesso!");
        }
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
      let localizedMsg = err.message || "Erro desconhecido de autenticação.";
      if (localizedMsg.includes("Invalid login credentials") || localizedMsg.includes("invalid-credential")) {
        localizedMsg = "E-mail ou senha incorretos. Por favor, verifique.";
      } else if (localizedMsg.includes("User already registered") || localizedMsg.includes("already registered")) {
        localizedMsg = "Este e-mail já está cadastrado. Altere para 'Entrar'.";
      } else if (localizedMsg.includes("Password should be at least 6 characters")) {
        localizedMsg = "A senha deve conter no mínimo 6 caracteres.";
      } else if (localizedMsg.includes("Signup requires a valid email")) {
        localizedMsg = "E-mail inválido, verifique o formato.";
      }
      setAuthError(localizedMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
      setCurrentUser(null);
      setAiInsight('');
      setAuthSuccessMsg("Conexão encerrada com sucesso.");
    }
  };

  // Generate Gemini AI Insights
  const generateIAInsights = async () => {
    if (!currentUser) return;

    setIsGenerating(true);
    setAiError(null);

    try {
      const apiKey = typeof process !== 'undefined' ? (process.env as any).GEMINI_API_KEY : '';
      if (!apiKey) {
        throw new Error("A chave GEMINI_API_KEY do servidor não está configurada nessa sessão.");
      }
      
      const ai = new GoogleGenAI({ apiKey });

      const activeTasksStr = tasks.map(t => `- [${t.checked ? 'X' : ' '}] ${t.title} (${t.metadata})`).join('\n');
      const pendenciasStr = pendencias.map(p => `- [${p.checked ? 'X' : ' '}] ${p.label}`).join('\n');

      const prompt = `Você é um Analista de IA Especialista em CME (Central de Material e Esterilização).
Análise de forma rigorosa os detalhes do plantão de hoje descritos abaixo e prepare um relatório executivo de alta densidade técnica em português brasileiro. Use um tom clínico, focado em governança, biossegurança, otimização de ciclos e conformidade regulatória (Anvisa RDC 15).

DADOS DO PLANTÃO CME DE HOJE:
- Notas / Ocorrências registradas: "${notes || "Nenhuma ocorrência registrada no sistema até o momento."}"
- Checklists de Atividades do Dia:
${activeTasksStr}
- Pendências Administrativas Registradas:
${pendenciasStr || "Nenhuma pendência cadastrada."}
- Capacidade Básica de Operações:
  - Kits de OPME recebidos/processados: 4
  - Ópticas e endoscópios cirúrgicos conferidos: 10
  - Alertas críticos pendentes: 1

INSTRUÇÕES DO RELATÓRIO (ESCREVA EM MARKDOWN LIMPO E COMPACTO):
1. Use as seguintes divisões exatas em seu texto:
   - ### 📊 Resumo Executivo e Status Geral
     (Descreva o progresso do turno, grau de prontidão e resumo clínico do fluxo operacional.)
   - ### ⚠️ Gestão de Riscos e Gargalos
     (Identifique riscos potenciais de contaminação cruzada, atrasos em cirurgias, ou descumprimento legal devido a tarefas pendentes ou falhas descritas nas notas.)
   - ### 💡 Recomendações e Boas Práticas (RDC 15)
     (Prescreva recomendações baseadas no manual de boas práticas de processamento de produtos de saúde e biossegurança hospitalar.)
   - ### 📋 Plano de Intervenção de 3 Passos
     1. Passo 1 de alta prioridade...
     2. Passo 2 de média prioridade...
     3. Passo 3 de rotina de enceramento...
     
Seja prático e cirúrgico na sua linguagem. Evite explicações redundantes. Forneça valor real para enfermeiros chefes e supervisores cirúrgicos.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (response.text) {
        setAiInsight(response.text);
        // Save the insight instantly to Supabase
        await saveWithAiInsight(response.text);
      } else {
        throw new Error("O modelo Gemini retornou uma resposta sem texto.");
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setAiError(err.message || "Falha técnica ao falar com a API do Gemini. Verifique a chave de ambiente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    setShowCredentialsModal(false);
    setTimeout(() => {
      checkConnectionAndLoad(true);
      setupAuthListener();
    }, 100);
  };

  useEffect(() => {
    const { rawUrl, anonKey } = getSupabaseCredentials();
    setSupabaseUrlInput(rawUrl);
    setSupabaseKeyInput(anonKey);

    checkConnectionAndLoad();
    setupAuthListener();
  }, []);

  const menuItems: { id: Tab, icon: React.ElementType, label: string }[] = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Painel Inicial' },
    { id: 'Setores', icon: Layers, label: 'Sub-setores' },
    { id: 'OPME', icon: Package, label: 'Área OPME' },
  ];

  return (
    <div className="min-h-screen flex bg-[#F6F5F2] font-sans text-[#1A1A1A]">
      
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#F6F5F2] border-r border-gray-200 hidden lg:flex flex-col z-50">
        <div className="px-8 py-10">
          <h1 className="font-serif text-[28px] font-bold tracking-tight text-[#1A1A1A]">
            minha<span className="text-[#A855F7] italic font-medium">cme</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-5 mt-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm tracking-wide",
                activeTab === item.id 
                  ? "bg-white text-[#A855F7] shadow-[0_4px_16px_rgb(0,0,0,0.03)]" 
                  : "text-gray-500 hover:text-[#1A1A1A] hover:bg-black/5"
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Supabase status inside Sidebar */}
        <div className="px-5 mb-4 mt-auto">
          <div className="p-4 bg-white/70 border border-gray-200/60 rounded-2xl text-xs space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A1A1A] flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-[#A855F7]" /> Supabase Sync
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                supabaseStatus === 'connected' && "bg-emerald-100 text-emerald-800",
                supabaseStatus === 'checking' && "bg-amber-100 text-amber-800",
                supabaseStatus === 'table-missing' && "bg-rose-100 text-rose-800",
                supabaseStatus === 'error' && "bg-amber-100/50 text-amber-800"
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  supabaseStatus === 'connected' && "bg-emerald-500",
                  supabaseStatus === 'checking' && "bg-amber-500",
                  supabaseStatus === 'table-missing' && "bg-rose-500",
                  supabaseStatus === 'error' && "bg-amber-500"
                )} />
                {supabaseStatus === 'connected' && 'Online'}
                {supabaseStatus === 'checking' && 'Buscando...'}
                {supabaseStatus === 'table-missing' && 'Falta Tabela'}
                {supabaseStatus === 'error' && 'Sem Conexão'}
              </span>
            </div>

            {supabaseStatus === 'table-missing' && (
              <p className="text-gray-500 leading-normal font-medium text-[10px]">
                Tabela <code className="font-mono bg-red-50 text-rose-600 px-1 rounded">plantao_cme</code> ausente. Clique em <strong className="text-[#A855F7] cursor-pointer underline" onClick={() => setShowSqlModal(true)}>SQL</strong> para copiar o script de criação.
              </p>
            )}

            {supabaseStatus === 'connected' && (
              <div className="text-[10px] font-medium text-gray-500">
                {lastSaved ? `Salvo às: ${lastSaved}` : 'Dados estão sincronizados.'}
              </div>
            )}

            {supabaseStatus === 'error' && (
              <div className="space-y-1.5">
                <p className="text-gray-500 leading-normal font-medium text-[10px]">
                  Erro de sincronização ou credenciais.
                </p>
                {supabaseErrorMsg && (
                  <div className="text-[10px] bg-rose-50 border border-rose-150 text-rose-700 p-2 rounded-xl font-medium leading-relaxed max-h-32 overflow-y-auto break-words">
                    {supabaseErrorMsg}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button 
                onClick={() => setShowSqlModal(true)}
                className="py-1.5 border border-gray-200 hover:border-[#A855F7]/30 hover:bg-[#F3E8FF]/30 text-gray-650 hover:text-[#A855F7] rounded-xl font-bold text-center flex items-center justify-center gap-1 transition-all text-[11px]"
                title="Ver Script SQL"
              >
                <Code className="w-3.5 h-3.5" /> SQL Script
              </button>
              
              <button 
                onClick={saveToSupabase}
                disabled={isSaving || supabaseStatus === 'checking' || supabaseStatus === 'table-missing'}
                className={cn(
                  "py-1.5 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1 transition-all shadow-sm text-[11px]",
                  (isSaving || supabaseStatus === 'checking' || supabaseStatus === 'table-missing')
                    ? "bg-gray-300 cursor-not-allowed text-gray-500" 
                    : "bg-[#A855F7] hover:bg-[#9333EA] active:scale-95 cursor-pointer"
                )}
              >
                {isSaving ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Sincronizar
              </button>
            </div>
            
            <button
              onClick={() => setShowCredentialsModal(true)}
              className="w-full text-center text-[10px] text-gray-400 hover:text-[#A855F7] hover:underline font-medium block mt-1"
            >
              Configurar Credenciais
            </button>
          </div>
        </div>

        {/* User Profile / Auth Status in Sidebar */}
        <div className="px-5 mb-4">
          {currentUser ? (
            <div className="p-3 bg-white border border-gray-200/80 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7] font-bold uppercase text-xs border border-[#A855F7]/20 shrink-0 select-none">
                {currentUser.email?.charAt(0) || "U"}
              </div>
              <div className="flex-grow min-w-0 pr-1 text-left">
                <p className="text-[11px] font-bold text-[#1A1A1A] truncate" title={currentUser.email}>{currentUser.email}</p>
                <p className="text-[10px] text-[#A855F7] font-bold uppercase tracking-wider">Profissional CME</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowCredentialsModal(true)}
              className="w-full p-3 bg-gradient-to-r from-[#A855F7]/5 to-[#9333EA]/5 border border-[#A855F7]/20 hover:border-[#A855F7]/50 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#A855F7] hover:bg-[#F3E8FF]/20 transition-all shadow-sm cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-[#A855F7]" /> Conectar ao Supabase
            </button>
          )}
        </div>

        <div className="p-6">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-transparent border-2 border-gray-200 text-[#1A1A1A] hover:bg-white hover:border-[#A855F7]/30 transition-all font-semibold text-sm tracking-wide group">
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#A855F7]" strokeWidth={2.5} />
            Novo Registro
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 relative min-h-screen overflow-x-hidden">
        <div className="max-w-[1200px] mx-auto p-6 md:p-10 lg:p-12 w-full">
          {/* Top Bar for Mobile */}
          <div className="lg:hidden flex flex-col gap-3.5 mb-8 bg-white p-4.5 rounded-2xl border border-gray-150/80 shadow-sm">
            <div className="flex justify-between items-center">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1A1A1A]">
                minha<span className="text-[#A855F7] italic">cme</span>
              </h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCredentialsModal(true)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#1A1A1A] rounded-xl text-xs font-bold border border-gray-200 flex items-center gap-1 transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-[#A855F7]" /> Supabase
                </button>
                <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-150">
                  <Bell className="w-5 h-5 text-[#1A1A1A]" />
                </button>
              </div>
            </div>
            
            {/* Sync status row shown on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  supabaseStatus === 'connected' && "bg-emerald-500",
                  supabaseStatus === 'checking' && "bg-amber-500",
                  supabaseStatus === 'table-missing' && "bg-rose-500",
                  supabaseStatus === 'error' && "bg-amber-500"
                )} />
                <span className="font-semibold text-gray-500">
                  {supabaseStatus === 'connected' && (lastSaved ? `Sincronizado: ${lastSaved}` : 'Dados Sincronizados')}
                  {supabaseStatus === 'checking' && 'Buscando conexão...'}
                  {supabaseStatus === 'table-missing' && 'Falta tabela plantao_cme'}
                  {supabaseStatus === 'error' && 'Conexão offline/erro'}
                </span>
              </div>
              
              <div className="flex gap-2 items-center">
                {supabaseStatus === 'table-missing' && (
                  <button 
                    type="button"
                    onClick={() => setShowSqlModal(true)}
                    className="text-[11px] text-[#A855F7] hover:underline font-bold px-1 py-0.5"
                  >
                    Ver SQL
                  </button>
                )}
                <button 
                  type="button"
                  onClick={saveToSupabase}
                  disabled={isSaving || supabaseStatus === 'checking' || supabaseStatus === 'table-missing'}
                  className={cn(
                    "px-3 py-1.5 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1",
                    (isSaving || supabaseStatus === 'checking' || supabaseStatus === 'table-missing')
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                      : "bg-[#A855F7] hover:bg-[#9333EA] active:scale-95 shadow-sm cursor-pointer"
                  )}
                >
                  {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Sincronizar
                </button>
              </div>
            </div>
            
            {supabaseStatus === 'table-missing' && (
              <p className="text-[10px] text-rose-600 font-medium leading-relaxed bg-rose-50/50 p-2 rounded-lg border border-rose-100/30">
                A tabela do banco de dados não existe. Toque em <strong>Ver SQL</strong> acima, copie o código e execute no editor SQL do Supabase.
              </p>
            )}

            {supabaseStatus === 'error' && supabaseErrorMsg && (
              <div className="text-[10px] text-rose-600 font-medium leading-relaxed bg-rose-50/50 p-2.5 rounded-lg border border-rose-150 break-words">
                <strong>Erro de sincronização:</strong> {supabaseErrorMsg}
              </div>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' && (
              <DashboardView 
                key="dashboard"
                tasks={tasks}
                toggleTask={toggleTask}
                notes={notes}
                setNotes={setNotes}
                escalaTexto={escalaTexto}
                setEscalaTexto={setEscalaTexto}
                pendencias={pendencias}
                addPendencia={addPendencia}
                togglePendencia={togglePendencia}
                removePendencia={removePendencia}
              />
            )}
            {activeTab === 'Setores' && <SetoresView key="setores" />}
            {activeTab === 'OPME' && <OPMEView key="opme" />}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 flex items-center justify-around py-3 pb-safe z-50">
        {menuItems.map(item => {
          const shortLabel = 
            item.id === 'Dashboard' ? 'Painel' : 
            item.id === 'Setores' ? 'Setores' : 'OPME';
            
          return (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors flex-1 min-w-0 px-1",
                activeTab === item.id ? "text-[#A855F7]" : "text-gray-400 hover:text-[#1A1A1A]"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-[9px] font-bold tracking-tight uppercase truncate max-w-full text-center">
                {shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* SQL MODAL */}
      <AnimatePresence>
        {showSqlModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-[999]"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative border border-gray-100 space-y-6 flex flex-col max-h-[85vh]"
            >
              <button 
                onClick={() => { setShowSqlModal(false); setCopiedSql(false); }}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2 pr-10">
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] flex items-center gap-2 text-left">
                  <Code className="w-5 h-5 text-[#A855F7]" /> Script SQL para o Supabase
                </h3>
                <p className="text-sm text-gray-500 text-left">
                  Copie o código abaixo e cole no <strong>SQL Editor</strong> do painel do seu Supabase para criar a estrutura correta de tabelas.
                </p>
              </div>

              <div className="relative flex-1 min-h-[150px] overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-900 text-gray-200 mt-2">
                <pre className="p-4 overflow-auto text-xs font-mono h-full max-h-[40vh] leading-relaxed text-left select-all">
                  {SUPABASE_SQL_SETUP}
                </pre>
                
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-900 hover:bg-[#F3E8FF] hover:text-[#A855F7] text-xs font-bold transition-all shadow-md select-none border border-gray-100"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar SQL
                    </>
                  )}
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs font-medium text-amber-800 flex gap-2 text-left">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block mb-0.5 text-amber-900">Como executar no Supabase:</strong>
                  1. Acesse seu painel no Supabase &gt; Vá em <strong>SQL Editor</strong> (ícone de terminal) &gt; Clique em <strong>New Query</strong>.<br />
                  2. Cole o código copiado acima e clique no botão <strong>Run</strong> (Executar) no canto inferior.<br />
                  <span className="italic font-normal block mt-1 text-amber-700">*Não cole este código TypeScript no Supabase! Use estritamente o botão de copiar acima para obter apenas o código SQL puro de criação de tabela.</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { setShowSqlModal(false); setCopiedSql(false); }}
                  className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREDENTIALS MODAL */}
      <AnimatePresence>
        {showCredentialsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 z-[999] overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative border border-gray-150 grid md:grid-cols-12 gap-8 text-left"
            >
              <button 
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-rose-500 hover:bg-rose-50 transition-all z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Connection Guide & Diagnostics */}
              <div className="md:col-span-7 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    Entenda a Conexão Offline / Erro
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                      Como sincronizar seu banco?
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Por padrão, o app utiliza <strong className="text-gray-900 font-bold">credenciais fictícias de simulação</strong> (<code className="bg-gray-100 px-1 py-0.5 rounded text-rose-500">sb_publishable_...</code>). Como estes servidores não existem de verdade, as chamadas retornam <span className="font-semibold text-rose-600">Erro de Conexão DNS/Permissão</span>.
                    </p>
                  </div>

                  <div className="space-y-3.5 pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Passo a Passo de Solução</p>
                    
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#A855F7]/10 flex items-center justify-center text-[10px] font-bold text-[#A855F7] shrink-0 mt-0.5">1</div>
                      <p className="text-xs text-gray-650 leading-relaxed font-medium">
                        <strong className="text-gray-950 font-bold">Crie uma conta gratuita</strong> no <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#A855F7] hover:underline font-bold inline-flex items-center gap-0.5">Supabase <ExternalLink className="w-3 h-3" /></a> e crie um novo projeto (leva 1 minuto).
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#A855F7]/10 flex items-center justify-center text-[10px] font-bold text-[#A855F7] shrink-0 mt-0.5">2</div>
                      <p className="text-xs text-gray-650 leading-relaxed font-medium">
                        Acesse as configurações do projeto em <strong className="text-gray-950 font-bold">Project Settings &rsaquo; API</strong>, e copie os campos:
                        <span className="block mt-1 font-semibold text-[#1A1A1A] font-mono text-[10px] bg-gray-50 p-1.5 rounded border border-gray-100">
                          • Project URL<br />
                          • anon public API key
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#A855F7]/10 flex items-center justify-center text-[10px] font-bold text-[#A855F7] shrink-0 mt-0.5">3</div>
                      <p className="text-xs text-gray-650 leading-relaxed font-medium">
                        <strong className="text-gray-950 font-bold">Execute o Script SQL:</strong> clique no botão de copiar o script SQL em nosso painel, abra o <strong className="text-gray-950 font-bold">SQL Editor</strong> do Supabase, cole o código lá e clique em <strong className="text-emerald-600 font-bold">Run</strong> para construir a tabela automaticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#F3E8FF]/30 border border-[#A855F7]/15 rounded-2xl flex items-start gap-2.5">
                  <Database className="w-5 h-5 text-[#A855F7] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-600 leading-normal font-medium">
                    Todas as informações salvas no seu Supabase serão sincronizadas instantaneamente, permitindo que você acompanhe o painel de qualquer dispositivo!
                  </p>
                </div>
              </div>

              {/* Right Column: Connection Form */}
              <form 
                onSubmit={saveCredentials}
                className="md:col-span-5 flex flex-col justify-between pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-150 md:pl-8 space-y-6"
              >
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">Insera suas credenciais</h4>
                    <p className="text-[11px] text-gray-450 font-semibold uppercase tracking-wider">Configuração de Chaves</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">SUPABASE URL</label>
                      <input 
                        type="text" 
                        placeholder="https://suaconta.supabase.co" 
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] font-medium transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">SUPABASE ANON KEY</label>
                      <textarea 
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-xl text-[10px] font-mono focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] transition-colors leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCredentialsModal(false)}
                    className="px-4 py-3 border border-gray-250 text-gray-500 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-gradient-to-r from-[#A855F7] to-[#9333EA] text-white font-bold text-xs rounded-xl transition-all hover:opacity-95 shadow-md hover:shadow-lg active:scale-95 cursor-pointer text-center flex-1"
                  >
                    Salvar e Conectar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -- AI INSIGHTS & USER AUTH SECTION VIEW -- //

interface InsightsViewProps {
  key?: string;
  currentUser: any;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (password: string) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  isAuthLoading: boolean;
  authError: string | null;
  authSuccessMsg: string | null;
  setAuthError: (error: string | null) => void;
  setAuthSuccessMsg: (msg: string | null) => void;
  handleAuthSubmit: (e: React.FormEvent) => void;
  handleSignOut: () => void;
  aiInsight: string;
  isGenerating: boolean;
  aiError: string | null;
  generateIAInsights: () => void;
  setAiInsight: (v: string) => void;
  notes: string;
  tasks: any[];
  links: any[];
  saveToSupabase: () => void;
}

function InsightsView({
  currentUser,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authMode,
  setAuthMode,
  isAuthLoading,
  authError,
  authSuccessMsg,
  setAuthError,
  setAuthSuccessMsg,
  handleAuthSubmit,
  handleSignOut,
  aiInsight,
  isGenerating,
  aiError,
  generateIAInsights,
  setAiInsight,
  notes,
  tasks,
  links,
  saveToSupabase
}: InsightsViewProps) {
  const [copied, setCopied] = useState(false);
  const [loaderMessageIndex, setLoaderMessageIndex] = useState(0);

  const loaderMessages = [
    "Consolidando checklists de atividades do turno...",
    "Examinando intercorrências e anotações registradas...",
    "Analisando parâmetros de OPME e ópticas cirúrgicas...",
    "Comparando processos com normativas Anvisa RDC 15...",
    "Consultando base clínica e gerando recomendações...",
    "Estruturando plano de ação corretivo de 3 passos..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoaderMessageIndex(0);
      interval = setInterval(() => {
        setLoaderMessageIndex(prev => (prev + 1) % loaderMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleCopy = () => {
    if (!aiInsight) return;
    navigator.clipboard.writeText(aiInsight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Simple Markdown clinical-report structured parser for a highly crafted finish
  const parseClinicalReport = (rawText: string) => {
    if (!rawText) return null;

    const sections = rawText.split("###");
    const formattedSections: { title: string; items: string[]; type: 'resumo' | 'riscos' | 'pratica' | 'plano' | 'default' }[] = [];

    // Filter and build structured blocks
    sections.forEach(sec => {
      const trimmed = sec.trim();
      if (!trimmed) return;

      const lines = trimmed.split("\n");
      const titleLine = lines[0].trim();
      const contentLines = lines.slice(1);

      const items: string[] = [];
      contentLines.forEach(line => {
        const cleaned = line.trim();
        if (cleaned.startsWith("-") || cleaned.startsWith("*")) {
          // It's a bullet point
          items.push(cleaned.replace(/^[-*]\s*/, '').trim());
        } else if (cleaned.match(/^\d+\./)) {
          // It's a numbered point
          items.push(cleaned.replace(/^\d+\.\s*/, '').trim());
        } else if (cleaned) {
          items.push(cleaned);
        }
      });

      let type: 'resumo' | 'riscos' | 'pratica' | 'plano' | 'default' = 'default';
      const lowercaseTitle = titleLine.toLowerCase();
      if (lowercaseTitle.includes("resumo") || lowercaseTitle.includes("status")) {
        type = 'resumo';
      } else if (lowercaseTitle.includes("risco") || lowercaseTitle.includes("gargalo")) {
        type = 'riscos';
      } else if (lowercaseTitle.includes("recomenda") || lowercaseTitle.includes("prática") || lowercaseTitle.includes("rdc")) {
        type = 'pratica';
      } else if (lowercaseTitle.includes("plano") || lowercaseTitle.includes("passo") || lowercaseTitle.includes("intervenção")) {
        type = 'plano';
      }

      formattedSections.push({
        title: titleLine,
        items,
        type
      });
    });

    return (
      <div className="space-y-8 print:p-0">
        {formattedSections.map((sec, idx) => {
          const isResumo = sec.type === 'resumo';
          const isRisgos = sec.type === 'riscos';
          const isPratica = sec.type === 'pratica';
          const isPlano = sec.type === 'plano';

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-6 rounded-3xl border text-left shadow-sm transition-all hover:shadow-md",
                isResumo && "bg-emerald-50/45 border-emerald-100",
                isRisgos && "bg-rose-50/45 border-rose-100",
                isPratica && "bg-purple-50/45 border-purple-100",
                isPlano && "bg-indigo-50/45 border-indigo-100",
                sec.type === 'default' && "bg-white border-gray-150"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                  isResumo && "bg-emerald-500 text-white",
                  isRisgos && "bg-rose-500 text-white",
                  isPratica && "bg-purple-500 text-white",
                  isPlano && "bg-indigo-500 text-white",
                  sec.type === 'default' && "bg-gray-100 text-gray-600"
                )}>
                  {isResumo && <Activity className="w-5 h-5" />}
                  {isRisgos && <AlertTriangle className="w-5 h-5" />}
                  {isPratica && <Shield className="w-5 h-5" />}
                  {isPlano && <CheckCircle2 className="w-5 h-5" />}
                  {sec.type === 'default' && <Brain className="w-5 h-5" />}
                </div>
                <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                  {sec.title}
                </h4>
              </div>

              <div className="space-y-3 pl-1">
                {sec.items.map((item, itemIdx) => {
                  const cleanedItem = item.replace(/\*\*/g, ''); // strip markdown bold syntax if any for simple UI display
                  const originalBoldMatches = item.match(/\*\*(.*?)\*\*/);
                  const boldPart = originalBoldMatches ? originalBoldMatches[1] : '';
                  const afterBoldPart = boldPart ? cleanedItem.replace(boldPart, '') : cleanedItem;

                  return (
                    <div key={itemIdx} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 font-medium">
                      <span className={cn(
                        "mt-[5px] w-2 h-2 rounded-full shrink-0",
                        isResumo && "bg-emerald-400",
                        isRisgos && "bg-rose-400",
                        isPratica && "bg-purple-400",
                        isPlano && "bg-indigo-400",
                        sec.type === 'default' && "bg-gray-400"
                      )} />
                      <p>
                        {boldPart ? (
                          <>
                            <strong className="text-gray-900 font-bold">{boldPart}</strong>
                            {afterBoldPart}
                          </>
                        ) : cleanedItem}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Calculate stats for current turn info
  const completedTasksCount = tasks.filter(t => t.checked).length;
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  // Render Auth Lock screen if user is not authenticated
  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0 }} 
        className="pb-12 max-w-xl mx-auto space-y-8 pt-6 select-none"
      >
        <div className="text-center space-y-3.5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#A855F7] to-[#9333EA] shadow-xl text-white mb-2">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Controle de IA da CME
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto font-medium leading-relaxed">
            Tenha acesso a relatórios integrados, análise de tendências operacionais, identificação automática de gargalos biológicos e conformações recomendadas de RDC 15.
          </p>
        </div>

        <Card className="shadow-2xl border border-gray-150 p-6 md:p-8">
          {/* Auth mode selector tabs */}
          <div className="flex border-b border-gray-100 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(null); setAuthSuccessMsg(null); }}
              className={cn(
                "flex-1 pb-4 text-sm font-bold border-b-2 tracking-wider transition-all",
                authMode === 'login' ? "border-[#A855F7] text-[#A855F7]" : "border-transparent text-gray-400"
              )}
            >
              Fazer Login
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthSuccessMsg(null); }}
              className={cn(
                "flex-1 pb-4 text-sm font-bold border-b-2 tracking-wider transition-all",
                authMode === 'signup' ? "border-[#A855F7] text-[#A855F7]" : "border-transparent text-gray-400"
              )}
            >
              Criar Conta Grátis
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 leading-none">
                <Mail className="w-3.5 h-3.5" /> E-mail Profissional
              </label>
              <input 
                type="email" 
                placeholder="nome@hospital.com" 
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                disabled={isAuthLoading}
                className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] font-medium transition-colors"
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1.5 leading-none">
                <Key className="w-3.5 h-3.5" /> Senha Segura
              </label>
              <input 
                type="password" 
                placeholder="••••••" 
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                disabled={isAuthLoading}
                className="w-full px-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#A855F7] text-[#1A1A1A] font-medium transition-colors"
                minLength={6}
              />
            </div>

            {authError && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 leading-relaxed font-semibold text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 leading-relaxed font-semibold text-left flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-4.5 bg-gradient-to-r from-[#A855F7] to-[#9333EA] hover:opacity-95 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-200 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
            >
              {isAuthLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Garantindo credenciais...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {authMode === 'login' ? "Entrar na Minha CME" : "Registrar Minha Conta"}
                </>
              )}
            </button>
          </form>
        </Card>

        {/* Security / HIPAA compliance note */}
        <div className="flex items-center justify-center gap-2 bg-gray-100 p-4 rounded-2xl text-[10px] text-gray-400 font-semibold uppercase tracking-wider border border-gray-150 max-w-sm mx-auto">
          <Shield className="w-4 h-4 text-[#A855F7]" /> Ambientes Criptografados de Acordo com a LGPD
        </div>
      </motion.div>
    );
  }

  // Render main AI insights center when authenticated
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-12 space-y-8">
      <HeaderBanner 
        title="IA Insights" 
        subtitle="Inteligência do Plantão" 
        image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000" 
      />

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Operations controller inputs status panel */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <Card className="text-left flex flex-col h-full justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#A855F7]" /> Metadados Ativos
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-medium italic">
                  Compilação atual do plantão que será avaliada pelo motor generativo de IA.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Check diário finalizado</span>
                    <strong className="text-base text-[#1A1A1A] font-bold">{completedTasksCount} de {tasks.length} atividades</strong>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#A855F7] bg-[#F3E8FF] px-2.5 py-1 rounded-full">
                    {Math.round((completedTasksCount / tasks.length) * 100)}%
                  </span>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Ocorrências do turno</span>
                  {wordCount > 0 ? (
                    <p className="text-xs text-gray-800 font-semibold mt-1">
                      {wordCount} palavras registradas no painel.
                    </p>
                  ) : (
                    <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Nenhuma anotação de turno registrada.
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex gap-6">
                  <div>
                    <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">OPME Hoje</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">4 kits</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">Ópticas</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">10 unid</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">Alertas ativos</span>
                    <span className="text-sm font-bold text-rose-500">1 pendência</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
              <button
                onClick={generateIAInsights}
                disabled={isGenerating}
                className={cn(
                  "w-full py-4 bg-gradient-to-r from-[#A855F7] to-[#9333EA] text-white rounded-2xl text-sm font-bold shadow-xl transition-all shadow-purple-150 flex items-center justify-center gap-2 select-none cursor-pointer",
                  isGenerating ? "opacity-90" : "hover:translate-y-[-1px] hover:shadow-2xl"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando Análise...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {aiInsight ? "Regerar Insights de IA" : "Gerar Insights do Plantão"}
                  </>
                )}
              </button>

              <button
                onClick={saveToSupabase}
                className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-650 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-gray-400" />
                Sincronizar Dados no Banco
              </button>
            </div>
          </Card>
        </div>

        {/* Dynamic scanning diagnostic loader and report printer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="text-left relative flex flex-col h-full max-h-[80vh] overflow-hidden">
            
            {/* Action Bar Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150/60 mb-6 shrink-0">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  Relatório de Direcionamento IA
                </h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  Análise baseada em governança hospitalar
                </p>
              </div>

              {aiInsight && !isGenerating && (
                <div className="flex items-center gap-2.5 print:hidden">
                  <button 
                    onClick={handleCopy}
                    className="p-2 border border-gray-200 rounded-xl hover:border-[#A855F7] hover:text-[#A855F7] text-gray-500 hover:bg-[#F3E8FF]/20 transition-all shadow-sm"
                    title="Copiar texto puro"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="p-2 border border-gray-200 rounded-xl hover:border-[#A855F7] hover:text-[#A855F7] text-gray-500 hover:bg-[#F3E8FF]/20 transition-all shadow-sm flex items-center gap-1.5 px-3"
                    title="Imprimir relatório"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="text-xs font-bold leading-none hidden sm:inline">Imprimir</span>
                  </button>
                </div>
              )}
            </div>

            {/* Main scrollable view */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isGenerating ? (
                /* Beautiful animated diagnostic scanner */
                <div className="flex flex-col items-center justify-center py-16 px-4 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-[#F3E8FF] border-2 border-[#A855F7]/30 flex items-center justify-center shadow-lg relative overflow-hidden select-none">
                      <Brain className="w-10 h-10 text-[#A855F7] animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#A855F7]/10 via-transparent to-transparent animate-bounce h-1/2 w-full" />
                    </div>
                    {/* Glowing outer circles */}
                    <div className="absolute -inset-4 border border-[#A855F7]/10 rounded-full animate-ping h-28 w-28 -m-4 opacity-50" />
                  </div>

                  <div className="space-y-2 text-center max-w-sm">
                    <h4 className="text-sm font-bold text-[#1A1A1A]">
                      Análise Inteligente Em Andamento...
                    </h4>
                    
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loaderMessageIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-[#A855F7] font-semibold h-8"
                      >
                        {loaderMessages[loaderMessageIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              ) : aiError ? (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-xs space-y-4 text-rose-700 leading-relaxed font-semibold">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <strong className="block text-rose-900">Falha ao Gerar Relatório de IA:</strong>
                      <p>{aiError}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-rose-500 italic font-medium leading-normal border-t border-rose-100/40 pt-2.5">
                    *Nota: Certifique-se de que os cookies de terceiros estão permitidos no seu navegador, ou conecte suas credenciais do Supabase para garantir permissões de escrita seguras.
                  </p>
                </div>
              ) : aiInsight ? (
                /* Structured Clean clinical report layout */
                <div className="print:block">
                  {parseClinicalReport(aiInsight)}

                  {currentUser && (
                    <p className="mt-8 text-[11px] text-gray-450 text-center font-bold font-mono tracking-widest uppercase py-4 border-t border-gray-150/50 print:block">
                      Emissor: {currentUser.email} • Sistema Minha CME IA • {new Date().toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                /* Elegant Zero-state */
                <div className="py-20 px-6 text-center space-y-4 max-w-sm mx-auto select-none">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-150/85 flex items-center justify-center text-gray-400 mx-auto">
                    <Sparkles className="w-6 h-6 text-gray-300" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      Nenhum Insights Ativo
                    </h4>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                      Preencha suas ocorrências diárias na aba do <strong>Log do Plantão</strong> ou marque as tarefas finalizadas no <strong>Painel Inicial</strong>, então clique no botão ao lado para emitir a síntese clínica e gerir desvios do plantão.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
