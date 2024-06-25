import { useEffect } from "react";
import { Link, useParams } from "react-router-dom"
import Colaborador from "../components/Colaborador";
import ModalEliminarColaborador from "../components/ModalEliminarColaborador";
import ModalEliminarTarea from "../components/ModalEliminarTarea";
import ModalFormularioTarea from "../components/ModalFormularioTarea";
import Spinner from "../components/Spinner";
import Tarea from "../components/Tarea";
import useAdmin from "../hooks/useAdmin";
import useProyectos from "../hooks/useProyectos";
import io from "socket.io-client";

let socket;

const Proyecto = () => {

    const params = useParams();
    const {
        obtenerProyecto,
        proyecto,
        cargando,
        handleModalTarea,
        submitTareasProyecto,
        eliminarTareaProyecto,
        actualizarTareaProyecto,
        cambiarEstadoTarea
    } = useProyectos();

    const admin = useAdmin();

    useEffect(() => {
        // return () => {
        //     obtenerProyecto(params.id);
        // };
        obtenerProyecto(params.id);
    }, []);

    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL);
        socket.emit("abrir proyecto", params.id);
    }, []);

    useEffect(() => {
        socket.on("tarea agregada", (tareaNueva) => {
            // El if es para controlar que se actualice sólo el state del proyecto de donde se agrega la tarea
            if(tareaNueva.proyecto === proyecto._id) {
                submitTareasProyecto(tareaNueva);
            }
        });

        socket.on("tarea eliminada", tareaEliminada => {
            // tareaEliminada.proyecto: no se usa proyecto._id porque proyecto ya es un id,
            // diferente al caso del del proyecto que está en el state
            if(tareaEliminada.proyecto === proyecto._id) {
                eliminarTareaProyecto(tareaEliminada);
            }
        });

        socket.on("tarea actualizada", tareaActualizada => {
            // tareaActualizada.proyecto._id: en este caso proyecto tiene todo el onjeto completo porque es una consulta de la BD
            if(tareaActualizada.proyecto._id === proyecto._id) {
                actualizarTareaProyecto(tareaActualizada);
            }
        });

        socket.on("nuevo estado", tareaNuevoEstado => {
            if(tareaNuevoEstado.proyecto._id === proyecto._id) {
                cambiarEstadoTarea(tareaNuevoEstado);
            }
        });
    });

    // El primer useEffect se ejecuta una sola vez, mientras que el segundo está escuchando todo el tiempo
    // Se deja sin el arrreglo vacío de dependencias para que escuhe cada que haya cambios
    // Con el [] sólo se va a llamar el useeffect una vez

    const { nombre } = proyecto;

    if(cargando) return <Spinner />;

    return (
        <>
            <div className="flex justify-between">
                <h1 className="font-black text-4xl">{nombre}</h1>

                {admin && (
                    <div className="flex items-center gap-2 text-gray-400 hover:text-black">
                        <svg // Tomado de https://heroicons.com/
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0
                                    113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>

                        <Link
                            to={`/proyectos/editar/${params.id}`}
                            className="uppercase font-bold"
                        >Editar</Link>
                    </div>
                )}
            </div>

            {admin && (
                <button
                    type="button"
                    onClick={ handleModalTarea }
                    className="text-sm px-5 py-3 w-full md:w-auto rounded-lg mt-5 uppercase font-bold bg-sky-400
                        hover:bg-sky-500 text-white text-center flex gap-2 items-center justify-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1
                                1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                        />
                    </svg>

                    Nueva Tarea
                </button>
            )}

            <p className="font-bold text-xl mt-10">Tareas del Proyecto</p>

            <div className="bg-white shadow mt-10 rounded-lg">
                {proyecto.tareas?.length ?
                    proyecto.tareas?.map( tarea => (
                        <Tarea
                            key={tarea._id}
                            tarea={tarea}
                            admin={admin}
                        />
                    )) :
                <p className="text-center my-5 p-10">No hay tareas en este proyecto</p>}
            </div>

            {admin && (
                <>
                    <div className="flex items-center justify-between mt-10">
                        <p className="font-bold text-xl">Colaboradores</p>
                        <Link
                            to={`/proyectos/nuevo-colaborador/${proyecto._id}`}
                            className="text-gray-400 hover:text-black uppercase font-bold"
                        >Añadir</Link>
                    </div>

                    <div className="bg-white shadow mt-10 rounded-lg">
                        {proyecto.colaboradores?.length ?
                            proyecto.colaboradores?.map( colaborador => (
                                <Colaborador
                                    key={colaborador._id}
                                    colaborador={colaborador}
                                />
                            )) :
                        <p className="text-center my-5 p-10">No hay colaboradores en este proyecto</p>}
                    </div>
                </>
            )}

            <ModalFormularioTarea />
            <ModalEliminarTarea />
            <ModalEliminarColaborador />
        </>
    );
}

export default Proyecto