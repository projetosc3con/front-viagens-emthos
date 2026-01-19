// src/components/RelatoriosList.tsx
import { useState, useEffect } from 'react';
import { storage } from '../../util/FirebaseConnection';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { Spinner } from 'react-bootstrap';
import { useUserContext } from '../../context/UserContext';

interface FileItem {
  name: string;
  url: string;
}

const RelatoriosList: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const listRef = ref(storage, 'relatorios/'+user?.contrato+'/');
        const res = await listAll(listRef);
        const items = res.items;
        const filePromises = items.map(async itemRef => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, url };
        });
        const fileList = await Promise.all(filePromises);
        setFiles(fileList);
      } catch (err: any) {
        console.error(err);
        setError('Falha ao listar relatórios');
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [files]);


  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <Spinner/>
      </div>
    );
  }
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="row">
      {files.map((file, idx) => (
        <div className="col-12 col-sm-6 col-md-4 col-xxl-3 mb-3" key={idx}>
          <div className="card h-100">
            <div className="card-body text-center">
              <i
                className="bi bi-table text-success"
                style={{ fontSize: '2rem' }}
              />
              <h6 className="card-title mt-2 text-truncate">{file.name}</h6>
              <a
                href={file.url}
                className="btn btn-outline-success btn-sm mt-2"
                download
              >
                Baixar
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatoriosList;
