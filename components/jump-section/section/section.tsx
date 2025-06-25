import React from 'react';
import style from './section.module.css';

interface sectionProps {

}

const section: React.FC<sectionProps> = ({}) => {
    return (
        <div className={style['section']}>
            section
        </div>
    );
};

export default section;