
type Props = {
    status: string;
}

const StatusBadge = ({status}: Props) => {
    switch (status) {
    case 'Solicitada':
      return (
        <span className="badge rounded-pill text-bg-info">
          <i className="bi bi-send text-info" /> Solicitada
        </span>
      );

    case 'Aprovada':
      return (
        <span className="badge rounded-pill text-bg-success">
          <i className="bi bi-check-circle-fill text-success" /> Aprovada
        </span>
      );

    case 'Reprovada':
      return (
        <span className="badge rounded-pill text-bg-danger">
          <i className="bi bi-x-circle-fill text-danger" /> Reprovada
        </span>
      );

    case 'Programada':
      return (
        <span className="badge rounded-pill text-bg-primary">
          <i className="bi bi-calendar-check text-primary" /> Programada
        </span>
      );

    case 'Adiantamento enviado':
      return (
        <span className="badge rounded-pill text-bg-primary">
          <i className="bi bi-send text-primary" /> Adiantamento enviado
        </span>
      );

    case 'Valor adiantado':
      return (
        <span className="badge rounded-pill text-bg-success">
          <i className="bi bi-wallet2 text-success" /> Valor adiantado
        </span>
      );

    case 'Com adiantamento':
      return (
        <span className="badge rounded-pill text-bg-success">
          <i className="bi bi-cash-stack text-success" /> Com adiantamento
        </span>
      );

    case 'Sem adiantamento':
      return (
        <span className="badge rounded-pill text-bg-warning">
          <i className="bi bi-slash-circle text-warning" /> Sem adiantamento
        </span>
      );

    case 'Pendente prestação de contas':
      return (
        <span className="badge rounded-pill text-bg-warning">
          <i className="bi bi-hourglass-split text-warning" /> Pendente prestação de contas
        </span>
      );

    case 'Sem pendências':
      return (
        <span className="badge rounded-pill text-bg-success">
          <i className="bi bi-patch-check-fill text-success" /> Sem pendências
        </span>
      );

    case 'Triagem':
      return (
        <span className="badge rounded-pill text-bg-primary">
          <i className="bi bi-list-check text-primary" /> Triagem
        </span>
      );

    case 'Reembolso programado':
      return (
        <span className="badge rounded-pill text-bg-primary">
          <i className="bi bi-clipboard-plus text-primary" /> Reembolso programado
        </span>
      );

    case 'Com pendências':
      return (
        <span className="badge rounded-pill text-bg-warning">
          <i className="bi bi-exclamation-triangle-fill text-warning" /> Com pendências
        </span>
      );

    case 'Pendente financeiro':
      return (
        <span className="badge rounded-pill text-bg-warning">
          <i className="bi bi-cash-stack text-warning" /> Pendente financeiro
        </span>
      );

    case 'Concluída':
      return (
        <span className="badge rounded-pill text-bg-success">
          <i className="bi bi-check-all text-success" /> Concluída
        </span>
      );

    case 'Cancelada':
      return (
        <span className="badge rounded-pill text-bg-danger">
          <i className="bi bi-ban text-danger" /> Cancelada
        </span>
      );

      case 'Cancelar':
      return (
        <span className="badge rounded-pill text-bg-danger">
          <i className="bi bi-lock text-danger" /> Cancelar
        </span>
      );

      case 'Desconto programado':
      return (
        <span className="badge rounded-pill text-bg-danger">
          <i className="bi bi-clipboard-minus text-danger" /> Desconto programado
        </span>
      );

    default:
      return (
        <span className="badge rounded-pill text-bg-secondary">
          <i className="bi bi-question-circle" /> {status}
        </span>
      );
  }
}

export default StatusBadge;