import { useEffect, useState } from "react";
import RelatoriosList from "../../components/relatoriosList";
import { exportViagensComPrestacoes } from "../../util/exportToExcel";
import { format, parseISO } from 'date-fns';
import { storage } from "../../util/FirebaseConnection";
import { getDownloadURL, ref } from "firebase/storage";
import { getViagens } from "../../controller/Viagem";
import Viagem from "../../types/Viagem";
import { customSelectStyles } from "../new/styles";
import Select, { SingleValue } from 'react-select';
import Helper, { HelperProps } from "../../components/helper";
import { helperExport, helperMedicao } from "../../controller/Helper";


type OptionType = { value: string; label: string };

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


const Relatorios = () => {
    const [dataInicioIso, setDataInicioIso] = useState<string>('');
    const [dataFimIso, setDataFimIso] = useState<string>('');
    const [contrato, setContrato] = useState<string>('4600680171');
    const [viagens, setViagens] = useState<Viagem[]>([]);
    const [viagemBackup, setViagemBackup] = useState('');
    const [info, setInfo] = useState<HelperProps>();
    const [info2, setInfo2] = useState<HelperProps>();

    useEffect(() => {
        const fetchData = async () => {
            const snap = await getViagens();
            setViagens(snap);
            const infoSnap = await helperMedicao();
            setInfo(infoSnap);
            const infoSnap2 = await helperExport();
            setInfo2(infoSnap2);
        }
        fetchData();
    }, []);

    const viagensOp = [
        { value: '', label: 'Selecione...' },
        ...viagens.map((v) => ({ value: v.id.toString(), label: v.id.toString() + '_' + v.colaborador + '_' + v.dataVolta}))
    ];

    const handleExportClick = () => {
        if (!dataInicioIso || !dataFimIso) return;

        // converte de "yyyy-MM-dd" para "dd/MM/yyyy"
        const dataInicio = format(parseISO(dataInicioIso), 'dd/MM/yyyy');
        const dataFim    = format(parseISO(dataFimIso),    'dd/MM/yyyy');
        document.body.style.cursor = "wait";
        exportViagensComPrestacoes(dataInicio, dataFim, contrato);
        document.body.style.cursor = "default";
    };

    const handleSelectChange = () => (selected: SingleValue<OptionType>) => {
        setViagemBackup(selected?.value || '');
    };

    const acionarBackup = async () => {
        if (viagemBackup === '') return;
        document.body.style.cursor = "wait";
        try {
            const zipPath = await doBackup("viagens/"+viagemBackup, true);
            const fileRef = ref(storage, zipPath);
            const url = await getDownloadURL(fileRef);
            window.location.href = url;
            document.body.style.cursor = "default";
        } catch (err) {
            console.error("Erro no backup ou no download:", err);
            document.body.style.cursor = "default";
        }
    };

    return (
        <>
        <div>
            <div className="d-flex">
                <h2>Medição</h2>
                {info && <Helper passos={info.passos} observacoes={info.observacoes} titulo={info.titulo} />}
            </div>
            <hr/>
            <div className="row mb-4">
                <div className="col-12 col-md-3 col-xxl-2">
                    <label htmlFor="dataInicio" className="form-label">
                        Data Início
                    </label>
                    <input
                        id="dataInicio"
                        type="date"
                        className="form-control"
                        value={dataInicioIso}
                        onChange={e => setDataInicioIso(e.currentTarget.value)}
                    />
                </div>
                <div className="col-md-3 col-xxl-2">
                    <label htmlFor="dataFim" className="form-label">
                        Data Fim
                    </label>
                    <input
                        id="dataFim"
                        type="date"
                        className="form-control"
                        value={dataFimIso}
                        onChange={e => setDataFimIso(e.currentTarget.value)}
                    />
                </div>
                <div className="col-md-3 col-xxl-2">
                    <label htmlFor="contrato" className="form-label">
                        Contrato
                    </label>
                    <input
                        id="contrato"
                        type="text"
                        className="form-control"
                        value={contrato}
                        onChange={e => setContrato(e.currentTarget.value)}
                    />
                </div>
                <div className="col-md-3 col-xxl-2 d-flex align-items-end">
                    <button
                        className="btn btn-danger"
                        onClick={handleExportClick}
                        disabled={!dataInicioIso || !dataFimIso}
                    >
                        Exportar viagens
                    </button>
                </div>
            </div>
            <RelatoriosList/>
        </div>
        <div className="mt-5">
            <div className="d-flex">
                <h2>Arquivos de viagens</h2>
                {info2 && <Helper passos={info2.passos} observacoes={info2.observacoes} titulo={info2.titulo} />}
            </div>
            <hr/>
            <div className="col-12 col-sm-6 col-md-4 col-xxl-3 mb-4">
                <Select
                    name="viagem"
                    value={viagensOp.find(opt => opt.value === viagemBackup)  || viagensOp[0]}
                    onChange={handleSelectChange()}
                    options={viagensOp}
                    styles={customSelectStyles()}
                    noOptionsMessage={() => "Não encontrado"}
                />
            </div>
            <button className="btn btn-danger" onClick={() => acionarBackup()}>
                Baixar arquivos
            </button>
        </div>
        </>
    )
}

export default Relatorios;