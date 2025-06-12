import React, { createContext, useContext, useState } from 'react';

// Tipos de datos de la receta
export type Ingrediente = {
    nombre: string;
    cantidad: string;
    unidad: string;
};

export type Paso = {
    descripcion: string;
    imagen: any;
    video: any;
};

export type Receta = {
    nombre: string;
    categoria: string;
    descripcion: string;
    ingredientes: Ingrediente[];
    pasos: Paso[];
};

const RecetaContext = createContext<{
    receta: Receta;
    setReceta: React.Dispatch<React.SetStateAction<Receta>>;
    resetReceta: () => void;
}>({
    receta: {
        nombre: '',
        categoria: '',
        descripcion: '',
        ingredientes: [{ nombre: '', cantidad: '', unidad: '' }],
        pasos: [{ descripcion: '', imagen: null, video: null }],
    },
    setReceta: () => { },
    resetReceta: () => { },
});

export const RecetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [receta, setReceta] = useState<Receta>({
        nombre: '',
        categoria: '',
        descripcion: '',
        ingredientes: [{ nombre: '', cantidad: '', unidad: '' }],
        pasos: [{ descripcion: '', imagen: null, video: null }],
    });

    const resetReceta = () => {
        setReceta({
            nombre: '',
            categoria: '',
            descripcion: '',
            ingredientes: [{ nombre: '', cantidad: '', unidad: '' }],
            pasos: [{ descripcion: '', imagen: null, video: null }],
        });
    };

    return (
        <RecetaContext.Provider value={{ receta, setReceta, resetReceta }}>
            {children}
        </RecetaContext.Provider>
    );
};

export const useReceta = () => useContext(RecetaContext); 