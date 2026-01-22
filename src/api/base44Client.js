import { Obra } from '@/entities/Obra';
import { Etapa } from '@/entities/Etapa';
import { SolicitacaoMaterial } from '@/entities/SolicitacaoMaterial';
import { Funcionario } from '@/entities/Funcionario';
import { Diaria } from '@/entities/Diaria';
import { LancamentoFinanceiro } from '@/entities/LancamentoFinanceiro';
import { TarefaEngenheiro } from '@/entities/TarefaEngenheiro';
import { Solicitacao } from '@/entities/Solicitacao';

import {
  MockObra, MockEtapa, MockSolicitacaoMaterial, MockFuncionario,
  MockDiaria, MockLancamentoFinanceiro, MockTarefaEngenheiro, MockSolicitacao
} from '@/entities/mockImpl';

// Check if we should use mock data
// If env var is set OR if Supabase URL is the placeholder/missing
const useMock = import.meta.env.VITE_USE_MOCK === 'true' ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

export const base44 = {
  entities: useMock ? {
    Obra: MockObra,
    Etapa: MockEtapa,
    SolicitacaoMaterial: MockSolicitacaoMaterial,
    Funcionario: MockFuncionario,
    Diaria: MockDiaria,
    LancamentoFinanceiro: MockLancamentoFinanceiro,
    TarefaEngenheiro: MockTarefaEngenheiro,
    Solicitacao: MockSolicitacao
  } : {
    Obra,
    Etapa,
    SolicitacaoMaterial,
    Funcionario,
    Diaria,
    LancamentoFinanceiro,
    TarefaEngenheiro,
    Solicitacao
  },
  auth: {
    me: async () => {
      // If mocking, return a fake user, else let AuthContext handle real auth
      if (useMock) {
        return {
          id: 'mock-user-id',
          email: 'teste@obrapro.com.br',
          name: 'Usuário Teste',
          role: 'admin'
        };
      }
      return null;
    },
    logout: (redirectUrl) => {
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: () => {
      // No-op for mock
      console.log('Redirect to login requested');
    }
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      console.log(`Log: User on ${pageName}`);
      return { success: true };
    }
  }
};

export const createAxiosClient = () => ({
  get: async () => ({}),
  post: async () => ({})
});
