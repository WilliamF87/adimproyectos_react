import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useProyectos from "../hooks/useProyectos";

const PreviewProyecto = ({proyecto}) => {

    const navigate = useNavigate();
    const { auth } = useAuth();

    const { nombre, _id, cliente, creador } = proyecto;

    const { setControl } = useProyectos();

    const handleClick = e => {
        e.preventDefault();
        // Usé esta fubción en lugar del Link para setear la variable control

        setControl(true);
        navigate(_id);
    }

    return (
        <div className="border-b p-5 flex flex-col md:flex-row items-start justify-between">

            <div className="flex items-center gap-2">
                <p className="flex-1"> {/* flex-1 hace que tome todo el espacio disponible*/}
                    {nombre}

                    <span className="text-sm text-gray-500 uppercase">
                        {''} {cliente}
                    </span>
                </p>

                {auth._id !== creador && (
                    <p
                        className="p-1 text-xs rounded-lg text-white bg-green-500 font-bold uppercase"
                    >Colaborador</p>
                )}
            </div>

            {/* <Link
                to={`${_id}`}
                className="text-gray-600 hover:text-gray-800 uppercase text-sm font-bold"
            >Ver Proyecto</Link> */}
            <button
                onClick={handleClick}
                className="text-gray-600 hover:text-gray-800 uppercase text-sm font-bold"
            >Ver Proyecto</button>
        </div>
    )
}

export default PreviewProyecto