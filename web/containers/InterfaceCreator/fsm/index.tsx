import React, { useContext } from 'react';
import { TTranslator } from '../../../App';
import { TextContext } from '../../../context/text';

export interface IFSMViewProps {
    t: TTranslator;
}

const FSMView: React.FC<IFSMViewProps> = () => {
    const t = useContext(TextContext);

    return <div style={{ width: '100%', height: '100%', backgroundColor: '#d7d7d7' }}></div>;
};

export default FSMView;
