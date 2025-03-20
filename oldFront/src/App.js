import './App.css';
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { BrowserRouter, Routes } from "react-router-dom";

import Layout from './layout/Layout'
import Home from './pages/Home';
import NoPage from './pages/NoPage'
import IndividualBolide from './pages/IndividualBolide'
import BarChartInfo from './pages/BarChartInfo';
import Station from './pages/Station'
import ComparationBolide from './pages/ComparationBolide';
import InformeZ from './pages/InformeZ';
import CustomizedSearch from './pages/CustomizedSearch';

export default function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NoPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/bolide-graph" element={<BarChartInfo />} />
          <Route path="/bolide/:id" element={<IndividualBolide />} />
          <Route path="/comparacion-bolidos" element={<ComparationBolide />} />
          <Route path="/informe-bolido" element={<InformeZ />} />
          <Route path="/search" element={<CustomizedSearch />} />
          <Route path="/estaciones" element={<Station />} />
        </Route>

      </Routes>

    </BrowserRouter>


  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
