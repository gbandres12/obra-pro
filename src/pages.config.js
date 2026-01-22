import Dashboard from './pages/Dashboard';
import Obras from './pages/Obras';
import Etapas from './pages/Etapas';
import Equipe from './pages/Equipe';
import Financeiro from './pages/Financeiro';
import Tarefas from './pages/Tarefas';
import Solicitacoes from './pages/Solicitacoes';
import Materiais from './pages/Materiais';
import ObraDashboard from './pages/ObraDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Obras": Obras,
    "Etapas": Etapas,
    "Equipe": Equipe,
    "Financeiro": Financeiro,
    "Tarefas": Tarefas,
    "Solicitacoes": Solicitacoes,
    "Materiais": Materiais,
    "ObraDashboard": ObraDashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};