import api from "../../api";
import Contrato from "../../types/Contrato";
import { useEffect, useRef, useState } from 'react';
import Gerencia from "../../types/Gerencia";

const Contratos = () => {
    const [toggleNew, setToggleNew] = useState(false);
    const hasFetchedData = useRef(false);
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [gerencias, setGerencias] = useState<Gerencia[]>([]);
    const [form, setForm] = useState<Contrato>({
        nroContrato: '',
        empresa: '',
        saldoContratual: 0,
        valorContrato: 0,
        agentes: {
            cliente: {email: '', nome: ''},
            financeiro: {email: '', nome: ''},
            interno: {email: '', nome: ''},
            preposto: {email: '', nome: ''},
            suplenteCliente: {email: '', nome: ''},
            suplenteFinanceiro: {email: '', nome: ''},
        },
    })

    const fetchContratos = async () => {
        const {data} = await api.get('/contratos');
        setContratos(data);
        const res = await api.get('/gerencias');
        setGerencias(res.data);
    }

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        fetchContratos();
    }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [grupo, subgrupo, campo] = name.split(".");

      setForm((prev) => ({
        ...prev,
        [grupo]: {
          ...(prev as any)[grupo],
          [subgrupo]: {
            ...(prev as any)[grupo][subgrupo],
            [campo]: value,
          },
        },
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
    const isEdit = contratos.some(
    (c) => c.nroContrato === form.nroContrato
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEdit) {
            await api.put(`/contratos/${form.nroContrato}`, form);
            } else {
            await api.post("/contratos", form);
            }

            await fetchContratos();
            setToggleNew(false);
        } catch (error) {
            console.error("Erro ao salvar contrato", error);
        }
    };

    const handleEdit = (contrato: Contrato) => {
    setForm(contrato);
    setToggleNew(true);
    };

    return (
        <div>
            <h3>Contratos</h3>
            <hr/>
            <div className="row">
                <div className="col-12 col-lg-8 col-xxl-8">
                    <div className="card">
                        <div className="card-body">
                            {!toggleNew ? 
                            <div className="d-flex justify-content-center align-items-center">
                                <div className="d-flex">
                                    <h5 className="my-auto me-4">Criar novo</h5>
                                    <button className="btn btn-outline-light" onClick={() => setToggleNew(!toggleNew)}>
                                    <i className="bi bi-clipboard-plus-fill"/>
                                    </button>
                                </div>
                            </div> 
                            :
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-6">
                                        {/* NÚMERO DO CONTRATO */}
                                        <div className="form-group mb-4 col-12">
                                            <label htmlFor="nroContrato">Contrato</label>
                                            <input
                                            type="text"
                                            id="nroContrato"
                                            name="nroContrato"
                                            disabled={isEdit}
                                            required
                                            value={form.nroContrato}
                                            onChange={handleChange}
                                            className="form-control"
                                            />
                                        </div>

                                        {/* EMPRESA */}
                                        <div className="form-group mb-4 col-12">
                                            <label htmlFor="empresa">Empresa</label>
                                            <input
                                            type="text"
                                            id="empresa"
                                            name="empresa"
                                            value={form.empresa}
                                            onChange={handleChange}
                                            className="form-control"
                                            />
                                        </div>
                                        <div className="row">
                                            {/* SALDO CONTRATUAL */}
                                            <div className="form-group mb-4 col-6">
                                                <label htmlFor="saldoContratual">Saldo contratual</label>
                                                <input
                                                type="number"
                                                id="saldoContratual"
                                                name="saldoContratual"
                                                value={form.saldoContratual}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                            {/* VALOR CONTRATO */}
                                            <div className="form-group mb-4 col-6">
                                                <label htmlFor="valorContrato">Valor contrato</label>
                                                <input
                                                type="number"
                                                id="valorContrato"
                                                name="valorContrato"
                                                value={form.valorContrato}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <hr/>
                                        {/* PREPOSTO */}
                                        <h6>Preposto</h6>
                                        <div className="row">
                                            <div className="form-group mb-4 col-6">
                                                <label>Nome</label>
                                                <input
                                                type="text"
                                                name="agentes.preposto.nome"
                                                value={form.agentes.preposto.nome}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                            <div className="form-group mb-4 col-6">
                                                <label>Email</label>
                                                <input
                                                type="email"
                                                name="agentes.preposto.email"
                                                value={form.agentes.preposto.email}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <hr/>
                                        <h6>Agente de viagens interno</h6>
                                        <div className="row">
                                            <div className="form-group mb-4 col-6">
                                                <label>Nome</label>
                                                <input
                                                type="text"
                                                name="agentes.interno.nome"
                                                value={form.agentes.interno.nome}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                            <div className="form-group mb-4 col-6">
                                                <label>Email</label>
                                                <input
                                                type="email"
                                                name="agentes.interno.email"
                                                value={form.agentes.interno.email}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <h6>Financeiro</h6>
                                        <div className="row">
                                            <div className="form-group mb-4 col-6">
                                                <label>Nome</label>
                                                <input
                                                type="text"
                                                name="agentes.financeiro.nome"
                                                value={form.agentes.financeiro.nome}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                            <div className="form-group mb-4 col-6">
                                                <label>Email</label>
                                                <input
                                                type="email"
                                                name="agentes.financeiro.email"
                                                value={form.agentes.financeiro.email}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <hr/>
                                        <h6>Suplente financeiro</h6>
                                        <div className="row">
                                            <div className="form-group mb-4 col-6">
                                                <label>Nome</label>
                                                <input
                                                type="text"
                                                name="agentes.suplenteFinanceiro.nome"
                                                value={form.agentes.suplenteFinanceiro.nome}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                            <div className="form-group mb-4 col-6">
                                                <label>Email</label>
                                                <input
                                                type="email"
                                                name="agentes.suplenteFinanceiro.email"
                                                value={form.agentes.suplenteFinanceiro.email}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <hr/>
                                        <h6>Agente de viagens cliente</h6>
                                        <div className="row">
                                            <div className="form-group mb-4 col-6">
                                                <label>Nome</label>
                                                <input
                                                type="text"
                                                name="agentes.cliente.nome"
                                                value={form.agentes.cliente.nome}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                            <div className="form-group mb-4 col-6">
                                                <label>Email</label>
                                                <input
                                                type="email"
                                                name="agentes.cliente.email"
                                                value={form.agentes.cliente.email}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                        </div>
                                        <hr/>
                                        <h6>Suplente viagens cliente</h6>
                                        <div className="row">
                                            <div className="form-group mb-4 col-6">
                                                <label>Nome</label>
                                                <input
                                                type="text"
                                                name="agentes.suplenteCliente.nome"
                                                value={form.agentes.suplenteCliente.nome}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                            <div className="form-group mb-4 col-6">
                                                <label>Email</label>
                                                <input
                                                type="email"
                                                name="agentes.suplenteCliente.email"
                                                value={form.agentes.suplenteCliente.email}
                                                onChange={handleChange}
                                                className="form-control"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-danger">
                                    Salvar
                                </button>
                                <button type="reset" className="btn btn-outline-secondary ms-2" onClick={() => setToggleNew(!toggleNew)}>
                                    Cancelar
                                </button>
                            </form>
                            }
                        </div>
                    </div>
                </div>
                 {/* LISTAGEM */}
                <div className="col-12 col-lg-4 col-xxl-4 mt-4 mt-lg-0">
                    <div className="card h-100">
                    <div className="card-body">
                        <h6 className="mb-3">Contratos cadastrados</h6>

                        <div className="d-flex flex-column gap-2">
                        {contratos.map((contrato) => (
                            <div key={contrato.nroContrato} className="card border">
                            <div className="card-body p-3">
                                <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>{contrato.nroContrato}</strong>
                                    <div className="">
                                    {contrato.empresa}
                                    </div>

                                    <div className="small mt-2">
                                    <div>Valor: R$ {contrato.valorContrato}</div>
                                    <div>Saldo: R$ {contrato.saldoContratual}</div>
                                    <div>Colaboradores: <i className="bi bi-person-fill"/>{gerencias.filter((g) => g.contrato === contrato.nroContrato).reduce((total, g) => total + g.colaboradores, 0)}</div>
                                    <div className="d-flex flex-wrap pt-2">
                                        {gerencias.filter((v) => v.contrato === contrato.nroContrato).map((item, index) => (
                                            <span className="badge rounded-pill bg-secondary me-2 mb-2">
                                                {item.nome}
                                            </span>
                                        ))}
                                    </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleEdit(contrato)}
                                >
                                    <i className="bi bi-pencil-fill" />
                                </button>
                                </div>
                            </div>
                            </div>
                        ))}

                        {contratos.length === 0 && (
                            <div className="text-muted text-center small">
                            Nenhum contrato cadastrado
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contratos;