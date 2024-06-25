import { useEffect } from "react";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import clienteAxios from "../../config/clienteAxios";
import io from "socket.io-client";
import useAuth from "../hooks/useAuth";

let socket;

const ProyectosContext = createContext();

const ProyectosProvider = ({children}) => {

    const [proyectos, setProyectos] = useState([]);
    const [proyecto, setProyecto] = useState({});
    const [alerta, setAlerta] = useState({});
    const [cargando, setCargando] = useState(false);
    const [modalFormularioTarea, setModalFormularioTarea] = useState(false);
    const [tarea, setTarea] = useState({});
    const [modalEliminarTarea, setModalEliminarTarea] = useState(false);
    const [colaborador, setColaborador] = useState({});
    const [modalEliminarColaborador, setModalEliminarColaborador] = useState(false);
    const [control, setControl] = useState(false);
    const [buscador, setBuscador] = useState(false);

    const navigate = useNavigate();
    const { auth } = useAuth();

    useEffect(() => {
        setCargando(true);
        const obtenerProyectos = async () => {
            try {
                const token = localStorage.getItem("token");
                if(!token) return;
    
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                };
    
                const { data } = await clienteAxios("/proyectos", config);
                setProyectos(data);
            } catch (error) {
                console.log(error);
            }
            setCargando(false);

        };

        obtenerProyectos();
    }, [auth]);

    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL);
    }, []);

    const mostrarAlerta = alerta => {
        setAlerta(alerta);

        setTimeout(() => {
            setAlerta({});
        }, 5000);
    };

    const submitProyecto = async proyecto => {
        
        if(proyecto.id) {
            await editarProyecto(proyecto);
        } else {
            await nuevoProyecto(proyecto);
        }

    };

    const editarProyecto = async proyecto => {

        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config);

            // Sincronizar el state
            const proyetosActualizados = proyectos.map(proyectoState =>
                proyectoState._id === data._id ? data : proyectoState
            );

            setProyectos(proyetosActualizados);

            setAlerta({
                msg: "Proyecto actualizado correctamente",
                error: false
            });

            setTimeout(() => {
                setAlerta({});
                navigate("/proyectos");
            }, 3000);
        } catch (error) {
            console.log(error);
        }

    };

    const nuevoProyecto = async proyecto => {
        
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.post("/proyectos", proyecto, config);

            // Actualizar el state para mostrar en nuevo proyecto en lista de proyectos
            setProyectos([...proyectos, data]);

            navigate("/proyectos");
            
            setAlerta({
                msg: "Proyecto creado correctamente",
                error: false
            });

            setTimeout(() => {
                setAlerta({});
            }, 3000);
        } catch (error) {
            console.log(error);
        }
    };

    const obtenerProyecto = async id => {
        setCargando(true);
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios(`/proyectos/${id}`, config);
            
            setProyecto(data);
            setAlerta({});
        } catch (error) {
            if(!control) {
                // La variable control se usa para que el error sólo se setee cuando se recarga la pagina
                navigate("/proyectos");
                setAlerta({
                    msg: error.response.data.msg,
                    error: true
                });
                setTimeout(() => {
                    setAlerta({});
                }, 3000);
            }
        } finally {
            setCargando(false);
        }
    };

    const eliminarProyecto = async id => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.delete(`/proyectos/${id}`, config);
            
            // Sincronizar el state
            const proyectosActualizados = proyectos.filter(proyectoState =>
                proyectoState._id !== id
            );
            
            setProyectos(proyectosActualizados);
            setProyecto({});

            navigate("/proyectos");
            setAlerta({
                msg: data.msg,
                error: false
            });

            setTimeout(() => {
                setAlerta({});
            }, 3000);
        } catch (error) {
           console.log(error); 
        }
    };

    const handleModalTarea = () => {
        setModalFormularioTarea(!modalFormularioTarea);
        setTarea({});
    };


    const submitTarea = async tarea => {
        if(tarea.id) {
            await editarTarea(tarea);
        } else {
            await crearTarea(tarea);
        }
    };

    const crearTarea = async tarea => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.post("/tareas", tarea, config);

            setModalFormularioTarea(false);

            setAlerta({});

            // Socket io
            socket.emit("nueva tarea", data);            
        } catch (error) {
            console.log(error.response);
        }
    };

    const editarTarea = async tarea => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config);

            // Socket io
            socket.emit("actualizar tarea", data);

            mostrarAlerta({});
            setModalFormularioTarea(false);
            
        } catch (error) {
            console.log(error.response);
        }
    };

    const handleModalEditarTarea = async tarea => {
        setTarea(tarea);
        setModalFormularioTarea(true);
    };

    const handleModalEliminarTarea = tarea => {
        setTarea(tarea);
        setModalEliminarTarea(!modalEliminarTarea);
    };

    const eliminarTarea = async () => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, config);

            setModalEliminarTarea(false);

            // Socket.io
            socket.emit("eliminar tarea", tarea);

            mostrarAlerta({
                msg: data.msg,
                error: false
            });
        } catch (error) {
            console.log(error);
        }
    };

    const submitColaborador = async email => {
        setCargando(true);
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.post("/proyectos/colaboradores", {email}, config);
            
            setColaborador(data);
            setAlerta({});
        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            });
            setColaborador({});
            setTimeout(() => {
                setAlerta({});
            }, 3000);
        } finally {
            setCargando(false);
        }
    };

    const agregarColaborador = async email => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.post(
                `/proyectos/colaboradores/${proyecto._id}`, email, config);
            
            setAlerta({
                msg: data.msg,
                error: false
            });

            setTimeout(() => {
                setAlerta({});
            }, 3000);
            
            setColaborador({});
        } catch (error) {
            setAlerta({
                msg: error.response.data.msg,
                error: true
            });
            setColaborador({});
            setTimeout(() => {
                setAlerta({});
            }, 3000);
        }
    };

    const handleModalEliminarColaborador = colaborador => {
        setModalEliminarColaborador(!modalEliminarColaborador);

        setColaborador(colaborador);
    };

    const eliminarColaborador = async () => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.post(
                `/proyectos/eliminar-colaborador/${proyecto._id}`, {id: colaborador._id}, config);

            // Tomar una copia para no modificar el state original
            const proyectoActualizado = {...proyecto}
            
            proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter(colaboradorState =>
                colaboradorState._id !== colaborador._id
            );

            setProyecto(proyectoActualizado);

            setAlerta({
                msg:data.msg,
                error: false
            });
            setTimeout(() => {
                setAlerta({});
            }, 3000);

            setColaborador({});
            setModalEliminarColaborador(false);
        } catch (error) {
            console.log(error.response.data.msg);
        }
    };

    const completarTarea = async id => {
        try {
            const token = localStorage.getItem("token");
            if(!token) return;

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, config);

            // Socket IO
            socket.emit("cambiar estado", data);

            setTarea({});
            setAlerta({});
        } catch (error) {
            console.log(error.response.data.msg);
        }
    };
    
    const handleBuscador = () => {
        setBuscador(!buscador);
    };

    // Socket IO
    
    const submitTareasProyecto = tarea => {
        // Agregar la tarea al state
        const proyectoActualizado = { ...proyecto };
        proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea ];

        const { pathname } = window.location;

        // Evitar que se setee el state cuando el usuario no está viendo la página
        if(tarea.proyecto === pathname.split("/")[pathname.split("/").length - 1]) {
            setProyecto(proyectoActualizado);
        }
    };

    const eliminarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto};
        proyectoActualizado.tareas = proyectoActualizado.tareas.filter(
            tareaState => tareaState._id !== tarea._id
        );

        const { pathname } = window.location;

        if(tarea.proyecto === pathname.split("/")[pathname.split("/").length - 1]) {
            setProyecto(proyectoActualizado);
        }
    };

    const actualizarTareaProyecto = tarea => {
        // Editar la tarea en el state
        const proyectoActualizado = {...proyecto};
        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => (
            tareaState._id === tarea._id ? tarea : tareaState
        ));

        const { pathname } = window.location;

        if(tarea.proyecto._id === pathname.split("/")[pathname.split("/").length - 1]) {
            setProyecto(proyectoActualizado);            
        }
    };

    const cambiarEstadoTarea = tarea => {
        const proyectoActualizado = {...proyecto};
        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState =>
            tareaState._id === tarea._id ? tarea : tareaState
        );

        const { pathname } = window.location;

        if(tarea.proyecto._id === pathname.split("/")[pathname.split("/").length - 1]) {
            setProyecto(proyectoActualizado);          
        }
    };

    const cerrarSesionProyectos = () => {
        setProyectos([]);
        setProyecto({});
        setAlerta({});
    };

    return (
        <ProyectosContext.Provider
            value={{
                proyectos,
                alerta,
                mostrarAlerta,
                submitProyecto,
                obtenerProyecto,
                proyecto,
                cargando,
                eliminarProyecto,
                modalFormularioTarea,
                handleModalTarea,
                submitTarea,
                tarea,
                handleModalEditarTarea,
                modalEliminarTarea,
                handleModalEliminarTarea,
                eliminarTarea,
                submitColaborador,
                colaborador,
                agregarColaborador,
                modalEliminarColaborador,
                handleModalEliminarColaborador,
                eliminarColaborador,
                completarTarea,
                cerrarSesionProyectos,
                setControl,
                buscador,
                handleBuscador,
                submitTareasProyecto,
                eliminarTareaProyecto,
                actualizarTareaProyecto,
                cambiarEstadoTarea
            }}
        >
            {children}
        </ProyectosContext.Provider>
    );
};

export {
    ProyectosProvider
};

export default ProyectosContext;