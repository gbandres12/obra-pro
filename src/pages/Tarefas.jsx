import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CriarTarefaModal from '../components/tarefas/CriarTarefaModal';

const TarefaCard = ({ tarefa, obra, onEdit, onConcluir }) => {
  const isConcluida = tarefa.status === 'concluida';
  const dataValida = tarefa.data_hora && !isNaN(new Date(tarefa.data_hora).getTime());

  return (
    <Card className={`transition-all duration-300 ${isConcluida ? 'bg-gray-50 opacity-70' : 'hover:shadow-md'}`}>
      <CardContent className="p-4 flex items-start gap-4">
        <div className="flex flex-col items-center min-w-[60px]">
          {dataValida ? (
            <>
              <div className="text-sm font-bold text-emerald-600">
                {format(new Date(tarefa.data_hora), 'dd')}
              </div>
              <div className="text-xs text-gray-500 uppercase">
                {format(new Date(tarefa.data_hora), 'MMM', { locale: ptBR })}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(tarefa.data_hora), 'HH:mm')}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400 italic">S/ Data</div>
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${isConcluida && 'line-through'}`}>{tarefa.titulo}</h4>
          {tarefa.descricao && <p className="text-sm text-gray-600">{tarefa.descricao}</p>}
          {obra && <Badge variant="outline" className="mt-2">{obra.nome}</Badge>}
        </div>
        <div className="flex flex-col gap-2">
          {!isConcluida && (
            <>
              <Button size="icon" variant="ghost" onClick={() => onEdit(tarefa)}><Edit className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => onConcluir(tarefa)}><Check className="w-4 h-4 text-emerald-600" /></Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function TarefasPage() {
  const [obras, setObras] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [obrasData, tarefasData] = await Promise.all([
        base44.entities.Obra.list().catch(e => { console.error(e); return []; }),
        base44.entities.TarefaEngenheiro.list('-data_hora').catch(e => { console.error(e); return []; })
      ]);
      setObras(Array.isArray(obrasData) ? obrasData : []);
      setTarefas(Array.isArray(tarefasData) ? tarefasData : []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
    setIsLoading(false);
  };

  const handleSaveTarefa = async (data) => {
    if (editingTarefa) {
      await base44.entities.TarefaEngenheiro.update(editingTarefa.id, data);
    } else {
      await base44.entities.TarefaEngenheiro.create(data);
    }
    setEditingTarefa(null);
    setShowCreateModal(false);
    loadData();
  };

  const handleConcluir = async (tarefa) => {
    await base44.entities.TarefaEngenheiro.update(tarefa.id, { ...tarefa, status: 'concluida' });
    loadData();
  };

  const tarefasAgrupadas = (tarefas || []).reduce((acc, tarefa) => {
    const d = tarefa.data_hora ? new Date(tarefa.data_hora) : null;
    if (!d || isNaN(d.getTime())) return acc;
    const key = format(d, 'yyyy-MM-dd');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tarefa);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tarefas do Engenheiro</h1>
        <Button onClick={() => setShowCreateModal(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      {isLoading ? <p>Carregando...</p> : (
        <div className="space-y-6">
          {Object.entries(tarefasAgrupadas).map(([data, tarefasDoDia]) => (
            <div key={data}>
              <h3 className="font-bold mb-2 pl-2 border-l-4 border-emerald-500">
                {format(new Date(data), 'EEEE, dd \'de\' MMMM', { locale: ptBR })}
              </h3>
              <div className="space-y-2">
                {tarefasDoDia.map(tarefa => (
                  <TarefaCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    obra={obras.find(o => o.id === tarefa.obra_id)}
                    onEdit={setEditingTarefa}
                    onConcluir={handleConcluir}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CriarTarefaModal
        isOpen={showCreateModal || !!editingTarefa}
        onClose={() => { setShowCreateModal(false); setEditingTarefa(null); }}
        onSubmit={handleSaveTarefa}
        obras={obras}
        tarefa={editingTarefa}
      />
    </div>
  );
}