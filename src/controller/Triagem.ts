import { addDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import Triagem from "../types/Triagem";
import { triagens } from "../util/FirebaseConnection";

export const getTriagem = async (idViagem: string): Promise<Triagem | null> => {
    const q = query(triagens, where('idViagem', '==', idViagem));
    const snap = await getDocs(q);
    if(!snap.empty){
        const dados = snap.docs[0].data() as Triagem;
        return { ...dados, idDoc: snap.docs[0].id };
    }
    return null;
}

export const addTriagem = async (nova: Triagem): Promise<{ res: boolean, msg: string, id: string}> => {
    try {
        const docRef = await addDoc(triagens, nova);
        return { res: true, msg: 'Triagem cadastrada com sucesso', id: docRef.id };
    } catch (error: any) {
        return { res: false, msg: 'Erro ao cadastrar triagem: ' + error.message, id: ''};
    }
}
