import RootNode from './RootNode';
import QuestionNode from './QuestionNode';
import LogicNode from './LogicNode';
import EndNode from './EndNode';

export const nodeTypes = {
    root: RootNode,
    question: QuestionNode,
    logic: LogicNode,
    end: EndNode,
};

export { RootNode, QuestionNode, LogicNode, EndNode };
