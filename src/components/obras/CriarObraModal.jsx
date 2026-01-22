
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
import { Building2, Save, X, Calculator, User } from 'lucide-react';
import { addMonths, format } from 'date-fns';

export default function CriarObraModal({ isOpen, onClose, onSubmit, obra, isEditing, funcionarios }) {
  const [formData, setFormData] = useState({
    nome: '',
    localizacao: '',
    area_construida: '',
    tipo_obra: '',
    situacao: 'ativa',
    data_inicio: '',
    previsao_termino: '',
    valor_total_contrato: '',
    centro_de_custo: '',
    prazo_entrega_meses: '',
    anotacoes_tecnicas: '',
    progresso_geral: 0,
    encarregado_id: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (obra && isEditing) {
      setFormData({
        nome: obra.nome || '',
        localizacao: obra.localizacao || '',
        area_construida: obra.area_construida || '',
        tipo_obra: obra.tipo_obra || '',
        situacao: obra.situacao || 'ativa',
        data_inicio: obra.data_inicio || '',
        previsao_termino: obra.previsao_termino || '',
        valor_total_contrato: obra.valor_total_contrato || '',
        centro_de_custo: obra.centro_de_custo || '',
        prazo_entrega_meses: obra.prazo_entrega_meses || '',
        anotacoes_tecnicas: obra.anotacoes_tecnicas || '',
        progresso_geral: obra.progresso_geral || 0,
        encarregado_id: obra.encarregado_id || ''
      });
    } else if (!isEditing) {
      setFormData({
        nome: '',
        localizacao: '',
        area_construida: '',
        tipo_obra: '',
        situacao: 'ativa',
        data_inicio: '',
        previsao_termino: '',
        valor_total_contrato: '',
        centro_de_custo: '',
        prazo_entrega_meses: '',
        anotacoes_tecnicas: '',
        progresso_geral: 0,
        encarregado_id: ''
      });
    }
  }, [obra, isEditing, isOpen]);

  // Calcular automaticamente a previsão de término
  useEffect(() => {
    if (formData.data_inicio && formData.prazo_entrega_meses) {
      const dataInicio = new Date(formData.data_inicio);
      const meses = parseInt(formData.prazo_entrega_meses);
      
      if (!isNaN(meses) && meses > 0) {
        const dataTermino = addMonths(dataInicio, meses);
        const dataTerminoFormatada = format(dataTermino, 'yyyy-MM-dd');
        
        setFormData(prev => ({
          ...prev,
          previsao_termino: dataTerminoFormatada
        }));
      }
    }
  }, [formData.data_inicio, formData.prazo_entrega_meses]);

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
      area_construida: parseFloat(formData.area_construida) || 0,
      valor_total_contrato: parseFloat(formData.valor_total_contrato) || 0,
      prazo_entrega_meses: parseInt(formData.prazo_entrega_meses) || 0,
      progresso_geral: parseInt(formData.progresso_geral) || 0
      // encarregado_id is already a string, no parsing needed
    };

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5 text-emerald-600" />
            {isEditing ? 'Editar Obra' : 'Nova Obra'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome da Obra *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Residência João Silva"
                required
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="localizacao">Localização *</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={(e) => handleChange('localizacao', e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="centro_de_custo">Contrato *</Label>
              <Input
                id="centro_de_custo"
                value={formData.centro_de_custo}
                onChange={(e) => handleChange('centro_de_custo', e.target.value)}
                placeholder="Ex: Contrato 001/24"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="valor_total_contrato">Centro de Custo (R$) *</Label>
              <Input
                id="valor_total_contrato"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_total_contrato}
                onChange={(e) => handleChange('valor_total_contrato', e.target.value)}
                placeholder="Ex: 150000.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="encarregado_id" className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Encarregado Responsável
              </Label>
              <Select
                value={formData.encarregado_id}
                onValueChange={(value) => handleChange('encarregado_id', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um encarregado" />
                </SelectTrigger>
                <SelectContent>
                  {funcionarios && funcionarios.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.nome} - {f.funcao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => handleChange('data_inicio', e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="prazo_entrega_meses" className="flex items-center gap-2">
                Prazo de Entrega (meses) *
                <Calculator className="w-4 h-4 text-emerald-600" />
              </Label>
              <Input
                id="prazo_entrega_meses"
                type="number"
                min="1"
                value={formData.prazo_entrega_meses}
                onChange={(e) => handleChange('prazo_entrega_meses', e.target.value)}
                placeholder="Ex: 12"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="previsao_termino">Previsão de Término (Calculado Automaticamente)</Label>
              <Input
                id="previsao_termino"
                type="date"
                value={formData.previsao_termino}
                onChange={(e) => handleChange('previsao_termino', e.target.value)}
                className="mt-1 bg-emerald-50 border-emerald-200"
                readOnly
              />
              {formData.previsao_termino && (
                <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                  <Calculator className="w-3 h-3" />
                  Data calculada automaticamente com base no prazo
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="area_construida">Área Construída (m²)</Label>
              <Input
                id="area_construida"
                type="number"
                step="0.01"
                min="0"
                value={formData.area_construida}
                onChange={(e) => handleChange('area_construida', e.target.value)}
                placeholder="Ex: 120.50"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tipo_obra">Tipo da Obra</Label>
              <Select
                value={formData.tipo_obra}
                onValueChange={(value) => handleChange('tipo_obra', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="metalica">Metálica</SelectItem>
                  <SelectItem value="mista">Mista</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="situacao">Situação</Label>
              <Select
                value={formData.situacao}
                onValueChange={(value) => handleChange('situacao', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="finalizada">Finalizada</SelectItem>
                  <SelectItem value="arquivada">Arquivada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div>
                <Label htmlFor="progresso_geral">Progresso Geral (%)</Label>
                <Input
                  id="progresso_geral"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progresso_geral}
                  onChange={(e) => handleChange('progresso_geral', e.target.value)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <Label htmlFor="anotacoes_tecnicas">Anotações Técnicas</Label>
              <Textarea
                id="anotacoes_tecnicas"
                value={formData.anotacoes_tecnicas}
                onChange={(e) => handleChange('anotacoes_tecnicas', e.target.value)}
                placeholder="Observações importantes sobre a obra..."
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
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Obra')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
