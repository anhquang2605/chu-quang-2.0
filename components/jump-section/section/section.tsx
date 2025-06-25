import React from 'react';
import style from './section.module.css';

export interface Section{
    id: string;   
}

interface sectionProps {
    id: string;
    title: string;
    children?: React.ReactNode;
}

const section: React.FC<sectionProps> = ({id, title, children}: sectionProps) => {
    return (
        <div id={id} className={style['section']}>
            {
                children
            }
        </div>
    );
};

export default section;