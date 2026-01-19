import api from "../../api";
import Contrato from "../../types/Contrato";
import Gerencia from "../../types/Gerencia";
import { useEffect, useRef, useState } from "react";
import Select, { SingleValue, components } from 'react-select';
import { customSelectStyles } from "../new/styles";
import { useUserContext } from "../../context/UserContext";

type OptionType = { value: string; label: string };

const Gerencias = () => {
    const hasFetchedData = useRef(false);
    const { user } = useUserContext();
    const [toggleNew, setToggleNew] = useState(false);
    const [gerencias, setGerencias] = useState<Gerencia[]>([]);
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [form, setForm] = useState<Gerencia>({
        nome: "",
        aprovador: "",
        colaboradores: 0,
        fluxoCompleto: false,
        contrato: "",
    });
    const options = [
        { value: '', label: 'Selecione...'},
        ...contratos.map((i) => ({ value: i.nroContrato, label: i.nroContrato }))
    ]

    const isEdit = gerencias.some((g) => g.id === form.id);

    const fetchContratos = async () => {
        const { data } = await api.get("/contratos");
        setContratos(data);
    };

    const fetchGerencias = async () => {
        const { data } = await api.get<Gerencia[]>("/gerencias");
        if (user?.nivelAcesso !== 'ADM') {
          const filtered = data.filter((g) => g.contrato === user?.contrato);
          setGerencias(filtered);
        } else {
          setGerencias(data);
        }
    };

  useEffect(() => {
    fetchGerencias();
    fetchContratos();
    if (user?.nivelAcesso === 'PRP') {
      setForm({
        ...form,
        contrato: user.contrato ?? ''
      })
    }
  }, [user]);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      const { name, checked } = target;

      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    const { name, value } = target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && form.id) {
        await api.put(`/gerencias/${form.id}`, form);
      } else {
        await api.post("/gerencias", form);
      }

      await fetchGerencias();
      setToggleNew(false);
      setForm({
        nome: "",
        aprovador: "",
        colaboradores: 0,
        fluxoCompleto: false,
        contrato: "",
      });
    } catch (err) {
      console.error("Erro ao salvar gerência", err);
    }
  };

  const handleEdit = (g: Gerencia) => {
    setForm(g);
    setToggleNew(true);
  };

  const handleContratoChange = (option: SingleValue<OptionType>) => {
  setForm((prev) => ({
    ...prev,
    contrato: option ? option.value : "",
  }));
};
    const selectedContrato =
  options.find((o) => o.value === form.contrato) ?? null;
  // =========================
  // RENDER
  // =========================
  return (
    <div>
      <h3>Gerências</h3>
      <hr />

      <div className="row">
        {/* FORMULÁRIO (4/12) */}
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              {!toggleNew ? (
                <button
                  className="btn btn-outline-light w-100"
                  onClick={() => setToggleNew(true)}
                >
                  <i className="bi bi-plus-circle me-2" />
                  Nova gerência
                </button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Nome da gerência</label>
                    <input
                      className="form-control"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Aprovador</label>
                    <input
                      className="form-control"
                      name="aprovador"
                      value={form.aprovador}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Contrato</label>
                    <Select<OptionType, false>
                    name="contrato"
                    value={selectedContrato}
                    onChange={handleContratoChange}
                    options={options}
                    styles={customSelectStyles()}
                    noOptionsMessage={() => "Não encontrado"}
                    isDisabled={isEdit || user?.nivelAcesso !== 'ADM'}
                    />
                </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="fluxoCompleto"
                      checked={form.fluxoCompleto}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">
                      Fluxo completo
                    </label>
                  </div>

                  <button className="btn btn-danger w-100" type="submit">
                    Salvar
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={() => setToggleNew(false)}
                  >
                    Cancelar
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* LISTAGEM EM GRADE (8/12) */}
        <div className="col-12 col-lg-8 mt-4 mt-lg-0">
          <div className="row g-3">
            {gerencias.map((g) => (
              <div key={g.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <strong>{g.nome}</strong>
                      <div className="small">
                        Contrato {g.contrato}
                      </div>

                      <div className="small mt-2">
                        {g.colaboradores} colaboradores
                      </div>

                      <span
                        className={`badge rounded-pill mt-2 ${
                          g.fluxoCompleto
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {g.fluxoCompleto
                          ? "Fluxo completo"
                          : "Fluxo parcial"}
                      </span>
                    </div>

                    <button
                      className="btn btn-sm btn-danger mt-3"
                      onClick={() => handleEdit(g)}
                    >
                      <i className="bi bi-pencil-fill me-1" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {gerencias.length === 0 && (
              <div className="col-12 text-muted text-center">
                Nenhuma gerência cadastrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gerencias;
