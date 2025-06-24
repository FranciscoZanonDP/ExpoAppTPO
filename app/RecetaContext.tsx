import React, { createContext, useContext, useState } from 'react';

// Tipos de datos de la receta
export type Ingrediente = {
    nombre: string;
    cantidad: string;
    unidad: string;
};

export type PasoMedio = {
    id?: number;
    tipo: 'imagen' | 'video';
    url: string;
    orden: number;
};

export type Paso = {
    descripcion: string;
    imagen: any;
    video: any;
    medios: PasoMedio[];
};

export type Receta = {
    id?: number;
    nombre: string;
    categoria: string;
    descripcion: string;
    imagen_url: string;
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
        imagen_url: '',
        ingredientes: [],
        pasos: [{ descripcion: '', imagen: null, video: null, medios: [] }],
    },
    setReceta: () => { },
    resetReceta: () => { },
});

export const RecetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [receta, setReceta] = useState<Receta>({
        nombre: '',
        categoria: '',
        descripcion: '',
        imagen_url: '',
        ingredientes: [],
        pasos: [{ descripcion: '', imagen: null, video: null, medios: [] }],
    });

    const resetReceta = () => {
        setReceta({
            nombre: '',
            categoria: '',
            descripcion: '',
            imagen_url: '',
            ingredientes: [],
            pasos: [{ descripcion: '', imagen: null, video: null, medios: [] }],
        });
    };

    return (
        <RecetaContext.Provider value={{ receta, setReceta, resetReceta }}>
            {children}
        </RecetaContext.Provider>
    );
};

export const useReceta = () => useContext(RecetaContext);

// Export default para evitar warnings de Expo Router
export default RecetaContext; 