import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Save, X } from 'lucide-react';
import { format } from 'date-fns';

export default function CriarTarefaModal({ isOpen, onClose, onSubmit, obras, tarefa }) {
  const [formData, setFormData] = useState({
    titulo: '', descricao: '', data_hora: '', obra_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tarefa) {
      setFormData({
        titulo: tarefa.titulo || '',
        descricao: tarefa.descricao || '',
        data_hora: tarefa.data_hora ? format(new Date(tarefa.data_hora), "yyyy-MM-dd'T'HH:mm") : '',
        obra_id: tarefa.obra_id || ''
      });
    } else {
      setFormData({ titulo: '', descricao: '', data_hora: '', obra_id: '' });
    }
  }, [tarefa, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck /> {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" required value={formData.titulo} onChange={(e) => handleChange('titulo', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_hora">Data e Hora *</Label>
            <Input id="data_hora" type="datetime-local" required value={formData.data_hora} onChange={(e) => handleChange('data_hora', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obra_id">Obra (Opcional)</Label>
            <Select value={formData.obra_id} onValueChange={(v) => handleChange('obra_id', v)}>
              <SelectTrigger><SelectValue placeholder="Vincular a uma obra" /></SelectTrigger>
              <SelectContent>
                {obras.map(obra => <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={formData.descricao} onChange={(e) => handleChange('descricao', e.target.value)} />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}><X className="mr-2 h-4 w-4" />Cancelar</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}><Save className="mr-2 h-4 w-4" />Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}