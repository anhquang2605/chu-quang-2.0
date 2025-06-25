import React from 'react';
import style from './jump-section.module.css';

interface JumpSectionProps {
    sections: [string];
}

const JumpSection: React.FC<JumpSectionProps> = ({}) => {
    return (
        <div className={style['jump-section']}>
            JumpSection
        </div>
    );
};

export default JumpSection;