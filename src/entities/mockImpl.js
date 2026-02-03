
// Mock Data Implementations for Local Testing

export const MockObra = {
    list: async () => [
        {
            id: '1',
            nome: 'Residencial Ville de France',
            localizacao: 'São Paulo, SP',
            tipo_obra: 'civil',
            area_construida: 1250,
            situacao: 'ativa',
            progresso_geral: 35,
            valor_total_contrato: 2500000,
            centro_de_custo: 'CC-001',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            nome: 'Galpão Industrial Log',
            localizacao: 'Jundiaí, SP',
            tipo_obra: 'metalica',
            area_construida: 3000,
            situacao: 'ativa',
            progresso_geral: 12,
            valor_total_contrato: 4200000,
            centro_de_custo: 'CC-002',
            created_at: new Date().toISOString()
        }
    ],
    get: async (id) => {
        const list = await MockObra.list();
        return list.find(o => o.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockObra.list();
        return list.filter(o => Object.entries(criteria).every(([k, v]) => o[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async () => ({ success: true })
};

export const MockEtapa = {
    list: async () => [
        { id: '1', obra_id: '1', nome_etapa: 'Fundação', status: 'concluida', progresso: 100, ordem: 1 },
        { id: '2', obra_id: '1', nome_etapa: 'Estrutura', status: 'em_andamento', progresso: 45, ordem: 2 },
        { id: '3', obra_id: '1', nome_etapa: 'Alvenaria', status: 'pendente', progresso: 0, ordem: 3 },
        { id: '4', obra_id: '2', nome_etapa: 'Terraplanagem', status: 'concluida', progresso: 100, ordem: 1 },
        { id: '5', obra_id: '2', nome_etapa: 'Fundação', status: 'em_andamento', progresso: 20, ordem: 2 }
    ],
    get: async (id) => {
        const list = await MockEtapa.list();
        return list.find(e => e.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockEtapa.list();
        return list.filter(e => Object.entries(criteria).every(([k, v]) => e[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async () => ({ success: true })
};

export const MockSolicitacaoMaterial = {
    list: async () => [
        { id: '1', obra_id: '1', item_solicitado: 'Cimento CP II', quantidade: 50, unidade: 'sc', status: 'pendente', urgencia: 'alta', solicitante: 'João', valor_estimado: 1500 },
        { id: '2', obra_id: '1', item_solicitado: 'Aço CA-50 10mm', quantidade: 200, unidade: 'barra', status: 'aprovado', urgencia: 'media', solicitante: 'Maria', valor_estimado: 8000 }
    ],
    ],
get: async (id) => {
    const list = await MockSolicitacaoMaterial.list();
    return list.find(m => m.id === id) || list[0];
},
    filter: async (criteria = {}) => {
        const list = await MockSolicitacaoMaterial.list();
        return list.filter(m => Object.entries(criteria).every(([k, v]) => m[k] === v));
    },
        create: async (data) => ({ id: Math.random().toString(), ...data }),
            update: async (id, data) => ({ id, ...data }),
                delete: async () => ({ success: true })
};

export const MockFuncionario = {
    list: async () => [
        { id: '1', nome: 'Carlos Mestre', funcao: 'Mestre de Obras', status: 'ativo', valor_diaria: 250, telefone: '11999999999' },
        { id: '2', nome: 'Pedro Pedreiro', funcao: 'Pedreiro', status: 'ativo', valor_diaria: 180, telefone: '11988888888' },
        { id: '3', nome: 'João Servente', funcao: 'Servente', status: 'ativo', valor_diaria: 120, telefone: '11977777777' }
    ],
    get: async (id) => {
        const list = await MockFuncionario.list();
        return list.find(f => f.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockFuncionario.list();
        return list.filter(f => Object.entries(criteria).every(([k, v]) => f[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async () => ({ success: true })
};

export const MockDiaria = {
    list: async () => [
        { id: '1', funcionario_id: '1', obra_id: '1', data_trabalho: new Date().toISOString(), valor_pago: 250, status: 'pendente' },
        { id: '2', funcionario_id: '2', obra_id: '1', data_trabalho: new Date().toISOString(), valor_pago: 180, status: 'pago' }
    ],
    get: async (id) => {
        const list = await MockDiaria.list();
        return list.find(d => d.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockDiaria.list();
        return list.filter(d => Object.entries(criteria).every(([k, v]) => d[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async () => ({ success: true })
};

export const MockLancamentoFinanceiro = {
    list: async () => [
        { id: '1', obra_id: '1', descricao: 'Compra de Cimento', tipo: 'despesa', valor: 1500, data_lancamento: new Date().toISOString(), categoria: 'Materiais' },
        { id: '2', obra_id: '1', descricao: 'Medição Inicial', tipo: 'receita', valor: 50000, data_lancamento: new Date().toISOString(), categoria: 'Medição' }
    ],
    get: async (id) => {
        const list = await MockLancamentoFinanceiro.list();
        return list.find(l => l.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockLancamentoFinanceiro.list();
        return list.filter(l => Object.entries(criteria).every(([k, v]) => l[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async () => ({ success: true })
};

export const MockTarefaEngenheiro = {
    list: async () => [
        { id: '1', obra_id: '1', titulo: 'Vistoria Semanal', descricao: 'Verificar alinhamento das paredes', data_hora: new Date().toISOString(), status: 'pendente', prioridade: 'alta' },
        { id: '2', obra_id: '2', titulo: 'Relatório Fotográfico', descricao: 'Enviar fotos para o cliente', data_hora: new Date().toISOString(), status: 'concluida', prioridade: 'media' }
    ],
    get: async (id) => {
        const list = await MockTarefaEngenheiro.list();
        return list.find(t => t.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockTarefaEngenheiro.list();
        return list.filter(t => Object.entries(criteria).every(([k, v]) => t[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async () => ({ success: true })
};

export const MockSolicitacao = {
    list: async () => [
        { id: '1', obra_id: '1', tipo_solicitacao: 'Contratação', descricao: 'Precisamos de mais 2 serventes', solicitante: 'Carlos', setor: 'RH', status: 'aberta' }
    ],
    get: async (id) => {
        const list = await MockSolicitacao.list();
        return list.find(s => s.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockSolicitacao.list();
        return list.filter(s => Object.entries(criteria).every(([k, v]) => s[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    update: async (id, data) => ({ id, ...data }),
    delete: async () => ({ success: true })
};

export const MockFotoProgresso = {
    list: async () => [
        { id: '1', obra_id: '1', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800&q=80', descricao: 'Início da Alvenaria', data_foto: new Date().toISOString() },
        { id: '2', obra_id: '1', url: 'https://images.unsplash.com/photo-1503387762-592dea58ef21?w=800&q=80', descricao: 'Vigamento concluído', data_foto: new Date().toISOString() }
    ],
    get: async (id) => {
        const list = await MockFotoProgresso.list();
        return list.find(f => f.id === id) || list[0];
    },
    filter: async (criteria = {}) => {
        const list = await MockFotoProgresso.list();
        return list.filter(f => Object.entries(criteria).every(([k, v]) => f[k] === v));
    },
    create: async (data) => ({ id: Math.random().toString(), ...data }),
    delete: async () => ({ success: true })
};
