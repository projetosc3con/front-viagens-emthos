import Usuario from "../types/Usuario";
import { usuarios } from "../util/FirebaseConnection";
import { getDoc, doc, getDocs, updateDoc, setDoc, deleteDoc } from "firebase/firestore";

export const getUser = async(email: string): Promise<Usuario | null> => {
    const docRef = doc(usuarios, email);
    const snap = await getDoc(docRef);
    if(snap.exists()){
        const dados = snap.data() as Usuario;
        return dados;
    }
    return null;
}

export const getUsers = async (): Promise<Usuario[]> => {
    const snapshot = await getDocs(usuarios);
    const lista: Usuario[] = [];
    
    snapshot.forEach(doc => {
        lista.push(doc.data() as Usuario);
    });

    return lista;
}

export const addUser = async (novo: Usuario): Promise<{ res: boolean, msg: string}> => {
    try {
        const docRef = doc(usuarios, novo.email);
        await setDoc(docRef, novo);
        return { res: true, msg: 'Usuário cadastrado com sucesso!'};
    } catch (error: any) {
        return { res: false, msg: error.message};
    }
}

export const updateUser = async(usuario: Usuario): Promise<{ res: boolean, msg: string}> => {
    try {
        const docRef = doc(usuarios, usuario.email);
        await updateDoc(docRef, usuario);
        return { res: true, msg: 'Usuário atualizado com sucesso!'};
    } catch (error: any) {
        return { res: false, msg: error.message};
    }
}

export const deleteUser = async(usuario: Usuario): Promise<{ res: boolean, msg: string}> => {
    try {
        const docRef = doc(usuarios, usuario.email);
        await deleteDoc(docRef);
        return { res: true, msg: 'Usuário excluído com sucesso!'};
    } catch (error: any) {
        return { res: false, msg: error.message};
    }
}

export const limiteDeUsers = async(): Promise<boolean> => {
    const snap = await getUsers();
    if (snap.length < 101) {
        return false;
    }
    return true;
}