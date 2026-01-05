import { useEffect, useRef, useState } from "react";
import Viagem, { HomeTable } from "../../types/Viagem";
import { useUserContext } from "../../context/UserContext";
import { getHome, getViagens } from "../../controller/Viagem";
import { useNavigate } from "react-router-dom";

type Props = {
    viagens: Viagem[];
}

const TabelaViagens = ({viagens}: Props) => {
  const [itens, setItens] = useState<HomeTable[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;
  const navigate = useNavigate();

  const { user } = useUserContext();
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;
    
    const fetchData = async () => {
      if (user) {
        //tabela
        const snap = await getHome(viagens);
        setItens(snap);
      }
    };

    fetchData();
  }, []);

  // Cálculo de paginação
  const indexInicio = (paginaAtual - 1) * itensPorPagina;
  const indexFim = indexInicio + itensPorPagina;
  const paginaAtualItens = itens.slice(indexInicio, indexFim);
  const totalPaginas = Math.ceil(itens.length / itensPorPagina);

  if (itens === undefined) return <>Carregando...</>;
  if (itens.length === 0) return <>Sem viagens</>;

  return (
    <>
      <table className="table table-dark table-striped-columns">
        <thead>
          <tr>
            <th>Status</th>
            <th>Destino</th>
            <th>Volta</th>
            <th>Duração</th>
            <th>Adiantamento</th>
            <th>Valor final</th>
          </tr>
        </thead>
        <tbody>
          {paginaAtualItens.map((item, key) => (
            <tr key={key} onClick={() => navigate('/viagens/'+item.id)}>
              <td>{item.status}</td>
              <td>{item.destino}</td>
              <td>{item.volta}</td>
              <td>{item.duracao}</td>
              <td>{item.adiantamento}</td>
              <td>{item.valorFinal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de Paginação */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary"
          onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
          disabled={paginaAtual === 1}
        >
          Anterior
        </button>

        <span>
          Página {paginaAtual} de {totalPaginas}
        </span>

        <button
          className="btn btn-secondary"
          onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
          disabled={paginaAtual === totalPaginas}
        >
          Próxima
        </button>
      </div>
    </>
  );
};

export default TabelaViagens;
