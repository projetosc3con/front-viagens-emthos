import {Routes, Route} from 'react-router-dom';
import Home from './pages/home';
import List from './pages/list';
import New from './pages/new';
import ConsultarViagem from './pages/viagem';
import PedirAdiantamento from './components/adiantamento';
import Users from './pages/users';
import Gerencias from './components/gerencias';
import Agentes from './components/agentes';
import Configuracoes from './pages/configuracoes';
import Notificacoes from './pages/notificacoes';
import Relatorios from './pages/relatorios';

export default function mainRoutes() {
    return (
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/consultar' element={<List/>}/>
            <Route path='/nova' element={<New/>}/>
            <Route path='/nova/:id/adiantamento' element={<PedirAdiantamento/>}/>
            <Route path='/viagens/:id/*' element={<ConsultarViagem/>}/>
            <Route path='/usuarios' element={<Users/>}/>
            <Route path='/configuracoes' element={<Configuracoes/>}/>
            <Route path='/notificacoes' element={<Notificacoes/>}/>
            <Route path='/relatorios' element={<Relatorios/>}/>
        </Routes>
    )
}