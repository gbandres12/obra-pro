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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Save, X, Plus } from 'lucide-react';

const especialidadesComuns = [
  'Alvenaria',
  'Acabamento',
  'Instalações elétricas',
  'Instalações hidráulicas',
  'Pintura',
  'Cerâmica',
  'Gesso',
  'Carpintaria',
  'Solda MIG',
  'Solda TIG',
  'Estruturas metálicas',
  'Automação',
  'Gestão de equipe',
  'Controle de qualidade',
  'Operação de máquinas',
  'Segurança do trabalho'
];

export default function CriarFuncionarioModal({ isOpen, onClose, onSubmit, funcionario, isEditing }) {
  const [formData, setFormData] = useState({
    nome: '',
    funcao: '',
    telefone: '',
    valor_diaria: '',
    status: 'ativo',
    especialidades: []
  });

  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (funcionario && isEditing) {
      setFormData({
        nome: funcionario.nome || '',
        funcao: funcionario.funcao || '',
        telefone: funcionario.telefone || '',
        valor_diaria: funcionario.valor_diaria || '',
        status: funcionario.status || 'ativo',
        especialidades: funcionario.especialidades || []
      });
    } else if (!isEditing) {
      setFormData({
        nome: '',
        funcao: '',
        telefone: '',
        valor_diaria: '',
        status: 'ativo',
        especialidades: []
      });
    }
  }, [funcionario, isEditing, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const adicionarEspecialidade = (especialidade) => {
    if (especialidade && !formData.especialidades.includes(especialidade)) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, especialidade]
      }));
    }
    setNovaEspecialidade('');
  };

  const removerEspecialidade = (especialidade) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter(esp => esp !== especialidade)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      valor_diaria: parseFloat(formData.valor_diaria) || 0
    };

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-emerald-600" />
            {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: João Silva"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="funcao">Função *</Label>
              <Input
                id="funcao"
                value={formData.funcao}
                onChange={(e) => handleChange('funcao', e.target.value)}
                placeholder="Ex: Pedreiro, Eletricista..."
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="telefone">WhatsApp</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="valor_diaria">Valor da Diária (R$) *</Label>
              <Input
                id="valor_diaria"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_diaria}
                onChange={(e) => handleChange('valor_diaria', e.target.value)}
                placeholder="Ex: 180.00"
                required
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
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Especialidades</Label>
              
              {/* Especialidades atuais */}
              {formData.especialidades.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {formData.especialidades.map((esp, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                      onClick={() => removerEspecialidade(esp)}
                    >
                      {esp} ×
                    </Badge>
                  ))}
                </div>
              )}

              {/* Adicionar nova especialidade */}
              <div className="flex gap-2 mt-2">
                <Select
                  value=""
                  onValueChange={(value) => adicionarEspecialidade(value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar especialidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidadesComuns
                      .filter(esp => !formData.especialidades.includes(esp))
                      .map(esp => (
                        <SelectItem key={esp} value={esp}>
                          {esp}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Adicionar especialidade customizada */}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Ou digite uma nova especialidade..."
                  value={novaEspecialidade}
                  onChange={(e) => setNovaEspecialidade(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adicionarEspecialidade(novaEspecialidade)}
                  disabled={!novaEspecialidade.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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
              {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Funcionário')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}