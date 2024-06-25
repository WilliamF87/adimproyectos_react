const Alerta = ({alerta}) => {
  return (
    <div className={`${alerta.error ? 'from-red-400 to-red-600' :
        'from-sky-400 to-sky-600'} bg-gradient-to-br text-center
        p-3 rounded-xl uppercase text-white font-bold text-sm my-10`}>
        {/* from-red-400 to-red-600: degradado de izquierda a derecha, empieza en 400 y termina en 600
        bg-gradient-to-br: dirección del gradient. De izquierda-arriba a derecha-abajo (br)*/}
        {alerta.msg}
    </div>
  )
}

export default Alerta