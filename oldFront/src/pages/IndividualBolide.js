import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import MapChart from "../components/chart/MapChart";
import Videos from "../components/Video";
import { getBolideById } from "../services/bolideService";

const IndividualBolide = () => {
  const params = useParams(); 
  const id = params?.id || '-1'; // Asegura que id tenga un valor válido

  const [bolide, setBolide] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id === '-1') return; // No hace la petición si el id no es válido

      try {
        const data = await getBolideById(id);
        setBolide(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Manejo de estados
  if (id === '-1') return <p>ID inválido</p>;
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!bolide || bolide.length === 0) return <p>No se encontraron datos</p>; // Evita el error de acceso a bolide[0]

  return (
    <div>
      <h1>Detalles del Punto {bolide[0]?.id} con coordenadas: {bolide[0]?.lat}, {bolide[0]?.lon}</h1>
      <MapChart data={bolide} activePopUp={false} lat={bolide[0]?.lat} lon={bolide[0]?.lon} />
      <div style={{ marginTop: '30px', paddingBottom: '100px' }}>
        <Videos link={bolide[0]?.video} />
      </div>
    </div>
  );
};

export default IndividualBolide;
