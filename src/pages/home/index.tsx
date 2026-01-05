import { Container } from "./styles";
import RangeCalendar from "../../components/calendario";
import CustomActiveShapePieChart from "../../components/graficoPizza";
import TabelaViagens from "../../components/tabelaViagens";
import { useUserContext } from "../../context/UserContext";
import { useEffect, useState } from "react";
import Viagem, { StatusCount } from "../../types/Viagem";
import { getPieChart, getViagens, getViagensColaborador } from "../../controller/Viagem";
import { Spinner } from "react-bootstrap";
import { compareAsc, isAfter, parse } from "date-fns";

function obterProximaViagem(viagens: Viagem[]): Viagem | null {
  const hoje = new Date();

  const futuras = viagens
    .filter(v => {
      const data = parse(v.dataIda, 'dd/MM/yyyy', new Date());
      return isAfter(data, hoje);
    })
    .sort((a, b) => {
      const dataA = parse(a.dataIda, 'dd/MM/yyyy', new Date());
      const dataB = parse(b.dataIda, 'dd/MM/yyyy', new Date());
      return compareAsc(dataA, dataB);
    });

  return futuras.length > 0 ? futuras[0] : null;
}

const Home = () => {
    const { user, loading } = useUserContext();
    const [viagens, setViagens] = useState<Viagem[]>();
    const [chartData, setChartData] = useState<StatusCount[]>();
    const [proxViagem, setProx] = useState<Viagem | null>();
    
     useEffect(() => {
        
        const fetchData = async () => {
          if (user) {
            if(user.nivelAcesso === 'COL') {
                const snap = await getViagensColaborador(user.email);
                setViagens(snap);
                const pieData = await getPieChart(snap);
                setChartData(pieData);
                const proxima = obterProximaViagem(snap);
                setProx(proxima);
            } else {
                const snap = await getViagens();
                setViagens(snap);
                const pieData = await getPieChart(snap);
                setChartData(pieData);
            }
          }
        };
    
        fetchData();
    }, [loading]);

    if(loading){
        return (
            <Container className="row gap-3 justify-content-center">
                <Spinner/>
            </Container>
        )
    }

    if (!viagens || !chartData) {
        return (
            <Container className="row gap-3 justify-content-center">
                Erro ao consultar viagens
            </Container>
        )
    }

    return (
        <Container className="row gap-3 justify-content-center">
            {user?.nivelAcesso === 'COL' && 
            <div className="card col-12 col-sm-8 col-md-6 col-lg-4 col-xxl-4 justify-content-center">
                <h4>Próxima viagem</h4>
                <hr/>
                {proxViagem ? 
                <>
                    <div>
                        <label>Destino:</label> {proxViagem.destino}
                    </div>
                    <RangeCalendar startDate={proxViagem.dataIda} endDate={proxViagem.dataVolta} />
                </>
                :
                <>Sem viagens futuras</>
                }
            </div>
            }
            <div className="card col-sm-6 col-md-5 col-lg-4 col-xxl-3 d-flex justify-content-center align-items-center">
                <div style={{ marginBottom: '-3rem' }}>
                    <h4>Status das viagens</h4>
                    <hr/>
                </div>
                <CustomActiveShapePieChart data={chartData} />
            </div>
            <div className="card col-md-9 col-lg-7 col-xxl-6 table-responsive">
                <h4>Custo por viagem</h4>
                <hr/>
                <div className="card-overflow">
                    <TabelaViagens viagens={viagens}/>
                </div>
            </div>
        </Container>
    )
}

export default Home;