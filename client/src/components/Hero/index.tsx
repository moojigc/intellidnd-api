import React from 'react';

const Hero = (props: React.AllHTMLAttributes<any>) => {
    return (
        <div className={`hero ${props.className}`} {...props}>
            {props.children}
        </div>
    )
}

export default Hero;