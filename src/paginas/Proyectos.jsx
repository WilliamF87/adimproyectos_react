import { useEffect } from "react";
import Alerta from "../components/Alerta";
import PreviewProyecto from "../components/PreviewProyecto";
import useProyectos from "../hooks/useProyectos";
// import io from "socket.io-client";

// let socket;

const Proyectos = () => {

    const { proyectos, alerta } = useProyectos();

    // useEffect(() => {
    //     // Documentación: https://socket.io/docs/v4/client-api/
    //     // Documentación: https://socket.io/docs/v4/server-api/
    //     socket = io(import.meta.env.VITE_BACKEND_URL);
    //     // emit es para crear el evento y on es qué voy a hacwer cuando ese evento ocurra
    //     socket.emit("prueba", proyectos);
    //     socket.on("respuesta", (persona) => {
    //         console.log("Desde el Frontend", persona)
    //     });

    //     // Se deja sin el arrreglo vacío de dependencias para que escuhe cada que haya cambios
    //     // Con el [] sólo se va a llamar el useeffect una vez
    // });

    const { msg } = alerta;

    return (
        <>
            <h1 className="text-4xl font-black">Proyectos</h1>

            {msg && <Alerta alerta={alerta} />}
            
            <div className="bg-white shadow mt-10 rounded-lg">
                {proyectos.length ?
                proyectos.map(proyecto => (
                    <PreviewProyecto
                        key={proyecto._id}
                        proyecto={proyecto}
                    />
                ))
                : <p className="text-center text-gray-600 uppercase p-5">No hay proyectos aún</p>}
            </div>
        </>
    )
}

export default Proyectos