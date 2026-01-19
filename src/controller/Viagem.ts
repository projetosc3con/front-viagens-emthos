import Viagem, { StatusCount, StatusLog } from "../types/Viagem";
import { createCollection, viagens } from "../util/FirebaseConnection";
import { getDoc, doc, getDocs, updateDoc, setDoc, getCountFromServer, query, where } from "firebase/firestore";
import { HomeTable } from "../types/Viagem";
import { compareDesc, isBefore, parse } from "date-fns";
import { getAdiantamento } from "./Adiantamento";
import { getContas } from "./PrestacaoContas";

export const getViagem = async(id: string): Promise<Viagem | null> => {
    const docRef = doc(viagens, id);
    const snap = await getDoc(docRef);

    if(snap.exists()){
        const dados = snap.data() as Viagem;
        return dados;
    }
    return null;
}

export const getViagens = async (): Promise<Viagem[]> => {
    const snapshot = await getDocs(viagens);
    const lista: Viagem[] = [];
    
    snapshot.forEach(doc => {
        lista.push(doc.data() as Viagem);
    });

    return lista;
}

export const getViagensContrato = async(contrato: string): Promise<Viagem[]> => {
  const q = query(viagens, where("contrato", "==", contrato));
  const snapshot = await getDocs(q);
  const list: Viagem[] = [];
  if(!snapshot.empty) {
    snapshot.forEach(doc => {
        list.push(doc.data() as Viagem);
    })
  } 

  return list;
}

export const getViagensColaborador = async (colaborador: string): Promise<Viagem[]> => {
  const q = query(viagens, where("colaborador", "==", colaborador));
  const snapshot = await getDocs(q);
  const list: Viagem[] = [];
  if(!snapshot.empty) {
    snapshot.forEach(doc => {
        list.push(doc.data() as Viagem);
    })
  } 
  return list;
}

export const addViagem = async (novo: Viagem): Promise<{ res: boolean, msg: string, id: number}> => {
    try {
        const id = await getNextId();
        const novoCId = { ...novo, id: id};
        const docRef = doc(viagens, id.toString());
        await setDoc(docRef, novoCId);
        return { res: true, msg: 'Viagem cadastrada com sucesso!', id: id};
    } catch (error: any) {
        return { res: false, msg: error.message, id: 0};
    }
}

export const updateViagem = async(viagem: Viagem): Promise<{ res: boolean, msg: string}> => {
    try {
        const docRef = doc(viagens, viagem.id.toString());
        await updateDoc(docRef, viagem);
        return { res: true, msg: 'Viagem atualizada com sucesso!'};
    } catch (error: any) {
        return { res: false, msg: error.message};
    }
}

export const getNextId = async(): Promise<number> => {
    const snapshot = await getCountFromServer(viagens);
    const count = snapshot.data().count;

    return count + 1;
}

export const getHome = async (snap: Viagem[]): Promise<HomeTable[]> => {
  const hoje = new Date();

  const filtrado = snap
    .filter(item => isBefore(parse(item.dataVolta, 'dd/MM/yyyy', new Date()), hoje))
    .sort((a, b) =>
      compareDesc(
        parse(a.dataVolta, 'dd/MM/yyyy', new Date()),
        parse(b.dataVolta, 'dd/MM/yyyy', new Date())
      )
    );

  const list = await Promise.all(
    filtrado.map(async (i): Promise<HomeTable> => {
      const ad = await getAdiantamento(i.id.toString());
      const vlr = await getContas(i.id.toString());

      return {
        id: i.id.toString(),
        status: i.status,
        destino: i.destino,
        volta: i.dataVolta,
        duracao: i.duracao.toString() + ' dias',
        adiantamento: ad ? 'R$ ' + ad.totalAdiantamento.toFixed(2) : 'Sem adiantamento',
        valorFinal: vlr ? 'R$ ' + vlr.valorTotal.toFixed(2) : 'Sem valor',
      };
    })
  );

  return list;
};

export const getPieChart = async (viagens: Viagem[]): Promise<StatusCount[]> => {
  const contagem = viagens.reduce<Record<string, number>>((acc, viagem) => {
    acc[viagem.status] = (acc[viagem.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(contagem).map(([status, count]) => ({
    name: status,
    value: count,
  }));
}

export const getStatusLog = async (idViagem: string): Promise<StatusLog[]> => {
  const q = query(createCollection("LOG_VIAGENS"), where("idViagem", "==", idViagem));
  const snapshot = await getDocs(q);
  const list: StatusLog[] = [];
    if(!snapshot.empty) {
        snapshot.forEach(doc => {
            list.push(doc.data() as StatusLog);
        })
    } 

    return list;
}