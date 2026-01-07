import { Step } from 'react-joyride';

export const dashboardTourSteps: Step[] = [
    {
        target: '[data-tour="sidebar"]',
        content: 'Esta é a barra lateral de navegação. Use-a para acessar diferentes seções do sistema.',
        placement: 'right',
        disableBeacon: true,
    },
    {
        target: '[data-tour="dashboard-link"]',
        content: 'O Dashboard mostra uma visão geral dos seus quizzes e estatísticas.',
        placement: 'right',
    },
    {
        target: '[data-tour="create-quiz"]',
        content: 'Clique aqui para criar um novo quiz. Você pode criar quizzes interativos para capturar leads.',
        placement: 'right',
    },
    {
        target: '[data-tour="analytics-link"]',
        content: 'Analise o desempenho dos seus quizzes com métricas detalhadas.',
        placement: 'right',
    },
    {
        target: '[data-tour="leads-link"]',
        content: 'Visualize todos os leads capturados através dos seus quizzes.',
        placement: 'right',
    },
    {
        target: '[data-tour="profile"]',
        content: 'Acesse seu perfil e configurações da conta aqui.',
        placement: 'left',
    },
];

