import { Route, Routes } from "react-router-dom";
import NavBar from "./NavBar";
import ListAlmacenesContainer from "./Almacen/ListAlmacenesContainer";
import ListItemsContainer from "./Items/ListItemsContainer";
import ListHistorialContainer from "./Historial/ListHistorialContainer";
import Transferencia from "./Historial/Transferencia";
import NewItem from "./Items/NewItem";
import NewAlmacen from "./Almacen/NewAlmacen";
import InformePage from "./Informe/InformePage";

interface Props {
  token: string;
  setToken: (token: string) => void;
}

export default function Home({ token, setToken }: Props) {
  return (
    <>
      <NavBar token={token} setToken={setToken} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/almacenes/:token" element={<ListAlmacenesContainer />} />
        <Route path="/items/:id/:token/:isFull" element={<ListItemsContainer />} />
        <Route path="/historial/:token" element={<ListHistorialContainer />} />
        <Route path="/historial/:almacenId/:token/:id" element={<Transferencia />} />
        <Route path="/newitem/:almcId/:token" element={<NewItem />} />
        <Route path="/newalmacen/:token" element={<NewAlmacen />} />
        <Route path="/informe/:token" element={<InformePage />} />
      </Routes>
    </>
  );
}

function HomePage() {
  return (
    <div className="home-hero">
      <p className="home-eyebrow">Sistema de gestión</p>
      <h1 className="home-h1">
        Gestión de<br />
        <em>Almacenes</em>
      </h1>
      <p className="home-desc">
        Administra tus almacenes, controla el inventario de items y registra transferencias entre almacenes.
      </p>
    </div>
  );
}
