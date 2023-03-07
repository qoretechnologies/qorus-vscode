import { createContext } from 'react';
import { TTranslator } from '../App';

// Create the text context which will
// store the text function
export const TextContext = createContext<TTranslator | undefined>((t) => t);
