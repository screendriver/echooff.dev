import React from 'react';
import { Footer } from './Footer';

export default { title: 'Organisms', component: Footer };

export const footer = () => <Footer date={new Date()} />;
