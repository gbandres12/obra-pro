import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Save, X } from 'lucide-react';

export default function CriarEtapaModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  etapa, 
  obras, 
  isEditing,
  obraIdPredefinida 
}) {
  const [formData, setFormData] = useState({
    obra_id: obraIdPredefinida || '',
    nome_etapa: '',
    descricao: '',
    progresso: 0,
    status: 'pendente',
    data_inicio_prevista: '',
    data_fim_prevista: '',
    observacoes: '',
    ordem: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (etapa && isEditing) {
      setFormData({
        obra_id: etapa.obra_id || obraIdPredefinida || '',
        nome_etapa: etapa.nome_etapa || '',
        descricao: etapa.descricao || '',
        progresso: etapa.progresso || 0,
        status: etapa.status || 'pendente',
        data_inicio_prevista: etapa.data_inicio_prevista || '',
        data_fim_prevista: etapa.data_fim_prevista || '',
        data_inicio_real: etapa.data_inicio_real || '',
        data_fim_real: etapa.data_fim_real || '',
        observacoes: etapa.observacoes || '',
        ordem: etapa.ordem || 1
      });
    } else if (!isEditing) {
      setFormData({
        obra_id: obraIdPredefinida || '',
        nome_etapa: '',
        descricao: '',
        progresso: 0,
        status: 'pendente',
        data_inicio_prevista: '',
        data_fim_prevista: '',
        observacoes: '',
        ordem: 1
      });
    }
  }, [etapa, isEditing, isOpen, obraIdPredefinida]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      progresso: parseInt(formData.progresso) || 0,
      ordem: parseInt(formData.ordem) || 1
    };

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao salvar etapa:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            {isEditing ? 'Editar Etapa' : 'Nova Etapa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="obra_id">Obra *</Label>
              <Select
                value={formData.obra_id}
                onValueChange={(value) => handleChange('obra_id', value)}
                disabled={!!obraIdPredefinida}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {obras.map(obra => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="nome_etapa">Nome da Etapa *</Label>
              <Input
                id="nome_etapa"
                value={formData.nome_etapa}
                onChange={(e) => handleChange('nome_etapa', e.target.value)}
                placeholder="Ex: Fundação, Estrutura, Cobertura..."
                required
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descrição detalhada da etapa..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="progresso">Progresso (%)</Label>
              <Input
                id="progresso"
                type="number"
                min="0"
                max="100"
                value={formData.progresso}
                onChange={(e) => handleChange('progresso', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="data_inicio_prevista">Data Início Prevista</Label>
              <Input
                id="data_inicio_prevista"
                type="date"
                value={formData.data_inicio_prevista}
                onChange={(e) => handleChange('data_inicio_prevista', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="data_fim_prevista">Data Fim Prevista</Label>
              <Input
                id="data_fim_prevista"
                type="date"
                value={formData.data_fim_prevista}
                onChange={(e) => handleChange('data_fim_prevista', e.target.value)}
                className="mt-1"
              />
            </div>

            {isEditing && (
              <>
                <div>
                  <Label htmlFor="data_inicio_real">Data Início Real</Label>
                  <Input
                    id="data_inicio_real"
                    type="date"
                    value={formData.data_inicio_real || ''}
                    onChange={(e) => handleChange('data_inicio_real', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="data_fim_real">Data Fim Real</Label>
                  <Input
                    id="data_fim_real"
                    type="date"
                    value={formData.data_fim_real || ''}
                    onChange={(e) => handleChange('data_fim_real', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="ordem">Ordem de Execução</Label>
              <Input
                id="ordem"
                type="number"
                min="1"
                value={formData.ordem}
                onChange={(e) => handleChange('ordem', e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações importantes sobre esta etapa..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Etapa')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}