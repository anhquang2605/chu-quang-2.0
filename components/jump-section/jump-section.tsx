import React, { JSX } from 'react';
import style from './jump-section.module.css';

interface JumpSectionProps {
    sections: [string];
}

const JumpSection: React.FC<JumpSectionProps> = ({sections}: JumpSectionProps) => {
    const backBones = () => {
        const jsxCode: JSX.Element[] = [];
        sections.forEach((section, index) => {
            jsxCode.push(
                <a key={index} href={`#${section}`} className={style['jump-link']}>
                    {section}
                </a>
            );
        });
        if (jsxCode.length === 0) {
            return <span className={style['no-sections']}>No sections available</span>;
        }
        return jsxCode;
    }
    return (
        <div className={style['jump-section']}>
            {backBones()}
        </div>
    );
};

export default JumpSection;