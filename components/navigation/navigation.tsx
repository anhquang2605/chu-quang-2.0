import React from 'react';
import style from './navigation.module.css';

interface NavigationProps {

}

const Navigation: React.FC<NavigationProps> = ({}) => {
    return (
        <div className={style['navigation']}>
            Navigation
        </div>
    );
};

export default Navigation;