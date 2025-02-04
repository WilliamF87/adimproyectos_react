import { useEffect } from "react";
import { useState } from "react"
import { useParams } from "react-router-dom";
import useProyectos from "../hooks/useProyectos";
import Alerta from "./Alerta";

const FormularioProyecto = () => {
    
    const [id, setId] = useState(null);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [cliente, setCliente] = useState('');

    const params = useParams();
    
    const { alerta, mostrarAlerta, submitProyecto, proyecto } = useProyectos();

    useEffect(() => {
        // (proyecto.fechaEntrega?: optional chaining, se usa porque el useEffeact va estar listo antes que la consulta a la API y se produce un error al intentar setear
        // split("T")[0]: el formato de la fecha viene como (2022-09-19T00:00:00.000Z), se necesita sólo lo que está antes de la T
        if(params.id) {
            setId(proyecto._id);
            setNombre(proyecto.nombre);
            setDescripcion(proyecto.descripcion);
            setFechaEntrega(proyecto.fechaEntrega?.split("T")[0]);
            setCliente(proyecto.cliente);
        }

    }, [params, proyecto]);

    const handleSubmit = async e => {
        e.preventDefault();

        if([nombre, descripcion, fechaEntrega, cliente].includes('')) {
            mostrarAlerta({
                msg: "Todos los campos son obligatorios",
                error: true
            })
            return;
        };

        // Pasar los datps hacia el provider
        await submitProyecto({ id, nombre, descripcion, fechaEntrega, cliente });

        setId(null);
        setNombre('');
        setDescripcion('');
        setFechaEntrega('');
        setCliente('');

    };

    const { msg } = alerta;

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white py-10 px-5 md:w-1/2 rounded-lg shadow"
        >
            
            { msg && <Alerta alerta={alerta} />}

            <div className="mb-5">
                <label
                    className="text-gray-700 uppercase font-bold text-sm"
                    htmlFor="nombre"
                >Nombre Proyecto</label>

                <input
                    id="nombre"
                    type="text"
                    className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                    placeholder="Nombre del Proyecto"
                    value={nombre || ''}
                    onChange={ e => setNombre(e.target.value)}
                />
            </div>

            <div className="mb-5">
                <label
                    className="text-gray-700 uppercase font-bold text-sm"
                    htmlFor="descripcion"
                >Descripción</label>

                <textarea
                    id="descripcion"
                    className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                    placeholder="Descripcion del Proyecto"
                    value={descripcion || ''}
                    onChange={ e => setDescripcion(e.target.value)}
                />
            </div>

            <div className="mb-5">
                <label
                    className="text-gray-700 uppercase font-bold text-sm"
                    htmlFor="fecha-entrega"
                    // fecha-entrega: html prefiere este tipo de escritura (Kebab Case)
                    // Camel Case tambien es correcta, pero es mejor seguir lo que se recomienda en cada lenguaje
                >Fecha entrega</label>

                <input
                    id="fecha-entrega"
                    type="date"
                    className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                    value={fechaEntrega || ''}
                    onChange={ e => setFechaEntrega(e.target.value)}
                />
            </div>

            <div className="mb-5">
                <label
                    className="text-gray-700 uppercase font-bold text-sm"
                    htmlFor="cliente"
                >Nombre Cliente</label>

                <input
                    id="cliente"
                    type="text"
                    className="border w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                    placeholder="Nombre del Cliente"
                    value={cliente || ''}
                    onChange={ e => setCliente(e.target.value)}
                />
            </div>

            <input
                type="submit"
                value={params.id ? "Actualizar Proyecto" : "Crear Proyecto"}
                className="bg-sky-600 w-full p-3 uppercase font-bold text-white
                    rounded cursor-pointer hover:bg-sky-700 transition-colors"
            />
        </form>
    )
}

export default FormularioProyecto