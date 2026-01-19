import { gerencias } from "../util/FirebaseConnection";
import Gerencia from "../types/Gerencia";
import { doc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";
import { getViagem } from "./Viagem";

export const getGerencias = async (): Promise<Gerencia[]> => {
    const snapshot = await getDocs(gerencias);
    const lista: Gerencia[] = [];
    
    snapshot.forEach(doc => {
        lista.push({ ...doc.data() as Gerencia, id: doc.id});
    });

    return lista;
}

export const getGerencia = async (gerencia: string): Promise<Gerencia | null> => {
    const q = query(gerencias, where("nome", "==", gerencia));
    const snap = await getDocs(q);
    if (!snap.empty){
        return snap.docs[0].data() as Gerencia;
    }
    return null;
}

export const getGerenciaViagem = async (idViagem: string): Promise<Gerencia | null> => {
    const snap = await getViagem(idViagem);
    if (!snap) return null;
    const ger = await getGerencia(snap.gerencia);
    return ger;
}

export const incluirColaborador = async(gerencia: string) => {
    const q = query(gerencias, where("nome", "==", gerencia));
    const snap = await getDocs(q);

    if (!snap.empty){
        const docRef = doc(gerencias, snap.docs[0].id);
        await updateDoc(docRef, {
            colaboradores: increment(1)
        });
    }
}

export const diminuirColaborador = async(gerencia: string) => {
    const q = query(gerencias, where("nome", "==", gerencia));
    const snap = await getDocs(q);

    if (!snap.empty){
        const docRef = doc(gerencias, snap.docs[0].id);
        await updateDoc(docRef, {
            colaboradores: increment(-1)
        });
    }
}