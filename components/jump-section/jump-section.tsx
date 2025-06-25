import React, { JSX } from 'react';
import style from './jump-section.module.css';
import Section from './section/section';

interface JumpSectionProps {
    sections: [string];
}

const JumpSection: React.FC<JumpSectionProps> = ({sections}: JumpSectionProps) => {
    const backBones = () => {
        const jsxCode: JSX.Element[] = [];
        sections.forEach((section, index) => {
            jsxCode.push(
                <Section key={index} title={section} id={section}>
                    
                </Section>
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