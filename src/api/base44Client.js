
import { Obra } from '@/entities/Obra';
import { Etapa } from '@/entities/Etapa';
import { SolicitacaoMaterial } from '@/entities/SolicitacaoMaterial';
import { Funcionario } from '@/entities/Funcionario';
import { Diaria } from '@/entities/Diaria';
import { LancamentoFinanceiro } from '@/entities/LancamentoFinanceiro';
import { TarefaEngenheiro } from '@/entities/TarefaEngenheiro';
import { Solicitacao } from '@/entities/Solicitacao';

// Mock implementation of base44 client for local development/SaaS transformation
// TODO: Replace with a real API client (e.g. for Supabase, Firebase, or custom backend)

export const base44 = {
  entities: {
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
      // Mock user for development
      return {
        id: 'mock-user-id',
        email: 'dev@engenheirodebolso.com',
        name: 'Developer User',
        role: 'admin'
      };
    },
    logout: (redirectUrl) => {
      console.log('Mock logout called', { redirectUrl });
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    redirectToLogin: (param) => {
      console.log('Mock redirectToLogin called', { param });
      // In a real app, this would redirect to the login page
      // window.location.href = '/login'; 
      alert('Redirect to Login (Mock)');
    }
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      console.log(`Mock logUserInApp: ${pageName}`);
      return { success: true };
    }
  }
};

// Mock createAxiosClient to support AuthContext usage
export const createAxiosClient = ({ baseURL, headers, token, interceptResponses }) => {
  return {
    get: async (url) => {
      console.log(`Mock GET request to ${baseURL}${url}`);
      if (url.includes('public-settings')) {
        return {
          id: 'mock-app-id',
          public_settings: {
            theme: 'light',
            appName: 'Engenheiro de Bolso SaaS'
          }
        };
      }
      return {};
    },
    post: async (url, data) => {
      console.log(`Mock POST request to ${baseURL}${url}`, data);
      return {};
    }
  }
};
