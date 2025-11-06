import React, { useEffect, useState } from 'react';
import { Alert, View, StyleSheet,Button } from 'react-native';
import { db } from '../database/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc,getDoc } from 'firebase/firestore';
import FormularioUsuarios from '../Components/FormularioUsuarios';
import TablaUsuarios from '../Components/TablaUsuarios';

const Usuarios = ({ cerrarSesion }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', correo: '', telefono: '', edad: '' });
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioId, setUsuarioId] = useState(null);

    const cargarDatos = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'usuarios'));
            const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUsuarios(data);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

  const validarDatos = async (datos) => {
  try {
    const response = await fetch("https://vuul9jz9tc.execute-api.us-east-1.amazonaws.com/validarusuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const resultado = await response.json();

    if (resultado.success) {
      return resultado.data; // Datos limpios y validados
    } else {
      Alert.alert("Errores en los datos", resultado.errors.join("\n"));
      return null;
    }
  } catch (error) {
    console.error("Error al validar con Lambda:", error);
    Alert.alert("Error", "No se pudo validar la información con el servidor.");
    return null;
  }
};

  const guardarUsuario = async () => {
  const datosValidados = await validarDatos(nuevoUsuario);
  if (datosValidados) {
    try {
      await addDoc(collection(db, "usuarios"), {
        nombre: datosValidados.nombre,
        correo: datosValidados.correo,
        telefono: datosValidados.telefono,
        edad: parseInt(datosValidados.edad),
      });
      cargarDatos();
      setNuevoUsuario({ nombre: "", correo: "", telefono: "", edad: "" });
      Alert.alert("Éxito", "Usuario registrado correctamente.");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
  }
};

 const actualizarUsuario = async () => {
  const datosValidados = await validarDatos(nuevoUsuario);
  if (datosValidados) {
    try {
      await updateDoc(doc(db, "usuarios", usuarioId), {
        nombre: datosValidados.nombre,
        correo: datosValidados.correo,
        telefono: datosValidados.telefono,
        edad: parseInt(datosValidados.edad),
      });
      
      setModoEdicion(false);
      setUsuarioId(null);
      cargarDatos();
      Alert.alert("Éxito", "Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  }
};
    const eliminarUsuario = async (id) => {
        try {
            await deleteDoc(doc(db, 'usuarios', id));
            cargarDatos();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    };

    const manejoCambio = (nombre, valor) => {
        setNuevoUsuario((prev) => ({ ...prev, [nombre]: valor }));
    };

    const editarUsuario = (usuario) => {
        setNuevoUsuario({
            nombre: usuario.nombre || '',
            correo: usuario.correo || '',
            telefono: usuario.telefono || '',
            edad: usuario.edad != null ? String(usuario.edad) : '',
        });
        setUsuarioId(usuario.id);
        setModoEdicion(true);
    };

    return (
        <View style={styles.container}>
           <Button title="Cerrar Sesión" onPress={cerrarSesion} />
            <FormularioUsuarios
                nuevoUsuario={nuevoUsuario}
                manejoCambio={manejoCambio}
                guardarUsuario={guardarUsuario}
                actualizarUsuario={actualizarUsuario}
                modoEdicion={modoEdicion}
            />
            <TablaUsuarios
                usuarios={usuarios}
                editarUsuario={editarUsuario}
                eliminarUsuario={eliminarUsuario}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
});

export default Usuarios;