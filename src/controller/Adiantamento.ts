import { addDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import Adiantamento from "../types/Adiantamento";
import { adiantamentos, viagens } from "../util/FirebaseConnection";
import { getViagem } from "./Viagem";
import { NotificaPreposto, NotificarFinanceiroAdiantamento } from "./Mail";

export const addAdiantamento = async (novo: Adiantamento): Promise<{ res: boolean, msg: string }> => {
    try {

        await addDoc(adiantamentos, novo);
        //atualiza valor e status da viagem quando o colaborador submete o adiantamento
        await updateDoc(doc(viagens, novo.idViagem), { valorAdiantamento: novo.totalAdiantamento, status: 'Adiantamento enviado' });
        const viagemSnap = await getViagem(novo.idViagem);
        if(viagemSnap){
            //envia as notificações
            await NotificaPreposto(viagemSnap);
            await NotificarFinanceiroAdiantamento(viagemSnap);
        } 
        return { res: true, msg: 'Adiantamento cadastrado com sucesso!'};
    } catch (error: any) {
        return { res: false, msg: error.message};
    }
}

export const updateAdiantamento = async (adiantamento: Adiantamento): Promise<{ res: boolean, msg: string}> => {
    try {
        const docRef = doc(adiantamentos, adiantamento.idDoc);
        await updateDoc(docRef, adiantamento);
        //atualiza valor e status da viagem quando o colaborador submete o adiantamento
        await updateDoc(doc(viagens, adiantamento.idViagem), { valorAdiantamento: adiantamento.totalAdiantamento });
        return { res: true, msg: "Adiantamento atualizado com sucesso!"};
    } catch (error: any) {
        return { res: false, msg: error.message };
    }
}

export const getAdiantamento = async(id: string): Promise<Adiantamento | null> => {
    const q = query(adiantamentos, where("idViagem", "==", id));
    const snap = await getDocs(q);
    if(!snap.empty){
        const dados = snap.docs[0].data() as Adiantamento;

        return { ...dados, idDoc: snap.docs[0].id };
    }
    return null;
}

export const getAdiantamentos = async(): Promise<Adiantamento[]> => {
    const snapshot = await getDocs(adiantamentos);
    const lista: Adiantamento[] = [];

    snapshot.forEach(doc => {
        lista.push(doc.data() as Adiantamento);
    })

    return lista;
}