import React, { FunctionComponent } from 'react';

export interface JavaScriptIconProps {
    readonly className?: string | undefined;
}

export const JavaScriptIcon: FunctionComponent<JavaScriptIconProps> = (props) => {
    return (
        <svg className={props.className} width="100%" height="100%" viewBox="0 0 256.4 291.5">
            <path
                d="M23.788 262.015l-23.8-262 256.4.1-23.6 261.7-104.8 29.6-104.2-29.4zm189.7-14.3l19.9-224.4h-105l.8 247.5 84.3-23.1zm-94.9-191.5h-25.5l-.3 134.3-49.5-13.5.1 30.7 75.2 20.3v-171.8z"
                fill="#d4b830"
            />
            <path
                d="M110.188 225.515c-3.3-1-19.6-5.4-36.2-9.9l-30.1-8.1v-15.1c0-14.8 0-15.1 1.5-14.6.8.3 11.8 3.3 24.4 6.8l22.9 6.3.2-67 .2-67h25v85.2c0 67.7-.2 85.2-.9 85.2-.5-.1-3.7-.9-7-1.8z"
                opacity={0.986}
                fill="none"
            />
            <path
                d="M43.388 207.715l-.1-30.7s31.6 8.9 49.5 13.5l.3-134.2h25.5v171.7l-75.2-20.3z"
                fillOpacity={0.922}
                opacity={0.986}
                fill="#ebebeb"
            />
            <path
                d="M128.388 23.215h105l-19.9 224.4-85.1 23.1v-247.5zm79.7 186.8l6.9-83.9-51 5.7v-44.8l54.4-.2 2.2-30.6-82.1.4 1.1 111.4 49.6-8.5-.7 24.8-50 13.3.5 30.4 69.1-18z"
                fill="#fdd83c"
            />
        </svg>
    );
};
