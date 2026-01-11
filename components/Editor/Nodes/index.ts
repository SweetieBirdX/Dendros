import RootNode from './RootNode';
import QuestionNode from './QuestionNode';
import LogicNode from './LogicNode';
import EndNode from './EndNode';
import InfoNode from './InfoNode';

export const nodeTypes = {
    root: RootNode,
    question: QuestionNode,
    logic: LogicNode,
    end: EndNode,
    info: InfoNode,
};

export { RootNode, QuestionNode, LogicNode, EndNode, InfoNode };
