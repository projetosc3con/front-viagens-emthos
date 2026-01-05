import { doc, getDoc, getDocs } from "firebase/firestore";
import { createCollection } from "../util/FirebaseConnection";

export type Agente = {
    funcao: string;
    email: string;
    nome: string;
}

export const getAgente = async(idDoc: string): Promise<Agente | null> => {
    const docRef = doc(createCollection('AGENTES'), idDoc);
    const snap = await getDoc(docRef);
    if(snap.exists()) {
        const data = snap.data() as Agente;
        return { ...data, funcao: snap.id };
    }
    return null;
}

export const getAgentes = async(): Promise<Agente[]> => {
    const snapshot = await getDocs(createCollection('AGENTES'));
    const lista: Agente[] = [];

    snapshot.forEach(doc => {
        lista.push({ ...doc.data(), funcao: doc.id } as Agente);
    });

    return lista;
}