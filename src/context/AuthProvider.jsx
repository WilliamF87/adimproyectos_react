import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clienteAxios from "../../config/clienteAxios";

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    
    const [auth, setAuth] = useState({});
    const [cargando, setCargando] = useState(true);

    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const autenticarUsuario = async () => {
            const token = localStorage.getItem("token");

            if(!token) {
                setCargando(false);
                // setTimeout(() => {
                // }, 2000);

                return;
            }

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };
            
            try {
                const { data } = await clienteAxios("/usuarios/perfil", config);
                setAuth(data);
                // Cuando el usuario ingrese a la pagina de inicio, si está autenticado lo llevara hacia /proyectos
                if(pathname === "/") {
                    navigate("/proyectos");
                }
            } catch (error) {
                setAuth({});
            } finally {
                setCargando(false);
            }
        }

        autenticarUsuario();

        return () => {
            autenticarUsuario();
        };
    }, []);

    const cerrarSesionAuth = () => {
        setAuth({});
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth,
                cargando,
                cerrarSesionAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export {
    AuthProvider
};

export default AuthContext;