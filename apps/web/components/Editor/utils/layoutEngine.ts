import dagre from "dagre";
import { FlowNode, FlowEdge } from "../types/flow.types";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const NODE_GAP_X = 250;
const NODE_GAP_Y = 150;

/**
 * Aplica layout automático hierárquico usando dagre
 */
export function applyAutoLayout(
    nodes: FlowNode[],
    edges: FlowEdge[]
): FlowNode[] {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: "TB", // Top to Bottom
        nodesep: NODE_GAP_X,
        ranksep: NODE_GAP_Y,
        align: "UL",
    });

    // Adicionar nodes ao grafo
    nodes.forEach((node) => {
        g.setNode(node.id, {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        });
    });

    // Adicionar edges ao grafo
    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    // Aplicar layout
    dagre.layout(g);

    // Atualizar posições dos nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = g.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - NODE_WIDTH / 2,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            },
        };
    });

    return layoutedNodes;
}

/**
 * Aplica layout simples em grid quando dagre não funciona bem
 * (fallback para casos com loops ou estrutura complexa)
 */
export function applyGridLayout(nodes: FlowNode[]): FlowNode[] {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const gap = 250;

    return nodes.map((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        return {
            ...node,
            position: {
                x: col * gap,
                y: row * gap,
            },
        };
    });
}

/**
 * Obtém posição inicial para um novo node
 */
export function getInitialNodePosition(existingNodes: FlowNode[]): { x: number; y: number } {
    if (existingNodes.length === 0) {
        return { x: 250, y: 250 };
    }

    // Encontrar a posição mais à direita
    const maxX = Math.max(...existingNodes.map((n) => n.position.x));
    const maxY = Math.max(...existingNodes.map((n) => n.position.y));

    // Colocar novo node à direita do último
    return {
        x: maxX + NODE_GAP_X,
        y: maxY,
    };
}
