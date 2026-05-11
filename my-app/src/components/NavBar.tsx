import { Link, useNavigate } from "react-router-dom";

interface Props {
  token: string;
  setToken: (token: string) => void;
}

export default function NavBar({ token, setToken }: Props) {
  const navigate = useNavigate();

  const handleLogOut = () => {
    setToken("");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <p className="navbar-brand">
        <Link to="/">ALMACÉN</Link>
      </p>
      <ul className="navbar-menu">
        <li className="navbar-item">
          <Link to={`/almacenes/${token}`}>Almacenes</Link>
        </li>
        <li className="navbar-item">
          <Link to={`/historial/${token}`}>Historial</Link>
        </li>
        <li className="navbar-item">
          <button className="logout-btn" onClick={handleLogOut}>
            Salir
          </button>
        </li>
      </ul>
    </nav>
  );
}
