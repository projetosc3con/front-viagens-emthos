import { getDocs, query, where } from "firebase/firestore";
import PrestacaoContas from "../types/PrestacaoContas";
import { prestacoesDeContas } from "../util/FirebaseConnection";

export const getContas = async(id: string): Promise<PrestacaoContas | null> => {
    const q = query(prestacoesDeContas, where("idViagem", "==", id));
    const snap = await getDocs(q);
    if(!snap.empty){
        const dados = snap.docs[0].data() as PrestacaoContas;

        return { ...dados, idDoc: snap.docs[0].id };
    }
    return null;
}

export const getAllcontas = async(): Promise<PrestacaoContas[]> => {
    const lista: PrestacaoContas[] = [];
    const snap = await getDocs(prestacoesDeContas);
    snap.forEach(doc => {
        lista.push(doc.data() as PrestacaoContas);
    })
    return lista;
}