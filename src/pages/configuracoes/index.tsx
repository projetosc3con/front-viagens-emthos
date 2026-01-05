import Agentes from "../../components/agentes"
import Gerencias from "../../components/gerencias"
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { storage } from "../../util/FirebaseConnection";
import { useUserContext } from "../../context/UserContext";

async function doBackup(
  folder: string,
  keep: boolean = true
): Promise<string> {
  const url = new URL(
    "https://southamerica-east1-viagens-emthos.cloudfunctions.net/backupAndClearFolder"
  );
  url.searchParams.set("folder", folder);
  url.searchParams.set("keep", keep ? "true" : "false");

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  return data.zipPath;
}

const Configuracoes = () => {
    const { user } = useUserContext();

    const acionarBackup = async () => {
        document.body.style.cursor = "wait";
        try {
            const zipPath = await doBackup("viagens", true);
            const fileRef = storageRef(storage, zipPath);
            const url = await getDownloadURL(fileRef);
            window.location.href = url;
            document.body.style.cursor = "default";
        } catch (err) {
            console.error("Erro no backup ou no download:", err);
            document.body.style.cursor = "default";
        }
    };

    if(user?.nivelAcesso === 'ADM') {
        return (
            <div>
                <div className="row">
                    <div className="col-12 col-md-6 col-lg-7 col-xxl-8 px-3 mb-5">
                        <h2>Agentes</h2>
                        <hr/>
                        <div id="agentes-container">
                            <Agentes/>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 col-xxl-4 px-4">
                        <h2>Gerências</h2>
                        <hr />
                        <Gerencias/>
                    </div>
                    <hr/>
                    <div className="col-12 col-md-6 mb-4">
                        <h2>Atualizar viagens</h2>
                        <p className="text-ease">Confere viagens finalizadas com prestação de contas pendente, viagens com acerto financeiro pendente e se viagens em andamento possuem ou não solicitação de adiantamento</p>
                        <a href="https://handleviagemconcluida-kai7jslaxq-rj.a.run.app" target="_blank" className="btn btn-danger">Rodar conferencia de status</a>
                    </div>
                    <div className="col-12 col-md-6 mb-4">
                        <h2>Backup</h2>
                        <p className="text-ease">Faz o download de um arquivo .zip do repositório de prestação de contas para a máquina do usuário</p>
                        <button className="btn btn-danger" onClick={() => acionarBackup()}>
                            Fazer backup
                        </button>
                    </div>
                </div>
            </div>
        )
    } else {
        return (<>Sem acesso a essa área</>)
    }
}

export default Configuracoes;