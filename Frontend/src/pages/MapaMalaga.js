// components/MapaMalaga.js
import { useState, useEffect } from 'react';
import MapChart from '../components/chart/MapChart';
import { getAllBolideLastSixMonths } from '../services/bolideService'

const MapaMalaga = () => {
  // Array de posiciones GPS
  const activePopUp = true;


  const [bolides, setBolides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllBolideLastSixMonths();
        setBolides(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <MapChart data={bolides} activePopUp={activePopUp} zoom={6} />
  );
};

export default MapaMalaga;
