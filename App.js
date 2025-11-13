
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { View, Button } from "react-native";
import { auth } from "./src/database/firebaseConfig";
import Login from "./src/Components/Login";
import Ciudades from "./src/view/Ciudades";
import Productos from "./src/view/Productos";
import ProductosRealtime from "./src/view/ProductosRealtime";
import CalculadoraIMC from "./src/view/CalculadoraIMC";

export default function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Escucha los cambios en la autenticación (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return unsubscribe;
  }, []);

  const cerrarSesion = async () => {
    await signOut(auth);
  };

  if (!usuario) {
    // Si no hay usuario autenticado, mostrar login
    return <Login onLoginSuccess={() => setUsuario(auth.currentUser)} />;
  }

  // Si hay usuario autenticado, mostrar productos
  return (
    <View style={{ flex: 1 }}>
      <Productos cerrarSesion={cerrarSesion}/>
    </View>
  );
}