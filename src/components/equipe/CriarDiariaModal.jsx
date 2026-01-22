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
import { UserCheck, Save, X } from 'lucide-react';

export default function CriarDiariaModal({ isOpen, onClose, onSubmit, funcionario, obras }) {
  const [formData, setFormData] = useState({
    obra_id: '',
    funcionario_id: '',
    data_trabalho: new Date().toISOString().split('T')[0],
    horas_trabalhadas: 8,
    atividades: '',
    valor_pago: '',
    origem: 'manual',
    observacoes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (funcionario && isOpen) {
      setFormData(prev => ({
        ...prev,
        funcionario_id: funcionario.id,
        valor_pago: funcionario.valor_diaria || ''
      }));
    }
  }, [funcionario, isOpen]);

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
      horas_trabalhadas: parseFloat(formData.horas_trabalhadas) || 8,
      valor_pago: parseFloat(formData.valor_pago) || 0
    };

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao registrar diária:', error);
    }
    setIsSubmitting(false);
  };

  const obrasAtivas = obras.filter(obra => obra.situacao === 'ativa');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Registrar Diária
          </DialogTitle>
          {funcionario && (
            <p className="text-sm text-gray-600 mt-1">
              Funcionário: <span className="font-medium">{funcionario.nome}</span> - {funcionario.funcao}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="obra_id">Obra *</Label>
              <Select
                value={formData.obra_id}
                onValueChange={(value) => handleChange('obra_id', value)}
                required
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {obrasAtivas.map(obra => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_trabalho">Data do Trabalho *</Label>
              <Input
                id="data_trabalho"
                type="date"
                value={formData.data_trabalho}
                onChange={(e) => handleChange('data_trabalho', e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="horas_trabalhadas">Horas Trabalhadas</Label>
              <Input
                id="horas_trabalhadas"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={formData.horas_trabalhadas}
                onChange={(e) => handleChange('horas_trabalhadas', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="valor_pago">Valor Pago (R$) *</Label>
              <Input
                id="valor_pago"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_pago}
                onChange={(e) => handleChange('valor_pago', e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="atividades">Atividades Realizadas</Label>
              <Textarea
                id="atividades"
                value={formData.atividades}
                onChange={(e) => handleChange('atividades', e.target.value)}
                placeholder="Descreva as atividades realizadas durante o dia..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações adicionais..."
                rows={2}
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
              {isSubmitting ? 'Registrando...' : 'Registrar Diária'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}